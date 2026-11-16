import type { MetaDescriptor } from "react-router";

import { GITHUB_URL, LINKEDIN_URL } from "./data/contact";

// GitHub Pages serves the site here. www.kpulka.com redirects to it.
export const SITE_URL = "https://kpulka.com";

// GitHub Pages serves each prerendered page from a folder and redirects
// "/projects/novice" to "/projects/novice/", so canonical URLs end in "/".
export function absoluteUrl(path: string): string {
  const withSlash = path.endsWith("/") ? path : `${path}/`;
  return new URL(withSlash, SITE_URL).href;
}

interface PageMeta {
  title: string;
  description: string;
  path: string;
  // A path under public/, such as "/og/home.jpg". 1200 by 630.
  image: string;
  imageAlt: string;
}

// The title, description, canonical link and link-preview tags of a page.
export function pageMeta({
  title,
  description,
  path,
  image,
  imageAlt,
}: PageMeta): MetaDescriptor[] {
  const url = absoluteUrl(path);
  const imageUrl = new URL(image, SITE_URL).href;
  return [
    { title },
    { name: "description", content: description },
    { tagName: "link", rel: "canonical", href: url },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: "Kamil Pułka" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    { property: "og:image", content: imageUrl },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:alt", content: imageAlt },
    { name: "twitter:card", content: "summary_large_image" },
  ];
}

// Tells search engines who the site is about. Only public facts: no
// address, email or photo.
export const personJsonLd: MetaDescriptor = {
  "script:ld+json": {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Kamil Pułka",
    jobTitle: "Full-stack developer",
    url: absoluteUrl("/"),
    sameAs: [GITHUB_URL, LINKEDIN_URL],
  },
};
