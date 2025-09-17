import Matter, {
  Composite,
  Mouse,
  MouseConstraint,
  Render as MRender,
} from "matter-js";
import { MouseInteractionProps } from "../../../types/matter";

export const handleMouseInteraction = ({
  engine,
  render,
  container,
}: MouseInteractionProps) => {
  const mouse = Mouse.create(container?.current as HTMLElement);

  // keep render in sync
  (render as MRender).mouse = mouse;
  if (render.options && typeof render.options.pixelRatio === "number") {
    mouse.pixelRatio = render.options.pixelRatio;
  }

  // better touch behavior
  if ((container as any).current.style)
    (container as any).current.style.touchAction = "none";

  const mouseConstraint = MouseConstraint.create(engine, {
    mouse,
    constraint: {
      stiffness: 0.2,
      render: { visible: true },
    },
  });

  Composite.add(engine.world, mouseConstraint);

  return { mouse: { mouse, mouseConstraint } };
};
