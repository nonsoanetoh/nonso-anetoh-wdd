import { Content } from "@prismicio/client";
import React, { FC } from "react";
import ImageGrid from "../partials/image-grid";

type AboutSlice = Extract<Content.HeroSlice, { variation: "about" }>;

const About: FC<{ data: AboutSlice }> = ({ data }) => {
  return (
    <section className="hero">
      <div className="inner">
        <p className="intro">{data.primary.intro}</p>
        <ImageGrid images={data.primary.image_grid} />
      </div>
    </section>
  );
};

export default About;
