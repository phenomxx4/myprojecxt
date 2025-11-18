import { Package, Mail, MessageCircle, Phone, Clock, HelpCircle, FileText, Truck } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-accent rounded-lg p-2">
              <Package className="h-6 w-6 text-accent-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">SwiftShip</h1>
          </Link>
          <Link href="/">
            <Button variant="outline" size="sm">
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">How Can We Help You?</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our support team is here to assist you with any questions about shipping, customs, or your orders
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="border-2 hover:border-accent/50 transition-colors">
              <CardHeader>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 mb-4">
                  <Mail className="h-6 w-6 text-accent" />
                </div>
                <CardTitle>Email Support</CardTitle>
                <CardDescription>Get detailed help via email</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Send us your questions and we'll respond within 24 hours
                </p>
                <a href="mailto:support@swiftship.com" className="text-accent hover:underline font-medium">
                  support@swiftship.com
                </a>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-accent/50 transition-colors">
              <CardHeader>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 mb-4">
                  <MessageCircle className="h-6 w-6 text-accent" />
                </div>
                <CardTitle>Live Chat</CardTitle>
                <CardDescription>Chat with our team in real-time</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">Available Monday-Friday, 9 AM - 6 PM EST</p>
                <Button className="w-full">Start Chat</Button>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-accent/50 transition-colors">
              <CardHeader>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 mb-4">
                  <Phone className="h-6 w-6 text-accent" />
                </div>
                <CardTitle>Phone Support</CardTitle>
                <CardDescription>Speak directly with our team</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">Call us for urgent shipping matters</p>
                <a href="tel:+18005551234" className="text-accent hover:underline font-medium text-lg">
                  +1 (800) 555-1234
                </a>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Contact Form</CardTitle>
                <CardDescription>Send us a message and we'll get back to you soon</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" placeholder="john@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="order">Order Number (Optional)</Label>
                    <Input id="order" placeholder="ORD-123456" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="How can we help?" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" placeholder="Describe your issue or question..." rows={5} />
                  </div>
                  <Button type="submit" className="w-full">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-accent" />
                    <CardTitle>Support Hours</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monday - Friday:</span>
                    <span className="font-medium">9:00 AM - 6:00 PM EST</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Saturday:</span>
                    <span className="font-medium">10:00 AM - 4:00 PM EST</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sunday:</span>
                    <span className="font-medium">Closed</span>
                  </div>
                  <p className="text-xs text-muted-foreground pt-2">
                    Email support is available 24/7 with responses within 24 hours
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-accent" />
                    <CardTitle>Frequently Asked Questions</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-medium text-foreground mb-1">How do I track my shipment?</h4>
                    <p className="text-sm text-muted-foreground">
                      You'll receive a tracking number via email once your package ships. You can also track orders in
                      your dashboard.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Are customs duties included?</h4>
                    <p className="text-sm text-muted-foreground">
                      Yes! All our quotes include customs duties, taxes, and documentation fees. No hidden costs.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-1">What if my package is delayed?</h4>
                    <p className="text-sm text-muted-foreground">
                      Contact our support team immediately. We'll work with the carrier to resolve any delays.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-accent/5 border-accent/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-accent" />
                  <CardTitle>Documentation Help</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Need help with customs forms or shipping labels? Our team can guide you through the process.
                </p>
                <Button variant="outline" className="w-full bg-transparent">
                  View Documentation Guide
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-accent/5 border-accent/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-accent" />
                  <CardTitle>Shipping Issues</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Experiencing problems with a shipment? We're here to help resolve any carrier or delivery issues.
                </p>
                <Button variant="outline" className="w-full bg-transparent">
                  Report an Issue
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
