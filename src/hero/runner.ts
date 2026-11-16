// The rules of the hero game, kept free of three.js so they can be tested.
//
// The board scrolls towards the camera one row of pins at a time. Every row
// that has scrolled in has a world row number, which grows the further the
// car has driven. Obstacles are dark pillars two rows deep, placed by a
// hash of the run's seed and the world row, so a row looks the same every
// time it is asked for.

// Pillars appear in one pair of rows out of this many pairs.
const PAIRS_BETWEEN_PILLARS = 3;
// Over this many rows after the safe stretch, pillars become as dense as
// they get.
const RAMP_ROWS = 600;

export interface ObstacleRules {
  seed: number;
  columns: number;
  // The first and last column the car can reach. Pillars go only here.
  playable: readonly [number, number];
  // Rows up to this one stay clear, so a run starts on an empty road.
  safeUntil: number;
  // The narrowest gap, in columns, the car fits through.
  minGap: number;
}

// A number from 0 to 1 that depends only on its inputs.
export function hash(seed: number, a: number, b: number): number {
  let h = Math.imul(seed ^ 0x9e3779b9, 0x85ebca6b);
  h = Math.imul(h ^ Math.imul(a, 0xc2b2ae35), 0x27d4eb2f);
  h = Math.imul(h ^ Math.imul(b + 0x165667b1, 0x9e3779b1), 0x85ebca6b);
  h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}

// The widest run of free columns between the playable edges.
export function widestGap(
  mask: Uint8Array,
  [first, last]: readonly [number, number],
): number {
  let widest = 0;
  let run = 0;
  for (let column = first; column <= last; column++) {
    run = mask[column] ? 0 : run + 1;
    widest = Math.max(widest, run);
  }
  return widest;
}

// Which columns of a world row hold a pillar: 1 for a pillar, 0 for free.
export function obstacleRow(
  worldRow: number,
  rules: ObstacleRules,
): Uint8Array {
  const mask = new Uint8Array(rules.columns);
  // Both rows of a pair are decided by the pair, so they always match.
  const pair = Math.floor(worldRow / 2);
  const pairStart = pair * 2;
  if (pairStart <= rules.safeUntil) return mask;
  if (pair % PAIRS_BETWEEN_PILLARS !== 0) return mask;

  const progress = Math.min(1, (pairStart - rules.safeUntil) / RAMP_ROWS);
  const [first, last] = rules.playable;
  const span = last - first + 1;
  const clusters =
    1 + Math.floor(hash(rules.seed, pair, 0) * (1 + 2 * progress));

  for (let cluster = 0; cluster < clusters; cluster++) {
    const width = 1 + Math.floor(hash(rules.seed, pair, cluster * 2 + 1) * 3);
    const start =
      first + Math.floor(hash(rules.seed, pair, cluster * 2 + 2) * span);
    const before = mask.slice();
    for (
      let column = start;
      column < start + width && column <= last;
      column++
    ) {
      mask[column] = 1;
    }
    // Never close the road: drop a cluster that leaves no gap for the car.
    if (widestGap(mask, rules.playable) < rules.minGap) mask.set(before);
  }
  return mask;
}

// The car's top speed in world units a second. It grows as the run goes
// on, so the game gets harder without a level system.
export function topSpeed(distance: number): number {
  return Math.min(22, 11 + distance / 90);
}
