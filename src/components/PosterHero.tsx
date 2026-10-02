import { useEffect, useRef, useState } from "react";
import "../poster-fonts.css";
import "../poster.css";
import { TextScramble } from "./primitives";

// Self-hosted copies of the two Higgsfield lilies (converted to WebP, 1280px, q85).
const FRONT_SRC = `${import.meta.env.BASE_URL}poster/lily-front.webp`;
const REVEAL_SRC = `${import.meta.env.BASE_URL}poster/lily-reveal.webp`;

const links = [
  { href: "#about", label: "About" },
  { href: "#projects", label: "Projects" },
  { href: "#skills", label: "Skills" },
  { href: "#contact", label: "Contact" },
];

const taglineWords = ["decisions", "dashboards", "forecasts", "answers", "insights"];

/* ---------- Morph-reveal trail ---------- */
const TRAIL_MAX_POINTS = 60;
const TRAIL_HEAD_R = 140;
const TRAIL_NOISE_AMP = 44;
const TRAIL_BLOB_PTS = 24;
const TRAIL_FADE_SPEED = 0.92;
const TRAIL_SAMPLE_DIST = 8;

type TrailPoint = { x: number; y: number; r: number; alpha: number; seed: number };

function drawMorphBlob(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, t: number, seed: number) {
  if (r < 2) return;
  const pts: [number, number][] = [];
  for (let i = 0; i < TRAIL_BLOB_PTS; i++) {
    const angle = (i / TRAIL_BLOB_PTS) * Math.PI * 2;
    const n1 = Math.sin(angle * 3 + t * 1.4 + seed) * 0.45;
    const n2 = Math.sin(angle * 5 - t * 0.9 + seed * 2.3) * 0.3;
    const n3 = Math.cos(angle * 2 + t * 1.8 + seed * 0.7) * 0.25;
    const noise = (n1 + n2 + n3) * TRAIL_NOISE_AMP * (r / TRAIL_HEAD_R);
    const rr = r + noise;
    pts.push([cx + Math.cos(angle) * rr, cy + Math.sin(angle) * rr]);
  }
  const mid = (a: [number, number], b: [number, number]) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] as const;
  ctx.beginPath();
  const start = mid(pts[TRAIL_BLOB_PTS - 1], pts[0]);
  ctx.moveTo(start[0], start[1]);
  for (let i = 0; i < TRAIL_BLOB_PTS; i++) {
    const p = pts[i];
    const m = mid(p, pts[(i + 1) % TRAIL_BLOB_PTS]);
    ctx.quadraticCurveTo(p[0], p[1], m[0], m[1]);
  }
  ctx.closePath();
  ctx.fillStyle = "#fff";
  ctx.fill();
}

class MorphTrailLayer {
  readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;

  constructor(
    private readonly layer: HTMLElement,
    private readonly invert: boolean,
  ) {
    this.canvas = document.createElement("canvas");
    this.canvas.className = "trail-canvas";
    this.canvas.setAttribute("aria-hidden", "true");
    layer.parentElement!.appendChild(this.canvas);
    this.ctx = this.canvas.getContext("2d")!;
    this.reset();
  }

  resize(width: number, height: number) {
    this.canvas.width = Math.max(1, Math.round(width));
    this.canvas.height = Math.max(1, Math.round(height));
  }

  /** Idle state: front fully visible, reveal fully hidden. */
  reset() {
    const value = this.invert ? "linear-gradient(#0000, #0000)" : "none";
    this.layer.style.maskImage = value;
    this.layer.style.webkitMaskImage = value;
  }

  render(points: TrailPoint[], time: number) {
    const { ctx, canvas } = this;
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!this.invert) {
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "destination-out";
    }
    for (const p of points) {
      ctx.globalAlpha = p.alpha;
      drawMorphBlob(ctx, p.x, p.y, p.r, time, p.seed);
    }
    ctx.globalAlpha = 1;
    const url = `url(${canvas.toDataURL()})`;
    this.layer.style.maskImage = url;
    this.layer.style.webkitMaskImage = url;
  }

  destroy() {
    this.canvas.remove();
    this.reset();
  }
}

function useMorphTrail(stageRef: React.RefObject<HTMLElement | null>, flowerRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const stage = stageRef.current;
    const flower = flowerRef.current;
    if (!stage || !flower) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const bg = flower.querySelector<HTMLElement>(".flower__layer--bg")!;
    const top = flower.querySelector<HTMLElement>(".flower__layer--top")!;
    const layers = [new MorphTrailLayer(bg, false), new MorphTrailLayer(top, true)];

    const points: TrailPoint[] = [];
    let hovering = false;
    let headRadius = 0;
    let time = 0;
    let pointer: { x: number; y: number } | null = null;
    let last: { x: number; y: number } | null = null;
    let raf = 0;

    const size = () => {
      layers.forEach((l) => l.resize(flower.offsetWidth, flower.offsetHeight));
    };

    const toCanvas = (e: MouseEvent) => {
      const rect = flower.getBoundingClientRect();
      if (!rect.width || !rect.height) return null;
      const c = layers[0].canvas;
      return {
        x: (e.clientX - rect.left) * (c.width / rect.width),
        y: (e.clientY - rect.top) * (c.height / rect.height),
      };
    };

    const frame = () => {
      raf = 0;
      const target = hovering ? TRAIL_HEAD_R : 0;
      headRadius += (target - headRadius) * (hovering ? 0.14 : 0.04);

      if (hovering && headRadius > 5 && pointer) {
        if (!last || Math.hypot(pointer.x - last.x, pointer.y - last.y) > TRAIL_SAMPLE_DIST) {
          points.push({ x: pointer.x, y: pointer.y, r: headRadius, alpha: 1, seed: Math.random() * 100 });
          if (points.length > TRAIL_MAX_POINTS) points.shift();
          last = { ...pointer };
        }
      }

      for (let i = points.length - 1; i >= 0; i--) {
        const p = points[i];
        p.alpha *= TRAIL_FADE_SPEED;
        p.r *= 0.995;
        if (p.alpha < 0.01) points.splice(i, 1);
      }
      time += 0.016;

      if (!points.length && headRadius < 0.5) {
        headRadius = 0;
        last = null;
        layers.forEach((l) => l.reset());
        return; // idle: stop the loop until the pointer moves again
      }
      layers.forEach((l) => l.render(points, time));
      raf = requestAnimationFrame(frame);
    };

    const wake = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };

    const onMove = (e: MouseEvent) => {
      hovering = true;
      pointer = toCanvas(e);
      wake();
    };
    const onLeave = () => {
      hovering = false;
      wake();
    };

    size();
    const ro = new ResizeObserver(size);
    ro.observe(flower);
    stage.addEventListener("mousemove", onMove);
    stage.addEventListener("mouseenter", onMove);
    stage.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      stage.removeEventListener("mousemove", onMove);
      stage.removeEventListener("mouseenter", onMove);
      stage.removeEventListener("mouseleave", onLeave);
      layers.forEach((l) => l.destroy());
    };
  }, [stageRef, flowerRef]);
}

/* ---------- Entrance: drop html.anim once the last orb-* animation ends ---------- */
function useEntranceOnce(stageRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains("anim")) return;
    const stage = stageRef.current;
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      root.classList.remove("anim");
    };
    const safety = window.setTimeout(finish, 6000);
    const check = (e: AnimationEvent) => {
      if (!e.animationName.startsWith("orb-")) return;
      const running = document.getAnimations().some((a) => {
        const name = (a as CSSAnimation).animationName;
        return typeof name === "string" && name.startsWith("orb-") && a.playState === "running";
      });
      if (!running) finish();
    };
    stage?.addEventListener("animationend", check);
    return () => {
      window.clearTimeout(safety);
      stage?.removeEventListener("animationend", check);
    };
  }, [stageRef]);
}

/* ---------- Mobile menu ---------- */
function useMobileMenu(open: boolean, close: () => void, sheetRef: React.RefObject<HTMLElement | null>, burgerRef: React.RefObject<HTMLButtonElement | null>) {
  useEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet) return;
    sheet.inert = !open;
    if (!open) return;

    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = "hidden";
    sheet.querySelector<HTMLElement>("a")?.focus({ preventScroll: true });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        burgerRef.current?.focus();
        return;
      }
      if (e.key !== "Tab") return;
      const focusable = [burgerRef.current, ...sheet.querySelectorAll<HTMLElement>("a[href]")].filter(Boolean) as HTMLElement[];
      const first = focusable[0];
      const lastEl = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      html.style.overflow = prevOverflow;
    };
  }, [open, close, sheetRef, burgerRef]);
}

export function PosterHero() {
  const stageRef = useRef<HTMLElement>(null);
  const flowerRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useRef(() => setMenuOpen(false)).current;

  useMorphTrail(stageRef, flowerRef);
  useEntranceOnce(stageRef);
  useMobileMenu(menuOpen, closeMenu, sheetRef, burgerRef);

  return (
    <div id="top" className={`viewport${menuOpen ? " menu-open" : ""}`}>
      <section ref={stageRef} className="stage" aria-labelledby="orbit-title">
        <a className="brand" href="#top" aria-label="Vaibhav Sharma, home">
          <svg className="brand-mark" viewBox="0 0 66 62" aria-hidden="true">
            <line x1="33" y1="1" x2="33" y2="61" />
            <line x1="3" y1="31" x2="63" y2="31" />
            <line x1="11.8" y1="9.8" x2="54.2" y2="52.2" />
            <line x1="54.2" y1="9.8" x2="11.8" y2="52.2" />
          </svg>
        </a>

        <nav className="primary-nav" aria-label="Primary">
          <ul>
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href}>{l.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <a className="system-pill" href="#contact">
          Open to roles
        </a>

        <h1 className="orbit-word" id="orbit-title" aria-label="Vaibhav Sharma">
          <span className="orbit-word__mask" aria-hidden="true">
            <span className="orbit-word__inner">
              <span className="orbit-word__white">
                <span className="orbit-word__o">V</span>AI
              </span>
              <span className="orbit-word__pink">BHAV</span>
            </span>
          </span>
        </h1>

        <div ref={flowerRef} className="flower">
          <img className="flower__sizer" src={FRONT_SRC} alt="" aria-hidden="true" />
          <div className="flower__layer flower__layer--bg">
            <img src={FRONT_SRC} alt="Pixel-art pink and violet lily" draggable={false} />
          </div>
          <div className="flower__layer flower__layer--top" aria-hidden="true">
            <img src={REVEAL_SRC} alt="" draggable={false} />
          </div>
        </div>

        <p className="poster-tagline">
          <span className="poster-tagline__inner">
            <span className="sr-only">I turn data into decisions and build the backends behind them.</span>
            <span aria-hidden="true">
              <span className="poster-tagline__line">
                I turn data into <TextScramble words={taglineWords} className="poster-tagline__word" />
              </span>
              and build the backends behind them.
            </span>
          </span>
        </p>

        <p className="support-copy support-copy--left">
          <span className="support-copy__inner">
            Data, AI &amp; backend,
            <br />
            built end to end.
          </span>
        </p>
        <p className="support-copy support-copy--right">
          <span className="support-copy__inner">
            Less guesswork.
            <br />
            More measured decisions.
          </span>
        </p>

      </section>

      <button
        ref={burgerRef}
        type="button"
        className="burger"
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
        aria-controls="poster-menu"
        onClick={() => setMenuOpen((o) => !o)}
      >
        <span className="burger__lines" aria-hidden="true">
          <span />
          <span />
        </span>
      </button>
      <button type="button" className="menu-scrim" tabIndex={-1} aria-label="Close menu" onClick={closeMenu} />
      <nav ref={sheetRef} id="poster-menu" className="menu-sheet" aria-label="Menu" onClick={(e) => (e.target as HTMLElement).closest("a") && closeMenu()}>
        <ul>
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href}>{l.label}</a>
            </li>
          ))}
        </ul>
        <a className="system-pill system-pill--sheet" href="#contact">
          Open to roles
        </a>
      </nav>
    </div>
  );
}
