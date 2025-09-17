import React, { FC } from "react";

interface NavBarProps {
  children?: React.ReactNode;
}

const NavBar: FC<NavBarProps> = ({ children }) => {
  return <>{children}</>;
};

export default NavBar;
