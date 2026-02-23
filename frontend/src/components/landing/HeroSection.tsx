import { Link } from "react-router-dom";
import { ArrowRight, Github } from "lucide-react";
import { motion } from "framer-motion";
import NetworkVisualization from "./NetworkVisualization";
import LiveCounter from "./LiveCounter";
import fingerprintVisual from "@/assets/fingerprint.png";

export default function HeroSection({ completedRounds, failures }: { completedRounds: number; failures: number }) {
  return (
    <section className="relative min-h-screen overflow-hidden pt-20 bg-[#06080F]">
      {/* Network visualization background - faint */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <NetworkVisualization />
      </div>

      {/* Radial gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#06080F_80%)]" />

      {/* Main hero content */}
      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-8rem)] max-w-7xl items-center px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid w-full gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          {/* Left side — text */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col justify-center max-w-xl"
          >
            <div className="mb-6 inline-flex w-fit items-center gap-2 border border-border/20 bg-card/10 px-3 py-1.5 text-[11px] font-medium text-muted-foreground backdrop-blur-sm rounded">
              <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]" />
              The Nº1 choice for Byzantine Fault Tolerant AI Consensus
            </div>

            <h1 className="mb-6 font-mono-code text-3xl font-bold uppercase leading-[1.1] tracking-wide sm:text-4xl lg:text-[40px] text-foreground">
              COMPREHENSIVE BFT CONSENSUS DESIGNED FOR EVERY AI BUSINESS
            </h1>

            <p className="mb-10 text-sm leading-relaxed text-muted-foreground/80">
              We combine heterogeneous LLM ensembles with PBFT consensus to protect your automated systems, filter Byzantine faults, and ensure deterministic, secure agentic execution around the clock.
            </p>

            {/* CTA row */}
            <div className="mb-8 flex items-center gap-4">
              <Link
                to="/dashboard"
                className="inline-flex h-11 items-center justify-center bg-[#10b981] px-8 text-xs font-bold uppercase tracking-wider text-black transition-all hover:bg-[#0ea5e9]/90 hover:opacity-90"
              >
                GET A DEMO
              </Link>
              <Link
                to="/about"
                className="inline-flex h-11 items-center justify-center border border-border/50 bg-transparent px-8 text-xs font-bold uppercase tracking-wider text-foreground hover:bg-muted/10 transition-colors"
              >
                LEARN MORE
              </Link>
            </div>
          </motion.div>

          {/* Right side — Fingerprint visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            className="relative flex flex-col items-end justify-center"
          >
            <img
              src={fingerprintVisual}
              alt="Digital Fingerprint"
              className="relative w-full max-w-[500px] h-auto object-contain mix-blend-screen opacity-90"
            />

            <div className="mt-8 flex flex-col items-end gap-3 mr-4">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                TRUSTED BY INDUSTRY LEADERS
              </span>
              <div className="flex items-center gap-8 text-muted-foreground/50">
                {/* SVG placeholders for IBM, AWS */}
                <svg viewBox="0 0 100 30" className="h-4 w-auto fill-current">
                  <path d="M0,0h25v5H0V0z M0,10h25v5H0V10z M0,20h25v5H0V20z M35,0h25v30H35V0z M70,0h30v5H70V0z M70,10h30v5H70V10z M70,20h30v5H70V20z" />
                </svg>
                <svg viewBox="0 0 100 40" className="h-5 w-auto fill-current">
                  <path d="M20,30 C30,40 70,40 80,30 C60,45 40,45 20,30 Z M40,10 L50,0 L60,10 Z M30,10h40v10h-40z" />
                </svg>
                <Github className="h-5 w-5" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats bar at bottom */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="relative z-10 bg-[#0A0D14] border-t border-border/10"
      >
        <div className="mx-auto max-w-7xl">
          <LiveCounter completedRounds={completedRounds} failures={failures} />
        </div>
      </motion.div>
    </section>
  );
}