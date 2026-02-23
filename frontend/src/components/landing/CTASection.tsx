import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Network, Zap, Fingerprint } from "lucide-react";

const smallCards = [
  { icon: ShieldCheck, title: "f=2 Tolerance", desc: "Mathematically proven fault isolation" },
  { icon: Network, title: "7-Node PBFT", desc: "Distributed heterogeneous consensus" },
  { icon: Zap, title: "1s Finality", desc: "Lightning fast quorum sealing" },
  { icon: Fingerprint, title: "Ed25519", desc: "Cryptographic hash-chained audit" },
];

export default function CTASection() {
  return (
    <section className="relative overflow-hidden py-8 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:grid-rows-2">
            {/* Large left card with text */}
            <div className="col-span-2 row-span-2 relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/15 via-card to-background p-8 sm:p-12">
              <div
                className="absolute inset-0 opacity-[0.04]"
                style={{
                  backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
                  backgroundSize: "30px 30px",
                }}
              />
              <div className="relative z-10 flex h-full flex-col justify-between">
                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    System Live
                  </div>
                </div>
                <div className="mt-8">
                  <h2 className="mb-4 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                    Ready to Secure Your
                    <br />
                    <span className="text-gradient-green">Multi-Agent Future?</span>
                  </h2>
                  <Link
                    to="/dashboard"
                    className="group inline-flex items-center gap-3 rounded-xl bg-primary px-8 py-4 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 glow-green"
                  >
                    Launch Simulation
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Smaller visual cards */}
            {smallCards.map((card, i) => (
              <div
                key={i}
                className="col-span-1 row-span-1 relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/[0.04] via-card to-background p-6 flex flex-col justify-between border border-white/[0.02] hover:border-primary/20 transition-all group"
              >
                <div
                  className="absolute inset-0 opacity-[0.03]"
                  style={{
                    backgroundImage: `radial-gradient(hsl(var(--primary)) 1px, transparent 1px)`,
                    backgroundSize: "20px 20px",
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                <card.icon className="relative z-10 h-8 w-8 text-primary mb-4" />
                <div className="relative z-10">
                  <h4 className="text-sm font-bold text-foreground mb-1">{card.title}</h4>
                  <p className="text-xs text-muted-foreground">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}