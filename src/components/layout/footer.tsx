"use client";
import React from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import EventIndicator from "../event-indicator";

gsap.registerPlugin(ScrollTrigger);

const Footer: React.FC = () => {
  return (
    <>
      <footer>
        <div className="card"></div>
      </footer>
      <EventIndicator />
    </>
  );
};

export default Footer;
