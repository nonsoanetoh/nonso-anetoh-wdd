import React, { FC } from "react";
import Navigation from "../navigation";

interface PCProps {
  children: React.ReactNode;
}

const PageContent: FC<PCProps> = ({ children }) => {
  return (
    <section className="layout">
      <div id="page">
        <Navigation />
        {children}
      </div>
    </section>
  );
};

export default PageContent;
