import * as THREE from "three";

import { HEADLIGHT, TAILLIGHT } from "./car";

const POOL = 360;
const LIFE = 3.4;

export interface SmokeLights {
  // 0 by day, 1 at night: how dark the ambient light is.
  night: number;
  // The car's lamps. A puff takes a lamp's colour only while that lamp
  // shines and only inside its beam, so the smoke follows the lamps as
  // they come on, go off and brighten for braking.
  heads: THREE.SpotLight[];
  tails: THREE.SpotLight[];
}

const DAY_SMOKE = new THREE.Color("#d8d3cc");
const NIGHT_SMOKE = new THREE.Color("#a39e98");
// How strongly each kind of lamp lights a puff at its usual intensity,
// and how fast that fades with distance.
const HEAD = { gain: 0.8 / HEADLIGHT.intensity, falloff: 0.04 };
const TAIL = { gain: 0.7 / TAILLIGHT.intensity, falloff: 1.6 };

interface Beam {
  at: THREE.Vector3;
  axis: THREE.Vector3;
  cos: number;
  colour: THREE.Color;
  falloff: number;
}

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
  const beams: Beam[] = [];
  let shining = 0;

  function aim(lamps: THREE.SpotLight[], kind: typeof HEAD) {
    for (const lamp of lamps) {
      if (lamp.intensity <= 0) continue;
      const beam = (beams[shining] ??= {
        at: new THREE.Vector3(),
        axis: new THREE.Vector3(),
        cos: 0,
        colour: new THREE.Color(),
        falloff: 0,
      });
      lamp.getWorldPosition(beam.at);
      lamp.target.getWorldPosition(beam.axis).sub(beam.at).normalize();
      beam.cos = Math.cos(lamp.angle);
      beam.colour.copy(lamp.color).multiplyScalar(lamp.intensity * kind.gain);
      beam.falloff = kind.falloff;
      shining++;
    }
  }

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
      shining = 0;
      aim(lights.heads, HEAD);
      aim(lights.tails, TAIL);
      for (let i = 0; i < POOL; i++) {
        if (age[i] >= LIFE) {
          alpha[i] = 0;
          continue;
        }
        age[i] += dt;
        const life = Math.min(1, age[i] / LIFE);
        const j = i * 3;
        const drag = Math.exp(-1.4 * dt);
        velocity[j] *= drag;
        velocity[j + 2] *= drag;
        velocity[j + 1] *= Math.exp(-0.5 * dt);
        position[j] += velocity[j] * dt;
        position[j + 1] += velocity[j + 1] * dt;
        position[j + 2] += velocity[j + 2] * dt + scrolled;
        size[i] = 0.6 + 4.4 * Math.sqrt(life);
        alpha[i] =
          Math.min(1, age[i] / 0.15) *
          (1 - life) ** 2 *
          (0.5 - 0.12 * lights.night);

        colour.copy(DAY_SMOKE).lerp(NIGHT_SMOKE, lights.night);
        for (let n = 0; n < shining; n++) {
          const beam = beams[n];
          offset.set(position[j], position[j + 1], position[j + 2]);
          offset.sub(beam.at);
          const distance = offset.length();
          const along = offset.dot(beam.axis) / Math.max(distance, 1e-3);
          if (along <= beam.cos) continue;
          const glow =
            (along - beam.cos) /
            (1 - beam.cos) /
            (1 + distance * distance * beam.falloff);
          colour.r += beam.colour.r * glow;
          colour.g += beam.colour.g * glow;
          colour.b += beam.colour.b * glow;
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
