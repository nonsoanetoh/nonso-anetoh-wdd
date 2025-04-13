import { useEffect, useState } from "react";

const useLogo = () => {
  const [visibleFrame, setVisibleFrame] = useState<string>("base");

  useEffect(() => {
    setVisibleFrame("base");
  }, []);

  const handleMouseEnter = () => {
    setVisibleFrame("rep");
  };

  const handleMouseLeave = () => {
    setVisibleFrame("base");
  };

  return {
    visibleFrame,
    handleMouseEnter,
    handleMouseLeave,
  };
};

export default useLogo;
