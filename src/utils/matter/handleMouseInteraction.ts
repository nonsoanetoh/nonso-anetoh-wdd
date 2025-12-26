import Matter, {
  Composite,
  Mouse,
  MouseConstraint,
  Render as MRender,
  Events,
} from "matter-js";
import { MouseInteractionProps } from "../../../types/matter";

export const handleMouseInteraction = ({
  engine,
  render,
  container,
}: MouseInteractionProps) => {
  // IMPORTANT: Mouse must be created on the canvas element, not the container!
  const mouse = Mouse.create(render.canvas);

  (render as MRender).mouse = mouse;
  if (render.options && typeof render.options.pixelRatio === "number") {
    mouse.pixelRatio = render.options.pixelRatio;
  }

  if ((container as any).current.style)
    (container as any).current.style.touchAction = "none";

  const mouseConstraint = MouseConstraint.create(engine, {
    mouse,
    constraint: {
      stiffness: 0.5,
      render: { visible: false },
    },
    collisionFilter: {
      category: 0x0004, // Mouse category
      mask: 0x0001, // Only interact with default category bodies
    },
  });

  Composite.add(engine.world, mouseConstraint);

  let dragStartPos = { x: 0, y: 0 };

  // Wake bodies on hover for more responsive dragging
  Events.on(mouseConstraint, "mousemove", () => {
    const body = mouseConstraint.body;
    if (body && body.isSleeping) {
      Matter.Sleeping.set(body, false);
    }
  });

  Events.on(mouseConstraint, "startdrag", (event: any) => {
    const body = event.body as Matter.Body;
    dragStartPos = { x: mouse.position.x, y: mouse.position.y };

    // Wake up the body if it's sleeping
    Matter.Sleeping.set(body, false);

    (body as any).plugin = (body as any).plugin || {};
    (body as any).plugin.isDragging = true;
    (body as any).plugin.isActive = true;
  });

  Events.on(mouseConstraint, "enddrag", (event: any) => {
    const body = event.body as Matter.Body;
    const dx = mouse.position.x - dragStartPos.x;
    const dy = mouse.position.y - dragStartPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const wasClick = distance < 5;

    (body as any).plugin.isDragging = false;

    if (wasClick) {
      (body as any).plugin.wasClicked = true;
      setTimeout(() => {
        if ((body as any).plugin) {
          (body as any).plugin.isActive = false;
          (body as any).plugin.wasClicked = false;
        }
      }, 150);
    } else {
      (body as any).plugin.isActive = false;
    }
  });

  return { mouse: { mouse, mouseConstraint } };
};
