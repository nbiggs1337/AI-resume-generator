-- Fix infinite recursion in profiles RLS policies

-- Drop the problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Allow admins to view all profiles" ON profiles;
DROP POLICY IF EXISTS "Allow admins to update all profiles" ON profiles;
DROP POLICY IF EXISTS "Block banned users" ON profiles;

-- Create a function to check admin status without causing recursion
CREATE OR REPLACE FUNCTION is_admin_user(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Use a direct query with security definer to bypass RLS
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id 
    AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to check banned status without causing recursion
CREATE OR REPLACE FUNCTION is_banned_user(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Use a direct query with security definer to bypass RLS
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id 
    AND is_banned = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new policies that use the functions instead of subqueries
CREATE POLICY "Allow users to view own profile or admins to view all" ON profiles
  FOR SELECT USING (
    auth.uid() = id OR is_admin_user(auth.uid())
  );

CREATE POLICY "Allow users to update own profile or admins to update all" ON profiles
  FOR UPDATE USING (
    auth.uid() = id OR is_admin_user(auth.uid())
  );

-- Block banned users from all operations except viewing their own profile
CREATE POLICY "Block banned users from modifications" ON profiles
  FOR INSERT WITH CHECK (NOT is_banned_user(auth.uid()));

CREATE POLICY "Block banned users from updates" ON profiles
  FOR UPDATE USING (NOT is_banned_user(auth.uid()));

CREATE POLICY "Block banned users from deletes" ON profiles
  FOR DELETE USING (NOT is_banned_user(auth.uid()));
