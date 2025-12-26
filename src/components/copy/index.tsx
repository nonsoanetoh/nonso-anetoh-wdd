"use client";

import React, { useRef, ReactNode, ReactElement } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(SplitText, ScrollTrigger);

interface CopyProps {
  children: ReactNode;
  animateOnScroll?: boolean;
  delay?: number;
}

const Copy = ({ children, animateOnScroll = true, delay = 0 }: CopyProps) => {
  const container = useRef<HTMLElement | null>(null);
  const elementRef = useRef<HTMLElement[]>([]);
  const splitRef = useRef<SplitText[]>([]);
  const lines = useRef<HTMLElement[]>([]);

  useGSAP(
    () => {
      if (!container.current) return;

      splitRef.current = [];
      elementRef.current = [];
      lines.current = [];

      let elements: HTMLElement[] = [];

      if (container.current.hasAttribute("data-copy-wrapper")) {
        elements = Array.from(container.current.children) as HTMLElement[];
      } else {
        elements = [container.current] as HTMLElement[];
      }

      elements.forEach((el) => {
        elementRef.current.push(el);

        const split = SplitText.create(el, {
          type: "lines",
          mask: "lines",
          linesClass: "line++",
        });

        splitRef.current.push(split);

        const computedStyles = window.getComputedStyle(el);
        const textIndent = computedStyles.textIndent;

        if (textIndent && textIndent !== "0px") {
          if (split.lines.length > 0) {
            (split.lines[0] as HTMLElement).style.paddingLeft = textIndent;
          }
          el.style.textIndent = "0";
        }

        lines.current.push(...(split.lines as HTMLElement[]));
      });

      gsap.set(lines.current, { y: "100%" });

      const animationProps = {
        y: "0%",
        duration: 1,
        ease: "power4.out",
        stagger: 0.1,
        delay: delay,
      };

      if (animateOnScroll) {
        gsap.to(lines.current, {
          ...animationProps,
          scrollTrigger: {
            trigger: container.current,
            start: "top 75%",
            once: true,
          },
        });
      } else {
        gsap.to(lines.current, {
          ...animationProps,
        });
      }

      return () => {
        splitRef.current.forEach((split) => {
          if (split) split.revert();
        });
      };
    },
    {
      scope: container,
      dependencies: [animateOnScroll, delay],
    }
  );

  if (React.Children.count(children) === 1 && React.isValidElement(children)) {
    return React.cloneElement(children as ReactElement<any>, {
      ref: container as any
    });
  }

  return (
    <div ref={container as any} data-copy-wrapper="true">
      {children}
    </div>
  );
};

export default Copy;
