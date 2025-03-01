import Link from "next/link";
import React from "react";

const BackButton = () => {
  return (
    <Link href="/blog" className="back-button">
      <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="36" height="36" rx="18" fill="#7F7D7D" />
        <path
          d="M7.98235 17.2929C7.59182 17.6834 7.59182 18.3166 7.98235 18.7071L14.3463 25.0711C14.7368 25.4616 15.37 25.4616 15.7605 25.0711C16.151 24.6805 16.151 24.0474 15.7605 23.6569L10.1037 18L15.7605 12.3431C16.151 11.9526 16.151 11.3195 15.7605 10.9289C15.37 10.5384 14.7368 10.5384 14.3463 10.9289L7.98235 17.2929ZM26.6895 17H8.68945V19H26.6895V17Z"
          fill="white"
        />
      </svg>

      <span>Back to blog list</span>
    </Link>
  );
};

export default BackButton;
