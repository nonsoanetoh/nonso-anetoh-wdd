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
  mouse,
}: {
  container: RefObject<HTMLDivElement | null>;
  render: Matter.Render | null;
  bounds: Bounds | null;
  engine?: Matter.Engine | null;
  mouse?: Matter.Mouse | null;
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

  // Update mouse constraint pixel ratio if it exists
  if (mouse && render.options && typeof render.options.pixelRatio === "number") {
    mouse.pixelRatio = render.options.pixelRatio;
  }

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

  // Update all non-static bodies and nav boundary
  if (engine) {
    const allBodies = Matter.Composite.allBodies(engine.world);
    allBodies.forEach((body) => {
      if (!body.isStatic) {
        // Only scale position, don't scale the body itself
        const scaledX = body.position.x * scaleFactor;
        const scaledY = body.position.y * scaleFactor;
        Matter.Body.setPosition(body, { x: scaledX, y: scaledY });

        // Wake up the body to prevent it from getting stuck
        if (body.isSleeping) {
          Matter.Sleeping.set(body, false);
        }

        // Update wrap boundaries
        if ((body as any).plugin?.wrapBounds) {
          (body as any).plugin.wrapBounds = {
            min: { x: 0, y: 0 },
            max: { x: newWidth, y: newHeight }
          };
        }
      } else if (body.label === "nav-boundary") {
        // Update nav boundary to match actual nav element
        const navElement = document.querySelector(".navigation") as HTMLElement;
        if (navElement && render) {
          // Force nav to base state and clear any ongoing transitions
          navElement.style.height = "";
          navElement.style.transition = "none";
          void navElement.offsetHeight; // Force reflow

          // Get base height from .inner element which has fixed height
          const innerElement = navElement.querySelector(".inner") as HTMLElement;
          const baseHeight = innerElement
            ? innerElement.getBoundingClientRect().height
            : navElement.getBoundingClientRect().height;

          // Restore transition
          navElement.style.transition = "";

          const navRect = navElement.getBoundingClientRect();
          const canvasRect = render.canvas.getBoundingClientRect();

          // Convert nav position from viewport to canvas coordinates
          const navX = navRect.left - canvasRect.left + navRect.width / 2;
          const navY = navRect.top - canvasRect.top + baseHeight / 2;

          // Remove old body and create new one with correct dimensions and chamfer
          Matter.Composite.remove(engine.world, body);

          const computedStyle = window.getComputedStyle(navElement);
          const borderRadius = parseFloat(computedStyle.borderRadius) || 38;

          const newNavBoundary = Matter.Bodies.rectangle(
            navX,
            navY,
            navRect.width,
            baseHeight,
            {
              isStatic: true,
              render: { fillStyle: "transparent", strokeStyle: "transparent", lineWidth: 0 },
              label: "nav-boundary",
              chamfer: { radius: borderRadius }
            }
          );
          Matter.Composite.add(engine.world, newNavBoundary);
        }
      } else if ((body as any).plugin?.customConfig) {
        // Handle custom bodies with stored config
        const config = (body as any).plugin.customConfig;
        const width = config.width;
        const height = config.height;

        // Remove old body and create new one with same config
        Matter.Composite.remove(engine.world, body);

        const newBody = Matter.Bodies.rectangle(
          body.position.x,
          body.position.y,
          width,
          height,
          {
            isStatic: config.isStatic ?? false,
            restitution: config.physics?.restitution ?? 0.8,
            friction: config.physics?.friction ?? 0.1,
            frictionAir: config.physics?.frictionAir ?? 0.02,
            render: {
              fillStyle: "transparent",
              strokeStyle: "transparent",
              lineWidth: 0,
            },
            label: config.label,
            chamfer: config.chamfer ? { radius: config.chamfer } : undefined,
            collisionFilter: config.disableMouseDrag
              ? {
                  category: 0x0002,
                  mask: 0xFFFFFFFF & ~0x0004,
                }
              : {
                  category: 0x0001,
                  mask: 0xFFFFFFFF,
                },
            plugin: {
              customConfig: config,
              data: {
                viewBox: { x: 0, y: 0, w: width, h: height },
                scale: 1,
                collisionOffset: { x: 0, y: 0 },
              },
            },
          }
        );

        // Preserve velocity from old body
        Matter.Body.setVelocity(newBody, body.velocity);
        Matter.Body.setAngularVelocity(newBody, body.angularVelocity);

        Matter.Composite.add(engine.world, newBody);
      }
    });
  }
};
