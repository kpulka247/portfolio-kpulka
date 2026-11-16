import * as THREE from "three";

// A low Japanese sports coupe in greys, after a Nissan 240SX hatch: a
// wedge with pop-up headlights, a fastback hatch, a full-width tail-light
// bar and a small ducktail. Designed in the Doop frame "Game car ·
// Japanese sports coupe". Its nose points to -z, away from the camera.
// pinBoard.ts moves `body` for pitch, roll and bounce, and each wheel on
// its own to follow the ground.

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
  // 0 for day, 1 for night: the paint darkens with the scene, as at dusk.
  // The lamps are left alone.
  setDusk: (level: number) => void;
  // Moves the pop-up headlights.
  update: (dt: number) => void;
  // The lamps, for lighting the tyre smoke.
  headlights: THREE.Object3D[];
  taillights: THREE.Object3D[];
  dispose: () => void;
}

// Scaled from a real S13 hatch (4.5 m long, 1.3 m tall, 2.42 m wheelbase)
// to the game's 1.9 m car. R is the tyre and RIM the wheel inside it.
const R = 0.138;
const RIM = 0.104;
const AXLE_Z = 0.53;
const AXLE_X = 0.32;
const WIDTH = 0.76;
// The bottom edge of the body, and the radius of the wheel arches.
const FLOOR = 0.06;
const ARCH = 0.158;
// Slammed: the body sits so low that the tyres all but touch the top of
// their arches. The gap left over is the suspension's travel.
export const ARCH_GAP = 0.012;
const SLAM = ARCH - R - ARCH_GAP;

const COLORS = {
  paint: "#c9ccd1",
  // The closed pop-ups, a shade darker, so they read as panel seams.
  popUp: "#b4b7bc",
  trim: "#2a2b2f",
  glass: "#141518",
  tyre: "#1d1e21",
  liner: "#141517",
  wheel: "#c9ccd1",
  plate: "#d8d9dc",
};

// Per lamp.
const HEADLIGHT = {
  // Neutral white, like modern LED headlights.
  color: "#f4f4f2",
  intensity: 290,
  distance: 34,
  angle: 0.42,
};
// The lamps sit low, close to the pins, so they shine softly.
const TAILLIGHT = { color: "#ff3b30", intensity: 14, distance: 8, angle: 0.9 };
const LAMP_GLOW = 3;
// The tail lamps skip tone mapping, which would turn a bright red orange,
// so their glow is set as plain red: dim at night, bright when braking.
const TAIL_LAMP_RED = "#ff1408";
const TAIL_GLOW = 0.8;
const BRAKE_GLOW = 1.7;
// Braking makes the tail lights at night this many times brighter.
const BRAKE_BOOST = 2.5;
// At night the paint takes the board's neutral warm tint and drops into
// the pins' brightness, so the car belongs to the dusk scene.
const DUSK_TINT = new THREE.Color("#d2cac1");
const DUSK_BRIGHTNESS = 0.68;

// The pop-ups sit on the bonnet's steeper front step, which falls 0.08 over
// its last 0.22. bonnetAt gives the bonnet's height at a z.
const STEP = Math.atan2(0.08, 0.22);
const bonnetAt = (z: number) => 0.235 + ((0.9 + z) / 0.22) * 0.08;
const POP_UP = { width: 0.17, length: 0.14, height: 0.075, hinge: -0.72 };
// Seconds for a pop-up to rise or drop.
const POP_UP_TIME = 0.35;
// The lamps light once the pop-ups are this far up.
const POP_UP_LIT = 0.85;

export function buildCar(): Car {
  const geometries: THREE.BufferGeometry[] = [];
  const materials = new Map<string, THREE.MeshStandardMaterial>();
  const material = (
    color: string,
    { roughness = 0.45, metalness = 0.2 } = {},
  ) => {
    const key = `${color}-${roughness}-${metalness}`;
    let found = materials.get(key);
    if (!found) {
      found = new THREE.MeshStandardMaterial({
        color,
        roughness,
        metalness,
        flatShading: true,
      });
      materials.set(key, found);
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
  // A side profile, x along the car with the front at +x, made solid
  // across the car's width.
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

  const paint = material(COLORS.paint, { roughness: 0.35, metalness: 0.35 });
  const trim = material(COLORS.trim);

  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);
  // The body's parts are placed with the ground at y = 0, as in Doop. The
  // shell moves them so the body's origin sits at the wheel centres.
  const shell = new THREE.Group();
  shell.position.y = -R - SLAM;
  body.add(shell);

  // Side profile, with a half-round arch over each wheel, its sides
  // dropping straight to the sill.
  const side = new THREE.Shape();
  side.moveTo(-0.95, FLOOR);
  for (const x of [-AXLE_Z, AXLE_Z]) {
    side.lineTo(x - ARCH, FLOOR);
    side.lineTo(x - ARCH, R);
    side.absarc(x, R, ARCH, Math.PI, 0, true);
    side.lineTo(x + ARCH, FLOOR);
  }
  // A short nose. The bonnet falls in two steps: gently from the cowl,
  // then more steeply to the nose. Then a short, low tail.
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
  // Glasshouse: steep windscreen, flat roof, short fastback hatch.
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
      WIDTH * 0.76,
    ),
    material(COLORS.glass, { roughness: 0.15, metalness: 0.6 }),
  );
  // The roof: a painted skin sunk into the glass, so only its top shows.
  mesh(
    shell,
    extrude(
      outline([
        [0.04, 0.527],
        [-0.25, 0.537],
        [-0.25, 0.52],
        [0.04, 0.51],
      ]),
      WIDTH * 0.74,
    ),
    material(COLORS.paint),
  );
  // Ducktail spoiler at the end of the deck, its rear edge kicked up.
  const spoiler = mesh(
    shell,
    new THREE.BoxGeometry(WIDTH * 0.88, 0.025, 0.08),
    material(COLORS.paint),
    [0, 0.338, 0.875],
  );
  spoiler.rotation.x = -0.35;
  // The tail-light bar across the rear panel: a dark red lens with a lamp
  // at each end.
  const tailLamp = new THREE.MeshStandardMaterial({
    // A dark red lens, as on a real car, so it reads red lit or not.
    color: "#4a1512",
    roughness: 0.3,
    emissive: TAIL_LAMP_RED,
    emissiveIntensity: 0,
    toneMapped: false,
  });
  const brakeLamp = tailLamp.clone();
  const lens = material("#3a1210", { roughness: 0.3 });
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
  // The third brake light, in the middle of the spoiler's rear edge.
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
    material(COLORS.plate),
    [0, 0.175, 0.93],
  );
  // Front: slim grille slot and bumper lip. Side skirts and mirrors.
  mesh(shell, new THREE.BoxGeometry(WIDTH * 0.5, 0.025, 0.02), trim, [
    0, 0.15, -0.93,
  ]);
  mesh(shell, new THREE.BoxGeometry(WIDTH * 0.95, 0.025, 0.06), trim, [
    0, 0.065, -0.885,
  ]);
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
    mesh(
      shell,
      new THREE.BoxGeometry(0.06, 0.04, 0.05),
      material(COLORS.paint),
      [x * (WIDTH / 2 + 0.018), 0.368, -0.27],
    );
  }
  // An inner wall across each axle, so the arches are four wheel wells
  // and not one hole through the car. Shaped like the arch, so it stays
  // inside the body.
  const liner = material(COLORS.liner, { roughness: 0.9 });
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

  // Pop-up headlights. Each is a wedge hinged at its rear edge, lying on
  // the bonnet's slope. Rising, its front edge lifts to show the lamp in
  // its upright front face.
  const headLamp = new THREE.MeshStandardMaterial({
    color: "#f6f6f7",
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
  for (const x of [-0.22, 0.22]) {
    const hinge = new THREE.Group();
    // A hair above the bonnet, so the closed lid shows as a seam.
    hinge.position.set(x, bonnetAt(POP_UP.hinge) + 0.002, POP_UP.hinge);
    hinge.rotation.x = -STEP;
    shell.add(hinge);
    const popUp = new THREE.Group();
    hinge.add(popUp);
    mesh(popUp, wedge, material(COLORS.popUp));
    mesh(popUp, popUpLens, headLamp, [0, popHeight / 2, -popLength - 0.004]);
    popUp.scale.y = 0.001;
    popUps.push(popUp);

    // The beam, from where the open lamp is, straight ahead.
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

  // Two red tail lights that glow behind, one at each tail lamp.
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

  // Wheels: a ring tyre, a dark barrel, and a forged six-spoke wheel with
  // a polished lip, after the Volk TE37.
  const rubber = new THREE.MeshStandardMaterial({
    color: COLORS.tyre,
    roughness: 0.95,
    metalness: 0.2,
    flatShading: true,
    side: THREE.DoubleSide,
  });
  materials.set("rubber", rubber);
  const metal = material(COLORS.wheel, { roughness: 0.25, metalness: 0.8 });
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
      // The side of the wheel that faces out.
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
      object.castShadow = !lamps.has(object.material as THREE.Material);
    }
  });

  // The paint colours by day and at dusk, to fade between.
  const paints = [...materials.values()].map((found) => ({
    material: found,
    day: found.color.clone(),
    dusk: found.color
      .clone()
      .multiply(DUSK_TINT)
      .multiplyScalar(DUSK_BRIGHTNESS),
  }));

  let lightsOn = false;
  // 0 down, 1 up.
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
    // The tail lamps glow with the lights at night, and brighter, by day
    // too, while braking.
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
      for (const { material: found, day, dusk } of paints) {
        found.color.copy(day).lerp(dusk, level);
      }
    },
    setLights(on) {
      lightsOn = on;
      // Off: the lamps go dark at once, then the pop-ups drop.
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
      // Eased, as a motor slows at the end of its travel.
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
