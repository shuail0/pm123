import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Polymarket 主品牌色
        polyBlue: "#1652f0",
        polyRed: "#E23939",
        polyPink: "#e04569",
        magicPurple: "#6851FF",

        // 语义色
        success: "#219653",
        error: "#E64800",

        // 灰度系统
        gray: {
          1: "#333333",
          2: "#4F4F4F",
          3: "#828282",
          4: "#BDBDBD",
          5: "#E0E0E0",
          6: "#F2F2F2",
          7: "#858A98",
        },

        // 选举主题色
        electionRed: {
          3: "#EB5757",
          4: "#FF7671",
          5: "#FF5952",
        },
        electionBlue: {
          3: "#2D9CDB",
          4: "#538FFF",
          5: "#1B6AFF",
        },

        borderLight: "#E0E0E0",
      },
      fontFamily: {
        sans: ["var(--font-open-sauce)", "sans-serif"],
      },
      fontSize: {
        xxs: "0.625rem",
        xs: "0.75rem",
        sm: "0.875rem",
        md: "1rem",
        lg: "1.125rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
        "3xl": "1.75rem",
        "4xl": "2rem",
        "5xl": "2.25rem",
      },
      spacing: {
        navbar: "116px",
      },
      maxWidth: {
        content: "938px",
      },
      boxShadow: {
        tooltip: "0px 2px 8px rgba(0, 0, 0, 0.12)",
        sm: "0 1px 2px rgba(0, 0, 0, 0.02)",
        md: "0 2px 4px rgba(0, 0, 0, 0.05)",
        lg: "0 4px 8px rgba(0, 0, 0, 0.1)",
        "lg-dark": "0 4px 12px rgba(0, 0, 0, 0.175)",
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
      },
      screens: {
        sm: "600px",
        lg: "1024px",
      },
    },
  },
  plugins: [],
};

export default config;
