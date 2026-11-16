import type { Project, ProjectStats, StatsFile } from "./schema";
import statsFile from "./stats.json";

export const MIN_USERS = 100;
export const MIN_DOWNLOADS = 100;

export type Store = "chrome" | "firefox" | "play";

// Stores that report users and ratings. Google Play reports neither.
const RATED_STORES = ["chrome", "firefox"] as const;

const STORE_NAMES: Record<Store, string> = {
  chrome: "Chrome",
  firefox: "Firefox",
  play: "Google Play",
};

export interface Status {
  tone: "live" | "soon";
  label: string;
}

export interface StoreLink {
  store: Store;
  label: string;
  href: string;
}

// Assigning instead of casting makes TypeScript check the file's shape.
const checkedStats: StatsFile = statsFile;
const stats = checkedStats.projects;

export function statsFor(slug: string): ProjectStats {
  return stats[slug] ?? {};
}

// The stores a project is meant to be in, in display order.
export function storesOf(project: Project): Store[] {
  const sources = project.sources ?? {};
  const stores: Store[] = [];
  if (sources.chromeId) stores.push("chrome");
  if (sources.amoSlug) stores.push("firefox");
  if (sources.playId) stores.push("play");
  return stores;
}

export function listedStores(project: Project, stats: ProjectStats): Store[] {
  return storesOf(project).filter((store) => stats[store]?.listed === true);
}

// 192 -> "192", 1000 -> "1k+", 2500 -> "2k+". Store counts are lower bounds,
// so thousands round down and say so.
export function formatCount(count: number): string {
  return count < 1_000 ? String(count) : `${Math.floor(count / 1_000)}k+`;
}

function joinNames(names: string[]): string {
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
}

function formatRating(rating: number): string {
  return `rated ${Number(rating.toFixed(1))}/5`;
}

export function projectStatus(project: Project, stats: ProjectStats): Status {
  const stores = storesOf(project);
  const listed = listedStores(project, stats);

  if (stores.length > 0 && listed.length === 0) {
    const names = stores.map((store) => STORE_NAMES[store]);
    return { tone: "soon", label: `Coming to ${joinNames(names)}` };
  }

  if (project.links.website) {
    const host = new URL(project.links.website).host.replace(/^www\./, "");
    return { tone: "live", label: `Live at ${host}` };
  }

  const parts = ["Live"];
  const counted = RATED_STORES.filter((store) => listed.includes(store)).map(
    (store) => stats[store] ?? { listed: true },
  );
  const users = counted.reduce((sum, store) => sum + (store.users ?? 0), 0);
  const downloads = stats.github?.downloads;
  const release = stats.github?.release;

  if (users >= MIN_USERS) {
    parts.push(`${formatCount(users)} users`);
    // The rating of the store with the most users speaks for the most people.
    const rated = counted
      .filter((store) => store.rating !== undefined)
      .sort((a, b) => (b.users ?? 0) - (a.users ?? 0));
    const rating = rated[0]?.rating;
    if (rating !== undefined) parts.push(formatRating(rating));
  } else if (downloads !== undefined && downloads >= MIN_DOWNLOADS) {
    parts.push(`${formatCount(downloads)} downloads`);
  } else if (release) {
    parts.push(`version ${release}`);
  }

  return { tone: "live", label: parts.join(", ") };
}

// One link per store that has a live listing. A store without a listing
// gets no button.
export function storeLinks(project: Project, stats: ProjectStats): StoreLink[] {
  const { chromeId, amoSlug, playId } = project.sources ?? {};
  const links: StoreLink[] = [];
  if (chromeId && stats.chrome?.listed) {
    links.push({
      store: "chrome",
      label: STORE_NAMES.chrome,
      href: `https://chromewebstore.google.com/detail/${chromeId}`,
    });
  }
  if (amoSlug && stats.firefox?.listed) {
    links.push({
      store: "firefox",
      label: STORE_NAMES.firefox,
      href: `https://addons.mozilla.org/firefox/addon/${amoSlug}/`,
    });
  }
  if (playId && stats.play?.listed) {
    links.push({
      store: "play",
      label: STORE_NAMES.play,
      href: `https://play.google.com/store/apps/details?id=${playId}`,
    });
  }
  return links;
}
