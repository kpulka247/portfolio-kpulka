import { useEffect, useState } from "react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { PiCopyBold } from "react-icons/pi";

import { EMAIL, GITHUB_URL, LINKEDIN_URL } from "../data/contact";

const COPIED_MS = 2_000;

const SOCIALS = [
  { href: LINKEDIN_URL, label: "LinkedIn", Icon: FaLinkedin },
  { href: GITHUB_URL, label: "GitHub", Icon: FaGithub },
] as const;

// The last band of the About panel.
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
    <div
      id="contact"
      role="group"
      aria-labelledby="contact-heading"
      className="mt-7 scroll-mt-24 border-t-[1.5px] border-ink pt-5 md:mt-12 md:pt-6"
    >
      <div className="flex items-center justify-between gap-3">
        <h3
          id="contact-heading"
          className="font-display text-[26px] leading-none md:text-lg font-extrabold [font-stretch:108%]"
        >
          Get in touch
        </h3>
        <div className="flex gap-2">
          {SOCIALS.map(({ href, label, Icon }) => (
            <a
              key={label}
              href={href}
              aria-label={label}
              className="inline-flex size-11 items-center justify-center rounded-full shadow-[inset_0_0_0_1.5px_var(--color-ink)] transition-colors hover:bg-ink/8"
            >
              <Icon aria-hidden="true" className="size-5" />
            </a>
          ))}
        </div>
      </div>
      <p className="mt-2.5 text-[15px] leading-normal text-ink-dim">
        Open to full-time and contract roles. Email reaches me fastest.
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-x-6 gap-y-4 md:mt-7">
        <a
          href={`mailto:${EMAIL}`}
          className="font-display text-[clamp(24px,9.2cqi,44px)] leading-none font-extrabold tracking-[-0.02em] underline decoration-transparent decoration-2 underline-offset-8 transition-colors [font-stretch:80%] hover:decoration-ink @md:text-[clamp(30px,8.6cqi,44px)] @md:[font-stretch:96%]"
        >
          {EMAIL}
        </a>
        <button
          type="button"
          onClick={copy}
          className="inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-ink px-5.5 text-[15px] font-semibold text-ground transition-colors hover:bg-sheet md:w-auto"
        >
          <PiCopyBold aria-hidden="true" className="size-4.5" />
          {copied ? "Copied" : "Copy address"}
        </button>
        <span aria-live="polite" className="sr-only">
          {copied ? "Email address copied" : ""}
        </span>
      </div>
    </div>
  );
}
