import { parseTrinkets } from "@/utils/trinkets";

export type ParsedTrinket = ReturnType<typeof parseTrinkets>[number] & {
  ref?: React.RefObject<HTMLDivElement>;
  collisionPath: string | null;
};
