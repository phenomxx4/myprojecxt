"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, CreditCard, Loader2, CheckCircle, Mail, FileText } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"

interface CheckoutFormProps {
  shippingDetails: {
    fromCountry: string
    fromCity: string
    fromZip: string
    fromState?: string
    toCountry: string
    toCity: string
    toZip: string
    toState?: string
    weight: number
    length: number
    width: number
    height: number
    volumetricWeight: number
  }
  selectedQuote: {
    courier: string
    service: string
    price: number
    estimatedDays: string
  }
  onBack: () => void
}

export function CheckoutForm({ shippingDetails, selectedQuote, onBack }: CheckoutFormProps) {
  const [customerName, setCustomerName] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [fromStreet, setFromStreet] = useState("")
  const [fromHouseNumber, setFromHouseNumber] = useState("")
  const [fromPhone, setFromPhone] = useState("")
  const [toStreet, setToStreet] = useState("")
  const [toHouseNumber, setToHouseNumber] = useState("")
  const [toPhone, setToPhone] = useState("")
  const [courierNotes, setCourierNotes] = useState("")
  const [itemsDescription, setItemsDescription] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState("")
  const supabase = createBrowserClient()

  useEffect(() => {
    const loadUserData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        setCustomerEmail(user.email || "")
        setCustomerName(user.user_metadata?.full_name || "")
      }
    }

    loadUserData()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (
      !customerName ||
      !customerEmail ||
      !fromStreet ||
      !fromHouseNumber ||
      !toStreet ||
      !toHouseNumber ||
      !itemsDescription
    ) {
      setError("Please fill in all required fields")
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(customerEmail)) {
      setError("Please enter a valid email address")
      return
    }

    setIsProcessing(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const completeShippingDetails = {
        ...shippingDetails,
        fromStreet,
        fromHouseNumber,
        fromPhone,
        toStreet,
        toHouseNumber,
        toPhone,
        courierNotes,
        itemsDescription,
      }

      const response = await fetch("/api/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName,
          customerEmail,
          customerPhone,
          shippingDetails: completeShippingDetails,
          selectedQuote,
          userId: user?.id,
        }),
      })

      const contentType = response.headers.get("content-type")
      let data

      if (contentType && contentType.includes("application/json")) {
        try {
          data = await response.json()
        } catch (parseError) {
          console.error("[v0] Failed to parse JSON response:", parseError)
          throw new Error("Invalid response format from server. Please try again or contact support.")
        }
      } else {
        const textResponse = await response.text()
        console.error("[v0] Received non-JSON response:", textResponse.substring(0, 200))
        throw new Error("Server error occurred. Please check your payment gateway configuration or contact support.")
      }

      if (!response.ok) {
        const errorMessage = data.details ? `${data.error}: ${data.details}` : data.error || "Failed to create payment"
        throw new Error(errorMessage)
      }

      if (data.paymentUrl) {
        console.log("[v0] Redirecting to payment page:", data.paymentUrl)
        window.location.href = data.paymentUrl
      } else {
        throw new Error("Payment URL not received from server")
      }
    } catch (err) {
      console.error("[v0] Checkout error:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
      setIsProcessing(false)
    }
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <CreditCard className="h-6 w-6 text-accent" />
          Checkout
        </CardTitle>
        <CardDescription>Complete your shipping order</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Order Summary */}
        <div className="bg-secondary/50 p-4 rounded-lg space-y-2">
          <h3 className="font-semibold text-foreground">Order Summary</h3>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Courier:</span>
              <span className="font-medium">
                {selectedQuote.courier} - {selectedQuote.service}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Route:</span>
              <span className="font-medium">
                {shippingDetails.fromCountry} → {shippingDetails.toCountry}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Weight:</span>
              <span className="font-medium">{shippingDetails.weight} kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estimated Delivery:</span>
              <span className="font-medium">{selectedQuote.estimatedDays}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-border mt-2">
              <span className="font-semibold">Total:</span>
              <span className="text-xl font-bold text-accent">${selectedQuote.price.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Customer Information Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Customer Information</h3>

            <div className="space-y-2">
              <Label htmlFor="customer-name">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="customer-name"
                type="text"
                placeholder="John Doe"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer-email">
                Email Address <span className="text-destructive">*</span>
              </Label>
              <Input
                id="customer-email"
                type="email"
                placeholder="john@example.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer-phone">Phone Number (Optional)</Label>
              <Input
                id="customer-phone"
                type="tel"
                placeholder="+1 234 567 8900"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </div>
          </div>

          {/* Shipping Addresses */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-start gap-2 bg-blue-50 p-3 rounded-lg">
              <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground">Shipping Addresses</h3>
                <p className="text-sm text-muted-foreground">Complete the address details for pickup and delivery</p>
              </div>
            </div>

            {/* Departure Address */}
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Departure Address (Sender)</h4>

              <div className="grid md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input value={shippingDetails.fromCountry} disabled className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label>Postal Code</Label>
                  <Input value={shippingDetails.fromZip} disabled className="bg-muted" />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input value={shippingDetails.fromCity} disabled className="bg-muted" />
                </div>
                {shippingDetails.fromState && (
                  <div className="space-y-2">
                    <Label>State/Province</Label>
                    <Input value={shippingDetails.fromState} disabled className="bg-muted" />
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-3 gap-3">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="from-street">
                    Street Address <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="from-street"
                    type="text"
                    placeholder="Main Street"
                    value={fromStreet}
                    onChange={(e) => setFromStreet(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="from-house">
                    House/Apt # <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="from-house"
                    type="text"
                    placeholder="123"
                    value={fromHouseNumber}
                    onChange={(e) => setFromHouseNumber(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="from-phone">
                  Sender Phone <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="from-phone"
                  type="tel"
                  placeholder="+1 234 567 8900"
                  value={fromPhone}
                  onChange={(e) => setFromPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Arrival Address */}
            <div className="space-y-3 pt-4 border-t">
              <h4 className="font-medium text-foreground">Arrival Address (Receiver)</h4>

              <div className="grid md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input value={shippingDetails.toCountry} disabled className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label>Postal Code</Label>
                  <Input value={shippingDetails.toZip} disabled className="bg-muted" />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input value={shippingDetails.toCity} disabled className="bg-muted" />
                </div>
                {shippingDetails.toState && (
                  <div className="space-y-2">
                    <Label>State/Province</Label>
                    <Input value={shippingDetails.toState} disabled className="bg-muted" />
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-3 gap-3">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="to-street">
                    Street Address <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="to-street"
                    type="text"
                    placeholder="Main Street"
                    value={toStreet}
                    onChange={(e) => setToStreet(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="to-house">
                    House/Apt # <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="to-house"
                    type="text"
                    placeholder="456"
                    value={toHouseNumber}
                    onChange={(e) => setToHouseNumber(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="to-phone">
                  Receiver Phone <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="to-phone"
                  type="tel"
                  placeholder="+39 123 456 7890"
                  value={toPhone}
                  onChange={(e) => setToPhone(e.target.value)}
                  required
                />
              </div>

              {/* Courier Notes */}
              <div className="space-y-2">
                <Label htmlFor="courier-notes">Notes for the Courier (Optional)</Label>
                <Textarea
                  id="courier-notes"
                  placeholder="e.g., Ring doorbell twice, leave at back door, call before delivery, etc."
                  value={courierNotes}
                  onChange={(e) => setCourierNotes(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Special delivery instructions for the courier (optional)
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t">
            <Label htmlFor="items-description">
              Describe Items in Your Shipping <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="items-description"
              placeholder="e.g., Electronics, clothing, books, etc. Please provide a brief description of the items you're shipping."
              value={itemsDescription}
              onChange={(e) => setItemsDescription(e.target.value)}
              required
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              This information is required for customs and shipping documentation
            </p>
          </div>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Mail className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-2">Important: After Payment</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                    <p>
                      <strong className="text-foreground">You will receive the shipping label</strong> in your email and
                      dashboard
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <FileText className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                    <p>
                      <strong className="text-foreground">Don't forget to attach all documents</strong> we send to you
                      to the package
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="flex-1 bg-transparent"
              disabled={isProcessing}
            >
              Back
            </Button>
            <Button type="submit" className="flex-1" disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>Pay ${selectedQuote.price.toFixed(2)}</>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
