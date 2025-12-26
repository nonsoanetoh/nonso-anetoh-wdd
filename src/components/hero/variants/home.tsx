"use client";
import { Content } from "@prismicio/client";
import React, { FC, useEffect, useMemo, useState } from "react";
import { parseTrinkets } from "@/utils/trinkets";
import MatterCanvas from "../../matter";
import Body from "../../body";
import Trinket from "../../trinket";
import type { MatterCanvasHandle } from "../../../../types/matter";
import Matter from "matter-js";
import { useDataContext } from "@/context/DataContext";
import LoadingBar from "@/components/trinket/loading-bar";
import CheckeredCanvas from "@/components/checkered-canvas";

type HomeSlice = Extract<Content.HeroSlice, { variation: "default" }>;

const Home: FC<{ data: HomeSlice }> = ({ data }) => {
  const canvasRef = React.useRef<MatterCanvasHandle | null>(null);
  const [bodies, setBodies] = useState<Matter.Body[]>([]);
  const [overlayOpacity, setOverlayOpacity] = useState(100);
  const { setIsFirstVisit } = useDataContext();

  const triggerTimeScaleEffect = (
    intensity: "low" | "medium" | "high" = "high"
  ) => {
    const engine = canvasRef.current?.getEngine();
    if (!engine) return;

    const intensitySettings = {
      low: { minScale: 0.3, duration: 1200 },
      medium: { minScale: 0.15, duration: 1500 },
      high: { minScale: 0.05, duration: 2000 },
    };

    const settings = intensitySettings[intensity];
    engine.timing.timeScale = settings.minScale;

    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / settings.duration;

      if (progress < 1) {
        const easeOut = 1 - Math.pow(1 - progress, 3);
        engine.timing.timeScale =
          settings.minScale + (1 - settings.minScale) * easeOut;
        requestAnimationFrame(animate);
      } else {
        engine.timing.timeScale = 1;
      }
    };

    requestAnimationFrame(animate);
  };

  const handleTriangleClick = () => {
    triggerTimeScaleEffect("high");
  };

  const trinketData = useMemo(() => {
    const parsed = parseTrinkets([
      ...data.primary.trinkets,
      ...data.primary.interactive_trinkets,
    ]);

    return parsed.map(
      (t: { name: any[]; id: any; size: any; style: string }) => {
        const name = Array.isArray(t.name) ? t.name[0] : t.name;
        return {
          id: `${name}-${t.id}`,
          name,
          size: t.size || 2,
          type: t.style as "static" | "interactive",
        };
      }
    );
  }, [data]);

  const customBodies = useMemo(() => {
    const loadingBarWidth = Math.min(
      typeof window !== "undefined" ? window.innerWidth - 96 : 720,
      720
    );
    const loadingBarHeight = 48;

    return [
      {
        label: "loading-bar",
        width: loadingBarWidth,
        height: loadingBarHeight,
        isStatic: false,
        disableMouseDrag: true,
        physics: {
          restitution: 0.8,
          friction: 0.1,
          frictionAir: 0.02,
        },
        chamfer: 8,
      },
    ];
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsFirstVisit(false);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [setIsFirstVisit]);

  useEffect(() => {
    let mounted = true;
    let intervalId: NodeJS.Timeout;

    const startPolling = async () => {
      await canvasRef.current?.awaitReady();
      if (!mounted) return;

      const engine = canvasRef.current?.getEngine();
      if (!engine) return;

      intervalId = setInterval(() => {
        if (!mounted) return;

        const allBodies = Matter.Composite.allBodies(engine.world).filter(
          (body) => !body.isStatic
        );

        setBodies((prevBodies) => {
          if (prevBodies.length !== allBodies.length) {
            return allBodies;
          }
          return allBodies;
        });
      }, 100);
    };

    startPolling();

    return () => {
      mounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [trinketData]);

  return (
    <section
      data-slice-type={data.slice_type}
      data-slice-variation={data.variation}
      className="hero"
    >
      <div className="matter-container" style={{ position: "relative" }}>
        <CheckeredCanvas overlayOpacity={overlayOpacity} />
        {bodies.map((body) => {
          if (body.label === "loading-bar") {
            return (
              <Body key="loading-bar" body={body}>
                {() => (
                  <LoadingBar
                    value={overlayOpacity}
                    onChange={setOverlayOpacity}
                  />
                )}
              </Body>
            );
          }

          const trinket = trinketData.find(
            (t: { id: string }) => t.id === body.label
          );
          if (!trinket) return null;

          const isTriangle = trinket.name.includes("triangle");

          return (
            <Body
              key={trinket.id}
              body={body}
              onBodyClick={isTriangle ? handleTriangleClick : undefined}
            >
              {({ wasClicked }) => (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    outline: wasClicked ? "3px solid red" : "none",
                    transition: "outline 0.1s",
                    position: "relative",
                    zIndex: 10,
                  }}
                >
                  <Trinket
                    id={trinket.id}
                    name={trinket.name}
                    type={trinket.type}
                  />
                </div>
              )}
            </Body>
          );
        })}

        {/* Manually created trinkets - LoadingBar now renders via physics body */}
        {/* <MousePosition parameter={"x"} />
        <MousePosition parameter={"y"} />
        <ScrollIndicator />
        <ColorBlock />
        <MemeBlock />
        <Location /> */}

        <MatterCanvas
          ref={canvasRef}
          trinketData={trinketData}
          customBodies={customBodies}
        />
      </div>
    </section>
  );
};

export default Home;
