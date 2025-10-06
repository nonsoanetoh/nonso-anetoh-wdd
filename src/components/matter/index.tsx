// components/matter/index.tsx
"use client";
import React, { useEffect, useRef } from "react";
import { Render, Runner, Engine, World, Body, Events } from "matter-js";
import { initMatterScene } from "@/utils/matter/initMatterScene";
import { handleCanvasResize } from "@/utils/matter/handleCanvasResize";
import { handleMouseInteraction } from "@/utils/matter/handleMouseInteraction";
import { useDataContext } from "@/context/DataContext";
import { loadSpriteDefs } from "@/utils/svg/loadSpriteDefs";
import { spawnBodyFromGeom } from "@/utils/matter/spawnFromGeom";
import { ParsedTrinket } from "../../../types/trinket";

type MatterCanvasProps = {
  trinketData: (ParsedTrinket & { ref?: React.RefObject<HTMLDivElement> })[];
};

type FollowTarget = {
  id: string;
  body: Body;
  el: HTMLDivElement;
  halfW: number;
  halfH: number;
  targetW: number;
  viewAspect: number;
};

const widthPctForSize = (n: number) => Math.max(1, Math.min(5, n)) * 0.04;

const MatterCanvas: React.FC<MatterCanvasProps> = ({ trinketData }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<{
    engine: Engine;
    render: Render;
    runner: Runner;
  } | null>(null);
  const followMapRef = useRef(new Map<string, FollowTarget>());

  const { spriteData } = useDataContext(); // { spriteSheet, collisionSheet } — we just need spriteSheet

  // world → container mapping + optional DOM-follow
  const updateTransforms = () => {
    const stuff = engineRef.current;
    if (!stuff) return;
    const { engine, render } = stuff;

    const { bounds, options, canvas } = render;
    const rw = options.width!,
      rh = options.height!;
    const cRect = canvas.getBoundingClientRect();
    const rootRect = containerRef.current!.getBoundingClientRect();
    const scaleX = cRect.width / rw;
    const scaleY = cRect.height / rh;

    const worldToContainer = (wx: number, wy: number) => {
      const lx = (wx - bounds.min.x) * (rw / (bounds.max.x - bounds.min.x));
      const ly = (wy - bounds.min.y) * (rh / (bounds.max.y - bounds.min.y));
      return {
        x: lx * scaleX + (cRect.left - rootRect.left),
        y: ly * scaleY + (cRect.top - rootRect.top),
      };
    };

    followMapRef.current.forEach(({ body, el, halfW, halfH }) => {
      const { x, y } = worldToContainer(body.position.x, body.position.y);
      const off = (body as any).plugin.followOffsetPx || { x: 0, y: 0 };
      el.style.transform = `translate3d(${x - halfW + off.x}px, ${y - halfH + off.y}px, 0) rotate(${body.angle}rad)`;
    });
  };

  useEffect(() => {
    const { engine, render } = initMatterScene({ targetElement: containerRef });
    render.options.wireframes = false;
    render.options.background = "transparent";
    const runner = Runner.create();

    handleMouseInteraction({ engine, render, container: containerRef });

    engineRef.current = { engine, render, runner };
    Render.run(render);
    Runner.run(runner, engine);

    const boundUpdate = () => updateTransforms();
    Events.on(engine, "afterUpdate", boundUpdate);

    (async () => {
      console.log("Loading sprite defs from", spriteData.spriteSheet);
      const defs = await loadSpriteDefs(spriteData.spriteSheet);

      trinketData.forEach((t, i) => {
        const baseName = Array.isArray(t.name) ? t.name[0] : t.name;
        const sym =
          defs.get(`${baseName}--collision`) || // prefer explicit collision symbol
          defs.get(baseName);

        if (!sym) {
          console.warn("No symbol found for", baseName);
          return;
        }

        const body = spawnBodyFromGeom(
          engine,
          render,
          {
            index: i,
            sizeLevel: t.size ?? 3,
            viewBox: sym.viewBox,
            collisionPathD: sym.collisionPathD,
            trinketName: Array.isArray(t.name) ? t.name[0] : t.name, // ✅ pass name/id here
          },
          {
            mode: "sequential",
            offscreenMult: 2.5,
            zigzagMult: 0.5,
            sampleLength: 10,
            showBody: !t.ref?.current,
          }
        );

        if (!body) return;
        body.label = t.id;

        console.log("Spawned body for", t.id, body);

        // Optional DOM-follow if you rendered a visual element for this trinket
        const el = t.ref?.current;
        if (el) {
          const canvasW = render.canvas.getBoundingClientRect().width;
          const targetW = widthPctForSize(t.size ?? 3) * canvasW;
          const viewAspect = sym.viewBox.h / sym.viewBox.w;
          el.style.position = "absolute";
          el.style.left = "0";
          el.style.top = "0";
          el.style.willChange = "transform";
          el.style.transformOrigin = "50% 50%";
          el.style.width = `${Math.max(8, Math.round(targetW))}px`;
          el.style.height = "auto";

          followMapRef.current.set(t.id, {
            id: t.id,
            body,
            el,
            halfW: targetW / 2,
            halfH: (targetW * viewAspect) / 2,
            targetW,
            viewAspect,
          });
        }
      });
    })();

    const onResize = () => {
      handleCanvasResize({ container: containerRef, render, bounds: null });
      // recompute sizes for followers (if any)
      followMapRef.current.forEach((f) => {
        const canvasW = render.canvas.getBoundingClientRect().width;
        f.targetW =
          widthPctForSize(trinketData.find((x) => x.id === f.id)?.size ?? 3) *
          canvasW;
        f.halfW = f.targetW / 2;
        f.halfH = (f.targetW * f.viewAspect) / 2;
        if (f.el) {
          f.el.style.width = `${Math.max(8, Math.round(f.targetW))}px`;
        }
      });
      updateTransforms();
    };
    window.addEventListener("resize", onResize);

    return () => {
      Events.off(engine, "afterUpdate", boundUpdate);
      followMapRef.current?.clear();
      window.removeEventListener("resize", onResize);
      Runner.stop(runner);
      Render.stop(render);
      if (engine.world) {
        World.clear(engine.world, false);
        Engine.clear(engine);
      }
      render.canvas.remove();
      (render as any).textures = {};
    };
  }, [trinketData, spriteData.spriteSheet]);

  return <div className="matter-canvas" ref={containerRef} />;
};

export default MatterCanvas;
