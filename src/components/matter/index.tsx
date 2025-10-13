// components/matter/index.tsx
"use client";
import React, {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import Matter, {
  Render,
  Runner,
  Engine,
  World,
  Composite,
  Events,
} from "matter-js";
import { initMatterScene } from "@/utils/matter/initMatterScene";
import { handleCanvasResize } from "@/utils/matter/handleCanvasResize";
import { handleMouseInteraction } from "@/utils/matter/handleMouseInteraction";
import { useDataContext } from "@/context/DataContext";
import { loadSpriteDefs } from "@/utils/svg/loadSpriteDefs";
import { spawnBodyFromGeom } from "@/utils/matter/spawnFromGeom";
import { ParsedTrinket } from "../../../types/trinket";
import type {
  MatterCanvasHandle,
  TickPayload,
  CollisionPayload,
} from "../../../types/matter";

type MatterCanvasProps = {
  trinketData: (ParsedTrinket & { ref?: React.RefObject<HTMLDivElement> })[];
};

// helper: measure path bbox with an offscreen SVG (only once, reused)
let __measureSvg: SVGSVGElement | null = null;
const ensureMeasureSvg = () => {
  if (__measureSvg) return __measureSvg;
  __measureSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  __measureSvg.setAttribute("width", "0");
  __measureSvg.setAttribute("height", "0");
  __measureSvg.style.position = "absolute";
  __measureSvg.style.left = "-99999px";
  __measureSvg.style.top = "-99999px";
  document.body.appendChild(__measureSvg);
  return __measureSvg;
};

type VB = { x: number; y: number; w: number; h: number };

function normalizeViewBox(vb: unknown): VB {
  if (!vb) return { x: 0, y: 0, w: 100, h: 100 };

  // object forms
  if (typeof vb === "object" && vb !== null) {
    const o = vb as any;

    // { x, y, w, h } or { x, y, width, height }
    if (
      "x" in o &&
      "y" in o &&
      ("w" in o || "width" in o) &&
      ("h" in o || "height" in o)
    ) {
      return {
        x: Number(o.x ?? 0),
        y: Number(o.y ?? 0),
        w: Number(o.w ?? o.width ?? 100),
        h: Number(o.h ?? o.height ?? 100),
      };
    }

    // { minX, minY, w|width, h|height }  or  { minX, minY, maxX, maxY }
    if ("minX" in o && "minY" in o) {
      const w =
        "w" in o
          ? Number(o.w)
          : "width" in o
            ? Number(o.width)
            : "maxX" in o
              ? Number(o.maxX) - Number(o.minX)
              : 100;

      const h =
        "h" in o
          ? Number(o.h)
          : "height" in o
            ? Number(o.height)
            : "maxY" in o
              ? Number(o.maxY) - Number(o.minY)
              : 100;

      return { x: Number(o.minX), y: Number(o.minY), w, h };
    }
  }

  // string or array "0 0 128 96" / [0,0,128,96]
  if (typeof vb === "string") {
    const [x, y, w, h] = vb.trim().split(/\s+/).map(Number);
    return { x: x ?? 0, y: y ?? 0, w: w ?? 100, h: h ?? 100 };
  }
  if (Array.isArray(vb)) {
    const [x, y, w, h] = (vb as any[]).map(Number);
    return { x: x ?? 0, y: y ?? 0, w: w ?? 100, h: h ?? 100 };
  }

  // fallback
  return { x: 0, y: 0, w: 100, h: 100 };
}

// compute normalized offset between path center and viewBox center
function computePathCenterOffsetNorm(
  viewBox: VB,
  d: string
): { dxNorm: number; dyNorm: number } {
  const svg = ensureMeasureSvg();
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", d);
  svg.appendChild(path);
  const bb = path.getBBox(); // requires element in DOM
  svg.removeChild(path);

  const pathCx = bb.x + bb.width / 2;
  const pathCy = bb.y + bb.height / 2;
  const vbCx = viewBox.x + viewBox.w / 2;
  const vbCy = viewBox.y + viewBox.h / 2;

  // normalize by viewBox size so we can turn into px later via wrapper size
  const dxNorm = (pathCx - vbCx) / viewBox.w;
  const dyNorm = (pathCy - vbCy) / viewBox.h;
  return { dxNorm, dyNorm };
}

const MatterCanvas = forwardRef<MatterCanvasHandle, MatterCanvasProps>(
  ({ trinketData }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const engineRef = useRef<{
      engine: Engine;
      render: Render;
      runner: Runner;
    } | null>(null);

    // 🚦 dev/StrictMode init guard
    const didInitRef = useRef(false);

    // listener registries
    const tickListenersRef = useRef(new Set<(e: TickPayload) => void>());
    const collisionStartRef = useRef(new Set<(e: CollisionPayload) => void>());
    const collisionActiveRef = useRef(new Set<(e: CollisionPayload) => void>());
    const collisionEndRef = useRef(new Set<(e: CollisionPayload) => void>());

    // readiness
    const readyRef = useRef(false);
    const readyWaitersRef = useRef<Array<() => void>>([]);

    const { spriteData } = useDataContext();

    // world → client mapping (relative to container)
    const worldToClient = (wx: number, wy: number) => {
      const stuff = engineRef.current;
      const cont = containerRef.current;
      if (!stuff || !cont) return { x: 0, y: 0 };

      const { render } = stuff;
      const { bounds, options, canvas } = render;
      const rw = options.width!,
        rh = options.height!;
      const cRect = canvas.getBoundingClientRect();
      const rootRect = cont.getBoundingClientRect();
      const scaleX = cRect.width / rw;
      const scaleY = cRect.height / rh;

      const lx = (wx - bounds.min.x) * (rw / (bounds.max.x - bounds.min.x));
      const ly = (wy - bounds.min.y) * (rh / (bounds.max.y - bounds.min.y));
      return {
        x: lx * scaleX + (cRect.left - rootRect.left),
        y: ly * scaleY + (cRect.top - rootRect.top),
      };
    };

    // Expose handle API
    useImperativeHandle(
      ref,
      () => ({
        getEngine: () => engineRef.current?.engine ?? null,
        getWorld: () => engineRef.current?.engine.world ?? null,
        getBodyById: (id: string) => {
          const world = engineRef.current?.engine.world;
          if (!world) return null;
          return Composite.allBodies(world).find((b) => b.label === id) ?? null;
        },
        getBodyDataById: <T = any,>(id: string): T | null => {
          const world = engineRef.current?.engine.world;
          if (!world) return null;
          const b = Composite.allBodies(world).find((x) => x.label === id);
          return (b as any)?.plugin?.data ?? null;
        },
        getBodyState: (id: string) => {
          const world = engineRef.current?.engine.world;
          if (!world) return null;
          const b = Composite.allBodies(world).find((x) => x.label === id);
          if (!b) return null;
          return {
            position: { x: b.position.x, y: b.position.y },
            angle: b.angle,
            velocity: { x: b.velocity.x, y: b.velocity.y },
            angularVelocity: b.angularVelocity,
            isSleeping: b.isSleeping,
          };
        },

        worldToClient,

        getBodyClientBox: (id: string) => {
          const world = engineRef.current?.engine.world;
          if (!world) return null;
          const b = Composite.allBodies(world).find((x) => x.label === id);
          if (!b) return null;

          const min = worldToClient(b.bounds.min.x, b.bounds.min.y);
          const max = worldToClient(b.bounds.max.x, b.bounds.max.y);
          const center = worldToClient(b.position.x, b.position.y);

          return {
            x: center.x,
            y: center.y,
            w: Math.abs(max.x - min.x),
            h: Math.abs(max.y - min.y),
            angle: b.angle,
          };
        },

        isReady: () => readyRef.current,
        awaitReady: () =>
          readyRef.current
            ? Promise.resolve()
            : new Promise<void>((resolve) => {
                readyWaitersRef.current.push(resolve);
              }),

        // Tick
        subscribe: (listener) => {
          tickListenersRef.current.add(listener);
          return () => tickListenersRef.current.delete(listener);
        },
        unsubscribe: (listener) => {
          tickListenersRef.current.delete(listener);
        },

        // Collisions
        subscribeCollisionStart: (listener) => {
          collisionStartRef.current.add(listener);
          return () => collisionStartRef.current.delete(listener);
        },
        subscribeCollisionActive: (listener) => {
          collisionActiveRef.current.add(listener);
          return () => collisionActiveRef.current.delete(listener);
        },
        subscribeCollisionEnd: (listener) => {
          collisionEndRef.current.add(listener);
          return () => collisionEndRef.current.delete(listener);
        },
        unsubscribeCollisionStart: (listener) => {
          collisionStartRef.current.delete(listener);
        },
        unsubscribeCollisionActive: (listener) => {
          collisionActiveRef.current.delete(listener);
        },
        unsubscribeCollisionEnd: (listener) => {
          collisionEndRef.current.delete(listener);
        },
      }),
      []
    );

    useEffect(() => {
      // 🚦 guard: prevent double init under React StrictMode in dev
      if (didInitRef.current) return;
      didInitRef.current = true;

      const { engine, render } = initMatterScene({
        targetElement: containerRef,
      });
      render.options.wireframes = false;
      render.options.background = "transparent";
      const runner = Runner.create();

      handleMouseInteraction({ engine, render, container: containerRef });

      engineRef.current = { engine, render, runner };
      Render.run(render);
      Runner.run(runner, engine);

      // snapshot listener sets for this effect instance
      const tickListeners = tickListenersRef.current;
      const startListeners = collisionStartRef.current;
      const activeListeners = collisionActiveRef.current;
      const endListeners = collisionEndRef.current;

      // per-tick broadcast
      const onAfterUpdate = (evt: Matter.IEventTimestamped<Engine>) => {
        const payload: TickPayload = {
          engine,
          world: engine.world,
          timestamp: evt.timestamp,
        };
        tickListeners.forEach((fn) => fn(payload));
      };
      Events.on(engine, "afterUpdate", onAfterUpdate);

      // collision broadcasts
      const mkCollisionPayload = (
        evt: Matter.IEventCollision<Engine>,
        phase: CollisionPayload["phase"]
      ): CollisionPayload => ({
        engine,
        world: engine.world,
        timestamp: evt.timestamp,
        pairs: evt.pairs,
        phase,
      });

      const onCollisionStart = (evt: Matter.IEventCollision<Engine>) => {
        const payload = mkCollisionPayload(evt, "start");
        startListeners.forEach((fn) => fn(payload));
      };
      const onCollisionActive = (evt: Matter.IEventCollision<Engine>) => {
        const payload = mkCollisionPayload(evt, "active");
        activeListeners.forEach((fn) => fn(payload));
      };
      const onCollisionEnd = (evt: Matter.IEventCollision<Engine>) => {
        const payload = mkCollisionPayload(evt, "end");
        endListeners.forEach((fn) => fn(payload));
      };

      Events.on(engine, "collisionStart", onCollisionStart);
      Events.on(engine, "collisionActive", onCollisionActive);
      Events.on(engine, "collisionEnd", onCollisionEnd);

      // spawn bodies
      (async () => {
        const defs = await loadSpriteDefs(spriteData.spriteSheet);

        trinketData.forEach((t, i) => {
          const baseName = Array.isArray(t.name) ? t.name[0] : t.name;
          const sym = defs.get(`${baseName}--collision`) || defs.get(baseName);
          if (!sym) {
            console.warn("No symbol found for", baseName);
            return;
          }

          // Expecting your defs to expose viewBox like { x, y, w, h } (we normalize)
          const vb = normalizeViewBox(sym.viewBox);
          const d = sym.collisionPathD ?? "";

          const body = spawnBodyFromGeom(
            engine,
            render,
            {
              index: i,
              sizeLevel: t.size ?? 3,
              viewBox: sym.viewBox,
              collisionPathD: sym.collisionPathD,
              trinketName: baseName,
            },
            {
              mode: "sequential",
              offscreenMult: 2.5,
              zigzagMult: 0.5,
              sampleLength: 10,
              showBody: true,
            }
          );
          if (!body) return;

          // Use readable label
          const label = baseName;
          body.label = label;

          // compute normalized offset (path center vs viewBox center)
          const { dxNorm, dyNorm } = computePathCenterOffsetNorm(vb, d);

          // Store metadata for the parent
          (body as any).plugin = (body as any).plugin || {};
          (body as any).plugin.data = {
            label,
            numericId: String(t.id),
            size: t.size,
            type: t.type,
            // normalized center offset in viewBox units (width/height)
            offsetNorm: { x: dxNorm, y: dyNorm },
          } as const;
        });

        // mark ready + resolve waiters
        readyRef.current = true;
        const waiters = [...readyWaitersRef.current];
        readyWaitersRef.current.length = 0;
        waiters.forEach((fn) => fn());
      })();

      const onResize = () => {
        handleCanvasResize({ container: containerRef, render, bounds: null });
      };
      window.addEventListener("resize", onResize);

      return () => {
        Events.off(engine, "afterUpdate", onAfterUpdate);
        Events.off(engine, "collisionStart", onCollisionStart);
        Events.off(engine, "collisionActive", onCollisionActive);
        Events.off(engine, "collisionEnd", onCollisionEnd);
        window.removeEventListener("resize", onResize);

        Runner.stop(runner);
        Render.stop(render);
        if (engine.world) {
          World.clear(engine.world, false);
          Engine.clear(engine);
        }
        render.canvas.remove();
        (render as any).textures = {};

        // clear the same snapshot references
        tickListeners.clear();
        startListeners.clear();
        activeListeners.clear();
        endListeners.clear();

        // reset readiness + init guard
        readyRef.current = false;
        readyWaitersRef.current.length = 0;
        engineRef.current = null;
        didInitRef.current = false;
      };
      // deps intentionally include both to support respawn on data/sheet change
    }, [trinketData, spriteData.spriteSheet]);

    return <div className="matter-canvas" ref={containerRef} />;
  }
);

MatterCanvas.displayName = "MatterCanvas";
export default MatterCanvas;
