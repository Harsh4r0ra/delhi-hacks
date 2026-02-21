import { motion } from "framer-motion";

const partners = [
  "MIT Lincoln Lab",
  "Stanford AI Lab",
  "DARPA",
  "OpenAI",
  "Anthropic",
  "DeepMind",
  "Palantir",
  "Anduril",
];

export default function TrustedBy() {
  return (
    <section className="relative border-y border-border/30 bg-card/30 py-8 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="mb-6 text-center text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/60">
          Trusted by Industry Leaders
        </p>
        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-background to-transparent" />
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="flex w-max gap-16"
          >
            {[...partners, ...partners].map((name, i) => (
              <span
                key={`${name}-${i}`}
                className="font-mono-code whitespace-nowrap text-sm font-semibold tracking-wider text-muted-foreground/40 transition-colors hover:text-muted-foreground/70"
              >
                {name}
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
