import { useRef } from "react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { PiListBold, PiXBold } from "react-icons/pi";
import { Link } from "react-router";

import { projects } from "../content/projects";
import { EMAIL, GITHUB_URL, LINKEDIN_URL } from "../data/contact";

const LINKS = [
  { href: "/#work", label: "Work" },
  { href: "/#stack", label: "Stack" },
  { href: "/#about", label: "About" },
  { href: "/#contact", label: "Contact" },
];

// mix-blend-difference keeps the white nav readable on the light hero and on
// the black sheet without tracking the scroll position.
export function Navbar() {
  const menuRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex items-center justify-between px-5 py-4 text-white mix-blend-difference md:px-10 md:py-6">
        <Link
          to="/"
          className="pointer-events-auto font-display text-lg leading-none font-extrabold [font-stretch:120%]"
        >
          kpulka
        </Link>
        <nav
          aria-label="Main"
          className="pointer-events-auto hidden gap-8 md:flex"
        >
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="border-b-[1.5px] border-transparent py-1.5 text-sm font-medium transition-colors hover:border-current"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <button
          type="button"
          aria-label="Open menu"
          aria-haspopup="dialog"
          onClick={() => menuRef.current?.showModal()}
          className="pointer-events-auto inline-flex size-11 items-center justify-center md:hidden"
        >
          <PiListBold aria-hidden="true" className="size-6" />
        </button>
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
      className="m-0 h-dvh max-h-none w-full max-w-none bg-sheet p-0 text-paper backdrop:bg-sheet open:flex"
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
            className="inline-flex size-11 items-center justify-center rounded-full bg-raised"
          >
            <PiXBold aria-hidden="true" className="size-5" />
          </button>
        </div>
        <nav aria-label="Main" className="mt-14 border-t border-rule">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={close}
              className="flex items-center justify-between border-b border-rule py-3.5 font-display text-[48px] leading-none font-extrabold tracking-[-0.02em] [font-stretch:112%]"
            >
              {link.label}
              {link.label === "Work" && (
                <span className="font-body text-sm font-medium tracking-normal text-dim [font-stretch:100%]">
                  {projects.length} projects
                </span>
              )}
            </a>
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
          <div className="mt-5 flex gap-2">
            <a
              href={LINKEDIN_URL}
              aria-label="LinkedIn"
              className="inline-flex size-12 items-center justify-center rounded-full shadow-[inset_0_0_0_1px_var(--color-rule)]"
            >
              <FaLinkedin aria-hidden="true" className="size-5.5" />
            </a>
            <a
              href={GITHUB_URL}
              aria-label="GitHub"
              className="inline-flex size-12 items-center justify-center rounded-full shadow-[inset_0_0_0_1px_var(--color-rule)]"
            >
              <FaGithub aria-hidden="true" className="size-5.5" />
            </a>
          </div>
        </div>
      </div>
    </dialog>
  );
}
