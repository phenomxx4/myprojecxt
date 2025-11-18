-- Add user_id column to orders table to link orders to authenticated users
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

-- Update orders table to make customer fields optional for authenticated users
ALTER TABLE orders ALTER COLUMN customer_name DROP NOT NULL;
ALTER TABLE orders ALTER COLUMN customer_email DROP NOT NULL;
