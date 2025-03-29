import { AnimatedSection } from "@/components/animated-section"

interface FAQItem {
  question: string
  answer: string
}

interface FAQSectionProps {
  title?: string
  subtitle?: string
  faqs?: FAQItem[]
}

export function FAQSection({
  title = "Frequently asked questions",
  subtitle = "Everything you need to know about Ciao.",
  faqs,
}: FAQSectionProps) {
  const defaultFAQs: FAQItem[] = [
    {
      question: "How is Ciao different from Trello and Notion?",
      answer:
        "Ciao combines the visual task management of Trello with the powerful document capabilities of Notion in one seamless platform. Instead of switching between tools, you get the best of both worlds in a single, integrated workspace.",
    },
    {
      question: "Can I import my data from Trello or Notion?",
      answer:
        "Yes! Ciao provides easy import tools for both Trello and Notion. You can bring in your boards, cards, documents, and databases with just a few clicks, preserving your existing workflow.",
    },
    {
      question: "Is there a limit to how many team members I can add?",
      answer:
        "The Free plan allows up to 2 team members. The Pro and Enterprise plans support unlimited team members, with pricing based on a per-user model.",
    },
    {
      question: "Does Ciao work offline?",
      answer:
        "Yes, Ciao has offline capabilities. You can continue working when you're not connected to the internet, and your changes will sync automatically when you're back online.",
    },
    {
      question: "What kind of support do you offer?",
      answer:
        "All plans include community support. Pro plans include email support with 24-hour response times. Enterprise plans include dedicated support with a named account manager and priority response times.",
    },
  ]

  const displayFAQs = faqs || defaultFAQs

  return (
    <AnimatedSection delay={500}>
      <section id="faq" className="py-20 bg-muted">
        <div className="w-full max-w-[1200px] mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">FAQ</div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{title}</h2>
            <p className="max-w-[700px] text-muted-foreground md:text-xl">{subtitle}</p>
          </div>
          <div className="mx-auto max-w-3xl space-y-4 py-12">
            {displayFAQs.map((faq, index) => (
              <AnimatedSection
                key={index}
                delay={600 + index * 100}
                className="rounded-lg border p-6 transition-all duration-300 hover:shadow-md hover:scale-[1.01]"
              >
                <h3 className="text-lg font-bold">{faq.question}</h3>
                <p className="mt-2 text-muted-foreground">{faq.answer}</p>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>
    </AnimatedSection>
  )
}

