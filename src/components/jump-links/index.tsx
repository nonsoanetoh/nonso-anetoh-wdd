"use client";
import React, { useEffect, useState } from "react";

interface JumpLink {
  id: string;
  label: string;
}

const JumpLinks = () => {
  const [jumpLinks, setJumpLinks] = useState<JumpLink[]>([]);

  useEffect(() => {
    const elements = document.querySelectorAll("[data-jump]");
    const links: JumpLink[] = Array.from(elements).map((element) => ({
      id: element.getAttribute("id") || "",
      label: element.getAttribute("data-jump") || "",
    }));
    setJumpLinks(links);
  }, []);

  return (
    <nav className="jump-links">
      <ul>
        {jumpLinks.map((link, index) => (
          <li key={link.id}>
            <span>{index + 1}.</span>
            <a className="jump-link" href={`#${link.id}`}>
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default JumpLinks;
