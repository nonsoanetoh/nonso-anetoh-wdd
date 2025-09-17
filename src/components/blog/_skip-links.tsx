"use client";
import React, { useEffect, useState } from "react";
import Label from "./_label";

interface SkipLink {
  id: string;
  label: string;
}

const SkipLinks = () => {
  const [skipLinks, setSkipLinks] = useState<SkipLink[]>([]);
  const [activeLinkIndex, setActiveLinkIndex] = useState(0);

  useEffect(() => {
    const elements = document.querySelectorAll("[data-skip]");
    const links: SkipLink[] = Array.from(elements).map((element) => ({
      id: element.getAttribute("id") || "",
      label: element.getAttribute("data-skip") || "",
    }));
    setSkipLinks(links);
  }, []);

  return (
    <nav className="skip-links">
      <Label text="Chapters" />
      <ul>
        {skipLinks.map((link, index) => (
          <li key={link.id}>
            <a
              className={`skip-link${index === activeLinkIndex ? " active" : ""}`}
              href={`#${link.id}`}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default SkipLinks;
