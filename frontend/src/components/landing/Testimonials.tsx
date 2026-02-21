import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Quote, ChevronLeft, ChevronRight } from "lucide-react";

const testimonials = [
  {
    quote: "ByzantineMind gave us what we thought was impossible — mathematically provable consensus for our multi-agent trading system. We've run 1,200+ rounds with zero Byzantine failures.",
    name: "Dr. Sarah Chen",
    title: "Head of AI Security, QuantumVault",
    initials: "SC",
  },
  {
    quote: "The fault injection console alone is worth it. Being able to demonstrate to auditors that our AI system holds up under active attack scenarios changed our compliance story overnight.",
    name: "Marcus Rivera",
    title: "CTO, Sentinel Defense",
    initials: "MR",
  },
];

export default function Testimonials() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_2fr] lg:gap-16">
          {/* Left column — heading + nav */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-between"
          >
            <div>
              <Badge variant="outline" className="mb-4 border-primary/20 bg-primary/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                Testimonials
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Trusted by the{" "}
                <span className="text-gradient-green">Vigilant</span>
              </h2>
            </div>

            <div className="mt-8 flex items-center gap-3">
              <button className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/30 text-primary transition-colors hover:bg-primary/10">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/30 text-primary transition-colors hover:bg-primary/10">
                <ChevronRight className="h-4 w-4" />
              </button>
              <span className="ml-2 font-mono-code text-xs text-muted-foreground/50">0.1 TESTIMONIALS</span>
            </div>
          </motion.div>

          {/* Right column — cards */}
          <div className="grid gap-6 sm:grid-cols-2">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
              >
                <Card className="h-full border-white/[0.06] bg-white/[0.02] backdrop-blur-xl transition-all hover:border-primary/20">
                  <CardContent className="p-8">
                    <Quote className="mb-4 h-10 w-10 text-primary/40" />
                    <p className="mb-8 text-base leading-relaxed text-muted-foreground italic">
                      "{t.quote}"
                    </p>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10 border border-primary/20">
                        <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                          {t.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.title}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}