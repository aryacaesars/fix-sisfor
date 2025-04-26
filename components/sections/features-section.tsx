import { Kanban, Columns, ListTodo, Calendar, Star, Clock, type LucideIcon } from "lucide-react"
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
  title = "Powerful Kanban for Project Management",
  subtitle = "Streamline your workflow with our advanced Kanban system, designed to help you manage projects and tasks efficiently.",
  features,
}: FeaturesSectionProps) {
  const defaultFeatures: Feature[] = [
    {
      icon: Kanban,
      title: "Visual Task Management",
      description: "Organize and track your projects with intuitive Kanban boards, perfect for visualizing your workflow and progress.",
    },
    {
      icon: Columns,
      title: "Kanban Board Management",
      description: "Create and customize columns to match your workflow, with drag-and-drop functionality for easy task organization.",
    },
    {
      icon: ListTodo,
      title: "Task Details & Tracking",
      description: "Add detailed information to tasks, set priorities, due dates, and track progress with our comprehensive task management system.",
    },
    {
      icon: Calendar,
      title: "Due Date Management",
      description: "Set and manage deadlines effectively with our integrated calendar system and deadline tracking features.",
    },
    {
      icon: Star,
      title: "Favorite Boards",
      description: "Quickly access your most important boards with the favorites feature, making navigation more efficient.",
    },
    {
      icon: Clock,
      title: "Recent Activity",
      description: "Stay updated with recent changes and updates across your boards for better project tracking.",
    },
  ]

  const displayFeatures = features || defaultFeatures

  return (
    <AnimatedSection delay={100}>
      <section id="features" className="py-20">
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

