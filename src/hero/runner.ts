export const SLOT_METRES = 4;
const REFERENCE_WIDTH = 20;

// What a pin holds. Super easy, easy, medium and hard, from the request.
export const OBSTACLE = {
  none: 0,
  // Super easy: a single low block.
  bump: 1,
  // Easy: a short low wall.
  wall: 2,
  // Medium: tall pillars in pairs, with a gap you weave through.
  pillar: 3,
  // Hard: a wall across the road with one gap.
  gate: 4,
  // Hard: the same wall, rising and sinking.
  moving: 5,
} as const;
export type ObstacleKind = (typeof OBSTACLE)[keyof typeof OBSTACLE];

export interface ObstacleRules {
  seed: number;
  columns: number;
  // The first and last column of the road the car can reach.
  playable: readonly [number, number];
  // The world row at the front of the board when the run started.
  startRow: number;
  // Metres between rows.
  spacing: number;
  // The narrowest gap, in columns, the car fits through.
  minGap: number;
}

interface Mix {
  // The share of slots that hold an event.
  chance: number;
  // How often each kind leads an event. They need not add up to 1.
  bump: number;
  wall: number;
  pillar: number;
  hard: number;
  // The share of events that add a second, easier group.
  combo: number;
}

// The difficulty at a distance. Between two points it changes smoothly,
// and after the last one it stays.
const MIX_POINTS: [number, Mix][] = [
  [150, { chance: 0.05, bump: 1, wall: 0, pillar: 0, hard: 0, combo: 0 }],
  [600, { chance: 0.18, bump: 1, wall: 0, pillar: 0, hard: 0, combo: 0 }],
  [1500, { chance: 0.32, bump: 0.5, wall: 0.5, pillar: 0, hard: 0, combo: 0 }],
  [
    3000,
    { chance: 0.42, bump: 0.3, wall: 0.4, pillar: 0.3, hard: 0, combo: 0.25 },
  ],
  [
    5000,
    {
      chance: 0.52,
      bump: 0.15,
      wall: 0.3,
      pillar: 0.3,
      hard: 0.25,
      combo: 0.45,
    },
  ],
];

export function mixAt(distance: number): Mix | null {
  if (distance < MIX_POINTS[0][0]) return null;
  for (let i = 1; i < MIX_POINTS.length; i++) {
    const [to, next] = MIX_POINTS[i];
    if (distance >= to) continue;
    const [from, prev] = MIX_POINTS[i - 1];
    const share = (distance - from) / (to - from);
    const mix = { ...prev };
    for (const key of Object.keys(prev) as (keyof Mix)[]) {
      mix[key] = prev[key] + (next[key] - prev[key]) * share;
    }
    return mix;
  }
  return MIX_POINTS[MIX_POINTS.length - 1][1];
}

// The car's top speed in metres a second. It rises slowly over the first
// five kilometres.
export function topSpeed(distance: number): number {
  return 11 + 7 * Math.min(1, Math.max(0, distance) / 5000);
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

function slotStart(slot: number, rules: ObstacleRules): number {
  return rules.startRow + Math.ceil((slot * SLOT_METRES) / rules.spacing);
}

// What each column of a world row holds, as OBSTACLE values.
export function obstacleRow(
  worldRow: number,
  rules: ObstacleRules,
): Uint8Array {
  const mask = new Uint8Array(rules.columns);
  const metres = (worldRow - rules.startRow) * rules.spacing;
  if (metres < 0) return mask;
  const slot = Math.floor(metres / SLOT_METRES);
  if (worldRow - slotStart(slot, rules) >= 2) return mask;

  const mix = mixAt(slot * SLOT_METRES);
  if (!mix) return mask;
  const roll = (n: number) => hash(rules.seed, slot, n);
  if (roll(0) >= mix.chance) return mask;

  const [first, last] = rules.playable;
  const span = last - first + 1;
  const scale = (span * rules.spacing) / REFERENCE_WIDTH;
  let n = 10;
  const next = () => roll(n++);

  const place = (start: number, width: number, kind: ObstacleKind) => {
    const before = mask.slice();
    for (let c = Math.max(first, start); c < start + width && c <= last; c++) {
      mask[c] = kind;
    }
    if (widestGap(mask, rules.playable) < rules.minGap) mask.set(before);
  };
  const somewhere = (width: number) =>
    first + Math.floor(next() * Math.max(1, span - width + 1));
  const howMany = (base: number) => {
    const exact = base * scale;
    return Math.floor(exact) + (next() < exact % 1 ? 1 : 0);
  };

  const placeBumps = (base: number) => {
    for (let i = howMany(base); i > 0; i--)
      place(somewhere(1), 1, OBSTACLE.bump);
  };
  const placeWalls = (base: number) => {
    for (let i = howMany(base); i > 0; i--) {
      const width = 2 + Math.floor(next() * 3);
      place(somewhere(width), width, OBSTACLE.wall);
    }
  };

  let pick = roll(1) * (mix.bump + mix.wall + mix.pillar + mix.hard);
  let lead: "bump" | "wall" | "pillar" | "hard" = "bump";
  for (const kind of ["bump", "wall", "pillar", "hard"] as const) {
    if (pick < mix[kind]) {
      lead = kind;
      break;
    }
    pick -= mix[kind];
  }
  if (lead === "hard" && slot % 3 !== 0) lead = "pillar";
  if (lead === "pillar" && slot % 2 !== 0)
    lead = mix.wall > 0 ? "wall" : "bump";

  if (lead === "bump") placeBumps(1.5);
  if (lead === "wall") placeWalls(1.2);
  if (lead === "pillar") {
    for (let i = howMany(0.8); i > 0; i--) {
      const width = 1 + Math.floor(next() * 2);
      const gap = rules.minGap + Math.floor(next() * 2);
      const start = somewhere(width * 2 + gap);
      place(start, width, OBSTACLE.pillar);
      place(start + width + gap, width, OBSTACLE.pillar);
    }
  }
  if (lead === "hard") {
    const gap = rules.minGap + Math.floor(next() * 3);
    const at = first + Math.floor(next() * Math.max(1, span - gap));
    const kind = next() < 0.5 ? OBSTACLE.gate : OBSTACLE.moving;
    for (let c = first; c <= last; c++) {
      if (c < at || c >= at + gap) mask[c] = kind;
    }
  }

  if (lead !== "hard" && next() < mix.combo) {
    if (next() < 0.5) placeBumps(0.8);
    else placeWalls(0.6);
  }
  return mask;
}

export interface Box {
  x: number;
  z: number;
  // Half the size along the box's own axes.
  halfWidth: number;
  halfLength: number;
  // Turn about the vertical axis. 0 means the box's length runs along z.
  yaw: number;
}

// Whether the car's footprint overlaps a square block, by the separating
// axis test. `margin` shrinks the car on every side first, so a near miss
// never counts.
export function overlaps(
  car: Box,
  block: { x: number; z: number; half: number },
  margin: number,
): boolean {
  const hw = Math.max(0, car.halfWidth - margin);
  const hl = Math.max(0, car.halfLength - margin);
  const cos = Math.cos(car.yaw);
  const sin = Math.sin(car.yaw);
  const across = { x: cos, z: -sin };
  const along = { x: sin, z: cos };
  const dx = block.x - car.x;
  const dz = block.z - car.z;
  const axes = [{ x: 1, z: 0 }, { x: 0, z: 1 }, across, along];
  for (const axis of axes) {
    const distance = Math.abs(dx * axis.x + dz * axis.z);
    const carReach =
      hw * Math.abs(across.x * axis.x + across.z * axis.z) +
      hl * Math.abs(along.x * axis.x + along.z * axis.z);
    const blockReach = block.half * (Math.abs(axis.x) + Math.abs(axis.z));
    if (distance > carReach + blockReach) return false;
  }
  return true;
}
