import { useEffect, useState } from "react";
import { FaGithub, FaLinkedin } from "react-icons/fa";

import { EMAIL, GITHUB_URL, LINKEDIN_URL } from "../data/contact";
import { SectionHeading } from "./SectionHeading";

const COPIED_MS = 2_000;

export function Contact() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), COPIED_MS);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    await navigator.clipboard.writeText(EMAIL);
    setCopied(true);
  };

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="scroll-mt-24"
    >
      <SectionHeading id="contact-heading">Contact</SectionHeading>
      <p className="mt-4 max-w-[40ch] text-base leading-normal text-soft md:mt-5 md:text-md">
        Email is the fastest way to reach me. I'm open to full-time and contract
        roles, remote-first.
      </p>
      <div className="mt-7 flex flex-col items-start gap-4.5 md:mt-10 md:flex-row md:flex-wrap md:items-center md:gap-7">
        <a
          href={`mailto:${EMAIL}`}
          className="font-display text-[clamp(28px,7.4vw,96px)] leading-none font-extrabold tracking-[-0.02em] text-paper [font-stretch:78%] md:[font-stretch:100%]"
        >
          {EMAIL}
        </a>
        <button
          type="button"
          onClick={copy}
          className="h-11 cursor-pointer rounded-full bg-paper px-4.5 text-[15px] font-semibold text-sheet transition-colors hover:bg-white"
        >
          {copied ? "Copied" : "Copy address"}
        </button>
        <span aria-live="polite" className="sr-only">
          {copied ? "Email address copied" : ""}
        </span>
      </div>
      <div className="mt-8 flex gap-6 md:mt-10 md:gap-7">
        <a
          href={LINKEDIN_URL}
          className="inline-flex min-h-11 items-center gap-2.5 text-paper underline decoration-dim decoration-1 underline-offset-4 hover:decoration-paper"
        >
          <FaLinkedin aria-hidden="true" className="size-5.5" />
          LinkedIn
        </a>
        <a
          href={GITHUB_URL}
          className="inline-flex min-h-11 items-center gap-2.5 text-paper underline decoration-dim decoration-1 underline-offset-4 hover:decoration-paper"
        >
          <FaGithub aria-hidden="true" className="size-5.5" />
          GitHub
        </a>
      </div>
    </section>
  );
}
