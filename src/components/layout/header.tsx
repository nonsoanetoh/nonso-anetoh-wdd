"use client";
import React, { FC } from "react";
import { NavigationDocument } from "../../../prismicio-types";
import Link from "next/link";

interface HeaderProps {
  data?: NavigationDocument;
}

const Header: FC<HeaderProps> = ({ data }) => {
  return (
    <>
      <header id="header">
        <div className="title">
          <Link href="/">
            <h1>{data?.data.title}</h1>
          </Link>
        </div>
        <p className="label">{data?.data.label}</p>
        <nav>
          <ul>
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>
              <Link href="/">About</Link>
            </li>
            <li>
              <Link href="/blog">Blog</Link>
            </li>
            <li>Contact</li>
            <li>Book a Call</li>
          </ul>
        </nav>
      </header>
    </>
  );
};

export default Header;
