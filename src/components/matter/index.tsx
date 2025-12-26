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
} from "matter-js";
import { initMatterScene } from "@/utils/matter/initMatterScene";
import { handleCanvasResize } from "@/utils/matter/handleCanvasResize";
import { handleMouseInteraction } from "@/utils/matter/handleMouseInteraction";
import { useDataContext } from "@/context/DataContext";
import { loadSpriteDefs } from "@/utils/svg/loadSpriteDefs";
import { spawnBodyFromGeom } from "@/utils/matter/spawnFromGeom";
import { BOUNDARY_THICKNESS } from "@/utils/matter/constants";
import type { MatterCanvasHandle, CustomBody } from "../../../types/matter";

type TrinketData = {
  id: string;
  name: string;
  size: number;
  type: "static" | "interactive";
};

type MatterCanvasProps = {
  trinketData: TrinketData[];
  customBodies?: CustomBody[];
};

const MatterCanvas = forwardRef<MatterCanvasHandle, MatterCanvasProps>(
  ({ trinketData, customBodies = [] }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const engineRef = useRef<{
      engine: Engine;
      render: Render;
      runner: Runner;
    } | null>(null);

    // StrictMode init guard
    const didInitRef = useRef(false);

    // Readiness tracking
    const readyRef = useRef(false);
    const readyWaitersRef = useRef<Array<() => void>>([]);

    const { spriteData } = useDataContext();

    // Expose simplified API
    useImperativeHandle(
      ref,
      () => ({
        getEngine: () => engineRef.current?.engine ?? null,
        getRender: () => engineRef.current?.render ?? null,
        isReady: () => readyRef.current,
        awaitReady: () =>
          readyRef.current
            ? Promise.resolve()
            : new Promise<void>((resolve) => {
                readyWaitersRef.current.push(resolve);
              }),
      }),
      []
    );

    useEffect(() => {
      if (!spriteData.spriteSheet) return;
      if (didInitRef.current) return;
      didInitRef.current = true;
      const { engine, render, bounds } = initMatterScene({
        targetElement: containerRef,
      });
      render.options.wireframes = false;
      render.options.background = "transparent";
      const runner = Runner.create();

      handleMouseInteraction({ engine, render, container: containerRef });

      // Manual wrap implementation - wrap bodies that go out of bounds
      Matter.Events.on(engine, "afterUpdate", () => {
        const allBodies = Matter.Composite.allBodies(engine.world);
        allBodies.forEach((body) => {
          if (body.isStatic) return;

          const wrapBounds = (body as any).plugin?.wrapBounds;
          if (!wrapBounds) return;

          const { min, max } = wrapBounds;
          const { x, y } = body.position;
          let wrapped = false;
          let newX = x;
          let newY = y;

          // Wrap horizontally
          if (x > max.x) {
            newX = min.x;
            wrapped = true;
          } else if (x < min.x) {
            newX = max.x;
            wrapped = true;
          }

          // Wrap vertically
          if (y > max.y) {
            newY = min.y;
            wrapped = true;
          } else if (y < min.y) {
            newY = max.y;
            wrapped = true;
          }

          if (wrapped) {
            Matter.Body.setPosition(body, { x: newX, y: newY });
          }
        });
      });

      engineRef.current = { engine, render, runner };
      Render.run(render);
      Runner.run(runner, engine);

      (async () => {
        if (!spriteData.spriteSheet) return;
        const defs = await loadSpriteDefs(spriteData.spriteSheet);
        if (defs.size === 0) return;

        // Add navigation boundary FIRST - matching actual nav element
        const navElement = document.querySelector(".navigation") as HTMLElement;
        if (navElement) {
          const navRect = navElement.getBoundingClientRect();
          const canvasRect = render.canvas.getBoundingClientRect();

          // Convert nav position from viewport to canvas coordinates
          const navX = navRect.left - canvasRect.left + navRect.width / 2;
          const navY = navRect.top - canvasRect.top + navRect.height / 2;

          // Get border radius from computed styles
          const computedStyle = window.getComputedStyle(navElement);
          const borderRadius = parseFloat(computedStyle.borderRadius) || 38;

          const navBoundary = Matter.Bodies.rectangle(
            navX,
            navY,
            navRect.width,
            navRect.height,
            {
              isStatic: true,
              render: {
                fillStyle: "transparent",
                strokeStyle: "transparent",
                lineWidth: 0,
              },
              label: "nav-boundary",
              chamfer: { radius: borderRadius },
            }
          );
          Matter.Composite.add(engine.world, navBoundary);
        }

        // Add custom bodies
        customBodies.forEach((customBody) => {
          const width = customBody.width;
          const height = customBody.height;
          const x = customBody.position?.x ?? render.canvas.width / 2;
          const y = customBody.position?.y ?? render.canvas.height / 2;

          const body = Matter.Bodies.rectangle(x, y, width, height, {
            isStatic: customBody.isStatic ?? false,
            restitution: customBody.physics?.restitution ?? 0.8,
            friction: customBody.physics?.friction ?? 0.1,
            frictionAir: customBody.physics?.frictionAir ?? 0.02,
            render: {
              fillStyle: "transparent",
              strokeStyle: "transparent",
              lineWidth: 0,
            },
            label: customBody.label,
            chamfer: customBody.chamfer
              ? { radius: customBody.chamfer }
              : undefined,
            collisionFilter: customBody.disableMouseDrag
              ? {
                  category: 0x0002, // Different category
                  mask: 0xFFFFFFFF & ~0x0004, // Collide with everything except mouse
                }
              : {
                  category: 0x0001,
                  mask: 0xFFFFFFFF,
                },
            plugin: {
              customConfig: customBody,
              data: {
                viewBox: { x: 0, y: 0, w: width, h: height },
                scale: 1,
                collisionOffset: { x: 0, y: 0 },
              },
            },
          });

          Matter.Composite.add(engine.world, body);
        });

        // Spawn all trinkets immediately
        trinketData.forEach((trinket, i) => {
          const sym = defs.get(`${trinket.name}--collision`) || defs.get(trinket.name);
          if (!sym) return;

          const canvasWidth = render.canvas.width;
          const padding = canvasWidth * 0.2;
          const randomX = padding + Math.random() * (canvasWidth - padding * 2);
          const aboveScreen = -100;

          const body = spawnBodyFromGeom(
            engine,
            render,
            {
              index: i,
              sizeLevel: trinket.size,
              viewBox: sym.viewBox,
              collisionPathD: sym.collisionPathD,
              trinketName: trinket.name,
            },
            {
              mode: "manual",
              position: { x: randomX, y: aboveScreen },
              sampleLength: 10,
              showBody: false,
            }
          );

          if (body) {
            body.label = trinket.id;
          }
        });

        // Add ceiling and wrapping immediately
        const containerWidth = render.canvas.width;
        const ceiling = Matter.Bodies.rectangle(
          containerWidth / 2,
          -BOUNDARY_THICKNESS / 2,
          27184,
          BOUNDARY_THICKNESS,
          { isStatic: true, render: { fillStyle: "transparent" } }
        );
        Matter.Composite.add(engine.world, ceiling);

        const allBodies = Matter.Composite.allBodies(engine.world);
        allBodies.forEach((body) => {
          if (!body.isStatic && (body as any).plugin) {
            (body as any).plugin.wrapBounds = {
              min: { x: 0, y: 0 },
              max: { x: render.canvas.width, y: render.canvas.height },
            };
          }
        });

        readyRef.current = true;
        const waiters = [...readyWaitersRef.current];
        readyWaitersRef.current.length = 0;
        waiters.forEach((fn) => fn());
      })();

      const onResize = () => {
        handleCanvasResize({ container: containerRef, render, bounds, engine });
      };
      window.addEventListener("resize", onResize);

      return () => {
        window.removeEventListener("resize", onResize);
        Runner.stop(runner);
        Render.stop(render);
        if (engine.world) {
          World.clear(engine.world, false);
          Engine.clear(engine);
        }
        render.canvas.remove();
        (render as any).textures = {};
        readyRef.current = false;
        readyWaitersRef.current.length = 0;
        engineRef.current = null;
        didInitRef.current = false;
      };
    }, [trinketData, customBodies, spriteData.spriteSheet]);

    return <div className="matter-canvas" ref={containerRef} />;
  }
);

MatterCanvas.displayName = "MatterCanvas";
export default MatterCanvas;