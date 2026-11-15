// Fetches store users, ratings, releases and downloads for every project and
// writes them to src/content/stats.json. It runs before every build:
//
//   node scripts/fetch-stats.mjs
//
// A failed or unclear lookup keeps the previous value and prints a warning.
// The script never fails the build over stats, and it rewrites stats.json
// only when a value changed.

import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const contentDir = join(import.meta.dirname, "..", "src", "content");
const sourcesPath = join(contentDir, "sources.json");
const statsPath = join(contentDir, "stats.json");
const TIMEOUT_MS = 10_000;

const NOT_LISTED = "not found";

// "1k" -> 1000, "1.2k" -> 1200, "192" -> 192, "3M" -> 3000000.
// shields.io rounds down, so the result is a lower bound.
export function parseCount(value) {
  const match = /^(\d+(?:\.\d+)?)([kM])?$/.exec(value);
  if (!match) return undefined;
  const multiplier = { k: 1_000, M: 1_000_000 }[match[2]] ?? 1;
  return Math.round(Number(match[1]) * multiplier);
}

// "5/5" -> 5, "4.5/5" -> 4.5.
export function parseRating(value) {
  const match = /^(\d+(?:\.\d+)?)\/5$/.exec(value);
  return match ? Number(match[1]) : undefined;
}

// "v2.7.1" -> "2.7.1".
export function parseRelease(value) {
  const match = /^v?(\d+\.\d+\.\d+\S*)$/.exec(value);
  return match ? match[1] : undefined;
}

// Combines the users and rating lookups for one store with what was known
// before. "not found" on the users lookup means the store has no listing.
// Any other value that does not parse keeps the previous field.
export function mergeStore(previous, usersValue, ratingValue) {
  if (usersValue === NOT_LISTED) return { listed: false };
  const users = usersValue === undefined ? undefined : parseCount(usersValue);
  if (users === undefined) return previous;
  const rating =
    ratingValue === undefined ? undefined : parseRating(ratingValue);
  return {
    listed: true,
    users,
    ...(rating !== undefined
      ? { rating }
      : previous?.rating !== undefined
        ? { rating: previous.rating }
        : {}),
  };
}

export function mergeGithub(previous, releaseValue, downloadsValue) {
  const release =
    releaseValue === undefined ? undefined : parseRelease(releaseValue);
  const downloads =
    downloadsValue === undefined ? undefined : parseCount(downloadsValue);
  const next = {
    release: release ?? previous?.release,
    downloads: downloads ?? previous?.downloads,
  };
  return Object.fromEntries(
    Object.entries(next).filter(([, value]) => value !== undefined),
  );
}

async function shields(path) {
  try {
    const response = await fetch(`https://img.shields.io/${path}.json`, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const { value } = await response.json();
    return String(value);
  } catch (error) {
    console.warn(
      `stats: ${path} failed (${error.message}), keeping the last value`,
    );
    return undefined;
  }
}

// Google Play has no shields.io badge. Its store page answers 404 until the
// app is published.
async function playListed(appId, previous) {
  try {
    const response = await fetch(
      `https://play.google.com/store/apps/details?id=${appId}&hl=en`,
      { method: "HEAD", signal: AbortSignal.timeout(TIMEOUT_MS) },
    );
    if (response.status === 200) return { listed: true };
    if (response.status === 404) return { listed: false };
    throw new Error(`HTTP ${response.status}`);
  } catch (error) {
    console.warn(
      `stats: Google Play ${appId} failed (${error.message}), keeping the last value`,
    );
    return previous;
  }
}

async function fetchProject(sources, previous = {}) {
  const next = {};
  const tasks = [];

  if (sources.chromeId) {
    tasks.push(
      Promise.all([
        shields(`chrome-web-store/users/${sources.chromeId}`),
        shields(`chrome-web-store/rating/${sources.chromeId}`),
      ]).then(([users, rating]) => {
        next.chrome = mergeStore(previous.chrome, users, rating);
      }),
    );
  }
  if (sources.amoSlug) {
    tasks.push(
      Promise.all([
        shields(`amo/users/${sources.amoSlug}`),
        shields(`amo/rating/${sources.amoSlug}`),
      ]).then(([users, rating]) => {
        next.firefox = mergeStore(previous.firefox, users, rating);
      }),
    );
  }
  if (sources.playId) {
    tasks.push(
      playListed(sources.playId, previous.play).then((play) => {
        next.play = play;
      }),
    );
  }
  if (sources.githubRepo) {
    tasks.push(
      Promise.all([
        shields(`github/v/release/${sources.githubRepo}`),
        shields(`github/downloads/${sources.githubRepo}/total`),
      ]).then(([release, downloads]) => {
        next.github = mergeGithub(previous.github, release, downloads);
      }),
    );
  }

  await Promise.all(tasks);
  // A fixed key order, so the file only changes when a value changes.
  return Object.fromEntries(
    ["chrome", "firefox", "play", "github"]
      .map((key) => [key, next[key]])
      .filter(([, value]) => value !== undefined),
  );
}

async function readJson(path, fallback) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch {
    return fallback;
  }
}

async function main() {
  const sources = await readJson(sourcesPath, {});
  const previous = await readJson(statsPath, { fetchedAt: "", projects: {} });

  const entries = await Promise.all(
    Object.entries(sources).map(async ([slug, ids]) => [
      slug,
      await fetchProject(ids, previous.projects[slug]),
    ]),
  );
  const projects = Object.fromEntries(entries);

  if (JSON.stringify(projects) === JSON.stringify(previous.projects)) {
    console.log("stats: no changes");
    return;
  }

  const next = { fetchedAt: new Date().toISOString(), projects };
  await writeFile(statsPath, `${JSON.stringify(next, null, 2)}\n`);
  console.log("stats: updated src/content/stats.json");
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
