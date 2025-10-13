import Matter from "matter-js";
import { BOUNDARY_THICKNESS } from "./constants";
import { RefObject } from "react";

type Bounds = {
  ground: Matter.Body;
  leftWall: Matter.Body | null;
  rightWall: Matter.Body | null;
};

export const handleCanvasResize = ({
  container,
  render,
  bounds,
  engine,
}: {
  container: RefObject<HTMLDivElement | null>;
  render: Matter.Render | null;
  bounds: Bounds | null;
  engine?: Matter.Engine | null;
}) => {
  if (!render || !container.current) return;

  const oldWidth = render.canvas.width;
  const newWidth = container.current.clientWidth;
  const newHeight = container.current.clientHeight;

  render.canvas.width = newWidth;
  render.canvas.height = newHeight;

  render.bounds.max.x = newWidth;
  render.bounds.max.y = newHeight;
  render.options.width = newWidth;
  render.options.height = newHeight;

  const scaleFactor = newWidth / oldWidth;

  if (Math.abs(scaleFactor - 1) < 0.01) return;

  if (bounds && bounds.ground) {
    Matter.Body.setPosition(
      bounds.ground,
      Matter.Vector.create(
        newWidth / 2,
        newHeight + BOUNDARY_THICKNESS / 2
      )
    );

    if (bounds.leftWall) {
      Matter.Body.setPosition(
        bounds.leftWall,
        Matter.Vector.create(-BOUNDARY_THICKNESS / 2, newHeight / 2)
      );
    }
    if (bounds.rightWall) {
      Matter.Body.setPosition(
        bounds.rightWall,
        Matter.Vector.create(
          newWidth + BOUNDARY_THICKNESS / 2,
          newHeight / 2
        )
      );
    }
  }

  // Scale all non-static bodies
  if (engine) {
    const allBodies = Matter.Composite.allBodies(engine.world);
    allBodies.forEach((body) => {
      if (!body.isStatic) {
        // Scale position
        const scaledX = body.position.x * scaleFactor;
        const scaledY = body.position.y * scaleFactor;
        Matter.Body.setPosition(body, { x: scaledX, y: scaledY });

        // Scale the body itself
        Matter.Body.scale(body, scaleFactor, scaleFactor);

        // Update the scale and collision offset in plugin data
        const pluginData = (body as any).plugin?.data;
        if (pluginData) {
          if (pluginData.scale) {
            pluginData.scale *= scaleFactor;
          }
          if (pluginData.collisionOffset) {
            pluginData.collisionOffset.x *= scaleFactor;
            pluginData.collisionOffset.y *= scaleFactor;
          }
        }

        // Update wrap boundaries
        if ((body as any).plugin?.wrapBounds) {
          (body as any).plugin.wrapBounds = {
            min: { x: 0, y: 0 },
            max: { x: newWidth, y: newHeight }
          };
        }
      }
    });
  }
};
