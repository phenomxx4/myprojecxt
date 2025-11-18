"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CreditCard, Loader2 } from "lucide-react"

interface XPayBuildFormProps {
  buildData: any
  orderId: string
  operationId: string
}

export function XPayBuildForm({ buildData, orderId, operationId }: XPayBuildFormProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!buildData || !containerRef.current) {
      setError("Payment form data is missing")
      setIsLoading(false)
      return
    }

    try {
      console.log("[v0] Initializing XPay Build form")

      // XPay Build returns HTML/JavaScript that needs to be injected
      if (buildData.html) {
        containerRef.current.innerHTML = buildData.html

        // Execute any scripts in the HTML
        const scripts = containerRef.current.getElementsByTagName("script")
        for (let i = 0; i < scripts.length; i++) {
          const script = scripts[i]
          const newScript = document.createElement("script")
          if (script.src) {
            newScript.src = script.src
          } else {
            newScript.textContent = script.textContent
          }
          document.body.appendChild(newScript)
        }
      }

      setIsLoading(false)
    } catch (err) {
      console.error("[v0] Error initializing XPay Build:", err)
      setError("Failed to initialize payment form")
      setIsLoading(false)
    }
  }, [buildData])

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <CreditCard className="h-6 w-6 text-accent" />
          Complete Payment
        </CardTitle>
        <CardDescription>Enter your payment details securely</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-secondary/50 p-4 rounded-lg space-y-2">
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order ID:</span>
              <span className="font-medium">{orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment ID:</span>
              <span className="font-medium">{operationId}</span>
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
            <span className="ml-3 text-muted-foreground">Loading payment form...</span>
          </div>
        )}

        <div ref={containerRef} className="min-h-[400px]" />

        <div className="text-xs text-muted-foreground text-center pt-4 border-t">
          <p>Your payment is secured by Nexi XPay. Card details are encrypted and never stored on our servers.</p>
        </div>
      </CardContent>
    </Card>
  )
}
