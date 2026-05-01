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
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-manrope)", "system-ui", "sans-serif"],
      },
      colors: {
        primary: "#006b58",
        "primary-container": "#1abc9c",
        "on-primary": "#ffffff",
        "on-primary-container": "#004538",
        secondary: "#006b58",
        "secondary-container": "#82f7d8",
        "on-secondary-container": "#00725e",
        background: "#f8f9fa",
        surface: "#f8f9fa",
        "surface-bright": "#f8f9fa",
        "surface-container": "#edeeef",
        "surface-container-low": "#f3f4f5",
        "surface-container-high": "#e7e8e9",
        "surface-container-lowest": "#ffffff",
        "surface-container-highest": "#e1e3e4",
        "surface-variant": "#e1e3e4",
        "surface-dim": "#d9dadb",
        "on-surface": "#191c1d",
        "on-surface-variant": "#3c4a45",
        "inverse-surface": "#2e3132",
        "inverse-on-surface": "#f0f1f2",
        outline: "#6c7a75",
        "outline-variant": "#bbcac3",
        error: "#ba1a1a",
        "error-container": "#ffdad6",
        "on-error": "#ffffff",
        "on-error-container": "#93000a",
        tertiary: "#4e6073",
        "tertiary-container": "#96a9be",
        "on-tertiary": "#ffffff",
        "on-tertiary-container": "#2c3e50",
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};

export default config;
