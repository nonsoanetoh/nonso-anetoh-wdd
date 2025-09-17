"use client";

import { useEffect, useState } from "react";

export interface CanvasBounds {
  top: number;
  bottom: number;
  left: number;
  right: number;
  center: { x: number; y: number };
  width: number;
  height: number;
}

export function useRapierCanvasBounds(
  containerRef: React.RefObject<HTMLElement | null>,
  zoom: number
): CanvasBounds {
  const [bounds, setBounds] = useState<CanvasBounds>({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    center: { x: 0, y: 0 },
    width: 0,
    height: 0,
  });

  useEffect(() => {
    if (!containerRef.current) return;

    const update = () => {
      const width = containerRef.current!.offsetWidth;
      const height = containerRef.current!.offsetHeight;

      const worldWidth = width / zoom;
      const worldHeight = height / zoom;

      const halfWidth = worldWidth / 2;
      const halfHeight = worldHeight / 2;

      setBounds({
        top: halfHeight,
        bottom: -halfHeight,
        left: -halfWidth,
        right: halfWidth,
        center: { x: 0, y: 0 },
        width: worldWidth,
        height: worldHeight,
      });
    };

    update();

    const observer = new ResizeObserver(update);
    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [containerRef, zoom]);

  return bounds;
}
