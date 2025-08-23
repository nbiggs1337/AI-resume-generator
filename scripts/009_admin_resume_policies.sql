-- Add admin policies for resumes table
CREATE POLICY "Allow admins to view all resumes" ON resumes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles admin_profile 
      WHERE admin_profile.id = auth.uid() 
      AND admin_profile.is_admin = true
    )
  );

CREATE POLICY "Allow admins to update all resumes" ON resumes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles admin_profile 
      WHERE admin_profile.id = auth.uid() 
      AND admin_profile.is_admin = true
    )
  );

CREATE POLICY "Allow admins to delete all resumes" ON resumes
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles admin_profile 
      WHERE admin_profile.id = auth.uid() 
      AND admin_profile.is_admin = true
    )
  );

-- Block banned users from accessing resumes
CREATE POLICY "Block banned users from resumes" ON resumes
  FOR ALL USING (
    NOT EXISTS (
      SELECT 1 FROM profiles user_profile 
      WHERE user_profile.id = auth.uid() 
      AND user_profile.is_banned = true
    )
  );
