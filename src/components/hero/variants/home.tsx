"use client";
import { Content } from "@prismicio/client";
import React, { FC, useEffect, useMemo, useRef, useState } from "react";
import { parseTrinkets } from "@/utils/trinkets";
import TrinketComponent from "../../trinket";
import { FIXED_BODY_IDS } from "@/utils/constants";
import Matter from "matter-js";
import MatterCanvas from "../../matter";
import { ParsedTrinket } from "../../../../types/trinket";

type HomeSlice = Extract<Content.HeroSlice, { variation: "default" }>;

const Home: FC<{ data: HomeSlice }> = ({ data }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const matterContainer = useRef<HTMLDivElement | null>(null);
  const parsed = useMemo(() => {
    return parseTrinkets([
      ...data.primary.trinkets,
      ...data.primary.interactive_trinkets,
    ]);
  }, [data]);

  const [trinketData] = useState(() =>
    parsed.map((trinket: ParsedTrinket) => ({
      ...trinket,
      ref: React.createRef<HTMLDivElement>(),
    }))
  );

  useEffect(() => {
    console.log("trinket data - ", trinketData);
  }, [trinketData]);

  return (
    <section
      data-slice-type={data.slice_type}
      data-slice-variation={data.variation}
      className="hero"
      ref={containerRef}
    >
      <div className="matter-container">
        {trinketData.map((trinket: ParsedTrinket) => (
          <TrinketComponent
            id={trinket.id}
            key={trinket.id}
            name={trinket.name}
            ref={trinket.ref}
            style={trinket.style}
            type={trinket.type}
            callback={trinket.callback}
            size={trinket.size}
          />
        ))}
        <MatterCanvas trinketData={trinketData} />
      </div>
    </section>
  );
};

export default Home;
