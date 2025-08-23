-- Add account type and resume limit fields to profiles table (only if they don't exist)
DO $$ 
BEGIN
  -- Add account_type column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'account_type') THEN
    ALTER TABLE profiles ADD COLUMN account_type text DEFAULT 'limited' CHECK (account_type IN ('limited', 'full'));
  END IF;
  
  -- Add resume_limit column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'resume_limit') THEN
    ALTER TABLE profiles ADD COLUMN resume_limit integer DEFAULT 10;
  END IF;
  
  -- Add upgraded_at column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'upgraded_at') THEN
    ALTER TABLE profiles ADD COLUMN upgraded_at timestamp with time zone;
  END IF;
  
  -- Add payment_reference column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'payment_reference') THEN
    ALTER TABLE profiles ADD COLUMN payment_reference text;
  END IF;
END $$;

-- Update existing users to have full access (grandfathered in)
UPDATE profiles SET account_type = 'full', resume_limit = NULL WHERE created_at < NOW();

-- Create index for efficient querying (only if it doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_profiles_account_type') THEN
    CREATE INDEX idx_profiles_account_type ON profiles(account_type);
  END IF;
END $$;

-- Add RLS policy for account type access (only if it doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own account type' AND tablename = 'profiles') THEN
    CREATE POLICY "Users can view their own account type" ON profiles
    FOR SELECT USING (auth.uid() = id);
  END IF;
END $$;

-- Function to count user's resumes
CREATE OR REPLACE FUNCTION get_user_resume_count(user_uuid uuid)
RETURNS integer AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::integer 
    FROM resumes 
    WHERE user_id = user_uuid 
    AND deleted_at IS NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can create more resumes
CREATE OR REPLACE FUNCTION can_create_resume(user_uuid uuid)
RETURNS boolean AS $$
DECLARE
  user_account_type text;
  user_resume_limit integer;
  current_resume_count integer;
BEGIN
  -- Get user's account type and limit
  SELECT account_type, resume_limit INTO user_account_type, user_resume_limit
  FROM profiles WHERE id = user_uuid;
  
  -- Full access users have no limit
  IF user_account_type = 'full' THEN
    RETURN true;
  END IF;
  
  -- Get current resume count
  current_resume_count := get_user_resume_count(user_uuid);
  
  -- Check if under limit
  RETURN current_resume_count < user_resume_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
