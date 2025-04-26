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
  title = "Ciao: All-in-One Productivity Platform for Students & Freelancers",
  subtitle = "Streamline your workflow with integrated task management, project tracking, and document collaboration - designed specifically for students and freelancers.",
  imageSrc = "/placeholder.svg?height=800&width=1200",
}: HeroSectionProps) {
  return (
    <AnimatedSection>
      <section className="py-20 md:py-28">
        <div className="w-full max-w-[1200px] mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary mb-4">
              Your Ultimate Productivity Companion
            </div>
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl mb-6">{title}</h1>
            <p className="text-muted-foreground md:text-xl mb-8 max-w-2xl mx-auto">{subtitle}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="transition-all duration-200 hover:scale-105">
                Get started for free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="transition-all duration-200 hover:scale-105">
                Explore Features
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6 text-sm">
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Task & Project Tracking</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Form Templates</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Time Management</span>
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


  
