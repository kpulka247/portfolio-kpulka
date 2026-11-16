// Captures the pin board as the still image that visitors see before the
// live board loads, and instead of it when the board stays off (no WebGL,
// reduced motion, or a slow device). Rerun it after changing the board:
//
//   node scripts/capture-hero.mjs
//
// It starts the dev server, opens the home page in Chromium at a desktop
// and a phone size, hides everything but the board's canvas, and writes
// src/assets/hero/board-desktop.webp and board-phone.webp.

import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { chromium } from "@playwright/test";
import sharp from "sharp";
import { createServer } from "vite";

const repoRoot = resolve(import.meta.dirname, "..");
const outDir = join(repoRoot, "src", "assets", "hero");
const GROUND = "#e4e5e8";

// The page imports both files, so a first run needs something there.
const shots = [
  { file: "board-desktop.webp", width: 1920, height: 1080, scale: 1 },
  { file: "board-phone.webp", width: 430, height: 932, scale: 2 },
];

await mkdir(outDir, { recursive: true });
for (const { file } of shots) {
  const path = join(outDir, file);
  if (existsSync(path)) continue;
  await sharp({
    create: { width: 16, height: 9, channels: 3, background: GROUND },
  })
    .webp()
    .toFile(path);
}

const server = await createServer({
  root: repoRoot,
  server: { port: 5199, strictPort: true },
});
await server.listen();
const browser = await chromium.launch();

try {
  for (const { file, width, height, scale } of shots) {
    const page = await browser.newPage({
      viewport: { width, height },
      deviceScaleFactor: scale,
    });
    await page.goto("http://localhost:5199/");
    const canvas = page.locator('section[aria-label="Introduction"] canvas');
    await canvas.and(page.locator(".opacity-100")).waitFor({ timeout: 30_000 });
    await page.addStyleTag({
      content: `body * { visibility: hidden !important; } section[aria-label="Introduction"] canvas { visibility: visible !important; }`,
    });
    // Let the swell settle, and stop before the idle press starts at 4 s.
    await page.waitForTimeout(2_000);
    const png = await canvas.screenshot({ animations: "allow" });
    await writeFile(
      join(outDir, file),
      await sharp(png).webp({ quality: 78 }).toBuffer(),
    );
    console.log(`Wrote src/assets/hero/${file}`);
    await page.close();
  }
} finally {
  await browser.close();
  await server.close();
}
