import { FaGithub, FaLinkedin } from "react-icons/fa";

import { GITHUB_URL, LINKEDIN_URL } from "../data/contact";

// Stays pinned while the black sheet scrolls over it. The pin board scene
// (step 8 of the redesign plan) mounts behind this copy. The bottom padding
// includes the 28 px (phone) or 40 px (desktop) that the sheet overlaps.
export function Hero() {
  return (
    <section
      aria-label="Introduction"
      className="sticky top-0 flex h-svh min-h-[560px] flex-col justify-end bg-ground px-5 pb-14 text-ink md:px-10 md:pb-22"
    >
      <h1 className="-ml-[0.04em] font-display text-hero leading-[0.82] font-[850] tracking-[-0.02em]">
        Kamil Pułka
      </h1>
      <div className="mt-5 flex flex-wrap items-end justify-between gap-6 md:mt-7">
        <div className="max-w-[560px]">
          <p className="text-[17px] leading-[1.4] font-medium md:text-md">
            Full-stack developer. I build and ship web apps, browser extensions
            and mobile apps that people use every day.
          </p>
          <p className="mt-2 text-sm text-ink-dim md:mt-2.5">
            Open to full-time and contract roles, remote-first, based in Poland.
          </p>
        </div>
        <div className="flex w-full items-center gap-2.5 md:w-auto">
          <a
            href="#work"
            className="inline-flex h-12 flex-1 items-center justify-center rounded-full bg-ink px-5.5 text-[15px] font-semibold text-ground transition-colors hover:bg-sheet md:flex-none"
          >
            See my work
          </a>
          <a
            href="#contact"
            className="inline-flex h-12 flex-1 items-center justify-center rounded-full px-5.5 text-[15px] font-semibold shadow-[inset_0_0_0_1.5px_var(--color-ink)] transition-colors hover:bg-ink/5 md:flex-none"
          >
            Get in touch
          </a>
          <a
            href={GITHUB_URL}
            aria-label="GitHub"
            className="hidden size-11 items-center justify-center rounded-full transition-colors hover:bg-ink/10 md:inline-flex"
          >
            <FaGithub aria-hidden="true" className="size-6" />
          </a>
          <a
            href={LINKEDIN_URL}
            aria-label="LinkedIn"
            className="hidden size-11 items-center justify-center rounded-full transition-colors hover:bg-ink/10 md:inline-flex"
          >
            <FaLinkedin aria-hidden="true" className="size-6" />
          </a>
        </div>
      </div>
    </section>
  );
}
