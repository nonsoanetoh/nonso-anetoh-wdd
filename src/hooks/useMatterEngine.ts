import { useEffect, useRef } from "react";
import Matter from "matter-js";

interface UseMatterEngineOptions {
  container: HTMLDivElement | null;
  canvasEl: HTMLDivElement | null;
  debug?: boolean;
}

export const useMatterEngine = ({
  container,
  canvasEl,
  debug,
}: UseMatterEngineOptions) => {
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);

  useEffect(() => {
    if (!container || !canvasEl) return;

    const engine = Matter.Engine.create();
    const render = Matter.Render.create({
      element: canvasEl,
      engine,
      options: {
        width: container.clientWidth,
        height: container.clientHeight,
        wireframes: debug ?? false,
        background: "transparent",
      },
    });

    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);
    Matter.Render.run(render);

    engineRef.current = engine;
    renderRef.current = render;
    runnerRef.current = runner;

    return () => {
      Matter.Render.stop(render);
      if (runnerRef.current) {
        Matter.Runner.stop(runnerRef.current);
      }
      Matter.World.clear(engine.world, false);
      Matter.Engine.clear(engine);
    };
  }, [container, canvasEl, debug]);

  return { engine: engineRef.current, render: renderRef.current };
};
