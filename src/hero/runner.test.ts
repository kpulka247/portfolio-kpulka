import { describe, expect, test } from "vitest";

import {
  OBSTACLE,
  type ObstacleRules,
  hash,
  mixAt,
  obstacleRow,
  overlaps,
  topSpeed,
  widestGap,
} from "./runner";

// A desktop road and a phone road, with their real row spacing.
const wide: ObstacleRules = {
  seed: 7,
  columns: 140,
  playable: [10, 129],
  startRow: 1_000,
  spacing: 0.62,
  minGap: 4,
};
const narrow: ObstacleRules = {
  seed: 7,
  columns: 34,
  playable: [6, 27],
  startRow: 1_000,
  spacing: 0.8,
  minGap: 3,
};

function rowAt(metres: number, rules: ObstacleRules): number {
  return rules.startRow + Math.round(metres / rules.spacing);
}

function kindsBetween(from: number, to: number, rules: ObstacleRules) {
  const kinds = new Set<number>();
  for (let row = rowAt(from, rules); row < rowAt(to, rules); row++) {
    for (const kind of obstacleRow(row, rules)) if (kind) kinds.add(kind);
  }
  return kinds;
}

function blockedPerMetreOfWidth(
  from: number,
  to: number,
  rules: ObstacleRules,
) {
  let blocked = 0;
  for (let row = rowAt(from, rules); row < rowAt(to, rules); row++) {
    blocked += obstacleRow(row, rules).filter(Boolean).length;
  }
  const width = (rules.playable[1] - rules.playable[0] + 1) * rules.spacing;
  return (blocked * rules.spacing * rules.spacing) / width;
}

describe.each([
  ["desktop", wide],
  ["phone", narrow],
])("obstacleRow on a %s road", (_, rules) => {
  test("keeps the first 150 m empty", () => {
    expect(kindsBetween(0, 150, rules).size).toBe(0);
  });

  test("brings in each kind only in its own band", () => {
    expect([...kindsBetween(150, 600, rules)]).toEqual([OBSTACLE.bump]);
    expect(kindsBetween(0, 1_500, rules).has(OBSTACLE.pillar)).toBe(false);
    expect(kindsBetween(0, 3_000, rules).has(OBSTACLE.gate)).toBe(false);
    expect(kindsBetween(0, 3_000, rules).has(OBSTACLE.moving)).toBe(false);
    const late = kindsBetween(3_000, 9_000, rules);
    for (const kind of Object.values(OBSTACLE).slice(1)) {
      expect(late.has(kind), `kind ${kind}`).toBe(true);
    }
  });

  test("always leaves a gap the jeep fits through", () => {
    for (let row = rowAt(0, rules); row < rowAt(12_000, rules); row++) {
      const gap = widestGap(obstacleRow(row, rules), rules.playable);
      expect(gap, `row ${row}`).toBeGreaterThanOrEqual(rules.minGap);
    }
  });

  test("puts obstacles only on the playable road", () => {
    for (let row = rowAt(0, rules); row < rowAt(6_000, rules); row++) {
      obstacleRow(row, rules).forEach((kind, column) => {
        if (!kind) return;
        expect(column).toBeGreaterThanOrEqual(rules.playable[0]);
        expect(column).toBeLessThanOrEqual(rules.playable[1]);
      });
    }
  });

  test("gets busier the further the run goes", () => {
    const early = blockedPerMetreOfWidth(150, 1_500, rules);
    const middle = blockedPerMetreOfWidth(1_500, 3_000, rules);
    const late = blockedPerMetreOfWidth(5_000, 9_000, rules);
    expect(early).toBeLessThan(middle);
    expect(middle).toBeLessThan(late);
  });
});

test("a phone road is about as busy per metre as a wide one", () => {
  const phone = blockedPerMetreOfWidth(600, 9_000, narrow);
  const desktop = blockedPerMetreOfWidth(600, 9_000, wide);
  expect(phone / desktop).toBeGreaterThan(0.6);
  expect(phone / desktop).toBeLessThan(1.6);
});

test("the same row gives the same obstacles", () => {
  const row = rowAt(4_000, wide);
  expect([...obstacleRow(row, wide)]).toEqual([...obstacleRow(row, wide)]);
});

test("obstacles are two rows deep", () => {
  let checked = 0;
  for (let row = rowAt(150, wide); row < rowAt(6_000, wide); row++) {
    const mask = obstacleRow(row, wide);
    const before = obstacleRow(row - 1, wide);
    const after = obstacleRow(row + 1, wide);
    if (!mask.some(Boolean) || before.some(Boolean)) continue;
    expect([...after]).toEqual([...mask]);
    checked += 1;
  }
  expect(checked).toBeGreaterThan(50);
});

test("difficulty starts at 150 m and rises smoothly", () => {
  expect(mixAt(100)).toBeNull();
  const steps = [200, 800, 2_000, 4_000, 8_000].map((d) => mixAt(d)?.chance);
  expect(steps).toEqual([...steps].sort((a, b) => (a ?? 0) - (b ?? 0)));
});

test("top speed rises with distance and levels off", () => {
  expect(topSpeed(0)).toBe(11);
  expect(topSpeed(2_500)).toBeGreaterThan(11);
  expect(topSpeed(50_000)).toBe(18);
});

test("hash stays between 0 and 1", () => {
  for (let i = 0; i < 1_000; i++) {
    const value = hash(3, i, i * 7);
    expect(value).toBeGreaterThanOrEqual(0);
    expect(value).toBeLessThan(1);
  }
});

describe("overlaps", () => {
  const car = { x: 0, z: 0, halfWidth: 0.45, halfLength: 0.85, yaw: 0 };
  const half = 0.25;

  test("a block just beside the jeep is not a hit", () => {
    expect(overlaps(car, { x: 0.45 + half + 0.01, z: 0, half }, 0)).toBe(false);
    expect(overlaps(car, { x: 0, z: 0.85 + half + 0.01, half }, 0)).toBe(false);
  });

  test("a block that touches the jeep is a hit", () => {
    expect(overlaps(car, { x: 0.45 + half - 0.05, z: 0, half }, 0)).toBe(true);
  });

  test("the margin forgives a graze but not a real hit", () => {
    const graze = { x: 0.45 + half - 0.05, z: 0, half };
    expect(overlaps(car, graze, 0.09)).toBe(false);
    expect(overlaps(car, { x: 0.3, z: 0.3, half }, 0.09)).toBe(true);
  });

  test("a turned jeep is checked along its own sides", () => {
    const turned = { ...car, yaw: Math.PI / 2 };
    // Turned sideways, the jeep is long in x and narrow in z.
    expect(overlaps(turned, { x: 0.85 + half - 0.05, z: 0, half }, 0)).toBe(
      true,
    );
    expect(overlaps(turned, { x: 0, z: 0.45 + half + 0.01, half }, 0)).toBe(
      false,
    );
    // At 45 degrees the corner of the box sticks out further than its side.
    const diagonal = { ...car, yaw: Math.PI / 4 };
    expect(overlaps(diagonal, { x: 0.95, z: 0, half: 0.1 }, 0)).toBe(false);
    expect(overlaps(diagonal, { x: 0.85, z: 0.25, half: 0.1 }, 0)).toBe(true);
  });
});
