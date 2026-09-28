const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Scroll-reveal animation (children of a grid stagger in)
const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    }
  },
  { threshold: 0.12 }
);

document.querySelectorAll(".reveal").forEach((el) => {
  const siblings = el.parentElement.querySelectorAll(":scope > .reveal");
  const index = Array.prototype.indexOf.call(siblings, el);
  if (el.parentElement.matches(".skills-grid, .projects-grid")) {
    el.style.transitionDelay = `${index * 90}ms`;
  }
  observer.observe(el);
});

// Duplicate marquee items so the loop is seamless
const marqueeTrack = document.querySelector(".marquee-track");
if (marqueeTrack) {
  [...marqueeTrack.children].forEach((item) => {
    const clone = item.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    marqueeTrack.appendChild(clone);
  });
}

// Scroll progress bar + back-to-top ring, eased with a spring-like lerp
const bar = document.getElementById("scroll-progress");
const ring = document.getElementById("to-top-ring");
const toTop = document.getElementById("to-top");
const ringLength = 2 * Math.PI * 20;
ring.style.strokeDasharray = ringLength;

let target = 0;
let current = 0;
let ticking = false;

function readScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  target = max > 0 ? window.scrollY / max : 0;
  toTop.classList.toggle("show", window.scrollY > window.innerHeight * 0.6);
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(step);
  }
}

function step() {
  current = reduceMotion ? target : current + (target - current) * 0.18;
  if (Math.abs(target - current) < 0.0005) current = target;
  bar.style.transform = `scaleX(${current})`;
  ring.style.strokeDashoffset = ringLength * (1 - current);
  if (current !== target) {
    requestAnimationFrame(step);
  } else {
    ticking = false;
  }
}

window.addEventListener("scroll", readScroll, { passive: true });
window.addEventListener("resize", readScroll);
readScroll();

// Active nav link with sliding indicator
const navLinks = [...document.querySelectorAll(".nav-links a")];
const indicator = document.querySelector(".nav-indicator");

function moveIndicator(link) {
  if (!link) {
    indicator.style.opacity = "0";
    return;
  }
  indicator.style.opacity = "1";
  indicator.style.width = `${link.offsetWidth}px`;
  indicator.style.transform = `translateX(${link.offsetLeft}px)`;
}

const sectionObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        const active = navLinks.find((a) => a.getAttribute("href") === `#${entry.target.id}`);
        navLinks.forEach((a) => a.classList.toggle("active", a === active));
        moveIndicator(active);
      }
    }
  },
  { rootMargin: "-45% 0px -50% 0px" }
);
document.querySelectorAll("section[id]").forEach((s) => sectionObserver.observe(s));
window.addEventListener("scroll", () => {
  if (window.scrollY < window.innerHeight * 0.4) {
    navLinks.forEach((a) => a.classList.remove("active"));
    moveIndicator(null);
  }
}, { passive: true });

// Cursor-following spotlight on cards
document.querySelectorAll(".spotlight").forEach((card) => {
  card.addEventListener("pointermove", (e) => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    card.style.setProperty("--my", `${e.clientY - rect.top}px`);
  });
});

// Text scramble cycling through words in the hero
const scrambleEl = document.querySelector(".scramble");
if (scrambleEl && !reduceMotion) {
  const words = scrambleEl.dataset.words.split(",");
  const chars = "abcdefghijklmnopqrstuvwxyz#%&*";
  let wordIndex = 0;

  function scrambleTo(word) {
    const from = scrambleEl.textContent;
    const length = Math.max(from.length, word.length);
    const frames = 22;
    let frame = 0;
    const tick = () => {
      let out = "";
      for (let i = 0; i < length; i++) {
        const settleAt = (i / length) * frames * 0.7 + frames * 0.3;
        if (frame >= settleAt) out += word[i] || "";
        else out += chars[Math.floor(Math.random() * chars.length)];
      }
      scrambleEl.textContent = out;
      if (frame++ < frames) requestAnimationFrame(tick);
      else scrambleEl.textContent = word;
    };
    tick();
  }

  setInterval(() => {
    wordIndex = (wordIndex + 1) % words.length;
    scrambleTo(words[wordIndex]);
  }, 2800);
}

// Animated stat counters
const counterObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      counterObserver.unobserve(entry.target);
      const el = entry.target;
      const end = Number(el.dataset.count);
      if (reduceMotion) {
        el.textContent = end;
        continue;
      }
      const duration = 1400;
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(end * eased);
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
  },
  { threshold: 0.6 }
);
document.querySelectorAll("[data-count]").forEach((el) => counterObserver.observe(el));

// Current year in footer
document.getElementById("year").textContent = new Date().getFullYear();
