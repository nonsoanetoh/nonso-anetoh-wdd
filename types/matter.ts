import Matter from "matter-js";
import { RefObject } from "react";

export type EngineContext = {
  engine: Matter.Engine | null;
  render: Matter.Render | null;
  runner: Matter.Runner | null;
  bounds: Boundary | null;
};

export type InitMatterSceneProps = {
  targetElement: RefObject<HTMLDivElement | null>;
};

type Boundary = {
  ground: Matter.Body | null;
  leftWall: Matter.Body | null;
  rightWall: Matter.Body | null;
};

export type HandleCanvasResizeProps = {
  container: RefObject<HTMLDivElement | null>;
  render: Matter.Render | null;
  bounds: Boundary | null;
};

export type MouseInteractionProps = {
  engine: Matter.Engine;
  render: Matter.Render;
  container?: RefObject<HTMLDivElement | null>;
};
