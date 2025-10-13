import React, { FC } from "react";
import SVG from "./partials/svg";

export type TrinketComponentProps = {
  id: string;
  name: string;
  type: "static" | "interactive";
};

const Trinket: FC<TrinketComponentProps> = ({ id, name, type }) => {
  return <SVG id={id} name={name} type={type} />;
};

export default Trinket;
