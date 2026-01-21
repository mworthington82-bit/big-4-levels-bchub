-- Create enum for evidence types
CREATE TYPE public.evidence_type AS ENUM ('video_link', 'file_upload', 'case_study');

-- Create enum for tool types for leader level
CREATE TYPE public.leader_tool AS ENUM ('teams', 'forms', 'canva', 'edpuzzle', 'copilot', 'immersive');

-- Create profiles table for staff information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  department TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Create leader_evidence table for submissions
CREATE TABLE public.leader_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tool leader_tool NOT NULL,
  evidence_type evidence_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  video_link TEXT,
  file_url TEXT,
  case_study_what TEXT,
  case_study_why TEXT,
  case_study_how TEXT,
  impact_reflection TEXT NOT NULL,
  department TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on leader_evidence
ALTER TABLE public.leader_evidence ENABLE ROW LEVEL SECURITY;

-- Leader evidence policies - everyone can view to enable sharing
CREATE POLICY "Anyone can view leader evidence" ON public.leader_evidence
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert their own evidence" ON public.leader_evidence
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own evidence" ON public.leader_evidence
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own evidence" ON public.leader_evidence
  FOR DELETE USING (auth.uid() = user_id);

-- Create immersive_sessions table for the 3 required sessions
CREATE TABLE public.immersive_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_number INTEGER NOT NULL CHECK (session_number >= 1 AND session_number <= 3),
  title TEXT NOT NULL,
  learner_context TEXT NOT NULL,
  immersive_activity TEXT NOT NULL,
  how_enhanced TEXT NOT NULL,
  evidence_type evidence_type NOT NULL,
  video_link TEXT,
  file_url TEXT,
  lesson_plan_url TEXT,
  photos_urls TEXT[],
  impact_reflection TEXT NOT NULL,
  department TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, session_number)
);

-- Enable RLS on immersive_sessions
ALTER TABLE public.immersive_sessions ENABLE ROW LEVEL SECURITY;

-- Immersive sessions policies
CREATE POLICY "Anyone can view immersive sessions" ON public.immersive_sessions
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert their own sessions" ON public.immersive_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" ON public.immersive_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions" ON public.immersive_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Create storage bucket for evidence files
INSERT INTO storage.buckets (id, name, public) VALUES ('leader-evidence', 'leader-evidence', true);

-- Storage policies for leader evidence bucket
CREATE POLICY "Anyone can view evidence files" ON storage.objects
  FOR SELECT USING (bucket_id = 'leader-evidence');

CREATE POLICY "Authenticated users can upload evidence files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'leader-evidence' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own evidence files" ON storage.objects
  FOR UPDATE USING (bucket_id = 'leader-evidence' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own evidence files" ON storage.objects
  FOR DELETE USING (bucket_id = 'leader-evidence' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leader_evidence_updated_at
  BEFORE UPDATE ON public.leader_evidence
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();