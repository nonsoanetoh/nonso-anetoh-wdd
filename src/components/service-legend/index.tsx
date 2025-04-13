"use client";
import { slugify } from "@/utils/parseString";
import { KeyTextField } from "@prismicio/client";
import Link from "next/link";
import React, { FC, useEffect, useRef, useState } from "react";

interface SLProps {
  services: KeyTextField[];
}

const ServiceLegend: FC<SLProps> = ({ services }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const legendItemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const indicatorRef = useRef<HTMLDivElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const maxDistance = useRef<number>(0);
  const legendRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (legendItemRefs.current.length > 1) {
      const firstItem = legendItemRefs.current[0]?.getBoundingClientRect();
      const lastItem =
        legendItemRefs.current[
          legendItemRefs.current.length - 1
        ]?.getBoundingClientRect();

      if (firstItem && lastItem) {
        maxDistance.current =
          Math.abs(lastItem.top - firstItem.top) ||
          Math.abs(lastItem.left - firstItem.left);
      }
    }
  }, [services]);

  useEffect(() => {
    if (activeIndex !== null && indicatorRef.current && pathRef.current) {
      const activeItem = legendItemRefs.current[activeIndex];
      if (activeItem) {
        const rect = activeItem.getBoundingClientRect();
        const parentRect = activeItem.parentElement?.getBoundingClientRect();

        if (parentRect) {
          const top =
            rect.top -
            parentRect.top +
            rect.height / 2 -
            indicatorRef.current.offsetHeight / 2;
          const left = rect.left - parentRect.left;

          const indicatorCurrentPosition = {
            x: parseFloat(indicatorRef.current.style.left || "0"),
            y: parseFloat(indicatorRef.current.style.top || "0"),
          };

          const targetPosition = {
            x: left,
            y: top,
          };

          const radiusX = (maxDistance.current / 2) * 0.1;
          const radiusY = (maxDistance.current / 2) * 0.2;

          const sweepFlag =
            indicatorCurrentPosition.y > targetPosition.y ? 1 : 0;

          const path = `M${indicatorCurrentPosition.x},${indicatorCurrentPosition.y} A${radiusX},${radiusY} 0 1,${sweepFlag} ${targetPosition.x},${targetPosition.y}`;
          pathRef.current.setAttribute("d", path);

          // Animate the indicator along the path
          const pathLength = pathRef.current.getTotalLength();
          let progress = 0;
          const speed = 0.05;

          function animate() {
            progress += speed;

            if (progress > 1) progress = 1;

            const point = pathRef.current!.getPointAtLength(
              progress * pathLength
            );

            indicatorRef.current!.style.left = `${point.x}px`;
            indicatorRef.current!.style.top = `${point.y}px`;

            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          }

          animate();
        }
      }
    }
  }, [activeIndex]);

  // Ensure the indicator is properly centered on the first render
  useEffect(() => {
    if (indicatorRef.current && legendItemRefs.current.length > 0) {
      const firstItem = legendItemRefs.current[0];
      if (firstItem) {
        const rect = firstItem.getBoundingClientRect();
        const parentRect = firstItem.parentElement?.getBoundingClientRect();

        if (parentRect) {
          const top =
            rect.top -
            parentRect.top +
            rect.height / 2 -
            indicatorRef.current.offsetHeight / 2;
          const left = rect.left - parentRect.left;

          indicatorRef.current.style.top = `${top}px`;
          indicatorRef.current.style.left = `${left}px`;
        }
      }
    }
  }, [services]);

  return (
    <div className="services-legend" ref={legendRef}>
      <svg
        className="path-animation"
        style={{ position: "absolute", width: 0, height: 0 }}
      >
        <path ref={pathRef} fill="none" stroke="transparent" />
      </svg>
      <div className="indicator" ref={indicatorRef} />
      <ul>
        {services.map((service, index) => (
          <li
            key={index}
            className={`legend__item ${activeIndex === index ? "active" : ""}`}
            ref={(el) => {
              legendItemRefs.current[index] = el;
            }}
          >
            <Link
              href={`#${slugify(service)}`}
              onClick={() => {
                setActiveIndex(index);
              }}
              className="link"
            >
              {service}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ServiceLegend;
