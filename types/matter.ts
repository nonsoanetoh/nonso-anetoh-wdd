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

export type MatterCanvasHandle = {
  // core accessors
  getEngine(): Matter.Engine | null;
  getWorld(): Matter.World | null;

  // lookups use body.label (we set this to the trinket's readable name)
  getBodyById(id: string): Matter.Body | null;
  getBodyDataById<T = any>(id: string): T | null;
  getBodyState(id: string): {
    position: { x: number; y: number };
    angle: number;
    velocity: { x: number; y: number };
    angularVelocity: number;
    isSleeping: boolean;
  } | null;

  // coords mapping for DOM overlays
  worldToClient(wx: number, wy: number): ScreenPoint;
  getBodyClientBox(
    id: string
  ): { x: number; y: number; w: number; h: number; angle: number } | null;

  // readiness
  isReady(): boolean;
  awaitReady(): Promise<void>;

  // per-tick (afterUpdate)
  subscribe(listener: (e: TickPayload) => void): () => void;
  unsubscribe(listener: (e: TickPayload) => void): void;

  // collisions
  subscribeCollisionStart(listener: (e: CollisionPayload) => void): () => void;
  subscribeCollisionActive(listener: (e: CollisionPayload) => void): () => void;
  subscribeCollisionEnd(listener: (e: CollisionPayload) => void): () => void;
  unsubscribeCollisionStart(listener: (e: CollisionPayload) => void): void;
  unsubscribeCollisionActive(listener: (e: CollisionPayload) => void): void;
  unsubscribeCollisionEnd(listener: (e: CollisionPayload) => void): void;
};
