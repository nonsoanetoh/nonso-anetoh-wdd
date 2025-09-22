import { Content } from "@prismicio/client";
import React, { FC } from "react";

type AboutSlice = Extract<Content.HeroSlice, { variation: "about" }>;

const About: FC<{ data: AboutSlice }> = ({ data }) => {
  return (
    <section className="hero">
      <p>{data.primary.intro}</p>
    </section>
  );
};

export default About;
