import React, { FC } from "react";

const LoadingBar: FC = () => {
  return (
    <div
      className="loading-bar"
      style={{
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  );
};

export default LoadingBar;
