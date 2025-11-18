import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")
    const email = searchParams.get("email")

    const supabase = await getSupabaseServerClient()

    let query = supabase
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
      .order("created_at", { ascending: false })

    if (status) {
      query = query.eq("status", status)
    }

    if (email) {
      query = query.eq("customer_email", email)
    }

    const { data: orders, error } = await query

    if (error) {
      console.error("[v0] Orders fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
    }

    return NextResponse.json({ orders })
  } catch (error) {
    console.error("[v0] Orders API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
