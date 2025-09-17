"use client";

import React, { FC } from "react";
import gsap from "gsap";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import SplitText from "gsap/SplitText";

gsap.registerPlugin(useGSAP, SplitText);

interface ISTProps {
  text: string;
}

const IndentedSectionTitle: FC<ISTProps> = ({ text }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const split = new SplitText(".text", { type: "chars" });

      gsap.from(split.chars, {
        duration: 1,
        autoAlpha: 0,
        stagger: {
          amount: 0.45,
          from: "random",
        },
        ease: "steps(1)",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom",
          end: "center 50%",
          // scrub: true,
          once: true,
          toggleActions: "play none none none",
        },
      });
    },
    {
      scope: containerRef,
    }
  );

  return (
    <div
      ref={containerRef}
      className="text-component text-component--indented-section-title"
    >
      <h2 className="text">{text}</h2>
    </div>
  );
};

export default IndentedSectionTitle;
