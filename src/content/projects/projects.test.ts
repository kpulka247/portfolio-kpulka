import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

import type { Image, Project } from "../schema";
import { earlierProjects, projects } from "./index";

const repoRoot = join(import.meta.dirname, "..", "..", "..");

function imagesOf(project: Project): Image[] {
  const images: Image[] = [...project.screenshots];
  if (project.icon.kind === "image") images.push(project.icon.image);
  const { screen, front } = project.cover;
  if (screen.kind === "image") images.push(screen.image);
  else images.push(screen.wordmark, ...screen.images);
  if (front) images.push(front);
  return images;
}

describe.each(projects)("$name", (project) => {
  // Vite inlines files under 4 KB as data URIs, which it can only do after
  // reading the file, so those count as resolved.
  test("every image resolves to a file in the repo", () => {
    for (const image of imagesOf(project)) {
      if (image.src.startsWith("data:")) continue;
      expect(existsSync(join(repoRoot, image.src)), image.src).toBe(true);
    }
  });

  test("every image except the decorative icon has alt text", () => {
    const described = imagesOf(project).filter(
      (image) => project.icon.kind !== "image" || image !== project.icon.image,
    );
    for (const image of described) {
      expect(image.alt.trim(), image.src).not.toBe("");
    }
  });

  test("the slug is safe to use in a URL", () => {
    expect(project.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  test("only extensions float a popup in front of the cover", () => {
    if (project.cover.front) expect(project.type).toBe("extension");
  });
});

test("slugs and order positions are unique", () => {
  expect(new Set(projects.map((p) => p.slug)).size).toBe(projects.length);
  expect(new Set(projects.map((p) => p.order)).size).toBe(projects.length);
});

test("projects are listed newest first", () => {
  const orders = projects.map((project) => project.order);
  expect(orders).toEqual([...orders].sort((a, b) => a - b));
});

test("earlier projects link somewhere", () => {
  for (const project of earlierProjects) {
    expect(project.link).toMatch(/^https:\/\//);
  }
});
