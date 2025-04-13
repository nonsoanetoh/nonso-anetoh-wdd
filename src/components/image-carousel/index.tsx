"use client";

import { Content } from "@prismicio/client";
import { PrismicNextImage } from "@prismicio/next";
import Matter from "matter-js";
import React, { FC, useEffect, useRef } from "react";

interface ImageCarouselComponentProps {
  data: Content.ImageCarouselSlice;
}

const ImageCarouselComponent: FC<ImageCarouselComponentProps> = ({ data }) => {
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const Engine = Matter.Engine;
    const Render = Matter.Render;
    const Runner = Matter.Runner;
    const Bodies = Matter.Bodies;
    const Composite = Matter.Composite;

    const engine = Engine.create();
    const world = engine.world;

    const render = Render.create({
      element: imageContainerRef.current || undefined,
      engine: engine,
      canvas: canvasRef.current || undefined,
      options: {
        width: imageContainerRef.current?.clientWidth || 400,
        height: imageContainerRef.current?.clientHeight || 500,
        wireframes: false,
        background: "transparent",
      },
    });

    Render.run(render);

    const runner = Runner.create();
    Runner.run(runner, engine);

    const createBodies = () => {
      const canvasWidth = imageContainerRef.current?.clientWidth ?? 400;
      const canvasHeight = imageContainerRef.current?.clientHeight ?? 500;

      const rectangle = Bodies.rectangle(canvasWidth / 2, 100, 50, 50, {
        frictionAir: 0.01,
        restitution: 0.8,
        render: {},
      });

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
      Composite.add(world, [rectangle, ground, leftWall, rightWall, topWall]);

      return { rectangle };
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let { rectangle } = createBodies();

    const handleResize = () => {
      render.options.width = imageContainerRef.current?.clientWidth || 800;
      render.options.height = imageContainerRef.current?.clientHeight || 600;
      Render.stop(render);
      Render.run(render);

      const bodies = createBodies();
      rectangle = bodies.rectangle;
    };

    return () => {
      // Matter.Events.off(engine, "afterUpdate", updateDivPosition);
      window.removeEventListener("resize", handleResize);
      Matter.Render.stop(render);
      Matter.Engine.clear(engine);
      if (render.canvas.parentNode) {
        render.canvas.parentNode.removeChild(render.canvas);
      }
    };
  }, []);

  return (
    <section
      className="image-carousel"
      data-slice-type={data.slice_type}
      data-slice-variation={data.variation}
    >
      <canvas ref={canvasRef} />
      <figure className="image-container" ref={imageContainerRef}>
        <Controls />
        <PrismicNextImage
          fill
          field={data.primary.images[0]?.image}
          fallbackAlt={""}
        />
      </figure>
      <div className="counter">
        <span>04 — 13</span>
      </div>
    </section>
  );
};

const Controls = () => {
  return (
    <div className="controls">
      <div className="control control--left"></div>
      <div className="control control--right"></div>
    </div>
  );
};
export default ImageCarouselComponent;
