-- Add column to store shipping label as base64
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_label_data TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_label_filename VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS label_uploaded_at TIMESTAMP WITH TIME ZONE;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_label_uploaded ON orders(label_uploaded_at);
