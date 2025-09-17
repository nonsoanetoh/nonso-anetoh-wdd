import Matter from "matter-js";
import { BOUNDARY_THICKNESS } from "./constants";
import { RefObject } from "react";
import { HandleCanvasResizeProps } from "../../../types/matter";

export const handleCanvasResize = ({
  container,
  render,
  bounds,
}: HandleCanvasResizeProps) => {
  if (!render) return;

  if (!container.current) return;

  render.canvas.width = container.current.clientWidth;
  render.canvas.height = container.current.clientHeight;

  if (bounds && bounds.ground) {
    Matter.Body.setPosition(
      bounds.ground,
      Matter.Vector.create(
        container.current.clientWidth / 2,
        container.current.clientHeight + BOUNDARY_THICKNESS / 2
      )
    );

    if (bounds.leftWall) {
      Matter.Body.setPosition(
        bounds.leftWall,
        Matter.Vector.create(
          -BOUNDARY_THICKNESS / 2,
          container.current.clientHeight / 2
        )
      );
    }
    if (bounds.rightWall) {
      Matter.Body.setPosition(
        bounds.rightWall,
        Matter.Vector.create(
          container.current.clientWidth + BOUNDARY_THICKNESS / 2,
          container.current.clientHeight / 2
        )
      );
    }
  }
};
