// app/test-body/page.tsx
"use client";
import React, { useEffect, useRef, useState } from "react";
import Matter from "matter-js";
import Body from "@/components/body";

export default function TestBodyPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const [bodies, setBodies] = useState<Matter.Body[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create engine
    const engine = Matter.Engine.create();
    engineRef.current = engine;

    // Create renderer
    const render = Matter.Render.create({
      element: containerRef.current,
      engine: engine,
      options: {
        width: 800,
        height: 600,
        wireframes: false,
        background: "#1a1a1a",
      },
    });

    // Create runner
    const runner = Matter.Runner.create();

    // Create ground
    const ground = Matter.Bodies.rectangle(400, 580, 810, 60, {
      isStatic: true,
      render: {
        fillStyle: "#333",
      },
    });

    // Create a box
    const box = Matter.Bodies.rectangle(400, 200, 80, 80, {
      restitution: 0.8,
      render: {
        fillStyle: "#0ea5e9",
      },
    });

    // Add all bodies to the world
    Matter.World.add(engine.world, [ground, box]);

    // Store bodies in state so React can render DOM elements
    setBodies([box]);

    // Run the engine and renderer
    Matter.Runner.run(runner, engine);
    Matter.Render.run(render);

    // Cleanup
    return () => {
      Matter.Render.stop(render);
      Matter.Runner.stop(runner);
      Matter.World.clear(engine.world, false);
      Matter.Engine.clear(engine);
      render.canvas.remove();
    };
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1 style={{ marginBottom: "1rem" }}>Body Component Test</h1>
      <p style={{ marginBottom: "1rem" }}>
        The blue box should be following the physics body. Click to see it bounce.
      </p>
      <div
        ref={containerRef}
        style={{
          position: "relative",
          width: "800px",
          height: "600px",
          border: "2px solid #333",
        }}
      >
        {bodies.map((body, i) => (
          <Body key={i} body={body}>
            <div
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: "#0ea5e9",
                border: "2px solid #38bdf8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: "bold",
              }}
            >
              Box {i + 1}
            </div>
          </Body>
        ))}
      </div>
    </div>
  );
}
