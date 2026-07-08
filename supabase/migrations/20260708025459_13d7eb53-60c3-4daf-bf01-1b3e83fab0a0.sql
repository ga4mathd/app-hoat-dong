
-- ============================================================
-- FIX 1: user_sessions UPDATE policy bypass
-- Remove the `session_id IS NOT NULL` clause that made policy always true
-- ============================================================
DROP POLICY IF EXISTS "Users can update own sessions" ON public.user_sessions;

CREATE POLICY "Users can update own sessions"
ON public.user_sessions
FOR UPDATE
USING (
  (user_id IS NOT NULL AND user_id = auth.uid())
  OR (user_id IS NULL AND session_id = ((current_setting('request.headers', true))::json ->> 'x-session-id'))
)
WITH CHECK (
  (user_id IS NOT NULL AND user_id = auth.uid())
  OR (user_id IS NULL AND session_id = ((current_setting('request.headers', true))::json ->> 'x-session-id'))
);

-- ============================================================
-- FIX 2: page_views INSERT spoofing
-- Ensure user_id is null (guest) or matches the caller
-- ============================================================
DROP POLICY IF EXISTS "Anyone can insert page views" ON public.page_views;

CREATE POLICY "Users can insert own page views"
ON public.page_views
FOR INSERT
WITH CHECK (
  user_id IS NULL OR user_id = auth.uid()
);

-- ============================================================
-- FIX 3: user_sessions INSERT spoofing
-- Ensure user_id is null (guest) or matches the caller
-- ============================================================
DROP POLICY IF EXISTS "Anyone can insert sessions" ON public.user_sessions;

CREATE POLICY "Users can insert own sessions"
ON public.user_sessions
FOR INSERT
WITH CHECK (
  user_id IS NULL OR user_id = auth.uid()
);

-- ============================================================
-- FIX 4: Input validation on admin analytics functions
-- ============================================================
CREATE OR REPLACE FUNCTION public.admin_get_daily_analytics(p_days integer DEFAULT 7)
 RETURNS TABLE(date date, page_views bigint, unique_users bigint, sessions bigint, avg_duration_seconds numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  IF p_days IS NULL OR p_days < 1 OR p_days > 365 THEN
    RAISE EXCEPTION 'Invalid days parameter: must be between 1 and 365';
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
$function$;

CREATE OR REPLACE FUNCTION public.admin_get_popular_pages(p_days integer DEFAULT 7)
 RETURNS TABLE(page_path text, view_count bigint, unique_viewers bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  IF p_days IS NULL OR p_days < 1 OR p_days > 365 THEN
    RAISE EXCEPTION 'Invalid days parameter: must be between 1 and 365';
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
$function$;

CREATE OR REPLACE FUNCTION public.admin_get_session_details(p_days integer DEFAULT 7)
 RETURNS TABLE(session_id text, user_id uuid, email text, full_name text, phone_number text, started_at timestamp with time zone, ended_at timestamp with time zone, duration_seconds integer, page_count bigint, is_online boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  IF p_days IS NULL OR p_days < 1 OR p_days > 365 THEN
    RAISE EXCEPTION 'Invalid days parameter: must be between 1 and 365';
  END IF;

  RETURN QUERY
  SELECT 
    s.session_id,
    s.user_id,
    COALESCE(u.email, 'Khách')::text AS email,
    COALESCE(p.full_name, 'Ẩn danh')::text AS full_name,
    p.phone_number,
    s.started_at,
    s.ended_at,
    s.duration_seconds,
    COALESCE(pv.page_count, 0) AS page_count,
    (s.last_activity_at >= now() - INTERVAL '5 minutes' AND s.ended_at IS NULL) AS is_online
  FROM public.user_sessions s
  LEFT JOIN auth.users u ON u.id = s.user_id
  LEFT JOIN public.profiles p ON p.user_id = s.user_id
  LEFT JOIN (
    SELECT pv.session_id, COUNT(*) AS page_count
    FROM public.page_views pv
    GROUP BY pv.session_id
  ) pv ON pv.session_id = s.session_id
  WHERE s.started_at >= CURRENT_DATE - (p_days - 1) * INTERVAL '1 day'
  ORDER BY s.started_at DESC
  LIMIT 100;
END;
$function$;

-- ============================================================
-- FIX 5 & 6: Revoke EXECUTE from anon (and where appropriate authenticated)
-- on SECURITY DEFINER admin/user functions. Each function still enforces
-- has_role() or auth.uid() checks internally as defense-in-depth.
-- ============================================================

-- Admin-only functions: revoke from PUBLIC and anon; only authenticated admins should call
REVOKE ALL ON FUNCTION public.admin_revoke_pro(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_upgrade_user_to_pro(uuid, integer) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_extend_pro(uuid, integer) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_get_all_subscriptions() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_get_daily_analytics(integer) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_get_popular_pages(integer) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_get_realtime_stats() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_get_session_details(integer) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.admin_revoke_pro(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_upgrade_user_to_pro(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_extend_pro(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_all_subscriptions() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_daily_analytics(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_popular_pages(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_realtime_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_session_details(integer) TO authenticated;

-- Authenticated-user-only functions: revoke from anon
REVOKE ALL ON FUNCTION public.activate_trial() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.check_subscription_status() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.submit_feedback(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.upgrade_to_pro(text, text) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.activate_trial() TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_subscription_status() TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_feedback(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.upgrade_to_pro(text, text) TO authenticated;

-- Internal helper / trigger functions: not part of public API
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_user_streak() FROM PUBLIC, anon, authenticated;

-- has_role is used inside policies; keep it callable so RLS works, but no need for anon
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
