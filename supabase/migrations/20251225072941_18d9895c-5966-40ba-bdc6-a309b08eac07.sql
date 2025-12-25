-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  total_points INTEGER DEFAULT 0,
  total_activities INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create activities table for daily activities
CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  image_url TEXT,
  video_url TEXT,
  goals TEXT,
  instructions TEXT,
  expert_name TEXT DEFAULT 'Chuyên gia Jenna',
  expert_title TEXT DEFAULT 'Chuyên gia Tâm lý Giáo dục',
  scheduled_date DATE DEFAULT CURRENT_DATE,
  points INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_progress to track completed activities
CREATE TABLE public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  points_earned INTEGER DEFAULT 0,
  UNIQUE(user_id, activity_id)
);

-- Create stories_music table
CREATE TABLE public.stories_music (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('story', 'music')),
  description TEXT,
  content_url TEXT,
  thumbnail_url TEXT,
  duration_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories_music ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Activities are public read
CREATE POLICY "Activities are viewable by everyone" ON public.activities
  FOR SELECT USING (true);

-- User progress policies
CREATE POLICY "Users can view own progress" ON public.user_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON public.user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Stories/music are public read
CREATE POLICY "Stories music are viewable by everyone" ON public.stories_music
  FOR SELECT USING (true);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$;

-- Trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample activities
INSERT INTO public.activities (title, description, tags, goals, instructions, scheduled_date, points) VALUES
('Bong Bóng Xà Phòng - Ngày 1', 'Khám phá thế giới diệu kỳ của bong bóng xà phòng cùng bé yêu', ARRAY['Trò chơi', 'Khoa học'], 'Phát triển tư duy khoa học và khả năng quan sát cho bé', 'Chuẩn bị nước xà phòng và ống thổi. Hướng dẫn bé thổi bong bóng và quan sát màu sắc cầu vồng trên bề mặt', CURRENT_DATE, 10),
('Vẽ tranh thiên nhiên', 'Cùng bé vẽ và tô màu các loài hoa, cây cối', ARRAY['Nghệ thuật', 'Sáng tạo'], 'Phát triển khả năng sáng tạo và nhận biết màu sắc', 'Chuẩn bị giấy, bút màu. Cho bé quan sát thiên nhiên và vẽ lại', CURRENT_DATE + 1, 15),
('Học đếm với đồ chơi', 'Học đếm số thông qua các đồ chơi yêu thích', ARRAY['Toán học', 'Trò chơi'], 'Phát triển tư duy toán học cơ bản', 'Sử dụng đồ chơi để dạy bé đếm từ 1-10', CURRENT_DATE + 2, 10);

-- Insert sample stories/music
INSERT INTO public.stories_music (title, type, description, duration_minutes) VALUES
('Cô bé quàng khăn đỏ', 'story', 'Câu chuyện cổ tích về cô bé và con sói', 10),
('Ba con gấu', 'story', 'Câu chuyện về ba con gấu và cô bé vàng tóc', 8),
('Nhạc ru con ngủ', 'music', 'Những giai điệu nhẹ nhàng giúp bé ngủ ngon', 15),
('Vần điệu vui vẻ', 'music', 'Các bài hát vui nhộn cho bé vận động', 12);