import type { MetaFunction } from "react-router";

import { BEACON_TOKEN } from "../analytics";
import { LegalPage, LegalSection, TextLink } from "../components/LegalPage";
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
    <LegalPage
      title="Privacy"
      updated={UPDATED}
      back={{ to: "/", label: "Home" }}
      lead="This site sets no cookies and stores nothing on your device. There is no cookie banner because there is nothing to agree to."
    >
      <LegalSection title="Who runs this site">
        <p>
          Kamil Pułka, Poland. Write to{" "}
          <TextLink href={`mailto:${EMAIL}`}>{EMAIL}</TextLink> about anything
          on this page.
        </p>
      </LegalSection>

      {BEACON_TOKEN && (
        <LegalSection title="Visit statistics">
          <p>
            I count visits with Cloudflare Web Analytics. It does not use
            cookies, local storage or fingerprinting, and it does not follow you
            to other sites. It records the page you opened, the site that sent
            you, your browser, operating system and country, and how fast the
            page loaded.
          </p>
          <p>
            The legal basis is my legitimate interest in knowing which pages
            people read (Article 6(1)(f) GDPR). Cloudflare processes this data
            for me and is certified under the EU-US Data Privacy Framework.
          </p>
        </LegalSection>
      )}

      <LegalSection title="Hosting">
        <p>
          The site is hosted on GitHub Pages. GitHub receives your IP address
          when your browser loads the page, as every web host does, and keeps it
          in its server logs for security.
        </p>
      </LegalSection>

      <LegalSection title="Fonts and scripts">
        <p>
          Fonts, images and the site's own code are served from this site.
          {BEACON_TOKEN
            ? " The only third-party file is Cloudflare's analytics script, described above."
            : " No file loads from another site."}{" "}
          Nothing loads from Google.
        </p>
      </LegalSection>

      <LegalSection title="When you email me">
        <p>
          I keep your message and address only as long as the conversation
          needs, and I never share them.
        </p>
      </LegalSection>

      <LegalSection title="Your rights">
        <p>
          You can ask me what I hold about you, ask me to correct or delete it,
          or object to the processing. You can also complain to the Polish data
          protection authority, the{" "}
          <TextLink href="https://uodo.gov.pl/en">
            President of the Personal Data Protection Office (UODO)
          </TextLink>
          .
        </p>
      </LegalSection>

      <LegalSection title="Changes">
        <p>
          When this policy changes, the new version goes on this page with a new
          date at the top.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
