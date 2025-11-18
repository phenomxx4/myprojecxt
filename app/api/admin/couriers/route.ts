import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient()

    const { data: couriers, error } = await supabase
      .from("couriers")
      .select(
        `
        *,
        shipping_settings (*)
      `,
      )
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Couriers fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch couriers" }, { status: 500 })
    }

    return NextResponse.json({ couriers })
  } catch (error) {
    console.error("[v0] Couriers API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      code,
      logo_url,
      available_for_domestic_usa,
      available_for_domestic_eu,
      available_for_international,
      base_price_domestic_usa,
      base_price_domestic_eu,
      base_price_international,
      price_per_kg,
    } = body

    const supabase = await getSupabaseServerClient()

    // Create courier
    const { data: courier, error: courierError } = await supabase
      .from("couriers")
      .insert({
        name,
        code,
        logo_url,
        is_active: true,
        available_for_domestic_usa: available_for_domestic_usa || false,
        available_for_domestic_eu: available_for_domestic_eu || false,
        available_for_international: available_for_international || false,
      })
      .select()
      .single()

    if (courierError) {
      console.error("[v0] Courier creation error:", courierError)
      return NextResponse.json({ error: "Failed to create courier" }, { status: 500 })
    }

    // Create shipping settings
    const { error: settingsError } = await supabase.from("shipping_settings").insert({
      courier_id: courier.id,
      price_adjustment_percentage: 0,
      base_price_domestic_usa: base_price_domestic_usa || 0,
      base_price_domestic_eu: base_price_domestic_eu || 0,
      base_price_international: base_price_international || 0,
      price_per_kg: price_per_kg || 0,
    })

    if (settingsError) {
      console.error("[v0] Settings creation error:", settingsError)
      return NextResponse.json({ error: "Failed to create shipping settings" }, { status: 500 })
    }

    return NextResponse.json({ courier })
  } catch (error) {
    console.error("[v0] Courier creation API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
