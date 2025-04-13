import React, { FC } from "react";
import { PrismicNextImage } from "@prismicio/next";
import { NavigationDocumentData } from "../../../prismicio-types";
import Reps from "../reps";

interface LogoProps {
  frames: NavigationDocumentData["logo_frame"] | [];
  isCollapsed: boolean;
}

const Logo: FC<LogoProps> = ({ frames }) => {
  const [reps] = React.useState(433);

  return (
    <div className="logo-wrapper">
      {frames.map((frame, index) => (
        <figure
          className="logo__frame"
          key={index}
          data-type={`${frame.image.alt}`}
          style={{
            display: "block",
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
