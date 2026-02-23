import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Zap, Puzzle, Play } from "lucide-react";

const reasons = [
  {
    icon: Brain,
    title: "Heterogeneous Ensembles",
    description: "Our agent pool combines diverse reasoning paths from Llama 3.3, Qwen 3, Mistral, and Phi-4 — eliminating single-model blind spots.",
    visual: (
      <div className="relative h-full w-full flex items-center justify-center p-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute h-24 w-24 rounded-full border border-dashed border-[#10b981]/40"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="z-10 bg-[#0A0D14] p-3 rounded-full border border-[#10b981]/60 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
        >
          <Brain className="h-8 w-8 text-[#10b981]" />
        </motion.div>

        {/* Orbital nodes */}
        {[0, 90, 180, 270].map((deg, i) => (
          <motion.div
            key={i}
            className="absolute h-3 w-3 rounded-full bg-primary/70"
            style={{ transformOrigin: "0 0" }}
            animate={{
              x: [Math.cos(deg * (Math.PI / 180)) * 40, Math.cos((deg + 360) * (Math.PI / 180)) * 40],
              y: [Math.sin(deg * (Math.PI / 180)) * 40, Math.sin((deg + 360) * (Math.PI / 180)) * 40],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          />
        ))}
      </div>
    ),
  },
  {
    icon: Zap,
    title: "Deterministic PBFT Consensus",
    description: "Sub-second consensus cycles with continuous fault injection testing. Every decision mathematically isolated from Byzantine threats.",
    visual: (
      <div className="relative h-full w-full flex items-center justify-center overflow-hidden">
        {/* Shield */}
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="z-10"
        >
          <Zap className="h-10 w-10 text-primary" />
        </motion.div>
        {/* Radar wave */}
        <motion.div
          animate={{ scale: [0, 3], opacity: [0.8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
          className="absolute h-16 w-16 rounded-full border border-primary/60"
        />
        {/* Grid background element */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,hsl(var(--background))_100%)] z-20 pointer-events-none" />
      </div>
    ),
  },
  {
    icon: Puzzle,
    title: "Seamless API & WebSocket",
    description: "Drop-in REST API, live WebSocket streams, and native React integration. ByzantineMind layers onto existing systems in hours.",
    visual: (
      <div className="relative h-full w-full flex items-center justify-center gap-2 overflow-hidden">
        <motion.div
          animate={{ y: [10, -10, 10] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="flex h-12 w-12 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 backdrop-blur-sm"
        >
          <span className="font-mono-code text-xs font-bold text-primary">API</span>
        </motion.div>
        <motion.div
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="flex h-12 w-12 items-center justify-center rounded-lg border border-primary/40 bg-primary/20 backdrop-blur-sm"
        >
          <Puzzle className="h-5 w-5 text-primary" />
        </motion.div>
        <motion.div
          animate={{ y: [10, -10, 10] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="flex h-12 w-12 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 backdrop-blur-sm"
        >
          <span className="font-mono-code text-xs font-bold text-primary">WSS</span>
        </motion.div>
      </div>
    ),
  },
];

export default function WhyChooseUs() {
  return (
    <section className="relative py-8 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Split header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
        >
          <div>
            <Badge variant="outline" className="mb-4 border-primary/20 bg-primary/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              Why Choose Us
            </Badge>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Built from the ground up to secure multi-agent AI systems that can't afford to fail or hallucinate.
            </p>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            We Evolve So You're{" "}
            <span className="text-gradient-green">Byzantine-Fault Free</span>
          </h2>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {reasons.map((r, i) => (
            <motion.div
              key={r.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
            >
              <Card className="group h-full overflow-hidden border-white/[0.06] bg-white/[0.02] backdrop-blur-xl transition-all hover:border-primary/20">
                <CardContent className="p-0">
                  <h3 className="px-6 pt-6 text-lg font-bold text-foreground">{r.title}</h3>
                  {/* Image/gradient area with custom visual block */}
                  <div className="relative mx-4 mt-4 h-48 overflow-hidden rounded-xl bg-gradient-to-br from-primary/5 via-card to-background border border-white/[0.03]">
                    <div
                      className="absolute inset-0 opacity-[0.03]"
                      style={{
                        backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
                        backgroundSize: "20px 20px",
                      }}
                    />

                    {/* Render specific visual for this card */}
                    <div className="absolute inset-0 z-10">
                      {r.visual}
                    </div>

                    <div className="absolute bottom-3 left-3 z-0">
                      <r.icon className="h-8 w-8 text-foreground/5" />
                    </div>
                  </div>
                  <p className="px-6 py-5 text-sm leading-relaxed text-muted-foreground">{r.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}