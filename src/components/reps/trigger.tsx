"use client";
import React, { FC, useEffect } from "react";
import useLogo from "@/hooks/useLogo";
import { database } from "@/firebaseConfig";
import { ref, onValue, runTransaction } from "firebase/database";
import Image from "next/image";

interface TriggerProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
}

const Trigger: FC<TriggerProps> = ({ containerRef }) => {
  const { visibleFrame, handleMouseEnter, handleMouseLeave } = useLogo();
  const [, setCount] = React.useState(0);
  const images = [
    {
      path: "/counter-base.png",
      alt: "base",
    },
    {
      path: "/counter-alternate.png",
      alt: "rep",
    },
  ];

  useEffect(() => {
    const countRef = ref(database, "counter");
    onValue(countRef, (snapshot) => {
      const data = snapshot.val();
      setCount(data);
    });
  }, []);

  const incrementCounter = () => {
    const countRef = ref(database, "counter");
    runTransaction(countRef, (currentValue) => {
      return (currentValue || 0) + 1;
    });
  };

  return (
    <div
      ref={containerRef}
      className="rep-trigger"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => {
        handleMouseLeave();
        incrementCounter();
      }}
    >
      {/* <div className="content">
        <div className="image-container">
          {images.map((item, index) => {
            return (
              <Image
                data-type={`${item.alt}`}
                alt={item.alt}
                key={index}
                fill
                src={item.path}
                style={{
                  display: item.alt === visibleFrame ? "block" : "none",
                }}
              />
            );
          })}
        </div>
      </div> */}
    </div>
  );
};

export default Trigger;
