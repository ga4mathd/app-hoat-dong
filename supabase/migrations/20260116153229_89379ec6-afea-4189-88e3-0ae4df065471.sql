-- Add streak tracking fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS current_streak integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_activity_date date DEFAULT NULL;

-- Create saved_activities table for bookmark feature
CREATE TABLE IF NOT EXISTS public.saved_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  saved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, activity_id)
);

-- Enable RLS on saved_activities
ALTER TABLE public.saved_activities ENABLE ROW LEVEL SECURITY;

-- RLS policies for saved_activities
CREATE POLICY "Users can view own saved activities" 
ON public.saved_activities 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can save activities" 
ON public.saved_activities 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved activities" 
ON public.saved_activities 
FOR DELETE 
USING (auth.uid() = user_id);

-- Function to update streak when activity is completed
CREATE OR REPLACE FUNCTION public.update_user_streak()
RETURNS TRIGGER AS $$
DECLARE
  last_date date;
  current_streak_val integer;
BEGIN
  -- Get current streak info
  SELECT last_activity_date, current_streak 
  INTO last_date, current_streak_val
  FROM public.profiles 
  WHERE user_id = NEW.user_id;

  -- Calculate new streak
  IF last_date IS NULL THEN
    -- First activity ever
    current_streak_val := 1;
  ELSIF last_date = CURRENT_DATE THEN
    -- Already completed activity today, no change
    NULL;
  ELSIF last_date = CURRENT_DATE - INTERVAL '1 day' THEN
    -- Consecutive day, increment streak
    current_streak_val := COALESCE(current_streak_val, 0) + 1;
  ELSE
    -- Streak broken, reset to 1
    current_streak_val := 1;
  END IF;

  -- Update profile
  UPDATE public.profiles 
  SET 
    current_streak = current_streak_val,
    last_activity_date = CURRENT_DATE,
    updated_at = now()
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to update streak after completing activity
DROP TRIGGER IF EXISTS update_streak_on_progress ON public.user_progress;
CREATE TRIGGER update_streak_on_progress
AFTER INSERT ON public.user_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_user_streak();