// Renders the link-preview images that LinkedIn, Slack and others show:
// the hero for the home page, and each project's cover. They are 1200 by
// 630 and live in public/og/, where src/seo.ts points. Rerun this after
// changing a cover or the hero:
//
//   node scripts/make-og.mjs
//
// It starts the dev server and renders the real components, so the images
// always match the site. Reduced motion keeps the hero on its still image.

import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { chromium } from "@playwright/test";
import { createServer } from "vite";

const repoRoot = resolve(import.meta.dirname, "..");
const outDir = join(repoRoot, "public", "og");
const SIZE = { width: 1200, height: 630 };
// Covers are drawn for cards about this size. Rendering them there at twice
// the pixel density gives 1200 by 630 that looks like the card.
const COVER_SIZE = { width: 600, height: 315 };
const QUALITY = 85;

// Lifts one cover out of the page to fill the viewport, and hides the
// fixed nav.
const ISOLATE = `
  header { visibility: hidden !important; }
  [data-og] {
    position: fixed !important;
    inset: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    z-index: 9999 !important;
    border-radius: 0 !important;
  }
`;

async function settle(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      [...document.images].map((image) => {
        image.loading = "eager";
        return image.decode().catch(() => {});
      }),
    );
  });
}

await mkdir(outDir, { recursive: true });
const server = await createServer({
  root: repoRoot,
  server: { port: 5198, strictPort: true },
});
await server.listen();
// The same list of projects that src/routes.ts makes pages for.
const { projectSlugs } = await server.ssrLoadModule(
  "/src/content/projectSlugs.ts",
);
const browser = await chromium.launch();

try {
  const home = await browser.newPage({
    viewport: SIZE,
    reducedMotion: "reduce",
  });
  await home.goto("http://localhost:5198/");
  // Only the hero: no nav, and not the edge of the black sheet below it.
  await home.addStyleTag({
    content: "header, main > :not(section) { visibility: hidden; }",
  });
  await settle(home);
  await writeFile(
    join(outDir, "home.jpg"),
    await home.screenshot({ type: "jpeg", quality: QUALITY }),
  );
  console.log("Wrote public/og/home.jpg");

  const page = await browser.newPage({
    viewport: COVER_SIZE,
    deviceScaleFactor: 2,
    reducedMotion: "reduce",
  });
  await page.goto("http://localhost:5198/");
  await page.addStyleTag({ content: ISOLATE });
  for (const slug of projectSlugs()) {
    const cover = page.locator(`a[href="/projects/${slug}"] > div`).first();
    await cover.evaluate((element) => element.setAttribute("data-og", ""));
    await settle(page);
    await writeFile(
      join(outDir, `${slug}.jpg`),
      await page.screenshot({ type: "jpeg", quality: QUALITY }),
    );
    await cover.evaluate((element) => element.removeAttribute("data-og"));
    console.log(`Wrote public/og/${slug}.jpg`);
  }
} finally {
  await browser.close();
  await server.close();
}
