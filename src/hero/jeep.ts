import * as THREE from "three";

// A toy off-road jeep in shades of grey, built from boxes and cylinders.
// Its nose points to -z, away from the camera. The body sits on springs
// above the wheels: pinBoard.ts moves `body` for pitch, roll and bounce,
// and each wheel on its own to follow the ground.

export const WHEEL_RADIUS = 0.4;
// The wheels' x and z, relative to the middle of the car.
export const AXLE = { x: 0.84, z: 1.02 };
// How far the body's floor sits above the wheel centres when at rest.
export const BODY_LIFT = 0.22;

// Seen from behind and against the light, so the body is a light grey and
// each part a step darker than the one it sits on.
const PALETTE = {
  paint: "#a3a6ad",
  paintDark: "#878a91",
  trim: "#3a3c41",
  glass: "#1f2024",
  tyre: "#232428",
  hub: "#c9cbd0",
  lamp: "#f6f6f7",
  tail: "#6e7076",
};

export interface Wheel {
  // Turns for steering.
  pivot: THREE.Group;
  // Spins as the car rolls.
  spinner: THREE.Group;
  x: number;
  z: number;
  front: boolean;
}

export interface Jeep {
  root: THREE.Group;
  body: THREE.Group;
  wheels: Wheel[];
  dispose: () => void;
}

export function buildJeep(): Jeep {
  const geometries: THREE.BufferGeometry[] = [];
  const materials = new Map<string, THREE.MeshStandardMaterial>();

  const material = (color: string, roughness = 0.55, metalness = 0.2) => {
    const key = `${color}-${roughness}-${metalness}`;
    let found = materials.get(key);
    if (!found) {
      found = new THREE.MeshStandardMaterial({ color, roughness, metalness });
      materials.set(key, found);
    }
    return found;
  };

  const box = (
    parent: THREE.Object3D,
    [w, h, d]: [number, number, number],
    [x, y, z]: [number, number, number],
    color: string,
    roughness?: number,
    metalness?: number,
  ) => {
    const geometry = new THREE.BoxGeometry(w, h, d);
    geometries.push(geometry);
    const mesh = new THREE.Mesh(
      geometry,
      material(color, roughness, metalness),
    );
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  };

  // A cylinder whose axis runs along x, like a wheel on an axle.
  const disc = (
    parent: THREE.Object3D,
    radius: number,
    width: number,
    color: string,
    roughness?: number,
    metalness?: number,
  ) => {
    const geometry = new THREE.CylinderGeometry(radius, radius, width, 20);
    geometry.rotateZ(Math.PI / 2);
    geometries.push(geometry);
    const mesh = new THREE.Mesh(
      geometry,
      material(color, roughness, metalness),
    );
    parent.add(mesh);
    return mesh;
  };

  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);

  // Tub and hood.
  box(body, [1.5, 0.52, 2.95], [0, 0.26, 0], PALETTE.paint, 0.45, 0.25);
  box(body, [1.42, 0.14, 1.0], [0, 0.57, -0.92], PALETTE.paintDark, 0.45, 0.25);
  box(body, [1.0, 0.24, 0.06], [0, 0.28, -1.49], PALETTE.trim);

  // Cabin: dark glass under a roof on four posts, with a roof rack.
  box(body, [1.36, 0.46, 1.36], [0, 0.75, 0.42], PALETTE.glass, 0.12, 0.6);
  box(body, [1.46, 0.07, 1.48], [0, 1.0, 0.42], PALETTE.paintDark, 0.45, 0.25);
  for (const x of [-0.69, 0.69]) {
    for (const z of [-0.25, 1.09]) {
      box(body, [0.08, 0.46, 0.08], [x, 0.75, z], PALETTE.paintDark);
    }
    box(body, [0.05, 0.05, 1.3], [x * 0.9, 1.1, 0.42], PALETTE.trim);
  }
  for (const z of [-0.05, 0.42, 0.89]) {
    box(body, [1.24, 0.04, 0.05], [0, 1.1, z], PALETTE.trim);
  }

  // Mirrors, fender flares and bumpers.
  for (const x of [-0.8, 0.8]) {
    box(body, [0.1, 0.12, 0.16], [x, 0.66, -0.3], PALETTE.trim);
    for (const z of [-AXLE.z, AXLE.z]) {
      box(body, [0.2, 0.12, 0.98], [x * 1.04, 0.1, z], PALETTE.trim, 0.8);
    }
  }
  box(body, [1.66, 0.2, 0.22], [0, -0.04, -1.56], PALETTE.trim, 0.7);
  box(body, [1.66, 0.2, 0.22], [0, -0.04, 1.56], PALETTE.trim, 0.7);

  // Headlights at the front, tail lights and the spare wheel at the back.
  for (const x of [-0.52, 0.52]) {
    box(body, [0.26, 0.14, 0.05], [x, 0.36, -1.49], PALETTE.lamp, 0.2, 0);
    box(body, [0.14, 0.2, 0.05], [x * 1.3, 0.34, 1.49], PALETTE.tail, 0.3, 0);
  }
  const spare = new THREE.Group();
  spare.position.set(0, 0.62, 1.62);
  spare.rotation.y = Math.PI / 2;
  disc(spare, 0.38, 0.24, PALETTE.tyre, 0.95, 0);
  disc(spare, 0.2, 0.26, PALETTE.hub, 0.35, 0.6);
  body.add(spare);

  const wheels: Wheel[] = [];
  for (const z of [-AXLE.z, AXLE.z]) {
    for (const x of [-AXLE.x, AXLE.x]) {
      const pivot = new THREE.Group();
      pivot.position.set(x, 0, z);
      const spinner = new THREE.Group();
      pivot.add(spinner);
      disc(spinner, WHEEL_RADIUS, 0.34, PALETTE.tyre, 0.95, 0);
      disc(spinner, WHEEL_RADIUS * 0.55, 0.36, PALETTE.hub, 0.35, 0.6);
      // A tread block, so the eye can see the wheel turn.
      box(spinner, [0.36, 0.1, 0.1], [0, WHEEL_RADIUS, 0], PALETTE.trim, 0.9);
      root.add(pivot);
      wheels.push({ pivot, spinner, x, z, front: z < 0 });
    }
  }

  root.traverse((object) => {
    if (object instanceof THREE.Mesh) object.castShadow = true;
  });

  return {
    root,
    body,
    wheels,
    dispose() {
      for (const geometry of geometries) geometry.dispose();
      for (const found of materials.values()) found.dispose();
    },
  };
}
