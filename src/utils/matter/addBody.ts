import { Bodies, Body, Composite, Render, Vertices } from "matter-js";

/** Dimensions the spawner needs, regardless of shape */
type ShapeMetrics = { halfWidth: number; halfHeight: number };

type SpawnMode = "sequential" | "stacked";

interface SpawnOptions {
  mode?: SpawnMode; // "sequential" -> same Y, use timeout; "stacked" -> stagger Y by index
  offscreenMult?: number; // how many "units" above the top to spawn
  zigzagMult?: number; // horizontal offset in diameters (2*unit)
  stackStepMult?: number; // vertical step per index in diameters (only in "stacked")
  restitution?: number;
  frictionAir?: number;
  friction?: number;
}

/** Generic spawn position calculator (shape-agnostic) */
function getSpawnPos(
  index: number,
  metrics: ShapeMetrics,
  render?: Render,
  {
    mode = "sequential",
    offscreenMult = 2.5,
    zigzagMult = 0.5,
    stackStepMult = 0.75,
  }: SpawnOptions = {}
) {
  const canvasWidth =
    render?.options?.width ?? render?.canvas?.width ?? window.innerWidth;
  const centerX = canvasWidth / 2;

  const unit = Math.max(metrics.halfWidth, metrics.halfHeight); // “radius-like” scaler
  const diameter = unit * 2;

  // even -> right, odd -> left
  const offsetX = (index % 2 === 0 ? 1 : -1) * (zigzagMult * diameter);

  // Ensure the whole shape starts offscreen: go above by (offscreenMult * unit) and
  // also subtract its halfHeight so its bottom is still above 0.
  const baseY = -(offscreenMult * unit) - metrics.halfHeight;

  const y =
    mode === "stacked" ? baseY - index * (stackStepMult * diameter) : baseY;
  const x = centerX + offsetX;

  return { x, y };
}

/** Circle helper: just feed metrics and create the body */
export function spawnCircle(
  engine: Matter.Engine,
  index: number,
  radius: number,
  render?: Render,
  opts: SpawnOptions = {}
) {
  const metrics: ShapeMetrics = { halfWidth: radius, halfHeight: radius };
  const { x, y } = getSpawnPos(index, metrics, render, opts);

  const circle = Bodies.circle(x, y, radius, {
    restitution: opts.restitution ?? 0.9,
    frictionAir: opts.frictionAir ?? 0.01,
    friction: opts.friction ?? 0.3,
  });

  Composite.add(engine.world, circle);
}

/** Rectangle helper */
export function spawnRect(
  engine: Matter.Engine,
  index: number,
  width: number,
  height: number,
  render?: Render,
  opts: SpawnOptions = {}
) {
  const metrics: ShapeMetrics = {
    halfWidth: width / 2,
    halfHeight: height / 2,
  };
  const { x, y } = getSpawnPos(index, metrics, render, opts);

  const rect = Bodies.rectangle(x, y, width, height, {
    restitution: opts.restitution ?? 0.9,
    frictionAir: opts.frictionAir ?? 0.01,
    friction: opts.friction ?? 0.3,
  });

  Composite.add(engine.world, rect);
}

/** SVG (from vertices) helper
 * - supply the intended bounds (after any scaling) so spawn metrics are correct
 * - create the body at (x,y) returned by getSpawnPos
 */
export function spawnFromVertices(
  engine: Matter.Engine,
  index: number,
  vertices: Matter.Vector[], // already scaled vertices
  boundsWidth: number, // expected width of the shape
  boundsHeight: number, // expected height of the shape
  render?: Render,
  opts: SpawnOptions = {}
) {
  const metrics: ShapeMetrics = {
    halfWidth: boundsWidth / 2,
    halfHeight: boundsHeight / 2,
  };
  const { x, y } = getSpawnPos(index, metrics, render, opts);

  // Matter.Bodies.fromVertices expects world coords for centroid; using x,y from spawn
  const body = Bodies.fromVertices(x, y, [vertices], {
    restitution: opts.restitution ?? 0.9,
    frictionAir: opts.frictionAir ?? 0.01,
    friction: opts.friction ?? 0.3,
  });

  Composite.add(engine.world, body);
}
