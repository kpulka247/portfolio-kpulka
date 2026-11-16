import type { ReactNode } from "react";
import { PiArrowLeftBold } from "react-icons/pi";
import { Link } from "react-router";

import Footer from "./Footer";
import { Navbar } from "./Navbar";

// The layout of the privacy pages: the title and date on the left, the
// text on the right, from the Privacy frame in Doop.
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
      <main
        id="main"
        className="mx-auto max-w-[1280px] px-5 pt-24 pb-24 text-soft md:px-16 md:pt-32 md:pb-28"
      >
        <Link
          to={back.to}
          className="inline-flex min-h-11 items-center gap-2 text-sm underline decoration-dim underline-offset-4 hover:text-paper hover:decoration-paper"
        >
          <PiArrowLeftBold aria-hidden="true" className="size-4" />
          {back.label}
        </Link>
        <div className="mt-8 grid gap-10 md:mt-10 lg:grid-cols-[340px_minmax(0,640px)] lg:gap-20">
          <div>
            <h1 className="font-display text-[48px] leading-[0.95] font-[850] tracking-[-0.02em] text-paper [font-stretch:112%] md:text-2xl">
              {title}
            </h1>
            <p className="mt-4 text-sm text-dim md:mt-5">
              Last updated {updated}
            </p>
          </div>
          <article className="text-base leading-[1.6]">
            <p className="text-[19px] leading-normal text-paper md:text-md">
              {lead}
            </p>
            {children}
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}

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
    <a
      href={href}
      className="text-paper underline decoration-dim decoration-1 underline-offset-4 hover:decoration-paper"
    >
      {children}
    </a>
  );
}
