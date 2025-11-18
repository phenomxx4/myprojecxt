"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Package, AlertCircle, Check, Loader2, Truck, Clock, DollarSign } from "lucide-react"
import Image from "next/image"
import { CheckoutForm } from "./checkout-form"
import { AuthModal } from "./auth-modal"
import { createBrowserClient } from "@/lib/supabase/client"

interface ShippingQuote {
  courier: string
  service: string
  logo?: string | null
  price: number
  estimatedDays: string
  features: string[]
  easyshipRateId?: string
  deliveryTime?: {
    min: number
    max: number
  }
  serviceType?: string
  importTax?: number
  importDuty?: number
  totalTaxesDuties?: number
  isDomestic?: boolean
  deliveryMethod?: "pickup" | "dropoff"
  availableDeliveryMethods?: ("pickup" | "dropoff")[]
}

interface PostalCodeLocation {
  city: string
  state: string
  country: string
}

const countries = [
  { code: "US", name: "United States", region: "NA" },
  { code: "CA", name: "Canada", region: "NA" },
  { code: "GB", name: "United Kingdom", region: "EU" },
  { code: "DE", name: "Germany", region: "EU" },
  { code: "FR", name: "France", region: "EU" },
  { code: "IT", name: "Italy", region: "EU" },
  { code: "ES", name: "Spain", region: "EU" },
  { code: "NL", name: "Netherlands", region: "EU" },
  { code: "BE", name: "Belgium", region: "EU" },
  { code: "AT", name: "Austria", region: "EU" },
  { code: "AU", name: "Australia", region: "OC" },
  { code: "JP", name: "Japan", region: "AS" },
  { code: "CN", name: "China", region: "AS" },
  { code: "MX", name: "Mexico", region: "NA" },
  { code: "BR", name: "Brazil", region: "SA" },
]

const ZIPPOPOTAM_SUPPORTED_COUNTRIES = [
  "US",
  "CA",
  "GB",
  "DE",
  "FR",
  "IT",
  "ES",
  "NL",
  "BE",
  "AT",
  "AU",
  "JP",
  "MX",
  "BR",
]

const validateUSZip = (zip: string): boolean => {
  return /^\d{5}(-\d{4})?$/.test(zip)
}

const validateEUPostalCode = (postalCode: string, countryCode: string): boolean => {
  const patterns: Record<string, RegExp> = {
    GB: /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i,
    DE: /^\d{5}$/,
    FR: /^\d{5}$/,
    IT: /^\d{5}$/,
    ES: /^\d{5}$/,
    NL: /^\d{4}\s?[A-Z]{2}$/i,
    BE: /^\d{4}$/,
    AT: /^\d{4}$/,
    CN: /^\d{6}$/,
    JP: /^\d{3}-?\d{4}$/,
    AU: /^\d{4}$/,
    CA: /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i,
    MX: /^\d{5}$/,
    BR: /^\d{5}-?\d{3}$/,
  }

  const pattern = patterns[countryCode]
  if (!pattern) {
    return /^[A-Z0-9\s-]{3,10}$/i.test(postalCode)
  }

  return pattern.test(postalCode)
}

const hsCodeOptions = [
  { code: "42029100", name: "Travel goods, handbags, and similar items" },
  { code: "61091000", name: "T-shirts, cotton" },
  { code: "62114200", name: "Women's or girls' clothing" },
  { code: "64039900", name: "Footwear" },
  { code: "85171800", name: "Mobile phones and accessories" },
  { code: "84713000", name: "Laptops and portable computers" },
  { code: "33049900", name: "Beauty and cosmetic products" },
  { code: "95030000", name: "Toys and games" },
  { code: "49019900", name: "Books and printed materials" },
  { code: "73239300", name: "Kitchenware and tableware" },
  { code: "39269099", name: "Plastic articles" },
  { code: "63029300", name: "Bed linen, cotton" },
  { code: "90049090", name: "Eyewear and sunglasses" },
  { code: "71179000", name: "Jewelry and accessories" },
  { code: "96180000", name: "Miscellaneous manufactured articles" },
]

export function ShippingCalculator() {
  const [fromCountry, setFromCountry] = useState("")
  const [toCountry, setToCountry] = useState("")
  const [fromZip, setFromZip] = useState("")
  const [toZip, setToZip] = useState("")
  const [fromCity, setFromCity] = useState("")
  const [toCity, setToCity] = useState("")
  const [fromState, setFromState] = useState("")
  const [toState, setToState] = useState("")
  const [fromZipError, setFromZipError] = useState("")
  const [toZipError, setToZipError] = useState("")
  const [fromZipLoading, setFromZipLoading] = useState(false)
  const [toZipLoading, setToZipLoading] = useState(false)
  const [weight, setWeight] = useState("")
  const [length, setLength] = useState("")
  const [width, setWidth] = useState("")
  const [height, setHeight] = useState("")
  const [quotes, setQuotes] = useState<ShippingQuote[]>([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [selectedQuote, setSelectedQuote] = useState<ShippingQuote | null>(null)
  const [showCheckout, setShowCheckout] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [hsCode, setHsCode] = useState("96180000") // Set default HS code to 96180000
  const [customValue, setCustomValue] = useState("")
  const [priceAdjustment, setPriceAdjustment] = useState(0)
  const [adjustmentThreshold, setAdjustmentThreshold] = useState(0)
  const [minimumPrice, setMinimumPrice] = useState(0)
  const [deliveryMethods, setDeliveryMethods] = useState<Record<number, "pickup" | "dropoff">>({})
  const [pickupDate, setPickupDate] = useState("")
  const supabase = createBrowserClient()

  const [fromCityOptions, setFromCityOptions] = useState<PostalCodeLocation[]>([])
  const [toCityOptions, setToCityOptions] = useState<PostalCodeLocation[]>([])
  const [showFromCitySelect, setShowFromCitySelect] = useState(false)
  const [showToCitySelect, setShowToCitySelect] = useState(false)

  const errorRef = useRef<HTMLDivElement>(null)
  const paymentButtonRef = useRef<HTMLDivElement>(null)
  const checkoutFormRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const savedAdjustment = localStorage.getItem("adminPriceAdjustment")
    const savedThreshold = localStorage.getItem("adminAdjustmentThreshold")
    const savedMinPrice = localStorage.getItem("adminMinimumPrice")
    if (savedAdjustment) setPriceAdjustment(Number.parseFloat(savedAdjustment))
    if (savedThreshold) setAdjustmentThreshold(Number.parseFloat(savedThreshold))
    if (savedMinPrice) setMinimumPrice(Number.parseFloat(savedMinPrice))
  }, [])

  useEffect(() => {
    const savedData = localStorage.getItem("shippingCalculatorData")
    if (savedData) {
      try {
        const data = JSON.parse(savedData)
        setFromCountry(data.fromCountry || "")
        setToCountry(data.toCountry || "")
        setFromZip(data.fromZip || "")
        setToZip(data.toZip || "")
        setFromCity(data.fromCity || "")
        setToCity(data.toCity || "")
        setFromState(data.fromState || "")
        setToState(data.toState || "")
        setWeight(data.weight || "")
        setLength(data.length || "")
        setWidth(data.width || "")
        setHeight(data.height || "")
        setHsCode(data.hsCode || "96180000") // Set default HS code to 96180000
        setCustomValue(data.customValue || "")
        if (data.quotes) setQuotes(data.quotes)
        if (data.selectedQuote) setSelectedQuote(data.selectedQuote)
        // Restore pickup date
        if (data.pickupDate) setPickupDate(data.pickupDate)
        // Restore delivery methods
        if (data.deliveryMethods) setDeliveryMethods(data.deliveryMethods)
        localStorage.removeItem("shippingCalculatorData")
      } catch (err) {
        console.error("Failed to restore calculator data:", err)
      }
    }
  }, [])

  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }, [error])

  useEffect(() => {
    if (fromCountry && toCountry) {
      setIsInternational(fromCountry !== toCountry)
    } else {
      setIsInternational(false)
    }
  }, [fromCountry, toCountry])

  useEffect(() => {
    if (showCheckout) {
      setTimeout(() => {
        if (checkoutFormRef.current) {
          checkoutFormRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
        }
      }, 100)
    }
  }, [showCheckout])

  const lookupPostalCode = async (postalCode: string, countryCode: string) => {
    if (!ZIPPOPOTAM_SUPPORTED_COUNTRIES.includes(countryCode)) {
      console.log(`[v0] Postal code lookup not available for country: ${countryCode}`)
      return null
    }

    try {
      const response = await fetch(`https://api.zippopotam.us/${countryCode}/${postalCode}`)

      if (!response.ok) {
        return null
      }

      const data = await response.json()

      if (data.places && data.places.length > 0) {
        return data.places.map((place: any) => ({
          city: place["place name"] || "",
          state: place["state abbreviation"] || place["state"] || "",
          country: data["country abbreviation"] || countryCode,
        }))
      }

      return null
    } catch (err) {
      console.error("Postal code lookup error:", err)
      return null
    }
  }

  const handleFromZipChange = async (value: string) => {
    setFromZip(value)
    setFromZipError("")
    setShowFromCitySelect(false)

    if (!fromCountry || value.length < 3) {
      return
    }

    if (!ZIPPOPOTAM_SUPPORTED_COUNTRIES.includes(fromCountry)) {
      // For unsupported countries like China, just validate the format
      return
    }

    if (fromCountry === "US" && value.length === 5) {
      setFromZipLoading(true)
      const locations = await lookupPostalCode(value, fromCountry)
      setFromZipLoading(false)

      if (locations && locations.length > 0) {
        if (locations.length === 1) {
          setFromCity(locations[0].city)
          setFromState(locations[0].state)
          setFromCityOptions([])
        } else {
          setFromCityOptions(locations)
          setFromCity(locations[0].city)
          setFromState(locations[0].state)
        }
      }
    } else if (fromCountry !== "US" && value.length >= 4) {
      setFromZipLoading(true)
      const locations = await lookupPostalCode(value, fromCountry)
      setFromZipLoading(false)

      if (locations && locations.length > 0) {
        if (locations.length === 1) {
          setFromCity(locations[0].city)
          setFromState(locations[0].state)
          setFromCityOptions([])
        } else {
          setFromCityOptions(locations)
          setFromCity(locations[0].city)
          setFromState(locations[0].state)
        }
      }
    }
  }

  const handleToZipChange = async (value: string) => {
    setToZip(value)
    setToZipError("")
    setShowToCitySelect(false)

    if (!toCountry || value.length < 3) {
      return
    }

    if (!ZIPPOPOTAM_SUPPORTED_COUNTRIES.includes(toCountry)) {
      // For unsupported countries like China, just validate the format
      return
    }

    if (toCountry === "US" && value.length === 5) {
      setToZipLoading(true)
      const locations = await lookupPostalCode(value, toCountry)
      setToZipLoading(false)

      if (locations && locations.length > 0) {
        if (locations.length === 1) {
          setToCity(locations[0].city)
          setToState(locations[0].state)
          setToCityOptions([])
        } else {
          setToCityOptions(locations)
          setToCity(locations[0].city)
          setToState(locations[0].state)
        }
      }
    } else if (toCountry !== "US" && value.length >= 4) {
      setToZipLoading(true)
      const locations = await lookupPostalCode(value, toCountry)
      setToZipLoading(false)

      if (locations && locations.length > 0) {
        if (locations.length === 1) {
          setToCity(locations[0].city)
          setToState(locations[0].state)
          setToCityOptions([])
        } else {
          setToCityOptions(locations)
          setToCity(locations[0].city)
          setToState(locations[0].state)
        }
      }
    }
  }

  const calculateVolumetricWeight = (l: number, w: number, h: number, actualWeight: number) => {
    const volumetricWeight = (l * w * h) / 5000
    return Math.max(actualWeight, volumetricWeight)
  }

  const validateZipCodes = (): boolean => {
    let isValid = true
    setFromZipError("")
    setToZipError("")

    if (!fromZip) {
      setFromZipError("This field is required")
      isValid = false
    } else if (fromCountry === "US") {
      if (!validateUSZip(fromZip)) {
        setFromZipError("Invalid US ZIP code. Format: 12345 or 12345-6789")
        isValid = false
      }
    } else {
      if (!validateEUPostalCode(fromZip, fromCountry)) {
        setFromZipError("Invalid postal code format for selected country")
        isValid = false
      }
    }

    if (!toZip) {
      setToZipError("This field is required")
      isValid = false
    } else if (toCountry === "US") {
      if (!validateUSZip(toZip)) {
        setToZipError("Invalid US ZIP code. Format: 12345 or 12345-6789")
        isValid = false
      }
    } else {
      if (!validateEUPostalCode(toZip, toCountry)) {
        setToZipError("Invalid postal code format for selected country")
        isValid = false
      }
    }

    return isValid
  }

  const calculateShipping = async () => {
    setError("")
    setQuotes([])
    setSelectedQuote(null)
    setDeliveryMethods({})
    setPickupDate("")
    setLoading(true)

    if (!fromCountry || !toCountry) {
      setError("Please select both departure and arrival countries")
      setLoading(false)
      return
    }

    if (!fromCity || !toCity) {
      setError("Please enter both origin and destination cities")
      setLoading(false)
      return
    }

    if (!fromState || !toState) {
      setError("Please enter both origin and destination state/province")
      setLoading(false)
      return
    }

    if (!validateZipCodes()) {
      setLoading(false)
      return
    }

    const w = Number.parseFloat(weight)
    const l = Number.parseFloat(length)
    const wd = Number.parseFloat(width)
    const h = Number.parseFloat(height)

    if (!w || !l || !wd || !h || w <= 0 || l <= 0 || wd <= 0 || h <= 0) {
      setError("Please enter valid package dimensions and weight")
      setLoading(false)
      return
    }

    if (!Number.isInteger(w)) {
      setError("Weight must be a whole number (e.g., 1, 7, not 0.7)")
      setLoading(false)
      return
    }

    if (!Number.isInteger(l) || !Number.isInteger(wd) || !Number.isInteger(h)) {
      setError("Dimensions (length, width, height) must be whole numbers")
      setLoading(false)
      return
    }

    // Max weight: 68 kg (150 lbs), Max length: 274 cm (108 inches)
    // Max girth + length: 419 cm (165 inches)
    const maxWeight = 68 // kg
    const maxLength = 274 // cm
    const maxGirthPlusLength = 419 // cm
    const girth = 2 * (wd + h)
    const girthPlusLength = girth + l

    if (w > maxWeight) {
      setError(`Weight cannot exceed ${maxWeight} kg (150 lbs)`)
      setLoading(false)
      return
    }

    if (l > maxLength || wd > maxLength || h > maxLength) {
      setError(`No single dimension can exceed ${maxLength} cm (108 inches)`)
      setLoading(false)
      return
    }

    if (girthPlusLength > maxGirthPlusLength) {
      setError(`Girth (2 × width + 2 × height) plus length cannot exceed ${maxGirthPlusLength} cm (165 inches)`)
      setLoading(false)
      return
    }

    if (!hsCode) {
      setError("Please select an HS code for your item")
      setLoading(false)
      return
    }

    if (isInternational) {
      const declaredValue = Number.parseFloat(customValue)
      if (!declaredValue || declaredValue <= 0) {
        setError("Please enter a valid declared customs value (required for international shipments)")
        setLoading(false)
        return
      }
    }

    try {
      const requestBody = {
        fromCountry,
        fromCity,
        fromZip,
        fromState,
        toCountry,
        toCity,
        toZip,
        toState,
        weight: w,
        length: l,
        width: wd,
        height: h,
        hsCode, // Always send HS code
        declaredValue: isInternational ? Number.parseFloat(customValue) : undefined,
      }

      const response = await fetch("/api/easyship/rates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch shipping rates")
      }

      if (!data.quotes || data.quotes.length === 0) {
        setError("No shipping options available for this route")
        setLoading(false)
        return
      }

      const adjustedQuotes = data.quotes
        .map(applyPriceAdjustment)
        .filter((quote: ShippingQuote) => quote.price >= minimumPrice)

      const initialMethods: Record<number, "pickup" | "dropoff"> = {}
      adjustedQuotes.forEach((quote: ShippingQuote, index: number) => {
        if (quote.courier.toLowerCase().includes("fedex")) {
          initialMethods[index] = "dropoff" // Default to dropoff
        }
      })
      setDeliveryMethods(initialMethods)

      setQuotes(adjustedQuotes)
    } catch (err: any) {
      setError(err.message || "Failed to calculate shipping rates. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSelectShipping = (quote: ShippingQuote, index: number) => {
    const quoteWithDelivery = {
      ...quote,
      deliveryMethod: deliveryMethods[index],
    }
    setSelectedQuote(quoteWithDelivery)
    setPickupDate("")

    setTimeout(() => {
      if (paymentButtonRef.current) {
        paymentButtonRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" })
      }
    }, 100)
  }

  const handleProceedToPayment = async () => {
    if (!selectedQuote) return

    if (
      selectedQuote.courier.toLowerCase().includes("fedex") &&
      selectedQuote.deliveryMethod === "pickup" &&
      !pickupDate
    ) {
      setError("Please select a pick-up date for FedEx pick-up service")
      return
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      const calculatorData = {
        fromCountry,
        toCountry,
        fromZip,
        toZip,
        fromCity,
        toCity,
        fromState,
        toState,
        weight,
        length,
        width,
        height,
        hsCode,
        customValue,
        quotes,
        selectedQuote,
        pickupDate,
        deliveryMethods, // Save delivery method selections
      }
      localStorage.setItem("shippingCalculatorData", JSON.stringify(calculatorData))
      setShowAuthModal(true)
      return
    }

    setShowCheckout(true)
  }

  const handleBackToCalculator = () => {
    setShowCheckout(false)
  }

  const handleAuthSuccess = () => {
    setShowCheckout(true)
  }

  const applyPriceAdjustment = (quote: ShippingQuote): ShippingQuote => {
    if (priceAdjustment === 0) return quote

    if (adjustmentThreshold === 0 || quote.price < adjustmentThreshold) {
      const adjustedPrice = quote.price * (1 + priceAdjustment / 100)
      return { ...quote, price: adjustedPrice }
    }

    return quote
  }

  const getMinPickupDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split("T")[0]
  }

  const [isInternational, setIsInternational] = useState(false)

  if (showCheckout && selectedQuote) {
    return (
      <div ref={checkoutFormRef}>
        <CheckoutForm
          shippingDetails={{
            fromCountry,
            fromCity,
            fromZip,
            fromState,
            toCountry,
            toCity,
            toZip,
            toState,
            weight: Number.parseFloat(weight),
            length: Number.parseFloat(length),
            width: Number.parseFloat(width),
            height: Number.parseFloat(height),
            volumetricWeight: calculateVolumetricWeight(
              Number.parseFloat(length),
              Number.parseFloat(width),
              Number.parseFloat(height),
              Number.parseFloat(weight),
            ),
          }}
          selectedQuote={selectedQuote}
          pickupDate={pickupDate}
          onBack={handleBackToCalculator}
        />
      </div>
    )
  }

  return (
    <>
      <Card className="shadow-xl border-2">
        <CardHeader className="bg-card/50">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <div className="bg-accent/10 rounded-lg p-2">
                <Package className="h-6 w-6 text-accent" />
              </div>
              Get Your Instant Quote
            </CardTitle>
            <CardDescription className="text-base mt-2">Enter your package details</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="from-country">From Country</Label>
              <Select value={fromCountry} onValueChange={setFromCountry}>
                <SelectTrigger id="from-country">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="to-country">To Country</Label>
              <Select value={toCountry} onValueChange={setToCountry}>
                <SelectTrigger id="to-country">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {fromCountry && toCountry && (
            <>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="from-zip">From {fromCountry === "US" ? "ZIP Code" : "Postal Code"}</Label>
                  <div className="relative">
                    <Input
                      id="from-zip"
                      type="text"
                      placeholder={fromCountry === "US" ? "12345" : "Enter postal code"}
                      value={fromZip}
                      onChange={(e) => handleFromZipChange(e.target.value)}
                      className={fromZipError ? "border-destructive" : ""}
                    />
                    {fromZipLoading && (
                      <Loader2 className="h-4 w-4 animate-spin absolute right-3 top-3 text-muted-foreground" />
                    )}
                  </div>
                  {fromZipError && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {fromZipError}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {ZIPPOPOTAM_SUPPORTED_COUNTRIES.includes(fromCountry)
                      ? "City and state will auto-fill"
                      : "Please enter city and state/province manually"}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="to-zip">To {toCountry === "US" ? "ZIP Code" : "Postal Code"}</Label>
                  <div className="relative">
                    <Input
                      id="to-zip"
                      type="text"
                      placeholder={toCountry === "US" ? "12345" : "Enter postal code"}
                      value={toZip}
                      onChange={(e) => handleToZipChange(e.target.value)}
                      className={toZipError ? "border-destructive" : ""}
                    />
                    {toZipLoading && (
                      <Loader2 className="h-4 w-4 animate-spin absolute right-3 top-3 text-muted-foreground" />
                    )}
                  </div>
                  {toZipError && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {toZipError}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {ZIPPOPOTAM_SUPPORTED_COUNTRIES.includes(toCountry)
                      ? "City and state will auto-fill"
                      : "Please enter city and state/province manually"}
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="from-city">From City</Label>
                  <Input
                    id="from-city"
                    type="text"
                    placeholder="Enter city name"
                    value={fromCity}
                    onChange={(e) => setFromCity(e.target.value)}
                    onClick={() => {
                      if (fromCityOptions.length > 1) {
                        setShowFromCitySelect(!showFromCitySelect)
                      }
                    }}
                    className={fromCityOptions.length > 1 ? "cursor-pointer" : ""}
                  />
                  {fromCityOptions.length > 1 && (
                    <p className="text-xs text-muted-foreground">
                      Multiple cities found. Click to select different city.
                    </p>
                  )}
                  {showFromCitySelect && fromCityOptions.length > 1 && (
                    <div className="border rounded-md bg-card shadow-lg max-h-48 overflow-y-auto">
                      {fromCityOptions.map((location, index) => (
                        <button
                          key={index}
                          type="button"
                          className="w-full text-left px-3 py-2 hover:bg-accent/10 text-sm"
                          onClick={() => {
                            setFromCity(location.city)
                            setFromState(location.state)
                            setShowFromCitySelect(false)
                          }}
                        >
                          {location.city}, {location.state}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="to-city">To City</Label>
                  <Input
                    id="to-city"
                    type="text"
                    placeholder="Enter city name"
                    value={toCity}
                    onChange={(e) => setToCity(e.target.value)}
                    onClick={() => {
                      if (toCityOptions.length > 1) {
                        setShowToCitySelect(!showToCitySelect)
                      }
                    }}
                    className={toCityOptions.length > 1 ? "cursor-pointer" : ""}
                  />
                  {toCityOptions.length > 1 && (
                    <p className="text-xs text-muted-foreground">
                      Multiple cities found. Click to select different city.
                    </p>
                  )}
                  {showToCitySelect && toCityOptions.length > 1 && (
                    <div className="border rounded-md bg-card shadow-lg max-h-48 overflow-y-auto">
                      {toCityOptions.map((location, index) => (
                        <button
                          key={index}
                          type="button"
                          className="w-full text-left px-3 py-2 hover:bg-accent/10 text-sm"
                          onClick={() => {
                            setToCity(location.city)
                            setToState(location.state)
                            setShowToCitySelect(false)
                          }}
                        >
                          {location.city}, {location.state}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="from-state">From State/Province</Label>
                  <Input
                    id="from-state"
                    type="text"
                    placeholder="e.g., CA, NY, Ontario"
                    value={fromState}
                    onChange={(e) => setFromState(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="to-state">To State/Province</Label>
                  <Input
                    id="to-state"
                    type="text"
                    placeholder="e.g., CA, NY, Ontario"
                    value={toState}
                    onChange={(e) => setToState(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Package Details</h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="1"
                  min="1"
                  max="68"
                  placeholder="1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Whole numbers only (max 68 kg)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="length">Length (cm)</Label>
                <Input
                  id="length"
                  type="number"
                  step="1"
                  min="1"
                  max="274"
                  placeholder="1"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Whole numbers only (max 274 cm)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="width">Width (cm)</Label>
                <Input
                  id="width"
                  type="number"
                  step="1"
                  min="1"
                  max="274"
                  placeholder="1"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Whole numbers only (max 274 cm)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  step="1"
                  min="1"
                  max="274"
                  placeholder="1"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Whole numbers only (max 274 cm)</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hs-code">
                HS Code (Product Category) <span className="text-destructive">*</span>
              </Label>
              <Select value={hsCode} onValueChange={setHsCode}>
                <SelectTrigger id="hs-code">
                  <SelectValue placeholder="Select product category" />
                </SelectTrigger>
                <SelectContent>
                  {hsCodeOptions.map((option) => (
                    <SelectItem key={option.code} value={option.code}>
                      {option.code} - {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Required for all shipments. If unsure, use <strong>96180000</strong> (Miscellaneous manufactured
                articles)
              </p>
            </div>

            {isInternational && (
              <div className="space-y-2">
                <Label htmlFor="custom-value">
                  Declared Customs Value (USD) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="custom-value"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={customValue}
                  onChange={(e) => setCustomValue(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Total value for customs - all documentation handled by us
                </p>
              </div>
            )}
          </div>

          <Button onClick={calculateShipping} className="w-full" size="lg" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Finding Best Rates...
              </>
            ) : (
              <>
                <DollarSign className="h-4 w-4 mr-2" />
                Get Instant Quote
              </>
            )}
          </Button>

          {error && (
            <div ref={errorRef}>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}

          {quotes.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-border">
              <h3 className="font-semibold text-foreground text-lg">Available Shipping Options</h3>
              <div className="space-y-3">
                {quotes.map((quote, index) => {
                  const isFedEx = quote.courier.toLowerCase().includes("fedex")
                  const isUSPS = quote.courier.toLowerCase().includes("usps")
                  const selectedMethod = deliveryMethods[index]

                  return (
                    <Card
                      key={index}
                      className={`transition-all ${
                        selectedQuote === quote
                          ? "bg-accent/10 border-accent border-2"
                          : "bg-secondary/50 hover:bg-secondary/70"
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="p-2 rounded-lg bg-white flex items-center justify-center w-16 h-16 shrink-0 border border-border">
                              {quote.logo ? (
                                <Image
                                  src={quote.logo || "/placeholder.svg"}
                                  alt={quote.courier}
                                  width={48}
                                  height={48}
                                  className="object-contain"
                                />
                              ) : (
                                <div className="flex items-center justify-center w-full h-full">
                                  <span className="text-2xl font-bold text-muted-foreground">
                                    {quote.courier.charAt(0)}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-foreground">
                                {quote.courier} - {quote.service}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                <Clock className="h-4 w-4" />
                                {quote.estimatedDays}
                              </div>

                              {isFedEx && (
                                <div className="mt-3 space-y-2">
                                  <Label className="text-sm font-medium">Delivery Method:</Label>
                                  <div className="flex gap-2">
                                    <Button
                                      type="button"
                                      variant={selectedMethod === "pickup" ? "default" : "outline"}
                                      size="sm"
                                      onClick={() => {
                                        setDeliveryMethods({ ...deliveryMethods, [index]: "pickup" })
                                        if (selectedQuote?.courier === quote.courier) {
                                          setSelectedQuote({ ...quote, deliveryMethod: "pickup" })
                                        }
                                      }}
                                    >
                                      <Truck className="h-3 w-3 mr-1" />
                                      Pick-up
                                    </Button>
                                    <Button
                                      type="button"
                                      variant={selectedMethod === "dropoff" ? "default" : "outline"}
                                      size="sm"
                                      onClick={() => {
                                        setDeliveryMethods({ ...deliveryMethods, [index]: "dropoff" })
                                        if (selectedQuote?.courier === quote.courier) {
                                          setSelectedQuote({ ...quote, deliveryMethod: "dropoff" })
                                        }
                                      }}
                                    >
                                      <Package className="h-3 w-3 mr-1" />
                                      Drop-off
                                    </Button>
                                  </div>
                                  <p className="text-xs text-muted-foreground italic">
                                    Note: If you choose pick-up, you can still drop off at any FedEx location if
                                    preferred.
                                  </p>
                                </div>
                              )}

                              {isUSPS && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                                  <Package className="h-4 w-4" />
                                  Drop-off required
                                </div>
                              )}

                              <div className="flex flex-wrap gap-2 mt-2">
                                {quote.features.map((feature, i) => (
                                  <span key={i} className="text-xs bg-accent/10 text-accent px-2 py-1 rounded">
                                    {feature}
                                  </span>
                                ))}
                              </div>
                              {!quote.isDomestic &&
                                (quote.importTax || quote.importDuty || quote.totalTaxesDuties) &&
                                (quote.totalTaxesDuties ?? 0) > 0 && (
                                  <div className="mt-3 p-3 bg-accent/10 border border-accent/20 rounded-lg space-y-2">
                                    <div className="flex items-center gap-2">
                                      <div className="h-2 w-2 rounded-full bg-accent" />
                                      <div className="font-semibold text-foreground text-sm">
                                        Customs Duties & Taxes
                                      </div>
                                    </div>
                                    <div className="space-y-1 text-xs">
                                      {quote.importTax && quote.importTax > 0 && (
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Import Tax:</span>
                                          <span className="font-medium">${quote.importTax.toFixed(2)}</span>
                                        </div>
                                      )}
                                      {quote.importDuty && quote.importDuty > 0 && (
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Import Duty:</span>
                                          <span className="font-medium">${quote.importDuty.toFixed(2)}</span>
                                        </div>
                                      )}
                                      {quote.totalTaxesDuties && quote.totalTaxesDuties > 0 && (
                                        <div className="flex justify-between pt-1 border-t border-accent/20">
                                          <span className="font-semibold text-foreground">Total:</span>
                                          <span className="font-bold text-accent">
                                            ${quote.totalTaxesDuties.toFixed(2)}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                    <div className="pt-2 border-t border-accent/20">
                                      <div className="flex items-center gap-2 text-xs">
                                        <Check className="h-3 w-3 text-accent" />
                                        <span className="font-semibold text-accent">
                                          Already included in the price above
                                        </span>
                                      </div>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        No additional charges at delivery
                                      </p>
                                    </div>
                                  </div>
                                )}
                            </div>
                          </div>
                          <div className="text-right flex flex-col items-end gap-2">
                            <div>
                              <div className="text-2xl font-bold text-accent">${quote.price.toFixed(2)}</div>
                              <div className="text-xs text-muted-foreground">USD</div>
                            </div>
                            <Button
                              onClick={() => handleSelectShipping(quote, index)}
                              variant={selectedQuote === quote ? "default" : "outline"}
                              size="sm"
                              className="min-w-[100px]"
                            >
                              {selectedQuote === quote ? (
                                <>
                                  <Check className="h-4 w-4 mr-1" />
                                  Selected
                                </>
                              ) : (
                                "Select"
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {selectedQuote &&
                selectedQuote.courier.toLowerCase().includes("fedex") &&
                selectedQuote.deliveryMethod === "pickup" && (
                  <Card className="bg-accent/5 border-accent">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Truck className="h-5 w-5 text-accent" />
                          <h4 className="font-semibold text-foreground">Pick-up Date Required</h4>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="pickup-date">Select Pick-up Date</Label>
                          <Input
                            id="pickup-date"
                            type="date"
                            min={getMinPickupDate()}
                            value={pickupDate}
                            onChange={(e) => setPickupDate(e.target.value)}
                            className="max-w-xs"
                          />
                          <p className="text-xs text-muted-foreground">
                            FedEx will pick up your package on the selected date
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

              {selectedQuote && (
                <div ref={paymentButtonRef} className="pt-4 border-t border-border">
                  <Button onClick={handleProceedToPayment} className="w-full animate-pulse" size="lg">
                    Proceed to Payment - ${selectedQuote.price.toFixed(2)}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} onSuccess={handleAuthSuccess} />
    </>
  )
}
