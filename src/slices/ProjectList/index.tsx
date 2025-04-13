import { FC } from "react";
import { Content } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";
import ProjectListComponent from "@/components/project-list";

/**
 * Props for `ProjectList`.
 */
export type ProjectListProps = SliceComponentProps<Content.ProjectListSlice>;

/**
 * Component for "ProjectList" Slices.
 */
const ProjectList: FC<ProjectListProps> = ({ slice }) => {
  return <ProjectListComponent data={slice} />;
};

export default ProjectList;
