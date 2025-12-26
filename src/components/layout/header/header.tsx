// components/Header.tsx
"use client";
import React, { FC, useState, useEffect, useRef } from "react";
import { NavigationDocument } from "../../../../prismicio-types";
import NavigationLinks from "./partials/links";
import { useDataContext } from "@/context/DataContext";
import Trinket from "../../trinket";
import gsap from "gsap";

interface HeaderProps {
  data?: NavigationDocument;
  isVisible?: boolean;
}

const Header: FC<HeaderProps> = ({ data, isVisible = true }) => {
  const { avatarConfettiRef } = useDataContext();
  const [clickCount, setClickCount] = useState(0);
  const [isCoolingDown, setIsCoolingDown] = useState(false);
  const [fillColor, setFillColor] = useState('#6FEA2A');
  const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<gsap.core.Tween | null>(null);
  const colorFlashRef = useRef<NodeJS.Timeout | null>(null);
  const fillRef = useRef<HTMLDivElement>(null);

  const maxClicks = 5;
  const cooldownDelay = 3000; // 3 seconds
  const resetDuration = 5; // 5 seconds
  const greenColor = '#6FEA2A';
  const redColor = '#FF6B6B';

  const animateToPercentage = (targetPercent: number, duration: number, onComplete?: () => void) => {
    if (animationRef.current) {
      animationRef.current.kill();
    }

    animationRef.current = gsap.to(fillRef.current, {
      height: `${targetPercent}%`,
      duration: duration,
      ease: "power2.out",
      onComplete: onComplete,
    });
  };

  const resetFill = (currentPercent: number) => {
    setIsCoolingDown(true);
    // Calculate duration proportional to current fill
    const proportionalDuration = (currentPercent / 100) * resetDuration;
    animateToPercentage(0, proportionalDuration, () => {
      setIsCoolingDown(false);
      setClickCount(0);
    });
  };

  const flashRed = () => {
    // Clear any existing flash timer
    if (colorFlashRef.current) {
      clearTimeout(colorFlashRef.current);
    }

    setFillColor(redColor);
    colorFlashRef.current = setTimeout(() => {
      setFillColor(greenColor);
    }, 300);
  };

  const handleAvatarClick = () => {
    // Don't allow clicks during cooldown, but flash red
    if (isCoolingDown) {
      flashRed();
      return;
    }

    // Clear any existing cooldown timer
    if (cooldownTimerRef.current) {
      clearTimeout(cooldownTimerRef.current);
    }

    const newClickCount = clickCount + 1;
    setClickCount(newClickCount);

    const newPercentage = (newClickCount / maxClicks) * 100;

    if (newClickCount >= maxClicks) {
      // Trigger confetti
      avatarConfettiRef?.current?.trigger();

      // Animate back to 0 over 5 seconds
      animateToPercentage(100, 0.2); // Quick fill to 100%
      setTimeout(() => {
        resetFill(100);
      }, 300);
    } else {
      // Animate to new percentage
      animateToPercentage(newPercentage, 0.3);

      // Start cooldown timer
      cooldownTimerRef.current = setTimeout(() => {
        resetFill(newPercentage);
      }, cooldownDelay);
    }
  };

  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) {
        clearTimeout(cooldownTimerRef.current);
      }
      if (colorFlashRef.current) {
        clearTimeout(colorFlashRef.current);
      }
      if (animationRef.current) {
        animationRef.current.kill();
      }
    };
  }, []);

  return (
    <>
      <header className="header" style={{
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? 'auto' : 'none',
        transition: 'opacity 0.3s ease'
      }}>
        <div className="mobile-header"></div>
        <nav className="navigation">
          <div className="inner">
            <div className="group">
              <div
                className="navigation__avatar"
                onClick={handleAvatarClick}
                style={{
                  cursor: isCoolingDown ? 'not-allowed' : 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  opacity: isCoolingDown ? 0.6 : 1,
                  transition: 'opacity 0.3s'
                }}
              >
                <div
                  ref={fillRef}
                  className="avatar-fill"
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    height: '0%',
                    backgroundColor: fillColor,
                    zIndex: 0,
                    pointerEvents: 'none',
                    transition: 'background-color 0.3s ease',
                  }}
                />
                <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%' }}>
                  <Trinket id="nav-avatar" name="avatar__base" type="static" />
                </div>
              </div>
              <div className="navigation__text-content">
                <h1 className="title">{data?.data.title}</h1>
                <p className="label">{data?.data.label}</p>
              </div>
            </div>
            <NavigationLinks links={data?.data.navigation_link} />
            <button className="contact-cta">
              <span>Say Hello</span>
            </button>
          </div>
        </nav>
      </header>
    </>
  );
};

export default Header;
