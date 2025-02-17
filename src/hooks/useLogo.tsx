import { useEffect, useState } from "react";
import { usePrimaryPointerQuery } from "./usePrimaryPointerQuery";

const useLogo = (isCollapsed: boolean) => {
  const [visibleFrame, setVisibleFrame] = useState<string>("base");
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  const primaryPointer = usePrimaryPointerQuery();

  useEffect(() => {
    setIsMobile(primaryPointer === "coarse");
  }, [primaryPointer]);

  useEffect(() => {
    if (isCollapsed) {
      setIsAnimating(true);
      setVisibleFrame("open");

      const timer = setTimeout(() => {
        setVisibleFrame("base");
        setIsAnimating(false);
      }, 500);

      return () => clearTimeout(timer);
    } else {
      setVisibleFrame("base");
    }
  }, [isCollapsed]);

  const handleMouseEnter = () => {
    if (!isAnimating && !isMobile) {
      setVisibleFrame("rep");
    }
  };

  const handleMouseLeave = (callback?: () => void) => {
    if (!isAnimating && !isMobile) {
      setVisibleFrame("base");
      if (callback) {
        callback();
      }
    }
  };

  const handleClick = (callback?: () => void) => {
    if (!isAnimating && isMobile) {
      setVisibleFrame("rep");
      const timer = setTimeout(() => {
        setVisibleFrame("base");
        if (callback) {
          callback();
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  };

  return {
    visibleFrame,
    handleMouseEnter,
    handleMouseLeave,
    handleClick,
    isAnimating,
  };
};

export default useLogo;
