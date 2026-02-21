import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Zap, Puzzle, Play } from "lucide-react";

const reasons = [
  {
    icon: Brain,
    title: "Built on Adaptive Intelligence",
    description: "Our heterogeneous agent pool combines GPT-4, Claude, and Mistral to achieve diverse reasoning paths — eliminating single-model blind spots.",
  },
  {
    icon: Zap,
    title: "Defense in Real-Time, All the Time",
    description: "Sub-second consensus cycles with continuous fault injection testing. Every decision is live-verified against Byzantine threats before execution.",
  },
  {
    icon: Puzzle,
    title: "Seamless Across Any Stack",
    description: "Drop-in REST API, WebSocket streams, and SDK integrations. ByzantineMind layers on top of your existing AI infrastructure in hours, not months.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="relative py-24 sm:py-32">
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
              Built from the ground up for mission-critical AI systems that can't afford to fail.
            </p>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            We Evolve So You're{" "}
            <span className="text-gradient-green">Untouchable</span>
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
                  {/* Image/gradient area with play button */}
                  <div className="relative mx-4 mt-4 h-44 overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-card to-background">
                    <div
                      className="absolute inset-0 opacity-[0.04]"
                      style={{
                        backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
                        backgroundSize: "20px 20px",
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary opacity-0 transition-all group-hover:opacity-100">
                        <Play className="h-4 w-4 ml-0.5" />
                      </div>
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <r.icon className="h-8 w-8 text-foreground/10" />
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