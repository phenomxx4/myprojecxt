-- Create couriers table
CREATE TABLE IF NOT EXISTS couriers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  available_for_domestic_usa BOOLEAN DEFAULT false,
  available_for_domestic_eu BOOLEAN DEFAULT false,
  available_for_international BOOLEAN DEFAULT false,
  -- Added courier filtering columns for positive/negative keyword filtering
  positive_keywords TEXT DEFAULT '',
  negative_keywords TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comments explaining the filtering system
COMMENT ON COLUMN couriers.positive_keywords IS 'Comma-separated keywords. If set, only show couriers matching these terms in name/service';
COMMENT ON COLUMN couriers.negative_keywords IS 'Comma-separated keywords. Hide couriers matching these terms in name/service';

-- Create shipping_settings table for price adjustments
CREATE TABLE IF NOT EXISTS shipping_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  courier_id UUID REFERENCES couriers(id) ON DELETE CASCADE,
  price_adjustment_percentage DECIMAL(5,2) DEFAULT 0.00,
  base_price_domestic_usa DECIMAL(10,2) DEFAULT 0.00,
  base_price_domestic_eu DECIMAL(10,2) DEFAULT 0.00,
  base_price_international DECIMAL(10,2) DEFAULT 0.00,
  price_per_kg DECIMAL(10,2) DEFAULT 0.00,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  
  -- Customer information
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50),
  
  -- Shipping details
  from_country VARCHAR(100) NOT NULL,
  from_zip VARCHAR(20) NOT NULL,
  to_country VARCHAR(100) NOT NULL,
  to_zip VARCHAR(20) NOT NULL,
  
  -- Package details
  weight DECIMAL(10,2) NOT NULL,
  length DECIMAL(10,2) NOT NULL,
  width DECIMAL(10,2) NOT NULL,
  height DECIMAL(10,2) NOT NULL,
  volumetric_weight DECIMAL(10,2),
  
  -- Courier and pricing
  courier_id UUID REFERENCES couriers(id),
  courier_name VARCHAR(255) NOT NULL,
  shipping_price DECIMAL(10,2) NOT NULL,
  
  -- Payment details
  payment_status VARCHAR(50) DEFAULT 'pending',
  payment_id VARCHAR(255),
  payment_method VARCHAR(50),
  
  -- Order status
  status VARCHAR(50) DEFAULT 'pending',
  tracking_number VARCHAR(255),
  shipping_label_url TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE,
  shipped_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
