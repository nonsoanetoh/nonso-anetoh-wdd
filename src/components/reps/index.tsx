import React, { FC } from "react";

const formatNumber = (num: number) => {
  const formatter = new Intl.NumberFormat("en", { notation: "compact" });
  return formatter.format(num);
};

interface RepsProps {
  reps: number;
}

const Reps: FC<RepsProps> = ({ reps }) => {
  return (
    <div className="reps">
      <span>{formatNumber(reps)}</span>
    </div>
  );
};

export default Reps;
