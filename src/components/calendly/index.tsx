import React from "react";
import Script from "next/script";

const Calendly = () => {
  const handleCalendly = () => {
    // @ts-expect-error: Calendly is not defined in the TypeScript types, but it exists in the global window object.
    window.Calendly.initPopupWidget({
      url: "https://calendly.com/nonsoanetoh/30min?hide_gdpr_banner=1",
    });
    return false;
  };

  return (
    <>
      <button onClick={handleCalendly} className="schedule-cta">
        Schedule a Call
      </button>
      <Script
        src="https://assets.calendly.com/assets/external/widget.js"
        type="text/javascript"
        async
      />
      <link
        href="https://assets.calendly.com/assets/external/widget.css"
        rel="stylesheet"
      />
    </>
  );
};

export default Calendly;
