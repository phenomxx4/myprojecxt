import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = params.id
    const supabase = await getSupabaseServerClient()

    const { data: orders, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] User orders fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch user orders" }, { status: 500 })
    }

    return NextResponse.json({ orders })
  } catch (error) {
    console.error("[v0] User orders API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
