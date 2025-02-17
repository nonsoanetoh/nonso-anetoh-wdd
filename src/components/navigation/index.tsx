"use client";
import React, { useEffect, useState } from "react";
import { MdEmail } from "@react-icons/all-files/md/MdEmail";
import { createClient } from "@/prismicio";
import { NavigationDocument } from "../../../prismicio-types";
import Link from "next/link";
import Calendly from "../calendly";
import Clock from "../clock";
import Logo from "../logo";

const Navigation = () => {
  const [navigationData, setNavigationData] = useState<NavigationDocument>();
  const [isCollapsed, setIsCollapsed] = useState(true);

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
      <div
        className={`content-wrapper ${isCollapsed ? "collapsed" : "expanded"}`}
        onMouseEnter={() => setIsCollapsed(false)}
        onMouseLeave={() => setIsCollapsed(true)}
      >
        <div className="group">
          <h1>{navigationData?.data?.title}</h1>
          {!isCollapsed && (
            <Logo
              frames={navigationData?.data?.logo_frame || []}
              isCollapsed={isCollapsed}
            />
          )}
        </div>
        <div className="text-content">
          <p>{navigationData?.data?.label}</p>
          {!isCollapsed && (
            <>
              <Clock />
              <p>{navigationData?.data?.location}</p>
              <Link className="email-cta" href="mailto:nonsoanetoh@gmail.com">
                <span>Available for work</span>
                <MdEmail color="#FF4433" />
              </Link>
              <Calendly />
            </>
          )}
        </div>
      </div>
      <nav className="nav">
        <ul className="nav__list">
          {["Home", "About", "Projects", "Blog", "Contact"].map(
            (item, index) => {
              return (
                <li className="nav__item" key={index}>
                  <Link className="nav__link" href={`#${item.toLowerCase()}`}>
                    {item}
                  </Link>
                </li>
              );
            }
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Navigation;
