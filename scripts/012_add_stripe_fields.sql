-- Added Stripe-related fields to profiles table for payment tracking
DO $$
BEGIN
  -- Add stripe_customer_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'stripe_customer_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN stripe_customer_id TEXT;
  END IF;

  -- Add payment_method column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE profiles ADD COLUMN payment_method TEXT DEFAULT 'bitcoin';
  END IF;

  -- Add upgraded_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'upgraded_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN upgraded_at TIMESTAMP WITH TIME ZONE;
  END IF;

  -- Create index on stripe_customer_id for faster lookups
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'profiles' AND indexname = 'idx_profiles_stripe_customer_id'
  ) THEN
    CREATE INDEX idx_profiles_stripe_customer_id ON profiles(stripe_customer_id);
  END IF;
END $$;

-- Update existing full access users to have upgraded_at timestamp
UPDATE profiles 
SET upgraded_at = COALESCE(updated_at, created_at)
WHERE account_type = 'full' AND upgraded_at IS NULL;
