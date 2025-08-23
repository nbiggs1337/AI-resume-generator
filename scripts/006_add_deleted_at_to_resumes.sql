-- Adding deleted_at column for soft delete functionality
ALTER TABLE resumes ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;

-- Create index for better performance when filtering out deleted resumes
CREATE INDEX idx_resumes_deleted_at ON resumes(deleted_at);

-- Update existing queries to exclude deleted resumes by default
-- This is a reminder that all SELECT queries should include WHERE deleted_at IS NULL
