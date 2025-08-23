-- Add account type and resume limit fields to profiles table
ALTER TABLE profiles 
ADD COLUMN account_type text DEFAULT 'limited' CHECK (account_type IN ('limited', 'full')),
ADD COLUMN resume_limit integer DEFAULT 10,
ADD COLUMN upgraded_at timestamp with time zone,
ADD COLUMN payment_reference text;

-- Update existing users to have full access (grandfathered in)
UPDATE profiles SET account_type = 'full', resume_limit = NULL WHERE created_at < NOW();

-- Create index for efficient querying
CREATE INDEX idx_profiles_account_type ON profiles(account_type);

-- Add RLS policy for account type access
CREATE POLICY "Users can view their own account type" ON profiles
FOR SELECT USING (auth.uid() = id);

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
