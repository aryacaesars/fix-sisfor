import { Layers, Calendar, Users, Search, Clock, Shield, type LucideIcon } from "lucide-react"
import { AnimatedSection } from "@/components/animated-section"

interface Feature {
  icon: LucideIcon
  title: string
  description: string
}

interface FeaturesSectionProps {
  title?: string
  subtitle?: string
  features?: Feature[]
}

export function FeaturesSection({
  title = "Everything you need in one place",
  subtitle = "Ciao combines the best of Trello's visual task management with Notion's powerful document capabilities.",
  features,
}: FeaturesSectionProps) {
  const defaultFeatures: Feature[] = [
    {
      icon: Layers,
      title: "Kanban Boards",
      description: "Visualize your workflow with customizable boards, lists, and cards just like Trello.",
    },
    {
      icon: Calendar,
      title: "Rich Documents",
      description: "Create beautiful, functional documents with our powerful editor inspired by Notion.",
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Work together in real-time with comments, mentions, and shared workspaces.",
    },
    {
      icon: Search,
      title: "Powerful Search",
      description: "Find anything instantly with our advanced search capabilities across all content.",
    },
    {
      icon: Clock,
      title: "Time Tracking",
      description: "Track time spent on tasks and projects to improve productivity and billing.",
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Keep your data safe with advanced security features and compliance controls.",
    },
  ]

  const displayFeatures = features || defaultFeatures

  return (
    <AnimatedSection delay={100}>
      <section id="features" className="py-20 bg-muted">
        <div className="w-full max-w-[1200px] mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">Features</div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{title}</h2>
            <p className="max-w-[700px] text-muted-foreground md:text-xl">{subtitle}</p>
          </div>
          <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
            {displayFeatures.map((feature, index) => {
              const Icon = feature.icon
              return (
                <AnimatedSection
                  key={index}
                  delay={200 + index * 100}
                  className="flex flex-col items-center space-y-4 rounded-lg border p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02]"
                >
                  <div className="rounded-full bg-primary/10 p-3">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="text-center text-muted-foreground">{feature.description}</p>
                </AnimatedSection>
              )
            })}
          </div>
        </div>
      </section>
    </AnimatedSection>
  )
}

