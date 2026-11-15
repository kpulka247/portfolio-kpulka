import * as THREE from "three";

// The hero's pin board: a field of pins that swell slowly, dip under the
// pointer, and carry a toy car when the visitor presses Play. React owns
// the page around it and talks to it only through this interface.

export interface PinBoardOptions {
  // The first frame is on screen, so the still image behind can go.
  onReady: () => void;
  // The car's speed from 0 to 1, while the game is on.
  onSpeed: (speed: number) => void;
  // The visitor pressed Escape.
  onStop: () => void;
  // The first seconds ran too slowly. The caller should dispose the board
  // and keep the still image.
  onSlow: () => void;
}

export interface PinBoard {
  setPlaying: (playing: boolean) => void;
  dispose: () => void;
}

const GROUND = "#e4e5e8";
const PIN_LOW = new THREE.Color("#b9bbc1");
const PIN_HIGH = new THREE.Color("#f6f6f7");
const MAX_PIXEL_RATIO = 1.5;
// Below this width the board uses the phone grid and camera.
const PHONE_WIDTH = 700;
// The automatic press starts after this many seconds without input.
const IDLE_SECONDS = 4;
// Pins rise back to about a fifth of a press in one second.
const RECOVERY = 0.25;
const RECOVERY_PLAYING = 0.55;
const CAR_DROP = 10;
// The car stays inside this part of the screen, in normalised device
// coordinates, so it never drives out of view.
const SCREEN_EDGE = 0.9;
// After a short warm-up, frames are timed for this long. If they average
// slower than SLOW_FRAME, the device is too slow for the board.
const WARM_UP_FRAMES = 30;
const TIMED_FRAMES = 90;
const SLOW_FRAME = 1 / 24;
const CAR_TOP_SPEED = 13;

interface Grid {
  columns: number;
  rows: number;
  spacing: number;
}

// About 4,100 pins on a desktop and 1,700 on a phone.
const DESKTOP: Grid = { columns: 90, rows: 46, spacing: 0.62 };
const PHONE: Grid = { columns: 34, rows: 50, spacing: 0.8 };

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

// The four wheels and the middle of the car, relative to its centre.
const CONTACTS: [number, number, number, number][] = [
  [-0.8, 0.95, 0.75, 1.15],
  [0.8, 0.95, 0.75, 1.15],
  [-0.8, -0.95, 0.75, 1.15],
  [0.8, -0.95, 0.75, 1.15],
  [0, 0, 1.3, 0.9],
];

export function mount(
  canvas: HTMLCanvasElement,
  host: HTMLElement,
  options: PinBoardOptions,
): PinBoard {
  const phone = host.clientWidth < PHONE_WIDTH;
  const grid = phone ? PHONE : DESKTOP;
  const { columns, rows, spacing } = grid;
  const count = columns * rows;
  const x0 = (-(columns - 1) * spacing) / 2;
  const z0 = (-(rows - 1) * spacing) / 2;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, MAX_PIXEL_RATIO));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(GROUND);
  scene.fog = new THREE.Fog(GROUND, 30, 70);

  const camera = new THREE.PerspectiveCamera(phone ? 50 : 34, 1, 0.1, 200);
  // The phone camera looks down more steeply, so the board fills the tall
  // screen above the copy.
  camera.position.set(0, phone ? 30 : 15, phone ? 20 : 26);
  camera.lookAt(0, 0, phone ? -1 : -6);

  scene.add(new THREE.HemisphereLight("#ffffff", "#a9abb2", 1.3));
  const sun = new THREE.DirectionalLight("#ffffff", 2.8);
  sun.position.set(-26, 11, -4);
  sun.castShadow = true;
  sun.shadow.mapSize.setScalar(phone ? 1024 : 2048);
  Object.assign(sun.shadow.camera, {
    left: -35,
    right: 35,
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
    rows * spacing + 2,
  );
  const baseMaterial = new THREE.MeshStandardMaterial({
    color: "#9fa1a8",
    roughness: 0.9,
  });
  const base = new THREE.Mesh(baseGeometry, baseMaterial);
  base.rotation.x = -Math.PI / 2;
  base.position.y = -0.3;
  scene.add(base);

  const car = buildCar();
  car.group.visible = false;
  scene.add(car.group);

  // How far each pin is pressed down, from 0 to about 1.6.
  const depth = new Float32Array(count);
  const matrix = new THREE.Matrix4();
  const colour = new THREE.Color();

  function press(x: number, z: number, radius: number, amount: number) {
    const i0 = Math.max(0, Math.floor((x - radius - x0) / spacing));
    const i1 = Math.min(columns - 1, Math.ceil((x + radius - x0) / spacing));
    const k0 = Math.max(0, Math.floor((z - radius - z0) / spacing));
    const k1 = Math.min(rows - 1, Math.ceil((z + radius - z0) / spacing));
    for (let k = k0; k <= k1; k++) {
      for (let i = i0; i <= i1; i++) {
        const distance = Math.hypot(x0 + i * spacing - x, z0 + k * spacing - z);
        if (distance >= radius) continue;
        const value = amount * (1 - (distance / radius) ** 2);
        const index = k * columns + i;
        if (value > depth[index]) depth[index] = value;
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
  };
  const onKeyUp = (event: KeyboardEvent) => {
    keys.delete(event.key.toLowerCase());
  };

  let playing = false;
  let heading = 0;
  let speed = 0;
  let carX = 0;
  let carZ = 0;
  let carHeight = CAR_DROP;

  function setPlaying(next: boolean) {
    if (next === playing) return;
    playing = next;
    keys.clear();
    if (playing) {
      window.addEventListener("keydown", onKeyDown);
      window.addEventListener("keyup", onKeyUp);
      // Above the name, where the big letters do not hide the car.
      carX = 0;
      carZ = -4;
      heading = Math.PI;
      speed = 0;
      carHeight = CAR_DROP;
      car.group.visible = true;
    } else {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    }
    wake();
  }

  // On the board and in view.
  const projected = new THREE.Vector3();
  function fits(x: number, z: number): boolean {
    if (x < x0 + 1 || x > -x0 - 1 || z < z0 + 1 || z > -z0 - 1) return false;
    projected.set(x, 1, z).project(camera);
    return (
      Math.abs(projected.x) < SCREEN_EDGE && Math.abs(projected.y) < SCREEN_EDGE
    );
  }

  function drive(dt: number) {
    let throttle = 0;
    let steer = 0;
    if (keys.has("w") || keys.has("arrowup")) throttle = 1;
    if (keys.has("s") || keys.has("arrowdown")) throttle = -1;
    if (keys.has("a") || keys.has("arrowleft")) steer = 1;
    if (keys.has("d") || keys.has("arrowright")) steer = -1;

    // Holding on the board drives towards the finger.
    if (pointerDown && pointer) {
      const wanted = Math.atan2(pointer.x - carX, pointer.z - carZ);
      const turn = wanted - heading;
      steer = THREE.MathUtils.clamp(
        Math.atan2(Math.sin(turn), Math.cos(turn)) * 2,
        -1,
        1,
      );
      throttle = Math.hypot(pointer.x - carX, pointer.z - carZ) > 1.5 ? 1 : 0;
    }

    speed +=
      (throttle * CAR_TOP_SPEED - speed) * dt * (throttle !== 0 ? 1.5 : 2.4);
    heading += steer * dt * 2.6 * THREE.MathUtils.clamp(speed / 7, -1, 1);
    const nextX = carX + Math.sin(heading) * speed * dt;
    const nextZ = carZ + Math.cos(heading) * speed * dt;
    if (fits(nextX, nextZ)) {
      carX = nextX;
      carZ = nextZ;
    } else {
      // Bounce off the edge and lose most of the speed.
      speed *= -0.3;
    }
    carHeight = Math.max(0, carHeight - dt * 28);

    if (carHeight < 0.1) {
      const sin = Math.sin(heading);
      const cos = Math.cos(heading);
      for (const [dx, dz, radius, amount] of CONTACTS) {
        press(
          carX + dx * cos + dz * sin,
          carZ - dx * sin + dz * cos,
          radius,
          amount,
        );
      }
    }
    options.onSpeed(Math.min(1, Math.abs(speed) / CAR_TOP_SPEED));
  }

  const clock = new THREE.Clock(false);
  let lastInput = -Infinity;
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

    const recovery = (playing ? RECOVERY_PLAYING : RECOVERY) ** dt;
    for (let i = 0; i < count; i++) depth[i] *= recovery;

    if (playing) {
      drive(dt);
    } else {
      if (pointer) {
        press(
          pointer.x,
          pointer.z,
          pointerDown ? 4.2 : 3,
          pointerDown ? 1.6 : 1,
        );
        lastInput = t;
      } else if (t - lastInput > IDLE_SECONDS) {
        press(
          Math.sin(t * 0.23) * x0 * 0.55,
          Math.cos(t * 0.31) * z0 * 0.45 - 3,
          3.4,
          1.25,
        );
      }
      carHeight = Math.min(12, carHeight + dt * 20);
      if (carHeight >= 12) car.group.visible = false;
    }

    car.group.position.set(
      carX,
      1 + carHeight - (carHeight < 0.1 ? 1.15 : 0),
      carZ,
    );
    car.group.rotation.y = heading;
    for (const wheel of car.wheels) wheel.rotation.x += (speed * dt) / 0.34;

    for (let k = 0; k < rows; k++) {
      for (let i = 0; i < columns; i++) {
        const index = k * columns + i;
        const x = x0 + i * spacing;
        const z = z0 + k * spacing;
        const swell =
          Math.sin(x * 0.16 + t * 0.5) * 0.42 +
          Math.sin(z * 0.21 - t * 0.4) * 0.32 +
          Math.sin((x + z) * 0.08 + t * 0.25) * 0.36;
        const height = 1.15 + swell - depth[index] * 1.05;
        matrix.makeScale(1, height + 1.5, 1);
        matrix.setPosition(x, height, z);
        pins.setMatrixAt(index, matrix);
        colour
          .copy(PIN_LOW)
          .lerp(PIN_HIGH, THREE.MathUtils.clamp((height - 0.1) / 1.6, 0, 1));
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
  });
  resize.observe(canvas);

  wake();

  return {
    setPlaying,
    dispose() {
      setPlaying(false);
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
      renderer.dispose();
    },
  };
}

function buildCar() {
  const group = new THREE.Group();
  const geometries = [
    new THREE.BoxGeometry(1.5, 0.45, 2.8),
    new THREE.BoxGeometry(1.2, 0.45, 1.2),
    new THREE.BoxGeometry(0.28, 0.02, 2.82),
    new THREE.CylinderGeometry(0.34, 0.34, 0.3, 18),
  ];
  const [chassisShape, cabinShape, stripeShape, wheelShape] = geometries;
  const materials = [
    new THREE.MeshStandardMaterial({
      color: "#1b1c1f",
      roughness: 0.35,
      metalness: 0.3,
    }),
    new THREE.MeshStandardMaterial({
      color: "#9aa0a8",
      roughness: 0.15,
      metalness: 0.6,
    }),
    new THREE.MeshStandardMaterial({ color: "#f4f4f5" }),
    new THREE.MeshStandardMaterial({ color: "#2b2c30", roughness: 0.9 }),
  ];
  const [paint, glass, stripePaint, tyre] = materials;

  const chassis = new THREE.Mesh(chassisShape, paint);
  chassis.position.y = 0.5;
  const cabin = new THREE.Mesh(cabinShape, glass);
  cabin.position.set(0, 0.95, -0.2);
  const stripe = new THREE.Mesh(stripeShape, stripePaint);
  stripe.position.y = 0.735;
  group.add(chassis, cabin, stripe);

  const wheels = [
    [-0.8, 0.95],
    [0.8, 0.95],
    [-0.8, -0.95],
    [0.8, -0.95],
  ].map(([x, z]) => {
    const wheel = new THREE.Mesh(wheelShape, tyre);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, 0.34, z);
    group.add(wheel);
    return wheel;
  });
  group.traverse((object) => {
    if (object instanceof THREE.Mesh) object.castShadow = true;
  });

  return {
    group,
    wheels,
    dispose() {
      for (const geometry of geometries) geometry.dispose();
      for (const material of materials) material.dispose();
    },
  };
}
