import { expect, test } from "vitest";

import { canonicalOf, robotsTxt, sitemapXml } from "./write-sitemap.mjs";

test("reads the canonical URL that React Router renders", () => {
  const html =
    '<head><title>x</title><link rel="canonical" href="https://kpulka.com/projects/novice/"/></head>';
  expect(canonicalOf(html)).toBe("https://kpulka.com/projects/novice/");
  expect(canonicalOf("<head><title>404</title></head>")).toBeUndefined();
});

test("lists every URL once, in a stable order", () => {
  const xml = sitemapXml(
    new Set(["https://kpulka.com/privacy/", "https://kpulka.com/"]),
  );
  expect(xml.indexOf("https://kpulka.com/<")).toBeLessThan(
    xml.indexOf("https://kpulka.com/privacy/"),
  );
  expect(xml.match(/<url>/g)).toHaveLength(2);
});

test("robots.txt points at the sitemap", () => {
  expect(robotsTxt("https://kpulka.com")).toContain(
    "Sitemap: https://kpulka.com/sitemap.xml",
  );
});
