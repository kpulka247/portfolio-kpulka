import * as THREE from "three";

import {
  OBSTACLE,
  type ObstacleRules,
  obstacleRow,
  overlaps,
  topSpeed,
} from "./runner";
import type { Theme } from "../theme";
import { createSmoke } from "./smoke";
import { ARCH_GAP, buildCar } from "./car";

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
  // The run's distance changed by a metre, or the car crashed.
  onRun: (state: RunState) => void;
  // A run started, from Play or after a crash.
  onRunStart: () => void;
  // The visitor touched a control for the first time in this run.
  onFirstInput: () => void;
  // The top of the hero's Play row, in pixels from the top of the canvas.
  // The car drives only above it.
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

const NIGHT: Palette = {
  ground: "#3b3835",
  pinLow: "#454341",
  pinHigh: "#7a7875",
  base: "#292725",
  sky: "#e6e3df",
  earth: "#191817",
  skyIntensity: 1.2,
  sun: "#ebe8e4",
  sunIntensity: 1.7,
  obstacles: ["#5d5b58", "#585654", "#53514f", "#4e4c4a", "#4e4c4a"],
};

const THEME_FADE = 4;
const LIGHTS_ON_AT = 0.9;
const MAX_PIXEL_RATIO = 1.5;
// Below this width the board uses the phone grid and camera.
const PHONE_WIDTH = 700;
// The automatic press starts after this many seconds without input, and
// takes FADE_IN_SECONDS to reach its full depth.
const IDLE_SECONDS = 4;
const FADE_IN_SECONDS = 2;
const RATE = { pointer: 14, car: 30, idle: 5, obstacle: 6 };
// Pins rise back to about a fifth of a press in one second.
const RECOVERY = 0.25;
const RECOVERY_PLAYING = 0.55;
const PIN_REST = 1.15;
const PIN_HIDDEN = -16;
const RISE_ROWS = 1.4;
const FALL_ROWS = 2;
const PIN_LENGTH = 20;
const BASE_Y = -4;
const OLD_BASE_Y = -0.3;
const CAR_SINK = 0.1;
const TRACK_DEPTH = 0.22;
const OBSTACLE_HEIGHT: Record<number, number> = {
  [OBSTACLE.bump]: 0.45,
  [OBSTACLE.wall]: 0.7,
  [OBSTACLE.pillar]: 1.7,
  [OBSTACLE.gate]: 1.2,
  [OBSTACLE.moving]: 1.4,
};
const SOLID_HEIGHT = 0.3;
const HIT_MARGIN = 0.1;
const SCREEN_EDGE = 0.94;
// After a short warm-up, frames are timed for this long. If they average
// slower than SLOW_FRAME, the device is too slow for the board.
const WARM_UP_FRAMES = 30;
const TIMED_FRAMES = 90;
const SLOW_FRAME = 1 / 24;

const GRAVITY = 60;
const SPRING = { stiffness: 1400, damping: 75 };
const TILT_SPRING = { stiffness: 600, damping: 49 };
const WHEEL_TRAVEL = ARCH_GAP;
const GROUND_FOLLOW = 40;
const ON_GROUND = 0.06;
const LIFT = 60;
const DENT = { radius: 3, depth: 2.2 };
const DENT_WOBBLE = 9;
const DENT_SETTLE = 4.5;
const DENT_MIN_SPEED = 6;
const DENT_MIN_DROP = 0.8;
const FULL_DROP = 12;
const STICK = 0.5;
const DONUT_RATE = 2.4;
const DONUT_COAST = 0.3;
const DONUT_STOP = 7;
const BURNOUT_BELOW = 1;
const BRAKE_AGAINST_ENGINE = 0.3;
const DONUT_GRIP = 1.1;
const SMOKE_RATE = 28;
const SPAWN_ABOVE_EDGE = 1.4;
const REVERSE_SPEED = 5;
const BRAKE = 22;
const ROLL_OFF = 4;
const MAX_STEER = 0.6;
const WHEELBASE = 2.2;
const LAUNCH_AFTER = 0.5;

interface Grid {
  columns: number;
  rows: number;
  spacing: number;
}

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

function ease(rate: number, dt: number): number {
  return 1 - Math.exp(-rate * dt);
}

function swell(x: number, worldZ: number, t: number): number {
  return (
    Math.sin(x * 0.16 + t * 0.5) * 0.42 +
    Math.sin(worldZ * 0.21 - t * 0.4) * 0.32 +
    Math.sin((x + worldZ) * 0.08 + t * 0.25) * 0.36
  );
}

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
  const groundColor = new THREE.Color(DAY.ground);
  const pinLow = new THREE.Color();
  const pinHigh = new THREE.Color();
  const obstacleColors = DAY.obstacles.map(() => new THREE.Color());
  scene.background = groundColor;
  const fog = new THREE.Fog(groundColor, 30, 70);
  scene.fog = fog;

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

  const reach = (camera.position.y - BASE_Y) / (camera.position.y - OLD_BASE_Y);
  const alongRay = (z: number) =>
    camera.position.z + (z - camera.position.z) * reach;
  const baseFront = alongRay(z0 + slots * spacing + 1);
  const baseBack = alongRay(z0 + RISE_ROWS * spacing);
  const baseGeometry = new THREE.PlaneGeometry(
    (columns * spacing + 2) * reach,
    baseFront - baseBack,
  );
  const baseMaterial = new THREE.MeshStandardMaterial({ roughness: 0.9 });
  const base = new THREE.Mesh(baseGeometry, baseMaterial);
  base.rotation.x = -Math.PI / 2;
  base.position.set(0, BASE_Y, (baseFront + baseBack) / 2);
  scene.add(base);

  const car = buildCar();
  const smoke = createSmoke(scene);
  const smokeHeads = car.headlights.map(() => new THREE.Vector3());
  const smokeTails = car.taillights.map(() => new THREE.Vector3());
  const smokeAhead = new THREE.Vector3();
  const { size } = car;
  const ride = size.wheelRadius + size.bodyLift;
  car.root.visible = false;
  scene.add(car.root);

  const depth = new Float32Array(count);
  const raised = new Float32Array(count);
  const kinds = new Uint8Array(count);
  const matrix = new THREE.Matrix4();
  const colour = new THREE.Color();

  let scroll = 0;
  let scrolledRows = 0;
  const slotZ = (slot: number, phase: number) =>
    z0 + (slot - 1) * spacing + phase;

  function shiftRows() {
    for (const values of [depth, raised, kinds]) {
      values.copyWithin(columns, 0, (slots - 1) * columns);
      values.fill(0, 0, columns);
    }
  }

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

  function offScreenHeight(x: number, z: number): number {
    for (let y = 2; y < 80; y += 0.5) {
      projected.set(x, y - 0.6, z).project(camera);
      if (projected.y > 1.05) return y;
    }
    return 80;
  }

  function sideLimit(z: number): number {
    projected.set(0, 1, z).project(camera);
    const x = groundAt(SCREEN_EDGE, projected.y)?.x ?? -x0;
    return Math.min(x, -x0 - 1) - size.halfWidth;
  }

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

  let state: "hidden" | "driving" | "crashed" | "leaving" = "hidden";
  let carX = 0;
  let carZ = 0;
  let yaw = 0;
  let speed = 0;
  let lastSpeed = 0;
  let steerShown = 0;
  let bodyY = 0;
  let climb = 0;
  let pitch = 0;
  let pitchSpeed = 0;
  let roll = 0;
  let rollSpeed = 0;
  let drivePitch = 0;
  let drivePitchSpeed = 0;
  let driveRoll = 0;
  let driveRollSpeed = 0;
  let spin = 0;
  let spinSpeed = 0;
  let crashedAt = 0;
  let launched = false;
  let burning = false;
  let donutSpeed = 0;
  let smokeDebt = 0;
  let highestGap = 0;
  const dents: { x: number; z: number; age: number; strength: number }[] = [];

  function dentAt(x: number, worldZ: number): number {
    let total = 0;
    for (const dent of dents) {
      const distance = Math.hypot(x - dent.x, worldZ - dent.z);
      if (distance >= DENT.radius) continue;
      const level =
        dent.strength *
        Math.exp(-dent.age * DENT_SETTLE) *
        Math.sin(dent.age * DENT_WOBBLE);
      total += DENT.depth * level * (1 - (distance / DENT.radius) ** 2);
    }
    return THREE.MathUtils.clamp(total, -DENT.depth, DENT.depth);
  }
  let restartQueued = false;
  let touched = false;

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
    const catching = state === "leaving" && car.root.visible;
    state = "driving";
    speed = 0;
    lastSpeed = 0;
    steerShown = 0;
    spinSpeed = 0;
    launched = false;
    restartQueued = false;
    if (catching) {
      climb = Math.min(climb, 0);
    } else {
      carX = 0;
      carZ = area.bottom - SPAWN_ABOVE_EDGE;
      yaw = 0;
      spin = 0;
      bodyY = groundUnder().mean + offScreenHeight(carX, carZ);
      climb = 0;
      pitch = 0.08;
      pitchSpeed = 0;
      roll = 0;
      rollSpeed = (Math.random() - 0.5) * 0.8;
      drivePitch = 0;
      drivePitchSpeed = 0;
      driveRoll = 0;
      driveRollSpeed = 0;
    }
    spawnZ = carZ;
    touched = false;
    runScroll = 0;
    distance = 0;
    reported = { distance: -1, crashed: false };
    car.root.visible = true;
    keys.clear();
    report();
    options.onRunStart();
  }

  function restartIfReady() {
    if (car.root.visible) restartQueued = true;
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
      state = car.root.visible ? "leaving" : "hidden";
      climb = Math.max(climb, 6);
      pitchSpeed += 2;
      restartQueued = false;
      run = null;
      obstacles.clear();
    }
    wake();
  }

  const wheelGround = [0, 0, 0, 0];
  function groundUnder() {
    const sin = Math.sin(yaw);
    const cos = Math.cos(yaw);
    let sum = 0;
    car.wheels.forEach((wheel, n) => {
      const wx = carX + wheel.x * cos + wheel.z * sin;
      const wz = carZ - wheel.x * sin + wheel.z * cos;
      wheelGround[n] =
        PIN_REST +
        swell(wx, wz - scroll, clock.elapsedTime) -
        CAR_SINK -
        dentAt(wx, wz - scroll);
      sum += wheelGround[n];
    });
    return { mean: sum / 4 };
  }

  function controls() {
    let throttle = 0;
    let steer = 0;
    const burnout =
      (keys.has("w") || keys.has("arrowup")) &&
      (keys.has("s") || keys.has("arrowdown"));
    if (keys.has("w") || keys.has("arrowup")) throttle += 1;
    if (keys.has("s") || keys.has("arrowdown")) throttle -= 1;
    if (keys.has("a") || keys.has("arrowleft")) steer -= 1;
    if (keys.has("d") || keys.has("arrowright")) steer += 1;
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
    return { throttle, steer, burnout };
  }

  function drive(dt: number, phase: number) {
    const { throttle, steer, burnout } =
      state === "driving"
        ? controls()
        : { throttle: 0, steer: 0, burnout: false };
    const grounded = bodyY - (groundUnder().mean + ride) < ON_GROUND;

    burning =
      burnout && grounded && (burning || Math.abs(speed) < BURNOUT_BELOW);

    const braking =
      state === "driving" &&
      (burning ||
        burnout ||
        (throttle < 0 && speed > 0.3) ||
        (throttle > 0 && speed < 0));
    car.setBraking(braking ? 1 : 0);

    if (burning) {
      speed -= Math.sign(speed) * Math.min(Math.abs(speed), BRAKE * dt);
    } else if (burnout && state === "driving") {
      speed -=
        Math.sign(speed) *
        Math.min(Math.abs(speed), BRAKE * BRAKE_AGAINST_ENGINE * dt);
    } else if (state === "driving") {
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

    steerShown += (steer - steerShown) * ease(10, dt);
    const angle = (steerShown * MAX_STEER) / (1 + Math.abs(speed) * 0.06);
    const turn = (-speed * Math.tan(angle)) / WHEELBASE;
    yaw += turn * dt;

    const steering = Math.abs(steer) > 0;
    const donutTarget = burning && steering ? -steerShown * DONUT_RATE : 0;
    const donutRate = !burning
      ? DONUT_STOP
      : steering
        ? DONUT_GRIP
        : DONUT_COAST;
    donutSpeed += (donutTarget - donutSpeed) * ease(donutRate, dt);
    if (Math.abs(donutSpeed) < 0.01 && !burning) donutSpeed = 0;
    if (donutSpeed !== 0) {
      const ahead = size.axle.z;
      const pivotX = carX - Math.sin(yaw) * ahead;
      const pivotZ = carZ - Math.cos(yaw) * ahead;
      yaw += donutSpeed * dt;
      carX = pivotX + Math.sin(yaw) * ahead;
      carZ = pivotZ + Math.cos(yaw) * ahead;
    }
    spin += spinSpeed * dt;
    if (state === "driving") spin -= wrapAngle(spin) * ease(8, dt);
    spinSpeed *= Math.exp(-2.5 * dt);

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
    const gap = bodyY - rest;
    const falling = gap > STICK || (climb > 0 && gap > ON_GROUND);
    if (falling) highestGap = Math.max(highestGap, gap);
    if (launched || state === "leaving") {
      climb += LIFT * dt;
    } else if (falling) {
      climb -= GRAVITY * dt;
    } else if (state === "driving" && gap < ON_GROUND) {
      climb = (rest - bodyY) / dt;
    } else {
      climb = spring(bodyY, climb, rest, SPRING, dt);
    }
    bodyY += climb * dt;
    const fallSpeed = -climb;
    if (!launched && state !== "leaving" && bodyY < rest - WHEEL_TRAVEL) {
      bodyY = rest - WHEEL_TRAVEL;
      if (climb < 0) climb = 0;
    }
    const onGround = bodyY - rest < ON_GROUND;

    const landed = highestGap > 0 && bodyY - rest <= STICK;
    if (
      state === "driving" &&
      landed &&
      highestGap > DENT_MIN_DROP &&
      fallSpeed > DENT_MIN_SPEED
    ) {
      dents.push({
        x: carX,
        z: carZ - scroll,
        age: 0,
        strength: Math.min(1, highestGap / FULL_DROP),
      });
    }
    if (landed) highestGap = 0;
    for (const dent of dents) dent.age += dt;
    for (let n = dents.length - 1; n >= 0; n--) {
      if (dents[n].age * DENT_SETTLE > 7) dents.splice(n, 1);
    }

    const [frontLeft, frontRight, backLeft, backRight] = wheelGround;
    const groundPitch = Math.atan2(
      (frontLeft + frontRight - backLeft - backRight) / 2,
      size.axle.z * 2,
    );
    const groundRoll = Math.atan2(
      (frontRight + backRight - frontLeft - backLeft) / 2,
      size.axle.x * 2,
    );
    if (state === "driving" && onGround) {
      pitch += (groundPitch - pitch) * ease(GROUND_FOLLOW, dt);
      roll += (groundRoll - roll) * ease(GROUND_FOLLOW, dt);
      pitchSpeed = 0;
      rollSpeed = 0;
    } else {
      pitchSpeed = spring(pitch, pitchSpeed, 0, TILT_SPRING, dt);
      rollSpeed = spring(roll, rollSpeed, 0, TILT_SPRING, dt);
      pitch += pitchSpeed * dt;
      roll += rollSpeed * dt;
    }
    const drivePitchTarget = onGround
      ? THREE.MathUtils.clamp(accel * 0.002, -0.011, 0.011)
      : 0;
    const driveRollTarget = onGround
      ? THREE.MathUtils.clamp(-turn * speed * 0.003, -0.018, 0.018)
      : 0;
    drivePitchSpeed = spring(
      drivePitch,
      drivePitchSpeed,
      drivePitchTarget,
      TILT_SPRING,
      dt,
    );
    driveRollSpeed = spring(
      driveRoll,
      driveRollSpeed,
      driveRollTarget,
      TILT_SPRING,
      dt,
    );
    drivePitch += drivePitchSpeed * dt;
    driveRoll += driveRollSpeed * dt;

    car.root.position.set(carX, 0, carZ);
    car.root.rotation.y = yaw + spin;
    car.body.position.y = bodyY;
    car.body.rotation.set(pitch + drivePitch, 0, roll + driveRoll);
    car.wheels.forEach((wheel, n) => {
      const hub =
        bodyY -
        size.bodyLift +
        wheel.x * Math.sin(roll) * Math.cos(pitch) -
        wheel.z * Math.sin(pitch);
      wheel.pivot.position.y = THREE.MathUtils.clamp(
        wheelGround[n] + size.wheelRadius,
        hub - WHEEL_TRAVEL,
        hub + WHEEL_TRAVEL,
      );
      const spinning = !wheel.front && burning;
      wheel.spinner.rotation.x -=
        ((spinning ? 30 : speed) * dt) / size.wheelRadius;
      if (wheel.front) wheel.pivot.rotation.y = -steerShown * 0.35;
    });

    const smoking = onGround && state === "driving" && burning;
    if (smoking) {
      smokeDebt += SMOKE_RATE * dt;
      const sin = Math.sin(yaw);
      const cos = Math.cos(yaw);
      const back = 3;
      while (smokeDebt >= 1) {
        smokeDebt -= 1;
        for (const wheel of car.wheels) {
          if (wheel.front) continue;
          smoke.emit(
            carX + wheel.x * cos + wheel.z * sin,
            wheel.pivot.position.y - size.wheelRadius * 0.5,
            carZ - wheel.x * sin + wheel.z * cos,
            sin * back,
            cos * back,
          );
        }
      }
    } else {
      smokeDebt = 0;
    }

    if (onGround && !launched && state !== "leaving") {
      const share = ease(RATE.car, dt);
      const sin = Math.sin(yaw);
      const cos = Math.cos(yaw);
      for (const wheel of car.wheels) {
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
        car.root.visible = false;
        speed = 0;
        if (state === "leaving") state = "hidden";
        if (state === "crashed" && restartQueued) startRun();
      }
    }
  }

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

  let night = options.theme === "dark" ? 1 : 0;
  let nightTarget = night;
  let lightsOn = night === 1;
  const mixColor = (target: THREE.Color, day: string, dark: string) =>
    target.set(day).lerp(scratch.set(dark), night);
  const scratch = new THREE.Color();
  function applyPalette() {
    mixColor(groundColor, DAY.ground, NIGHT.ground);
    fog.color.copy(groundColor);
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
    if (nightTarget === 1 && night > LIGHTS_ON_AT) lightsOn = true;
    if (nightTarget === 0 && night < 1 - LIGHTS_ON_AT) lightsOn = false;
    car.setLights(lightsOn);
    car.setDusk(night);
  }
  applyPalette();

  function setTheme(theme: Theme) {
    nightTarget = theme === "dark" ? 1 : 0;
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
    frameId = requestAnimationFrame(frame);
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
          cancelAnimationFrame(frameId);
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
    const scrollBefore = scroll;
    if (state !== "hidden") drive(dt, phaseBefore);

    car.update(dt);
    car.root.updateMatrixWorld();
    car.headlights.forEach((lamp, n) => lamp.getWorldPosition(smokeHeads[n]));
    car.taillights.forEach((lamp, n) => lamp.getWorldPosition(smokeTails[n]));
    smokeAhead.set(-Math.sin(yaw), 0, -Math.cos(yaw));
    smoke.update(dt, scroll - scrollBefore, {
      night,
      lamps: lightsOn && car.root.visible,
      heads: smokeHeads,
      tails: smokeTails,
      ahead: smokeAhead,
    });

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

    const along = phase / spacing;
    const obstacleShare = ease(RATE.obstacle, dt);
    for (let k = 0; k < slots; k++) {
      const z = slotZ(k, phase);
      const worldRow = scrolledRows + rows - k;
      const worldZ = z - scroll;
      const mask = obstaclesFor(worldRow);
      const rise = Math.min(1, Math.max(0, (k + along) / RISE_ROWS));
      const fall = Math.min(1, Math.max(0, (slots - k - along) / FALL_ROWS));
      const shown = Math.min(1 - (1 - rise) ** 3, 1 - (1 - fall) ** 3);
      const wave = 0.5 + 0.5 * Math.sin(t * 2.4 + worldRow * 0.9);
      for (let i = 0; i < columns; i++) {
        const index = k * columns + i;
        const x = x0 + i * spacing;
        const kind = mask[i];
        if (kind) kinds[index] = kind;
        const shownKind = kinds[index];
        const kindHeight = OBSTACLE_HEIGHT[shownKind];
        let target = kind && kindHeight ? kindHeight : 0;
        if (kind === OBSTACLE.moving) target *= wave;
        raised[index] += (target - raised[index]) * obstacleShare;
        if (!kind && raised[index] < 0.01) kinds[index] = 0;
        const surface =
          PIN_REST +
          swell(x, worldZ, t) -
          depth[index] * 1.05 -
          (dents.length ? dentAt(x, worldZ) : 0) +
          raised[index];
        const height = PIN_HIDDEN + (surface - PIN_HIDDEN) * shown;
        matrix.makeScale(
          1,
          Math.max(0.2, height - BASE_Y) + (1 - shown) * PIN_LENGTH,
          1,
        );
        matrix.setPosition(x, height, z);
        pins.setMatrixAt(index, matrix);
        colour
          .copy(pinLow)
          .lerp(pinHigh, THREE.MathUtils.clamp((height - 0.1) / 1.6, 0, 1));
        if (kindHeight) {
          colour.lerp(
            obstacleColors[shownKind - 1],
            Math.min(1, raised[index] / 0.3),
          );
        }
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
    if (frozen) {
      cancelAnimationFrame(frameId);
      frameId = 0;
    }
  }

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
    smoke.resize(clientHeight * renderer.getPixelRatio(), camera.fov);
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
      car.dispose();
      smoke.dispose();
      renderer.dispose();
    },
  };
}
