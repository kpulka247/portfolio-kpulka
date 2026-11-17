import { useEffect, useRef, useState } from "react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { PiListBold, PiXBold } from "react-icons/pi";
import { Link } from "react-router";

import { projects } from "../content/projects";
import { EMAIL, GITHUB_URL, LINKEDIN_URL } from "../data/contact";
import { ThemeToggle } from "./ThemeSwitch";

const LINKS = [
  { href: "/#work", label: "Work" },
  { href: "/#stack", label: "Stack" },
  { href: "/#about", label: "About" },
  { href: "/#contact", label: "Contact" },
];

type Surface = "ground" | "sheet";

// The surface under the nav: of the elements marked with data-surface that
// span this height, the last in the page, which draws on top. It reads
// their boxes, not hit testing, so it also works while a page transition
// covers the page.
function surfaceUnder(y: number): Surface {
  let surface: Surface = "sheet";
  for (const marked of document.querySelectorAll<HTMLElement>(
    "[data-surface]",
  )) {
    const { top, bottom } = marked.getBoundingClientRect();
    if (top <= y && y < bottom) {
      surface = marked.dataset.surface === "ground" ? "ground" : "sheet";
    }
  }
  return surface;
}

// On the ground the nav takes the ink, so it matches the name in both
// themes. On the sheet it is white with mix-blend-difference, which keeps
// it readable on the sheet in either theme and over the screenshots that
// pass under it.
function useSurface(headerRef: React.RefObject<HTMLElement | null>) {
  const [surface, setSurface] = useState<Surface>("ground");
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const header = headerRef.current;
      if (!header) return;
      const { top, height } = header.getBoundingClientRect();
      setSurface(surfaceUnder(top + height / 2));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("scroll", schedule);
      removeEventListener("resize", schedule);
    };
  }, [headerRef]);
  return surface;
}

export function Navbar() {
  const menuRef = useRef<HTMLDialogElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const surface = useSurface(headerRef);

  return (
    <>
      {/* The bar stops short of the screen's top edge: iOS 26 Safari copies
          a fixed element that touches it into the status bar, blurred. */}
      <header
        ref={headerRef}
        className={`site-nav pointer-events-none fixed inset-x-0 top-4 z-50 flex items-center justify-between px-5 md:top-6 md:px-10 ${
          surface === "ground" ? "text-ink" : "text-white mix-blend-difference"
        }`}
      >
        <Link
          to="/"
          className="pointer-events-auto font-display text-lg leading-none font-extrabold [font-stretch:120%]"
        >
          kpulka
        </Link>
        <nav
          aria-label="Main"
          className="pointer-events-auto hidden items-center gap-8 md:flex"
        >
          {LINKS.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="border-b-[1.5px] border-transparent py-1.5 text-sm font-medium hover:border-current"
            >
              {link.label}
            </Link>
          ))}
          <ThemeToggle />
        </nav>
        <div className="pointer-events-auto flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            aria-label="Open menu"
            aria-haspopup="dialog"
            onClick={() => {
              const menu = menuRef.current;
              menu?.showModal();
              // showModal focuses the first link, and Safari then draws its
              // focus ring around the logo. Focus the dialog itself instead;
              // Tab still reaches the links.
              menu?.focus();
            }}
            className="icon-btn icon-btn-compact icon-btn-bare"
          >
            <PiListBold aria-hidden="true" className="size-5" />
          </button>
        </div>
      </header>
      <MobileMenu menuRef={menuRef} />
    </>
  );
}

// A native <dialog> opened with showModal(): the browser traps focus, closes
// it on Escape, makes the page behind it inert and returns focus afterwards.
function MobileMenu({
  menuRef,
}: {
  menuRef: React.RefObject<HTMLDialogElement | null>;
}) {
  const close = () => menuRef.current?.close();

  return (
    <dialog
      ref={menuRef}
      aria-label="Menu"
      tabIndex={-1}
      className="menu-dialog m-0 outline-none h-dvh max-h-none w-full max-w-none bg-sheet p-0 text-paper backdrop:bg-sheet open:flex"
    >
      <div className="flex w-full flex-col px-5 pt-4 pb-8">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            onClick={close}
            className="font-display text-lg leading-none font-extrabold [font-stretch:120%]"
          >
            kpulka
          </Link>
          <button
            type="button"
            aria-label="Close menu"
            onClick={close}
            className="icon-btn"
          >
            <PiXBold aria-hidden="true" className="size-5" />
          </button>
        </div>
        <nav aria-label="Main" className="mt-14 border-t border-rule">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={close}
              className="flex items-center justify-between border-b border-rule py-3.5 font-display text-[48px] leading-none font-extrabold tracking-[-0.02em] [font-stretch:112%]"
            >
              {link.label}
              {link.label === "Work" && (
                <span className="font-body text-sm font-medium tracking-normal text-dim [font-stretch:100%]">
                  {projects.length} projects
                </span>
              )}
            </Link>
          ))}
        </nav>
        <div className="mt-auto pt-10">
          <p className="text-sm text-dim">
            Email is the fastest way to reach me
          </p>
          <a
            href={`mailto:${EMAIL}`}
            className="mt-1.5 block text-md font-semibold"
          >
            {EMAIL}
          </a>
          <div className="mt-5 flex gap-2.5">
            <a href={LINKEDIN_URL} aria-label="LinkedIn" className="icon-btn">
              <FaLinkedin aria-hidden="true" className="size-5" />
            </a>
            <a href={GITHUB_URL} aria-label="GitHub" className="icon-btn">
              <FaGithub aria-hidden="true" className="size-5" />
            </a>
          </div>
        </div>
      </div>
    </dialog>
  );
}
