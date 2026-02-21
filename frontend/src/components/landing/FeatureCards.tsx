import { motion } from "framer-motion";
import { Shield, Fingerprint, Zap, Eye, Network, Lock } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "3f+1 Fault Tolerance",
    description:
      "Mathematically proven quorum — tolerates up to f Byzantine faults in 3f+1 agents. Corrupted, lying, or compromised agents cannot break consensus.",
    accent: "primary",
  },
  {
    icon: Fingerprint,
    title: "Cryptographic Proof",
    description:
      "Every decision signed with Ed25519, hash-chained into immutable certificates. Verify any past consensus in milliseconds.",
    accent: "primary",
  },
  {
    icon: Zap,
    title: "Live Attack Resistance",
    description:
      "Inject faults in real-time — crash agents, inject Byzantine behavior, attempt collusion. Consensus holds.",
    accent: "warning",
  },
  {
    icon: Eye,
    title: "Radical Transparency",
    description:
      "Every layer is inspectable. View agent decisions, vote histories, and cryptographic proofs in real-time.",
    accent: "primary",
  },
  {
    icon: Network,
    title: "Multi-Agent Consensus",
    description:
      "Heterogeneous AI agents — GPT-4, Claude, Mistral — deliberate independently and reach verifiable agreement.",
    accent: "primary",
  },
  {
    icon: Lock,
    title: "Intent Guardrails",
    description:
      "ArmorIQ integration parses intent declarations, classifies risk, and validates alignment before execution.",
    accent: "destructive",
  },
];

export default function FeatureCards() {
  return (
    <section id="features" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <div className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
            <span className="h-px w-8 bg-primary/50" />
            What Makes It Unique
          </div>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Six Pillars of{" "}
            <span className="text-gradient-cyan">Byzantine Consensus</span>
          </h2>
          <p className="max-w-2xl text-muted-foreground">
            A first-of-its-kind platform where AI agents achieve mathematically proven consensus,
            secured by cryptography and verified through radical transparency.
          </p>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass-card group p-6 transition-all hover:border-primary/20 sm:p-8"
            >
              <div
                className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl ${
                  feat.accent === "warning"
                    ? "bg-warning/10"
                    : feat.accent === "destructive"
                    ? "bg-destructive/10"
                    : "bg-primary/10"
                }`}
              >
                <feat.icon
                  className={`h-6 w-6 ${
                    feat.accent === "warning"
                      ? "text-warning"
                      : feat.accent === "destructive"
                      ? "text-destructive"
                      : "text-primary"
                  }`}
                />
              </div>
              <h3 className="mb-3 text-lg font-bold text-foreground">{feat.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{feat.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
