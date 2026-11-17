import type { ReactNode } from "react";
import { PiArrowLeftBold } from "react-icons/pi";
import { Link } from "react-router";

import Footer from "./Footer";
import { Navbar } from "./Navbar";

// The layout of the privacy pages: the title, date and lead on the ground,
// the text on the sheet below, like a project page.
export function LegalPage({
  title,
  updated,
  back,
  lead,
  children,
}: {
  title: string;
  updated: string;
  back: { to: string; label: string };
  lead: ReactNode;
  children: ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main id="main">
        <div
          data-surface="ground"
          className="bg-ground pt-24 pb-19 text-ink md:pt-32 md:pb-26"
        >
          <div className={GRID}>
            <div>
              <Link
                to={back.to}
                viewTransition
                className="text-link inline-flex min-h-11 items-center gap-2 text-sm text-ink-dim hover:text-ink"
              >
                <PiArrowLeftBold aria-hidden="true" className="size-4" />
                {back.label}
              </Link>
              <h1 className="mt-8 font-display text-[48px] leading-[0.95] font-[850] tracking-[-0.02em] [font-stretch:112%] md:mt-10 md:text-2xl">
                {title}
              </h1>
              <p className="mt-4 text-sm text-ink-dim md:mt-5">
                Last updated {updated}
              </p>
            </div>
            <p className="text-[19px] leading-normal lg:self-end md:text-md">
              {lead}
            </p>
          </div>
        </div>
        <div
          data-surface="sheet"
          className="relative -mt-7 rounded-t-[28px] bg-sheet shadow-[0_-1px_0_var(--color-sheet-line)] pt-2 pb-24 text-soft md:-mt-10 md:rounded-t-sheet md:pt-4 md:pb-28"
        >
          <div className={GRID}>
            <article className="text-base leading-[1.6] lg:col-start-2">
              {children}
            </article>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

const GRID =
  "mx-auto grid max-w-[1280px] gap-10 px-5 md:px-16 lg:grid-cols-[340px_minmax(0,640px)] lg:gap-20";

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-12 space-y-3.5 md:mt-14">
      <h2 className="font-display text-[24px] leading-tight font-extrabold text-paper [font-stretch:108%] md:text-lg">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function TextLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a href={href} className="text-link text-paper">
      {children}
    </a>
  );
}
