import { readdirSync } from "node:fs";
import { join } from "node:path";

// The slug of every project, read from the file names in
// src/content/projects. Only the route config uses this, at build time.
export function projectSlugs(): string[] {
  return readdirSync(join(import.meta.dirname, "projects"))
    .filter((file) => /^[a-z0-9-]+\.ts$/.test(file) && file !== "index.ts")
    .map((file) => file.replace(/\.ts$/, ""));
}
