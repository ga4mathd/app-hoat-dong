-- Add phone_number column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_number text;

-- Update the trigger function to save all registration data
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, child_age, child_gender, phone_number)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'child_age',
    NEW.raw_user_meta_data ->> 'child_gender',
    NEW.raw_user_meta_data ->> 'phone_number'
  );
  RETURN NEW;
END;
$function$;