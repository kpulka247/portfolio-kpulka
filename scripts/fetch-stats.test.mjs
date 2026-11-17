import { describe, expect, test } from "vitest";

import {
  mergeGithub,
  mergeStore,
  parseCount,
  parseRating,
  parseRelease,
} from "./fetch-stats.mjs";

// Every input below is a value shields.io returned on 15 November 2026.

describe("parsing shields.io values", () => {
  test("counts", () => {
    expect(parseCount("1k")).toBe(1000);
    expect(parseCount("1.2k")).toBe(1200);
    expect(parseCount("192")).toBe(192);
    expect(parseCount("3M")).toBe(3_000_000);
    expect(parseCount("not found")).toBeUndefined();
  });

  test("ratings", () => {
    expect(parseRating("5/5")).toBe(5);
    expect(parseRating("4.5/5")).toBe(4.5);
    expect(parseRating("not found")).toBeUndefined();
  });

  test("releases", () => {
    expect(parseRelease("v2.7.1")).toBe("2.7.1");
    expect(parseRelease("1.0.0")).toBe("1.0.0");
    expect(parseRelease("no releases or repo not found")).toBeUndefined();
  });
});

describe("mergeStore", () => {
  const previous = { listed: true, users: 900, rating: 4.8 };

  test('"not found" means the store has no listing (rule 1)', () => {
    expect(mergeStore(previous, "not found", "not found")).toEqual({
      listed: false,
    });
  });

  test("a fresh count and rating replace the old ones", () => {
    expect(mergeStore(previous, "1k", "5/5")).toEqual({
      listed: true,
      users: 1000,
      rating: 5,
    });
  });

  test("a failed request keeps everything known before (rule 5)", () => {
    expect(mergeStore(previous, undefined, undefined)).toEqual(previous);
  });

  test("a value that does not parse keeps everything known before (rule 5)", () => {
    expect(mergeStore(previous, "inaccessible", "5/5")).toEqual(previous);
  });

  test("a failed rating keeps the old rating with the new count", () => {
    expect(mergeStore(previous, "1k", undefined)).toEqual({
      listed: true,
      users: 1000,
      rating: 4.8,
    });
  });

  test("with nothing known and a failed request, there is still nothing", () => {
    expect(mergeStore(undefined, undefined, undefined)).toBeUndefined();
  });
});

describe("mergeGithub", () => {
  test("parses a release and a download count", () => {
    expect(mergeGithub(undefined, "v2.7.1", "122")).toEqual({
      release: "2.7.1",
      downloads: 122,
    });
  });

  test("keeps each field that failed (rule 5)", () => {
    expect(
      mergeGithub(
        { release: "1.0.0", downloads: 4 },
        "no releases or repo not found",
        undefined,
      ),
    ).toEqual({ release: "1.0.0", downloads: 4 });
  });
});
