import { motion } from "framer-motion";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Brain, Network, Fingerprint, Zap, Lock, Plus, ArrowRight } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Real-Time Threat Detection",
    description: "Instant identification of Byzantine agents attempting to subvert consensus. Zero false positives through cryptographic verification.",
    span: "col-span-1",
  },
  {
    icon: Brain,
    title: "Self-Learning AI Engine",
    description: "Heterogeneous agents — GPT-4, Claude, Mistral — deliberate independently, improving accuracy with every round. The system gets smarter with each consensus cycle.",
    span: "col-span-1 lg:col-span-1",
    highlight: true,
  },
  {
    icon: Network,
    title: "Multi-Agent Protection",
    description: "3f+1 fault tolerance ensures consensus even when up to f agents are compromised, crashed, or malicious.",
    span: "col-span-1",
  },
  {
    icon: Fingerprint,
    title: "Cryptographic Proof",
    description: "Ed25519 signed decisions, hash-chained into immutable certificates. Verify any past consensus in milliseconds.",
    span: "col-span-1",
  },
  {
    icon: Zap,
    title: "Live Attack Resistance",
    description: "Inject faults in real-time — crash, lie, collude. Consensus holds mathematically.",
    span: "col-span-1",
  },
  {
    icon: Lock,
    title: "Intent Guardrails",
    description: "ArmorIQ parses intent, classifies risk, and validates alignment before execution.",
    span: "col-span-1",
  },
];

export default function BentoFeatures() {
  return (
    <section id="features" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <Badge variant="outline" className="mb-4 border-primary/20 bg-primary/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
            Features
          </Badge>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Smarter Each Day,{" "}
            <span className="text-gradient-green">Stronger Every Hour</span>
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            A first-of-its-kind platform where AI agents achieve mathematically proven consensus,
            secured by cryptography and verified through radical transparency.
          </p>
        </motion.div>

        {/* Top row: 3 equal cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.slice(0, 3).map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <Card
                className={`group relative h-full border-white/[0.06] bg-white/[0.02] backdrop-blur-xl transition-all hover:border-primary/20 ${
                  feat.highlight
                    ? "border-primary/20 bg-primary/[0.06] shadow-[0_0_40px_-12px_hsl(var(--primary)/0.2)]"
                    : ""
                }`}
              >
                {/* Corner + icon */}
                {!feat.highlight && (
                  <div className="absolute right-4 top-4 text-muted-foreground/20">
                    <Plus className="h-4 w-4" />
                  </div>
                )}
                {/* Gradient image area */}
                <div className={`relative h-32 overflow-hidden rounded-t-xl ${feat.highlight ? "bg-gradient-to-br from-primary/20 to-primary/5" : "bg-gradient-to-br from-white/[0.03] to-transparent"}`}>
                  <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                      backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
                      backgroundSize: "20px 20px",
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <feat.icon className={`h-10 w-10 ${feat.highlight ? "text-primary" : "text-foreground/15"}`} />
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <h3 className="text-lg font-bold text-foreground">{feat.title}</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-muted-foreground">{feat.description}</p>
                  {feat.highlight && (
                    <button className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-all hover:bg-primary/90">
                      Get Started
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Bottom row: 3 equal cards */}
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.slice(3).map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (i + 3) * 0.08 }}
            >
              <Card className="group relative h-full border-white/[0.06] bg-white/[0.02] backdrop-blur-xl transition-all hover:border-primary/20">
                <div className="absolute right-4 top-4 text-muted-foreground/20">
                  <Plus className="h-4 w-4" />
                </div>
                <CardHeader className="pb-2">
                  <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                    <feat.icon className="h-5 w-5 text-primary/80" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{feat.title}</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-muted-foreground">{feat.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}