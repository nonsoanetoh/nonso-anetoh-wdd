import { Body, Common, Composite } from "matter-js";

export const toPixels = (
  normX: number,
  normY: number,
  width: number,
  height: number
) => ({
  x: (normX / 10) * width,
  y: (normY / 10) * height,
});

export const fromPixels = (
  x: number,
  y: number,
  width: number,
  height: number
) => ({
  normX: (x / width) * 10,
  normY: (y / height) * 10,
});

interface ExplosionEngine {
  world: Composite;
}

export const explosion = (engine: ExplosionEngine, delta: number): void => {
  const timeScale = 1000 / 60 / delta;
  const bodies: Body[] = Composite.allBodies(engine.world);

  for (let i = 0; i < bodies.length; i++) {
    const body = bodies[i];

    if (!body.isStatic && body.position.y >= 500) {
      // scale force for mass and time applied
      const forceMagnitude = 0.05 * body.mass * timeScale;

      // apply the force over a single update
      Body.applyForce(body, body.position, {
        x:
          (forceMagnitude + Common.random() * forceMagnitude) *
          Common.choose([1, -1]),
        y: -forceMagnitude + Common.random() * -forceMagnitude,
      });
    }
  }
};
