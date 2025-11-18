import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createServerClient()

    // Get orders that are abandoned (created but not paid within 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    const { data: abandonedOrders, error } = await supabase
      .from("orders")
      .select("*")
      .eq("payment_status", "pending")
      .is("paid_at", null)
      .lt("created_at", twentyFourHoursAgo)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching abandoned checkouts:", error)
      return NextResponse.json({ error: "Failed to fetch abandoned checkouts" }, { status: 500 })
    }

    return NextResponse.json({ abandonedOrders: abandonedOrders || [] })
  } catch (error) {
    console.error("[v0] Error in abandoned checkouts route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
