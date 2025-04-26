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
  title = "Frequently Asked Questions",
  subtitle = "Find answers to common questions about Ciao.",
  faqs,
}: FAQSectionProps) {
  const defaultFAQs: FAQItem[] = [
    {
      question: "What is Ciao and how does it work?",
      answer:
        "Ciao is a modern collaboration platform that combines task management, document sharing, and team communication in one seamless interface. It helps teams organize their work, share knowledge, and stay connected through an intuitive and powerful workspace.",
    },
    {
      question: "What are the key features of Ciao?",
      answer:
        "Ciao offers a comprehensive suite of features including: Kanban boards for task management, real-time document collaboration, team chat, file sharing, project timelines, customizable workflows, and powerful integrations with popular tools. All these features are designed to work together seamlessly.",
    },
    {
      question: "How secure is my data in Ciao?",
      answer:
        "Security is our top priority. Ciao uses enterprise-grade encryption, regular backups, and strict access controls to protect your data. We also comply with major security standards and offer advanced security features like two-factor authentication and audit logs.",
    },
    {
      question: "Can I integrate Ciao with other tools?",
      answer:
        "Yes! Ciao offers extensive integration capabilities. You can connect with popular tools like Slack, Google Drive, GitHub, and many more through our API and pre-built integrations. This allows you to create a customized workflow that fits your team's needs.",
    },
    {
      question: "What kind of support do you offer?",
      answer:
        "We provide comprehensive support through multiple channels. All users get access to our knowledge base and community forums. Premium plans include priority email support, while enterprise customers receive dedicated account management and 24/7 technical support.",
    },
  ]

  const displayFAQs = faqs || defaultFAQs

  return (
    <AnimatedSection delay={500}>
      <section id="faq" className="py-20">
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
                className="rounded-lg border bg-card p-6 transition-all duration-300 hover:shadow-md hover:scale-[1.01]"
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

