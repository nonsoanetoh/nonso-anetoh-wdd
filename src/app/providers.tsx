"use client";

import { TransitionRouter } from "next-transition-router";
import gsap from "gsap";
import React from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  return (
    <TransitionRouter
      auto={true}
      leave={(next) => {
        const tween = gsap.fromTo(
          wrapperRef.current,
          { autoAlpha: 1 },
          { autoAlpha: 0, onComplete: next }
        );
        return () => tween.kill();
      }}
      enter={(next) => {
        const tween = gsap.fromTo(
          wrapperRef.current,
          { autoAlpha: 0 },
          { autoAlpha: 1, onComplete: next }
        );
        return () => tween.kill();
      }}
    >
      <main className="wrapper" ref={wrapperRef}>
        {children}
      </main>
    </TransitionRouter>
  );
}
