import Matter from "matter-js";

import decomp from "poly-decomp";
import { Common } from "matter-js";
Common.setDecomp?.(decomp);

import { InitMatterSceneProps } from "../../../types/matter.js";
import { BOUNDARY_THICKNESS } from "./constants";

export const initMatterScene = ({ targetElement }: InitMatterSceneProps) => {
  if (!targetElement.current) {
    throw new Error("targetElement.current is null");
  }

  const { clientWidth: containerWidth, clientHeight: containerHeight } =
    targetElement.current;

  const Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite;

  const engine = Engine.create({
    positionIterations: 10,  // Increase from default 6 for more stable collisions
    velocityIterations: 8,   // Increase from default 4 for better velocity resolution
    constraintIterations: 2, // Increase from default 2
    enableSleeping: true,    // Enable sleeping to reduce jitter on resting bodies
  });

  const render = Render.create({
    element: targetElement.current,
    engine: engine,
    options: {
      width: containerWidth,
      height: containerHeight,
      wireframes: false,
      background: "transparent",
      showAngleIndicator: false,  // Disable angle indicators
    },
  });

  const ground = Bodies.rectangle(
    containerWidth / 2,
    containerHeight + BOUNDARY_THICKNESS / 2,
    27184,
    BOUNDARY_THICKNESS,
    { isStatic: true, render: { fillStyle: "transparent", strokeStyle: "transparent", lineWidth: 0 } }
  );

  const leftWall = Bodies.rectangle(
    -BOUNDARY_THICKNESS / 2,
    containerHeight / 2,
    BOUNDARY_THICKNESS,
    containerWidth * 15,
    { isStatic: true, render: { fillStyle: "transparent", strokeStyle: "transparent", lineWidth: 0 } }
  );

  const rightWall = Bodies.rectangle(
    containerWidth + BOUNDARY_THICKNESS / 2,
    containerHeight / 2,
    BOUNDARY_THICKNESS,
    containerWidth * 15,
    { isStatic: true, render: { fillStyle: "transparent", strokeStyle: "transparent", lineWidth: 0 } }
  );

  Composite.add(engine.world, [ground, leftWall, rightWall]);

  return {
    engine,
    render,
    bounds: {
      ground,
      leftWall,
      rightWall,
    },
  };
};
