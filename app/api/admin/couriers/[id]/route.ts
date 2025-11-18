import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const {
      name,
      code,
      logo_url,
      is_active,
      available_for_domestic_usa,
      available_for_domestic_eu,
      available_for_international,
    } = body

    const supabase = await getSupabaseServerClient()

    const updateData: any = {}

    if (name !== undefined) updateData.name = name
    if (code !== undefined) updateData.code = code
    if (logo_url !== undefined) updateData.logo_url = logo_url
    if (is_active !== undefined) updateData.is_active = is_active
    if (available_for_domestic_usa !== undefined) updateData.available_for_domestic_usa = available_for_domestic_usa
    if (available_for_domestic_eu !== undefined) updateData.available_for_domestic_eu = available_for_domestic_eu
    if (available_for_international !== undefined) updateData.available_for_international = available_for_international

    const { data: courier, error } = await supabase.from("couriers").update(updateData).eq("id", id).select().single()

    if (error) {
      console.error("[v0] Courier update error:", error)
      return NextResponse.json({ error: "Failed to update courier" }, { status: 500 })
    }

    return NextResponse.json({ courier })
  } catch (error) {
    console.error("[v0] Courier update API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await getSupabaseServerClient()

    const { error } = await supabase.from("couriers").delete().eq("id", id)

    if (error) {
      console.error("[v0] Courier delete error:", error)
      return NextResponse.json({ error: "Failed to delete courier" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Courier delete API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
