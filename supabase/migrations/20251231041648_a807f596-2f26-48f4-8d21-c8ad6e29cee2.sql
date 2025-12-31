-- Tạo enum cho roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Tạo bảng user_roles
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Bật RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Function kiểm tra role (tránh đệ quy RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS policies cho user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles
FOR SELECT USING (auth.uid() = user_id);

-- Cho phép admin quản lý activities (INSERT)
CREATE POLICY "Admins can insert activities" ON public.activities
FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Cho phép admin quản lý activities (UPDATE)
CREATE POLICY "Admins can update activities" ON public.activities
FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Cho phép admin quản lý activities (DELETE)
CREATE POLICY "Admins can delete activities" ON public.activities
FOR DELETE USING (public.has_role(auth.uid(), 'admin'));