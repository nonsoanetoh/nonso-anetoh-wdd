"use client";
import React, { useEffect, useRef, useState } from "react";

interface CheckeredCanvasProps {
  squareSize?: number;
  lightColor?: string;
  darkColor?: string;
  parallaxSpeed?: number;
  smoothness?: number;
  overlayOpacity?: number;
}

const CheckeredCanvas: React.FC<CheckeredCanvasProps> = ({
  squareSize = 20,
  lightColor = "#ffffff",
  darkColor = "#e5e5e5",
  parallaxSpeed = 0.15,
  smoothness = 0.8,
  overlayOpacity = 0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scrollY, setScrollY] = useState(0);
  const currentScrollY = useRef(0);
  const targetScrollY = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    const resizeCanvas = () => {
      rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    const drawPattern = (offsetY: number) => {
      ctx.clearRect(0, 0, rect.width, rect.height);

      // Calculate offset based on scroll with parallax speed
      const yOffset = offsetY * parallaxSpeed;

      // Modulo to create infinite scroll effect
      const yMod = yOffset % (squareSize * 2);

      const cols = Math.ceil(rect.width / squareSize) + 1;
      const rows = Math.ceil(rect.height / squareSize) + 3; // Extra rows for parallax

      for (let row = -2; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const y = row * squareSize - yMod;
          const x = col * squareSize;

          // Alternate colors in checkerboard pattern
          const isEven = (row + col) % 2 === 0;
          ctx.fillStyle = isEven ? lightColor : darkColor;
          ctx.fillRect(x, y, squareSize, squareSize);
        }
      }
    };

    resizeCanvas();
    drawPattern(scrollY);

    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [squareSize, lightColor, darkColor, parallaxSpeed, scrollY]);

  // Smooth scroll animation with easing - continuously running
  useEffect(() => {
    let animationFrameId: number;

    const animate = () => {
      // Lerp (linear interpolation) for smooth easing
      currentScrollY.current +=
        (targetScrollY.current - currentScrollY.current) * smoothness;

      setScrollY(currentScrollY.current);
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [smoothness]);

  useEffect(() => {
    const handleScroll = () => {
      targetScrollY.current = window.scrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="checkered-canvas"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      />
      <div
        className="checkered-overlay"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "#E0E1E1",
          opacity: overlayOpacity / 100,
          pointerEvents: "none",
        }}
      />
    </>
  );
};

export default CheckeredCanvas;
