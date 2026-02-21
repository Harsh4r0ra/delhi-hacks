import { Link } from "react-router-dom";
import { ArrowRight, Play } from "lucide-react";
import { motion } from "framer-motion";
import NetworkVisualization from "./NetworkVisualization";
import LiveCounter from "./LiveCounter";
import heroVisual from "@/assets/hero-visual.jpg";

export default function HeroSection({ completedRounds, failures }: { completedRounds: number; failures: number }) {
  return (
    <section className="relative min-h-screen overflow-hidden pt-20">
      {/* Background grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Network visualization background */}
      <div className="absolute inset-0 opacity-60">
        <NetworkVisualization />
      </div>

      {/* Radial gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,transparent_0%,hsl(224_47%_7%)_70%)]" />

      {/* Decorative green arc */}
      <div className="pointer-events-none absolute right-0 top-1/4 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,hsl(142_71%_45%/0.06)_0%,transparent_70%)]" />

      {/* Left vertical text */}
      <div className="pointer-events-none absolute left-4 top-1/2 z-10 hidden -translate-y-1/2 lg:block">
        <span className="font-mono-code text-[10px] uppercase tracking-[0.4em] text-muted-foreground/30" style={{ writingMode: "vertical-rl" }}>
          A D A P T I V E &nbsp; S E C U R I T Y .
        </span>
      </div>

      {/* Main hero content */}
      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        <div className="grid w-full gap-12 lg:grid-cols-2 lg:gap-8">
          {/* Left side — text */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col justify-center"
          >
            <div className="mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse-glow" />
              Byzantine Consensus
            </div>

            <h1 className="mb-6 font-mono-code text-3xl font-extrabold uppercase leading-[1.1] tracking-wider sm:text-4xl lg:text-5xl xl:text-6xl">
              <span className="text-foreground">Cyber</span>{" "}
              <span className="text-gradient-green">Defense</span>
              <br />
              <span className="text-foreground">That Evolves</span>
              <br />
              <span className="text-gradient-hero">Daily.</span>
            </h1>

            <p className="mb-10 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
              ByzantineMind guarantees AI decisions are cryptographically verified,
              quorum-sealed, and mathematically provable — even when agents are
              compromised.
            </p>

            {/* Play button + CTA row */}
            <div className="mb-8 flex items-center gap-6">
              <button className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border-2 border-primary/40 bg-primary/10 text-primary transition-all hover:bg-primary/20 hover:border-primary/60">
                <Play className="h-5 w-5 ml-0.5" />
              </button>
              <div className="h-px flex-1 max-w-[60px] bg-primary/30" />
              <Link
                to="/dashboard"
                className="group inline-flex items-center justify-center gap-2.5 rounded-xl bg-primary px-8 py-4 text-sm font-bold uppercase tracking-wider text-primary-foreground transition-all hover:bg-primary/90 glow-green"
              >
                Get Protected Today
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Inline stats */}
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="font-mono-code text-lg font-bold text-primary">1,600+</span>
                <span className="text-xs">Users Active</span>
              </div>
              <span className="text-muted-foreground/30">+</span>
              <div className="flex items-center gap-2">
                <span className="font-mono-code text-lg font-bold text-primary">300+</span>
                <span className="text-xs">Technologies</span>
              </div>
            </div>
          </motion.div>

          {/* Right side — floating visual */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="relative hidden items-center justify-center lg:flex"
          >
            <motion.div
              animate={{ y: [0, -16, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              <div className="absolute -inset-4 rounded-3xl bg-primary/10 blur-3xl" />
              <img
                src={heroVisual}
                alt="ByzantineMind AI Consensus Network"
                className="relative h-auto max-h-[500px] w-full rounded-2xl border border-white/[0.08] object-cover shadow-2xl"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Stats bar at bottom */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="relative z-10 border-t border-border/30 bg-card/50 backdrop-blur-xl"
      >
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <LiveCounter completedRounds={completedRounds} failures={failures} />
        </div>
      </motion.div>
    </section>
  );
}