import * as THREE from "three";

import { AXLE, BODY_LIFT, WHEEL_RADIUS, buildJeep } from "./jeep";
import { type ObstacleRules, obstacleRow, topSpeed } from "./runner";

// The hero's pin board: a field of pins that swell slowly and dip under the
// pointer. Play drops a jeep on it. The rows then scroll towards the camera
// as the jeep drives, new rows rise at the horizon, and dark pillars come
// up that the jeep has to steer around. React owns the page around it and
// talks to it only through this interface.

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
  // The first seconds ran too slowly. The caller should dispose the board
  // and keep the still image.
  onSlow: () => void;
  // The run's distance changed by a metre, or the jeep crashed.
  onRun: (state: RunState) => void;
}

export interface PinBoard {
  setPlaying: (playing: boolean) => void;
  dispose: () => void;
}

const GROUND = "#e4e5e8";
const PIN_LOW = new THREE.Color("#b9bbc1");
const PIN_HIGH = new THREE.Color("#f6f6f7");
const PILLAR = new THREE.Color("#2e2f34");
const MAX_PIXEL_RATIO = 1.5;
// Below this width the board uses the phone grid and camera.
const PHONE_WIDTH = 700;
// The automatic press starts after this many seconds without input, and
// takes FADE_IN_SECONDS to reach its full depth.
const IDLE_SECONDS = 4;
const FADE_IN_SECONDS = 2;
// How fast pins move towards a press, and pillars towards their height,
// per second. Higher is snappier.
const RATE = { pointer: 14, car: 30, idle: 5, pillar: 6 };
// Pins rise back to about a fifth of a press in one second.
const RECOVERY = 0.25;
const RECOVERY_PLAYING = 0.55;
// The resting height of a pin top, and how far below it a row that is
// rising in at the horizon or sinking out at the front starts or ends.
const PIN_REST = 1.15;
const PIN_HIDDEN = -1.8;
const PILLAR_HEIGHT = 2.4;
// The jeep rides on the pin tops and presses them down only a little,
// enough to leave tracks.
const CAR_SINK = 0.15;
const TRACK_DEPTH = 0.3;
// The car stays inside this part of the screen, in normalised device
// coordinates, so it never drives out of view.
const SCREEN_EDGE = 0.86;
// After a short warm-up, frames are timed for this long. If they average
// slower than SLOW_FRAME, the device is too slow for the board.
const WARM_UP_FRAMES = 30;
const TIMED_FRAMES = 90;
const SLOW_FRAME = 1 / 24;

// Physics. Distances are world units, about a metre each.
const GRAVITY = 55;
const SPRING = { stiffness: 170, damping: 11 };
const TILT_SPRING = { stiffness: 90, damping: 9 };
// The body's floor sits this high above the ground at rest.
const RIDE = WHEEL_RADIUS + BODY_LIFT;
// How far a wheel can hang below, or push up into, its resting place.
const WHEEL_TRAVEL = 0.3;
const DROP_HEIGHT = 9;
const LEAVE_HEIGHT = 22;
// Half the jeep's size, for hitting pillars.
const CAR_HALF = { x: 0.85, z: 1.55 };
// Press W or tap again this long after a crash to start a new run.
const RESTART_DELAY = 0.6;

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
// Where the jeep drives: in the lower part of the board, which the hero's
// copy leaves free while the game is on, with the whole board ahead of it.
const CAR_Z = { desktop: 3, phone: 5 };

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
  const carZ = phone ? CAR_Z.phone : CAR_Z.desktop;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, MAX_PIXEL_RATIO));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(GROUND);
  scene.fog = new THREE.Fog(GROUND, 30, 70);

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

  scene.add(new THREE.HemisphereLight("#ffffff", "#a9abb2", 1.3));
  const sun = new THREE.DirectionalLight("#ffffff", 2.8);
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
  for (let i = 0; i < count; i++) pins.setColorAt(i, PIN_HIGH);
  scene.add(pins);

  const baseGeometry = new THREE.PlaneGeometry(
    columns * spacing + 2,
    slots * spacing + 2,
  );
  const baseMaterial = new THREE.MeshStandardMaterial({
    color: "#9fa1a8",
    roughness: 0.9,
  });
  const base = new THREE.Mesh(baseGeometry, baseMaterial);
  base.rotation.x = -Math.PI / 2;
  base.position.y = -0.3;
  scene.add(base);

  const jeep = buildJeep();
  jeep.root.visible = false;
  scene.add(jeep.root);

  // Per pin, by slot: how far it is pressed down, and how tall its pillar
  // stands. Both move with their row as the board scrolls.
  const depth = new Float32Array(count);
  const pillar = new Float32Array(count);
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
    depth.copyWithin(columns, 0, (slots - 1) * columns);
    pillar.copyWithin(columns, 0, (slots - 1) * columns);
    depth.fill(0, 0, columns);
    pillar.fill(0, 0, columns);
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

  // Pointer, projected onto the plane of the pin tops.
  const ndc = new THREE.Vector2();
  const raycaster = new THREE.Raycaster();
  const topPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -1);
  const hit = new THREE.Vector3();
  let pointer: THREE.Vector3 | null = null;
  let pointerDown = false;

  const onPointerMove = (event: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    ndc.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1,
    );
    raycaster.setFromCamera(ndc, camera);
    pointer = raycaster.ray.intersectPlane(topPlane, hit);
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
    if (state === "crashed") restartIfReady();
  };
  const onPointerUp = () => {
    pointerDown = false;
  };
  host.addEventListener("pointermove", onPointerMove);
  host.addEventListener("pointerleave", onPointerLeave);
  host.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("pointerup", onPointerUp);

  // Driving. The keys are listened to only while the game is on, so they
  // never take over page scrolling.
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
    if (state === "crashed" && (key === "w" || key === "arrowup")) {
      restartIfReady();
    }
  };
  const onKeyUp = (event: KeyboardEvent) => {
    keys.delete(event.key.toLowerCase());
  };

  // The jeep. "hidden" off the board, "driving" during a run (including
  // the drop in), "crashed" after hitting a pillar, "leaving" after Stop.
  let state: "hidden" | "driving" | "crashed" | "leaving" = "hidden";
  let carX = 0;
  let lateral = 0;
  let speed = 0;
  let bodyY = 0;
  let climb = 0;
  let pitch = 0;
  let pitchSpeed = 0;
  let roll = 0;
  let rollSpeed = 0;
  let spin = 0;
  let spinSpeed = 0;
  let steerShown = 0;
  let crashedAt = 0;

  // The run.
  let run: ObstacleRules | null = null;
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

  // How far left and right the jeep can go and stay on screen.
  const projected = new THREE.Vector3();
  function carLimit(): number {
    let x = 0;
    while (x < -x0 - 1) {
      projected.set(x + CAR_HALF.x, 1, carZ).project(camera);
      if (projected.x > SCREEN_EDGE) break;
      x += 0.05;
    }
    return x;
  }
  let limit = carLimit();

  // A new run: the road ahead is clear for a while, then pillars come.
  function startRun() {
    limit = carLimit();
    const first = Math.max(0, Math.ceil((-limit + 0.4 - x0) / spacing));
    const last = Math.min(
      columns - 1,
      Math.floor((limit - 0.4 - x0) / spacing),
    );
    run = {
      seed: Math.floor(Math.random() * 2 ** 31),
      columns,
      playable: [first, last],
      safeUntil: scrolledRows + rows + 8,
      minGap: Math.ceil((CAR_HALF.x * 2 + 1.2) / spacing),
    };
    obstacles.clear();
    distance = 0;
    report();
  }

  function restartIfReady() {
    if (clock.elapsedTime - crashedAt < RESTART_DELAY) return;
    state = "driving";
    startRun();
  }

  function setPlaying(next: boolean) {
    if (next === (state === "driving" || state === "crashed")) return;
    keys.clear();
    if (next) {
      window.addEventListener("keydown", onKeyDown);
      window.addEventListener("keyup", onKeyUp);
      state = "driving";
      carX = 0;
      lateral = 0;
      speed = 0;
      bodyY = groundUnder(0, 0).mean + RIDE + DROP_HEIGHT;
      climb = -6;
      pitch = 0.12;
      pitchSpeed = 0;
      roll = 0;
      rollSpeed = (Math.random() - 0.5) * 1.5;
      spin = 0;
      spinSpeed = 0;
      jeep.root.visible = true;
      startRun();
    } else {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      // Launch up and away, nose first.
      state = "leaving";
      climb = Math.max(climb, 9);
      pitchSpeed += 2.5;
      run = null;
      obstacles.clear();
    }
    wake();
  }

  // The ground under each wheel, from the swell and the pins the jeep
  // presses down. Returns the four heights and their mean.
  const wheelGround = [0, 0, 0, 0];
  function groundUnder(x: number, yaw: number) {
    const sin = Math.sin(yaw);
    const cos = Math.cos(yaw);
    let sum = 0;
    jeep.wheels.forEach((wheel, n) => {
      const wx = x + wheel.x * cos + wheel.z * sin;
      const wz = carZ - wheel.x * sin + wheel.z * cos;
      wheelGround[n] =
        PIN_REST + swell(wx, wz - scroll, clock.elapsedTime) - CAR_SINK;
      sum += wheelGround[n];
    });
    return { mean: sum / 4 };
  }

  // Steering, speed and the sprung body, once a frame.
  let lastSpeed = 0;
  function drive(dt: number, phase: number) {
    let throttle = 0;
    let steer = 0;
    if (state === "driving") {
      if (keys.has("w") || keys.has("arrowup")) throttle = 1;
      if (keys.has("s") || keys.has("arrowdown")) throttle = -1;
      if (keys.has("a") || keys.has("arrowleft")) steer -= 1;
      if (keys.has("d") || keys.has("arrowright")) steer += 1;
      // Holding on the board drives towards the finger.
      if (pointerDown && pointer) {
        throttle = 1;
        steer = THREE.MathUtils.clamp((pointer.x - carX) / 1.5, -1, 1);
      }
    }

    if (state === "driving") {
      if (throttle > 0) {
        speed += (topSpeed(distance) - speed) * ease(0.9, dt);
      } else if (throttle < 0) {
        speed = Math.max(0, speed - 22 * dt);
      } else {
        speed = Math.max(0, speed - 3 * dt);
      }
    } else {
      speed *= Math.exp(-(state === "crashed" ? 6 : 3) * dt);
    }
    const accel = (speed - lastSpeed) / Math.max(dt, 1e-3);
    lastSpeed = speed;

    const grip = 4 + speed * 0.5;
    lateral += (steer * grip - lateral) * ease(7, dt);
    carX += lateral * dt;
    if (Math.abs(carX) > limit) {
      carX = Math.sign(carX) * limit;
      lateral = 0;
    }
    steerShown += (steer - steerShown) * ease(10, dt);

    // Heading follows the sideways movement, plus any crash spin.
    spin += spinSpeed * dt;
    spinSpeed *= Math.exp(-2.5 * dt);
    const yaw = -Math.atan2(lateral, Math.max(speed, 8)) * 0.6 + spin;

    const { mean } = groundUnder(carX, yaw);
    const rest = mean + RIDE;
    if (state === "leaving") {
      climb += 40 * dt;
    } else if (bodyY - rest > WHEEL_TRAVEL || climb > 0) {
      climb -= GRAVITY * dt;
    } else {
      climb = spring(bodyY, climb, rest, SPRING, dt);
    }
    bodyY += climb * dt;
    // Full compression: the suspension bottoms out and kicks the body back
    // up a little, as after a landing.
    if (state !== "leaving" && bodyY < rest - WHEEL_TRAVEL) {
      bodyY = rest - WHEEL_TRAVEL;
      if (climb < 0) climb = -climb * 0.22;
    }
    const onGround = bodyY - rest < WHEEL_TRAVEL;

    // The body tilts with the ground under it, squats when speeding up,
    // dips when braking and leans out of turns.
    const [frontLeft, frontRight, backLeft, backRight] = wheelGround;
    const groundPitch = Math.atan2(
      (frontLeft + frontRight - backLeft - backRight) / 2,
      AXLE.z * 2,
    );
    const groundRoll = Math.atan2(
      (frontRight + backRight - frontLeft - backLeft) / 2,
      AXLE.x * 2,
    );
    const pitchTarget = onGround
      ? groundPitch + THREE.MathUtils.clamp(accel * 0.01, -0.12, 0.12)
      : 0;
    const rollTarget = onGround ? groundRoll + lateral * 0.025 : 0;
    pitchSpeed = spring(pitch, pitchSpeed, pitchTarget, TILT_SPRING, dt);
    rollSpeed = spring(roll, rollSpeed, rollTarget, TILT_SPRING, dt);
    pitch += pitchSpeed * dt;
    roll += rollSpeed * dt;

    jeep.root.position.set(carX, 0, carZ);
    jeep.root.rotation.y = yaw;
    jeep.body.position.y = bodyY;
    jeep.body.rotation.set(pitch, 0, roll);
    jeep.wheels.forEach((wheel, n) => {
      const hub = bodyY - BODY_LIFT;
      wheel.pivot.position.y = THREE.MathUtils.clamp(
        wheelGround[n] + WHEEL_RADIUS,
        hub - WHEEL_TRAVEL,
        hub + WHEEL_TRAVEL,
      );
      wheel.spinner.rotation.x -= (speed * dt) / WHEEL_RADIUS;
      if (wheel.front) wheel.pivot.rotation.y = -steerShown * 0.4;
    });

    // Wheels on the ground press the pins under them.
    if (onGround && state !== "leaving") {
      const share = ease(RATE.car, dt);
      const sin = Math.sin(yaw);
      const cos = Math.cos(yaw);
      for (const wheel of jeep.wheels) {
        press(
          carX + wheel.x * cos + wheel.z * sin,
          carZ - wheel.x * sin + wheel.z * cos,
          0.7,
          TRACK_DEPTH,
          share,
          phase,
        );
      }
    }

    if (state === "driving") distance += speed * dt;
    if (state === "leaving" && bodyY > LEAVE_HEIGHT) {
      state = "hidden";
      jeep.root.visible = false;
      speed = 0;
    }
  }

  // Does the jeep touch a pillar that has risen?
  function hitsPillar(phase: number): boolean {
    const reachZ = CAR_HALF.z + spacing * 0.4;
    const reachX = CAR_HALF.x + spacing * 0.4;
    for (let k = 0; k < slots; k++) {
      if (Math.abs(slotZ(k, phase) - carZ) > reachZ) continue;
      const i0 = Math.max(0, Math.floor((carX - reachX - x0) / spacing));
      const i1 = Math.min(
        columns - 1,
        Math.ceil((carX + reachX - x0) / spacing),
      );
      for (let i = i0; i <= i1; i++) {
        if (Math.abs(x0 + i * spacing - carX) > reachX) continue;
        if (pillar[k * columns + i] > PILLAR_HEIGHT * 0.4) return true;
      }
    }
    return false;
  }

  function crash() {
    state = "crashed";
    crashedAt = clock.elapsedTime;
    speed *= 0.3;
    climb = 7;
    const side = Math.random() < 0.5 ? -1 : 1;
    rollSpeed += 6 * side;
    pitchSpeed += 2;
    spinSpeed += 3 * side;
    report();
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
          options.onSlow();
          return;
        }
      }
    }
    const t = clock.elapsedTime;

    // Scroll the board under the jeep, a row at a time.
    scroll += speed * dt;
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

    if (state !== "hidden") {
      drive(dt, phase);
      if (state === "driving" && hitsPillar(phase)) crash();
      if (state === "driving" || state === "crashed") report();
    }
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

    // The row at the horizon rises in as it scrolls into place, and the
    // row at the front sinks away as it leaves.
    const arriving = THREE.MathUtils.smoothstep(phase / spacing, 0, 1);
    const pillarShare = ease(RATE.pillar, dt);
    for (let k = 0; k < slots; k++) {
      const z = slotZ(k, phase);
      const worldZ = z - scroll;
      const mask = obstaclesFor(scrolledRows + rows - k);
      const shown = k === 0 ? arriving : k === slots - 1 ? 1 - arriving : 1;
      for (let i = 0; i < columns; i++) {
        const index = k * columns + i;
        const x = x0 + i * spacing;
        const target = mask[i] ? PILLAR_HEIGHT : 0;
        pillar[index] += (target - pillar[index]) * pillarShare;
        const surface =
          PIN_REST + swell(x, worldZ, t) - depth[index] * 1.05 + pillar[index];
        const height = PIN_HIDDEN + (surface - PIN_HIDDEN) * shown;
        matrix.makeScale(1, height + 1.5, 1);
        matrix.setPosition(x, height, z);
        pins.setMatrixAt(index, matrix);
        colour
          .copy(PIN_LOW)
          .lerp(PIN_HIGH, THREE.MathUtils.clamp((height - 0.1) / 1.6, 0, 1))
          .lerp(PILLAR, pillar[index] / PILLAR_HEIGHT);
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
    frameId = requestAnimationFrame(frame);
  }

  // Render only while the hero is on screen and the tab is visible.
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
    limit = carLimit();
  });
  resize.observe(canvas);

  wake();

  return {
    setPlaying,
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
      jeep.dispose();
      renderer.dispose();
    },
  };
}
