import Image from "next/image"
import { AnimatedSection } from "@/components/animated-section"

interface Testimonial {
  name: string
  role: string
  company: string
  content: string
  avatarSrc: string
}

interface TestimonialsSectionProps {
  title?: string
  subtitle?: string
  testimonials?: Testimonial[]
}

export function TestimonialsSection({
  title = "Loved by teams worldwide",
  subtitle = "See what our customers have to say about how Ciao has transformed their workflow.",
  testimonials,
}: TestimonialsSectionProps) {
  const defaultTestimonials: Testimonial[] = [
    {
      name: "Sarah Johnson",
      role: "Product Manager",
      company: "Acme Inc.",
      content:
        "Ciao has completely transformed how our team collaborates. The combination of Trello's visual boards and Notion's document capabilities is exactly what we needed.",
      avatarSrc: "/placeholder.svg?height=100&width=100",
    },
    {
      name: "Michael Chen",
      role: "CTO",
      company: "StartupX",
      content:
        "We were using both Trello and Notion separately, which created silos of information. Ciao brings everything together in one place, making our team much more efficient.",
      avatarSrc: "/placeholder.svg?height=100&width=100",
    },
    {
      name: "Emily Rodriguez",
      role: "Design Lead",
      company: "CreativeStudio",
      content:
        "As a design team, we need both visual organization and detailed documentation. Ciao gives us the best of both worlds with a beautiful, intuitive interface.",
      avatarSrc: "/placeholder.svg?height=100&width=100",
    },
  ]

  const displayTestimonials = testimonials || defaultTestimonials

  return (
    <AnimatedSection delay={400}>
      <section id="testimonials" className="py-20">
        <div className="w-full max-w-[1200px] mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">Testimonials</div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{title}</h2>
            <p className="max-w-[700px] text-muted-foreground md:text-xl">{subtitle}</p>
          </div>
          <div className="mx-auto grid max-w-5xl gap-6 py-12 md:grid-cols-3">
            {displayTestimonials.map((testimonial, index) => (
              <AnimatedSection
                key={index}
                delay={500 + index * 100}
                className="flex flex-col rounded-lg border p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02]"
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-primary/10 p-1">
                    <Image
                      src={testimonial.avatarSrc || "/placeholder.svg"}
                      alt={`${testimonial.name} avatar`}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role} at {testimonial.company}
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-muted-foreground">"{testimonial.content}"</p>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>
    </AnimatedSection>
  )
}

