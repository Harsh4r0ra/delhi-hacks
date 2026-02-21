import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";

const gridItems = [
  { span: "col-span-2 row-span-2", hasText: true },
  { span: "col-span-1 row-span-1" },
  { span: "col-span-1 row-span-1" },
  { span: "col-span-1 row-span-1" },
  { span: "col-span-1 row-span-1" },
];

export default function CTASection() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
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
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary">
                    <Play className="h-4 w-4 ml-0.5" />
                  </div>
                </div>
                <div className="mt-8">
                  <h2 className="mb-4 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                    Ready to Outsmart
                    <br />
                    <span className="text-gradient-green">Tomorrow's Threats?</span>
                  </h2>
                  <Link
                    to="/dashboard"
                    className="group inline-flex items-center gap-3 rounded-xl bg-primary px-8 py-4 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 glow-green"
                  >
                    Get Started Now
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Smaller gradient cards */}
            {gridItems.slice(1).map((item, i) => (
              <div
                key={i}
                className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/[0.04] via-card to-background ${item.span}`}
              >
                <div
                  className="absolute inset-0 opacity-[0.03]"
                  style={{
                    backgroundImage: `radial-gradient(hsl(var(--primary)) 1px, transparent 1px)`,
                    backgroundSize: "20px 20px",
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity hover:opacity-100" />
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}