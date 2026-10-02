import { useEffect, useRef, useState, type ReactNode, type PointerEvent as ReactPointerEvent } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  type SpringOptions,
} from "motion/react";

/* ---------- Magnetic: element drifts toward the cursor ---------- */
const MAGNETIC_SPRING: SpringOptions = { stiffness: 26.7, damping: 4.1, mass: 0.2 };

export function Magnetic({
  children,
  intensity = 0.6,
  range = 100,
  className,
}: {
  children: ReactNode;
  intensity?: number;
  range?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, MAGNETIC_SPRING);
  const springY = useSpring(y, MAGNETIC_SPRING);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (!hovered || reduce) return;
    const onMove = (e: MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);
      const distance = Math.hypot(dx, dy);
      if (distance <= range) {
        const scale = 1 - distance / range;
        x.set(dx * intensity * scale);
        y.set(dy * intensity * scale);
      } else {
        x.set(0);
        y.set(0);
      }
    };
    document.addEventListener("mousemove", onMove);
    return () => document.removeEventListener("mousemove", onMove);
  }, [hovered, reduce, intensity, range, x, y]);

  return (
    <motion.div
      ref={ref}
      className={className ?? "inline-block"}
      style={{ x: springX, y: springY }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

/* ---------- Reveal on scroll ---------- */
export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ---------- Count-up number ---------- */
export function Counter({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  duration = 1.6,
}: {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const format = (n: number) =>
    prefix + n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;

  useEffect(() => {
    const el = ref.current;
    if (!el || !inView) return;
    if (reduce) {
      el.textContent = format(value);
      return;
    }
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (n) => (el.textContent = format(n)),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, value]);

  return (
    <span ref={ref} className="tabular-nums">
      {format(reduce ? value : 0)}
    </span>
  );
}

/* ---------- Text scramble cycling through words ---------- */
const GLYPHS = "abcdefghijklmnopqrstuvwxyz#%&*<>/";

export function TextScramble({ words, interval = 2800, className }: { words: string[]; interval?: number; className?: string }) {
  const [text, setText] = useState(words[0]);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    let index = 0;
    let frame = 0;
    let raf = 0;
    const timer = window.setInterval(() => {
      const from = words[index];
      index = (index + 1) % words.length;
      const to = words[index];
      const length = Math.max(from.length, to.length);
      const frames = 24;
      frame = 0;
      const tick = () => {
        let out = "";
        for (let i = 0; i < length; i++) {
          const settleAt = (i / length) * frames * 0.7 + frames * 0.3;
          out += frame >= settleAt ? (to[i] ?? "") : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
        setText(out);
        if (frame++ < frames) raf = requestAnimationFrame(tick);
        else setText(to);
      };
      tick();
    }, interval);
    return () => {
      window.clearInterval(timer);
      cancelAnimationFrame(raf);
    };
  }, [words, interval, reduce]);

  return (
    <span className={className} aria-live="off">
      {text}
    </span>
  );
}

/* ---------- Spotlight: feed cursor position to CSS ---------- */
export function trackSpotlight(e: ReactPointerEvent<HTMLElement>) {
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();
  el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
  el.style.setProperty("--my", `${e.clientY - rect.top}px`);
}

/* ---------- Section heading ---------- */
export function SectionHeading({ index, title, subtitle }: { index: string; title: string; subtitle?: string }) {
  return (
    <Reveal className="mb-10 md:mb-14">
      <div className="flex items-center gap-4">
        <span className="font-mono text-sm text-accent">{index}.</span>
        <h2 className="font-display text-5xl leading-none tracking-[-0.01em] text-heading md:text-7xl">{title}</h2>
        <motion.span
          className="h-px max-w-xs flex-1 origin-left bg-gradient-to-r from-line-strong to-transparent"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      {subtitle && <p className="mt-3 max-w-2xl text-muted">{subtitle}</p>}
    </Reveal>
  );
}

/* ---------- Brand icon (lucide no longer ships brand marks) ---------- */
export function GitHubIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

export const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
