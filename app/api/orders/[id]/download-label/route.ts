import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createServerClient()

    const { data: order, error } = await supabase
      .from("orders")
      .select("shipping_label_data, shipping_label_filename")
      .eq("id", params.id)
      .single()

    if (error || !order || !order.shipping_label_data) {
      return NextResponse.json({ error: "Label not found" }, { status: 404 })
    }

    // Convert base64 back to binary
    const buffer = Buffer.from(order.shipping_label_data, "base64")

    // Determine content type based on filename
    const contentType = order.shipping_label_filename?.endsWith(".pdf") ? "application/pdf" : "image/png"

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${order.shipping_label_filename || "label.pdf"}"`,
      },
    })
  } catch (error) {
    console.error("[v0] Error downloading label:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
