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
    // The tyres sit almost flush with the body sides, in cut-out arches.
    axle: { x: 0.35, z: 0.54 },
    bodyLift: 0.06,
    halfWidth: 0.43,
    halfLength: 0.84,
  },
  body: [1.66, 0.3, 0.82],
  cabin: { bottom: [0.78, 1.12], top: [0.6, 0.66], height: 0.32, back: 0.1 },
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
  // 0 for daylight, 1 for night: the lamps glow and the headlights and
  // tail lights shine, the headlights casting shadows. In between fades.
  setLights: (level: number) => void;
  // 0 for day, 1 for night: the paint darkens with the scene, as at dusk.
  // The lamps are left alone.
  setDusk: (level: number) => void;
  dispose: () => void;
}

// Per lamp. Two of each together match the single lights of the Doop
// night frames.
const HEADLIGHT = {
  // Neutral white, like modern LED headlights.
  color: "#f4f4f2",
  intensity: 290,
  distance: 34,
  angle: 0.42,
};
const TAILLIGHT = { color: "#ff3b30", intensity: 32, distance: 8, angle: 0.9 };
const LAMP_GLOW = 3;
// At night the paint takes the board's neutral warm tint and drops into
// the pins' brightness, so the SUV belongs to the dusk scene.
const DUSK_TINT = new THREE.Color("#d2cac1");
const DUSK_BRIGHTNESS = 0.68;

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

const TYRE_WIDTH = 0.16;
// How far a tyre's edge swings inwards at full steering lock.
const STEER_SWING = 0.07;

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
  // The lower body has a cut-out over each wheel: narrower where the
  // wheels are, so a steered wheel turns inside its arch, not through the
  // body. The upper body sits over the arches and tapers a little towards
  // the bonnet and the tailgate.
  const archTop = size.wheelRadius - size.bodyLift + 0.06;
  const archHalf = size.wheelRadius + 0.05;
  const tyreInner = size.axle.x - TYRE_WIDTH / 2 - STEER_SWING;
  mesh(
    body,
    frustum([width, length], [width * 0.94, length * 0.92], height - archTop),
    colors.body,
    [0, archTop, 0],
  );
  const edges = [
    -length / 2,
    -size.axle.z - archHalf,
    -size.axle.z + archHalf,
    size.axle.z - archHalf,
    size.axle.z + archHalf,
    length / 2,
  ];
  for (let n = 0; n < edges.length - 1; n++) {
    const arch = n % 2 === 1;
    const depth = edges[n + 1] - edges[n];
    mesh(
      body,
      new THREE.BoxGeometry(arch ? tyreInner * 2 : width, archTop, depth),
      arch ? colors.trim : colors.body,
      [0, archTop / 2, (edges[n] + edges[n + 1]) / 2],
    );
  }
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
  // Bumpers and lamps.
  const bumper = new THREE.BoxGeometry(width + 0.04, 0.1, 0.08);
  mesh(body, bumper, colors.trim, [0, 0.05, -length / 2 - 0.02]);
  mesh(body, bumper.clone(), colors.trim, [0, 0.05, length / 2 + 0.02]);
  // The lamps have their own materials, so they can glow at night.
  const headLamp = new THREE.MeshStandardMaterial({
    color: "#f6f6f7",
    roughness: 0.2,
    emissive: HEADLIGHT.color,
    emissiveIntensity: 0,
  });
  const tailLamp = new THREE.MeshStandardMaterial({
    color: "#7d7f85",
    roughness: 0.3,
    emissive: TAILLIGHT.color,
    emissiveIntensity: 0,
  });
  // Each lamp is a light of its own: two warm headlights that throw their
  // beams and cast shadows, and two red tail lights that glow behind.
  const lampY = height * 0.7;
  const headlights: THREE.SpotLight[] = [];
  const taillights: THREE.SpotLight[] = [];
  for (const x of [-width * 0.32, width * 0.32]) {
    const head = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.07, 0.03),
      headLamp,
    );
    head.position.set(x, lampY, -length / 2 + 0.02);
    const tail = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.07, 0.03),
      tailLamp,
    );
    tail.position.set(x * 1.15, lampY, length / 2 - 0.02);
    geometries.push(head.geometry, tail.geometry);
    body.add(head, tail);

    const headlight = new THREE.SpotLight(
      HEADLIGHT.color,
      0,
      HEADLIGHT.distance,
      HEADLIGHT.angle,
      0.7,
      1.5,
    );
    headlight.position.set(x, lampY, -length / 2 - 0.05);
    // Each beam points straight ahead of its own lamp.
    headlight.target.position.set(x * 1.6, -1.6, -length / 2 - 13);
    headlight.shadow.mapSize.setScalar(512);
    headlight.shadow.bias = -0.0008;
    const taillight = new THREE.SpotLight(
      TAILLIGHT.color,
      0,
      TAILLIGHT.distance,
      TAILLIGHT.angle,
      1,
      1.8,
    );
    taillight.position.set(x * 1.15, lampY, length / 2 + 0.05);
    taillight.target.position.set(x * 1.6, -1.2, length / 2 + 4);
    body.add(headlight, headlight.target, taillight, taillight.target);
    headlights.push(headlight);
    taillights.push(taillight);
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
        TYRE_WIDTH,
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

  // Everything casts a shadow except the lamps, which would block their
  // own light.
  // The paint colours by day and at dusk, to fade between.
  const paints = [...materials.values()].map((found) => ({
    material: found,
    day: found.color.clone(),
    dusk: found.color
      .clone()
      .multiply(DUSK_TINT)
      .multiplyScalar(DUSK_BRIGHTNESS),
  }));

  root.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.castShadow =
        object.material !== headLamp && object.material !== tailLamp;
    }
  });

  return {
    root,
    body,
    wheels,
    size,
    setDusk(level) {
      for (const { material, day, dusk } of paints) {
        material.color.copy(day).lerp(dusk, level);
      }
    },
    setLights(level) {
      headLamp.emissiveIntensity = LAMP_GLOW * level;
      tailLamp.emissiveIntensity = LAMP_GLOW * level;
      for (const light of headlights) {
        light.intensity = HEADLIGHT.intensity * level;
        // A shadow-casting light costs a shadow pass even when dark, so it
        // casts only while it shines.
        light.castShadow = level > 0.01;
      }
      for (const light of taillights) {
        light.intensity = TAILLIGHT.intensity * level;
      }
    },
    dispose() {
      for (const geometry of geometries) geometry.dispose();
      for (const found of materials.values()) found.dispose();
      headLamp.dispose();
      tailLamp.dispose();
      for (const light of [...headlights, ...taillights]) light.dispose();
    },
  };
}
