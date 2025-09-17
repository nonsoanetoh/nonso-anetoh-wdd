"use client";

import { TransitionRouter } from "next-transition-router";
import gsap from "gsap";
import React, { useRef } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const transitionCoverRef = useRef<HTMLDivElement>(null);
  const swap1Ref = useRef<HTMLDivElement>(null);
  const swap2Ref = useRef<HTMLDivElement>(null);

  return (
    <TransitionRouter
      auto={true}
      // LEAVE: wipe in using transitionCover
      leave={(next) => {
        const tl = gsap.timeline();
        let swapped = false;

        // initial states
        tl.set(transitionCoverRef.current, {
          display: "block",
          scaleX: 0,
          transformOrigin: "right center",
        });
        tl.set(swap1Ref.current, { display: "block" });
        tl.set(swap2Ref.current, { display: "none" });

        // animate wipe in, swap at 70%
        tl.to(transitionCoverRef.current, {
          duration: 0.6,
          scaleX: 1.1,
          ease: "power2.inOut",
          onUpdate(this) {
            if (this.progress() > 0.6 && !swapped) {
              swapped = true;
              if (swap1Ref.current && swap2Ref.current) {
                swap1Ref.current.style.display = "none";
                swap2Ref.current.style.display = "block";
              }
            }
          },
          onComplete: next,
        });

        return () => tl.kill();
      }}
      // ENTER: wipe out using same cover
      enter={(next) => {
        const tl = gsap.timeline();
        let swapped = false;

        // initial states for enter
        tl.set(transitionCoverRef.current, {
          display: "block",
          scaleX: 1,
          transformOrigin: "right center",
        });
        tl.set(swap1Ref.current, { display: "none" });
        tl.set(swap2Ref.current, { display: "block" });

        // animate wipe out, swap back at 70%
        tl.to(transitionCoverRef.current, {
          duration: 0.6,
          scaleX: 0,
          ease: "power2.inOut",
          onUpdate(this) {
            if (this.progress() > 0.7 && !swapped) {
              swapped = true;
              if (swap1Ref.current && swap2Ref.current) {
                swap1Ref.current.style.display = "block";
                swap2Ref.current.style.display = "none";
              }
            }
          },
          onComplete: () => {
            tl.set(transitionCoverRef.current, { display: "none" });
            next();
          },
        });

        return () => tl.kill();
      }}
    >
      <main>
        <div ref={swap1Ref} className="swap swap--1">
          one
        </div>
        <div ref={swap2Ref} className="swap swap--2">
          two
        </div>
        {children}
        <div ref={transitionCoverRef} className="transition-cover"></div>
      </main>
    </TransitionRouter>
  );
}
