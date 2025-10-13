/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
// utils/matter/spawnFromTrinket.ts
import Matter, {
  Bodies,
  Body,
  Composite,
  Svg,
  Vertices,
  Render,
  Common,
  Vector,
  Vertex,
} from "matter-js";

export type SpawnMode = "sequential" | "stacked";
export interface SpawnOptions {
  mode?: SpawnMode;
  offscreenMult?: number;
  zigzagMult?: number;
  stackStepMult?: number;
  restitution?: number;
  frictionAir?: number;
  friction?: number;
  sampleLength?: number;
  retries?: number;
  retryDelayMs?: number;
  debug?: boolean;
}

type ShapeMetrics = { halfWidth: number; halfHeight: number };

const getCanvasWidth = (render?: Render) =>
  render?.options?.width ?? render?.canvas?.width ?? window.innerWidth;

// size: 1..5  => width: 4%..20% canvas
const widthPctForSize = (size01to05: number) =>
  Math.max(1, Math.min(5, size01to05)) * 0.04;

const parseViewBox = (svg: SVGSVGElement): { w: number; h: number } | null => {
  const vb = svg.getAttribute("viewBox");
  if (!vb) return null;
  const parts = vb.trim().split(/\s+/).map(Number);
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return null;
  const [, , w, h] = parts;
  return { w, h };
};

const ensureClosed = (verts: Vector[]): Vector[] => {
  if (verts.length < 2) return verts;
  const a = verts[0];
  const b = verts[verts.length - 1];
  if (a.x === b.x && a.y === b.y) return verts;
  return [...verts, { x: a.x, y: a.y }];
};

// Vector[] -> Vector[] using Vertices.create (dummy body is fine)
const toVertices = (pts: Vector[]): Vector[] =>
  Vertices.create(pts, {} as unknown as Body);

const getSpawnPos = (
  index: number,
  metrics: ShapeMetrics,
  render: Render | undefined,
  {
    mode = "sequential",
    offscreenMult = 2.5,
    zigzagMult = 0.5,
    stackStepMult = 0.75,
  }: SpawnOptions = {}
) => {
  const canvasWidth = getCanvasWidth(render);
  const centerX = canvasWidth / 2;

  const unit = Math.max(metrics.halfWidth, metrics.halfHeight);
  const diameter = unit * 2;

  const offsetX = (index % 2 === 0 ? 1 : -1) * (zigzagMult * diameter);
  const baseY = -(offscreenMult * unit) - metrics.halfHeight;

  const y =
    mode === "stacked" ? baseY - index * (stackStepMult * diameter) : baseY;
  const x = centerX + offsetX;
  return { x, y };
};

/**
 * Spawn a physics body from the trinket's collision <path>.
 * - sizeLevel (1..5): 5 => 20% canvas width, 1 => 4%.
 * - Cleans/closes vertices; concave via poly-decomp if available.
 * - Stores (centroid - viewCenter) pixel offset on body.plugin.followOffsetPx
 *   so DOM can perfectly center on the physics body.
 */
export async function spawnBodyFromTrinketRef(
  engine: Matter.Engine,
  render: Matter.Render | undefined,
  trinketRef: React.RefObject<HTMLDivElement>,
  index: number,
  sizeLevel: number,
  opts: SpawnOptions = {}
): Promise<Matter.Body | null> {
  const {
    sampleLength = 12,
    retries = 10,
    retryDelayMs = 30,
    restitution = 0.9,
    frictionAir = 0.01,
    friction = 0.3,
    debug = false,
  } = opts;

  // Wait briefly for the collision SVG
  let root: HTMLDivElement | null = null;
  for (let i = 0; i <= retries; i++) {
    root = trinketRef.current;
    if (root?.querySelector('svg[data-collision="true"] path')) break;
    // eslint-disable-next-line no-await-in-loop
    await new Promise((r) => setTimeout(r, retryDelayMs));
  }
  if (!root) return null;

  const collisionSvg = root.querySelector(
    'svg[data-collision="true"]'
  ) as SVGSVGElement | null;
  const pathEl = collisionSvg?.querySelector("path") as SVGPathElement | null;
  if (!collisionSvg || !pathEl) return null;

  const vb = parseViewBox(collisionSvg);
  if (!vb || vb.w <= 0 || vb.h <= 0) return null;

  // Target width from canvas & size
  const canvasWidth = getCanvasWidth(render);
  const targetWidth = widthPctForSize(sizeLevel) * canvasWidth;
  const scale = targetWidth / vb.w;

  // Build & clean vertices (in scaled pixel space)
  let verts = Svg.pathToVertices(pathEl, sampleLength);
  verts = ensureClosed(verts);
  verts = Vertices.scale(verts, scale, scale, { x: 0, y: 0 });
  // remove tiny degenerate edges
  verts = verts.filter((v, i, a) => {
    const prev = a[(i + a.length - 1) % a.length];
    return Math.hypot(v.x - prev.x, v.y - prev.y) > 1e-6;
  });
  // consistent winding
  verts = Vertices.clockwiseSort(verts);

  // Compute viewBox-center ↔ path-centroid offset (in pixels)
  const centroid = Vertices.centre(verts); // scaled space
  const viewCenter = { x: (vb.w * scale) / 2, y: (vb.h * scale) / 2 };

  // Spawn metrics after scaling
  const metrics: ShapeMetrics = {
    halfWidth: (vb.w * scale) / 2,
    halfHeight: (vb.h * scale) / 2,
  };
  const pos = getSpawnPos(index, metrics, render, opts);

  // Decomp availability
  const hasDecomp = !!(Common as any)._decomp || !!(globalThis as any).decomp;

  // Always pass a render object
  const renderStyle = debug
    ? {
        visible: true,
        fillStyle: "transparent",
        strokeStyle: "#0af",
        lineWidth: 1,
      }
    : {
        visible: false,
        fillStyle: "#000000",
        strokeStyle: "#000000",
        lineWidth: 1,
      };

  let body: Body | null;

  if (hasDecomp) {
    body = Bodies.fromVertices(pos.x, pos.y, [verts], {
      restitution,
      frictionAir,
      friction,
      render: renderStyle,
      collisionFilter: { category: 0x0001, mask: 0xffff, group: 0 },
    }) as Body;
  } else {
    // Convex fallback: Vector[] -> Vertex[] -> hull -> Vector[]
    const vertsAsVertices = toVertices(verts);
    const hullVertices: Vertex[] = Vertices.hull(vertsAsVertices as Vertex[]);
    const hullVectors: Vector[] = hullVertices.map((v) => ({ x: v.x, y: v.y }));
    body = Bodies.fromVertices(pos.x, pos.y, [hullVectors], {
      restitution,
      frictionAir,
      friction,
      render: renderStyle,
      collisionFilter: { category: 0x0001, mask: 0xffff, group: 0 },
    }) as Body;
  }

  if (!body) return null;

  // Make visible in Matter debug if you want
  body.render.visible = true;
  body.render.fillStyle = "#7d89ff";
  body.render.strokeStyle = "#1b1b1b";
  body.render.lineWidth = 1;

  const viewAspect = vb.h / vb.w;

  const bodyCentroid = body.position; // body world centroid (local = before add)
  const followOffsetPx = {
    x: bodyCentroid.x - pos.x,
    y: bodyCentroid.y - pos.y,
  };

  (body as any).plugin ??= {};
  (body as any).plugin.followOffsetPx = followOffsetPx;
  (body as any).plugin.viewAspect = vb.h / vb.w;

  Composite.add(engine.world, body);
  return body;
}
