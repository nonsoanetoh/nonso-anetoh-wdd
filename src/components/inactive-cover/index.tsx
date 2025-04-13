import Image from "next/image";
import React from "react";

const InactiveCover = () => {
  return (
    <section className="inactive-cover">
      <Image
        src="/sleep.png"
        width={300}
        height={440}
        alt="Nonso Anetoh - Asleep"
      />
    </section>
  );
};

export default InactiveCover;
