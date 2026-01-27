
-- Create function to get detailed session info with user details
CREATE OR REPLACE FUNCTION public.admin_get_session_details(p_days integer DEFAULT 7)
RETURNS TABLE(
  session_id text,
  user_id uuid,
  email text,
  full_name text,
  phone_number text,
  started_at timestamptz,
  ended_at timestamptz,
  duration_seconds integer,
  page_count bigint,
  is_online boolean
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
$$;
