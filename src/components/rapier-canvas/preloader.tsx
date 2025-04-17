"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrthographicCamera, OrbitControls } from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import { Avatar } from "./partials/avatar";

type RapierPreloaderProps = {
  background?: string;
  pointerEvents?: "none" | "all";
  showDebug?: boolean;
  enableControls?: boolean;
  showCenterBox?: boolean;
  children: ReactNode;
};

export const RapierPreloader = ({
  pointerEvents = "none",
  showDebug = false,
  enableControls = false,
  showCenterBox = false,
  children,
}: RapierPreloaderProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(100);
  const [size, setSize] = useState({ width: 300, height: 300 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateSize = () => {
      const width = container.offsetWidth;
      const height = container.offsetHeight;

      const safeHeight = Math.max(height, 100);
      const targetWorldHeight = 5;
      const newZoom = safeHeight / targetWorldHeight;

      setSize({ width, height });
      setZoom(newZoom);
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return (
    <div
      id="rapier-preloader"
      ref={containerRef}
      className={`pointer-events--${pointerEvents}`}
      style={{ width: "100%", height: "100%" }}
    >
      <Canvas orthographic dpr={[1, 2]}>
        <OrthographicCamera makeDefault position={[0, 0, 100]} zoom={zoom} />
        {enableControls && <OrbitControls />}
        <Physics debug={showDebug}>
          {showCenterBox && (
            <mesh>
              <boxGeometry args={[1, 1, 0.1]} />
              <meshBasicMaterial color="blue" />
            </mesh>
          )}
          <Avatar />
          {children}
        </Physics>
      </Canvas>
    </div>
  );
};
