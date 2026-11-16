// Writes dist/client/sitemap.xml and robots.txt after the build. Every
// prerendered page that names a canonical URL goes into the sitemap, so
// the 404 page, which names none, stays out. The URLs come from the pages
// themselves, so src/seo.ts stays the only place that knows the domain.

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

export function canonicalOf(html) {
  return html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
}

export function sitemapXml(urls) {
  const entries = [...urls]
    .sort()
    .map((url) => `  <url><loc>${url}</loc></url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`;
}

export function robotsTxt(origin) {
  return `User-agent: *
Allow: /

Sitemap: ${origin}/sitemap.xml
`;
}

function htmlFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return htmlFiles(path);
    return entry.name === "index.html" ? [path] : [];
  });
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const client = resolve(import.meta.dirname, "..", "dist", "client");
  const urls = new Set(
    htmlFiles(client)
      .map((file) => canonicalOf(readFileSync(file, "utf8")))
      .filter(Boolean),
  );
  if (urls.size === 0) {
    console.error("No prerendered page names a canonical URL.");
    process.exit(1);
  }
  const origin = new URL([...urls][0]).origin;
  writeFileSync(join(client, "sitemap.xml"), sitemapXml(urls));
  writeFileSync(join(client, "robots.txt"), robotsTxt(origin));
  console.log(`Wrote sitemap.xml with ${urls.size} pages, and robots.txt`);
}
