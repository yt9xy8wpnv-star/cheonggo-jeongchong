import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#253E8B",
          deep: "#172554",
          red: "#B91C1C",
          ink: "#111111",
          muted: "#64748B",
          line: "#E5E7EB",
          soft: "#F8FAFC"
        }
      },
      boxShadow: {
        soft: "0 8px 24px rgba(15, 23, 42, 0.06)"
      }
    }
  },
  plugins: []
};

export default config;
