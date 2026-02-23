import { useEffect, useState } from "react";

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (display === value) return;
    const step = value > display ? 1 : -1;
    const timer = setTimeout(() => setDisplay((d) => d + step), 40);
    return () => clearTimeout(timer);
  }, [display, value]);

  return <>{display}</>;
}

const stats = [
  { key: "accuracy", value: "99%", label: "Advanced threat detection accuracy", static: true },
  { key: "clients", value: "60+", label: "Enterprise clients protected globally", static: true },
  { key: "incidents", value: "120+", label: "Incidents resolved in real time monthly", static: true },
  { key: "monitoring", value: "24/7", label: "Continuous monitoring & response", static: true },
];

export default function LiveCounter({ completedRounds, failures }: { completedRounds: number; failures: number }) {
  // We adapt the "failures" to the incidents resolved to show dynamic data if we want,
  // but the screenshot shows static 120+. We'll use static for the exact match.

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border/10">
      {stats.map((s, i) => (
        <div key={s.key} className="relative bg-[#0A0D14] p-8 overflow-hidden group">
          {/* Subtle green dot background effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />

          <div className="relative z-10 flex flex-col gap-2">
            <span className="font-mono-code text-3xl font-bold text-white">
              {s.value}
            </span>
            <p className="text-xs leading-relaxed text-muted-foreground/80 max-w-[150px]">
              {s.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}