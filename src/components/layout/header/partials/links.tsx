import { PrismicNextLink } from "@prismicio/next";
import React, { FC, useEffect, useState } from "react";
import { NavigationDocument } from "../../../../../prismicio-types";

interface NavigationLinksProps {
  links?: NavigationDocument["data"]["navigation_link"];
}

type EaseFn = (t: number) => number;

const EASES: Record<string, EaseFn> = {
  linear: (t) => t,
  inOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
  inOutQuad: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 1, 2) / 2),
  inOutCubic: (t) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 1, 3) / 2,
  outCubic: (t) => 1 - Math.pow(1 - t, 3),
  outExpo: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
};

const invertEase = (ease: EaseFn, target: number) => {
  let lo = 0,
    hi = 1;
  for (let i = 0; i < 22; i++) {
    const mid = (lo + hi) / 2;
    if (ease(mid) < target) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
};

const CSS_EASE: Record<string, string> = {
  linear: "linear",
  inOutSine: "cubic-bezier(0.37, 0, 0.63, 1)",
  inOutQuad: "cubic-bezier(0.45, 0, 0.55, 1)",
  inOutCubic: "cubic-bezier(0.65, 0, 0.35, 1)",
  outCubic: "cubic-bezier(0.33, 1, 0.68, 1)",
  outExpo: "cubic-bezier(0.16, 1, 0.3, 1)",
};

const NAV_ANIM = {
  indicatorMs: 550,
  backdropMs: 220 as number,
  spinMs: 500,
  curveHeight: 80,
  spacer: 20,
  positionEase: "inOutSine",
  spinEase: "outExpo",
  backdropEase: "inOutQuad",
};

const NavigationLinks: FC<NavigationLinksProps> = ({ links }) => {
  const indicatorRef = React.useRef<HTMLSpanElement>(null);
  const activeLinkIndex = useState(0);
  const [indicatorPoints, setIndicatorPoints] = useState<{
    start: { x: number; y: number };
    end: { x: number; y: number };
  } | null>(null);

  useEffect(() => {
    if (indicatorRef.current) {
      const indicator = indicatorRef.current;
      const activeLink = indicator.parentElement?.querySelector(
        ".link.active .ind"
      ) as HTMLSpanElement | null;
      if (activeLink) {
        const guideRect = activeLink.getBoundingClientRect();
        const parentRect = indicator.parentElement?.getBoundingClientRect();
        if (parentRect) {
          const relativeLeft = guideRect.left - parentRect.left;
          const relativeTop = guideRect.top - parentRect.top;
          indicator.style.transform = `translateX(${relativeLeft}px) translateY(${relativeTop}px)`;
          setTimeout(() => {
            indicator.style.visibility = "visible";
          }, 0);
        }
      }
    }
  }, []);

  const handleLinkClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const clickedLink = event.currentTarget;
    const parent = clickedLink.closest(".navigation__links");
    if (parent && indicatorRef.current) {
      const ind = clickedLink.parentElement?.querySelector(
        ".ind"
      ) as HTMLSpanElement | null;
      if (ind) {
        const guideRect = ind.getBoundingClientRect();
        const parentRect = parent.getBoundingClientRect();
        const end = {
          x: guideRect.left - parentRect.left,
          y: guideRect.top - parentRect.top,
        };

        const indicator = indicatorRef.current;
        const style = window.getComputedStyle(indicator);
        const matrix = new DOMMatrixReadOnly(style.transform);
        const start = {
          x: matrix.m41,
          y: matrix.m42,
        };

        setIndicatorPoints({ start, end });
      }

      parent
        .querySelectorAll(".link")
        .forEach((link) => link.classList.remove("active"));
      clickedLink.parentElement?.classList.add("active");
    }
  };

  useEffect(() => {
    if (!indicatorPoints || !indicatorRef.current) return;

    const { start, end } = indicatorPoints;
    const indicator = indicatorRef.current;

    const control = {
      x: (start.x + end.x) / 2,
      y: Math.min(start.y, end.y) - NAV_ANIM.curveHeight,
    };

    const quadPeakT = (y0: number, yc: number, y1: number) => {
      const d = y0 - 2 * yc + y1;
      if (Math.abs(d) < 1e-6) return 0.5;
      const t = (y0 - yc) / d;
      return Math.max(0, Math.min(1, t));
    };
    const tPeak = quadPeakT(start.y, control.y, end.y);

    const posEase = EASES[NAV_ANIM.positionEase];
    const spinEase = EASES[NAV_ANIM.spinEase];

    const peakTau = invertEase(posEase, tPeak);
    const peakTimeMs = peakTau * NAV_ANIM.indicatorMs;

    const navEl = indicator.closest(".navigation") as HTMLElement | null;
    let baseHeight = 0;

    if (navEl) {
      baseHeight = navEl.getBoundingClientRect().height;

      const newHeight = baseHeight + NAV_ANIM.curveHeight / 2 + NAV_ANIM.spacer;

      let dur = NAV_ANIM.backdropMs;
      let delay = peakTimeMs - dur;
      if (delay < 0) {
        dur = peakTimeMs;
        delay = 0;
      }

      navEl.style.transitionProperty = "height";
      navEl.style.transitionTimingFunction =
        CSS_EASE[NAV_ANIM.backdropEase] || "linear";
      navEl.style.transitionDuration = `${Math.max(0, dur)}ms`;
      navEl.style.transitionDelay = `${Math.max(0, delay)}ms`;

      void navEl.offsetHeight;

      navEl.style.height = `${newHeight}px`;
    }

    const startTime = performance.now();
    const IND_MS = NAV_ANIM.indicatorMs;

    const tick = (now: number) => {
      const tLin = Math.min(1, (now - startTime) / IND_MS);
      const t = posEase(tLin);

      const x =
        (1 - t) * (1 - t) * start.x +
        2 * (1 - t) * t * control.x +
        t * t * end.x;

      const y =
        (1 - t) * (1 - t) * start.y +
        2 * (1 - t) * t * control.y +
        t * t * end.y;

      const spin = 360 * spinEase(tLin);
      indicator.style.transform = `translateX(${x}px) translateY(${y}px) rotate(${spin}deg)`;

      if (tLin < 1) {
        requestAnimationFrame(tick);
      } else {
        indicator.style.transform = `translateX(${end.x}px) translateY(${end.y}px) rotate(360deg)`;

        if (navEl) {
          navEl.style.transitionDelay = "0ms";
          navEl.style.height = `${baseHeight}px`;
        }
      }
    };

    requestAnimationFrame(tick);
  }, [indicatorPoints]);

  return (
    <ul className="navigation__links">
      <span className="indicator" ref={indicatorRef} />
      {links?.map((link, index) => (
        <li className={`link ${index === 2 && "active"}`} key={index}>
          <span className="ind"></span>
          <PrismicNextLink field={link} onClick={handleLinkClick}>
            <span className="link__text">{link.text}</span>
          </PrismicNextLink>
        </li>
      ))}
    </ul>
  );
};

export default NavigationLinks;
