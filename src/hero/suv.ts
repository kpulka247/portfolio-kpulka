import * as THREE from "three";

// A small low-poly SUV in greys, built from a few faceted shapes. Its nose
// points to -z, away from the camera. The body sits on springs above the
// wheels: pinBoard.ts moves `body` for pitch, roll and bounce, and each
// wheel on its own to follow the ground.

export interface SuvSize {
  wheelRadius: number;
  // The wheels' x and z, relative to the middle of the car.
  axle: { x: number; z: number };
  // How far the body's floor sits above the wheel centres at rest.
  bodyLift: number;
  // Half the footprint, for hitting obstacles.
  halfWidth: number;
  halfLength: number;
}

interface Spec {
  size: SuvSize;
  // Body: length, height, width.
  body: [number, number, number];
  // Cabin: bottom and top footprint (width, length), height, and how far
  // back of centre it sits.
  cabin: {
    bottom: [number, number];
    top: [number, number];
    height: number;
    back: number;
  };
  colors: {
    body: string;
    cabin: string;
    glass: string;
    trim: string;
    tyre: string;
    hub: string;
  };
}

// The crossover, picked from three low-poly options in Doop: a light body
// under a dark, tapered glasshouse.
const SPEC: Spec = {
  size: {
    wheelRadius: 0.19,
    // The wheels sit outside the body, so a steered wheel never cuts into it.
    axle: { x: 0.5, z: 0.54 },
    bodyLift: 0.06,
    halfWidth: 0.56,
    halfLength: 0.84,
  },
  body: [1.66, 0.3, 0.72],
  cabin: { bottom: [0.7, 1.12], top: [0.54, 0.66], height: 0.32, back: 0.1 },
  colors: {
    body: "#b2b5bb",
    cabin: "#2b2c31",
    glass: "#2b2c31",
    trim: "#5b5d63",
    tyre: "#26272b",
    hub: "#a9abb1",
  },
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

export interface Suv {
  root: THREE.Group;
  body: THREE.Group;
  wheels: Wheel[];
  size: SuvSize;
  dispose: () => void;
}

// A box whose top is smaller than its bottom: four-sided, so it stays
// low-poly. Its base sits at y = 0.
function frustum(
  [bottomWidth, bottomLength]: [number, number],
  [topWidth, topLength]: [number, number],
  height: number,
): THREE.BufferGeometry {
  const geometry = new THREE.CylinderGeometry(
    Math.SQRT1_2,
    Math.SQRT1_2,
    height,
    4,
    1,
  );
  geometry.rotateY(Math.PI / 4);
  const position = geometry.getAttribute("position");
  for (let i = 0; i < position.count; i++) {
    const top = position.getY(i) > 0;
    position.setX(i, position.getX(i) * (top ? topWidth : bottomWidth));
    position.setZ(i, position.getZ(i) * (top ? topLength : bottomLength));
    position.setY(i, position.getY(i) + height / 2);
  }
  geometry.computeVertexNormals();
  return geometry.toNonIndexed();
}

export function buildSuv(): Suv {
  const spec = SPEC;
  const { size, colors } = spec;
  const geometries: THREE.BufferGeometry[] = [];
  const materials = new Map<string, THREE.MeshStandardMaterial>();
  const material = (color: string, roughness = 0.6) => {
    let found = materials.get(`${color}-${roughness}`);
    if (!found) {
      found = new THREE.MeshStandardMaterial({
        color,
        roughness,
        metalness: 0.15,
        flatShading: true,
      });
      materials.set(`${color}-${roughness}`, found);
    }
    return found;
  };
  const mesh = (
    parent: THREE.Object3D,
    geometry: THREE.BufferGeometry,
    color: string,
    [x, y, z]: [number, number, number],
    roughness?: number,
  ) => {
    geometries.push(geometry);
    const object = new THREE.Mesh(geometry, material(color, roughness));
    object.position.set(x, y, z);
    parent.add(object);
    return object;
  };

  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);

  const [length, height, width] = spec.body;
  // The body tapers a little towards the bonnet and the tailgate.
  mesh(
    body,
    frustum([width, length], [width * 0.94, length * 0.92], height),
    colors.body,
    [0, 0, 0],
  );
  const { cabin } = spec;
  mesh(body, frustum(cabin.bottom, cabin.top, cabin.height), colors.cabin, [
    0,
    height,
    cabin.back,
  ]);
  // Windows: a dark band just outside the cabin's lower two thirds.
  mesh(
    body,
    frustum(
      [cabin.bottom[0] + 0.01, cabin.bottom[1] + 0.01],
      [
        cabin.bottom[0] + (cabin.top[0] - cabin.bottom[0]) * 0.75 + 0.01,
        cabin.bottom[1] + (cabin.top[1] - cabin.bottom[1]) * 0.75 + 0.01,
      ],
      cabin.height * 0.72,
    ),
    colors.glass,
    [0, height + cabin.height * 0.1, cabin.back],
    0.2,
  );
  // Wheel arches: a flare over each wheel, out to the tyre's outer face.
  for (const x of [-size.axle.x, size.axle.x]) {
    for (const z of [-size.axle.z, size.axle.z]) {
      mesh(body, frustum([0.24, 0.52], [0.2, 0.4], 0.08), colors.trim, [
        x * 0.96,
        size.wheelRadius - size.bodyLift + 0.02,
        z,
      ]);
    }
  }

  // Bumpers and lamps.
  const bumper = new THREE.BoxGeometry(width + 0.04, 0.1, 0.08);
  mesh(body, bumper, colors.trim, [0, 0.05, -length / 2 - 0.02]);
  mesh(body, bumper.clone(), colors.trim, [0, 0.05, length / 2 + 0.02]);
  for (const x of [-width * 0.32, width * 0.32]) {
    mesh(
      body,
      new THREE.BoxGeometry(0.16, 0.07, 0.03),
      "#f6f6f7",
      [x, height * 0.7, -length / 2 + 0.02],
      0.2,
    );
    mesh(
      body,
      new THREE.BoxGeometry(0.12, 0.07, 0.03),
      "#7d7f85",
      [x * 1.15, height * 0.7, length / 2 - 0.02],
      0.3,
    );
  }

  const wheels: Wheel[] = [];
  for (const z of [-size.axle.z, size.axle.z]) {
    for (const x of [-size.axle.x, size.axle.x]) {
      const pivot = new THREE.Group();
      pivot.position.set(x, 0, z);
      const spinner = new THREE.Group();
      pivot.add(spinner);
      const tyre = new THREE.CylinderGeometry(
        size.wheelRadius,
        size.wheelRadius,
        0.16,
        8,
      );
      tyre.rotateZ(Math.PI / 2);
      mesh(spinner, tyre, colors.tyre, [0, 0, 0], 0.95);
      const hub = new THREE.CylinderGeometry(
        size.wheelRadius * 0.5,
        size.wheelRadius * 0.5,
        0.17,
        6,
      );
      hub.rotateZ(Math.PI / 2);
      mesh(spinner, hub, colors.hub, [0, 0, 0], 0.4);
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
    size,
    dispose() {
      for (const geometry of geometries) geometry.dispose();
      for (const found of materials.values()) found.dispose();
    },
  };
}
