import { PrismicNextLink } from "@prismicio/next";
import React, { FC, useEffect, useState } from "react";
import { NavigationDocument } from "../../../../../prismicio-types";
import { usePathname, useRouter } from "next/navigation";
import { asLink } from "@prismicio/client";
import Link from "next/link";

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
  indicatorMs: 600,
  backdropMs: 400 as number,
  spinMs: 500,
  curveHeight: 80,
  spacer: 20,
  positionEase: "outExpo",
  spinEase: "outExpo",
  backdropEase: "outExpo",
  // Squash & stretch parameters
  anticipationMs: 100, // squish before takeoff
  squashIntensity: 0.75, // how much to squish (0.75 = 75% height)
  stretchIntensity: 1.15, // how much to stretch at peak
};

const NavigationLinks: FC<NavigationLinksProps> = ({ links }) => {
  const router = useRouter();
  const pathname = usePathname();
  const indicatorRef = React.useRef<HTMLSpanElement>(null);
  const [indicatorPoints, setIndicatorPoints] = useState<{
    start: { x: number; y: number };
    end: { x: number; y: number };
  } | null>(null);

  // Helper to check if link is active
  const isLinkActive = (link: any) => {
    // Get the href from the link using Prismic's asLink helper
    const linkPath = asLink(link) || "/";

    // Home page check
    if (linkPath === "/" || linkPath === "") {
      return pathname === "/";
    }

    // Other pages check
    return pathname.startsWith(linkPath);
  };

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
          indicator.style.transform = `translateX(${relativeLeft}px) translateY(${relativeTop}px) scale(1, 1)`;
          setTimeout(() => {
            indicator.style.visibility = "visible";
          }, 0);
        }
      }
    }
  }, [pathname]);

  const handleLinkClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault(); // Prevent default Prismic navigation

    const clickedLink = event.currentTarget;
    const parent = clickedLink.closest(".navigation__links");
    const href = clickedLink.getAttribute("href");

    // Don't animate if clicking the already active link
    const isAlreadyActive =
      clickedLink.parentElement?.classList.contains("active");
    if (isAlreadyActive) return;

    // Navigate with transition
    if (href) {
      router.push(href);
    }

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

    const posEase = EASES[NAV_ANIM.positionEase];

    const navEl = indicator.closest(".navigation") as HTMLElement | null;
    let baseHeight = 0;

    if (navEl) {
      baseHeight = navEl.getBoundingClientRect().height;
      const newHeight = baseHeight + NAV_ANIM.curveHeight / 2 + NAV_ANIM.spacer;

      // Expand: start immediately with smooth easing
      navEl.style.transitionProperty = "height";
      navEl.style.transitionTimingFunction =
        CSS_EASE[NAV_ANIM.backdropEase] || "linear";
      navEl.style.transitionDuration = `${NAV_ANIM.backdropMs}ms`;
      navEl.style.transitionDelay = "0ms";

      void navEl.offsetHeight;

      navEl.style.height = `${newHeight}px`;
    }

    const startTime = performance.now();
    const IND_MS = NAV_ANIM.indicatorMs;

    // Calculate squash & stretch based on animation progress
    const getSquashStretch = (tLin: number) => {
      const scaleX = 1;
      let scaleY = 1;

      if (tLin < 0.12) {
        // Squat: squish down from top before takeoff (0-12%)
        const squatT = tLin / 0.12;
        scaleY = 1 - (1 - NAV_ANIM.squashIntensity) * squatT;
      } else if (tLin < 0.2) {
        // Takeoff: release squish and start stretching (12-20%)
        const takeoffT = (tLin - 0.12) / 0.08;
        scaleY =
          NAV_ANIM.squashIntensity +
          (NAV_ANIM.stretchIntensity - NAV_ANIM.squashIntensity) * takeoffT;
      } else if (tLin < 0.7) {
        // In the air: maintain stretch longer (20-70%)
        scaleY = NAV_ANIM.stretchIntensity;
      } else if (tLin < 0.82) {
        // Descent: return to normal (70-82%)
        const descentT = (tLin - 0.7) / 0.12;
        scaleY =
          NAV_ANIM.stretchIntensity -
          (NAV_ANIM.stretchIntensity - 1) * descentT;
      } else if (tLin < 0.92) {
        // Landing squish from top (82-92%)
        const landT = (tLin - 0.82) / 0.1;
        scaleY = 1 - (1 - NAV_ANIM.squashIntensity) * Math.sin(landT * Math.PI);
      } else {
        // Settle back to rest (92-100%)
        const settleT = (tLin - 0.92) / 0.08;
        const eased = 1 - Math.pow(1 - settleT, 3);
        scaleY =
          NAV_ANIM.squashIntensity + (1 - NAV_ANIM.squashIntensity) * eased;
      }

      return { scaleX, scaleY };
    };

    let hasContracted = false;

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

      const { scaleX, scaleY } = getSquashStretch(tLin);

      indicator.style.transform = `translateX(${x}px) translateY(${y}px) scale(${scaleX}, ${scaleY})`;

      // Start contracting at 50% progress for smoother transition
      if (tLin >= 0.5 && navEl && !hasContracted) {
        hasContracted = true;
        const contractDelay = Math.max(0, IND_MS * 0.5 - (now - startTime));
        navEl.style.transitionDuration = `${NAV_ANIM.backdropMs}ms`;
        navEl.style.transitionDelay = `${contractDelay}ms`;
        navEl.style.height = `${baseHeight}px`;
      }

      if (tLin < 1) {
        requestAnimationFrame(tick);
      } else {
        indicator.style.transform = `translateX(${end.x}px) translateY(${end.y}px) scale(1, 1)`;
      }
    };

    requestAnimationFrame(tick);
  }, [indicatorPoints]);

  return (
    <ul className="navigation__links">
      <span className="indicator" ref={indicatorRef}>
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 10 10"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="1" y="1" width="12" height="12" fill="#D9D9D9" />
        </svg>
      </span>
      {links?.map((link, index) => {
        const href = asLink(link) || "/";

        return (
          <li
            className={`link ${isLinkActive(link) ? "active" : ""}`}
            key={index}
          >
            <span className="ind"></span>
            <Link href={href} onClick={handleLinkClick}>
              <span className="link__text">{link.text}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
};

export default NavigationLinks;
