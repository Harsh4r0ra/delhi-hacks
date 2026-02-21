import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "What is Byzantine Fault Tolerance (BFT)?",
    a: "BFT is a property of distributed systems that guarantees correct operation even when up to f out of 3f+1 participants are faulty, malicious, or compromised. ByzantineMind applies this mathematical framework to AI agent consensus.",
  },
  {
    q: "How many faulty agents can the system tolerate?",
    a: "With 4 agents, the system tolerates 1 faulty agent. The formula is f = ⌊(n-1)/3⌋, meaning one-third of agents can be Byzantine (lying, crashed, or colluding) and consensus still holds.",
  },
  {
    q: "What AI models do the agents use?",
    a: "ByzantineMind supports heterogeneous agent pools. Current agents use GPT-4, Claude-3, Mistral-7B, and a custom SimulatedAgent — ensuring diverse reasoning paths and eliminating single-model vulnerabilities.",
  },
  {
    q: "How are decisions cryptographically verified?",
    a: "Every agent signs their vote with Ed25519 digital signatures. Once quorum is reached, votes are hash-chained into an immutable consensus certificate that can be independently verified.",
  },
  {
    q: "Can I inject faults to test resilience?",
    a: "Yes. The Fault Injection Console lets you crash agents, inject Byzantine behavior (lying), or attempt collusion attacks in real-time. The platform demonstrates mathematically that consensus holds.",
  },
  {
    q: "How fast is the consensus cycle?",
    a: "A full consensus round — from intent submission through agent deliberation to quorum seal — completes in under 3 seconds. The system runs 24/7 with 99.99% uptime.",
  },
  {
    q: "How do I integrate ByzantineMind into my stack?",
    a: "ByzantineMind offers a REST API, WebSocket streams for real-time consensus monitoring, and SDKs for Python, TypeScript, and Go. Most integrations complete in hours.",
  },
  {
    q: "Is the consensus log tamper-proof?",
    a: "Yes. Each consensus certificate is hash-chained to the previous one, creating an immutable audit log. Any tampering breaks the chain and is instantly detectable.",
  },
];

export default function FAQSection() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <Badge variant="outline" className="mb-4 border-primary/20 bg-primary/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
            FAQ
          </Badge>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Frequently Asked{" "}
            <span className="text-gradient-green">Questions</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="glass-card p-1"
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="border-white/[0.06] px-5"
              >
                <AccordionTrigger className="py-5 text-left text-sm font-semibold text-foreground hover:text-primary hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}