import { useCallback } from "react";
import Matter, { Body, Composite, Bodies } from "matter-js";

const WALL_IDS = {
  ceiling: 1001,
  right: 1002,
  floor: 1003,
  left: 1004,
};

export const useMatterBoundaries = (
  world: Matter.World | null,
  container: HTMLDivElement | null,
  depth = 500
) => {
  const addBoundaries = () => {
    if (!world || !container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const ceiling = Bodies.rectangle(width / 2, -depth / 2, width, depth, {
      id: WALL_IDS.ceiling,
      isStatic: true,
    });
    const right = Bodies.rectangle(
      width + depth / 2,
      height / 2,
      depth,
      height,
      {
        id: WALL_IDS.right,
        isStatic: true,
      }
    );
    const floor = Bodies.rectangle(
      width / 2,
      height + depth / 2,
      width,
      depth,
      {
        id: WALL_IDS.floor,
        isStatic: true,
      }
    );
    const left = Bodies.rectangle(-depth / 2, height / 2, depth, height, {
      id: WALL_IDS.left,
      isStatic: true,
    });

    Composite.add(world, [ceiling, right, floor, left]);
  };

  const resizeBoundaries = useCallback(() => {
    if (!world || !container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const reposition = (
      id: number,
      verts: Matter.Vector[],
      position: Matter.Vector
    ) => {
      const body = Composite.get(world, id, "body");
      if (body && "position" in body) {
        Body.setPosition(body, position);
        Body.setVertices(body, verts);
      }
    };

    reposition(
      WALL_IDS.floor,
      [
        { x: -width / 2, y: depth / 2 },
        { x: -width / 2, y: -depth / 2 },
        { x: width / 2, y: -depth / 2 },
        { x: width / 2, y: depth / 2 },
      ],
      { x: width / 2, y: height + depth / 2 }
    );

    reposition(
      WALL_IDS.ceiling,
      [
        { x: -width / 2, y: -depth / 2 },
        { x: -width / 2, y: depth / 2 },
        { x: width / 2, y: depth / 2 },
        { x: width / 2, y: -depth / 2 },
      ],
      { x: width / 2, y: -depth / 2 }
    );

    reposition(
      WALL_IDS.left,
      [
        { x: -depth / 2, y: -height / 2 },
        { x: -depth / 2, y: height / 2 },
        { x: depth / 2, y: height / 2 },
        { x: depth / 2, y: -height / 2 },
      ],
      { x: -depth / 2, y: height / 2 }
    );

    reposition(
      WALL_IDS.right,
      [
        { x: -depth / 2, y: -height / 2 },
        { x: -depth / 2, y: height / 2 },
        { x: depth / 2, y: height / 2 },
        { x: depth / 2, y: -height / 2 },
      ],
      { x: width + depth / 2, y: height / 2 }
    );
  }, [world, container, depth]);

  return { addBoundaries, resizeBoundaries };
};
