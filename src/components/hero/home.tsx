"use client";
import React, { useEffect, useRef } from "react";
import Matter from "matter-js";
import Count from "../reps/count";
import Trigger from "../reps/trigger";
import Clock from "../clock";
import { usePreloaderContext } from "@/context/PreloaderContext";

const Hero = () => {
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const countRef = useRef<HTMLDivElement>(null);
  const clockRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const { isPreloaded } = usePreloaderContext();

  useEffect(() => {
    if (!isPreloaded) return;

    const Engine = Matter.Engine;
    const Render = Matter.Render;
    const Runner = Matter.Runner;
    const Bodies = Matter.Bodies;
    const Composite = Matter.Composite;

    const engine = Engine.create();
    const world = engine.world;

    const render = Render.create({
      element: boxRef.current || undefined,
      engine: engine,
      canvas: canvasRef.current || undefined,
      options: {
        width: boxRef.current?.clientWidth || 800,
        height: boxRef.current?.clientHeight || 600,
        wireframes: false,
        background: "transparent",
      },
    });

    Render.run(render);

    const runner = Runner.create();
    Runner.run(runner, engine);

    const createBodies = () => {
      const canvasHeight = boxRef.current?.clientHeight ?? 600;
      const canvasWidth = boxRef.current?.clientWidth ?? 800;

      const countBody = Bodies.rectangle(
        canvasWidth / 2,
        100,
        countRef.current?.clientWidth || 10,
        countRef.current?.clientHeight || 60,
        {
          frictionAir: 0.01,
          restitution: 0.8,
          render: {},
        }
      );

      const triggerBody = Bodies.circle(
        200,
        50,
        (triggerRef.current?.clientWidth ?? 10) / 2,
        {
          frictionAir: 0.01,
          restitution: 1,
          render: {},
        }
      );

      const clockBody = Bodies.rectangle(
        canvasWidth / 4,
        100,
        clockRef.current?.clientWidth || 0,
        clockRef.current?.clientHeight || 0,
        {
          frictionAir: 0.01,
          restitution: 1,
          render: {},
        }
      );

      const ground = Bodies.rectangle(
        canvasWidth / 2,
        canvasHeight,
        canvasWidth,
        3,
        {
          isStatic: true,
          render: {
            fillStyle: "transparent",
          },
        }
      );

      const leftWall = Bodies.rectangle(0, canvasHeight / 2, 3, canvasHeight, {
        isStatic: true,
        render: {
          fillStyle: "transparent",
        },
      });

      const rightWall = Bodies.rectangle(
        canvasWidth,
        canvasHeight / 2,
        3,
        canvasHeight,
        {
          isStatic: true,
          render: {
            fillStyle: "transparent",
          },
        }
      );

      const topWall = Bodies.rectangle(canvasWidth / 2, 0, canvasWidth, 3, {
        isStatic: true,
        render: {
          fillStyle: "transparent",
        },
      });

      Composite.clear(world, false);
      Composite.add(world, [
        countBody,
        triggerBody,
        clockBody,
        ground,
        leftWall,
        rightWall,
        topWall,
      ]);

      return { countBody, triggerBody, clockBody };
    };

    const { countBody } = createBodies();

    const updateDivPosition = () => {
      if (countRef.current) {
        countRef.current.style.transform = `translate(${countBody.position.x - countRef.current.clientWidth / 2}px, ${
          countBody.position.y - countRef.current.clientHeight / 2
        }px) rotate(${countBody.angle}rad)`;
      }
    };

    Matter.Events.on(engine, "afterUpdate", updateDivPosition);

    return () => {
      Matter.Events.off(engine, "afterUpdate", updateDivPosition);
      Matter.Render.stop(render);
      Matter.Engine.clear(engine);
      if (render.canvas.parentNode) {
        render.canvas.parentNode.removeChild(render.canvas);
      }
    };
  }, [isPreloaded]);

  return (
    <section ref={boxRef} className="hero">
      <canvas ref={canvasRef} />
      <Trigger containerRef={triggerRef} />
      <Count containerRef={countRef} />
      <Clock containerRef={clockRef} />
    </section>
  );
};

export default Hero;
