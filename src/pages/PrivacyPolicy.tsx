import type { ReactNode } from "react";
import { PiArrowLeftBold } from "react-icons/pi";
import { Link, type MetaFunction } from "react-router";

import { BEACON_TOKEN } from "../analytics";
import Footer from "../components/Footer";
import { Navbar } from "../components/Navbar";
import { EMAIL } from "../data/contact";
import { pageMeta } from "../seo";

const UPDATED = "15 November 2026";

export const meta: MetaFunction = () =>
  pageMeta({
    title: "Privacy | Kamil Pułka",
    description: "What kpulka.com stores, who hosts it, and your rights.",
    path: "/privacy",
    image: "/og/home.jpg",
    imageAlt: "Kamil Pułka, full-stack developer, over a field of pins",
  });

export default function PrivacyPolicy() {
  return (
    <>
      <Navbar />
      <main
        id="main"
        className="mx-auto max-w-[1280px] px-5 pt-24 pb-24 text-soft md:px-16 md:pt-32 md:pb-28"
      >
        <Link
          to="/"
          className="inline-flex min-h-11 items-center gap-2 text-sm underline decoration-dim underline-offset-4 hover:text-paper hover:decoration-paper"
        >
          <PiArrowLeftBold aria-hidden="true" className="size-4" />
          Home
        </Link>
        <div className="mt-8 grid gap-10 md:mt-10 lg:grid-cols-[340px_minmax(0,640px)] lg:gap-20">
          <div>
            <h1 className="font-display text-[48px] leading-[0.95] font-[850] tracking-[-0.02em] text-paper [font-stretch:112%] md:text-2xl">
              Privacy
            </h1>
            <p className="mt-4 text-sm text-dim md:mt-5">
              Last updated {UPDATED}
            </p>
          </div>

          <article className="text-base leading-[1.6]">
            <p className="text-[19px] leading-normal text-paper md:text-md">
              This site sets no cookies and stores nothing on your device. There
              is no cookie banner because there is nothing to agree to.
            </p>

            <Section title="Who runs this site">
              <p>
                Kamil Pułka, Poland. Write to{" "}
                <TextLink href={`mailto:${EMAIL}`}>{EMAIL}</TextLink> about
                anything on this page.
              </p>
            </Section>

            {BEACON_TOKEN && (
              <Section title="Visit statistics">
                <p>
                  I count visits with Cloudflare Web Analytics. It does not use
                  cookies, local storage or fingerprinting, and it does not
                  follow you to other sites. It records the page you opened, the
                  site that sent you, your browser, operating system and
                  country, and how fast the page loaded.
                </p>
                <p>
                  The legal basis is my legitimate interest in knowing which
                  pages people read (Article 6(1)(f) GDPR). Cloudflare processes
                  this data for me and is certified under the EU-US Data Privacy
                  Framework.
                </p>
              </Section>
            )}

            <Section title="Hosting">
              <p>
                The site is hosted on GitHub Pages. GitHub receives your IP
                address when your browser loads the page, as every web host
                does, and keeps it in its server logs for security.
              </p>
            </Section>

            <Section title="Fonts and scripts">
              <p>
                Fonts, images and the site's own code are served from this site.
                {BEACON_TOKEN
                  ? " The only third-party file is Cloudflare's analytics script, described above."
                  : " No file loads from another site."}{" "}
                Nothing loads from Google.
              </p>
            </Section>

            <Section title="When you email me">
              <p>
                I keep your message and address only as long as the conversation
                needs, and I never share them.
              </p>
            </Section>

            <Section title="Dark Connect">
              <p>
                Dark Connect, my browser extension for Garmin Connect, collects
                no data. It changes how Garmin Connect looks, on your device and
                only on Garmin's own sites. It does not read or send your
                browsing, health data or logins, and it contains no analytics or
                trackers.
              </p>
              <p>
                The store you install it from, such as the Chrome Web Store,
                counts visits to its listing and installs under its own privacy
                policy.
              </p>
            </Section>

            <Section title="Your rights">
              <p>
                You can ask me what I hold about you, ask me to correct or
                delete it, or object to the processing. You can also complain to
                the Polish data protection authority, the{" "}
                <TextLink href="https://uodo.gov.pl/en">
                  President of the Personal Data Protection Office (UODO)
                </TextLink>
                .
              </p>
            </Section>

            <Section title="Changes">
              <p>
                When this policy changes, the new version goes on this page with
                a new date at the top.
              </p>
            </Section>
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-12 space-y-3.5 md:mt-14">
      <h2 className="font-display text-[24px] leading-tight font-extrabold text-paper [font-stretch:108%] md:text-lg">
        {title}
      </h2>
      {children}
    </section>
  );
}

function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className="text-paper underline decoration-dim decoration-1 underline-offset-4 hover:decoration-paper"
    >
      {children}
    </a>
  );
}
