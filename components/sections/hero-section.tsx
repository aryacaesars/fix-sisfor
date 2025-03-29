import Image from "next/image"
import { Button } from "@/components/ui/button"
import { CheckCircle, ArrowRight } from "lucide-react"
import { AnimatedSection } from "@/components/animated-section"

interface HeroSectionProps {
  title?: string
  subtitle?: string
  imageSrc?: string
}

export function HeroSection({
  title = "Where Trello meets Notion for ultimate productivity",
  subtitle = "Organize your work, manage your projects, and collaborate with your team - all in one beautiful workspace.",
  imageSrc = "/placeholder.svg?height=800&width=1200",
}: HeroSectionProps) {
  return (
    <AnimatedSection>
      <section className="py-20 md:py-28">
        <div className="w-full max-w-[1200px] mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary mb-4">
              Introducing Ciao
            </div>
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl mb-6">{title}</h1>
            <p className="text-muted-foreground md:text-xl mb-8 max-w-2xl mx-auto">{subtitle}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="transition-all duration-200 hover:scale-105">
                Get Started for Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="transition-all duration-200 hover:scale-105">
                Watch Demo
              </Button>
            </div>
            <div className="flex items-center justify-center gap-6 mt-6 text-sm">
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Free 14-day trial</span>
              </div>
            </div>
          </div>
          <div className="flex justify-center mt-12">
            <div className="relative w-full max-w-4xl h-[400px] rounded-lg overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-primary/20 hover:scale-[1.02]">
              <Image
                src={imageSrc || "/placeholder.svg"}
                alt="Ciao dashboard preview"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>
    </AnimatedSection>
  )
}

