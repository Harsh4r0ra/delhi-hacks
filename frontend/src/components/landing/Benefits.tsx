import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Rocket, TrendingUp, Moon, ClipboardCheck } from "lucide-react";

const benefits = [
  {
    icon: Rocket,
    title: "Future-Proof Your Security",
    description: "Built on mathematical proofs that don't expire. As threats evolve, the consensus guarantees remain unbreakable.",
    large: true,
  },
  {
    icon: TrendingUp,
    title: "Scale Without Fear",
    description: "From 4 agents to 400 — the Byzantine Fault Tolerance scales linearly while maintaining sub-second consensus.",
    accent: true,
  },
  {
    icon: Moon,
    title: "Stay Safe While You Sleep",
    description: "24/7 autonomous monitoring. Agents deliberate and decide in real-time, no human bottleneck required.",
  },
  {
    icon: ClipboardCheck,
    title: "Compliance Made Simple",
    description: "Every decision is cryptographically signed and auditable. Generate compliance reports from the immutable consensus log.",
  },
];

export default function Benefits() {
  return (
    <section className="relative py-24 sm:py-32">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(hsl(var(--primary)) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
              Benefit
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Protection That Gets{" "}
              <span className="text-gradient-green">Smarter With You</span>
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground lg:text-right">
            Our adaptive security platform learns from every interaction, building stronger defenses that evolve with your infrastructure.
          </p>
        </motion.div>

        {/* Asymmetric grid */}
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Large card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2"
          >
            <Card className="group relative h-full overflow-hidden border-white/[0.06] bg-white/[0.02] backdrop-blur-xl transition-all hover:border-primary/20">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
              <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
                  backgroundSize: "30px 30px",
                }}
              />
              <CardContent className="relative flex h-full min-h-[240px] flex-col justify-end p-8">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15">
                  <Rocket className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-foreground">{benefits[0].title}</h3>
                <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">{benefits[0].description}</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Accent card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="group h-full overflow-hidden border-primary/20 bg-primary/[0.08] backdrop-blur-xl transition-all hover:bg-primary/[0.12]">
              <CardContent className="flex h-full min-h-[240px] flex-col justify-end p-8">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-foreground">{benefits[1].title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{benefits[1].description}</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Bottom row: 2 equal */}
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {benefits.slice(2).map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (i + 2) * 0.1 }}
            >
              <Card className="group h-full border-white/[0.06] bg-white/[0.02] backdrop-blur-xl transition-all hover:border-primary/20">
                <CardContent className="flex gap-5 p-6 sm:p-8">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/15">
                      <b.icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="mb-2 text-lg font-bold text-foreground">{b.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{b.description}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}