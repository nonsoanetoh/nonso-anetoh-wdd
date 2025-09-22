import { Content } from "@prismicio/client";
import React, { FC } from "react";
import RingGallery from "../partials/ring-gallery";

type AboutSlice = Extract<Content.HeroSlice, { variation: "about" }>;

const About: FC<{ data: AboutSlice }> = ({ data }) => {
  return (
    <section className="hero">
      <div className="inner">
        <p className="intro">{data.primary.intro}</p>
        <RingGallery images={data.primary.ring_gallery} />
      </div>
    </section>
  );
};

export default About;
