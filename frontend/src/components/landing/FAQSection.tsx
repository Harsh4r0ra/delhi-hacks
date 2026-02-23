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
    a: "BFT is a property of distributed systems that guarantees correct operation even when nodes fail or act maliciously. ByzantineMind applies this mathematical framework to multi-agent AI ecosystems.",
  },
  {
    q: "How many faulty agents can the system tolerate?",
    a: "Our core PBFT engine runs on an n=7 node architecture, tolerating f=2 faulty agents. The formula is f = ⌊(n-1)/3⌋, meaning even if 2 out of 7 agents hallucinate, lie, or crash, consensus mathematically holds.",
  },
  {
    q: "What AI models do the agents use?",
    a: "ByzantineMind supports heterogeneous open-weights agent pools. Currently, the primary replicas run a mix of Llama 3.3, Qwen 3, Mistral, and Phi-4 to ensure diverse reasoning paths and eliminate single-model bias.",
  },
  {
    q: "How are decisions cryptographically verified?",
    a: "Every agent signs their independent vote using Ed25519 digital signatures. Once a 2f+1 quorum (5 nodes) is reached, votes are hash-chained into an immutable, locally verifiable consensus certificate.",
  },
  {
    q: "Can I inject faults to test resilience?",
    a: "Yes. The Interactive Threat Simulation dashboard lets you crash agents, force Byzantine behaviors, or trigger sybil attacks in real-time to watch the PBFT network self-heal live.",
  },
  {
    q: "What is ArmorIQ?",
    a: "ArmorIQ is our proprietary pre-execution guardrail. It sits in front of the PBFT consensus layer to parse intent, classify risk severity, and filter out obvious malicious inputs before deliberation begins.",
  },
  {
    q: "How fast is the consensus cycle?",
    a: "Even with 7 concurrent LLM agents evaluating proposals, a complete consensus round — from proposition to quorum seal — completes in under a second.",
  },
  {
    q: "Is the consensus log tamper-proof?",
    a: "Yes. Every executed action is written to an immutable, cryptographically hash-chained audit ledger, making retroactive tampering mathematically impossible.",
  },
];

export default function FAQSection() {
  return (
    <section className="relative py-8 sm:py-16">
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