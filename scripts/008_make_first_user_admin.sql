-- Make the first user (oldest created_at) an admin
UPDATE profiles 
SET is_admin = true 
WHERE id = (
  SELECT id FROM profiles 
  ORDER BY created_at ASC 
  LIMIT 1
);
