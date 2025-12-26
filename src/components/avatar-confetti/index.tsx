"use client";
import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import Trinket from "../trinket";

export interface AvatarConfettiHandle {
  trigger: () => void;
}

interface AvatarConfettiProps {
  size?: number;
}

interface ConfettiItem {
  id: number;
  trinketName: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
}

const AvatarConfetti = forwardRef<AvatarConfettiHandle, AvatarConfettiProps>(
  ({ size = 180 }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isTriggered, setIsTriggered] = useState(false);
    const [confettiItems, setConfettiItems] = useState<ConfettiItem[]>([]);
    const animationFrameRef = useRef<number | undefined>(undefined);
    const itemsRef = useRef<ConfettiItem[]>([]);

    const config = {
      gravity: 0.25,
      friction: 0.99,
      count: 5,
      horizontalSpread: 35,
      verticalForceMin: 18,
      verticalForceMax: 28,
      rotationalSpeed: 8,
      resetDelay: 500,
      maxHeightPercent: 0.2, // Don't go higher than 20% above screen
      startSpread: 150, // Horizontal spread at spawn point
    };

    const trinketNames = [
      "avatar__base",
      "avatar__gym",
      "avatar__shower",
      "avatar__work",
      "avatar__music",
      "avatar__sleep",
    ];

    const createConfetti = () => {
      if (!containerRef.current) return [];

      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.width / 2;
      const startY = rect.height + 50; // Just below the screen

      return Array.from({ length: config.count }, (_, i) => {
        // Spread items across a horizontal range at spawn
        const startX = centerX + (Math.random() - 0.5) * config.startSpread;
        const horizontalVelocity = (Math.random() - 0.5) * config.horizontalSpread;
        const verticalVelocity = -(config.verticalForceMin + Math.random() * (config.verticalForceMax - config.verticalForceMin));

        return {
          id: Date.now() + i,
          trinketName: trinketNames[i % trinketNames.length],
          x: startX,
          y: startY,
          vx: horizontalVelocity,
          vy: verticalVelocity,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * config.rotationalSpeed,
        };
      });
    };

    const updateConfetti = (items: ConfettiItem[]): ConfettiItem[] => {
      if (!containerRef.current) return items;
      const rect = containerRef.current.getBoundingClientRect();
      const maxHeightBound = -rect.height * config.maxHeightPercent;

      return items
        .map((item) => {
          let newVy = item.vy + config.gravity;
          let newY = item.y + item.vy * config.friction;

          // If trying to go above max height, bounce back down
          if (newY < maxHeightBound) {
            newY = maxHeightBound;
            newVy = Math.abs(newVy) * 0.3; // Bounce with reduced velocity
          }

          return {
            ...item,
            vy: newVy,
            vx: item.vx * config.friction,
            x: item.x + item.vx,
            y: newY,
            rotation: item.rotation + item.rotationSpeed,
            rotationSpeed: item.rotationSpeed * config.friction,
          };
        })
        .filter((item) => item.y < rect.height + 100);
    };

    const animate = () => {
      itemsRef.current = updateConfetti(itemsRef.current);
      setConfettiItems([...itemsRef.current]);

      if (itemsRef.current.length > 0) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setTimeout(() => {
          setIsTriggered(false);
        }, config.resetDelay);
      }
    };

    const emit = () => {
      if (isTriggered) return;
      setIsTriggered(true);

      const newItems = createConfetti();
      itemsRef.current = newItems;
      setConfettiItems(newItems);

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    useImperativeHandle(ref, () => ({
      trigger: () => {
        if (!isTriggered) {
          emit();
        }
      },
    }));

    useEffect(() => {
      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }, []);

    return (
      <div className="avatar-confetti" ref={containerRef}>
        {confettiItems.map((item) => (
          <div
            key={item.id}
            className="confetti-item"
            style={{
              position: "absolute",
              left: item.x,
              top: item.y,
              width: size,
              height: size,
              transform: `translate(-50%, -50%) rotate(${item.rotation}deg)`,
              pointerEvents: "none",
            }}
          >
            <Trinket
              id={`confetti-${item.id}`}
              name={item.trinketName}
              type="static"
            />
          </div>
        ))}
      </div>
    );
  }
);

AvatarConfetti.displayName = "AvatarConfetti";

export default AvatarConfetti;
