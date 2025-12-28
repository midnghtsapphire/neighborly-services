-- =============================================
-- NeighborHub Database Schema
-- =============================================

-- Service Categories Enum
CREATE TYPE public.service_category AS ENUM (
  'pet_care',
  'lawn_garden',
  'handyman',
  'tutoring',
  'errands',
  'cleaning',
  'babysitting',
  'delivery',
  'other'
);

-- Job Status Enum
CREATE TYPE public.job_status AS ENUM (
  'open',
  'in_progress',
  'completed',
  'cancelled'
);

-- =============================================
-- Profiles Table
-- =============================================
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  neighborhood TEXT DEFAULT 'Maplewood Heights',
  is_service_provider BOOLEAN DEFAULT false,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles: Anyone can view, users can update their own
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- =============================================
-- Services Table (what providers offer)
-- =============================================
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category service_category NOT NULL,
  hourly_rate DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Services: Anyone can view active services, providers manage their own
CREATE POLICY "Active services are viewable by everyone" 
ON public.services FOR SELECT USING (is_active = true);

CREATE POLICY "Providers can insert their own services" 
ON public.services FOR INSERT WITH CHECK (auth.uid() = provider_id);

CREATE POLICY "Providers can update their own services" 
ON public.services FOR UPDATE USING (auth.uid() = provider_id);

CREATE POLICY "Providers can delete their own services" 
ON public.services FOR DELETE USING (auth.uid() = provider_id);

-- =============================================
-- Jobs Table (what users need done)
-- =============================================
CREATE TABLE public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poster_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category service_category NOT NULL,
  budget DECIMAL(10,2),
  status job_status NOT NULL DEFAULT 'open',
  is_urgent BOOLEAN DEFAULT false,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Jobs: Anyone can view open jobs, users manage their own
CREATE POLICY "Open jobs are viewable by everyone" 
ON public.jobs FOR SELECT USING (status = 'open' OR auth.uid() = poster_id);

CREATE POLICY "Users can insert their own jobs" 
ON public.jobs FOR INSERT WITH CHECK (auth.uid() = poster_id);

CREATE POLICY "Users can update their own jobs" 
ON public.jobs FOR UPDATE USING (auth.uid() = poster_id);

CREATE POLICY "Users can delete their own jobs" 
ON public.jobs FOR DELETE USING (auth.uid() = poster_id);

-- =============================================
-- Reviews Table
-- =============================================
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT different_users CHECK (reviewer_id != reviewee_id)
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Reviews: Anyone can view, authenticated users can create
CREATE POLICY "Reviews are viewable by everyone" 
ON public.reviews FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create reviews" 
ON public.reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- =============================================
-- Trigger for auto-creating profile on signup
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- Trigger for updating updated_at timestamps
-- =============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();