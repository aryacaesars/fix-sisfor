import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { AnimatedSection } from "@/components/animated-section"

interface CTASectionProps {
  title?: string
  subtitle?: string
}

export function CTASection({
  title = "Ready to transform your workflow?",
  subtitle = "Join thousands of teams already using Ciao to boost their productivity.",
}: CTASectionProps) {
  return (
    <AnimatedSection delay={600}>
      <section className="py-20">
        <div className="w-full max-w-[1200px] mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{title}</h2>
            <p className="max-w-[700px] text-muted-foreground md:text-xl">{subtitle}</p>
          </div>
          <div className="mx-auto w-full max-w-md space-y-2 mt-8">
            <form className="flex flex-col sm:flex-row gap-2">
              <Input type="email" placeholder="Enter your email" className="flex-1" />
              <Button type="submit" className="transition-all duration-200 hover:scale-105">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
            <p className="text-xs text-center text-muted-foreground">Free 14-day trial. No credit card required.</p>
          </div>
        </div>
      </section>
    </AnimatedSection>
  )
}

