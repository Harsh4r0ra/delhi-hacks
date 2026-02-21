import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Play } from "lucide-react";

const stats = [
  { label: "AI Intelligence", value: "200+" },
  { label: "Approval Rate", value: "1,600+" },
  { label: "Partners Protected", value: "300+" },
];

export default function WhoWeAre() {
  return (
    <section id="about" className="relative py-24 sm:py-32">
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
            <div
              className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
                backgroundSize: "30px 30px",
              }}
            />
            {/* Play button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <button className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary/40 bg-primary/10 text-primary transition-all hover:bg-primary/20 hover:scale-110">
                <Play className="h-6 w-6 ml-0.5" />
              </button>
            </div>
            {/* Caption */}
            <div className="absolute bottom-6 left-6 right-6">
              <p className="font-mono-code text-xs uppercase tracking-widest text-primary/60">
                We Don't Just Defend. We Adapt.
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
              At ByzantineMind, We Believe Cyber Threats Don't Sleep{" "}
              <span className="text-gradient-green">And Neither Should Your Defense.</span>{" "}
              We Build Intelligent, Evolving Security Systems Powered By AI And Real-Time Data.
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