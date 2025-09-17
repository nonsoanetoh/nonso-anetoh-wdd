import React from "react";

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
      <button onClick={handleCalendly} className="book-cta">
        Book a Call
      </button>
    </>
  );
};

export default Calendly;
