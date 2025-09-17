"use client";

import React, { useLayoutEffect, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, OrthographicCamera } from "@react-three/drei";
import { Physics, CuboidCollider } from "@react-three/rapier";

interface UseRapierCanvasConfig {
  background?: string;
  gravity?: [number, number, number];
  showDebug?: boolean;
  children?: React.ReactNode;
}

interface UseRapierCanvasReturn {
  canvas: React.ReactPortal | null;
  zoom: number;
  viewport: { width: number; height: number };
}

export function useRapierCanvas(
  containerRef: React.RefObject<HTMLElement | null>,
  config?: UseRapierCanvasConfig
): UseRapierCanvasReturn {
  const [mounted, setMounted] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(100);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });

  const floorHeight = 2;

  useLayoutEffect(() => {
    if (containerRef.current) {
      setMounted(true);
    }
  }, [containerRef]);

  useEffect(() => {
    if (!containerRef.current) return;

    const updateSize = () => {
      const width = containerRef.current!.offsetWidth;
      const height = containerRef.current!.offsetHeight;
      setCanvasSize({ width, height });
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [containerRef]);

  const {
    background = "#f0f0f0",
    gravity = [0, -9.81, 0],
    showDebug = true,
    children,
  } = config || {};

  const ResizeAware = () => {
    const { viewport, camera } = useThree();
    useEffect(() => {
      setZoom((camera as any).zoom);
      setViewport(viewport);
    }, [viewport, camera]);
    return null;
  };

  if (!mounted || !containerRef.current) {
    return {
      canvas: null,
      zoom: 100,
      viewport: { width: 0, height: 0 },
    };
  }

  const floorY = -viewport.height / 2 + floorHeight;

  const canvas = createPortal(
    <Canvas
      orthographic
      style={{
        width: canvasSize.width,
        height: canvasSize.height,
        position: "absolute",
        top: 0,
        left: 0,
        background,
      }}
    >
      <ResizeAware />

      <OrthographicCamera
        makeDefault
        zoom={canvasSize.width / 10}
        position={[0, 0, 10]}
      />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />
      <OrbitControls enableZoom={false} enableRotate={false} />

      <Physics gravity={gravity} debug={showDebug}>
        {/* Floor */}
        <CuboidCollider args={[5, floorHeight, 1]} position={[0, floorY, 0]} />

        {/* Ceiling */}
        <CuboidCollider
          args={[5, 2, 1]}
          position={[0, viewport.height / 2 - 2, 0]}
        />

        {/* Side walls */}
        <CuboidCollider args={[1, 5, 1]} position={[-6, 0, 0]} />
        <CuboidCollider args={[1, 5, 1]} position={[6, 0, 0]} />

        {/* Front and back walls */}
        <CuboidCollider args={[5, 5, 0.1]} position={[0, 0, -1]} />
        <CuboidCollider args={[5, 5, 0.1]} position={[0, 0, 1]} />

        {children}
      </Physics>
    </Canvas>,
    containerRef.current
  );

  return {
    canvas,
    zoom,
    viewport,
  };
}
