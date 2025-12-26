import Matter from "matter-js";
import React from "react";
import LoadingBar from "@/components/trinket/loading-bar";

export type CustomTrinketDefinition = {
  id: string;
  createBody: (engine: Matter.Engine, render: Matter.Render) => Matter.Body;
  component: React.ReactNode;
};

/**
 * Define custom trinkets here - each one specifies:
 * 1. How to create the physics body
 * 2. What component to render visually
 */
export const customTrinkets: CustomTrinketDefinition[] = [
  {
    id: "loading-bar",
    createBody: (engine, render) => {
      const canvasWidth = render.canvas.width;
      const canvasHeight = render.canvas.height;

      const width = 400;
      const height = 10;
      const borderRadius = 20;

      // Position in upper area
      const x = canvasWidth / 2;
      const y = canvasHeight * 0.3;

      const body = Matter.Bodies.rectangle(x, y, width, height, {
        isStatic: false,
        restitution: 0.3,
        friction: 0.5,
        frictionAir: 0.015,
        density: 0.001,
        sleepThreshold: 60,
        label: "loading-bar",
        chamfer: { radius: borderRadius },
        render: {
          visible: true,
          fillStyle: "transparent",
          strokeStyle: "transparent",
          lineWidth: 0,
          opacity: 0,
        },
      });

      // Add metadata for Body component
      (body as any).plugin = (body as any).plugin || {};
      (body as any).plugin.data = {
        viewBox: { minX: 0, minY: 0, w: width, h: height },
        scale: 1,
        collisionOffset: { x: 0, y: 0 },
        isCustomTrinket: true,
      };

      Matter.Composite.add(engine.world, body);
      return body;
    },
    component: <LoadingBar />,
  },
];
