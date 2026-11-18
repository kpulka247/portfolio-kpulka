import * as THREE from "three";

const DAY_INK = new THREE.Color("#35322e");
const NIGHT_INK = new THREE.Color("#e9e6e1");
const START_ALPHA = 0.14;
const DAY_ALPHA = 0.32;
const NIGHT_ALPHA = 0.24;
const START_SHARE = 0.3;
const RUSH = 0.6;
const CALM = { from: 4, to: 10 };
const BASE_LENGTH = 0.3;
const LENGTH_PER_SPEED = 0.11;
const LOW = 2;
const HIGH = 3.6;
const SPREAD = 0.035;
const BORN_WITHIN = 0.45;
const NEAR_FADE = { from: 4, to: 10 };
const FAR_FADE = 8;

export interface WindBounds {
  count: number;
  // Half the width of the air, in metres.
  halfWidth: number;
  // Where streaks are born and where they are retired, along z.
  far: number;
  near: number;
}

export interface Wind {
  // Moves the air by how far the road scrolled this frame. `pace` is the
  // run's progress, from 0 at the start to 1 at full speed.
  update: (dt: number, scrolled: number, pace: number, night: number) => void;
  dispose: () => void;
}

export function createWind(
  scene: THREE.Scene,
  camera: THREE.Camera,
  bounds: WindBounds,
): Wind {
  const { count, halfWidth, far, near } = bounds;
  const position = new Float32Array(count * 6);
  const colour = new Float32Array(count * 8);
  const x = new Float32Array(count);
  const y = new Float32Array(count);
  const z = new Float32Array(count);
  const gust = new Float32Array(count);

  function place(i: number, anywhere: boolean) {
    z[i] = anywhere
      ? far + Math.random() * (near - far)
      : far + Math.random() * 2;
    const born = (Math.random() * 2 - 1) * halfWidth * BORN_WITHIN;
    x[i] = born * Math.exp(SPREAD * (z[i] - far));
    y[i] = LOW + Math.random() * (HIGH - LOW);
    gust[i] = 0.85 + Math.random() * 0.3;
  }
  for (let i = 0; i < count; i++) place(i, true);

  const geometry = new THREE.BufferGeometry();
  const positionAttr = new THREE.BufferAttribute(position, 3);
  const colourAttr = new THREE.BufferAttribute(colour, 4);
  positionAttr.setUsage(THREE.DynamicDrawUsage);
  colourAttr.setUsage(THREE.DynamicDrawUsage);
  geometry.setAttribute("position", positionAttr);
  geometry.setAttribute("color", colourAttr);
  const material = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    depthWrite: false,
  });
  const lines = new THREE.LineSegments(geometry, material);
  lines.frustumCulled = false;
  scene.add(lines);

  const ink = new THREE.Color();
  let flow = 0;

  return {
    update(dt, scrolled, pace, night) {
      const speed = dt > 0 ? scrolled / dt : 0;
      flow += (speed - flow) * (1 - Math.exp(-6 * dt));
      const shown = THREE.MathUtils.smoothstep(flow, CALM.from, CALM.to);
      lines.visible = shown > 0;
      if (!lines.visible) return;

      ink.copy(DAY_INK).lerp(NIGHT_INK, night);
      const full = THREE.MathUtils.lerp(DAY_ALPHA, NIGHT_ALPHA, night);
      const strength = shown * THREE.MathUtils.lerp(START_ALPHA, full, pace);
      const active = Math.ceil(
        count * THREE.MathUtils.lerp(START_SHARE, 1, pace),
      );
      const rush = 1 + RUSH * pace;
      const length = (BASE_LENGTH + flow * LENGTH_PER_SPEED) * rush;
      const cameraZ = camera.position.z;
      const cameraY = camera.position.y;

      for (let i = 0; i < count; i++) {
        const along = scrolled * gust[i] * rush;
        z[i] += along;
        x[i] += along * SPREAD * x[i];
        if (z[i] > near || Math.abs(x[i]) > halfWidth) place(i, false);

        const head = i * 6;
        const tail = length * gust[i];
        const side = SPREAD * x[i];
        const norm = 1 / Math.hypot(1, side);
        position[head] = x[i];
        position[head + 1] = y[i];
        position[head + 2] = z[i];
        position[head + 3] = x[i] - tail * side * norm;
        position[head + 4] = y[i];
        position[head + 5] = z[i] - tail * norm;

        const toCamera = Math.hypot(cameraY - y[i], cameraZ - z[i]);
        const alpha =
          (i < active ? strength : 0) *
          THREE.MathUtils.smoothstep(toCamera, NEAR_FADE.from, NEAR_FADE.to) *
          THREE.MathUtils.clamp((z[i] - tail - far) / FAR_FADE, 0, 1);
        const c = i * 8;
        colour[c] = colour[c + 4] = ink.r;
        colour[c + 1] = colour[c + 5] = ink.g;
        colour[c + 2] = colour[c + 6] = ink.b;
        colour[c + 3] = alpha;
        colour[c + 7] = 0;
      }
      positionAttr.needsUpdate = true;
      colourAttr.needsUpdate = true;
    },

    dispose() {
      scene.remove(lines);
      geometry.dispose();
      material.dispose();
    },
  };
}
