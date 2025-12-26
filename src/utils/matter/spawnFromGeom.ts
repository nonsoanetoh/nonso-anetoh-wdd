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

export type SpawnMode = "sequential" | "stacked" | "manual";
export interface SpawnOptions {
  mode?: SpawnMode;
  offscreenMult?: number;
  zigzagMult?: number;
  stackStepMult?: number;
  restitution?: number;
  frictionAir?: number;
  friction?: number;
  sampleLength?: number;
  debug?: boolean;

  normalizeToViewCenter?: boolean;
  showBody?: boolean;
  position?: { x: number; y: number };
}

const widthPctForSize = (n: number) => Math.max(1, Math.min(5, n)) * 0.04;
const getCanvasWidth = (render?: Render) =>
  render?.options?.width ?? render?.canvas?.width ?? window.innerWidth;

const getSpawnPos = (
  index: number,
  halfW: number,
  halfH: number,
  render: Render | undefined,
  {
    mode = "sequential",
    offscreenMult = 2.5,
    zigzagMult = 0.5,
    stackStepMult = 0.75,
    position,
  }: SpawnOptions = {}
) => {
  if (mode === "manual" && position) {
    return position;
  }

  const cw = getCanvasWidth(render);
  const centerX = cw / 2;
  const unit = Math.max(halfW, halfH);
  const diameter = unit * 2;
  const offsetX = (index % 2 === 0 ? 1 : -1) * (zigzagMult * diameter);
  const baseY = -(offscreenMult * unit) - halfH;
  const y =
    mode === "stacked" ? baseY - index * (stackStepMult * diameter) : baseY;
  const x = centerX + offsetX;
  return { x, y };
};

const pathToVertices = (d: string, sample = 12): Vector[] => {
  const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
  p.setAttribute("d", d);

  let verts = Svg.pathToVertices(p, sample);

  if (
    verts.length &&
    (verts[0].x !== verts[verts.length - 1].x ||
      verts[0].y !== verts[verts.length - 1].y)
  ) {
    verts = [...verts, { x: verts[0].x, y: verts[0].y }];
  }

  verts = verts.filter((v, i, a) => {
    const prev = a[(i + a.length - 1) % a.length];
    return Math.hypot(v.x - prev.x, v.y - prev.y) > 1e-6;
  });

  return Vertices.clockwiseSort(verts);
};

export function spawnBodyFromGeom(
  engine: Matter.Engine,
  render: Matter.Render | undefined,
  {
    index,
    sizeLevel,
    viewBox,
    collisionPathD,
    trinketName,
  }: {
    index: number;
    sizeLevel: number;
    viewBox: { minX: number; minY: number; w: number; h: number };
    collisionPathD: string;
    trinketName: string;
  },
  opts: SpawnOptions = {}
): Matter.Body | null {
  const {
    sampleLength = 12,
    restitution = 0.2,        // Reduced from 0.6 to minimize bouncing
    frictionAir = 0.015,
    friction = 0.5,            // Keep at 0.5 for smooth dragging
    debug = false,
    normalizeToViewCenter = false,
    showBody = false,
  } = opts;

  if (!viewBox || viewBox.w <= 0 || viewBox.h <= 0) return null;

  const canvasW = getCanvasWidth(render);
  const targetW = widthPctForSize(sizeLevel) * canvasW;
  const scale = targetW / viewBox.w;
  const viewAspect = viewBox.h / viewBox.w;

  let verts = pathToVertices(collisionPathD, sampleLength);

  const originalCentroid = Vertices.centre(verts);

  verts = Vertices.scale(verts, scale, scale, { x: 0, y: 0 });

  if (viewBox.minX || viewBox.minY) {
    const tx = -viewBox.minX * scale;
    const ty = -viewBox.minY * scale;
    verts = verts.map((v) => ({ x: v.x + tx, y: v.y + ty }));
  }

  const artboardCenter = {
    x: viewBox.w / 2,
    y: viewBox.h / 2,
  };

  const collisionOffset = {
    x: (originalCentroid.x - artboardCenter.x) * scale,
    y: (originalCentroid.y - artboardCenter.y) * scale,
  };

  if (normalizeToViewCenter) {
    const c = Vertices.centre(verts);
    const viewCenter = {
      x: (viewBox.w * scale) / 2,
      y: (viewBox.h * scale) / 2,
    };
    const dx = viewCenter.x - c.x;
    const dy = viewCenter.y - c.y;
    verts = verts.map((v) => ({ x: v.x + dx, y: v.y + dy }));
  }

  const halfW = (viewBox.w * scale) / 2;
  const halfH = (viewBox.h * scale) / 2;
  const pos = getSpawnPos(index, halfW, halfH, render, opts);

  const renderStyle = debug
    ? {
        visible: true,
        fillStyle: "transparent",
        strokeStyle: "#0af",
        lineWidth: 1,
      }
    : showBody
      ? {
          visible: true,
          fillStyle: "#7d89ff",
          strokeStyle: "#1b1b1b",
          lineWidth: 1,
        }
      : {
          visible: true,
          fillStyle: "transparent",
          strokeStyle: "transparent",
          lineWidth: 0,
          opacity: 0,
        };

  const hasDecomp = !!(Common as any)._decomp || !!(globalThis as any).decomp;

  const body = hasDecomp
    ? (Bodies.fromVertices(pos.x, pos.y, [verts], {
        restitution,
        frictionAir,
        friction,
        render: renderStyle,
        sleepThreshold: 60,      // Higher threshold = sleeps faster when at rest
        density: 0.001,          // Lower density = lighter bodies, less force on collision
      }) as Body)
    : (() => {
        const vv = Vertices.create(
          verts as any,
          {} as any
        ) as unknown as Vertex[];
        const hull = Vertices.hull(vv).map((v) => ({
          x: (v as any).x,
          y: (v as any).y,
        }));
        return Bodies.fromVertices(pos.x, pos.y, [hull], {
          restitution,
          frictionAir,
          friction,
          render: renderStyle,
          sleepThreshold: 60,
          density: 0.001,
        }) as Body;
      })();

  if (!body) return null;

  (body as any).plugin = (body as any).plugin || {};
  (body as any).plugin.wrapBounds = {
    min: { x: 0, y: 0 },
    max: { x: canvasW, y: render?.options?.height ?? window.innerHeight },
  };

  (body as any).label = trinketName;
  (body as any).id = trinketName;
  (body as any).plugin.data = { viewBox, scale, collisionOffset };

  const followOffsetPx = {
    x: body.position.x - pos.x,
    y: body.position.y - pos.y,
  };

  (body as any).plugin ??= {};
  (body as any).plugin.followOffsetPx = followOffsetPx;
  (body as any).plugin.viewAspect = viewAspect;

  Matter.Body.setVelocity(body, { x: 0, y: 5 });

  Composite.add(engine.world, body);
  return body;
}
