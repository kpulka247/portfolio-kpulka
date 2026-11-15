// Renders the images that show the site elsewhere. Rerun this after
// changing a cover or the hero:
//
//   node scripts/make-images.mjs
//
// - public/og/: the link previews that LinkedIn, Slack and others show, 1200
//   by 630. The hero for the home page, and each project's cover. src/seo.ts
//   points at them.
// - docs/images/banner.png: the README banner, the hero with its text
//   centred and rounded corners.
//
// It starts the dev server and renders the real components, so the images
// always match the site. Reduced motion keeps the hero on its still image.

import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { chromium } from "@playwright/test";
import sharp from "sharp";
import { createServer } from "vite";

const repoRoot = resolve(import.meta.dirname, "..");
const outDir = join(repoRoot, "public", "og");
const readmeDir = join(repoRoot, "docs", "images");
// The README banner: wider and shorter than a link preview, with the name
// and the line under it centred. No buttons, which do nothing in an image,
// and no small print, which is unreadable when GitHub shrinks the banner.
const BANNER = { width: 1500, height: 600, radius: 28 };
const BANNER_HERO = `
  header, main > :not(section) { visibility: hidden; }
  section[aria-label="Introduction"] { min-height: 0 !important; padding-bottom: 64px !important; }
  section[aria-label="Introduction"] h1 { text-align: center; margin-left: 0; }
  section[aria-label="Introduction"] h1 + div {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  section[aria-label="Introduction"] h1 + div > div:last-child { display: none !important; }
  section[aria-label="Introduction"] h1 + div p + p { display: none !important; }
  section[aria-label="Introduction"] picture img { object-position: 50% 64% !important; }
`;
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

// Cuts the corners of a PNG to transparency, so the banner looks the same
// on GitHub's light and dark themes.
async function roundCorners(png, { width, height, radius }) {
  const mask = Buffer.from(
    `<svg width="${width}" height="${height}"><rect width="${width}" height="${height}" rx="${radius}" ry="${radius}"/></svg>`,
  );
  return sharp(png)
    .ensureAlpha()
    .composite([{ input: mask, blend: "dest-in" }])
    .png()
    .toBuffer();
}

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
await mkdir(readmeDir, { recursive: true });
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
  const banner = await browser.newPage({
    viewport: { width: BANNER.width, height: BANNER.height },
    reducedMotion: "reduce",
  });
  await banner.goto("http://localhost:5198/");
  await banner.addStyleTag({ content: BANNER_HERO });
  await settle(banner);
  await writeFile(
    join(readmeDir, "banner.png"),
    await roundCorners(await banner.screenshot(), BANNER),
  );
  console.log("Wrote docs/images/banner.png");

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
