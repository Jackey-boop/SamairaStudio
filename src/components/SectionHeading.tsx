import Squiggle from "./Squiggle";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  align?: "left" | "center";
  squiggleColor?: string;
  className?: string;
}

// Caveat heading with a hand-drawn squiggle underline + optional eyebrow.
export default function SectionHeading({
  eyebrow,
  title,
  align = "center",
  squiggleColor = "#E07A5F",
  className = "",
}: SectionHeadingProps) {
  const isCenter = align === "center";
  return (
    <div
      className={`${isCenter ? "text-center" : "text-left"} ${className}`}
    >
      {eyebrow && (
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-coral">
          {eyebrow}
        </p>
      )}
      <h2 className="font-hand text-4xl font-bold text-ink sm:text-5xl">
        {title}
      </h2>
      <div className={isCenter ? "mt-1 flex justify-center" : "mt-1"}>
        <Squiggle color={squiggleColor} width={Math.min(title.length * 11 + 40, 240)} />
      </div>
    </div>
  );
}
