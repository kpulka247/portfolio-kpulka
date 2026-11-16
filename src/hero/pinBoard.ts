import * as THREE from "three";

import {
  OBSTACLE,
  type ObstacleRules,
  obstacleRow,
  overlaps,
  topSpeed,
} from "./runner";
import type { Theme } from "../theme";
import { buildSuv } from "./suv";

// The hero's pin board: a field of pins that swell slowly and dip under the
// pointer. Play drops a small SUV on it, which drives like a car on the
// board above the hero's Play row. Driving forward scrolls the board
// towards the camera, new rows rise at the horizon, and obstacles of four
// kinds come up that the SUV has to avoid. React owns the page around it
// and talks to it only through this interface.

export interface RunState {
  // How far this run has gone, in whole metres.
  distance: number;
  crashed: boolean;
}

export interface PinBoardOptions {
  // The first frame is on screen, so the still image behind can go.
  onReady: () => void;
  // The visitor pressed Escape.
  onStop: () => void;
  // The first seconds ran too slowly. The board keeps its last frame on
  // screen and stops drawing, so the caller should hide Play.
  onSlow: () => void;
  // The run's distance changed by a metre, or the SUV crashed.
  onRun: (state: RunState) => void;
  // A run started, from Play or after a crash.
  onRunStart: () => void;
  // The visitor touched a control for the first time in this run.
  onFirstInput: () => void;
  // The top of the hero's Play row, in pixels from the top of the canvas.
  // The SUV drives only above it.
  playBottom: () => number;
  // Draw one frame and no animation, for visitors who prefer less motion.
  // The frame is the real board, so it matches every screen.
  still?: boolean;
  theme: Theme;
}

export interface PinBoard {
  setPlaying: (playing: boolean) => void;
  // Fades the board to the day or night palette.
  setTheme: (theme: Theme) => void;
  dispose: () => void;
}

// Day is brushed aluminium in daylight. Night is graphite under a faint
// cool moon, lit by the SUV's own lights. Both from the Doop frames.
interface Palette {
  ground: string;
  pinLow: string;
  pinHigh: string;
  base: string;
  sky: string;
  earth: string;
  skyIntensity: number;
  sun: string;
  sunIntensity: number;
  // By obstacle kind, from super easy to hard.
  obstacles: [string, string, string, string, string];
}

const DAY: Palette = {
  ground: "#e4e5e8",
  pinLow: "#b9bbc1",
  pinHigh: "#f6f6f7",
  base: "#9fa1a8",
  sky: "#ffffff",
  earth: "#a9abb2",
  skyIntensity: 1.3,
  sun: "#ffffff",
  sunIntensity: 2.8,
  obstacles: ["#aeb0b6", "#a2a4aa", "#94969c", "#888a90", "#888a90"],
};

// Warm graphite, picked from the lighter palettes in Doop.
const NIGHT: Palette = {
  ground: "#3b3835",
  pinLow: "#47433f",
  pinHigh: "#7c7772",
  base: "#2a2724",
  sky: "#c9d0dc",
  earth: "#15161a",
  skyIntensity: 1.2,
  sun: "#dfe5ee",
  sunIntensity: 1.7,
  obstacles: ["#5f5a55", "#5a5550", "#55504b", "#504b46", "#504b46"],
};

const THEME_FADE = 4;
const MAX_PIXEL_RATIO = 1.5;
// Below this width the board uses the phone grid and camera.
const PHONE_WIDTH = 700;
// The automatic press starts after this many seconds without input, and
// takes FADE_IN_SECONDS to reach its full depth.
const IDLE_SECONDS = 4;
const FADE_IN_SECONDS = 2;
// How fast pins move towards a press, and obstacles towards their height,
// per second. Higher is snappier.
const RATE = { pointer: 14, car: 30, idle: 5, obstacle: 6 };
// Pins rise back to about a fifth of a press in one second.
const RECOVERY = 0.25;
const RECOVERY_PLAYING = 0.55;
// The resting height of a pin top, and how far below it a row that is
// rising in at the horizon or sinking out at the front starts or ends.
const PIN_REST = 1.15;
// New rows come up from far below the board at its far edge, as if from
// a drop with no bottom, and settle within RISE_ROWS. The front row sinks
// away over FALL_ROWS.
const PIN_HIDDEN = -16;
const RISE_ROWS = 1.4;
const FALL_ROWS = 2;
// A rising pin reaches this much further below its top, so it looks like
// a column coming up, not a floating block. Settled pins stay short, which
// keeps their shadows and fill cheap.
const PIN_LENGTH = 20;
// The SUV rides on the pin tops and presses them only a little, enough to
// leave tracks.
const CAR_SINK = 0.1;
const TRACK_DEPTH = 0.22;
// How tall each kind of obstacle stands above the pins. Their colours, a
// few steps darker than the board, are in the palettes.
const OBSTACLE_HEIGHT: Record<number, number> = {
  [OBSTACLE.bump]: 0.45,
  [OBSTACLE.wall]: 0.7,
  [OBSTACLE.pillar]: 1.7,
  [OBSTACLE.gate]: 1.2,
  [OBSTACLE.moving]: 1.4,
};
// An obstacle lower than this lets the SUV pass, as when a moving wall
// has sunk.
const SOLID_HEIGHT = 0.3;
// The crash check forgives this share of the SUV's width on every side.
const HIT_MARGIN = 0.1;
// The SUV stays inside this part of the screen sideways.
const SCREEN_EDGE = 0.94;
// After a short warm-up, frames are timed for this long. If they average
// slower than SLOW_FRAME, the device is too slow for the board.
const WARM_UP_FRAMES = 30;
const TIMED_FRAMES = 90;
const SLOW_FRAME = 1 / 24;

// Driving. Distances are world units, about a metre each.
const GRAVITY = 60;
const SPRING = { stiffness: 220, damping: 13 };
const TILT_SPRING = { stiffness: 110, damping: 10 };
// Kept small, so a compressed wheel stays inside its arch.
const WHEEL_TRAVEL = 0.06;
// How fast the SUV climbs away after Stop or a crash.
const LIFT = 60;
const REVERSE_SPEED = 5;
const BRAKE = 22;
const ROLL_OFF = 4;
// Steering: the front wheels turn up to MAX_STEER, less at speed, and the
// SUV turns as a car of this wheelbase would.
const MAX_STEER = 0.6;
const WHEELBASE = 2.2;
// After a crash the SUV flies off after this long. A restart asked for
// before it has left waits for it.
const LAUNCH_AFTER = 0.5;

interface Grid {
  columns: number;
  rows: number;
  spacing: number;
}

// About 4,200 pins on a 16:9 desktop and 1,700 on a phone. Wider screens
// get more columns (desktopGrid).
const DESKTOP: Grid = { columns: 90, rows: 46, spacing: 0.62 };
const PHONE: Grid = { columns: 34, rows: 50, spacing: 0.8 };
const DESKTOP_CAMERA = { fov: 34, y: 15, z: 26 };

// Enough columns that the board's sides stay off screen at the far edge,
// where the view is widest, on screens up to 32:9.
function desktopGrid(aspect: number): Grid {
  const farEdge = ((DESKTOP.rows - 1) * DESKTOP.spacing) / 2;
  const distance = Math.hypot(DESKTOP_CAMERA.y, DESKTOP_CAMERA.z + farEdge);
  const halfAngle = THREE.MathUtils.degToRad(DESKTOP_CAMERA.fov / 2);
  const visibleWidth = 2 * distance * Math.tan(halfAngle) * aspect * 1.1;
  const columns = Math.ceil(visibleWidth / DESKTOP.spacing) + 2;
  return { ...DESKTOP, columns: Math.max(DESKTOP.columns, columns) };
}

const DRIVE_KEYS = new Set([
  "w",
  "a",
  "s",
  "d",
  "arrowup",
  "arrowdown",
  "arrowleft",
  "arrowright",
]);

// The share of the way to a target that something covers in one frame.
function ease(rate: number, dt: number): number {
  return 1 - Math.exp(-rate * dt);
}

// The slow swell of the board at a point of the world.
function swell(x: number, worldZ: number, t: number): number {
  return (
    Math.sin(x * 0.16 + t * 0.5) * 0.42 +
    Math.sin(worldZ * 0.21 - t * 0.4) * 0.32 +
    Math.sin((x + worldZ) * 0.08 + t * 0.25) * 0.36
  );
}

// A damped spring: returns the new velocity after pulling towards target.
function spring(
  value: number,
  velocity: number,
  target: number,
  { stiffness, damping }: { stiffness: number; damping: number },
  dt: number,
): number {
  return velocity + (stiffness * (target - value) - damping * velocity) * dt;
}

function wrapAngle(angle: number): number {
  return Math.atan2(Math.sin(angle), Math.cos(angle));
}

export function mount(
  canvas: HTMLCanvasElement,
  host: HTMLElement,
  options: PinBoardOptions,
): PinBoard {
  const phone = host.clientWidth < PHONE_WIDTH;
  const grid = phone
    ? PHONE
    : desktopGrid(host.clientWidth / Math.max(1, host.clientHeight));
  const { columns, rows, spacing } = grid;
  // One more row than the board shows: the row rising in at the horizon.
  const slots = rows + 1;
  const count = slots * columns;
  const x0 = (-(columns - 1) * spacing) / 2;
  const z0 = (-(rows - 1) * spacing) / 2;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, MAX_PIXEL_RATIO));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const scene = new THREE.Scene();
  // The colours in use, blended between day and night by `night`.
  const groundColor = new THREE.Color(DAY.ground);
  const pinLow = new THREE.Color();
  const pinHigh = new THREE.Color();
  const obstacleColors = DAY.obstacles.map(() => new THREE.Color());
  scene.background = groundColor;
  scene.fog = new THREE.Fog(groundColor, 30, 70);

  const camera = new THREE.PerspectiveCamera(
    phone ? 50 : DESKTOP_CAMERA.fov,
    1,
    0.1,
    200,
  );
  // The phone camera looks down more steeply, so the board fills the tall
  // screen above the copy.
  camera.position.set(
    0,
    phone ? 30 : DESKTOP_CAMERA.y,
    phone ? 20 : DESKTOP_CAMERA.z,
  );
  camera.lookAt(0, 0, phone ? -1 : -6);

  const sky = new THREE.HemisphereLight();
  scene.add(sky);
  // The sun by day, the moon by night.
  const sun = new THREE.DirectionalLight();
  sun.position.set(-26, 11, -4);
  sun.castShadow = true;
  sun.shadow.mapSize.setScalar(phone ? 1024 : 2048);
  const shadowHalfWidth = Math.max(35, (columns * spacing) / 2 + 2);
  Object.assign(sun.shadow.camera, {
    left: -shadowHalfWidth,
    right: shadowHalfWidth,
    top: 30,
    bottom: -30,
    far: 100,
  });
  sun.shadow.bias = -0.0006;
  scene.add(sun);

  // Each pin is a unit-tall box hanging down from its top face, so scaling
  // it never lifts it off the base.
  const pinGeometry = new THREE.BoxGeometry(spacing * 0.8, 1, spacing * 0.8);
  pinGeometry.translate(0, -0.5, 0);
  const pinMaterial = new THREE.MeshStandardMaterial({
    roughness: 0.5,
    metalness: 0.25,
  });
  const pins = new THREE.InstancedMesh(pinGeometry, pinMaterial, count);
  pins.castShadow = true;
  pins.receiveShadow = true;
  for (let i = 0; i < count; i++) pins.setColorAt(i, groundColor);
  scene.add(pins);

  // The base shows between the pins. It stops short of the rows that are
  // still rising, so past the far edge there is only the background.
  const baseFront = z0 + slots * spacing + 1;
  const baseBack = z0 + RISE_ROWS * spacing;
  const baseGeometry = new THREE.PlaneGeometry(
    columns * spacing + 2,
    baseFront - baseBack,
  );
  const baseMaterial = new THREE.MeshStandardMaterial({ roughness: 0.9 });
  const base = new THREE.Mesh(baseGeometry, baseMaterial);
  base.rotation.x = -Math.PI / 2;
  base.position.set(0, -0.3, (baseFront + baseBack) / 2);
  scene.add(base);

  const suv = buildSuv();
  const { size } = suv;
  const ride = size.wheelRadius + size.bodyLift;
  suv.root.visible = false;
  scene.add(suv.root);

  // Per pin, by slot: how far it is pressed down, how tall its obstacle
  // stands, and which kind of obstacle it holds. All three move with their
  // row as the board scrolls.
  const depth = new Float32Array(count);
  const raised = new Float32Array(count);
  const kinds = new Uint8Array(count);
  const matrix = new THREE.Matrix4();
  const colour = new THREE.Color();

  // How far the board has scrolled, and the slot layout that follows.
  // Slot k sits at z0 + (k - 1) * spacing + phase, and shows world row
  // `scrolledRows + rows - k`, so rows further away have higher numbers.
  let scroll = 0;
  let scrolledRows = 0;
  const slotZ = (slot: number, phase: number) =>
    z0 + (slot - 1) * spacing + phase;

  // Shift every slot one row towards the camera. The slot at the horizon
  // starts empty.
  function shiftRows() {
    for (const values of [depth, raised, kinds]) {
      values.copyWithin(columns, 0, (slots - 1) * columns);
      values.fill(0, 0, columns);
    }
  }

  // Moves the pins under a round press towards its depth. `share` is how
  // much of the way they move this frame, so presses sink in instead of
  // snapping down.
  function press(
    x: number,
    z: number,
    radius: number,
    amount: number,
    share: number,
    phase: number,
  ) {
    const i0 = Math.max(0, Math.floor((x - radius - x0) / spacing));
    const i1 = Math.min(columns - 1, Math.ceil((x + radius - x0) / spacing));
    const k0 = Math.max(0, Math.floor((z - radius - z0 - phase) / spacing) + 1);
    const k1 = Math.min(
      slots - 1,
      Math.ceil((z + radius - z0 - phase) / spacing) + 1,
    );
    for (let k = k0; k <= k1; k++) {
      for (let i = i0; i <= i1; i++) {
        const distance = Math.hypot(x0 + i * spacing - x, slotZ(k, phase) - z);
        if (distance >= radius) continue;
        const value = amount * (1 - (distance / radius) ** 2);
        const index = k * columns + i;
        if (value > depth[index])
          depth[index] += (value - depth[index]) * share;
      }
    }
  }

  // Screen and ground. The pin tops are about one unit up.
  const ndc = new THREE.Vector2();
  const raycaster = new THREE.Raycaster();
  const topPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -1);
  const hit = new THREE.Vector3();
  const projected = new THREE.Vector3();

  function groundAt(ndcX: number, ndcY: number): THREE.Vector3 | null {
    ndc.set(ndcX, ndcY);
    raycaster.setFromCamera(ndc, camera);
    return raycaster.ray.intersectPlane(topPlane, hit);
  }

  // The play area: from the Play row up to the follow line, a third of the
  // way to the board's far edge on screen. Recomputed on every resize and
  // at the start of every run.
  const area = { bottom: 0, follow: 0, sideAtFollow: 0 };
  function measureArea() {
    const height = canvas.clientHeight || 1;
    const bottomY = 1 - (2 * options.playBottom()) / height;
    projected.set(0, 1, z0).project(camera);
    const horizonY = projected.y;
    const followY = bottomY + (horizonY - bottomY) / 3;
    area.bottom = (groundAt(0, bottomY)?.z ?? 0) - size.halfLength;
    area.follow = groundAt(0, followY)?.z ?? area.bottom - 4;
    area.sideAtFollow = groundAt(SCREEN_EDGE, followY)?.x ?? -x0;
  }

  // A height at which the SUV, at this point of the board, is just above
  // the top of the screen, so it drops in from out of view.
  function offScreenHeight(x: number, z: number): number {
    for (let y = 2; y < 80; y += 0.5) {
      projected.set(x, y - 0.6, z).project(camera);
      if (projected.y > 1.05) return y;
    }
    return 80;
  }

  // How far the SUV can go sideways at a depth and stay on screen.
  function sideLimit(z: number): number {
    projected.set(0, 1, z).project(camera);
    const x = groundAt(SCREEN_EDGE, projected.y)?.x ?? -x0;
    return Math.min(x, -x0 - 1) - size.halfWidth;
  }

  // Pointer, projected onto the plane of the pin tops.
  let pointer: THREE.Vector3 | null = null;
  let pointerDown = false;
  const onPointerMove = (event: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    const point = groundAt(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1,
    );
    pointer = point ? point.clone() : null;
  };
  const onPointerLeave = () => {
    pointer = null;
    pointerDown = false;
  };
  // Presses on the hero's buttons are not presses on the board.
  const onPointerDown = (event: PointerEvent) => {
    if (event.target !== canvas) return;
    onPointerMove(event);
    pointerDown = true;
    markTouched();
    if (state === "crashed") restartIfReady();
  };
  const onPointerUp = () => {
    pointerDown = false;
  };
  host.addEventListener("pointermove", onPointerMove);
  host.addEventListener("pointerleave", onPointerLeave);
  host.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("pointerup", onPointerUp);

  // The first touch of a control in a run. Set from the input events, so
  // even a tap shorter than a frame counts.
  function markTouched() {
    if (state !== "driving" || touched) return;
    touched = true;
    options.onFirstInput();
  }

  // Driving keys are listened to only while the game is on, so they never
  // take over page scrolling.
  const keys = new Set<string>();
  const onKeyDown = (event: KeyboardEvent) => {
    const key = event.key.toLowerCase();
    if (key === "escape") {
      options.onStop();
      return;
    }
    if (!DRIVE_KEYS.has(key)) return;
    event.preventDefault();
    keys.add(key);
    markTouched();
    if (state === "crashed" && (key === "w" || key === "arrowup")) {
      restartIfReady();
    }
  };
  const onKeyUp = (event: KeyboardEvent) => {
    keys.delete(event.key.toLowerCase());
  };

  // The SUV. "hidden" off the board, "driving" during a run (including the
  // drop in), "crashed" after a hit, "leaving" after Stop.
  let state: "hidden" | "driving" | "crashed" | "leaving" = "hidden";
  let carX = 0;
  let carZ = 0;
  // 0 faces up the screen. Positive turns to the left.
  let yaw = 0;
  // Along the heading. Negative is reversing.
  let speed = 0;
  let lastSpeed = 0;
  let steerShown = 0;
  let bodyY = 0;
  let climb = 0;
  let pitch = 0;
  let pitchSpeed = 0;
  let roll = 0;
  let rollSpeed = 0;
  let spin = 0;
  let spinSpeed = 0;
  let crashedAt = 0;
  let launched = false;
  let restartQueued = false;
  let touched = false;

  // The run.
  let run: ObstacleRules | null = null;
  let runScroll = 0;
  let spawnZ = 0;
  let distance = 0;
  let reported: RunState = { distance: -1, crashed: false };
  const obstacles = new Map<number, Uint8Array>();
  const noObstacles = new Uint8Array(columns);

  function obstaclesFor(worldRow: number): Uint8Array {
    if (!run) return noObstacles;
    let mask = obstacles.get(worldRow);
    if (!mask) {
      mask = obstacleRow(worldRow, run);
      obstacles.set(worldRow, mask);
    }
    return mask;
  }

  function report() {
    const next = {
      distance: Math.floor(distance),
      crashed: state === "crashed",
    };
    if (
      next.distance === reported.distance &&
      next.crashed === reported.crashed
    ) {
      return;
    }
    reported = next;
    options.onRun(next);
  }

  // A fresh SUV drops in at the bottom centre of the play area, facing up
  // the screen, and a new run starts with a clear road.
  function startRun() {
    measureArea();
    const side = Math.min(area.sideAtFollow, -x0 - 1);
    const first = Math.max(0, Math.ceil((-side - x0) / spacing));
    const last = Math.min(columns - 1, Math.floor((side - x0) / spacing));
    run = {
      seed: Math.floor(Math.random() * 2 ** 31),
      columns,
      playable: [first, last],
      startRow: scrolledRows,
      spacing,
      minGap: Math.ceil((size.halfWidth * 2 * 2.2) / spacing),
    };
    obstacles.clear();
    const catching = state === "leaving" && suv.root.visible;
    state = "driving";
    speed = 0;
    lastSpeed = 0;
    steerShown = 0;
    spinSpeed = 0;
    launched = false;
    restartQueued = false;
    if (catching) {
      // Play pressed again while the SUV was flying off: it stops climbing
      // and falls back where it is.
      climb = Math.min(climb, 0);
    } else {
      carX = 0;
      carZ = area.bottom;
      yaw = 0;
      spin = 0;
      bodyY = groundUnder().mean + offScreenHeight(carX, carZ);
      climb = 0;
      pitch = 0.08;
      pitchSpeed = 0;
      roll = 0;
      rollSpeed = (Math.random() - 0.5) * 0.8;
    }
    spawnZ = carZ;
    touched = false;
    runScroll = 0;
    distance = 0;
    reported = { distance: -1, crashed: false };
    suv.root.visible = true;
    keys.clear();
    report();
    options.onRunStart();
  }

  // After a crash, a new run starts once the wrecked SUV has flown off.
  function restartIfReady() {
    if (suv.root.visible) restartQueued = true;
    else startRun();
  }

  function setPlaying(next: boolean) {
    if (next === (state === "driving" || state === "crashed")) return;
    keys.clear();
    if (next) {
      window.addEventListener("keydown", onKeyDown);
      window.addEventListener("keyup", onKeyUp);
      startRun();
    } else {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      // Launch up and away, nose first, unless already gone.
      state = suv.root.visible ? "leaving" : "hidden";
      climb = Math.max(climb, 6);
      pitchSpeed += 2;
      restartQueued = false;
      run = null;
      obstacles.clear();
    }
    wake();
  }

  // The ground under each wheel, from the swell and the tracks. Returns the
  // four heights and their mean.
  const wheelGround = [0, 0, 0, 0];
  function groundUnder() {
    const sin = Math.sin(yaw);
    const cos = Math.cos(yaw);
    let sum = 0;
    suv.wheels.forEach((wheel, n) => {
      const wx = carX + wheel.x * cos + wheel.z * sin;
      const wz = carZ - wheel.x * sin + wheel.z * cos;
      wheelGround[n] =
        PIN_REST + swell(wx, wz - scroll, clock.elapsedTime) - CAR_SINK;
      sum += wheelGround[n];
    });
    return { mean: sum / 4 };
  }

  // What the controls ask for this frame: throttle and steer, -1 to 1.
  function controls() {
    let throttle = 0;
    let steer = 0;
    if (keys.has("w") || keys.has("arrowup")) throttle += 1;
    if (keys.has("s") || keys.has("arrowdown")) throttle -= 1;
    if (keys.has("a") || keys.has("arrowleft")) steer -= 1;
    if (keys.has("d") || keys.has("arrowright")) steer += 1;
    // Holding the board drives towards the finger, and reverses towards it
    // when it is behind the SUV.
    if (pointerDown && pointer) {
      const dx = pointer.x - carX;
      const dz = pointer.z - carZ;
      if (Math.hypot(dx, dz) > 0.6) {
        const toward = Math.atan2(-dx, -dz);
        const ahead = wrapAngle(toward - yaw);
        if (Math.abs(ahead) < Math.PI / 2 + 0.3) {
          throttle = 1;
          steer = THREE.MathUtils.clamp(-ahead * 2, -1, 1);
        } else {
          throttle = -1;
          steer = THREE.MathUtils.clamp(
            wrapAngle(toward - yaw - Math.PI) * 2,
            -1,
            1,
          );
        }
      }
    }
    return { throttle, steer };
  }

  // Speed, steering, position and the sprung body, once a frame.
  function drive(dt: number, phase: number) {
    const { throttle, steer } =
      state === "driving" ? controls() : { throttle: 0, steer: 0 };

    if (state === "driving") {
      if (throttle > 0) {
        speed =
          speed < 0
            ? speed + BRAKE * dt
            : speed + (topSpeed(distance) - speed) * ease(1, dt);
      } else if (throttle < 0) {
        speed =
          speed > 0.3
            ? speed - BRAKE * dt
            : Math.max(-REVERSE_SPEED, speed - 8 * dt);
      } else {
        speed -= Math.sign(speed) * Math.min(Math.abs(speed), ROLL_OFF * dt);
      }
    } else {
      speed *= Math.exp(-(state === "crashed" ? 5 : 3) * dt);
    }
    const accel = (speed - lastSpeed) / Math.max(dt, 1e-3);
    lastSpeed = speed;

    // A car turns only while it rolls, and steers less at speed.
    steerShown += (steer - steerShown) * ease(10, dt);
    const angle = (steerShown * MAX_STEER) / (1 + Math.abs(speed) * 0.06);
    const turn = (-speed * Math.tan(angle)) / WHEELBASE;
    yaw += turn * dt;
    spin += spinSpeed * dt;
    // A new run straightens out any spin left from the last one.
    if (state === "driving") spin -= wrapAngle(spin) * ease(8, dt);
    spinSpeed *= Math.exp(-2.5 * dt);

    // Move. Past the follow line the board scrolls instead of the SUV.
    if (state === "driving" || state === "crashed") {
      let nextZ = carZ - Math.cos(yaw) * speed * dt;
      let nextX = carX - Math.sin(yaw) * speed * dt;
      if (nextZ < area.follow) {
        const ahead = area.follow - nextZ;
        scroll += ahead;
        if (state === "driving") runScroll += ahead;
        nextZ = area.follow;
      }
      nextZ = Math.min(nextZ, area.bottom);
      const side = sideLimit(nextZ);
      if (Math.abs(nextX) > side) {
        nextX = Math.sign(nextX) * side;
        speed *= Math.exp(-3 * dt);
      }
      carX = nextX;
      carZ = nextZ;
    }

    const { mean } = groundUnder();
    const rest = mean + ride;
    if (launched || state === "leaving") {
      climb += LIFT * dt;
    } else if (bodyY - rest > WHEEL_TRAVEL || climb > 0) {
      climb -= GRAVITY * dt;
    } else {
      climb = spring(bodyY, climb, rest, SPRING, dt);
    }
    bodyY += climb * dt;
    // Full compression: the suspension bottoms out and kicks the body back
    // up a little, as after a landing.
    if (!launched && state !== "leaving" && bodyY < rest - WHEEL_TRAVEL) {
      bodyY = rest - WHEEL_TRAVEL;
      if (climb < 0) climb = -climb * 0.22;
    }
    const onGround = bodyY - rest < WHEEL_TRAVEL;

    // The body follows the ground under it, squats when speeding up, dips
    // when braking and leans out of turns.
    const [frontLeft, frontRight, backLeft, backRight] = wheelGround;
    const groundPitch = Math.atan2(
      (frontLeft + frontRight - backLeft - backRight) / 2,
      size.axle.z * 2,
    );
    const groundRoll = Math.atan2(
      (frontRight + backRight - frontLeft - backLeft) / 2,
      size.axle.x * 2,
    );
    const pitchTarget = onGround
      ? groundPitch + THREE.MathUtils.clamp(accel * 0.008, -0.1, 0.1)
      : 0;
    // The body leans away from the turn, as a real car's does.
    const rollTarget = onGround
      ? groundRoll + THREE.MathUtils.clamp(-turn * speed * 0.012, -0.12, 0.12)
      : 0;
    pitchSpeed = spring(pitch, pitchSpeed, pitchTarget, TILT_SPRING, dt);
    rollSpeed = spring(roll, rollSpeed, rollTarget, TILT_SPRING, dt);
    pitch += pitchSpeed * dt;
    roll += rollSpeed * dt;

    suv.root.position.set(carX, 0, carZ);
    suv.root.rotation.y = yaw + spin;
    suv.body.position.y = bodyY;
    suv.body.rotation.set(pitch, 0, roll);
    suv.wheels.forEach((wheel, n) => {
      const hub = bodyY - size.bodyLift;
      wheel.pivot.position.y = THREE.MathUtils.clamp(
        wheelGround[n] + size.wheelRadius,
        hub - WHEEL_TRAVEL,
        hub + WHEEL_TRAVEL,
      );
      wheel.spinner.rotation.x -= (speed * dt) / size.wheelRadius;
      // The front wheels show less turn than the steering uses, so
      // they stay under their arches.
      if (wheel.front) wheel.pivot.rotation.y = -steerShown * 0.35;
    });

    // Wheels on the ground leave tracks in the pins.
    if (onGround && !launched && state !== "leaving") {
      const share = ease(RATE.car, dt);
      const sin = Math.sin(yaw);
      const cos = Math.cos(yaw);
      for (const wheel of suv.wheels) {
        press(
          carX + wheel.x * cos + wheel.z * sin,
          carZ - wheel.x * sin + wheel.z * cos,
          0.45,
          TRACK_DEPTH,
          share,
          phase,
        );
      }
    }

    // Distance is how far up the road the run has got, never back.
    if (state === "driving" && onGround) {
      distance = Math.max(distance, runScroll + spawnZ - carZ);
    }

    if (
      state === "crashed" &&
      !launched &&
      clock.elapsedTime - crashedAt > LAUNCH_AFTER
    ) {
      launched = true;
      climb = Math.max(climb, 6);
    }
    if ((state === "leaving" || launched) && climb > 0) {
      projected.set(carX, bodyY - 0.6, carZ).project(camera);
      if (projected.y > 1.05) {
        suv.root.visible = false;
        speed = 0;
        if (state === "leaving") state = "hidden";
        if (state === "crashed" && restartQueued) startRun();
      }
    }
  }

  // Does the SUV touch an obstacle that stands high enough?
  function hitsObstacle(phase: number): boolean {
    const footprint = {
      x: carX,
      z: carZ,
      halfWidth: size.halfWidth,
      halfLength: size.halfLength,
      yaw: yaw + spin,
    };
    const reach = size.halfLength + spacing;
    const half = spacing * 0.4;
    const margin = size.halfWidth * 2 * HIT_MARGIN;
    for (let k = 0; k < slots; k++) {
      const z = slotZ(k, phase);
      if (Math.abs(z - carZ) > reach) continue;
      const i0 = Math.max(0, Math.floor((carX - reach - x0) / spacing));
      const i1 = Math.min(
        columns - 1,
        Math.ceil((carX + reach - x0) / spacing),
      );
      for (let i = i0; i <= i1; i++) {
        if (raised[k * columns + i] < SOLID_HEIGHT) continue;
        const block = { x: x0 + i * spacing, z, half };
        if (overlaps(footprint, block, margin)) return true;
      }
    }
    return false;
  }

  function crash() {
    state = "crashed";
    crashedAt = clock.elapsedTime;
    speed *= 0.3;
    climb = 4;
    const side = Math.random() < 0.5 ? -1 : 1;
    rollSpeed += 5 * side;
    pitchSpeed += 1.5;
    spinSpeed += 3 * side;
    report();
  }

  // 0 is day, 1 is night. It follows `nightTarget` over about a second.
  let night = options.theme === "dark" ? 1 : 0;
  let nightTarget = night;
  const mixColor = (target: THREE.Color, day: string, dark: string) =>
    target.set(day).lerp(scratch.set(dark), night);
  const scratch = new THREE.Color();
  function applyPalette() {
    mixColor(groundColor, DAY.ground, NIGHT.ground);
    (scene.fog as THREE.Fog).color.copy(groundColor);
    mixColor(pinLow, DAY.pinLow, NIGHT.pinLow);
    mixColor(pinHigh, DAY.pinHigh, NIGHT.pinHigh);
    mixColor(baseMaterial.color, DAY.base, NIGHT.base);
    mixColor(sky.color, DAY.sky, NIGHT.sky);
    mixColor(sky.groundColor, DAY.earth, NIGHT.earth);
    sky.intensity = THREE.MathUtils.lerp(
      DAY.skyIntensity,
      NIGHT.skyIntensity,
      night,
    );
    mixColor(sun.color, DAY.sun, NIGHT.sun);
    sun.intensity = THREE.MathUtils.lerp(
      DAY.sunIntensity,
      NIGHT.sunIntensity,
      night,
    );
    obstacleColors.forEach((color, n) =>
      mixColor(color, DAY.obstacles[n], NIGHT.obstacles[n]),
    );
    // The lights do not fade with the sky: they switch on at once when the
    // fade to night has finished, and off the moment day begins.
    suv.setLights(night === 1 && nightTarget === 1 ? 1 : 0);
  }
  applyPalette();

  function setTheme(theme: Theme) {
    nightTarget = theme === "dark" ? 1 : 0;
    // A board that does not animate jumps straight to the new palette.
    if (frozen) night = nightTarget;
    applyPalette();
    wake();
  }

  const clock = new THREE.Clock(false);
  // Counts as input at load, so the automatic press first starts after
  // IDLE_SECONDS, as in the still image.
  let lastInput = 0;
  let frameId = 0;
  let ready = false;
  let framesDrawn = 0;
  let timedSeconds = 0;

  function frame() {
    const elapsed = clock.getDelta();
    const dt = Math.min(elapsed, 1 / 30);

    framesDrawn += 1;
    // Automated browsers draw the board in software and would always count
    // as slow, so the end-to-end tests could never reach the live board.
    if (framesDrawn > WARM_UP_FRAMES && !navigator.webdriver) {
      if (framesDrawn <= WARM_UP_FRAMES + TIMED_FRAMES) timedSeconds += elapsed;
      if (framesDrawn === WARM_UP_FRAMES + TIMED_FRAMES) {
        if (timedSeconds / TIMED_FRAMES > SLOW_FRAME) {
          frozen = true;
          frameId = 0;
          options.onSlow();
          return;
        }
      }
    }
    const t = clock.elapsedTime;

    if (night !== nightTarget) {
      night += (nightTarget - night) * ease(THEME_FADE, dt);
      if (Math.abs(nightTarget - night) < 0.002) night = nightTarget;
      applyPalette();
    }

    const phaseBefore = scroll - scrolledRows * spacing;
    if (state !== "hidden") drive(dt, phaseBefore);

    // Scroll the board a row at a time.
    const rowsNow = Math.floor(scroll / spacing);
    for (let n = 0; n < Math.min(slots, rowsNow - scrolledRows); n++) {
      shiftRows();
    }
    if (rowsNow !== scrolledRows) {
      scrolledRows = rowsNow;
      for (const row of obstacles.keys()) {
        if (row < scrolledRows - 2) obstacles.delete(row);
      }
    }
    const phase = scroll - scrolledRows * spacing;

    const recovery =
      (state === "driving" || state === "crashed"
        ? RECOVERY_PLAYING
        : RECOVERY) ** dt;
    for (let i = 0; i < count; i++) depth[i] *= recovery;

    if (state === "driving") {
      if (hitsObstacle(phase)) crash();
    }
    if (state === "driving" || state === "crashed") report();

    if (state === "hidden" || state === "leaving") {
      if (pointer) {
        press(
          pointer.x,
          pointer.z,
          pointerDown ? 4.2 : 3,
          pointerDown ? 1.6 : 1,
          ease(RATE.pointer, dt),
          phase,
        );
        lastInput = t;
      } else if (t - lastInput > IDLE_SECONDS) {
        const fadeIn = THREE.MathUtils.smoothstep(
          t - lastInput - IDLE_SECONDS,
          0,
          FADE_IN_SECONDS,
        );
        press(
          Math.sin(t * 0.23) * x0 * 0.55,
          Math.cos(t * 0.31) * z0 * 0.45 - 3,
          3.4,
          1.25 * fadeIn,
          ease(RATE.idle, dt),
          phase,
        );
      }
    }

    // Rows rise in over the first RISE_ROWS at the far edge and sink over
    // the last FALL_ROWS at the front. Both depend on the row's position,
    // not its slot, so nothing jumps when the rows shift.
    const along = phase / spacing;
    const obstacleShare = ease(RATE.obstacle, dt);
    for (let k = 0; k < slots; k++) {
      const z = slotZ(k, phase);
      const worldRow = scrolledRows + rows - k;
      const worldZ = z - scroll;
      const mask = obstaclesFor(worldRow);
      // Rising: fast out of the depth, slowing as it reaches the surface.
      const rise = Math.min(1, Math.max(0, (k + along) / RISE_ROWS));
      const fall = Math.min(1, Math.max(0, (slots - k - along) / FALL_ROWS));
      const shown = Math.min(1 - (1 - rise) ** 3, 1 - (1 - fall) ** 3);
      // Moving walls rise and sink together, each on its own beat.
      const wave = 0.5 + 0.5 * Math.sin(t * 2.4 + worldRow * 0.9);
      for (let i = 0; i < columns; i++) {
        const index = k * columns + i;
        const x = x0 + i * spacing;
        const kind = mask[i];
        if (kind) kinds[index] = kind;
        const kindHeight = OBSTACLE_HEIGHT[kinds[index]];
        let target = kind && kindHeight ? kindHeight : 0;
        if (kind === OBSTACLE.moving) target *= wave;
        raised[index] += (target - raised[index]) * obstacleShare;
        if (!kind && raised[index] < 0.01) kinds[index] = 0;
        const surface =
          PIN_REST + swell(x, worldZ, t) - depth[index] * 1.05 + raised[index];
        const height = PIN_HIDDEN + (surface - PIN_HIDDEN) * shown;
        matrix.makeScale(
          1,
          Math.max(0.2, height + 1.5) + (1 - shown) * PIN_LENGTH,
          1,
        );
        matrix.setPosition(x, height, z);
        pins.setMatrixAt(index, matrix);
        colour
          .copy(pinLow)
          .lerp(pinHigh, THREE.MathUtils.clamp((height - 0.1) / 1.6, 0, 1));
        if (kindHeight) {
          colour.lerp(
            obstacleColors[kinds[index] - 1],
            Math.min(1, raised[index] / 0.3),
          );
        }
        // Rising rows come out of the haze below the edge.
        colour.lerp(groundColor, (1 - shown) * 0.7);
        pins.setColorAt(index, colour);
      }
    }
    pins.instanceMatrix.needsUpdate = true;
    if (pins.instanceColor) pins.instanceColor.needsUpdate = true;

    renderer.render(scene, camera);
    if (!ready) {
      ready = true;
      options.onReady();
    }
    frameId = frozen ? 0 : requestAnimationFrame(frame);
  }

  // Render only while the hero is on screen and the tab is visible. A
  // frozen board draws one frame each time it is woken, and no more.
  let frozen = options.still ?? false;
  let inView = true;
  function wake() {
    const shouldRun = inView && !document.hidden;
    if (shouldRun && frameId === 0) {
      clock.start();
      frameId = requestAnimationFrame(frame);
    } else if (!shouldRun && frameId !== 0) {
      cancelAnimationFrame(frameId);
      frameId = 0;
      clock.stop();
    }
  }
  const visibility = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    wake();
  });
  visibility.observe(host);
  document.addEventListener("visibilitychange", wake);

  const resize = new ResizeObserver(() => {
    const { clientWidth, clientHeight } = canvas;
    if (clientWidth === 0 || clientHeight === 0) return;
    renderer.setSize(clientWidth, clientHeight, false);
    camera.aspect = clientWidth / clientHeight;
    camera.updateProjectionMatrix();
    measureArea();
    if (frozen) wake();
  });
  resize.observe(canvas);

  wake();

  return {
    setPlaying,
    setTheme,
    dispose() {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      cancelAnimationFrame(frameId);
      frameId = 0;
      visibility.disconnect();
      resize.disconnect();
      document.removeEventListener("visibilitychange", wake);
      host.removeEventListener("pointermove", onPointerMove);
      host.removeEventListener("pointerleave", onPointerLeave);
      host.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      pinGeometry.dispose();
      pinMaterial.dispose();
      baseGeometry.dispose();
      baseMaterial.dispose();
      suv.dispose();
      renderer.dispose();
    },
  };
}
