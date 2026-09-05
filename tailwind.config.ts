import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        paper: "#EEF1F5",
        "paper-line": "#C7D0DC",
        ink: "#10192B",
        navy: {
          DEFAULT: "#1F3358",
          dark: "#152441",
          light: "#375180",
        },
        accent: {
          DEFAULT: "#D9A441",
          dark: "#B9861F",
          light: "#F0CE85",
        },
        success: "#2F7D5D",
        danger: "#B3432B",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      backgroundImage: {
        blueprint:
          "linear-gradient(rgba(31,51,88,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(31,51,88,0.06) 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "28px 28px",
      },
    },
  },
  plugins: [],
};

export default config;
