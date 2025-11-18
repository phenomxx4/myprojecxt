import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { ShippingLoader } from "@/components/shipping-loader"

const _inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SwiftShip - Shipping Calculator",
  description: "Calculate shipping costs with FedEx and USPS",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <ShippingLoader />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
