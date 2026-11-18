import { describe, expect, test } from "vitest";

import { darkConnect } from "./projects/dark-connect";
import { gifoji } from "./projects/gifoji";
import { novice } from "./projects/novice";
import { polsimerF74led } from "./projects/polsimer-f74led";
import type { Project, ProjectStats } from "./schema";
import { formatCount, projectStatus, storeLinks } from "./status";

// Values recorded from shields.io and Google Play on 15 November 2026.
const recorded: Record<string, ProjectStats> = {
  novice: {
    chrome: { listed: false },
    firefox: { listed: false },
    github: { release: "1.2.0", downloads: 12 },
  },
  polsimer: { github: { release: "1.0.0", downloads: 4 } },
  playApp: { play: { listed: false } },
  darkConnect: {
    chrome: { listed: true, users: 1000, rating: 5 },
    firefox: { listed: true, users: 192, rating: 5 },
    github: { release: "2.7.1", downloads: 122 },
  },
};

const playApp: Project = {
  ...gifoji,
  type: "mobile",
  links: {},
  sources: { playId: "com.example.app" },
};

describe("projectStatus", () => {
  test("a store project with no listing yet is coming soon (rules 1 and 2)", () => {
    expect(projectStatus(novice, recorded.novice)).toEqual({
      tone: "soon",
      label: "Coming to Chrome and Firefox",
    });
    expect(projectStatus(playApp, recorded.playApp)).toEqual({
      tone: "soon",
      label: "Coming to Google Play",
    });
  });

  test("one live listing is enough to be live", () => {
    const stats: ProjectStats = {
      chrome: { listed: true, users: 40 },
      firefox: { listed: false },
    };
    expect(projectStatus(novice, stats).tone).toBe("live");
  });

  test("users from every store add up and show at 100 or more (rule 3)", () => {
    expect(projectStatus(darkConnect, recorded.darkConnect).label).toBe(
      "Live, 1k+ users, rated 5/5",
    );
  });

  test("fewer than 100 users show neither users nor a rating (rule 3)", () => {
    const stats: ProjectStats = {
      chrome: { listed: true, users: 60, rating: 4.8 },
      github: { release: "1.3.0" },
    };
    expect(projectStatus(novice, stats).label).toBe("Live, version 1.3.0");
  });

  test("the rating comes from the store with the most users", () => {
    const stats: ProjectStats = {
      chrome: { listed: true, users: 900, rating: 4.6 },
      firefox: { listed: true, users: 300, rating: 5 },
    };
    expect(projectStatus(darkConnect, stats).label).toBe(
      "Live, 1k+ users, rated 4.6/5",
    );
  });

  test("downloads show at 100 or more, otherwise the version (rule 4)", () => {
    expect(projectStatus(polsimerF74led, recorded.polsimer).label).toBe(
      "Live, version 1.0.0",
    );
    expect(
      projectStatus(polsimerF74led, {
        github: { release: "1.0.0", downloads: 250 },
      }).label,
    ).toBe("Live, 250 downloads");
  });

  test("a website project names its address", () => {
    expect(projectStatus(gifoji, {})).toEqual({
      tone: "live",
      label: "Live at gifoji.com",
    });
  });

  test("a project with no stats at all is still live", () => {
    expect(projectStatus(polsimerF74led, {}).label).toBe("Live");
  });
});

describe("storeLinks (rule 6)", () => {
  test("no listing, no button", () => {
    expect(storeLinks(novice, recorded.novice)).toEqual([]);
    expect(storeLinks(playApp, recorded.playApp)).toEqual([]);
  });

  test("every live listing gets a button, Chrome first", () => {
    expect(storeLinks(darkConnect, recorded.darkConnect)).toEqual([
      {
        store: "chrome",
        label: "Chrome",
        href: "https://chromewebstore.google.com/detail/nadhhgppikppmjacnkebagbgcibnfnob",
      },
      {
        store: "firefox",
        label: "Firefox",
        href: "https://addons.mozilla.org/firefox/addon/dark-connect/",
      },
    ]);
  });
});

test("formatCount rounds thousands down and says so", () => {
  expect(formatCount(192)).toBe("192");
  expect(formatCount(1192)).toBe("1k+");
  expect(formatCount(2999)).toBe("2k+");
});
