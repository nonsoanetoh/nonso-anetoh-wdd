import React, { FC } from "react";

interface AvatarProps {
  children?: React.ReactNode;
  state: "base" | "hover" | "collision";
}

const Avatar: FC<AvatarProps> = ({ children }) => {
  return <>{children}</>;
};

export default Avatar;
