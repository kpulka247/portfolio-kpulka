// Draws the site icon, the hero's pin board in miniature: nine light pins
// on an ink tile, the middle one pressed. It writes every size the browsers
// and phones ask for into public/. Rerun it after changing the drawing:
//
//   node scripts/make-icons.mjs

import { writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import sharp from "sharp";

const publicDir = resolve(import.meta.dirname, "..", "public");

const INK = "#1b1c1f";
const PIN_TOP = "#f6f6f7";
const PIN_EDGE = "#b9bbc1";
const PRESSED_TOP = "#3a3b40";
const PRESSED_EDGE = "#26272b";

// One pin: a top face over a darker front edge, so it reads as raised. A
// pressed pin sits lower and shows less edge.
function pin(x, y, size, pressed) {
  const radius = size * 0.18;
  const edge = pressed ? size * 0.06 : size * 0.18;
  const top = pressed ? PRESSED_TOP : PIN_TOP;
  const side = pressed ? PRESSED_EDGE : PIN_EDGE;
  return [
    `<rect x="${x}" y="${y + edge}" width="${size}" height="${size}" rx="${radius}" fill="${side}"/>`,
    `<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${radius}" fill="${top}"/>`,
  ].join("");
}

// The icon on a 512 grid. `corner` rounds the tile. iOS rounds its own
// icons, so the Apple touch icon has square corners.
export function iconSvg({ corner = 112 } = {}) {
  const padding = 96;
  const gap = 14;
  const size = (512 - padding * 2 - gap * 2) / 3;
  const pins = [];
  for (let row = 0; row < 3; row++) {
    for (let column = 0; column < 3; column++) {
      pins.push(
        pin(
          padding + column * (size + gap),
          padding + row * (size + gap) - 6,
          size,
          row === 1 && column === 1,
        ),
      );
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="${corner}" fill="${INK}"/>${pins.join("")}</svg>`;
}

function png(svg, size) {
  return sharp(Buffer.from(svg), { density: 384 })
    .resize(size, size)
    .png()
    .toBuffer();
}

// An .ico that holds PNG images, which every current browser reads.
function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  const entries = [];
  let offset = 6 + 16 * images.length;
  for (const { size, data } of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    entries.push(entry);
    offset += data.length;
  }
  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

const rounded = iconSvg();
const square = iconSvg({ corner: 0 });

const files = {
  "favicon.svg": Buffer.from(rounded),
  "favicon-16x16.png": await png(rounded, 16),
  "favicon-32x32.png": await png(rounded, 32),
  "android-chrome-192x192.png": await png(rounded, 192),
  "android-chrome-512x512.png": await png(rounded, 512),
  "apple-touch-icon.png": await png(square, 180),
  "favicon.ico": ico(
    await Promise.all(
      [16, 32, 48].map(async (size) => ({
        size,
        data: await png(rounded, size),
      })),
    ),
  ),
};

for (const [name, data] of Object.entries(files)) {
  await writeFile(join(publicDir, name), data);
  console.log(`Wrote public/${name}`);
}
