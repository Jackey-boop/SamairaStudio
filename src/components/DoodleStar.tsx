interface DoodleStarProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  color?: string;
}

const SIZES: Record<NonNullable<DoodleStarProps["size"]>, number> = {
  sm: 12,
  md: 18,
  lg: 28,
};

// Four-point sparkle ✦ used as a scattered accent.
export default function DoodleStar({
  size = "md",
  className = "",
  color = "#E07A5F",
}: DoodleStarProps) {
  const px = SIZES[size];
  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12 0.5C12.6 6.2 17.8 11.4 23.5 12C17.8 12.6 12.6 17.8 12 23.5C11.4 17.8 6.2 12.6 0.5 12C6.2 11.4 11.4 6.2 12 0.5Z"
        fill={color}
      />
    </svg>
  );
}
