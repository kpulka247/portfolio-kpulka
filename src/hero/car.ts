import * as THREE from "three";

export interface CarSize {
  wheelRadius: number;
  // The wheels' x and z, relative to the middle of the car.
  axle: { x: number; z: number };
  // How far the body's origin sits above the wheel centres at rest.
  bodyLift: number;
  // Half the footprint, for hitting obstacles.
  halfWidth: number;
  halfLength: number;
}

export interface Wheel {
  // Turns for steering.
  pivot: THREE.Group;
  // Spins as the car rolls.
  spinner: THREE.Group;
  x: number;
  z: number;
  front: boolean;
}

export interface Car {
  root: THREE.Group;
  body: THREE.Group;
  wheels: Wheel[];
  size: CarSize;
  // Turns the lamps on or off. The headlights pop up first and light once
  // they are up; switching off drops them after the lamps go dark.
  setLights: (on: boolean) => void;
  // 0 to 1: the brake lights, by day and at night. The two tail lamps
  // glow brighter and the third brake light, in the spoiler, comes on.
  setBraking: (level: number) => void;
  // 0 for day, 1 for night: the car takes its day or night colours with
  // the board. The lamps are left alone.
  setDusk: (level: number) => void;
  // Moves the pop-up headlights.
  update: (dt: number) => void;
  // The lamps, for lighting the tyre smoke.
  headlights: THREE.SpotLight[];
  taillights: THREE.SpotLight[];
  dispose: () => void;
}

const R = 0.138;
const RIM = 0.104;
const AXLE_Z = 0.53;
const AXLE_X = 0.32;
const WIDTH = 0.76;
const FLOOR = 0.06;
const ARCH = 0.158;
export const ARCH_GAP = 0.006;
const SLAM = ARCH - R - ARCH_GAP;

// The car's colours from the Doop canvas (the --color-car-* tokens): a
// warm silver coupe with gunmetal wheels by day, a graphite one with warm
// silver wheels at night. The wheels always contrast with the body.
type Part =
  | "paint"
  | "popUp"
  | "trim"
  | "glass"
  | "tyre"
  | "liner"
  | "wheel"
  | "plate"
  | "lens";

const DAY: Record<Part, string> = {
  paint: "#cdc8c1",
  popUp: "#bab4ac",
  trim: "#292624",
  glass: "#161412",
  tyre: "#1d1b19",
  liner: "#13110f",
  wheel: "#77716a",
  plate: "#ece8e2",
  lens: "#3a1210",
};

const NIGHT: Record<Part, string> = {
  paint: "#4a4541",
  popUp: "#423d3a",
  trim: "#1f1c1a",
  glass: "#141210",
  tyre: "#1a1816",
  liner: "#100e0d",
  wheel: "#b8b2aa",
  plate: "#ece8e2",
  lens: "#3a1210",
};

export const HEADLIGHT = {
  color: "#f7f2ea",
  intensity: 290,
  distance: 34,
  angle: 0.42,
};
export const TAILLIGHT = {
  color: "#ff3b30",
  intensity: 14,
  distance: 8,
  angle: 0.9,
};
const LAMP_GLOW = 3;
// The tail lamps skip tone mapping, which would turn a bright red orange,
// so their glow is set as plain red: dim at night, bright when braking.
const TAIL_LAMP_RED = "#ff1408";
const TAIL_GLOW = 0.8;
const BRAKE_GLOW = 1.7;
const BRAKE_BOOST = 2.5;

const STEP = Math.atan2(0.08, 0.22);
const bonnetAt = (z: number) => 0.235 + ((0.9 + z) / 0.22) * 0.08;
const POP_UP = { width: 0.17, length: 0.14, height: 0.075, hinge: -0.72 };
const POP_UP_TIME = 0.35;
const POP_UP_LIT = 0.85;

export function buildCar(): Car {
  const geometries: THREE.BufferGeometry[] = [];
  const materials = new Map<string, THREE.MeshStandardMaterial>();
  const parts = new Map<THREE.MeshStandardMaterial, Part>();
  const material = (part: Part, { roughness = 0.45, metalness = 0.2 } = {}) => {
    const key = `${part}-${roughness}-${metalness}`;
    let found = materials.get(key);
    if (!found) {
      found = new THREE.MeshStandardMaterial({
        color: DAY[part],
        roughness,
        metalness,
        flatShading: true,
      });
      materials.set(key, found);
      parts.set(found, part);
    }
    return found;
  };
  const mesh = (
    parent: THREE.Object3D,
    geometry: THREE.BufferGeometry,
    surface: THREE.Material,
    [x, y, z]: [number, number, number] = [0, 0, 0],
  ) => {
    geometries.push(geometry);
    const object = new THREE.Mesh(geometry, surface);
    object.position.set(x, y, z);
    parent.add(object);
    return object;
  };
  const extrude = (shape: THREE.Shape, depth: number) => {
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: false,
    });
    geometry.translate(0, 0, -depth / 2);
    geometry.rotateY(Math.PI / 2);
    return geometry;
  };
  const outline = (points: [number, number][]) => {
    const shape = new THREE.Shape();
    shape.moveTo(...points[0]);
    for (const point of points.slice(1)) shape.lineTo(...point);
    return shape;
  };

  const paint = material("paint", { roughness: 0.35, metalness: 0.35 });
  const trim = material("trim");

  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);
  const shell = new THREE.Group();
  shell.position.y = -R - SLAM;
  body.add(shell);

  const side = new THREE.Shape();
  side.moveTo(-0.95, FLOOR);
  for (const x of [-AXLE_Z, AXLE_Z]) {
    side.lineTo(x - ARCH, FLOOR);
    side.lineTo(x - ARCH, R);
    side.absarc(x, R, ARCH, Math.PI, 0, true);
    side.lineTo(x + ARCH, FLOOR);
  }
  for (const point of [
    [0.88, FLOOR],
    [0.92, 0.13],
    [0.9, 0.235],
    [0.68, 0.315],
    [0.34, 0.345],
    [-0.6, 0.36],
    [-0.88, 0.335],
    [-0.93, 0.26],
    [-0.92, FLOOR],
  ] satisfies [number, number][]) {
    side.lineTo(...point);
  }
  mesh(shell, extrude(side, WIDTH), paint);
  mesh(
    shell,
    extrude(
      outline([
        [0.34, 0.345],
        [0.05, 0.525],
        [-0.26, 0.535],
        [-0.6, 0.385],
        [-0.5, 0.358],
      ]),
      WIDTH * 0.9,
    ),
    material("glass", { roughness: 0.15, metalness: 0.6 }),
  );
  mesh(
    shell,
    extrude(
      outline([
        [0.04, 0.527],
        [-0.25, 0.537],
        [-0.25, 0.52],
        [0.04, 0.51],
      ]),
      WIDTH * 0.88,
    ),
    material("paint"),
  );
  const spoiler = mesh(
    shell,
    new THREE.BoxGeometry(WIDTH * 0.88, 0.025, 0.08),
    material("paint"),
    [0, 0.338, 0.875],
  );
  spoiler.rotation.x = -0.35;
  const tailLamp = new THREE.MeshStandardMaterial({
    color: "#4a1512",
    roughness: 0.3,
    emissive: TAIL_LAMP_RED,
    emissiveIntensity: 0,
    toneMapped: false,
  });
  const brakeLamp = tailLamp.clone();
  const lens = material("lens", { roughness: 0.3 });
  const LAMP_WIDTH = 0.17;
  mesh(
    shell,
    new THREE.BoxGeometry(WIDTH * 0.92 - 2 * LAMP_WIDTH, 0.045, 0.02),
    lens,
    [0, 0.275, 0.93],
  );
  const tailX = WIDTH * 0.46 - LAMP_WIDTH / 2;
  for (const x of [-tailX, tailX]) {
    mesh(shell, new THREE.BoxGeometry(LAMP_WIDTH, 0.055, 0.022), tailLamp, [
      x,
      0.275,
      0.93,
    ]);
  }
  const third = mesh(
    shell,
    new THREE.BoxGeometry(0.18, 0.016, 0.012),
    brakeLamp,
    [0, 0.352, 0.912],
  );
  third.rotation.x = -0.35;
  mesh(
    shell,
    new THREE.BoxGeometry(0.2, 0.05, 0.02),
    material("plate"),
    [0, 0.175, 0.93],
  );
  mesh(
    shell,
    new THREE.BoxGeometry(WIDTH * 0.5, 0.025, 0.02),
    trim,
    [0, 0.15, -0.93],
  );
  mesh(
    shell,
    new THREE.BoxGeometry(WIDTH * 0.95, 0.025, 0.06),
    trim,
    [0, 0.065, -0.885],
  );
  for (const x of [-1, 1]) {
    mesh(
      shell,
      new THREE.BoxGeometry(0.025, 0.035, 2 * (AXLE_Z - ARCH)),
      trim,
      [(x * WIDTH) / 2, 0.08, 0],
    );
    mesh(shell, new THREE.BoxGeometry(0.1, 0.018, 0.03), trim, [
      x * (WIDTH / 2 - 0.03),
      0.355,
      -0.27,
    ]);
    mesh(shell, new THREE.BoxGeometry(0.06, 0.04, 0.05), material("paint"), [
      x * (WIDTH / 2 + 0.018),
      0.368,
      -0.27,
    ]);
  }
  const liner = material("liner", { roughness: 0.9 });
  for (const z of [-AXLE_Z, AXLE_Z]) {
    const round = mesh(
      shell,
      new THREE.CylinderGeometry(ARCH - 0.004, ARCH - 0.004, 0.4, 20),
      liner,
      [0, R, z],
    );
    round.rotation.z = Math.PI / 2;
    mesh(
      shell,
      new THREE.BoxGeometry(0.4, R - FLOOR, 2 * ARCH - 0.008),
      liner,
      [0, (FLOOR + R) / 2, z],
    );
  }

  const headLamp = new THREE.MeshStandardMaterial({
    color: HEADLIGHT.color,
    roughness: 0.2,
    emissive: HEADLIGHT.color,
    emissiveIntensity: 0,
  });
  const popUps: THREE.Object3D[] = [];
  const headlights: THREE.SpotLight[] = [];
  const { width: popWidth, length: popLength, height: popHeight } = POP_UP;
  const wedge = extrude(
    outline([
      [0, 0],
      [popLength, 0],
      [popLength, popHeight],
    ]),
    popWidth,
  );
  const popUpLens = new THREE.BoxGeometry(0.12, 0.042, 0.01);
  for (const x of [-0.27, 0.27]) {
    const hinge = new THREE.Group();
    hinge.position.set(x, bonnetAt(POP_UP.hinge) + 0.002, POP_UP.hinge);
    hinge.rotation.x = -STEP;
    shell.add(hinge);
    const popUp = new THREE.Group();
    hinge.add(popUp);
    mesh(popUp, wedge, material("popUp"));
    mesh(popUp, popUpLens, headLamp, [0, popHeight / 2, -popLength - 0.004]);
    popUp.scale.y = 0.001;
    popUps.push(popUp);

    const front = POP_UP.hinge - popLength * Math.cos(STEP);
    const lampY = bonnetAt(front) + (popHeight / 2) * Math.cos(STEP);
    const headlight = new THREE.SpotLight(
      HEADLIGHT.color,
      0,
      HEADLIGHT.distance,
      HEADLIGHT.angle,
      0.7,
      1.5,
    );
    headlight.position.set(x, lampY, front - 0.03);
    headlight.target.position.set(x * 1.6, -1.6, -13);
    headlight.shadow.mapSize.setScalar(512);
    headlight.shadow.bias = -0.0008;
    shell.add(headlight, headlight.target);
    headlights.push(headlight);
  }
  geometries.push(wedge, popUpLens);

  const taillights: THREE.SpotLight[] = [];
  for (const x of [-tailX, tailX]) {
    const taillight = new THREE.SpotLight(
      TAILLIGHT.color,
      0,
      TAILLIGHT.distance,
      TAILLIGHT.angle,
      1,
      1.8,
    );
    taillight.position.set(x, 0.275, 0.98);
    taillight.target.position.set(x * 1.6, -1.2, 5);
    shell.add(taillight, taillight.target);
    taillights.push(taillight);
  }

  const rubber = new THREE.MeshStandardMaterial({
    color: DAY.tyre,
    roughness: 0.95,
    metalness: 0.2,
    flatShading: true,
    side: THREE.DoubleSide,
  });
  materials.set("rubber", rubber);
  parts.set(rubber, "tyre");
  const metal = material("wheel", { roughness: 0.25, metalness: 0.8 });
  const tread = new THREE.CylinderGeometry(R, R, 0.12, 16, 1, true);
  tread.rotateZ(Math.PI / 2);
  const wall = new THREE.RingGeometry(RIM, R, 16);
  wall.rotateY(Math.PI / 2);
  const barrel = new THREE.CylinderGeometry(RIM, RIM, 0.02, 14);
  barrel.rotateZ(Math.PI / 2);
  const lip = new THREE.TorusGeometry(RIM, 0.012, 6, 20);
  lip.rotateY(Math.PI / 2);
  const spoke = new THREE.BoxGeometry(0.02, RIM, 0.032);
  spoke.translate(0, RIM / 2, 0);
  const cap = new THREE.CylinderGeometry(0.026, 0.026, 0.02, 8);
  cap.rotateZ(Math.PI / 2);
  geometries.push(tread, wall, barrel, lip, spoke, cap);
  const wheels: Wheel[] = [];
  for (const z of [-AXLE_Z, AXLE_Z]) {
    for (const x of [-AXLE_X, AXLE_X]) {
      const pivot = new THREE.Group();
      pivot.position.set(x, R, z);
      const spinner = new THREE.Group();
      pivot.add(spinner);
      const out = Math.sign(x);
      const part = (
        geometry: THREE.BufferGeometry,
        surface: THREE.Material,
        offset: number,
      ) => {
        const object = new THREE.Mesh(geometry, surface);
        object.position.x = offset;
        spinner.add(object);
        return object;
      };
      part(tread, rubber, 0);
      part(wall, rubber, -0.06);
      part(wall, rubber, 0.06);
      part(barrel, trim, out * 0.015);
      part(lip, metal, out * 0.074);
      for (let n = 0; n < 6; n++) {
        part(spoke, metal, out * 0.05).rotation.x = (n * Math.PI) / 3;
      }
      part(cap, metal, out * 0.056);
      root.add(pivot);
      wheels.push({ pivot, spinner, x, z, front: z < 0 });
    }
  }

  // Everything casts a shadow except the lamps, which would block their
  // own light.
  const lamps = new Set<THREE.Material>([headLamp, tailLamp, brakeLamp]);
  root.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.castShadow =
        Array.isArray(object.material) || !lamps.has(object.material);
    }
  });

  const paints = [...parts].map(([found, part]) => ({
    material: found,
    day: new THREE.Color(DAY[part]),
    night: new THREE.Color(NIGHT[part]),
  }));

  let lightsOn = false;
  let raised = 0;
  let lit = false;
  let brakeLevel = 0;

  function updateLamps() {
    const glow = lit ? 1 : 0;
    headLamp.emissiveIntensity = LAMP_GLOW * glow;
    for (const light of headlights) {
      light.intensity = HEADLIGHT.intensity * glow;
      // A shadow-casting light costs a shadow pass even when dark, so it
      // casts only while it shines.
      light.castShadow = lit;
    }
    tailLamp.emissiveIntensity = Math.max(
      TAIL_GLOW * glow,
      BRAKE_GLOW * brakeLevel,
    );
    brakeLamp.emissiveIntensity = BRAKE_GLOW * brakeLevel;
    for (const light of taillights) {
      light.intensity =
        TAILLIGHT.intensity * glow * (1 + BRAKE_BOOST * brakeLevel);
    }
  }

  return {
    root,
    body,
    wheels,
    size: {
      wheelRadius: R,
      axle: { x: AXLE_X, z: AXLE_Z },
      bodyLift: 0,
      halfWidth: WIDTH / 2,
      halfLength: 0.94,
    },
    headlights,
    taillights,
    setDusk(level) {
      for (const { material: found, day, night } of paints) {
        found.color.copy(day).lerp(night, level);
      }
    },
    setLights(on) {
      lightsOn = on;
      if (!on && lit) {
        lit = false;
        updateLamps();
      }
    },
    update(dt) {
      const target = lightsOn ? 1 : 0;
      if (raised === target) return;
      const step = dt / POP_UP_TIME;
      raised =
        target > raised
          ? Math.min(target, raised + step)
          : Math.max(target, raised - step);
      const shown = raised * raised * (3 - 2 * raised);
      for (const popUp of popUps) popUp.scale.y = Math.max(0.001, shown);
      if (lightsOn && !lit && raised >= POP_UP_LIT) {
        lit = true;
        updateLamps();
      }
    },
    setBraking(level) {
      if (level === brakeLevel) return;
      brakeLevel = level;
      updateLamps();
    },
    dispose() {
      for (const geometry of geometries) geometry.dispose();
      for (const found of materials.values()) found.dispose();
      for (const found of lamps) found.dispose();
      for (const light of [...headlights, ...taillights]) light.dispose();
    },
  };
}
