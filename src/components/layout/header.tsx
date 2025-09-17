// components/Header.tsx
"use client";
import React, { FC, useEffect, useRef, useState } from "react";
import { NavigationDocument } from "../../../prismicio-types";
import { useLenis } from "lenis/react";
import { PrismicLink } from "@prismicio/react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { PrismicNextLink } from "@prismicio/next";
import TrinketComponent from "../trinket";

interface HeaderProps {
  data?: NavigationDocument;
}

const Header: FC<HeaderProps> = ({ data }) => {
  return (
    <>
      <header className="header">
        <nav className="navigation">
          <div className="group">
            <div className="navigation__avatar">
              {/* <TrinketComponent name="avatar__base" style="static" /> */}
            </div>
            <div className="navigation__text-content">
              <h1 className="title">{data?.data.title}</h1>
              <p className="label">{data?.data.label}</p>
            </div>
          </div>
          <ul className="navigation__links">
            <li className="link">
              <PrismicNextLink field={null}>
                <span className="link__text">About</span>
              </PrismicNextLink>
            </li>
            <li className="link">
              <PrismicNextLink field={null}>
                <span className="link__text">Blog</span>
              </PrismicNextLink>
            </li>
          </ul>
        </nav>
      </header>
    </>
  );
};

export default Header;
