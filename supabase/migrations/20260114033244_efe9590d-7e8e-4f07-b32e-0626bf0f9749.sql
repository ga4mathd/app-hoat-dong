-- Add child age and gender fields to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS child_age text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS child_gender text;