// Little hand-drawn signature squiggle for the footer.
export default function Signature({ className = "" }: { className?: string }) {
  return (
    <svg
      width="120"
      height="40"
      viewBox="0 0 120 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M4 28C10 12 16 12 18 24C20 36 26 36 30 22C33 11 38 12 40 24C41 31 45 30 50 20C56 8 62 24 70 24C78 24 80 14 88 14C96 14 96 26 104 26C110 26 112 22 116 16"
        stroke="#E07A5F"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
