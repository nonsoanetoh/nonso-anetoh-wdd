import { Content } from "@prismicio/client";
import React, { FC } from "react";
import { RichTextComponent } from "../richtext";
import { PrismicImage } from "@prismicio/react";
import { slugify } from "@/utils/parseString";
import ServiceLegend from "../service-legend";
import Button from "../button";

interface PCProps {
  data: Content.ProcessSlice;
}

const ProcessComponent: FC<PCProps> = ({ data }) => {
  const mediaKeys = [
    [
      data?.primary.services[0]?.media_one,
      data?.primary.services[0]?.media_two,
      data?.primary.services[0]?.media_three,
      data?.primary.services[0]?.media_four,
    ],

    [
      data?.primary.services[1]?.media_one,
      data?.primary.services[1]?.media_two,
      data?.primary.services[1]?.media_three,
      data?.primary.services[1]?.media_four,
    ],

    [
      data?.primary.services[2]?.media_one,
      data?.primary.services[2]?.media_two,
      data?.primary.services[2]?.media_three,
      data?.primary.services[2]?.media_four,
    ],
    [
      data?.primary.services[3]?.media_one,
      data?.primary.services[3]?.media_two,
      data?.primary.services[3]?.media_three,
      data?.primary.services[3]?.media_four,
    ],
  ];

  const services = data?.primary.services.map((service) => service.title) ?? [];

  return (
    <section
      className="process"
      data-slice-type={data?.slice_type}
      data-slice-variation={data?.variation}
    >
      <div className="header">
        <div className="title">Title</div>
        {/* <div className="group">
          <div className="description">
            <p>{data.primary.description}</p>
          </div>
          <Button
            label={data.primary.cta.text ?? ""}
            link={data.primary.cta}
            linkType="external"
            type="cta"
          ></Button>
        </div> */}
      </div>
      {/* <div className="content">
        <ServiceLegend services={services} />
        {data?.primary.services.map((service, index) => {
          return (
            <div
              key={index}
              className={`card card--${index + 1}`}
              id={slugify(service.title ?? "")}
            >
              <div className="content">
                <div className="index">
                  <span>{index + 1}</span>
                </div>
                <div className="inner">
                  <div className="text">
                    <h3 className="title">{service.title}</h3>
                    <RichTextComponent field={service.description} />
                  </div>
                  <div className="medias">
                    {mediaKeys[index].map((media, index) => {
                      return (
                        <div className="media" key={index}>
                          <PrismicImage field={media} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div> */}
    </section>
  );
};

// <div className="card card--2">
//     <div className="content"></div>
//   </div>
//   <div className="card card--3">
//     <div className="content"></div>
//   </div>
//   <div className="card card--4">
//     <div className="content"></div>
//   </div>

export default ProcessComponent;
