"use client";
import React, { useEffect, useState } from "react";
import { Navigation as DesktopNavigation } from "./partials/desktop";
import MobileNavigation from "./partials/mobile";
import { createClient } from "@/prismicio";
import { NavigationDocument } from "../../../prismicio-types";
import gsap from "gsap";
import { Flip } from "gsap/Flip";

gsap.registerPlugin(Flip);

const Navigation = () => {
  const [navigationData, setNavigationData] = useState<NavigationDocument>();

  useEffect(() => {
    const fetchNavigationData = async () => {
      const client = createClient();
      const navigation = await client.getSingle("navigation");
      setNavigationData(navigation);
    };

    fetchNavigationData();
  }, []);

  return (
    <header id="header">
      header
      <div className="content-wrapper">
        <div className="logo-wrapper"></div>
        <DesktopNavigation>
          <div className="text-content">
            <h1>{navigationData?.data?.title}</h1>
            <p>{navigationData?.data?.label}</p>
            <p>{navigationData?.data?.location}</p>
          </div>
        </DesktopNavigation>
        <MobileNavigation />
      </div>
      <nav>
        {/* <ul>
          {["Home", "About", "Work", "Blog", "Contact"].map((link, index) => (
            <li
              key={index}
              className="link"
              ref={(el) => {
                navLinksRef.current[index] = el;
              }}
            >
              <a>{link}</a>
            </li>
          ))}
        </ul> */}
      </nav>
    </header>
  );
};

export default Navigation;
