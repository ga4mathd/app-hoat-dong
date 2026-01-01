-- Create feedback table to store user feedback with rate limiting (one per day)
CREATE TABLE public.feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  content text NOT NULL,
  points_awarded integer NOT NULL DEFAULT 50,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  submission_date date NOT NULL DEFAULT CURRENT_DATE
);

-- Create unique index to enforce one feedback per user per day using the submission_date column
CREATE UNIQUE INDEX feedback_user_daily ON public.feedback (user_id, submission_date);

-- Enable RLS
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Users can only view their own feedback
CREATE POLICY "Users can view own feedback"
ON public.feedback
FOR SELECT
USING (auth.uid() = user_id);

-- No direct INSERT allowed - must go through secure function
-- This prevents users from bypassing validation

-- Create a secure function to submit feedback with server-side validation
CREATE OR REPLACE FUNCTION public.submit_feedback(p_content text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_today date;
  v_existing_count integer;
  v_feedback_id uuid;
  v_points integer := 50;
BEGIN
  -- Get the authenticated user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Validate content
  IF p_content IS NULL OR trim(p_content) = '' THEN
    RETURN json_build_object('success', false, 'error', 'Content cannot be empty');
  END IF;
  
  IF length(p_content) > 2000 THEN
    RETURN json_build_object('success', false, 'error', 'Content too long (max 2000 characters)');
  END IF;
  
  -- Check if user already submitted today
  v_today := CURRENT_DATE;
  SELECT COUNT(*) INTO v_existing_count
  FROM public.feedback
  WHERE user_id = v_user_id
    AND submission_date = v_today;
  
  IF v_existing_count > 0 THEN
    RETURN json_build_object('success', false, 'error', 'Already submitted feedback today');
  END IF;
  
  -- Insert feedback
  INSERT INTO public.feedback (user_id, content, points_awarded, submission_date)
  VALUES (v_user_id, trim(p_content), v_points, v_today)
  RETURNING id INTO v_feedback_id;
  
  -- Award points to user profile
  UPDATE public.profiles
  SET total_points = COALESCE(total_points, 0) + v_points,
      updated_at = now()
  WHERE user_id = v_user_id;
  
  RETURN json_build_object(
    'success', true,
    'feedback_id', v_feedback_id,
    'points_awarded', v_points
  );
END;
$$;