import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient()

    // Get global filter settings
    const { data: settings, error } = await supabase
      .from("global_settings")
      .select("positive_keywords, negative_keywords")
      .eq("key", "courier_filter")
      .single()

    if (error && error.code !== "PGRST116") {
      console.error("[v0] Global filter fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch global filters" }, { status: 500 })
    }

    return NextResponse.json({
      positiveKeywords: settings?.positive_keywords || [],
      negativeKeywords: settings?.negative_keywords || [],
    })
  } catch (error) {
    console.error("[v0] Global filter API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { positiveKeywords, negativeKeywords } = body

    const positiveArray = positiveKeywords
      ? positiveKeywords
          .split(",")
          .map((k: string) => k.trim())
          .filter(Boolean)
      : []

    const negativeArray = negativeKeywords
      ? negativeKeywords
          .split(",")
          .map((k: string) => k.trim())
          .filter(Boolean)
      : []

    const supabase = await getSupabaseServerClient()

    const { data: settings, error } = await supabase
      .from("global_settings")
      .upsert(
        {
          key: "courier_filter",
          positive_keywords: positiveArray,
          negative_keywords: negativeArray,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "key",
        },
      )
      .select()
      .single()

    if (error) {
      console.error("[v0] Global filter update error:", error)
      return NextResponse.json({ error: "Failed to update global filters" }, { status: 500 })
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error("[v0] Global filter update API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
