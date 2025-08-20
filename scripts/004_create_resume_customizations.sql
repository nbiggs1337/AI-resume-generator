-- Create resume_customizations table for AI-customized resumes
CREATE TABLE IF NOT EXISTS public.resume_customizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  base_resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  job_posting_id UUID NOT NULL REFERENCES public.job_postings(id) ON DELETE CASCADE,
  
  -- Customized resume data
  customized_data JSONB NOT NULL,
  
  -- AI customization metadata
  customization_notes TEXT,
  match_score INTEGER CHECK (match_score >= 0 AND match_score <= 100),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.resume_customizations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for resume_customizations
CREATE POLICY "resume_customizations_select_own" ON public.resume_customizations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "resume_customizations_insert_own" ON public.resume_customizations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "resume_customizations_update_own" ON public.resume_customizations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "resume_customizations_delete_own" ON public.resume_customizations
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_resume_customizations_user_id ON public.resume_customizations(user_id);
CREATE INDEX idx_resume_customizations_base_resume ON public.resume_customizations(base_resume_id);
CREATE INDEX idx_resume_customizations_job_posting ON public.resume_customizations(job_posting_id);

-- Ensure unique customization per resume-job combination
CREATE UNIQUE INDEX idx_unique_resume_job_customization 
ON public.resume_customizations(base_resume_id, job_posting_id);
