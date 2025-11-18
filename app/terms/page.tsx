import { Package } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function TermsPage() {
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

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold text-foreground mb-4">Terms and Conditions</h1>
        <p className="text-muted-foreground mb-8">Last updated: January 2025</p>

        <div className="prose prose-slate max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing and using SwiftShip's services, you accept and agree to be bound by the terms and provision
              of this agreement. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">2. Service Description</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              SwiftShip provides international and domestic shipping services with comprehensive customs documentation
              handling. Our services include:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Real-time shipping rate calculations from multiple carriers</li>
              <li>Complete customs documentation preparation and filing</li>
              <li>Package tracking and delivery confirmation</li>
              <li>All-inclusive pricing with duties and taxes included</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">3. User Responsibilities</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">As a user of SwiftShip, you agree to:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Provide accurate and complete shipping information</li>
              <li>Ensure packages are properly packed and labeled</li>
              <li>Comply with all applicable shipping regulations and customs laws</li>
              <li>Not ship prohibited or restricted items</li>
              <li>Attach all provided documentation to your packages</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">4. Pricing and Payment</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              All prices quoted include shipping costs, customs duties, and applicable taxes unless otherwise stated.
              Payment must be made in full before shipping labels are generated. We accept major credit cards and
              digital payment methods through our secure payment processor.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">5. Customs and Documentation</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              SwiftShip handles all customs documentation on your behalf. However, you are responsible for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Providing accurate product descriptions and values</li>
              <li>Ensuring items comply with destination country regulations</li>
              <li>Attaching all provided customs documents to your package</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">6. Prohibited Items</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              The following items are prohibited from shipment:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Hazardous materials and dangerous goods</li>
              <li>Illegal substances and contraband</li>
              <li>Perishable items without proper packaging</li>
              <li>Items restricted by carrier or destination country</li>
              <li>Weapons, ammunition, and explosives</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">7. Liability and Insurance</h2>
            <p className="text-muted-foreground leading-relaxed">
              SwiftShip acts as an intermediary between you and shipping carriers. While we strive for excellence,
              liability for lost, damaged, or delayed shipments is subject to the carrier's terms and conditions.
              Additional insurance is available for high-value items.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">8. Refunds and Cancellations</h2>
            <p className="text-muted-foreground leading-relaxed">
              Cancellations must be requested before the shipping label is generated. Once a label is created and the
              package is in transit, refunds are subject to carrier policies. Customs duties and taxes are
              non-refundable once paid.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">9. Privacy and Data Protection</h2>
            <p className="text-muted-foreground leading-relaxed">
              We collect and process personal information necessary to provide our services. Your data is protected in
              accordance with applicable data protection laws. We do not sell or share your information with third
              parties except as necessary to fulfill shipping services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">10. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              SwiftShip's liability is limited to the amount paid for shipping services. We are not liable for indirect,
              incidental, or consequential damages arising from the use of our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">11. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting
              to our website. Continued use of our services constitutes acceptance of modified terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">12. Contact Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              For questions about these terms, please contact us through our support page or email us at
              legal@swiftship.com
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground text-center">
            By using SwiftShip's services, you acknowledge that you have read, understood, and agree to be bound by
            these Terms and Conditions.
          </p>
        </div>
      </main>
    </div>
  )
}
