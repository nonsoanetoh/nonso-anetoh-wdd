import { Content } from "@prismicio/client";
import React, { FC } from "react";
import { extractLink } from "@/utils/parseString";
import Link from "next/link";
import { PrismicNextImage } from "@prismicio/next";
import Button from "../button";
import IndentedSectionTitle from "../text/indented-section-title";

interface PLProps {
  data: Content.ProjectListSlice;
}

const ProjectListComponent: FC<PLProps> = ({ data }) => {
  return (
    <section
      id="work"
      className="project-list"
      data-slice-type={data.slice_type}
      data-slice-variation={data.variation}
    >
      <div className="header">
        <IndentedSectionTitle text={data.primary.title ?? ""} />
        <div className="group">
          <p>{data.primary.description}</p>
          <Button
            label={"Add to the list"}
            link={"/"}
            type="cta"
            linkType="external"
          />
        </div>
      </div>

      <ul className="list">
        {data.primary.projects?.map((project, index) => {
          return (
            <li key={index}>
              <div className="col col--index">
                <div className="head">0{index + 1}</div>
              </div>
              <div className="col col--info">
                <div className="head">
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                </div>
                <div className="content">
                  <div className="media">
                    <PrismicNextImage field={project.media} fallbackAlt="" />
                  </div>
                </div>
              </div>
              <div className="col col--tools">
                <div className="head">
                  <h4>Prominent Tools</h4>
                </div>
                <div className="content">
                  {project.prominent_tools?.split("\n").map((tool, i) => {
                    return (
                      <span className="line " key={i}>
                        {tool}
                      </span>
                    );
                  })}
                </div>
              </div>
              <div className="col col--work">
                <div className="head">
                  <h4>Work Done</h4>
                </div>
                <div className="content">
                  {project.work_done?.split("\n").map((wd, i) => {
                    return (
                      <span className="line" key={i}>
                        {wd}
                      </span>
                    );
                  })}
                </div>
              </div>
              <div className="col col--collab">
                <div className="head">
                  <h4>Collaborators</h4>
                </div>
                <div className="content">
                  {project.collaborators?.split("\n").map((collab, i) => {
                    const { link, text } = extractLink(collab);
                    return (
                      <React.Fragment key={i}>
                        {link ? (
                          <Link
                            href={link}
                            target="_blank"
                            rel="norefferrer"
                            key={i}
                            className="line"
                          >
                            {text}
                          </Link>
                        ) : (
                          <span className="line" key={i}>
                            {text}
                          </span>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default ProjectListComponent;
