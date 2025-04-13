import { useState, useEffect } from "react";

const useVisibilityChange = () => {
  const [isVisible, setIsVisible] = useState(
    typeof document !== "undefined" && !document.hidden
  );

  const handleVisibilityChange = () => {
    if (!document.hidden) {
      setTimeout(() => {
        setIsVisible(true);
      }, 200);
    } else {
      setIsVisible(false);
    }
  };

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", handleVisibilityChange);
      return () => {
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange
        );
      };
    }
  }, []);

  return isVisible;
};

export default useVisibilityChange;
