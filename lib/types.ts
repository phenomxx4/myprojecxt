export interface Order {
  id: string
  order_number: string
  customer_name: string
  customer_email: string
  customer_phone: string | null
  from_country: string
  from_zip: string
  to_country: string
  to_zip: string
  weight: number
  length: number
  width: number
  height: number
  volumetric_weight: number
  courier_id: string | null
  courier_name: string
  shipping_price: number
  payment_status: string
  payment_id: string | null
  payment_method: string | null
  status: string
  tracking_number: string | null
  shipping_label_url: string | null
  created_at: string
  paid_at: string | null
  shipped_at: string | null
  delivered_at: string | null
  couriers?: {
    name: string
    code: string
    logo_url: string | null
  }
}

export interface Courier {
  id: string
  name: string
  code: string
  logo_url: string | null
  is_active: boolean
  available_for_domestic_usa: boolean
  available_for_domestic_eu: boolean
  available_for_international: boolean
  positive_keywords: string
  negative_keywords: string
  created_at: string
  updated_at: string
}

export interface ShippingSettings {
  id: string
  courier_id: string
  price_adjustment_percentage: number
  base_price_domestic_usa: number
  base_price_domestic_eu: number
  base_price_international: number
  price_per_kg: number
  updated_at: string
}
