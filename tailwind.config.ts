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
          50: "#e6f4ff",
          100: "#cae8ff",
          200: "#9ad4ff",
          300: "#66bcff",
          400: "#33a3ff",
          500: "#0087f5",
          600: "#0068be",
          700: "#004f91",
          800: "#003868",
          900: "#00264a"
        }
      },
      fontFamily: {
        display: ["Poppins", "ui-sans-serif", "system-ui", "sans-serif"],
        body: ["Nunito Sans", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      boxShadow: {
        panel: "0 10px 40px rgba(0, 56, 104, 0.15)"
      }
    }
  },
  plugins: []
};

export default config;
