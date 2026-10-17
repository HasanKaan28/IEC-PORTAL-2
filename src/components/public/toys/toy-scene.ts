import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/**
 * Real 3D hardware for the scroll easter egg: screws, nuts, washers, gears and brass springs,
 * modelled with three.js meshes and lit with an environment map so the metal catches light as
 * the parts tumble. World units are screen pixels: the camera is placed so the z = 0 plane maps
 * one-to-one onto the viewport.
 *
 * Loaded lazily by ScrollToys on the first scroll, so pages that are never scrolled pay nothing.
 */

export interface ToyScene {
  spawn: () => void;
  dispose: () => void;
}

type Kind = "screw" | "nut" | "washer" | "gear" | "spring";

interface Piece {
  obj: THREE.Object3D;
  kind: Kind;
  vx: number;
  vy: number;
  wx: number;
  wy: number;
  wz: number;
  restitution: number;
  bounces: number;
  maxBounces: number;
  squash: number;
  age: number;
  vanishAt: number | null;
  scale: number;
  entered: boolean;
}

const GRAVITY = 0.42; // px per frame^2 at 60 fps
const LIFETIME_MS = 7000;
const VANISH_MS = 420;
const FOV = 30;

/** A helix around the local Y axis, used for screw threads and the spring coil. */
class Helix extends THREE.Curve<THREE.Vector3> {
  constructor(
    private readonly radius: number,
    private readonly height: number,
    private readonly turns: number
  ) {
    super();
  }

  override getPoint(t: number, target = new THREE.Vector3()): THREE.Vector3 {
    const angle = t * this.turns * Math.PI * 2;
    return target.set(Math.cos(angle) * this.radius, (t - 0.5) * this.height, Math.sin(angle) * this.radius);
  }
}

function ringShape(outer: number, hole: number, sides?: number): THREE.Shape {
  const shape = new THREE.Shape();
  if (sides) {
    for (let i = 0; i < sides; i += 1) {
      const a = (i / sides) * Math.PI * 2 + Math.PI / sides;
      const x = Math.cos(a) * outer;
      const y = Math.sin(a) * outer;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();
  } else {
    shape.absarc(0, 0, outer, 0, Math.PI * 2, false);
  }
  const inner = new THREE.Path();
  inner.absarc(0, 0, hole, 0, Math.PI * 2, true);
  shape.holes.push(inner);
  return shape;
}

function gearShape(teeth: number, outer: number, root: number, hole: number): THREE.Shape {
  const shape = new THREE.Shape();
  const step = (Math.PI * 2) / teeth;
  let first = true;
  for (let i = 0; i < teeth; i += 1) {
    const a = i * step;
    const corners: Array<[number, number]> = [
      [root, a - step * 0.3],
      [outer, a - step * 0.15],
      [outer, a + step * 0.15],
      [root, a + step * 0.3],
    ];
    for (const [r, t] of corners) {
      const x = Math.cos(t) * r;
      const y = Math.sin(t) * r;
      if (first) {
        shape.moveTo(x, y);
        first = false;
      } else {
        shape.lineTo(x, y);
      }
    }
  }
  shape.closePath();
  const inner = new THREE.Path();
  inner.absarc(0, 0, hole, 0, Math.PI * 2, true);
  shape.holes.push(inner);
  return shape;
}

function extrude(shape: THREE.Shape, depth: number, bevel: number): THREE.ExtrudeGeometry {
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 2,
    curveSegments: 28,
  });
  geometry.center();
  return geometry;
}

function buildTemplates() {
  const geometries: THREE.BufferGeometry[] = [];
  const keep = <T extends THREE.BufferGeometry>(g: T) => {
    geometries.push(g);
    return g;
  };

  const steel = new THREE.MeshStandardMaterial({ color: 0xd3dbe5, metalness: 0.95, roughness: 0.26 });
  const darkSteel = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7, roughness: 0.45 });
  const zinc = new THREE.MeshStandardMaterial({ color: 0xbfc8d4, metalness: 0.9, roughness: 0.38 });
  const brass = new THREE.MeshStandardMaterial({ color: 0xe0b23a, metalness: 1, roughness: 0.3 });
  const navy = new THREE.MeshStandardMaterial({ color: 0x1f5a94, metalness: 0.45, roughness: 0.32 });
  const materials = [steel, darkSteel, zinc, brass, navy];

  // Screw: domed pan head with a Phillips cross, shank with a real helical thread, pointed tip.
  const screw = new THREE.Group();
  const shankLength = 36;
  const head = new THREE.Mesh(
    keep(
      new THREE.LatheGeometry(
        [
          new THREE.Vector2(0.01, 0),
          new THREE.Vector2(11, 0),
          new THREE.Vector2(11.4, 1.6),
          new THREE.Vector2(10.9, 4),
          new THREE.Vector2(8.7, 6.2),
          new THREE.Vector2(5, 7.4),
          new THREE.Vector2(0.01, 7.8),
        ],
        36
      )
    ),
    steel
  );
  head.position.y = shankLength / 2;
  screw.add(head);
  const slotGeometry = keep(new THREE.BoxGeometry(12.5, 1.5, 2.3));
  for (const turn of [0, Math.PI / 2]) {
    const slot = new THREE.Mesh(slotGeometry, darkSteel);
    slot.position.y = shankLength / 2 + 7.05;
    slot.rotation.y = turn;
    screw.add(slot);
  }
  screw.add(new THREE.Mesh(keep(new THREE.CylinderGeometry(3.9, 3.9, shankLength, 24)), steel));
  const thread = new THREE.Mesh(keep(new THREE.TubeGeometry(new Helix(4.2, shankLength - 3, 8), 260, 0.95, 6)), zinc);
  thread.position.y = -1;
  screw.add(thread);
  const tip = new THREE.Mesh(keep(new THREE.ConeGeometry(3.9, 10, 24)), steel);
  tip.rotation.x = Math.PI;
  tip.position.y = -shankLength / 2 - 5;
  screw.add(tip);

  const nut = new THREE.Mesh(keep(extrude(ringShape(15, 6.6, 6), 9, 1.3)), steel);
  const washer = new THREE.Mesh(keep(extrude(ringShape(14, 6.4), 2.2, 0.6)), zinc);
  const gear = new THREE.Group();
  gear.add(new THREE.Mesh(keep(extrude(gearShape(10, 22, 17, 6.2), 7, 1)), navy));
  const hub = new THREE.Mesh(keep(new THREE.TorusGeometry(8.4, 1.3, 10, 36)), steel);
  hub.scale.z = 2.6;
  gear.add(hub);
  const spring = new THREE.Mesh(keep(new THREE.TubeGeometry(new Helix(9, 42, 7), 320, 1.8, 10)), brass);

  const templates: Record<Kind, THREE.Object3D> = { screw, nut, washer, gear, spring };
  return { templates, geometries, materials };
}

function pickKind(): Kind {
  const roll = Math.random();
  if (roll < 0.3) return "screw";
  if (roll < 0.55) return "spring";
  if (roll < 0.72) return "nut";
  if (roll < 0.86) return "gear";
  return "washer";
}

const rand = (min: number, max: number) => min + Math.random() * (max - min);

export function createToyScene(container: HTMLElement, options: { small: boolean }): ToyScene | null {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
  } catch {
    return null; // No WebGL: the easter egg simply does not appear.
  }

  const { small } = options;
  const maxPieces = small ? 3 : 7;
  // The layer is fixed to the viewport; its client size excludes the scrollbar, so nothing stretches.
  let width = container.clientWidth || window.innerWidth;
  let height = container.clientHeight || window.innerHeight;

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2));
  renderer.setSize(width, height);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  const canvas = renderer.domElement;
  canvas.style.position = "absolute";
  canvas.style.inset = "0";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.pointerEvents = "none";
  if (!small) canvas.style.filter = "drop-shadow(0 10px 9px rgba(15, 30, 55, 0.22))";
  container.appendChild(canvas);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = environment;
  scene.add(new THREE.HemisphereLight(0xffffff, 0xb6c4d6, 0.7));
  const sun = new THREE.DirectionalLight(0xffffff, 1.7);
  sun.position.set(-320, 520, 900);
  scene.add(sun);

  const camera = new THREE.PerspectiveCamera(FOV, width / height, 1, 10000);
  const layoutCamera = () => {
    const distance = height / 2 / Math.tan(THREE.MathUtils.degToRad(FOV / 2));
    camera.position.set(0, 0, distance);
    camera.aspect = width / height;
    camera.near = Math.max(1, distance - 800);
    camera.far = distance + 800;
    camera.updateProjectionMatrix();
  };
  layoutCamera();

  const { templates, geometries, materials } = buildTemplates();
  const pieces: Piece[] = [];
  const box = new THREE.Box3();
  let frame = 0;
  let lastTime = 0;

  const render = () => renderer.render(scene, camera);

  const tick = (now: number) => {
    const dt = Math.min((now - lastTime) / 16.67, 3);
    lastTime = now;
    const floor = -height / 2 + 4;
    const left = -width / 2;
    const right = width / 2;

    for (let i = pieces.length - 1; i >= 0; i -= 1) {
      const p = pieces[i];
      const o = p.obj;
      p.age += dt * 16.67;

      if (p.vanishAt === null) {
        p.vy -= GRAVITY * dt;
        o.position.x += p.vx * dt;
        o.position.y += p.vy * dt;
        o.rotation.x += p.wx * dt;
        o.rotation.y += p.wy * dt;
        o.rotation.z += p.wz * dt;
      }

      // Springs stretch along their axis in flight and squash on landing.
      p.squash *= Math.pow(0.8, dt);
      if (p.kind === "spring") {
        const stretch = Math.min(Math.abs(p.vy) / 30, 0.25);
        o.scale.set(p.scale * (1 + p.squash * 0.18), p.scale * (1 + stretch - p.squash * 0.45), p.scale * (1 + p.squash * 0.18));
      }

      o.updateMatrixWorld(true);
      // Precise bounds (actual vertices) so parts touch the floor instead of hovering on their box.
      box.setFromObject(o, true);

      if (!p.entered && box.min.x > left && box.max.x < right) p.entered = true;
      if (p.entered && p.vanishAt === null) {
        if (box.min.x < left && p.vx < 0) p.vx = -p.vx * 0.7;
        if (box.max.x > right && p.vx > 0) p.vx = -p.vx * 0.7;
      }

      if (box.min.y < floor && p.vanishAt === null) {
        o.position.y += floor - box.min.y;
        if (p.vy < -1.8 && p.bounces < p.maxBounces) {
          p.vy = -p.vy * p.restitution;
          p.vx *= 0.82;
          // Each landing knocks the spin around a little, so pieces tumble rather than spin evenly.
          p.wx = p.wx * 0.7 + rand(-0.06, 0.06);
          p.wy = p.wy * 0.7 + rand(-0.06, 0.06);
          p.wz = p.wz * 0.7 + rand(-0.06, 0.06);
          p.bounces += 1;
          p.squash = 1;
        } else {
          p.vy = 0;
          p.vx *= 0.88;
          p.wx *= 0.85;
          p.wy *= 0.85;
          p.wz *= 0.85;
          p.vanishAt = p.age + 900;
        }
      }
      if (p.age > LIFETIME_MS && p.vanishAt === null) p.vanishAt = p.age;

      if (p.vanishAt !== null && p.age > p.vanishAt) {
        const t = Math.min((p.age - p.vanishAt) / VANISH_MS, 1);
        const s = p.scale * (1 - t * t);
        o.scale.setScalar(Math.max(s, 0.0001));
        o.rotation.y += 0.25 * dt;
        if (t >= 1) {
          scene.remove(o);
          pieces.splice(i, 1);
        }
      } else if (o.position.y < -height) {
        scene.remove(o);
        pieces.splice(i, 1);
      }
    }

    render();
    frame = pieces.length > 0 ? requestAnimationFrame(tick) : 0;
  };

  const spawn = () => {
    if (pieces.length >= maxPieces || document.hidden) return;
    const kind = pickKind();
    const obj = templates[kind].clone();
    const scale = small ? rand(0.85, 1.1) : rand(1.05, 1.45);
    obj.scale.setScalar(scale);
    obj.rotation.set(rand(0, Math.PI * 2), rand(0, Math.PI * 2), rand(0, Math.PI * 2));

    // Most parts drop from a random spot along the top; some are tossed in from either side.
    const tossed = Math.random() < 0.3;
    let vx: number;
    let vy: number;
    if (tossed) {
      const fromLeft = Math.random() < 0.5;
      obj.position.set(fromLeft ? -width / 2 - 50 : width / 2 + 50, rand(height * 0.05, height * 0.4), 0);
      vx = (fromLeft ? 1 : -1) * rand(small ? 2.5 : 4, small ? 4.5 : 7.5);
      vy = rand(2, 6);
    } else {
      obj.position.set(rand(-width * 0.44, width * 0.44), height / 2 + 70, 0);
      vx = rand(-1.4, 1.4);
      vy = -rand(0, 2);
    }

    const spin = kind === "spring" ? 0.05 : 0.14;
    scene.add(obj);
    pieces.push({
      obj,
      kind,
      vx,
      vy,
      wx: rand(-spin, spin),
      wy: rand(-spin, spin),
      wz: rand(-spin, spin),
      restitution: kind === "spring" ? 0.8 : kind === "washer" ? 0.35 : 0.45,
      bounces: 0,
      maxBounces: kind === "spring" ? 5 : 3,
      squash: 0,
      age: 0,
      vanishAt: null,
      scale,
      entered: !tossed,
    });

    if (!frame) {
      lastTime = performance.now();
      frame = requestAnimationFrame(tick);
    }
  };

  const onResize = () => {
    width = container.clientWidth || window.innerWidth;
    height = container.clientHeight || window.innerHeight;
    renderer.setSize(width, height);
    layoutCamera();
    if (!frame) render();
  };
  window.addEventListener("resize", onResize);

  const dispose = () => {
    if (frame) cancelAnimationFrame(frame);
    window.removeEventListener("resize", onResize);
    for (const p of pieces) scene.remove(p.obj);
    pieces.length = 0;
    for (const g of geometries) g.dispose();
    for (const m of materials) m.dispose();
    environment.dispose();
    pmrem.dispose();
    renderer.dispose();
    canvas.remove();
  };

  return { spawn, dispose };
}
