import { Content, GroupField } from "@prismicio/client";
import React, { FC, useEffect, useRef, useState } from "react";
import { Simplify } from "../../../../prismicio-types";
import { PrismicNextImage } from "@prismicio/next";

type Props = {
  images: Simplify<Content.HeroSliceAboutPrimary>["ring_gallery"] & GroupField;
  size?: number; // initial fallback only; overridden by container
  hole?: number; // legacy prop; ignored in container-driven mode
  offsetDeg?: number;
};

const COUNT = 8;

const RingGallery: FC<Props> = ({
  images,
  size = 120, // fallback (used before first measure)
  hole = 120, // not used when responsive
  offsetDeg = 0,
}) => {
  const items = Array.from({ length: COUNT }, (_, i) => "");

  const rootRef = useRef<HTMLDivElement>(null);
  const [vars, setVars] = useState({ size, radius: hole + size / 2 });

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const update = (w: number, h: number) => {
      const Rc = 0.5 * Math.min(w, h);
      const alpha = Math.PI / COUNT;
      const t = Math.tan(alpha);

      const denom = Math.sqrt(1 + 4 * t + 5 * t * t);
      const R = (Rc * (1 + t)) / denom;
      const s = (2 * Rc * t) / denom;

      setVars({ size: Math.max(0, s), radius: Math.max(0, R) });
    };

    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) update(width, height);
    });

    ro.observe(el);

    const rect = el.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) update(rect.width, rect.height);

    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={rootRef}
      className="ring-gallery"
      style={
        {
          "--count": COUNT,
          "--size": `${vars.size}px`,
          "--radius": `${vars.radius}px`,
          "--offset": `${offsetDeg}deg`,
        } as React.CSSProperties
      }
      aria-label="Octagonal image ring"
      role="group"
    >
      {items.map((_, index) => (
        <div
          className="ring-gallery__item"
          style={{ "--i": index } as React.CSSProperties}
          key={index}
        >
          <div className="ring-gallery__image-wrapper" />
        </div>
      ))}
    </div>
  );
};

export default RingGallery;
