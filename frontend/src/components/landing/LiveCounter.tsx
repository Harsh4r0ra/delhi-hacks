import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (display === value) return;
    const step = value > display ? 1 : -1;
    const timer = setTimeout(() => setDisplay((d) => d + step), 40);
    return () => clearTimeout(timer);
  }, [display, value]);

  return <span className="font-mono-code text-3xl font-extrabold tabular-nums text-primary sm:text-4xl">{display}</span>;
}

const stats = [
  { key: "uptime", label: "Uptime", static: true, value: "99.99%" },
  { key: "rounds", label: "Consensus Rounds", static: false },
  { key: "failures", label: "Failures", static: false },
  { key: "monitoring", label: "Monitoring", static: true, value: "24/7" },
];

export default function LiveCounter({ completedRounds, failures }: { completedRounds: number; failures: number }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-8 sm:justify-between lg:gap-4">
      {stats.map((s, i) => (
        <div key={s.key} className="flex items-center gap-8">
          <div className="text-center">
            {s.static ? (
              <span className="font-mono-code text-3xl font-extrabold tabular-nums text-primary sm:text-4xl">
                {s.value}
              </span>
            ) : s.key === "rounds" ? (
              <AnimatedNumber value={completedRounds} />
            ) : (
              <span className="font-mono-code text-3xl font-extrabold tabular-nums text-primary sm:text-4xl">
                {failures}
              </span>
            )}
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              {s.label}
            </p>
          </div>
          {i < stats.length - 1 && (
            <Separator orientation="vertical" className="hidden h-12 bg-border/30 sm:block" />
          )}
        </div>
      ))}
    </div>
  );
}