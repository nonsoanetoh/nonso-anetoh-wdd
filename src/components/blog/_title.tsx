"use client";
import * as prismic from "@prismicio/client";
import { PrismicNextImage } from "@prismicio/next";
import React, { FC } from "react";

type TitleProps = {
  title?: prismic.RichTextField;
  gif?: prismic.ImageField<never>;
};

const Title: FC<TitleProps> = ({ title, gif }) => {
  return (
    <div className="title-wrapper">
      <figure>
        <PrismicNextImage field={gif} width={100} height={100} fallbackAlt="" />
      </figure>
      <h1>{prismic.asText(title)}</h1>
    </div>
  );
};

export default Title;
