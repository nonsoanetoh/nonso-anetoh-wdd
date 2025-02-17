import React, { FC } from "react";
import { NavigationDocumentData } from "../../../prismicio-types";
import { PrismicNextImage } from "@prismicio/next";
import useLogo from "@/hooks/useLogo";
import Reps from "../reps";

interface LogoProps {
  frames: NavigationDocumentData["logo_frame"] | [];
  isCollapsed: boolean;
}

const Logo: FC<LogoProps> = ({ frames, isCollapsed }) => {
  const {
    visibleFrame,
    handleMouseEnter,
    handleMouseLeave,
    handleClick,
    isAnimating,
  } = useLogo(isCollapsed);

  const [reps, setReps] = React.useState(433);

  const incrementReps = () => {
    setReps(reps + 1);
  };

  const onMouseLeave = () => {
    if (!isAnimating) handleMouseLeave(incrementReps);
  };

  const handleMouseClick = () => {
    if (!isAnimating) handleClick(incrementReps);
  };

  return (
    <div
      className="logo-wrapper"
      onMouseEnter={handleMouseEnter}
      onClick={handleMouseClick}
      onMouseLeave={onMouseLeave}
    >
      {frames.map((frame, index) => (
        <figure
          className="logo__frame"
          key={index}
          data-type={`${frame.image.alt}`}
          style={{
            display: frame.image.alt === visibleFrame ? "block" : "none",
          }}
        >
          <PrismicNextImage field={frame.image} alt="" />
        </figure>
      ))}
      <Reps reps={reps} />
    </div>
  );
};

export default Logo;
