-- Create resumes table
CREATE TABLE IF NOT EXISTS public.resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  template_style TEXT DEFAULT 'modern',
  
  -- Work Experience (JSON array)
  work_experience JSONB DEFAULT '[]'::jsonb,
  
  -- Education (JSON array)
  education JSONB DEFAULT '[]'::jsonb,
  
  -- Skills (JSON array)
  skills JSONB DEFAULT '[]'::jsonb,
  
  -- Projects (JSON array)
  projects JSONB DEFAULT '[]'::jsonb,
  
  -- Certifications (JSON array)
  certifications JSONB DEFAULT '[]'::jsonb,
  
  -- Additional sections (JSON object)
  additional_sections JSONB DEFAULT '{}'::jsonb,
  
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for resumes
CREATE POLICY "resumes_select_own" ON public.resumes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "resumes_insert_own" ON public.resumes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "resumes_update_own" ON public.resumes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "resumes_delete_own" ON public.resumes
  FOR DELETE USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_resumes_user_id ON public.resumes(user_id);
