-- Add likes_count column to activities table
ALTER TABLE public.activities 
ADD COLUMN likes_count integer DEFAULT 0;