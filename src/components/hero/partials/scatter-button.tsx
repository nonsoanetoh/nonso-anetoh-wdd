import React, { forwardRef } from "react";

const ScatterButton = forwardRef<HTMLDivElement>((props, ref) => {
  return <div ref={ref}>ScatterButton</div>;
});

ScatterButton.displayName = "ScatterButton";

export default ScatterButton;
