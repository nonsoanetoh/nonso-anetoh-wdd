// types/matter.ts
import type Matter from "matter-js";
import { RefObject } from "react";

export type TickPayload = {
  engine: Matter.Engine;
  world: Matter.World;
  timestamp: number;
};

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

export type CollisionPayload = {
  engine: Matter.Engine;
  world: Matter.World;
  timestamp: number;
  pairs: Matter.Pair[];
  phase: "start" | "active" | "end";
};

export type MouseInteractionProps = {
  engine: Matter.Engine;
  render: Matter.Render;
  container?: RefObject<HTMLDivElement | null>;
};

export type ScreenPoint = { x: number; y: number };

// Simplified API for the new architecture
export type MatterCanvasHandle = {
  getEngine(): Matter.Engine | null;
  isReady(): boolean;
  awaitReady(): Promise<void>;
};