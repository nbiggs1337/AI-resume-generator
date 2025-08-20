-- Create job_postings table for scraped job data
CREATE TABLE IF NOT EXISTS public.job_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  job_type TEXT, -- full-time, part-time, contract, etc.
  salary_range TEXT,
  description TEXT NOT NULL,
  requirements TEXT,
  benefits TEXT,
  scraped_data JSONB DEFAULT '{}'::jsonb, -- Raw scraped data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for job_postings
CREATE POLICY "job_postings_select_own" ON public.job_postings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "job_postings_insert_own" ON public.job_postings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "job_postings_update_own" ON public.job_postings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "job_postings_delete_own" ON public.job_postings
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_job_postings_user_id ON public.job_postings(user_id);
CREATE INDEX idx_job_postings_url ON public.job_postings(url);
