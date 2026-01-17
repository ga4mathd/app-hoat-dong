-- Add RLS policies for Expert role on activities table
CREATE POLICY "Experts can insert activities"
ON public.activities FOR INSERT
WITH CHECK (has_role(auth.uid(), 'expert'::app_role));

CREATE POLICY "Experts can update activities"
ON public.activities FOR UPDATE
USING (has_role(auth.uid(), 'expert'::app_role));

CREATE POLICY "Experts can delete activities"
ON public.activities FOR DELETE
USING (has_role(auth.uid(), 'expert'::app_role));

-- Add RLS policies for Expert role on stories_music table
CREATE POLICY "Experts can insert stories music"
ON public.stories_music FOR INSERT
WITH CHECK (has_role(auth.uid(), 'expert'::app_role));

CREATE POLICY "Experts can update stories music"
ON public.stories_music FOR UPDATE
USING (has_role(auth.uid(), 'expert'::app_role));

CREATE POLICY "Experts can delete stories music"
ON public.stories_music FOR DELETE
USING (has_role(auth.uid(), 'expert'::app_role));

-- Add RLS policies for Expert role on shop_products table
CREATE POLICY "Experts can insert shop products"
ON public.shop_products FOR INSERT
WITH CHECK (has_role(auth.uid(), 'expert'::app_role));

CREATE POLICY "Experts can update shop products"
ON public.shop_products FOR UPDATE
USING (has_role(auth.uid(), 'expert'::app_role));

CREATE POLICY "Experts can delete shop products"
ON public.shop_products FOR DELETE
USING (has_role(auth.uid(), 'expert'::app_role));

-- Allow admins to manage user_roles (insert/update/delete)
CREATE POLICY "Admins can insert user roles"
ON public.user_roles FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update user roles"
ON public.user_roles FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete user roles"
ON public.user_roles FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to view all user roles
CREATE POLICY "Admins can view all user roles"
ON public.user_roles FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to view all profiles for user management
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));