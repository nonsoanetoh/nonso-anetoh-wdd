"use client";
import { initMatterScene } from "@/utils/matter/initMatterScene";
import React, { useEffect, useRef } from "react";
import { EngineContext } from "../../../types/matter";
import { handleCanvasResize } from "@/utils/matter/handleCanvasResize";
import { Render, Runner, Engine, World, Events, Body } from "matter-js";
import { handleMouseInteraction } from "@/utils/matter/handleMouseInteraction";
import { ParsedTrinket } from "../../../types/trinket";
import { spawnBodyFromTrinketRef } from "@/utils/matter/spawnFromTrinket";

type MatterCanvasProps = {
  trinketData: ParsedTrinket[];
};

type FollowTarget = {
  id: string;
  body: Body;
  el: HTMLDivElement;
  halfW: number;
  halfH: number;
  targetW: number;
};

const widthPctForSize = (size01to05: number) =>
  Math.max(1, Math.min(5, size01to05)) * 0.04; // 1=>4%, 5=>20%

const getCanvasWidth = (render?: Render) =>
  render?.options?.width ?? render?.canvas?.width ?? window.innerWidth;

const MatterCanvas = ({ trinketData }: MatterCanvasProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineContext = useRef<EngineContext>({
    engine: null,
    render: null,
    runner: null,
    bounds: null,
  });

  // map from trinket id -> follow target
  const followMapRef = useRef(new Map<string, FollowTarget>());
  const resizeObsRef = useRef<ResizeObserver | null>(null);

  // rAF throttle
  const rafState = useRef({
    handle: 0 as number,
    frameStep: 1, // update every Nth frame when many trinkets
    frameCount: 0,
    running: false,
  });

  // compute and set the DOM size to match physics width rule
  const applyDomScaleForTrinket = (
    t: ParsedTrinket,
    el: HTMLDivElement,
    render: Render
  ) => {
    const canvasW = getCanvasWidth(render);
    const targetW = widthPctForSize(t.size ?? 3) * canvasW; // px
    // We scale the whole trinket wrapper; the inner SVG preserves aspect via viewBox
    el.style.width = `${Math.max(8, Math.round(targetW))}px`;
    el.style.height = "auto"; // let SVG aspect handle height
    return targetW;
  };

  // (re)measure a target’s half sizes after DOM size changes
  const measureTarget = (target: FollowTarget) => {
    // prefer the first *visible* inner svg (your main art)
    const innerSvg =
      target.el.querySelector('svg:not([data-collision="true"])') ||
      target.el.querySelector("svg");

    const box = (
      innerSvg as SVGGraphicsElement | null
    )?.getBoundingClientRect?.();
    const rect = box ?? target.el.getBoundingClientRect();

    target.halfW = rect.width / 2;
    target.halfH = rect.height / 2;
  };

  // start a single rAF loop that applies transforms for all trinkets
  const startRAF = () => {
    if (rafState.current.running) return;
    rafState.current.running = true;

    const tick = () => {
      const { render } = engineContext.current;
      if (!render) return;

      // simple adaptive throttling: more trinkets => lower DOM update rate
      const size = followMapRef.current.size;
      const desiredStep = size > 120 ? 3 : size > 60 ? 2 : 1;
      rafState.current.frameStep = desiredStep;

      rafState.current.frameCount =
        (rafState.current.frameCount + 1) % rafState.current.frameStep;
      const shouldUpdate = rafState.current.frameCount === 0;

      if (shouldUpdate) {
        const bounds = render.bounds;
        const rw = render.options.width!;
        const rh = render.options.height!;
        const sx = rw / (bounds.max.x - bounds.min.x);
        const sy = rh / (bounds.max.y - bounds.min.y);

        followMapRef.current.forEach(({ body, el, halfW, halfH }) => {
          const x = (body.position.x - bounds.min.x) * sx;
          const y = (body.position.y - bounds.min.y) * sy;

          // plugin offset from the spawner (centroid - viewBox center), if available
          const off = (body as any).plugin?.followOffsetPx || { x: 0, y: 0 };

          // additional vertical shift: move up by 50% of element height
          const verticalShift = 0.5 * (halfH * 2); // = -halfH * 1.0 in translate coordinates below

          // Center on body, apply offsets, rotate around center
          el.style.transform = `translate3d(${x - halfW + off.x}px, ${y - halfH + off.y + verticalShift}px, 0) rotate(${body.angle}rad)`;
        });
      }

      rafState.current.handle = requestAnimationFrame(tick);
    };

    rafState.current.handle = requestAnimationFrame(tick);
  };

  const stopRAF = () => {
    if (!rafState.current.running) return;
    cancelAnimationFrame(rafState.current.handle);
    rafState.current.running = false;
  };

  useEffect(() => {
    const { engine, render, bounds } = initMatterScene({
      targetElement: containerRef,
    });

    // Make fills visible over wireframes
    render.options.wireframes = false;
    render.options.background = "transparent";

    engineContext.current = { engine, render, runner: null, bounds };

    handleMouseInteraction({
      engine: engineContext.current.engine!,
      render: engineContext.current.render!,
      container: containerRef,
    });

    // spawn trinket bodies and bind DOM followers
    const DELAY_MS = 300;

    trinketData.forEach((t, i) => {
      setTimeout(() => {
        const el = t.ref.current;
        if (!el) return;

        // ensure DOM element is absolutely positioned and GPU-friendly
        el.style.position = "absolute";
        el.style.left = "0px";
        el.style.top = "0px";
        el.style.willChange = "transform";

        // Set DOM width to match physics rule (size → % canvas width)
        const targetW = applyDomScaleForTrinket(t, el, render);

        spawnBodyFromTrinketRef(
          engineContext.current.engine!,
          engineContext.current.render!,
          t.ref,
          i,
          t.size ?? 3,
          {
            mode: "sequential",
            offscreenMult: 2.5,
            zigzagMult: 0.5,
            sampleLength: 10,
          }
        ).then((body) => {
          if (!body) {
            console.warn(`Failed to spawn body for trinket ${t.id}`);
            return;
          }

          body.label = t.id;

          const target: FollowTarget = {
            id: t.id,
            body,
            el,
            halfW: 0,
            halfH: 0,
            targetW,
          };
          measureTarget(target);
          followMapRef.current.set(t.id, target);
        });
      }, i * DELAY_MS);
    });

    // renderer
    Render.run(render);
    const runner = Runner.create();
    engineContext.current.runner = runner;
    Runner.run(runner, engine);

    // single rAF updater for all trinkets
    startRAF();

    // keep sizes fresh on canvas resize
    const onResize = () => {
      handleCanvasResize({
        container: containerRef,
        render: engineContext.current.render,
        bounds: engineContext.current.bounds,
      });

      // update each DOM trinket width to match new canvas width, then re-measure
      followMapRef.current.forEach((target) => {
        const t = trinketData.find((x) => x.id === target.id);
        if (!t) return;
        target.targetW = applyDomScaleForTrinket(t, target.el, render);
        measureTarget(target);
      });
    };
    window.addEventListener("resize", onResize);

    // observe DOM trinkets for intrinsic size changes (e.g., different symbol variants)
    if ("ResizeObserver" in window) {
      resizeObsRef.current = new ResizeObserver((entries) => {
        for (const entry of entries) {
          // find which target this element belongs to
          const pair = Array.from(followMapRef.current.values()).find(
            (p) => p.el === entry.target
          );
          if (!pair) continue;
          measureTarget(pair);
        }
      });

      trinketData.forEach((t) => {
        const el = t.ref.current;
        if (el) resizeObsRef.current!.observe(el);
      });
    }

    // Capture the current followMapRef value for cleanup
    const followMap = followMapRef.current;

    return () => {
      stopRAF();
      resizeObsRef.current?.disconnect();
      followMap.clear();

      window.removeEventListener("resize", onResize);
      Runner.stop(engineContext.current.runner!);
      Render.stop(render);
      if (engineContext.current.engine && engineContext.current.engine.world) {
        World.clear(engineContext.current.engine.world, false);
        Engine.clear(engineContext.current.engine);
      }
      render.canvas.remove();
      render.textures = {};
    };
  }, [trinketData]);

  return (
    <div
      className="matter-canvas"
      style={{ zIndex: 4999990000 }}
      ref={containerRef}
    />
  );
};

export default MatterCanvas;
