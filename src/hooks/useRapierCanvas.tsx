"use client";
import { Canvas } from "@react-three/fiber";
import { Physics, RigidBody } from "@react-three/rapier";
import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type UseRapierCanvasConfig = {
  container?: HTMLElement | null;
  background?: string;
  gravity?: [number, number, number];
  cameraZoom?: number;
  floor?: {
    width?: number;
    depth?: number;
    height?: number;
    color?: string;
  };
  children: React.ReactNode;
};

export function useRapierCanvas(config: UseRapierCanvasConfig | null) {
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const [canvasReady, setCanvasReady] = useState(false);
  const [floorY, setFloorY] = useState(0);
  const [dynamicFloorWidth, setDynamicFloorWidth] = useState(10); // Add state for floor width

  useLayoutEffect(() => {
    if (!config?.container || canvasContainerRef.current) return;

    const wrapper = document.createElement("div");
    Object.assign(wrapper.style, {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      pointerEvents: "auto",
      zIndex: "10",
      background: config.background || "transparent",
    });

    config.container.appendChild(wrapper);
    canvasContainerRef.current = wrapper;

    const updateDimensions = () => {
      const containerWidth = config.container?.clientWidth || 300;
      const containerHeight = config.container?.clientHeight || 300;
      const zoom = config.cameraZoom ?? 100;
      const worldHeight = containerHeight / zoom;
      const floorHeight = config.floor?.height ?? 1;

      setDynamicFloorWidth(containerWidth / zoom);
      setFloorY(-worldHeight / 2 + floorHeight / 2);
    };

    updateDimensions();

    if (typeof window !== "undefined") {
      window.addEventListener("resize", updateDimensions);
    }

    setCanvasReady(true);

    return () => {
      wrapper.remove();
      canvasContainerRef.current = null;
      setCanvasReady(false);

      if (typeof window !== "undefined") {
        window.removeEventListener("resize", updateDimensions);
      }
    };
  }, [
    config?.container,
    config?.background,
    config?.cameraZoom,
    config?.floor?.height,
  ]);

  if (!config || !canvasReady || !canvasContainerRef.current) return null;

  const {
    children,
    gravity = [0, -9.81, 0],
    background = "transparent",
    cameraZoom = 100,
    floor,
  } = config;

  const floorWidth = dynamicFloorWidth;
  const floorDepth = floor?.depth ?? 1;
  const floorHeight = floor?.height ?? 1;
  const floorColor = floor?.color ?? "gray";

  return createPortal(
    <Canvas
      orthographic
      camera={{
        zoom: cameraZoom,
        position: [0, 0, 10],
        near: 0.1,
        far: 100,
      }}
      style={{
        pointerEvents: "auto",
        background,
      }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[0, 10, 10]} />
      <Physics gravity={gravity}>
        {/* Aligned Floor */}
        <RigidBody type="fixed" colliders="cuboid" position={[0, floorY, 0]}>
          <mesh>
            <boxGeometry args={[floorWidth, floorHeight, floorDepth]} />
            <meshStandardMaterial color={floorColor} />
          </mesh>
        </RigidBody>
        {children}
      </Physics>
    </Canvas>,
    canvasContainerRef.current
  );
}
