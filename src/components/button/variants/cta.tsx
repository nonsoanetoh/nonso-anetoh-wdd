"use client";
import { LinkField } from "@prismicio/client";
import { PrismicNextLink } from "@prismicio/next";
import Link from "next/link";
import React, { FC, useEffect, useRef } from "react";
import { gsap } from "gsap";

interface CTAProps {
  label: string;
  link: LinkField | string;
  linkType?: "within-page" | "external";
}

const CTA: FC<CTAProps> = ({ label, link, linkType }) => {
  const linkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const circles = Array.from(
      linkRef.current?.querySelectorAll(".circle") || []
    ).reverse();

    if (!circles) return;

    const timeline = gsap.timeline({ paused: true });

    const angles = circles
      .map((_, index) => {
        const angle = (index * 360) / circles.length;
        return {
          x: -Math.cos((angle * Math.PI) / 180) * 3,
          y: -Math.sin((angle * Math.PI) / 180) * 3,
        };
      })
      .reverse();

    timeline.to(
      circles,
      {
        x: (i) => angles[i].x,
        y: (i) => angles[i].y,
        rotate: 180,
        transformOrigin: "50% 50%",
        duration: 0.2,
        ease: "back.in(7)",
        stagger: 0.01,
      },
      0
    );

    const linkElement = linkRef.current;
    const playAnimation = () => timeline.play();
    const reverseAnimation = () => timeline.reverse();

    linkElement?.addEventListener("mouseenter", playAnimation);
    linkElement?.addEventListener("mouseleave", reverseAnimation);
    linkElement?.addEventListener("focus", playAnimation);
    linkElement?.addEventListener("blur", reverseAnimation);

    return () => {
      linkElement?.removeEventListener("mouseenter", playAnimation);
      linkElement?.removeEventListener("mouseleave", reverseAnimation);
      linkElement?.removeEventListener("focus", playAnimation);
      linkElement?.removeEventListener("blur", reverseAnimation);
    };
  }, []);

  if (typeof link !== "string") {
    return (
      <PrismicNextLink
        field={link}
        className={`button button--cta`}
        ref={linkRef}
      >
        <span>{label}</span>
        <Icon linkType={linkType} />
      </PrismicNextLink>
    );
  }

  return (
    <Link href={link} className="button button--cta" ref={linkRef}>
      <span>{label}</span>
      <Icon linkType={linkType} />
    </Link>
  );
};

interface IconProps {
  linkType?: "within-page" | "external";
}

const Icon: FC<IconProps> = ({ linkType }) => {
  return (
    <div className="icon-block">
      <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          className={`arrow ${linkType ? `arrow--${linkType}` : ""}`}
          d="M28.7071 22.7071C29.0976 22.3166 29.0976 21.6834 28.7071 21.2929L22.3431 14.9289C21.9526 14.5384 21.3195 14.5384 20.9289 14.9289C20.5384 15.3195 20.5384 15.9526 20.9289 16.3431L26.5858 22L20.9289 27.6569C20.5384 28.0474 20.5384 28.6805 20.9289 29.0711C21.3195 29.4616 21.9526 29.4616 22.3431 29.0711L28.7071 22.7071ZM16 23H28V21H16V23Z"
          fill="#444444"
        />

        {Array.from({ length: 8 }).map((_, index) => {
          const angle = (index * 360) / 8;
          const radius = 16;
          const cx = 22 + radius * Math.cos((angle * Math.PI) / 180);
          const cy = 22 + radius * Math.sin((angle * Math.PI) / 180);
          return (
            <circle
              key={index}
              cx={cx}
              cy={cy}
              r={2}
              fill="#454545"
              className="circle"
            />
          );
        })}
      </svg>
    </div>
  );
};

Icon.displayName = "Icon";

export default CTA;
