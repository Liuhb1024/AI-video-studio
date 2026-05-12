import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#e8edf3",
          100: "#cfd9e5",
          200: "#a7b8cb",
          300: "#7f95b0",
          400: "#58708f",
          500: "#405776",
          600: "#31435d",
          700: "#243348",
          800: "#182534",
          900: "#0f1722",
          950: "#091018",
        },
        clay: {
          50: "#fff3e8",
          100: "#f7dcc9",
          200: "#ebb996",
          300: "#dc9364",
          400: "#c76f40",
          500: "#b6532f",
          600: "#913f28",
          700: "#6f3023",
          800: "#4f241d",
          900: "#321915",
        },
        stage: {
          50: "#fff6e8",
          100: "#ffe9c8",
          200: "#ffd394",
          300: "#ffba5f",
          400: "#f2a43a",
          500: "#d98a1c",
          600: "#b96c11",
          700: "#934f0f",
          800: "#723d10",
          900: "#5c3110",
          950: "#331a08",
        },
        teal: {
          50: "#e6fffb",
          100: "#bff7ef",
          200: "#90eadf",
          300: "#5ed6c9",
          400: "#34b9af",
          500: "#20958e",
          600: "#176f6a",
          700: "#145755",
          800: "#114644",
          900: "#0d3534",
          950: "#071d1d",
        },
      },
      boxShadow: {
        "stage-glow": "0 0 0 1px rgba(231, 180, 95, 0.2), 0 18px 60px rgba(231, 180, 95, 0.12)",
        panel: "0 22px 70px rgba(0, 0, 0, 0.42)",
      },
      backgroundImage: {
        "workspace-radial":
          "radial-gradient(circle at 14% 8%, rgba(231, 180, 95, 0.2), transparent 30%), radial-gradient(circle at 86% 14%, rgba(79, 189, 168, 0.15), transparent 30%), radial-gradient(circle at 56% 86%, rgba(182, 83, 47, 0.14), transparent 36%), linear-gradient(135deg, rgba(7, 9, 7, 0.9), rgba(17, 22, 16, 1))",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
