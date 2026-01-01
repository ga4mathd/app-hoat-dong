-- Add expert_avatar column to activities table
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS expert_avatar TEXT;

-- Create shop_products table
CREATE TABLE IF NOT EXISTS public.shop_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  image_url TEXT,
  category TEXT,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on shop_products
ALTER TABLE public.shop_products ENABLE ROW LEVEL SECURITY;

-- RLS Policies for shop_products
CREATE POLICY "Shop products are viewable by everyone" 
ON public.shop_products 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert shop products" 
ON public.shop_products 
FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update shop products" 
ON public.shop_products 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete shop products" 
ON public.shop_products 
FOR DELETE 
USING (public.has_role(auth.uid(), 'admin'));

-- Add admin policies for stories_music (currently missing)
CREATE POLICY "Admins can insert stories music" 
ON public.stories_music 
FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update stories music" 
ON public.stories_music 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete stories music" 
ON public.stories_music 
FOR DELETE 
USING (public.has_role(auth.uid(), 'admin'));