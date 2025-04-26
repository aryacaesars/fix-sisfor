import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { AnimatedSection } from "@/components/animated-section"

interface PricingSectionProps {
  title?: string
  subtitle?: string
}

export function PricingSection({
  title = "Start Using Our Platform Today - Completely Free",
  subtitle = "Join our growing community of users who are already benefiting from our free platform. No hidden costs, no credit card required.",
}: PricingSectionProps) {
  return (
    <AnimatedSection delay={600}>
      <section className="py-20">
        <div className="w-full max-w-[1200px] mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{title}</h1>
            <p className="max-w-[700px] text-muted-foreground md:text-xl">{subtitle}</p>
          </div>
          <div className="mx-auto w-full max-w-md space-y-2 mt-8">
            <div className="group relative flex flex-col items-center space-y-4 p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-colors duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
              <div className="relative text-center space-y-2">
                <h2 className="text-2xl font-bold text-primary">Free Forever Plan</h2>
                <p className="text-4xl font-bold">$0</p>
                <p className="text-muted-foreground">per month</p>
              </div>
              <ul className="relative space-y-2 text-left">
                <li className="flex items-center">
                  <span className="mr-2 text-primary">✓</span>
                  Unlimited access to all features
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-primary">✓</span>
                  No credit card required
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-primary">✓</span>
                  Priority support
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-primary">✓</span>
                  Regular updates and improvements
                </li>
              </ul>
              <Button className="relative bg-primary hover:bg-primary/90">
                Get Started Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-center text-muted-foreground">
              Join thousands of satisfied users who are already using our platform for free
            </p>
          </div>
        </div>
      </section>
    </AnimatedSection>
  )
}

