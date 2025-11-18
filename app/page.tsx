import { ShippingCalculator } from "@/components/shipping-calculator"
import {
  Package,
  Shield,
  Star,
  CheckCircle,
  Lock,
  DollarSign,
  FileText,
  Zap,
  Users,
  TrendingUp,
  Award,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import Image from "next/image"

export default async function HomePage() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-accent rounded-lg p-2">
              <Package className="h-6 w-6 text-accent-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">SwiftShip</h1>
          </div>
          <nav className="flex items-center gap-4">
            <a
              href="#calculator"
              className="text-sm font-medium text-foreground hover:text-accent transition-colors hidden md:inline"
            >
              Calculate
            </a>
            <a
              href="#services"
              className="text-sm font-medium text-muted-foreground hover:text-accent transition-colors hidden md:inline"
            >
              Services
            </a>
            {user ? (
              <>
                <Link href={user.email === "phenomxx4@gmail.com" ? "/admin" : "/dashboard"}>
                  <Button variant="outline" size="sm">
                    {user.email === "phenomxx4@gmail.com" ? "Admin Dashboard" : "My Dashboard"}
                  </Button>
                </Link>
                <form action="/api/auth/logout" method="POST" className="inline">
                  <Button variant="ghost" size="sm" type="submit">
                    Logout
                  </Button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <section className="bg-gradient-to-b from-accent/5 via-background to-background py-20 border-background my-0 md:py-10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <Badge variant="secondary" className="mb-6 text-lg md:text-xl px-6 py-3">
              <DollarSign className="h-5 w-5 md:h-6 md:w-6 mr-2" />
              Save up to 75% on international shipments
            </Badge>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 text-balance leading-tight">
              Ship Big. Save Bigger.
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground text-pretty leading-relaxed max-w-3xl mx-auto">
              We handle all customs documentation so you can focus on your business. Get instant quotes and save
              especially on large shipments with our pre-negotiated discount.
            </p>
          </div>

          <div id="calculator" className="max-w-4xl mx-auto">
            <ShippingCalculator />
          </div>
        </div>
      </section>

      <section className="py-12 bg-gradient-to-r from-accent/10 via-accent/5 to-accent/10 border-y-2 border-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/20 mb-4">
              <Shield className="h-8 w-8 text-accent" />
            </div>
            <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">All-Inclusive Pricing</h3>
            <p className="text-xl md:text-2xl text-foreground font-semibold mb-2">
              Custom Duty and Taxes Always Included
            </p>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              No surprises, no hidden fees. Every quote includes all customs duties, import taxes, and documentation
              fees. What you see is what you pay.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
              Why Businesses Choose SwiftShip
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We make international shipping simple, affordable, and completely hassle-free
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="bg-background border-2 hover:border-accent/50 transition-colors">
              <CardContent className="pt-8 pb-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-6">
                  <DollarSign className="h-8 w-8 text-accent" />
                </div>
                <h4 className="text-2xl font-bold text-foreground mb-3">Massive Savings</h4>
                <p className="text-muted-foreground leading-relaxed">
                  Save up to 75% on big shipments with our negotiated carrier rates. The larger your shipment, the more
                  you save.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background border-2 hover:border-accent/50 transition-colors">
              <CardContent className="pt-8 pb-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-6">
                  <FileText className="h-8 w-8 text-accent" />
                </div>
                <h4 className="text-2xl font-bold text-foreground mb-3">Hassle-Free Customs</h4>
                <p className="text-muted-foreground leading-relaxed">
                  We handle all customs documentation and clearance. No paperwork headaches, no delays, no stress.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background border-2 hover:border-accent/50 transition-colors">
              <CardContent className="pt-8 pb-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-6">
                  <Zap className="h-8 w-8 text-accent" />
                </div>
                <h4 className="text-2xl font-bold text-foreground mb-3">Instant Quotes</h4>
                <p className="text-muted-foreground leading-relaxed">
                  Get real-time shipping rates from multiple carriers in seconds. Compare and choose the best option for
                  your needs.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-8 bg-secondary/30 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-foreground">Secure Payments</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-accent" />
              <span className="text-sm font-medium text-foreground">Customs Handled</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-foreground">Verified Couriers</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-medium text-foreground">5-Star Rated</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Real Savings, Real Stories</h3>
            <p className="text-lg text-muted-foreground">
              See how businesses are saving thousands on international shipping
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card className="bg-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar>
                    <AvatarImage src="/professional-businessman-portrait.jpg" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-foreground">John Davis</div>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Saved over <strong className="text-accent">$2,400 on a bulk shipment to Europe</strong>. The customs
                  documentation was handled perfectly - no delays at all!
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar>
                    <AvatarImage src="/professional-woman-smiling.png" />
                    <AvatarFallback>SM</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-foreground">Sarah Martinez</div>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  The customs paperwork used to be a nightmare. Now{" "}
                  <strong className="text-accent">SwiftShip handles everything</strong> and I save 40% on every
                  international order.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar>
                    <AvatarImage src="/professional-asian-business-man-smiling.jpg" />
                    <AvatarFallback>MK</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-foreground">Michael Kim</div>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  For large shipments, the savings are incredible.{" "}
                  <strong className="text-accent">Cut my shipping costs by $5,000 last quarter</strong> alone. Game
                  changer!
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <Badge variant="secondary" className="text-lg px-6 py-3">
              <DollarSign className="h-5 w-5 text-accent mr-2" />
              Average savings: 60-75% on bulk international shipments
            </Badge>
          </div>
        </div>
      </section>

      <section id="services" className="py-16 md:py-24 bg-gradient-to-b from-accent/5 to-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
              Trusted by Thousands of Businesses Worldwide
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join the growing community of businesses saving money and time with SwiftShip
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <Card className="bg-background border-2 hover:border-accent/50 transition-all hover:scale-105">
              <CardContent className="pt-8 pb-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-4">
                  <Users className="h-8 w-8 text-accent" />
                </div>
                <div className="text-4xl font-bold text-foreground mb-2">10,000+</div>
                <p className="text-sm text-muted-foreground font-medium">Satisfied Clients</p>
              </CardContent>
            </Card>

            <Card className="bg-background border-2 hover:border-accent/50 transition-all hover:scale-105">
              <CardContent className="pt-8 pb-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-4">
                  <TrendingUp className="h-8 w-8 text-accent" />
                </div>
                <div className="text-4xl font-bold text-foreground mb-2">500+</div>
                <p className="text-sm text-muted-foreground font-medium">Businesses Saving Daily</p>
              </CardContent>
            </Card>

            <Card className="bg-background border-2 hover:border-accent/50 transition-all hover:scale-105">
              <CardContent className="pt-8 pb-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-4">
                  <Package className="h-8 w-8 text-accent" />
                </div>
                <div className="text-4xl font-bold text-foreground mb-2">50,000+</div>
                <p className="text-sm text-muted-foreground font-medium">Packages Delivered</p>
              </CardContent>
            </Card>

            <Card className="bg-background border-2 hover:border-accent/50 transition-all hover:scale-105">
              <CardContent className="pt-8 pb-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-4">
                  <Award className="h-8 w-8 text-accent" />
                </div>
                <div className="text-4xl font-bold text-foreground mb-2">98%</div>
                <p className="text-sm text-muted-foreground font-medium">Customer Satisfaction</p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <p className="text-lg text-muted-foreground mb-6 max-w-3xl mx-auto">
              Our clients have saved over <strong className="text-accent text-xl">$2.5 Million</strong> in shipping
              costs and countless hours on customs paperwork
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-foreground">Zero Customs Delays</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-medium text-foreground">4.9/5 Average Rating</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-accent" />
                <span className="text-sm font-medium text-foreground">100% Documentation Accuracy</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t bg-card py-12 border-card-foreground">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-accent rounded-lg p-2">
                  <Package className="h-5 w-5 text-accent-foreground" />
                </div>
                <span className="text-lg font-bold text-foreground">SwiftShip</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your trusted partner for affordable international shipping with hassle-free customs documentation.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#calculator" className="hover:text-accent transition-colors">
                    Calculate Shipping
                  </a>
                </li>
                <li>
                  <a href="#services" className="hover:text-accent transition-colors">
                    Our Services
                  </a>
                </li>
                <li>
                  <Link href="/support" className="hover:text-accent transition-colors">
                    Support
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-accent transition-colors">
                    Terms & Conditions
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Secure Payments</h4>
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <Image src="/apple-pay-logo.png" alt="Apple Pay" width={50} height={32} className="object-contain" />
                <Image
                  src="/images/design-mode/Google_Pay_Acceptance_Mark.svg.png"
                  alt="Google Pay"
                  width={50}
                  height={32}
                  className="object-contain"
                />
                <Image
                  src="/images/design-mode/visa-logo-png_seeklogo-149692.png"
                  alt="Visa"
                  width={50}
                  height={32}
                  className="object-contain"
                />
                <Image
                  src="/images/design-mode/avj1gvq2u.png.webp"
                  alt="Mastercard"
                  width={50}
                  height={32}
                  className="object-contain"
                />
                <Image
                  src="/images/design-mode/American-Express-PNG-Transparent-Image.png"
                  alt="American Express"
                  width={50}
                  height={32}
                  className="object-contain"
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Lock className="h-4 w-4 text-green-600" />
                <span>Secure SSL encrypted payments</span>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 SwiftShip. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
