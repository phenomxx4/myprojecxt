"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock, Mail, FileText, Package } from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"

function SuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")
  const [orderNumber, setOrderNumber] = useState<string | null>(null)

  useEffect(() => {
    if (orderId) {
      setOrderNumber(orderId)
    }
  }, [orderId])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-secondary/20">
      <Card className="max-w-2xl w-full shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <CardDescription>Your shipping order has been received</CardDescription>
          {orderNumber && (
            <div className="mt-2 text-sm font-mono bg-secondary/50 px-3 py-2 rounded-md inline-block">
              Order: {orderNumber}
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Manual Approval Notice */}
          <Alert className="bg-blue-50 border-blue-200">
            <Clock className="h-5 w-5 text-blue-600" />
            <AlertDescription className="text-sm">
              <div className="space-y-2">
                <p className="font-semibold text-foreground">Your order requires manual approval</p>
                <p className="text-muted-foreground">
                  Our team will review and approve your order within the next few hours. This process ensures everything
                  is correct before we generate your shipping label.
                </p>
              </div>
            </AlertDescription>
          </Alert>

          {/* What Happens Next */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground text-lg">What happens next?</h3>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
                <div className="bg-accent/10 p-2 rounded-lg shrink-0">
                  <Clock className="h-5 w-5 text-accent" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">1. Order Review</h4>
                  <p className="text-sm text-muted-foreground">
                    Our team will review your order details and approve it within a few hours
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
                <div className="bg-accent/10 p-2 rounded-lg shrink-0">
                  <Mail className="h-5 w-5 text-accent" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">2. Label Delivery</h4>
                  <p className="text-sm text-muted-foreground">
                    Once approved, your shipping label will be sent to{" "}
                    <strong>{orderNumber ? "your email" : "your registered email"}</strong> and will be available in
                    your dashboard
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
                <div className="bg-accent/10 p-2 rounded-lg shrink-0">
                  <FileText className="h-5 w-5 text-accent" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">3. Attach Documents</h4>
                  <p className="text-sm text-muted-foreground">
                    Print the shipping label and all accompanying documents we send you, then attach them securely to
                    your package
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
                <div className="bg-accent/10 p-2 rounded-lg shrink-0">
                  <Package className="h-5 w-5 text-accent" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">4. Ship Your Package</h4>
                  <p className="text-sm text-muted-foreground">
                    Drop off your package at the designated location or schedule a pickup as specified in your shipping
                    instructions
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Important Reminder */}
          <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <h4 className="font-semibold text-foreground mb-1">Important Reminder</h4>
                <p className="text-sm text-muted-foreground">
                  Make sure to attach <strong>all documents</strong> we send you to your package. Missing documents can
                  cause delays or issues with customs clearance.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Link href="/dashboard" className="flex-1">
              <Button className="w-full" variant="default">
                Go to Dashboard
              </Button>
            </Link>
            <Link href="/" className="flex-1">
              <Button className="w-full bg-transparent" variant="outline">
                Return to Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  )
}
