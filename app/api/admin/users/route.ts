import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createServerClient()

    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("user_id, customer_email, customer_name, created_at")
      .order("created_at", { ascending: false })

    if (ordersError) {
      console.error("[v0] Orders fetch error:", ordersError)
      return NextResponse.json({ error: "Failed to fetch users from orders" }, { status: 500 })
    }

    // Group orders by user_id and count them
    const userMap = new Map()

    orders?.forEach((order) => {
      if (order.user_id) {
        if (!userMap.has(order.user_id)) {
          userMap.set(order.user_id, {
            id: order.user_id,
            email: order.customer_email,
            full_name: order.customer_name,
            created_at: order.created_at,
            order_count: 0,
          })
        }
        const user = userMap.get(order.user_id)
        user.order_count += 1
      }
    })

    const users = Array.from(userMap.values())

    return NextResponse.json({ users })
  } catch (error) {
    console.error("[v0] Users API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
