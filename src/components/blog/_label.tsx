import React from "react";

const Label = ({ text }: { text: string }) => {
  return (
    <span className="section-label">
      <span className="inner">{text}</span>
    </span>
  );
};

export default Label;
