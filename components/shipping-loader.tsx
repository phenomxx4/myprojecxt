"use client"

import { useEffect, useState } from "react"
import { Package, Truck, Box, Plane } from "lucide-react"

const loadingMessages = [
  "Your monkeys are preparing packages...",
  "Wrapping boxes with extra care...",
  "Teaching penguins to sort parcels...",
  "Calculating the speed of delivery trucks...",
  "Negotiating with carrier pigeons...",
  "Inflating bubble wrap for protection...",
  "Training hamsters to run the conveyor belts...",
  "Polishing shipping labels to perfection...",
  "Convincing planes to fly faster...",
  "Organizing boxes by cuteness level...",
  "Bribing customs officers with cookies...",
  "Teaching robots the art of gentle handling...",
  "Measuring packages with laser precision...",
  "Summoning the shipping gods...",
]

export function ShippingLoader() {
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState(loadingMessages[0])
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    const handleLoad = () => {
      setIsLoading(false)
    }

    // If page is already loaded, hide immediately
    if (document.readyState === "complete") {
      setIsLoading(false)
      return
    }

    // Listen for page load
    window.addEventListener("load", handleLoad)

    // Change message every 2 seconds
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => {
        const next = (prev + 1) % loadingMessages.length
        setMessage(loadingMessages[next])
        return next
      })
    }, 2000)

    const hideTimer = setTimeout(() => {
      setIsLoading(false)
    }, 3000)

    return () => {
      window.removeEventListener("load", handleLoad)
      clearInterval(messageInterval)
      clearTimeout(hideTimer)
    }
  }, [])

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 z-[100] bg-background flex items-center justify-center">
      <div className="text-center space-y-8 px-4">
        {/* Animated Icons */}
        <div className="relative w-32 h-32 mx-auto">
          <div className="absolute inset-0 flex items-center justify-center animate-bounce">
            <Package className="w-16 h-16 text-accent" />
          </div>
          <div
            className="absolute inset-0 flex items-center justify-center animate-spin"
            style={{ animationDuration: "3s" }}
          >
            <Truck className="w-12 h-12 text-accent/60" style={{ transform: "translateX(40px)" }} />
          </div>
          <div className="absolute inset-0 flex items-center justify-center animate-pulse">
            <Box className="w-10 h-10 text-accent/40" style={{ transform: "translate(-40px, 20px)" }} />
          </div>
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ animation: "float 2s ease-in-out infinite" }}
          >
            <Plane className="w-14 h-14 text-accent/50" style={{ transform: "translate(30px, -30px)" }} />
          </div>
        </div>

        {/* Loading Message */}
        <div className="space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground animate-pulse">Loading SwiftShip</h2>
          <p className="text-lg md:text-xl text-muted-foreground min-h-[2rem] transition-all duration-300">{message}</p>
        </div>

        {/* Loading Bar */}
        <div className="w-64 h-2 bg-muted rounded-full overflow-hidden mx-auto">
          <div
            className="h-full bg-accent rounded-full animate-loading-bar"
            style={{
              animation: "loading 3s ease-in-out forwards",
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translate(30px, -30px) translateY(0px);
          }
          50% {
            transform: translate(30px, -30px) translateY(-10px);
          }
        }
        
        @keyframes loading {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}
