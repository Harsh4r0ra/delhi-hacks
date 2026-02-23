import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Server, User, Network, ShieldCheck, Cpu, CheckCircle2 } from "lucide-react";

const stats = [
  { label: "Heterogeneous Agents", value: "7x" },
  { label: "Fault Tolerance", value: "f=2" },
  { label: "Consensus Model", value: "PBFT" },
];

export default function WhoWeAre() {
  return (
    <section id="about" className="relative py-8 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Left — atmospheric visual card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative aspect-[4/3] overflow-hidden rounded-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-card to-background" />
            {/* Background Grids */}
            <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`, backgroundSize: "30px 30px" }} />

            {/* Animated PBFT Visualization */}
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="relative w-full h-full max-w-sm flex items-center justify-center">

                {/* Central Primary Node */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
                  className="z-20 flex h-20 w-20 flex-col items-center justify-center rounded-xl border border-primary/50 bg-[#0A0D14] shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                >
                  <Cpu className="h-8 w-8 text-[#10b981]" />
                  <span className="mt-1 text-[8px] font-bold text-primary">PRIMARY</span>
                </motion.div>

                {/* Replica Nodes orbiting */}
                {[0, 1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear", delay: i * -5 }}
                    className="absolute inset-0 z-10"
                  >
                    <div className="absolute left-1/2 top-4 -ml-6 flex h-12 w-12 flex-col items-center justify-center rounded-xl border border-border bg-card/80 backdrop-blur-md">
                      <Server className="h-5 w-5 text-muted-foreground" />
                      <span className="mt-0.5 text-[7px] font-mono text-muted-foreground">NODE {i + 1}</span>
                    </div>
                    {/* Connecting line */}
                    <div className="absolute left-1/2 top-16 h-12 w-px bg-gradient-to-b from-primary/40 to-transparent" />
                  </motion.div>
                ))}

                {/* Animated data pulses */}
                <motion.div
                  animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                  className="absolute inset-0 m-auto h-20 w-20 rounded-full border border-[#10b981]"
                />
              </div>
            </div>
            {/* Caption */}
            <div className="absolute bottom-6 left-6 right-6">
              <p className="font-mono-code text-xs uppercase tracking-widest text-[#10b981]">
                We Don't Just Generate. We Reach Consensus.
              </p>
            </div>
          </motion.div>

          {/* Right — text */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <Badge variant="outline" className="mb-6 border-primary/20 bg-primary/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              Who We Are
            </Badge>
            <h2 className="mb-8 font-mono-code text-xl font-bold uppercase leading-relaxed tracking-wide text-foreground sm:text-2xl lg:text-3xl">
              At ByzantineMind, We Believe Single-Agent AI Is Inherently Vulnerable.{" "}
              <span className="text-[#10b981]">We Build High-Assurance Cognitive Ensembles.</span>{" "}
              Powered by Practical Byzantine Fault Tolerance (PBFT) for deterministic AI execution.
            </h2>

            <div className="grid grid-cols-3 gap-6">
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="font-mono-code text-3xl font-extrabold text-primary sm:text-4xl">{s.value}</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}