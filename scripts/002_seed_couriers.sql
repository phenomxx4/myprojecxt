-- Insert default couriers
INSERT INTO couriers (name, code, logo_url, available_for_domestic_usa, available_for_domestic_eu, available_for_international)
VALUES 
  ('FedEx International Priority', 'FEDEX_INTL', '/fedex-logo.png', false, false, true),
  ('USPS Ground', 'USPS_GROUND', '/generic-postal-logo.png', true, false, false),
  ('USPS Priority', 'USPS_PRIORITY', '/generic-postal-logo.png', true, false, false)
ON CONFLICT (code) DO NOTHING;

-- Insert default shipping settings for each courier
INSERT INTO shipping_settings (courier_id, price_adjustment_percentage, base_price_domestic_usa, base_price_domestic_eu, base_price_international, price_per_kg)
SELECT 
  id,
  0.00,
  CASE 
    WHEN code = 'USPS_GROUND' THEN 15.00
    WHEN code = 'USPS_PRIORITY' THEN 25.00
    ELSE 0.00
  END,
  0.00,
  CASE 
    WHEN code = 'FEDEX_INTL' THEN 65.00
    ELSE 0.00
  END,
  CASE 
    WHEN code = 'USPS_GROUND' THEN 2.50
    WHEN code = 'USPS_PRIORITY' THEN 3.50
    WHEN code = 'FEDEX_INTL' THEN 8.00
    ELSE 0.00
  END
FROM couriers
WHERE NOT EXISTS (
  SELECT 1 FROM shipping_settings WHERE courier_id = couriers.id
);
