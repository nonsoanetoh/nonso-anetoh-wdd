import { parseTrinkets } from "@/utils/trinkets";
import type Matter from "matter-js";

export type ParsedTrinket = ReturnType<typeof parseTrinkets>[number] & {
  ref?: React.RefObject<HTMLDivElement>;
  collisionPath: string | null;
};

export type TrinketBodyPair = {
  id: string;                              // Unique ID (also used as body.label)
  body: Matter.Body | null;                // Physics body (null until spawned)
  domRef: React.RefObject<HTMLDivElement>; // DOM element reference
  size: number;                            // Multiplier (e.g., 2 = 20% canvas width)
  type: "static" | "interactive";          // Interaction type
  collisionPath: string;                   // SVG path 'd' attribute
  name: string;                            // Sprite name for visual rendering

  // Self-contained render method
  render(): void;
};