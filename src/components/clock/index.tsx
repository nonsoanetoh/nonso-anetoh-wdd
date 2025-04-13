import React, { FC, useEffect, useState } from "react";

interface ClockProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
}

const Clock: FC<ClockProps> = ({ containerRef }) => {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const vancouverTime = new Date().toLocaleString("en-US", {
        timeZone: "America/Vancouver",
        hour12: true,
        hour: "2-digit",
        minute: "2-digit",
      });
      setTime(vancouverTime);
    };

    updateTime();
    const intervalId = setInterval(updateTime, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div ref={containerRef} className="clock">
      {/* <span>{time}</span> */}
    </div>
  );
};

export default Clock;
