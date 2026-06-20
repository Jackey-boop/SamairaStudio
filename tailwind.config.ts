import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#FDFAF5",
        ink: "#1A1A1A",
        coral: {
          DEFAULT: "#E07A5F",
          dark: "#C8624A",
          light: "#F2A48E",
        },
        sage: "#81B29A",
        sand: "#F4F1EA",
      },
      fontFamily: {
        hand: ["var(--font-caveat)", "cursive"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        doodle: "4px 4px 0 0 rgba(26,26,26,0.08)",
        "doodle-coral": "4px 4px 0 0 rgba(224,122,95,0.25)",
      },
      keyframes: {
        wiggle: {
          "0%, 100%": { transform: "rotate(-1deg)" },
          "50%": { transform: "rotate(1deg)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        wiggle: "wiggle 1.5s ease-in-out infinite",
        "fade-up": "fade-up 0.5s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
