"use client";
import { useEffect } from "react";
import gsap from "gsap";

export default function PageScaler() {
  const updateOriginY = () => {
    const page = document.querySelector(".page") as HTMLElement;
    if (!page) return;

    const scrollTop = window.scrollY;
    const vh = window.innerHeight;
    const pageHeight = page.offsetHeight;

    const viewportCenter = scrollTop + vh / 2;
    const originY = (viewportCenter / pageHeight) * 100;

    page.style.setProperty("--origin-y", `${originY}%`);
  };

  const toggleScale = (enabled: boolean) => {
    const page = document.querySelector(".page") as HTMLElement;
    if (!page) return;

    const vw = window.innerWidth;
    const margin = 20 * 2;
    const targetScale = (vw - margin) / vw;
    const blrS = 1 - targetScale;

    // Set scale amount once
    page.style.setProperty("--blr-s", blrS.toString());

    // Animate progress and margin top only when zooming
    gsap.to(page, {
      "--blr-p": enabled ? 1 : 0,
      "--margin-top": enabled ? "20px" : "0px",
      duration: 1.2,
      ease: "power2.inOut",
      onUpdate: updateOriginY,
    });
  };

  useEffect(() => {
    const page = document.querySelector(".page") as HTMLElement;
    if (!page) return;

    page.style.setProperty("--blr-p", "0");
    page.style.setProperty("--blr-s", "0");
    page.style.setProperty("--origin-y", "50%");
    page.style.setProperty("--margin-top", "0px");

    updateOriginY();
    window.addEventListener("scroll", updateOriginY);
    window.addEventListener("resize", updateOriginY);
    return () => {
      window.removeEventListener("scroll", updateOriginY);
      window.removeEventListener("resize", updateOriginY);
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        zIndex: 9999999999999999999,
        top: 0,
        right: 0,
        padding: "1rem",
        width: "100vw",
        height: "100vh",
        alignItems: "center",
        justifyContent: "center",
        display: "flex",
        gap: "0.5rem",
        pointerEvents: "auto",
      }}
    >
      <button style={{ cursor: "pointer" }} onClick={() => toggleScale(true)}>
        Zoom Out
      </button>
      <button style={{ cursor: "pointer" }} onClick={() => toggleScale(false)}>
        Reset
      </button>
    </div>
  );
}
