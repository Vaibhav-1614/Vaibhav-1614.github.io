import { MotionConfig } from "motion/react";
import { UIProvider } from "./hooks/ui";
import { Nav } from "./components/Nav";
import { Hero, Marquee } from "./components/Hero";
import { About, Contact, Footer, Skills } from "./components/Sections";
import { Projects } from "./components/Projects";
import { CommandPalette } from "./components/CommandPalette";
import { BackToTop, CursorRing, ScrollProgress, Toast } from "./components/effects";

export function App() {
  return (
    <MotionConfig reducedMotion="user">
      <UIProvider>
        <a
          href="#projects"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-ink"
        >
          Skip to projects
        </a>
        <ScrollProgress />
        <Nav />
        <main>
          <Hero />
          <Marquee />
          <About />
          <Skills />
          <Projects />
          <Contact />
        </main>
        <Footer />
        <BackToTop />
        <CommandPalette />
        <Toast />
        <CursorRing />
      </UIProvider>
    </MotionConfig>
  );
}
