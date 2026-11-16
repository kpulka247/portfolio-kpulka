import { describe, expect, test } from "vitest";

import { hash, obstacleRow, topSpeed, widestGap } from "./runner";

const rules = {
  seed: 7,
  columns: 90,
  playable: [20, 69] as const,
  safeUntil: 40,
  minGap: 6,
};

describe("obstacleRow", () => {
  test("keeps the start of a run clear", () => {
    for (let row = 0; row <= rules.safeUntil; row++) {
      expect(obstacleRow(row, rules).some(Boolean), `row ${row}`).toBe(false);
    }
  });

  test("always leaves a gap the car fits through", () => {
    for (let row = rules.safeUntil + 1; row < 5_000; row++) {
      const gap = widestGap(obstacleRow(row, rules), rules.playable);
      expect(gap, `row ${row}`).toBeGreaterThanOrEqual(rules.minGap);
    }
  });

  test("puts pillars only in the playable columns", () => {
    for (let row = rules.safeUntil + 1; row < 2_000; row++) {
      const mask = obstacleRow(row, rules);
      mask.forEach((pillar, column) => {
        if (pillar) expect(column).toBeGreaterThanOrEqual(rules.playable[0]);
        if (pillar) expect(column).toBeLessThanOrEqual(rules.playable[1]);
      });
    }
  });

  test("makes pillars two rows deep, with clear rows between them", () => {
    let pillarRows = 0;
    for (let row = rules.safeUntil + 1; row < 1_000; row++) {
      const mask = obstacleRow(row, rules);
      if (!mask.some(Boolean)) continue;
      pillarRows += 1;
      const partner = row % 2 === 0 ? row + 1 : row - 1;
      expect([...obstacleRow(partner, rules)]).toEqual([...mask]);
    }
    expect(pillarRows).toBeGreaterThan(100);
    expect(pillarRows).toBeLessThan(400);
  });

  test("gives the same row the same pillars, and another seed others", () => {
    // Pair 54 is a pillar pair, and so is every third pair after it.
    const row = 108;
    expect([...obstacleRow(row, rules)]).toEqual([...obstacleRow(row, rules)]);
    const others = Array.from({ length: 40 }, (_, i) =>
      obstacleRow(row + i * 6, { ...rules, seed: 8 }).join(""),
    );
    const ours = Array.from({ length: 40 }, (_, i) =>
      obstacleRow(row + i * 6, rules).join(""),
    );
    expect(others).not.toEqual(ours);
  });
});

test("hash stays between 0 and 1", () => {
  for (let i = 0; i < 1_000; i++) {
    const value = hash(3, i, i * 7);
    expect(value).toBeGreaterThanOrEqual(0);
    expect(value).toBeLessThan(1);
  }
});

test("top speed grows with distance and levels off", () => {
  expect(topSpeed(0)).toBeLessThan(topSpeed(500));
  expect(topSpeed(100_000)).toBe(22);
});
