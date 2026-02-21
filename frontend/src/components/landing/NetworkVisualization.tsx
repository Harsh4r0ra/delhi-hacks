import { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  phase: number;
}

export default function NetworkVisualization() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const nodesRef = useRef<Node[]>([]);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    const w = () => canvas.getBoundingClientRect().width;
    const h = () => canvas.getBoundingClientRect().height;

    nodesRef.current = [
      { x: 0.3, y: 0.3, vx: 0.0003, vy: 0.0002, radius: 8, phase: 0 },
      { x: 0.7, y: 0.3, vx: -0.0002, vy: 0.0003, radius: 8, phase: Math.PI / 2 },
      { x: 0.3, y: 0.7, vx: 0.0002, vy: -0.0002, radius: 8, phase: Math.PI },
      { x: 0.7, y: 0.7, vx: -0.0003, vy: -0.0001, radius: 8, phase: (3 * Math.PI) / 2 },
    ];

    const particles: { x: number; y: number; targetNode: number; progress: number; from: number }[] = [];

    const draw = () => {
      const W = w();
      const H = h();
      ctx.clearRect(0, 0, W, H);
      timeRef.current += 0.016;
      const t = timeRef.current;

      nodesRef.current.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0.15 || n.x > 0.85) n.vx *= -1;
        if (n.y < 0.15 || n.y > 0.85) n.vy *= -1;
      });

      // Draw connections
      for (let i = 0; i < 4; i++) {
        for (let j = i + 1; j < 4; j++) {
          const a = nodesRef.current[i];
          const b = nodesRef.current[j];
          const pulse = 0.15 + 0.1 * Math.sin(t * 2 + i + j);
          ctx.beginPath();
          ctx.moveTo(a.x * W, a.y * H);
          ctx.lineTo(b.x * W, b.y * H);
          ctx.strokeStyle = `hsla(142, 71%, 45%, ${pulse})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // Spawn particles
      if (Math.random() < 0.08) {
        const from = Math.floor(Math.random() * 4);
        let to = Math.floor(Math.random() * 4);
        while (to === from) to = Math.floor(Math.random() * 4);
        particles.push({ x: nodesRef.current[from].x, y: nodesRef.current[from].y, targetNode: to, progress: 0, from });
      }

      // Update & draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.progress += 0.015;
        if (p.progress >= 1) { particles.splice(i, 1); continue; }
        const a = nodesRef.current[p.from];
        const b = nodesRef.current[p.targetNode];
        const px = (a.x + (b.x - a.x) * p.progress) * W;
        const py = (a.y + (b.y - a.y) * p.progress) * H;
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(142, 71%, 55%, ${0.8 - p.progress * 0.5})`;
        ctx.fill();
      }

      // Draw nodes
      nodesRef.current.forEach((n, i) => {
        const nx = n.x * W;
        const ny = n.y * H;
        const glow = 0.3 + 0.2 * Math.sin(t * 3 + n.phase);

        const grad = ctx.createRadialGradient(nx, ny, 0, nx, ny, 24);
        grad.addColorStop(0, `hsla(142, 71%, 45%, ${glow})`);
        grad.addColorStop(1, "hsla(142, 71%, 45%, 0)");
        ctx.beginPath();
        ctx.arc(nx, ny, 24, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(nx, ny, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(142, 71%, 45%, ${0.8 + 0.2 * Math.sin(t * 2 + n.phase)})`;
        ctx.fill();

        ctx.fillStyle = "hsla(210, 40%, 92%, 0.7)";
        ctx.font = "11px Inter";
        ctx.textAlign = "center";
        ctx.fillText(`N${i + 1}`, nx, ny + 22);
      });

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      style={{ opacity: 0.6 }}
    />
  );
}