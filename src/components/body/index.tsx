"use client";
import React, { useEffect, useRef, useState } from "react";
import Matter from "matter-js";

type BodyComponentProps = {
  body: Matter.Body;
  onBodyClick?: () => void;
  children?:
    | React.ReactNode
    | ((state: {
        isDragging: boolean;
        isActive: boolean;
        wasClicked: boolean;
      }) => React.ReactNode);
};

const Body: React.FC<BodyComponentProps> = ({
  body,
  onBodyClick,
  children,
}) => {
  const elemRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [wasClicked, setWasClicked] = useState(false);
  const animationFrameRef = useRef<number>(0);

  useEffect(() => {
    const checkState = () => {
      const plugin = (body as any).plugin;
      if (plugin) {
        if (plugin.isDragging !== isDragging) {
          setIsDragging(plugin.isDragging || false);
        }
        if (plugin.isActive !== isActive) {
          setIsActive(plugin.isActive || false);
        }
        if (plugin.wasClicked && !wasClicked) {
          setWasClicked(true);
          onBodyClick?.();
          setTimeout(() => setWasClicked(false), 150);
        }
      }
      animationFrameRef.current = requestAnimationFrame(checkState);
    };

    animationFrameRef.current = requestAnimationFrame(checkState);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [body, isDragging, isActive, wasClicked, onBodyClick]);

  useEffect(() => {
    let animationId: number;

    const render = () => {
      if (!elemRef.current) return;

      const { x, y } = body.position;
      const angle = body.angle;

      const pluginData = (body as any).plugin?.data;
      const viewBox = pluginData?.viewBox;
      const scale = pluginData?.scale;
      const collisionOffset = pluginData?.collisionOffset || { x: 0, y: 0 };

      if (!viewBox || !scale) {
        console.warn("No viewBox or scale data on body", body.label);
        return;
      }

      const artboardWidth = viewBox.w * scale;
      const artboardHeight = viewBox.h * scale;

      elemRef.current.style.width = `${artboardWidth}px`;
      elemRef.current.style.height = `${artboardHeight}px`;
      elemRef.current.style.left = `${x - artboardWidth / 2 - collisionOffset.x}px`;
      elemRef.current.style.top = `${y - artboardHeight / 2 - collisionOffset.y}px`;

      const originX = artboardWidth / 2 + collisionOffset.x;
      const originY = artboardHeight / 2 + collisionOffset.y;
      elemRef.current.style.transformOrigin = `${originX}px ${originY}px`;
      elemRef.current.style.transform = `rotate(${angle}rad)`;

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [body]);

  // Check if this body should allow HTML interaction
  const customConfig = (body as any).plugin?.customConfig;
  const allowHtmlInteraction = customConfig?.disableMouseDrag ?? false;

  return (
    <div
      ref={elemRef}
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        transformOrigin: "center center",
        willChange: "transform",
        pointerEvents: allowHtmlInteraction ? "auto" : "none",
        zIndex: allowHtmlInteraction ? 100 : 10,
      }}
    >
      {typeof children === "function"
        ? children({ isDragging, isActive, wasClicked })
        : children}
    </div>
  );
};

export default Body;
