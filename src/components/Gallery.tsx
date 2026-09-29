import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import { imagePath, type Screenshot } from "../data/projects";

const slide = {
  enter: (dir: number) => ({ x: dir * 60, opacity: 0, scale: 0.98 }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit: (dir: number) => ({ x: dir * -60, opacity: 0, scale: 0.98 }),
};

export function Gallery({ slug, shots, title }: { slug: string; shots: Screenshot[]; title: string }) {
  const [[index, dir], setState] = useState<[number, number]>([0, 0]);
  const [lightbox, setLightbox] = useState(false);
  const dragged = useRef(false);
  const shot = shots[index];

  const go = useCallback(
    (delta: number) => setState(([i]) => [(i + delta + shots.length) % shots.length, delta]),
    [shots.length],
  );

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        setLightbox(false);
      } else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [lightbox, go]);

  const arrows = (big = false) => (
    <>
      {[
        { d: -1, Icon: ChevronLeft, pos: "left-2 md:left-3", label: "Previous screenshot" },
        { d: 1, Icon: ChevronRight, pos: "right-2 md:right-3", label: "Next screenshot" },
      ].map(({ d, Icon, pos, label }) => (
        <button
          key={d}
          type="button"
          aria-label={label}
          onClick={(e) => {
            e.stopPropagation();
            go(d);
          }}
          className={`absolute top-1/2 ${pos} z-10 grid -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/55 text-white backdrop-blur-md transition hover:scale-110 hover:bg-black/75 ${
            big ? "size-12" : "size-10"
          }`}
        >
          <Icon className="size-5" />
        </button>
      ))}
    </>
  );

  return (
    <div>
      <div
        className="group relative aspect-[16/10] overflow-hidden rounded-xl border border-line bg-bg"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") go(1);
          if (e.key === "ArrowLeft") go(-1);
        }}
      >
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.button
            type="button"
            key={shot.file}
            custom={dir}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.4}
            onDragStart={() => (dragged.current = true)}
            onDragEnd={(_, info) => {
              setTimeout(() => (dragged.current = false), 0);
              if (info.offset.x < -60) go(1);
              else if (info.offset.x > 60) go(-1);
            }}
            onClick={() => !dragged.current && setLightbox(true)}
            className="absolute inset-0 grid cursor-zoom-in place-items-center p-2"
            aria-label={`Enlarge screenshot: ${shot.caption}`}
          >
            <img
              src={imagePath(slug, shot.file)}
              alt={`${title}: ${shot.caption}`}
              className="max-h-full max-w-full rounded-md object-contain select-none"
              draggable={false}
              loading="lazy"
            />
          </motion.button>
        </AnimatePresence>
        {shots.length > 1 && arrows()}
        <span className="pointer-events-none absolute top-3 right-3 z-10 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 font-mono text-[11px] text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
          <Maximize2 className="size-3" /> Click to enlarge
        </span>
      </div>

      <div className="mt-3 flex items-start justify-between gap-4">
        <AnimatePresence mode="wait">
          <motion.p
            key={shot.file}
            className="text-sm text-muted"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            {shot.caption}
          </motion.p>
        </AnimatePresence>
        <span className="shrink-0 font-mono text-xs text-muted">
          {index + 1} / {shots.length}
        </span>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
        {shots.map((s, i) => (
          <button
            key={s.file}
            type="button"
            onClick={() => setState([i, i > index ? 1 : -1])}
            aria-label={`Show screenshot ${i + 1}: ${s.caption}`}
            aria-current={i === index ? "true" : undefined}
            className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition ${
              i === index ? "border-accent" : "border-transparent opacity-55 hover:opacity-100"
            }`}
          >
            <img src={imagePath(slug, s.file, true)} alt="" className="size-full object-cover object-top" loading="lazy" />
          </button>
        ))}
      </div>

      {createPortal(
        <AnimatePresence>
          {lightbox && (
            <motion.div
              className="fixed inset-0 z-[95] flex flex-col items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLightbox(false)}
              role="dialog"
              aria-modal="true"
              aria-label="Screenshot viewer"
            >
              <button
                type="button"
                autoFocus
                aria-label="Close viewer"
                className="absolute top-4 right-4 grid size-11 place-items-center rounded-full border border-white/15 bg-white/10 text-white transition hover:rotate-90 hover:bg-white/20"
                onClick={() => setLightbox(false)}
              >
                <X className="size-5" />
              </button>
              <AnimatePresence initial={false} custom={dir} mode="popLayout">
                <motion.img
                  key={shot.file}
                  src={imagePath(slug, shot.file)}
                  alt={`${title}: ${shot.caption}`}
                  custom={dir}
                  variants={slide}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="max-h-[82vh] max-w-[94vw] rounded-lg object-contain shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                />
              </AnimatePresence>
              <p className="mt-4 max-w-2xl text-center text-sm text-white/80" onClick={(e) => e.stopPropagation()}>
                <span className="mr-2 font-mono text-white/50">
                  {index + 1}/{shots.length}
                </span>
                {shot.caption}
              </p>
              {shots.length > 1 && arrows(true)}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  );
}
