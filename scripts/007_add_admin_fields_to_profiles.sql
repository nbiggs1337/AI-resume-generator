-- Add admin and banned fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS banned_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS banned_reason TEXT;

-- Create index for admin queries
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);
CREATE INDEX IF NOT EXISTS idx_profiles_is_banned ON profiles(is_banned);

-- Add RLS policies for admin access
CREATE POLICY "Allow admins to view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles admin_profile 
      WHERE admin_profile.id = auth.uid() 
      AND admin_profile.is_admin = true
    )
  );

CREATE POLICY "Allow admins to update all profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles admin_profile 
      WHERE admin_profile.id = auth.uid() 
      AND admin_profile.is_admin = true
    )
  );

-- Add policy to prevent banned users from accessing data
CREATE POLICY "Block banned users" ON profiles
  FOR ALL USING (
    NOT EXISTS (
      SELECT 1 FROM profiles user_profile 
      WHERE user_profile.id = auth.uid() 
      AND user_profile.is_banned = true
    )
  );
