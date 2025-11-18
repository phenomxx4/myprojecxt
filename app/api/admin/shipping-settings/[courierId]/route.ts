import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ courierId: string }> }) {
  try {
    const { courierId } = await params
    const body = await request.json()
    const {
      price_adjustment_percentage,
      base_price_domestic_usa,
      base_price_domestic_eu,
      base_price_international,
      price_per_kg,
    } = body

    const supabase = await getSupabaseServerClient()

    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (price_adjustment_percentage !== undefined) updateData.price_adjustment_percentage = price_adjustment_percentage
    if (base_price_domestic_usa !== undefined) updateData.base_price_domestic_usa = base_price_domestic_usa
    if (base_price_domestic_eu !== undefined) updateData.base_price_domestic_eu = base_price_domestic_eu
    if (base_price_international !== undefined) updateData.base_price_international = base_price_international
    if (price_per_kg !== undefined) updateData.price_per_kg = price_per_kg

    const { data: settings, error } = await supabase
      .from("shipping_settings")
      .update(updateData)
      .eq("courier_id", courierId)
      .select()
      .single()

    if (error) {
      console.error("[v0] Settings update error:", error)
      return NextResponse.json({ error: "Failed to update shipping settings" }, { status: 500 })
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error("[v0] Settings update API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
