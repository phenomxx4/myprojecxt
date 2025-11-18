import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await getSupabaseServerClient()

    const { data: order, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        couriers (
          name,
          code,
          logo_url
        )
      `,
      )
      .eq("id", id)
      .single()

    if (error) {
      console.error("[v0] Order fetch error:", error)
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error("[v0] Order API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, tracking_number, shipping_label_url } = body

    const supabase = await getSupabaseServerClient()

    const updateData: any = {}

    if (status) {
      updateData.status = status
      if (status === "shipped") {
        updateData.shipped_at = new Date().toISOString()
      } else if (status === "delivered") {
        updateData.delivered_at = new Date().toISOString()
      }
    }

    if (tracking_number) {
      updateData.tracking_number = tracking_number
    }

    if (shipping_label_url) {
      updateData.shipping_label_url = shipping_label_url
    }

    const { data: order, error } = await supabase.from("orders").update(updateData).eq("id", id).select().single()

    if (error) {
      console.error("[v0] Order update error:", error)
      return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error("[v0] Order update API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
