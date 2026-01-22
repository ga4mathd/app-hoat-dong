
-- Function to get all subscriptions with user info (Admin only)
CREATE OR REPLACE FUNCTION public.admin_get_all_subscriptions()
RETURNS TABLE (
  user_id uuid,
  email text,
  full_name text,
  phone_number text,
  subscription_status text,
  activated_at timestamptz,
  trial_ends_at timestamptz,
  pro_expires_at timestamptz,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if caller is admin
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;
  
  RETURN QUERY
  SELECT 
    p.user_id,
    u.email::text,
    p.full_name,
    p.phone_number,
    p.subscription_status,
    p.activated_at,
    p.trial_ends_at,
    p.pro_expires_at,
    p.created_at
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.user_id
  ORDER BY p.created_at DESC;
END;
$$;

-- Function to manually upgrade user to Pro (Admin only)
CREATE OR REPLACE FUNCTION public.admin_upgrade_user_to_pro(p_user_id uuid, p_duration_months integer DEFAULT 12)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_pro_expires_at timestamptz;
BEGIN
  -- Check if caller is admin
  IF NOT has_role(auth.uid(), 'admin') THEN
    RETURN json_build_object('success', false, 'error', 'Access denied: Admin role required');
  END IF;
  
  -- Calculate expiration date
  v_pro_expires_at := now() + (p_duration_months || ' months')::interval;
  
  -- Update user profile
  UPDATE public.profiles
  SET 
    subscription_status = 'pro',
    pro_expires_at = v_pro_expires_at,
    updated_at = now()
  WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'User not found');
  END IF;
  
  RETURN json_build_object(
    'success', true,
    'pro_expires_at', v_pro_expires_at::text
  );
END;
$$;

-- Function to revoke Pro status (Admin only)
CREATE OR REPLACE FUNCTION public.admin_revoke_pro(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if caller is admin
  IF NOT has_role(auth.uid(), 'admin') THEN
    RETURN json_build_object('success', false, 'error', 'Access denied: Admin role required');
  END IF;
  
  -- Update user profile to expired
  UPDATE public.profiles
  SET 
    subscription_status = 'expired',
    pro_expires_at = NULL,
    updated_at = now()
  WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'User not found');
  END IF;
  
  RETURN json_build_object('success', true);
END;
$$;

-- Function to extend Pro subscription (Admin only)
CREATE OR REPLACE FUNCTION public.admin_extend_pro(p_user_id uuid, p_months integer)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_current_expires timestamptz;
  v_new_expires timestamptz;
BEGIN
  -- Check if caller is admin
  IF NOT has_role(auth.uid(), 'admin') THEN
    RETURN json_build_object('success', false, 'error', 'Access denied: Admin role required');
  END IF;
  
  -- Get current expiration
  SELECT pro_expires_at INTO v_current_expires
  FROM public.profiles
  WHERE user_id = p_user_id;
  
  IF v_current_expires IS NULL THEN
    v_new_expires := now() + (p_months || ' months')::interval;
  ELSE
    v_new_expires := GREATEST(v_current_expires, now()) + (p_months || ' months')::interval;
  END IF;
  
  -- Update user profile
  UPDATE public.profiles
  SET 
    subscription_status = 'pro',
    pro_expires_at = v_new_expires,
    updated_at = now()
  WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'User not found');
  END IF;
  
  RETURN json_build_object(
    'success', true,
    'pro_expires_at', v_new_expires::text
  );
END;
$$;
