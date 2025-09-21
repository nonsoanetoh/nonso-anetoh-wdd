// components/Header.tsx
"use client";
import React, { FC, useEffect, useRef, useState } from "react";
import { NavigationDocument } from "../../../../prismicio-types";
import { useLenis } from "lenis/react";
import { PrismicLink } from "@prismicio/react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { PrismicNextLink } from "@prismicio/next";
import TrinketComponent from "../../trinket";
import NavigationLinks from "./partials/links";

interface HeaderProps {
  data?: NavigationDocument;
}

const Header: FC<HeaderProps> = ({ data }) => {
  return (
    <>
      <header className="header">
        <div className="mobile-header"></div>
        <nav className="navigation">
          <div className="inner">
            <div className="group">
              <div className="navigation__avatar">
                {/* <TrinketComponent name="avatar__base" style="static" /> */}
              </div>
              <div className="navigation__text-content">
                <h1 className="title">{data?.data.title}</h1>
                <p className="label">{data?.data.label}</p>
              </div>
            </div>
            <NavigationLinks links={data?.data.navigation_link} />
            <button className="contact-cta">
              <span>Say Hi</span>
            </button>
          </div>
        </nav>
      </header>
    </>
  );
};

export default Header;
