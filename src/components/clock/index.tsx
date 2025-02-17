import React, { useEffect, useState } from "react";

const Clock = () => {
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

  return <span className="clock">{time}</span>;
};

export default Clock;
