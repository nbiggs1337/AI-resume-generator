-- Update resume limit from 10 to 5 for free users
UPDATE profiles 
SET resume_limit = 5 
WHERE account_type = 'limited' AND resume_limit = 10;

-- Update default for new users
ALTER TABLE profiles ALTER COLUMN resume_limit SET DEFAULT 5;
