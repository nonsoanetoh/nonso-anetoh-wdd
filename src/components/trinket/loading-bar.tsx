import React, { FC, useRef } from "react";

interface LoadingBarProps {
  value: number;
  onChange: (value: number) => void;
}

const LoadingBar: FC<LoadingBarProps> = ({ value, onChange }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleOpacity = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseInt(e.target.value));
  };

  const thumbPosition = ((value - 0) / (100 - 0)) * 100;

  return (
    <div
      className="loading-bar"
      style={
        {
          "--thumb-position": thumbPosition,
        } as React.CSSProperties
      }
    >
      <input
        ref={inputRef}
        onChange={handleOpacity}
        type="range"
        min="0"
        max="100"
        value={value}
        id="opacity"
      />

      <label className="indicator" htmlFor="opacity">
        {value}
      </label>
    </div>
  );
};

export default LoadingBar;
