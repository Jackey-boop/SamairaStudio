import { CSSProperties } from "react";

interface SquiggleProps {
  className?: string;
  color?: string;
  width?: number | string;
  style?: CSSProperties;
}

// Hand-drawn squiggly underline. Drop it under a heading.
export default function Squiggle({
  className = "",
  color = "#E07A5F",
  width = 160,
  style,
}: SquiggleProps) {
  return (
    <svg
      className={className}
      width={width}
      height="12"
      viewBox="0 0 160 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      aria-hidden="true"
      style={style}
    >
      <path
        d="M2 7C20 2.5 30 2.5 48 6.5C66 10.5 78 10.5 96 6C114 1.5 128 1.5 158 6.5"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
