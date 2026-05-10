import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-opensans)", "system-ui", "sans-serif"],
        display: ["var(--font-montserrat)", "system-ui", "sans-serif"],
      },
      colors: {
        primary: "#2c6956",
        "primary-container": "#a8e6cf",
        "on-primary": "#ffffff",
        "on-primary-container": "#00382a",
        secondary: "#4a7c6a",
        "secondary-container": "#ccede2",
        "on-secondary-container": "#00382a",
        background: "#f8fafb",
        surface: "#ffffff",
        "surface-bright": "#ffffff",
        "surface-container": "#eceeef",
        "surface-container-low": "#f3f5f5",
        "surface-container-high": "#e4e7e7",
        "surface-container-lowest": "#ffffff",
        "surface-container-highest": "#dde0e0",
        "surface-variant": "#e1e3e4",
        "surface-dim": "#d8dada",
        "on-surface": "#191c1d",
        "on-surface-variant": "#404945",
        "inverse-surface": "#2e3132",
        "inverse-on-surface": "#f0f1f2",
        outline: "#707974",
        "outline-variant": "#bfc9c4",
        error: "#ba1a1a",
        "error-container": "#ffdad6",
        "on-error": "#ffffff",
        "on-error-container": "#93000a",
        tertiary: "#b45309",
        "tertiary-container": "#fef3c7",
        "on-tertiary": "#ffffff",
        "on-tertiary-container": "#78350f",
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};

export default config;
