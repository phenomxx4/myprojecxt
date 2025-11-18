import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

function applyGlobalFilters(quotes: any[], positiveKeywords: string[], negativeKeywords: string[]) {
  return quotes.filter((quote: any) => {
    const fullName = `${quote.courier} ${quote.service}`.toLowerCase()

    // Check negative keywords first (hide if matches)
    if (negativeKeywords.length > 0) {
      const hasNegativeMatch = negativeKeywords.some((keyword: string) => fullName.includes(keyword.toLowerCase()))
      if (hasNegativeMatch) return false
    }

    // Check positive keywords (show only if matches, or if no positive keywords set)
    if (positiveKeywords.length > 0) {
      const hasPositiveMatch = positiveKeywords.some((keyword: string) => fullName.includes(keyword.toLowerCase()))
      return hasPositiveMatch
    }

    return true
  })
}

function filterByAvailableCouriers(quotes: any[], destinationCountry: string) {
  const country = destinationCountry.toLowerCase()

  const filtered = quotes.filter((quote: any) => {
    const courierName = quote.courier.toLowerCase()
    const serviceName = quote.service.toLowerCase()

    if (country === "us") {
      if (courierName.includes("fedex")) {
        return serviceName.includes("priority") || serviceName.includes("priority express")
      }
      if (courierName.includes("usps")) {
        return serviceName.includes("priority") || serviceName.includes("ground")
      }
      if (courierName.includes("cap") || courierName.includes("china post")) {
        return true
      }
      return false
    }

    if (courierName.includes("cap") || courierName.includes("china post")) {
      return true
    }
    return courierName.includes("fedex")
  })

  return filtered
}

function isEUCountry(countryCode: string): boolean {
  const euCountries = [
    "AT",
    "BE",
    "BG",
    "HR",
    "CY",
    "CZ",
    "DK",
    "EE",
    "FI",
    "FR",
    "DE",
    "GR",
    "HU",
    "IE",
    "IT",
    "LV",
    "LT",
    "LU",
    "MT",
    "NL",
    "PL",
    "PT",
    "RO",
    "SK",
    "SI",
    "ES",
    "SE",
  ]
  return euCountries.includes(countryCode.toUpperCase())
}

function shouldApplyCustomsDuties(fromCountry: string, toCountry: string, isDomestic: boolean): boolean {
  if (isDomestic) return false

  // No customs duties for EU to EU shipments
  if (isEUCountry(fromCountry) && isEUCountry(toCountry)) {
    return false
  }

  return true
}

async function fetchSendParcelRates(
  fromCountry: string,
  fromCity: string,
  fromZip: string,
  fromState: string | undefined,
  toCountry: string,
  toCity: string,
  toZip: string,
  toState: string | undefined,
  weight: number,
  length: number,
  width: number,
  height: number,
): Promise<any[] | null> {
  try {
    console.log("[v0] Attempting SendParcel API as secondary fallback")

    const sendParcelPayload = {
      from: {
        country: fromCountry,
        city: fromCity,
        postal_code: fromZip,
        state: fromState,
      },
      to: {
        country: toCountry,
        city: toCity,
        postal_code: toZip,
        state: toState,
      },
      parcel: {
        weight: weight,
        length: length,
        width: width,
        height: height,
      },
    }

    // Note: Replace with actual SendParcel API endpoint and key when available
    const sendParcelUrl = "https://api.sendparcel.com/v1/rates"
    const sendParcelApiKey = process.env.SENDPARCEL_API_KEY

    if (!sendParcelApiKey) {
      console.log("[v0] SendParcel API key not configured, skipping")
      return null
    }

    const response = await fetch(sendParcelUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sendParcelApiKey}`,
      },
      body: JSON.stringify(sendParcelPayload),
    })

    if (!response.ok) {
      console.log("[v0] SendParcel API returned error:", response.status)
      return null
    }

    const data = await response.json()

    // Transform SendParcel response to our format
    const quotes = data.rates?.map((rate: any) => ({
      courier: rate.carrier_name || "Unknown",
      service: rate.service_name || "Standard",
      logo: rate.carrier_logo || null,
      price: Number.parseFloat(rate.total_price || rate.shipment_charge || 0),
      estimatedDays: rate.delivery_days ? `${rate.delivery_days} business days` : "Varies",
      deliveryTime: {
        min: rate.min_delivery_days || 1,
        max: rate.max_delivery_days || 5,
      },
      serviceType: rate.pickup_available ? "Pickup available" : "Drop-off required",
      availableDeliveryMethods: rate.delivery_methods || ["dropoff"],
      importTax: rate.import_tax ? Number.parseFloat(rate.import_tax) : 0,
      importDuty: rate.import_duty ? Number.parseFloat(rate.import_duty) : 0,
      totalTaxesDuties: (rate.import_tax || 0) + (rate.import_duty || 0),
      features: [
        rate.tracking_included ? "Tracking included" : null,
        rate.insurance_available ? "Insurance available" : null,
      ].filter(Boolean),
      easyshipRateId: `sendparcel-${rate.service_id}`,
      isDomestic: fromCountry === toCountry,
    }))

    console.log("[v0] SendParcel API returned", quotes?.length || 0, "quotes")
    return quotes || []
  } catch (error) {
    console.log("[v0] SendParcel API error:", error)
    return null
  }
}

function generateMockQuotes(
  weight: number,
  length: number,
  width: number,
  height: number,
  isDomestic: boolean,
  destinationCountry: string,
  fromCountry: string,
) {
  // Calculate volumetric weight (dimensional weight)
  // Formula: (L × W × H) / 5000 for cm and kg (standard for FedEx, UPS, DHL)
  const volumetricWeight = (length * width * height) / 5000

  // Chargeable weight is the greater of actual weight or volumetric weight
  const chargeableWeight = Math.max(weight, volumetricWeight)

  console.log(
    `[v0] Pricing calculation - Actual: ${weight}kg, Volumetric: ${volumetricWeight.toFixed(2)}kg, Chargeable: ${chargeableWeight.toFixed(2)}kg`,
  )

  const baseRates = {
    fedexPriority: isDomestic ? 5.5 : 15.0, // Changed from 12.0 to 15.0 for international
    fedexExpress: isDomestic ? 7.5 : 12.0, // Changed from 15.0 to 12.0 for international
    uspsPriority: isDomestic ? 4.0 : 10.0,
    uspsGround: isDomestic ? 3.0 : 8.0,
  }

  const fuelSurchargeRate = 0.08

  // Calculate base prices using chargeable weight
  const calculatePrice = (ratePerKg: number, serviceMultiplier = 1.0) => {
    const basePrice = chargeableWeight * ratePerKg * serviceMultiplier
    const fuelSurcharge = basePrice * fuelSurchargeRate
    const totalPrice = basePrice + fuelSurcharge

    const handlingFee = isDomestic ? 0 : 2.5

    return totalPrice + handlingFee
  }

  const addPriceVariation = (price: number): number => {
    // Add realistic decimal variations
    const variations = [0.17, 0.24, 0.33, 0.47, 0.56, 0.68, 0.73, 0.89, 0.92]
    const randomVariation = variations[Math.floor(Math.random() * variations.length)]
    return Math.floor(price) + randomVariation
  }

  const applyDuties = shouldApplyCustomsDuties(fromCountry, destinationCountry, isDomestic)

  const calculateDutiesAndTaxes = (basePrice: number) => {
    if (!applyDuties) {
      return { importTax: 0, importDuty: 0, totalTaxesDuties: 0 }
    }

    // Reduced import tax from 15% to 10%
    const importTax = basePrice * 0.1
    // Reduced import duty from 6% to 4%
    const importDuty = basePrice * 0.04
    const totalTaxesDuties = importTax + importDuty

    return { importTax, importDuty, totalTaxesDuties }
  }

  const fedexPriorityPrice = addPriceVariation(calculatePrice(baseRates.fedexPriority, 1.0))
  const fedexExpressPrice = addPriceVariation(calculatePrice(baseRates.fedexExpress, 1.0))
  const uspsPriorityPrice = addPriceVariation(calculatePrice(baseRates.uspsPriority, 1.0))
  const uspsGroundPrice = addPriceVariation(calculatePrice(baseRates.uspsGround, 1.0))

  const allQuotes = [
    {
      courier: "FedEx",
      service: isDomestic ? "Priority" : "International Priority",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/FedEx_Express.svg/320px-FedEx_Express.svg.png",
      price: fedexPriorityPrice,
      estimatedDays: "1-3 business days",
      deliveryTime: { min: 1, max: 3 },
      serviceType: "Pick-up or Drop-off available",
      availableDeliveryMethods: ["pickup", "dropoff"],
      ...calculateDutiesAndTaxes(fedexPriorityPrice),
      features: ["Tracking included", "Signature required", applyDuties ? "Duties included" : null].filter(Boolean),
      easyshipRateId: isDomestic ? "mock-fedex-priority" : "mock-fedex-intl-priority",
      isDomestic,
    },
    {
      courier: "FedEx",
      service: isDomestic ? "Priority Express" : "International Economy",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/FedEx_Express.svg/320px-FedEx_Express.svg.png",
      price: fedexExpressPrice,
      estimatedDays: isDomestic ? "1-2 business days" : "3-5 business days",
      deliveryTime: { min: isDomestic ? 1 : 3, max: isDomestic ? 2 : 5 },
      serviceType: "Pick-up or Drop-off available",
      availableDeliveryMethods: ["pickup", "dropoff"],
      ...calculateDutiesAndTaxes(fedexExpressPrice),
      features: [
        "Tracking included",
        isDomestic ? "Fastest option" : null,
        isDomestic ? "Signature required" : null,
        applyDuties ? "Duties included" : null,
      ].filter(Boolean),
      easyshipRateId: isDomestic ? "mock-fedex-priority-express" : "mock-fedex-intl-economy",
      isDomestic,
    },
    {
      courier: "USPS",
      service: "Priority Mail",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/United_States_Postal_Service_Logo.svg/320px-United_States_Postal_Service_Logo.svg.png",
      price: uspsPriorityPrice,
      estimatedDays: "2-3 business days",
      deliveryTime: { min: 2, max: 3 },
      serviceType: "Drop-off required",
      availableDeliveryMethods: ["dropoff"],
      ...calculateDutiesAndTaxes(uspsPriorityPrice),
      features: ["Tracking included", "Affordable option", applyDuties ? "Duties included" : null].filter(Boolean),
      easyshipRateId: "mock-usps-priority",
      isDomestic,
    },
    {
      courier: "USPS",
      service: "Ground Advantage",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/United_States_Postal_Service_Logo.svg/320px-United_States_Postal_Service_Logo.svg.png",
      price: uspsGroundPrice,
      estimatedDays: "3-5 business days",
      deliveryTime: { min: 3, max: 5 },
      serviceType: "Drop-off required",
      availableDeliveryMethods: ["dropoff"],
      ...calculateDutiesAndTaxes(uspsGroundPrice),
      features: ["Tracking included", "Most affordable", applyDuties ? "Duties included" : null].filter(Boolean),
      easyshipRateId: "mock-usps-ground",
      isDomestic,
    },
  ]

  const quotesWithDiscount = allQuotes.map((quote) => {
    const totalPrice = quote.price + quote.importTax + quote.importDuty
    if (totalPrice > 140) {
      const discountedPrice = quote.price * 0.75
      const discountedTax = quote.importTax * 0.75
      const discountedDuty = quote.importDuty * 0.75

      return {
        ...quote,
        price: discountedPrice,
        importTax: discountedTax,
        importDuty: discountedDuty,
        totalTaxesDuties: discountedTax + discountedDuty,
      }
    }
    return quote
  })

  return filterByAvailableCouriers(quotesWithDiscount, destinationCountry)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      fromCountry,
      fromCity,
      fromZip,
      fromState,
      toCountry,
      toCity,
      toZip,
      toState,
      weight,
      length,
      width,
      height,
      hsCode,
      declaredValue,
    } = body

    if (
      !fromCountry ||
      !fromCity ||
      !fromZip ||
      !toCountry ||
      !toCity ||
      !toZip ||
      !weight ||
      !length ||
      !width ||
      !height
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const isDomestic = fromCountry === toCountry

    let positiveKeywords: string[] = []
    let negativeKeywords: string[] = []

    try {
      const supabase = await getSupabaseServerClient()
      const { data: settings, error } = await supabase
        .from("global_settings")
        .select("positive_keywords, negative_keywords")
        .eq("key", "courier_filter")
        .maybeSingle()

      if (error) {
        console.log("[v0] Could not fetch courier filters from global_settings:", error.message)
      } else if (settings) {
        positiveKeywords = Array.isArray(settings.positive_keywords) ? settings.positive_keywords : []
        negativeKeywords = Array.isArray(settings.negative_keywords) ? settings.negative_keywords : []
      }
    } catch (error) {
      console.log("[v0] global_settings table not available, using destination-based filtering only")
    }

    const finalDeclaredValue = declaredValue || (Number.parseFloat(weight) * 10).toString()
    const finalHsCode = hsCode || "96180000"

    console.log("[v0] Attempting Easyship API (primary)")
    const easyshipPayload: any = {
      origin_address: {
        line_1: "Main Street 1",
        city: fromCity,
        postal_code: fromZip,
        country_alpha2: fromCountry,
      },
      destination_address: {
        line_1: "Delivery Address 1",
        city: toCity,
        postal_code: toZip,
        country_alpha2: toCountry,
      },
      parcels: [
        {
          total_actual_weight: Number.parseFloat(weight),
          box: {
            length: Number.parseFloat(length),
            width: Number.parseFloat(width),
            height: Number.parseFloat(height),
          },
          items: [
            {
              actual_weight: Number.parseFloat(weight),
              declared_currency: "USD",
              declared_customs_value: Number.parseFloat(finalDeclaredValue),
              hs_code: finalHsCode,
              quantity: 1,
              description: "Package",
            },
          ],
        },
      ],
    }

    if (fromState) {
      easyshipPayload.origin_address.state = fromState
    }
    if (toState) {
      easyshipPayload.destination_address.state = toState
    }

    if (!isDomestic) {
      easyshipPayload.incoterms = "DDP"
    }

    const easyshipUrl = "https://public-api.easyship.com/2024-09/rates"
    const apiKey = "prod_gM002a3z/6C+cLJm/haTcRch7SuOywmWnKxogO0OGG8="

    const response = await fetch(easyshipUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(easyshipPayload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.log("[v0] Easyship API failed, using mock fallback (20% reduced prices)")

      const mockQuotes = generateMockQuotes(
        Number.parseFloat(weight),
        Number.parseFloat(length),
        Number.parseFloat(width),
        Number.parseFloat(height),
        isDomestic,
        toCountry,
        fromCountry,
      )
      const filteredMockQuotes = applyGlobalFilters(mockQuotes, positiveKeywords, negativeKeywords)

      if (filteredMockQuotes.length === 0) {
        console.log("[v0] All mock quotes filtered out, returning unfiltered fallback")
        return NextResponse.json({ quotes: mockQuotes })
      }

      return NextResponse.json({ quotes: filteredMockQuotes })
    }

    const data = await response.json()

    const quotes =
      data.rates?.map((rate: any) => {
        const courierName = rate.courier_service?.umbrella_name || rate.courier_service?.name || "Unknown"
        const serviceName = rate.courier_service?.name || "Standard"

        return {
          courier: courierName,
          service: serviceName,
          logo: rate.courier_service?.logo || null,
          price: Number.parseFloat(rate.total_charge || rate.shipment_charge || 0),
          estimatedDays: rate.min_delivery_time
            ? `${rate.min_delivery_time}-${rate.max_delivery_time} business days`
            : "Varies",
          deliveryTime: {
            min: rate.min_delivery_time || 1,
            max: rate.max_delivery_time || 5,
          },
          serviceType: rate.available_handover_options?.includes("free_pickup")
            ? "Free pickup available"
            : rate.available_handover_options?.includes("pickup")
              ? "Pickup available"
              : rate.available_handover_options?.includes("dropoff")
                ? "Drop-off required"
                : "Standard delivery",
          availableDeliveryMethods: rate.available_handover_options || [],
          importTax: rate.estimated_import_tax ? Number.parseFloat(rate.estimated_import_tax) : 0,
          importDuty: rate.estimated_import_duty ? Number.parseFloat(rate.estimated_import_duty) : 0,
          totalTaxesDuties:
            (rate.import_tax_charge ? Number.parseFloat(rate.import_tax_charge) : 0) +
            (rate.import_duty_charge ? Number.parseFloat(rate.import_duty_charge) : 0),
          features: [
            rate.tracking_rating && rate.tracking_rating > 0 ? "Tracking included" : null,
            rate.courier_remarks || null,
            !isDomestic && rate.incoterms === "DDU" ? "Duties paid by receiver" : null,
            !isDomestic && rate.incoterms === "DDP" ? "Duties included" : null,
            rate.insurance_fee && Number.parseFloat(rate.insurance_fee) > 0 ? "Insurance available" : null,
          ].filter(Boolean),
          easyshipRateId: rate.courier_service?.courier_id,
          isDomestic,
        }
      }) || []

    const filteredQuotes = filterByAvailableCouriers(quotes, toCountry)
    const finalFilteredQuotes = applyGlobalFilters(filteredQuotes, positiveKeywords, negativeKeywords)

    if (finalFilteredQuotes.length === 0) {
      console.log("[v0] All Easyship quotes filtered out, using mock fallback")
      const mockQuotes = generateMockQuotes(
        Number.parseFloat(weight),
        Number.parseFloat(length),
        Number.parseFloat(width),
        Number.parseFloat(height),
        isDomestic,
        toCountry,
        fromCountry,
      )
      const filteredMockQuotes = applyGlobalFilters(mockQuotes, positiveKeywords, negativeKeywords)

      if (filteredMockQuotes.length === 0) {
        console.log("[v0] All mock quotes also filtered out, returning unfiltered fallback")
        return NextResponse.json({ quotes: mockQuotes })
      }

      return NextResponse.json({ quotes: filteredMockQuotes })
    }

    console.log("[v0] Returning Easyship API results")
    return NextResponse.json({ quotes: finalFilteredQuotes })
  } catch (error: any) {
    console.error("[v0] Easyship API route error:", error)

    const mockQuotes = generateMockQuotes(5, 30, 20, 15, true, "US", "US")
    return NextResponse.json({ quotes: mockQuotes })
  }
}
