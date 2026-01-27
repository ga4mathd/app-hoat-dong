-- Create page_views table for tracking page visits
CREATE TABLE public.page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT NULL,
  page_path text NOT NULL,
  session_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  user_agent text DEFAULT NULL
);

-- Create user_sessions table for tracking sessions
CREATE TABLE public.user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT NULL,
  session_id text UNIQUE NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz DEFAULT NULL,
  last_activity_at timestamptz NOT NULL DEFAULT now(),
  duration_seconds integer DEFAULT NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_page_views_created_at ON public.page_views(created_at);
CREATE INDEX idx_page_views_session_id ON public.page_views(session_id);
CREATE INDEX idx_page_views_page_path ON public.page_views(page_path);
CREATE INDEX idx_user_sessions_last_activity ON public.user_sessions(last_activity_at);
CREATE INDEX idx_user_sessions_started_at ON public.user_sessions(started_at);

-- Enable RLS
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for page_views
CREATE POLICY "Admins can view all page views"
ON public.page_views FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can insert page views"
ON public.page_views FOR INSERT
WITH CHECK (true);

-- RLS Policies for user_sessions
CREATE POLICY "Admins can view all sessions"
ON public.user_sessions FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can insert sessions"
ON public.user_sessions FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update own sessions"
ON public.user_sessions FOR UPDATE
USING (session_id = current_setting('request.headers', true)::json->>'x-session-id' OR user_id = auth.uid() OR session_id IS NOT NULL);

-- RPC Function: Get daily analytics for admin
CREATE OR REPLACE FUNCTION public.admin_get_daily_analytics(p_days integer DEFAULT 7)
RETURNS TABLE (
  date date,
  page_views bigint,
  unique_users bigint,
  sessions bigint,
  avg_duration_seconds numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if caller is admin
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;
  
  RETURN QUERY
  SELECT 
    d.date,
    COALESCE(pv.page_views, 0) AS page_views,
    COALESCE(pv.unique_users, 0) AS unique_users,
    COALESCE(s.sessions, 0) AS sessions,
    COALESCE(s.avg_duration, 0) AS avg_duration_seconds
  FROM (
    SELECT generate_series(
      (CURRENT_DATE - (p_days - 1) * INTERVAL '1 day')::date,
      CURRENT_DATE,
      '1 day'::interval
    )::date AS date
  ) d
  LEFT JOIN (
    SELECT 
      created_at::date AS date,
      COUNT(*) AS page_views,
      COUNT(DISTINCT COALESCE(user_id::text, session_id)) AS unique_users
    FROM public.page_views
    WHERE created_at >= CURRENT_DATE - (p_days - 1) * INTERVAL '1 day'
    GROUP BY created_at::date
  ) pv ON d.date = pv.date
  LEFT JOIN (
    SELECT 
      started_at::date AS date,
      COUNT(*) AS sessions,
      ROUND(AVG(COALESCE(duration_seconds, 0)), 0) AS avg_duration
    FROM public.user_sessions
    WHERE started_at >= CURRENT_DATE - (p_days - 1) * INTERVAL '1 day'
    GROUP BY started_at::date
  ) s ON d.date = s.date
  ORDER BY d.date;
END;
$$;

-- RPC Function: Get realtime stats for admin
CREATE OR REPLACE FUNCTION public.admin_get_realtime_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_online_users integer;
  v_today_views bigint;
  v_today_unique_users bigint;
  v_today_avg_duration numeric;
BEGIN
  -- Check if caller is admin
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;
  
  -- Count online users (active in last 5 minutes)
  SELECT COUNT(*) INTO v_online_users
  FROM public.user_sessions
  WHERE last_activity_at >= now() - INTERVAL '5 minutes'
    AND ended_at IS NULL;
  
  -- Get today's page views
  SELECT COUNT(*) INTO v_today_views
  FROM public.page_views
  WHERE created_at::date = CURRENT_DATE;
  
  -- Get today's unique users
  SELECT COUNT(DISTINCT COALESCE(user_id::text, session_id)) INTO v_today_unique_users
  FROM public.page_views
  WHERE created_at::date = CURRENT_DATE;
  
  -- Get today's average duration
  SELECT ROUND(AVG(COALESCE(duration_seconds, 0)), 0) INTO v_today_avg_duration
  FROM public.user_sessions
  WHERE started_at::date = CURRENT_DATE
    AND duration_seconds IS NOT NULL;
  
  RETURN json_build_object(
    'online_users', COALESCE(v_online_users, 0),
    'today_views', COALESCE(v_today_views, 0),
    'today_unique_users', COALESCE(v_today_unique_users, 0),
    'today_avg_duration', COALESCE(v_today_avg_duration, 0)
  );
END;
$$;

-- RPC Function: Get popular pages for admin
CREATE OR REPLACE FUNCTION public.admin_get_popular_pages(p_days integer DEFAULT 7)
RETURNS TABLE (
  page_path text,
  view_count bigint,
  unique_viewers bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if caller is admin
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;
  
  RETURN QUERY
  SELECT 
    pv.page_path,
    COUNT(*) AS view_count,
    COUNT(DISTINCT COALESCE(pv.user_id::text, pv.session_id)) AS unique_viewers
  FROM public.page_views pv
  WHERE pv.created_at >= CURRENT_DATE - (p_days - 1) * INTERVAL '1 day'
  GROUP BY pv.page_path
  ORDER BY view_count DESC
  LIMIT 10;
END;
$$;