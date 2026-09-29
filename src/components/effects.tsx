import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { ArrowUp, Check } from "lucide-react";
import { useUI } from "../hooks/ui";

/* ---------- Scroll progress bar ---------- */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 40, restDelta: 0.001 });
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-[3px] bg-accent/10">
      <motion.div
        className="h-full origin-left bg-gradient-to-r from-accent via-accent-2 to-accent-3 shadow-[0_0_12px_rgb(var(--glow)/0.7)]"
        style={{ scaleX }}
      />
    </div>
  );
}

/* ---------- Back to top with progress ring ---------- */
export function BackToTop() {
  const { scrollY, scrollYProgress } = useScroll();
  const [show, setShow] = useState(false);
  const dash = useTransform(scrollYProgress, (v) => 126 * (1 - v));

  useEffect(() => scrollY.on("change", (v) => setShow(v > window.innerHeight * 0.8)), [scrollY]);

  return (
    <AnimatePresence>
      {show && (
        <motion.a
          href="#top"
          aria-label="Back to top"
          className="fixed right-4 bottom-4 z-50 grid size-12 place-items-center rounded-full border border-line bg-surface/80 text-accent backdrop-blur-md md:right-6 md:bottom-6"
          initial={{ opacity: 0, y: 16, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.8 }}
          whileHover={{ y: -3 }}
        >
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 48 48" aria-hidden="true">
            <motion.circle
              cx="24"
              cy="24"
              r="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="126"
              style={{ strokeDashoffset: dash }}
            />
          </svg>
          <ArrowUp className="size-4" />
        </motion.a>
      )}
    </AnimatePresence>
  );
}

/* ---------- Custom cursor ring (fine pointers only) ---------- */
export function CursorRing() {
  const reduce = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState<"default" | "link" | "view">("default");
  const [visible, setVisible] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 500, damping: 40, mass: 0.4 });

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    setEnabled(mq.matches && !reduce);
  }, [reduce]);

  useEffect(() => {
    if (!enabled) return;
    const onMove = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
      const target = e.target as HTMLElement | null;
      const view = target?.closest?.("[data-cursor='view']");
      const link = target?.closest?.("a, button, [role='button'], input, [data-cursor='link']");
      setMode(view ? "view" : link ? "link" : "default");
    };
    const onLeave = () => setVisible(false);
    window.addEventListener("pointermove", onMove);
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  const size = mode === "view" ? 76 : mode === "link" ? 44 : 28;
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-[100] grid place-items-center rounded-full border font-mono text-[11px] font-semibold tracking-wider uppercase"
      style={{ x: sx, y: sy, translateX: "-50%", translateY: "-50%" }}
      animate={{
        width: size,
        height: size,
        opacity: visible ? 1 : 0,
        backgroundColor: mode === "view" ? "var(--accent)" : "rgba(0,0,0,0)",
        borderColor: mode === "default" ? "var(--line-strong)" : "var(--accent)",
        color: "var(--accent-ink)",
      }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      <AnimatePresence>
        {mode === "view" && (
          <motion.span initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }}>
            Open
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ---------- Hero particle network ---------- */
type Node = { x: number; y: number; vx: number; vy: number; r: number };

export function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || reduce) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let nodes: Node[] = [];
    let raf = 0;
    let running = true;
    const mouse = { x: -9999, y: -9999 };
    let rgb = "78, 225, 160";

    const readColor = () => {
      rgb = getComputedStyle(document.documentElement).getPropertyValue("--glow").trim().split(/\s+/).join(", ");
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(90, Math.round((width * height) / 14000));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.4 + 0.8,
      }));
    };

    const LINK = 130;
    const MOUSE = 170;

    const draw = () => {
      if (!running) return;
      ctx.clearRect(0, 0, width, height);
      for (const n of nodes) {
        const dx = mouse.x - n.x;
        const dy = mouse.y - n.y;
        const d = Math.hypot(dx, dy);
        if (d < MOUSE && d > 0) {
          // gentle pull toward the cursor
          n.vx += (dx / d) * 0.012;
          n.vy += (dy / d) * 0.012;
        }
        n.vx *= 0.99;
        n.vy *= 0.99;
        const speed = Math.hypot(n.vx, n.vy);
        if (speed < 0.12) {
          n.vx += (Math.random() - 0.5) * 0.05;
          n.vy += (Math.random() - 0.5) * 0.05;
        }
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;
      }

      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < LINK) {
            ctx.strokeStyle = `rgba(${rgb}, ${0.16 * (1 - d / LINK)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
        const dm = Math.hypot(a.x - mouse.x, a.y - mouse.y);
        if (dm < MOUSE) {
          ctx.strokeStyle = `rgba(${rgb}, ${0.45 * (1 - dm / MOUSE)})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
        ctx.fillStyle = `rgba(${rgb}, ${dm < MOUSE ? 0.95 : 0.55})`;
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    const visibility = new IntersectionObserver(([entry]) => {
      const wasRunning = running;
      running = entry.isIntersecting;
      if (running && !wasRunning) raf = requestAnimationFrame(draw);
    });

    readColor();
    resize();
    visibility.observe(canvas);
    raf = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove);
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("themechange", readColor);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      visibility.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("themechange", readColor);
    };
  }, [reduce]);

  return <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 size-full" />;
}

/* ---------- Toast ---------- */
export function Toast() {
  const { toastMessage } = useUI();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[90] flex justify-center px-4" role="status" aria-live="polite">
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            key={toastMessage.id}
            className="flex items-center gap-2 rounded-full border border-line bg-surface/95 px-4 py-2.5 text-sm font-medium text-heading shadow-2xl backdrop-blur-md"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
          >
            <span className="grid size-5 place-items-center rounded-full bg-accent text-accent-ink">
              <Check className="size-3.5" strokeWidth={3} />
            </span>
            {toastMessage.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
