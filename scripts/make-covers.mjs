// Copies and crops the project images from the sibling project repos into
// src/assets/projects/<slug>/. Rerun it when a source screenshot changes:
//
//   node scripts/make-covers.mjs
//
// SOURCE_ROOT is the folder that holds the project repos. It defaults to the
// folder two levels above this repo (d:/Dev on Kamil's machine).

import { copyFile, mkdir, rm, stat } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import sharp from "sharp";

const repoRoot = resolve(import.meta.dirname, "..");
const sourceRoot = process.env.SOURCE_ROOT ?? resolve(repoRoot, "..", "..");
const outRoot = join(repoRoot, "src", "assets", "projects");

const NOVICE = "novice-extension/novice";
const DARK_CONNECT = "dark-connect-extension/dark-connect";
const GIFOJI = "gifoji-app/gifoji/apps/web/public";
const POLSIMER =
  "polsimer-simhub-plugin-app/polsimer-simhub-plugin/docs/images";
const DO_NOTHING = "do-nothing-app/do-nothing/store";

// Each job reads one source file and writes one output file.
// crop: { left, top, width, height } in source pixels.
// extendTo: aspect ratio (width / height) to pad the bottom to, in `pad` colour.
// radius: rounds the corners and keeps transparency (popups).
const jobs = [
  // NoVice
  { out: "novice/icon.png", src: `${NOVICE}/static/store/store-icon-128.png` },
  {
    out: "novice/cover.webp",
    src: `${NOVICE}/static/images/screenshot-hover.png`,
  },
  {
    out: "novice/popup.webp",
    src: `${NOVICE}/static/images/screenshot.png`,
    crop: { left: 948, top: 12, width: 320, height: 322 },
    radius: 14,
  },
  {
    out: "novice/across-the-web.webp",
    src: `${NOVICE}/static/images/across-the-web.png`,
  },
  {
    out: "novice/spoiler-cover.webp",
    src: `${NOVICE}/static/images/screenshot.png`,
  },
  {
    out: "novice/search.webp",
    src: `${NOVICE}/static/images/screenshot-search.png`,
  },

  // Dark Connect
  {
    out: "dark-connect/icon.png",
    src: `${DARK_CONNECT}/static/store/store-icon-128.png`,
  },
  {
    out: "dark-connect/cover.webp",
    src: `${DARK_CONNECT}/static/images/screenshot.png`,
  },
  {
    out: "dark-connect/popup.webp",
    src: `${DARK_CONNECT}/static/images/screenshot.png`,
    crop: { left: 948, top: 12, width: 305, height: 387 },
    radius: 12,
  },
  {
    out: "dark-connect/training.webp",
    src: `${DARK_CONNECT}/static/images/screenshot-training.png`,
  },
  {
    out: "dark-connect/hrv.webp",
    src: `${DARK_CONNECT}/static/images/screenshot-hrv.png`,
  },
  {
    out: "dark-connect/challenges.webp",
    src: `${DARK_CONNECT}/static/images/screenshot-challenges.png`,
  },

  // Gifoji
  { out: "gifoji/icon.png", src: `${GIFOJI}/brand/icon-512.png`, resize: 256 },
  {
    out: "gifoji/wordmark.svg",
    src: `${GIFOJI}/brand/gifoji-wordmark-outlined.svg`,
    copy: true,
  },
  {
    out: "gifoji/heart.webp",
    src: `${GIFOJI}/showcase/hero/left-01-still.webp`,
  },
  {
    out: "gifoji/comic.webp",
    src: `${GIFOJI}/showcase/hero/right-04-still.webp`,
  },
  {
    out: "gifoji/stained-glass.webp",
    src: `${GIFOJI}/showcase/presets/style/stained-glass-mosaic.webp`,
  },
  {
    out: "gifoji/clay.webp",
    src: `${GIFOJI}/showcase/presets/style/clay-stop-motion.webp`,
  },
  {
    out: "gifoji/voxel.webp",
    src: `${GIFOJI}/showcase/presets/style/voxel-art.webp`,
  },
  {
    out: "gifoji/glitch.webp",
    src: `${GIFOJI}/showcase/presets/style/glitch-art-datamosh.webp`,
  },

  // Polsimer F74LED plugin
  {
    out: "polsimer-f74led/cover.webp",
    src: `${POLSIMER}/settings_preview.png`,
    crop: { left: 196, top: 32, width: 984, height: 460 },
    extendTo: 16 / 10,
    pad: "#252525",
  },
  {
    out: "polsimer-f74led/settings.webp",
    src: `${POLSIMER}/settings_preview.png`,
  },
  {
    out: "polsimer-f74led/led-effects.webp",
    src: `${POLSIMER}/led_effects.gif`,
    animated: true,
  },

  // do nothing: public store assets only, nothing from the app's code
  {
    out: "do-nothing/icon.png",
    src: `${DO_NOTHING}/google-play/icon-512.png`,
    resize: 256,
  },
  {
    out: "do-nothing/cover.webp",
    src: `${DO_NOTHING}/app-store/screenshots-6.9/3-waiting.png`,
  },
  {
    out: "do-nothing/intro.webp",
    src: `${DO_NOTHING}/app-store/screenshots-6.9/1-intro.png`,
  },
  {
    out: "do-nothing/idle.webp",
    src: `${DO_NOTHING}/app-store/screenshots-6.9/2-idle.png`,
  },
  {
    out: "do-nothing/done.webp",
    src: `${DO_NOTHING}/app-store/screenshots-6.9/5-done.png`,
  },
];

function roundedMask(width, height, radius) {
  return Buffer.from(
    `<svg width="${width}" height="${height}"><rect width="${width}" height="${height}" rx="${radius}" ry="${radius}"/></svg>`,
  );
}

async function run(job) {
  const src = join(sourceRoot, job.src);
  const out = join(outRoot, job.out);
  await mkdir(dirname(out), { recursive: true });

  if (job.copy) {
    await copyFile(src, out);
    return out;
  }

  let image = sharp(src, { animated: Boolean(job.animated) });
  if (job.crop) image = image.extract(job.crop);
  if (job.resize) image = image.resize(job.resize, job.resize);
  if (job.extendTo) {
    const { width, height } = job.crop;
    const target = Math.round(width / job.extendTo);
    image = image.extend({
      bottom: Math.max(0, target - height),
      background: job.pad,
    });
  }
  if (job.radius) {
    const { width, height } = job.crop;
    image = image
      .ensureAlpha()
      .composite([
        { input: roundedMask(width, height, job.radius), blend: "dest-in" },
      ]);
  }

  if (out.endsWith(".png"))
    await image.png({ compressionLevel: 9 }).toFile(out);
  else await image.webp({ quality: 88, effort: 6 }).toFile(out);
  return out;
}

await rm(outRoot, { recursive: true, force: true });
for (const job of jobs) {
  const out = await run(job);
  const { width, height } = await sharp(out).metadata();
  const { size } = await stat(out);
  console.log(
    `${job.out.padEnd(36)} ${width}x${height}  ${Math.round(size / 1024)} KB`,
  );
}
