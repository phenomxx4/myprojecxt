import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerName, customerEmail, customerPhone, shippingDetails, selectedQuote, userId } = body

    console.log("[v0] Creating payment order for WordPress redirect")

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`

    // Get Supabase client
    const supabase = await getSupabaseServerClient()

    // Get courier ID from database
    const { data: courier } = await supabase.from("couriers").select("id").eq("name", selectedQuote.courier).single()

    // Create order in database
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        user_id: userId || null,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        from_country: shippingDetails.fromCountry,
        from_zip: shippingDetails.fromZip,
        to_country: shippingDetails.toCountry,
        to_zip: shippingDetails.toZip,
        weight: shippingDetails.weight,
        length: shippingDetails.length,
        width: shippingDetails.width,
        height: shippingDetails.height,
        volumetric_weight: shippingDetails.volumetricWeight,
        courier_id: courier?.id,
        courier_name: `${selectedQuote.courier} - ${selectedQuote.service}`,
        shipping_price: selectedQuote.price,
        payment_status: "pending",
        status: "pending",
      })
      .select()
      .single()

    if (orderError) {
      console.error("[v0] Order creation error:", orderError)
      return NextResponse.json({ error: "Failed to create order", details: orderError.message }, { status: 500 })
    }

    console.log("[v0] Order created successfully:", orderNumber)

    const wordPressPaymentUrl = process.env.WORDPRESS_PAYMENT_URL || "https://www.vasocotto.it"

    // Construct WordPress payment redirect URL with order details
    const redirectUrl = new URL("/checkout", wordPressPaymentUrl)
    redirectUrl.searchParams.append("order_id", orderNumber)
    redirectUrl.searchParams.append("amount", selectedQuote.price.toString())
    redirectUrl.searchParams.append("customer_name", customerName)
    redirectUrl.searchParams.append("customer_email", customerEmail)
    redirectUrl.searchParams.append("customer_phone", customerPhone)
    redirectUrl.searchParams.append("callback_url", `${getBaseUrl(request)}/api/payment-callback`)

    console.log("[v0] Redirecting to WordPress payment URL:", redirectUrl.toString())

    // Update order with payment status
    await supabase
      .from("orders")
      .update({
        payment_id: orderNumber,
        payment_method: "wordpress_nexi",
      })
      .eq("id", order.id)

    return NextResponse.json({
      success: true,
      orderId: orderNumber,
      paymentUrl: redirectUrl.toString(),
    })
  } catch (error) {
    console.error("[v0] Payment creation error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "An unexpected error occurred while creating the payment",
      },
      { status: 500 },
    )
  }
}

function getBaseUrl(request: NextRequest): string {
  let baseUrl = process.env.NEXT_PUBLIC_BASE_URL

  if (!baseUrl || baseUrl.includes("localhost")) {
    const origin = request.headers.get("origin")
    const xForwardedHost = request.headers.get("x-forwarded-host")
    const host = request.headers.get("host")

    if (origin && origin !== "null") {
      baseUrl = origin
    } else if (xForwardedHost && xForwardedHost !== "null") {
      const protocol = request.headers.get("x-forwarded-proto") || "https"
      baseUrl = `${protocol}://${xForwardedHost}`
    } else if (host && host !== "null") {
      const protocol = request.headers.get("x-forwarded-proto") || "https"
      baseUrl = `${protocol}://${host}`
    } else {
      baseUrl = "http://localhost:3000"
    }
  }

  return baseUrl
}
