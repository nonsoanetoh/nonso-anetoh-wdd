import React, { FC } from "react";
import SVG from "./partials/svg";
import { parseTrinkets } from "@/utils/trinkets";

export type TrinketComponentProps = ReturnType<typeof parseTrinkets> & {
  use?: string;
};

const Trinket: FC<TrinketComponentProps> = ({
  id,
  name,
  style,
  type,
  callback,
  size,
}) => {
  return (
    <SVG
      id={id}
      key={id}
      name={name}
      style={style}
      type={type}
      callback={callback}
      size={size}
    />
  );
};

export default Trinket;
