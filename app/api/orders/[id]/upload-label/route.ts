import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createServerClient()
    const formData = await request.formData()
    const file = formData.get("label") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString("base64")

    // Update order with label data
    const { data: order, error: updateError } = await supabase
      .from("orders")
      .update({
        shipping_label_data: base64,
        shipping_label_filename: file.name,
        label_uploaded_at: new Date().toISOString(),
        status: "label_ready",
      })
      .eq("id", params.id)
      .select()
      .single()

    if (updateError) {
      console.error("[v0] Error updating order:", updateError)
      return NextResponse.json({ error: "Failed to upload label" }, { status: 500 })
    }

    // Send email notification to customer
    try {
      await fetch(`${request.nextUrl.origin}/api/send-label-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: params.id,
          customerEmail: order.customer_email,
          orderNumber: order.order_number,
        }),
      })
    } catch (emailError) {
      console.error("[v0] Error sending email:", emailError)
      // Don't fail the upload if email fails
    }

    return NextResponse.json({
      success: true,
      message: "Label uploaded successfully",
    })
  } catch (error) {
    console.error("[v0] Error in upload-label route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
