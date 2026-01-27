-- Fix OPEN_ENDPOINTS: Add ownership verification to upgrade_to_pro() function
CREATE OR REPLACE FUNCTION public.upgrade_to_pro(p_order_id text, p_transaction_id text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id uuid;
  v_subscription record;
BEGIN
  -- CRITICAL: Get authenticated user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Find the subscription by order_id
  SELECT * INTO v_subscription
  FROM public.subscriptions
  WHERE order_id = p_order_id;
  
  IF v_subscription IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Subscription not found');
  END IF;
  
  -- CRITICAL: Verify ownership - user can only upgrade their own subscription
  IF v_subscription.user_id != v_user_id THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized');
  END IF;
  
  IF v_subscription.status = 'completed' THEN
    RETURN json_build_object('success', false, 'error', 'Payment already processed');
  END IF;
  
  -- Update subscription
  UPDATE public.subscriptions
  SET 
    status = 'completed',
    transaction_id = p_transaction_id,
    completed_at = now()
  WHERE id = v_subscription.id;
  
  -- Upgrade user to pro for 1 year
  UPDATE public.profiles
  SET 
    subscription_status = 'pro',
    pro_expires_at = now() + interval '1 year',
    updated_at = now()
  WHERE user_id = v_subscription.user_id;
  
  RETURN json_build_object(
    'success', true,
    'pro_expires_at', (now() + interval '1 year')::text
  );
END;
$$;