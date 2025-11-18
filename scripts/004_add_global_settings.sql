-- Create global_settings table for storing global configuration
CREATE TABLE IF NOT EXISTS global_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  positive_keywords TEXT[] DEFAULT '{}',
  negative_keywords TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default courier filter settings with fedex and Connect as positive keywords
INSERT INTO global_settings (key, positive_keywords, negative_keywords)
VALUES ('courier_filter', ARRAY['fedex', 'Connect'], ARRAY[]::TEXT[])
ON CONFLICT (key) DO NOTHING;

-- Add comment
COMMENT ON TABLE global_settings IS 'Global application settings including courier filtering';
