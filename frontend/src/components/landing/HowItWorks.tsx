import { motion } from "framer-motion";

const steps = [
  {
    num: "01",
    title: "ArmorIQ Pre-execution",
    description: "Every intent passes through ArmorIQ. Strict guardrails classify risk, block hallucinations, and enforce rigid parameters before consensus even begins.",
    color: "var(--primary)",
  },
  {
    num: "02",
    title: "7-Agent PBFT Deliberation",
    description: "Our heterogeneous ensemble independently evaluates the sanitized proposal, broadcasting cryptographically signed votes across the network.",
    color: "var(--primary)",
  },
  {
    num: "03",
    title: "f=2 Quorum Sealed",
    description: "Once a 2f+1 supermajority is reached, the decision is locked. The PBFT consensus mathematically filters out any Byzantine (lying or crashed) nodes.",
    color: "var(--success)",
  },
  {
    num: "04",
    title: "Deterministic Execution",
    description: "The verified decision is committed to an immutable Ed25519 hash-chain, and the action is executed with absolute audit provenance.",
    color: "var(--warning)",
  },
];

export default function HowItWorks() {
  return (
    <section className="relative py-8 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-20 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
            <span className="h-px w-8 bg-primary/50" />
            The Pipeline
            <span className="h-px w-8 bg-primary/50" />
          </div>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            How <span className="text-gradient-green">ByzantineMind</span> Works
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            From intent submission to cryptographic execution — fully autonomous, fully trustless.
          </p>
        </motion.div>

        {/* Pipeline */}
        <div className="relative grid gap-8 md:grid-cols-4">
          {/* Connecting line */}
          <div className="absolute left-0 right-0 top-[3.5rem] hidden h-px bg-gradient-to-r from-transparent via-border to-transparent md:block" />

          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="relative text-center"
            >
              {/* Numbered circle */}
              <div className="relative mx-auto mb-6 flex h-[4.5rem] w-[4.5rem] items-center justify-center">
                <div
                  className="absolute inset-0 rounded-full opacity-20"
                  style={{
                    border: `2px solid hsl(${step.color})`,
                    boxShadow: `0 0 20px hsl(${step.color} / 0.3)`,
                  }}
                />
                <span
                  className="font-mono-code text-xl font-bold"
                  style={{ color: `hsl(${step.color})` }}
                >
                  {step.num}
                </span>
              </div>

              <h3 className="mb-2 text-base font-bold text-foreground">{step.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
