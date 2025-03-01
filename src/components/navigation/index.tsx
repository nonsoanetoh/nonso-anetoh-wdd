"use client";
import React, { useEffect, useState } from "react";
import { MdEmail } from "@react-icons/all-files/md/MdEmail";
import { createClient } from "@/prismicio";
import { NavigationDocument } from "../../../prismicio-types";
import Link from "next/link";
import Calendly from "../calendly";
import Clock from "../clock";
import Logo from "../logo";

const links = [
  {
    label: "home",
    href: "/",
  },
  {
    label: "work",
    href: "/work",
  },
  {
    label: "Blog",
    href: "/blog",
  },
  {
    label: "Email",
    href: "mailto:nonsoanetoh@gmail.com",
  },
];

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
              <p>{navigationData?.data?.location}</p>
              <Clock />
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
          {links.map((link) => (
            <li key={link.label} className="nav__item">
              <Link className="nav__link" href={link.href}>
                <span>{link.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
};

export default Navigation;
