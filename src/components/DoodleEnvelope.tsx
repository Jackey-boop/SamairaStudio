import DoodleStar from "./DoodleStar";

// Hand-drawn envelope illustration used on the contact section and the
// order-success page.
export default function DoodleEnvelope({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <DoodleStar
        size="sm"
        className="absolute -left-2 top-2"
        color="#E07A5F"
      />
      <DoodleStar
        size="md"
        className="absolute right-0 -top-3"
        color="#81B29A"
      />
      <DoodleStar
        size="sm"
        className="absolute -right-1 bottom-4"
        color="#E07A5F"
      />
      <svg
        viewBox="0 0 220 150"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-[260px]"
        aria-hidden="true"
      >
        <rect
          x="10"
          y="20"
          width="200"
          height="120"
          rx="10"
          fill="#fff"
          stroke="#1A1A1A"
          strokeWidth="2.5"
        />
        <path
          d="M12 28L110 92L208 28"
          stroke="#1A1A1A"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 134L80 78"
          stroke="#1A1A1A"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M208 134L140 78"
          stroke="#1A1A1A"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M70 50C90 44 130 44 150 50"
          stroke="#E07A5F"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
