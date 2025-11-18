import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, status, paymentId } = body

    console.log("[v0] Received payment callback from WordPress:", { orderId, status, paymentId })

    // Get Supabase client
    const supabase = await getSupabaseServerClient()

    // Update order status based on payment result
    const updateData: any = {
      payment_id: paymentId,
      payment_status: status === "success" || status === "completed" ? "completed" : "failed",
    }

    if (status === "success" || status === "completed") {
      updateData.paid_at = new Date().toISOString()
      updateData.status = "paid"
    }

    const { error } = await supabase.from("orders").update(updateData).eq("order_number", orderId)

    if (error) {
      console.error("[v0] Order update error:", error)
      return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
    }

    console.log("[v0] Order updated successfully:", orderId)

    return NextResponse.json({ success: true, message: "Payment processed successfully" })
  } catch (error) {
    console.error("[v0] Payment callback error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
