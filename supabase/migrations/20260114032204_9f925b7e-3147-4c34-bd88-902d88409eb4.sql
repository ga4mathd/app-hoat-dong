-- Add subscription fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_status text NOT NULL DEFAULT 'pending_activation',
ADD COLUMN IF NOT EXISTS activated_at timestamptz,
ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz,
ADD COLUMN IF NOT EXISTS pro_expires_at timestamptz;

-- Add comment for subscription_status values
COMMENT ON COLUMN public.profiles.subscription_status IS 'Values: pending_activation, trial, expired, pro';

-- Create subscriptions table for payment history
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  payment_method text NOT NULL, -- 'momo' or 'vnpay'
  amount integer NOT NULL,
  currency text DEFAULT 'VND',
  status text NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  transaction_id text,
  order_id text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Enable RLS on subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscriptions
CREATE POLICY "Users can view their own subscriptions"
ON public.subscriptions
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own subscriptions
CREATE POLICY "Users can insert their own subscriptions"
ON public.subscriptions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create function to activate trial
CREATE OR REPLACE FUNCTION public.activate_trial()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id uuid;
  v_current_status text;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Check current status
  SELECT subscription_status INTO v_current_status
  FROM public.profiles
  WHERE user_id = v_user_id;
  
  IF v_current_status != 'pending_activation' THEN
    RETURN json_build_object('success', false, 'error', 'Trial already activated or expired');
  END IF;
  
  -- Activate trial for 30 days
  UPDATE public.profiles
  SET 
    subscription_status = 'trial',
    activated_at = now(),
    trial_ends_at = now() + interval '30 days',
    updated_at = now()
  WHERE user_id = v_user_id;
  
  RETURN json_build_object(
    'success', true,
    'trial_ends_at', (now() + interval '30 days')::text
  );
END;
$$;

-- Create function to check and update subscription status
CREATE OR REPLACE FUNCTION public.check_subscription_status()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id uuid;
  v_profile record;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  SELECT * INTO v_profile
  FROM public.profiles
  WHERE user_id = v_user_id;
  
  IF v_profile IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Profile not found');
  END IF;
  
  -- Check if trial has expired
  IF v_profile.subscription_status = 'trial' AND v_profile.trial_ends_at < now() THEN
    UPDATE public.profiles
    SET subscription_status = 'expired', updated_at = now()
    WHERE user_id = v_user_id;
    
    RETURN json_build_object(
      'success', true,
      'status', 'expired',
      'trial_ends_at', v_profile.trial_ends_at,
      'days_remaining', 0
    );
  END IF;
  
  -- Check if pro has expired
  IF v_profile.subscription_status = 'pro' AND v_profile.pro_expires_at IS NOT NULL AND v_profile.pro_expires_at < now() THEN
    UPDATE public.profiles
    SET subscription_status = 'expired', updated_at = now()
    WHERE user_id = v_user_id;
    
    RETURN json_build_object(
      'success', true,
      'status', 'expired',
      'pro_expires_at', v_profile.pro_expires_at
    );
  END IF;
  
  -- Return current status
  RETURN json_build_object(
    'success', true,
    'status', v_profile.subscription_status,
    'activated_at', v_profile.activated_at,
    'trial_ends_at', v_profile.trial_ends_at,
    'pro_expires_at', v_profile.pro_expires_at,
    'days_remaining', CASE 
      WHEN v_profile.subscription_status = 'trial' THEN 
        GREATEST(0, EXTRACT(DAY FROM v_profile.trial_ends_at - now()))::integer
      WHEN v_profile.subscription_status = 'pro' AND v_profile.pro_expires_at IS NOT NULL THEN
        GREATEST(0, EXTRACT(DAY FROM v_profile.pro_expires_at - now()))::integer
      ELSE NULL
    END
  );
END;
$$;

-- Create function to upgrade to pro after payment
CREATE OR REPLACE FUNCTION public.upgrade_to_pro(p_order_id text, p_transaction_id text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_subscription record;
BEGIN
  -- Find the subscription by order_id
  SELECT * INTO v_subscription
  FROM public.subscriptions
  WHERE order_id = p_order_id;
  
  IF v_subscription IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Subscription not found');
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