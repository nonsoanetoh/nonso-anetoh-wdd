// components/slices/home/index.tsx (or your Home slice path)
"use client";
import { Content } from "@prismicio/client";
import React, { FC, useEffect, useMemo, useRef, useState } from "react";
import { parseTrinkets } from "@/utils/trinkets";
import MatterCanvas from "../../matter";
import { ParsedTrinket } from "../../../../types/trinket";
import Trinket from "../../trinket";
import type { MatterCanvasHandle } from "../../../../types/matter";

type HomeSlice = Extract<Content.HeroSlice, { variation: "default" }>;

const Home: FC<{ data: HomeSlice }> = ({ data }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<MatterCanvasHandle | null>(null);
  const [canvasMounted, setCanvasMounted] = useState(false);

  // use a callback ref to avoid racing .current
  const setCanvasHandle = (node: MatterCanvasHandle | null) => {
    canvasRef.current = node;
    setCanvasMounted(!!node);
  };

  // parse once
  const parsed: ParsedTrinket[] = useMemo(
    () =>
      parseTrinkets([
        ...data.primary.trinkets,
        ...data.primary.interactive_trinkets,
      ]),
    [data]
  );

  // attach element refs to each wrapper
  const [trinketData] = useState<
    Array<ParsedTrinket & { ref: React.RefObject<HTMLDivElement> }>
  >(() =>
    parsed.map((t) => ({
      ...t,
      ref: React.createRef<HTMLDivElement>(),
    }))
  );

  useEffect(() => {
    let unsub: (() => void) | undefined;

    const run = async () => {
      if (!canvasRef.current) return;
      await canvasRef.current.awaitReady();

      // Prep wrappers
      trinketData.forEach((t) => {
        const el = t.ref?.current;
        if (!el) return;
        el.style.position = "absolute";
        el.style.left = "0";
        el.style.top = "0";
        el.style.willChange = "transform,width,height";
        el.style.transformOrigin = "50% 50%";
      });

      unsub = canvasRef.current.subscribe(() => {
        for (const t of trinketData) {
          const label = Array.isArray(t.name) ? t.name[0] : t.name;
          const el = t.ref?.current;
          if (!el) continue;

          const box = canvasRef.current!.getBodyClientBox(label);
          if (!box) {
            // Helpful once to catch mismatches, not spamming every frame:
            if (!el.dataset.warnedNoBody) {
              console.warn(
                `[Home] No body for label "${label}". Check body.label and names.`
              );
              el.dataset.warnedNoBody = "1";
            }
            continue;
          }

          // ✨ Set exact size every frame (cheap, and guarantees no 0s)
          el.style.width = `${Math.max(1, Math.round(box.w))}px`;
          el.style.height = `${Math.max(1, Math.round(box.h))}px`;

          // Center + rotate to match body
          el.style.transform = `translate3d(${box.x}px, ${box.y}px, 0) translate(-50%, -50%) rotate(${box.angle}rad)`;
        }
      });
    };

    run();
    return () => unsub?.();
  }, [trinketData]);

  useEffect(() => {
    let unsub: (() => void) | undefined;

    const run = async () => {
      if (!canvasRef.current) return;

      // wait for engine + spawn
      await canvasRef.current.awaitReady();

      // prep wrappers
      trinketData.forEach((t) => {
        const el = t.ref?.current;
        if (!el) return;
        el.style.position = "absolute";
        el.style.left = "0";
        el.style.top = "0";
        el.style.willChange = "transform";
        el.style.transformOrigin = "50% 50%";
      });

      // follow bodies by their readable label (sprite/class name)
      const unsub = canvasRef.current.subscribe(() => {
        for (const t of trinketData) {
          const label = Array.isArray(t.name) ? t.name[0] : t.name;
          const el = t.ref?.current;
          if (!el) continue;

          const body = canvasRef.current!.getBodyById(label);
          if (!body) continue;

          const meta: any = canvasRef.current!.getBodyDataById(label);
          const offsetNorm = meta?.offsetNorm || { x: 0, y: 0 };

          // wrapper dimensions (assumes you've set width via CSS/JS)
          const w = el.clientWidth || 1;
          const h = el.clientHeight || w; // fallback square if height auto

          // convert normalized offset to pixels (relative to wrapper size)
          // Note: dy is positive downward in screen coords; SVG viewBox uses same Y-down in browsers
          const offPxX = offsetNorm.x * w;
          const offPxY = offsetNorm.y * h;

          // rotate this local offset by the body's angle to keep it aligned when rotating
          const a = body.angle;
          const cos = Math.cos(a);
          const sin = Math.sin(a);
          const rotX = offPxX * cos - offPxY * sin;
          const rotY = offPxX * sin + offPxY * cos;

          // project world → client for the body center
          const { x, y } = canvasRef.current!.worldToClient(
            body.position.x,
            body.position.y
          );

          // apply: center at body, then add rotated offset, then rotate the wrapper
          el.style.transform = `translate3d(${x + rotX}px, ${y + rotY}px, 0) translate(-50%, -50%) rotate(${a}rad)`;
        }
      });
    };

    run();

    return () => {
      unsub?.();
    };
  }, [canvasMounted, trinketData]);

  return (
    <section
      data-slice-type={data.slice_type}
      data-slice-variation={data.variation}
      className="hero"
      ref={containerRef}
    >
      <div className="matter-container" style={{ position: "relative" }}>
        {trinketData.map((trinket) => (
          <div
            className="trinket"
            key={trinket.id}
            ref={trinket.ref}
            data-label={
              Array.isArray(trinket.name) ? trinket.name[0] : trinket.name
            }
          >
            <Trinket
              id={trinket.id}
              key={trinket.id}
              name={trinket.name}
              ref={trinket.ref}
              style={trinket.style}
              type={trinket.type}
              callback={trinket.callback}
              size={trinket.size}
            />
          </div>
        ))}

        <MatterCanvas ref={setCanvasHandle} trinketData={trinketData} />
      </div>
    </section>
  );
};

export default Home;
