import * as THREE from "three";

// Tyre smoke for burnouts, donuts and drifts: a pool of soft puffs drawn
// as one point cloud, so it costs one draw call. Each puff is lit on the
// CPU from the scene's light and, at night, from the SUV's own lamps, so
// smoke behind the car glows red and smoke in the beams glows white.

const POOL = 240;
const LIFE = 1.7;

export interface SmokeLights {
  // 0 by day, 1 at night: how dark the ambient light is.
  night: number;
  // Whether the lamps are on.
  lamps: boolean;
  tails: THREE.Vector3[];
  heads: THREE.Vector3[];
  // The way the headlights point, normalised.
  ahead: THREE.Vector3;
}

const DAY_SMOKE = new THREE.Color("#cbcac8");
const NIGHT_SMOKE = new THREE.Color("#55524f");
const TAIL_GLOW = new THREE.Color("#ff3b30");
const HEAD_GLOW = new THREE.Color("#f4f4f2");
// The cosine of the headlights' half angle.
const BEAM = Math.cos(0.42);

const VERTEX = /* glsl */ `
  attribute float size;
  attribute float alpha;
  attribute vec3 tint;
  uniform float scale;
  varying float vAlpha;
  varying vec3 vTint;
  void main() {
    vec4 view = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * view;
    gl_PointSize = size * scale / -view.z;
    vAlpha = alpha;
    vTint = tint;
  }
`;

const FRAGMENT = /* glsl */ `
  varying float vAlpha;
  varying vec3 vTint;
  void main() {
    vec2 p = gl_PointCoord - 0.5;
    float r = length(p) * 2.0;
    if (r > 1.0) discard;
    // A soft puff, densest in the middle.
    float a = vAlpha * pow(1.0 - r, 1.6);
    gl_FragColor = vec4(vTint, a);
  }
`;

export interface Smoke {
  // Starts a puff at a point, drifting at (vx, vz) metres a second.
  emit: (x: number, y: number, z: number, vx: number, vz: number) => void;
  // Ages the puffs, moves them with the board, and relights them.
  update: (dt: number, scrolled: number, lights: SmokeLights) => void;
  // The canvas height in device pixels, for sizing the puffs.
  resize: (heightPx: number, fov: number) => void;
  dispose: () => void;
}

export function createSmoke(scene: THREE.Scene): Smoke {
  const position = new Float32Array(POOL * 3);
  const size = new Float32Array(POOL);
  const alpha = new Float32Array(POOL);
  const tint = new Float32Array(POOL * 3);
  const velocity = new Float32Array(POOL * 3);
  const age = new Float32Array(POOL).fill(LIFE);
  let next = 0;

  const geometry = new THREE.BufferGeometry();
  const positionAttr = new THREE.BufferAttribute(position, 3);
  const sizeAttr = new THREE.BufferAttribute(size, 1);
  const alphaAttr = new THREE.BufferAttribute(alpha, 1);
  const tintAttr = new THREE.BufferAttribute(tint, 3);
  for (const attr of [positionAttr, sizeAttr, alphaAttr, tintAttr]) {
    attr.setUsage(THREE.DynamicDrawUsage);
  }
  geometry.setAttribute("position", positionAttr);
  geometry.setAttribute("size", sizeAttr);
  geometry.setAttribute("alpha", alphaAttr);
  geometry.setAttribute("tint", tintAttr);

  const material = new THREE.ShaderMaterial({
    uniforms: { scale: { value: 400 } },
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    transparent: true,
    depthWrite: false,
  });
  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  scene.add(points);

  const colour = new THREE.Color();
  const offset = new THREE.Vector3();
  const puff = new THREE.Vector3();

  return {
    emit(x, y, z, vx, vz) {
      const i = next;
      next = (next + 1) % POOL;
      age[i] = 0;
      position.set([x, y, z], i * 3);
      velocity.set(
        [
          vx + (Math.random() - 0.5) * 1.2,
          0.6 + Math.random() * 0.6,
          vz + (Math.random() - 0.5) * 1.2,
        ],
        i * 3,
      );
    },

    update(dt, scrolled, lights) {
      for (let i = 0; i < POOL; i++) {
        if (age[i] >= LIFE) {
          alpha[i] = 0;
          continue;
        }
        age[i] += dt;
        const life = Math.min(1, age[i] / LIFE);
        const j = i * 3;
        // Slows down, rises a little, and rides the scrolling board.
        const drag = Math.exp(-1.8 * dt);
        velocity[j] *= drag;
        velocity[j + 2] *= drag;
        velocity[j + 1] *= Math.exp(-0.8 * dt);
        position[j] += velocity[j] * dt;
        position[j + 1] += velocity[j + 1] * dt;
        position[j + 2] += velocity[j + 2] * dt + scrolled;
        // Grows as it spreads, fades in fast and out slowly.
        size[i] = 0.6 + life * 2.6;
        alpha[i] =
          Math.min(1, age[i] / 0.12) *
          (1 - life) ** 1.4 *
          (0.55 - 0.15 * lights.night);

        colour.copy(DAY_SMOKE).lerp(NIGHT_SMOKE, lights.night);
        if (lights.lamps) {
          puff.set(position[j], position[j + 1], position[j + 2]);
          for (const tail of lights.tails) {
            const d2 = puff.distanceToSquared(tail);
            colour.r += (TAIL_GLOW.r * 0.9) / (1 + d2 * 1.6);
            colour.g += (TAIL_GLOW.g * 0.9) / (1 + d2 * 1.6);
            colour.b += (TAIL_GLOW.b * 0.9) / (1 + d2 * 1.6);
          }
          for (const head of lights.heads) {
            offset.subVectors(puff, head);
            const distance = offset.length();
            const along = offset.dot(lights.ahead) / Math.max(distance, 1e-3);
            if (along > BEAM) {
              const edge = (along - BEAM) / (1 - BEAM);
              const glow = (edge * 0.8) / (1 + distance * distance * 0.04);
              colour.r += HEAD_GLOW.r * glow;
              colour.g += HEAD_GLOW.g * glow;
              colour.b += HEAD_GLOW.b * glow;
            }
          }
        }
        tint[j] = Math.min(1, colour.r);
        tint[j + 1] = Math.min(1, colour.g);
        tint[j + 2] = Math.min(1, colour.b);
      }
      positionAttr.needsUpdate = true;
      sizeAttr.needsUpdate = true;
      alphaAttr.needsUpdate = true;
      tintAttr.needsUpdate = true;
    },

    resize(heightPx, fov) {
      material.uniforms.scale.value =
        heightPx / (2 * Math.tan(THREE.MathUtils.degToRad(fov) / 2));
    },

    dispose() {
      scene.remove(points);
      geometry.dispose();
      material.dispose();
    },
  };
}
