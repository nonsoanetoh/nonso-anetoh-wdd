import React, { FC } from "react";
import CTA from "./variants/cta";
import { LinkField } from "@prismicio/client";

interface ButtonProps {
  type: "cta";
  label: string;
  link: LinkField | string;
  linkType?: "within-page" | "external";
}

const Button: FC<ButtonProps> = ({ type, label, link, linkType }) => {
  const variations = {
    cta: CTA,
  };

  const ButtonComponent = variations[type as keyof typeof variations];

  if (!ButtonComponent) {
    return null;
  }

  return <ButtonComponent linkType={linkType} label={label} link={link} />;
};

export default Button;
