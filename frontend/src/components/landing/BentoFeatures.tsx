import { motion } from "framer-motion";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Brain, Network, Fingerprint, Zap, Lock, Plus, ArrowRight } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Byzantine Fault Isolation",
    description: "Instant identification of Byzantine agents attempting to subvert or hallucinate. Zero false positives through strict consensus matching.",
    span: "col-span-1",
  },
  {
    icon: Brain,
    title: "Heterogeneous AI Ensembles",
    description: "Diverse agents — Llama 3.3, Qwen 3, Mistral, Phi-4 — deliberate independently to eliminate single-model bias and ensure robust reasoning.",
    span: "col-span-1 lg:col-span-1",
    highlight: true,
  },
  {
    icon: Network,
    title: "PBFT Consensus Engine",
    description: "With an n=7, f=2 architecture, our engine guarantees deterministic resolution even when multiple agents are compromised, crashed, or lying.",
    span: "col-span-1",
  },
  {
    icon: Fingerprint,
    title: "Immutable Certificates",
    description: "Every consensus packet is cryptographically signed via Ed25519 and hash-chained into tamper-proof audit trails for total transparency.",
    span: "col-span-1",
  },
  {
    icon: Zap,
    title: "Interactive Threat Simulation",
    description: "Inject critical faults in real-time — node crashes, malicious sybil attacks, and collusion — and watch the PBFT engine self-heal live.",
    span: "col-span-1",
  },
  {
    icon: Lock,
    title: "ArmorIQ Pre-execution",
    description: "Our proprietary guardrail parses intent, classifies severity risk, and enforces rigid security boundaries before broad AI execution begins.",
    span: "col-span-1",
  },
];

export default function BentoFeatures() {
  return (
    <section id="features" className="relative py-8 sm:py-16">
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
            Deterministic Accuracy,{" "}
            <span className="text-gradient-green">Mathematically Proven</span>
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
                className={`group relative h-full border-white/[0.06] bg-white/[0.02] backdrop-blur-xl transition-all hover:border-primary/20 ${feat.highlight
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