"use client";
import React, { useEffect, useRef, useState } from "react";
import { Navigation as DesktopNavigation } from "./partials/desktop";
import MobileNavigation from "./partials/mobile";
import { createClient } from "@/prismicio";
import { SliceZone } from "@prismicio/react";
import { components } from "@/slices";
import { NavigationDocument } from "../../../prismicio-types";
// import { PrismicNextLink } from "@prismicio/next";
import gsap from "gsap";
import { Flip } from "gsap/Flip";

gsap.registerPlugin(Flip);

const Navigation = () => {
  const [navigationData, setNavigationData] = useState<NavigationDocument>();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const backgroundRef = useRef<HTMLDivElement | null>(null);
  const labelRef = useRef<HTMLParagraphElement | null>(null);
  const locationRef = useRef<HTMLParagraphElement | null>(null);
  const navLinksRef = useRef<(HTMLLIElement | null)[]>([]);
  const separatorRef = useRef<HTMLSpanElement | null>(null);
  const logoRef = useRef<HTMLDivElement | null>(null);
  const logoWrapperRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);
  const textContentRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchNavigationData = async () => {
      const client = createClient();
      const navigation = await client.getSingle("navigation");
      setNavigationData(navigation);
    };

    fetchNavigationData();
  }, []);

  const collapseHeader = () => {
    const state = Flip.getState(headerRef.current);

    gsap.set(logoWrapperRef.current, { display: "none" });
    gsap.set(headerRef.current, { height: "fit-content" });
    gsap.set(locationRef.current, { display: "none" });
    gsap.set(separatorRef.current, { display: "none" });
    gsap.set(textContentRef.current, {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
    });
    gsap.set(contentRef.current, {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
    });
    gsap.set(backgroundRef.current, {
      padding: "1rem",
      aspectRatio: "initial",
    });

    Flip.from(state, {
      duration: 0.5,
      ease: "power1.inOut",
    });

    setIsCollapsed(true);
  };

  const expandHeader = () => {
    const state = Flip.getState(headerRef.current);

    gsap.set(logoWrapperRef.current, { display: "block" });
    gsap.set(headerRef.current, { height: "auto" });
    gsap.set(locationRef.current, { display: "block" });
    gsap.set(separatorRef.current, { display: "block" });
    gsap.set(textContentRef.current, {
      display: "block",
      flexDirection: "column",
    });
    gsap.set(contentRef.current, {
      display: "block",
      flexDirection: "column",
    });
    gsap.set(backgroundRef.current, {
      padding: "0 2rem",
      aspectRatio: "510 / 194",
    });

    Flip.from(state, {
      duration: 0.5,
      ease: "power1.inOut",
    });

    setIsCollapsed(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0 && !isCollapsed) {
        collapseHeader();
      } else if (window.scrollY === 0 && isCollapsed) {
        expandHeader();
      }
    };

    const headerElement = headerRef.current;
    window.addEventListener("scroll", handleScroll);
    headerElement?.addEventListener("mouseenter", expandHeader);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      headerElement?.removeEventListener("mouseenter", expandHeader);
    };
  }, [isCollapsed]);

  return (
    <header id="header" ref={headerRef}>
      <div className="content-wrapper" ref={backgroundRef}>
        <div className="logo-wrapper" ref={logoWrapperRef}>
          {navigationData && (
            <SliceZone
              slices={navigationData.data.slices}
              components={components}
              context={{
                titleRef,
                backgroundRef,
                labelRef,
                locationRef,
                navLinksRef,
                separatorRef,
                logoRef,
                contentRef,
              }}
            />
          )}
        </div>
        <DesktopNavigation>
          <div className="text-content" ref={textContentRef}>
            <h1 ref={titleRef}>{navigationData?.data?.title}</h1>
            <p ref={labelRef}>{navigationData?.data?.label}</p>
            <p ref={locationRef}>{navigationData?.data?.location}</p>
            {/* <div className="language-switcher">
              <span className="label">LANGUAGE</span>
              <ul className="links">
                <li className={`link ${!isFrench ? "active" : ""}`}>
                  <PrismicNextLink href="/">English</PrismicNextLink>
                </li>
                <span>/</span>
                <li className={`link ${isFrench ? "active" : ""}`}>
                  <PrismicNextLink href="/fr-ca">French</PrismicNextLink>
                </li>
              </ul>
            </div> */}
          </div>
        </DesktopNavigation>
        <MobileNavigation />
      </div>
      <nav>
        <ul>
          {["Home", "About", "Work", "Blog", "Contact"].map((link, index) => (
            <li
              key={index}
              className="link"
              ref={(el) => {
                navLinksRef.current[index] = el;
              }}
            >
              <a>{link}</a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
};

export default Navigation;
