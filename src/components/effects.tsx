import { useEffect, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring, useTransform } from "motion/react";
import { ArrowUp, Check } from "lucide-react";
import { useUI } from "../hooks/ui";

/* ---------- Scroll progress bar ---------- */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 40, restDelta: 0.001 });
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-[3px] bg-transparent">
      <motion.div
        className="h-full origin-left bg-accent"
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
