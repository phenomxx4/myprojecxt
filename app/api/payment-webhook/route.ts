import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, paymentId, status, mac } = body

    // Verify MAC signature from Nexi (keeping for backwards compatibility if still using Nexi)
    const nexiApiKey = process.env.NEXI_API_KEY
    const nexiMerchantId = process.env.NEXI_MERCHANT_ID

    if (nexiApiKey && nexiMerchantId) {
      // Verify the MAC if Nexi credentials are configured
      const expectedMac = crypto
        .createHmac("sha256", nexiApiKey)
        .update(`${nexiMerchantId}${orderId}${paymentId}${status}`)
        .digest("hex")

      if (mac !== expectedMac) {
        console.error("[v0] Invalid MAC signature")
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
      }
    }

    // Update order in database
    const supabase = await getSupabaseServerClient()

    const updateData: any = {
      payment_id: paymentId,
      payment_status: status === "AUTHORIZED" || status === "CAPTURED" ? "completed" : "failed",
    }

    if (status === "AUTHORIZED" || status === "CAPTURED") {
      updateData.paid_at = new Date().toISOString()
      updateData.status = "paid"
    }

    const { error } = await supabase.from("orders").update(updateData).eq("order_number", orderId)

    if (error) {
      console.error("[v0] Order update error:", error)
      return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Webhook error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
