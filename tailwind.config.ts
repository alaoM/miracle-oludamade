/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./content/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        magenta: "var(--magenta)",
        "magenta-dark": "var(--magenta-dark)",
        onion: "var(--onion)",
        "onion-soft": "var(--onion-soft)",
        sage: "var(--sage)",
        "sage-soft": "var(--sage-soft)",
        ivory: "var(--ivory)",
        surface: "var(--surface)",
        "surface-muted": "var(--surface-muted)",
        ink: "var(--ink)",
        "ink-muted": "var(--ink-muted)",
        "gold-hairline": "var(--gold-hairline)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        script: ["var(--font-script)", "cursive"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "1.25rem",
        panel: "1.5rem",
      },
      boxShadow: {
        soft: "0 10px 30px -12px rgba(58, 31, 45, 0.12)",
        card: "0 14px 40px -16px rgba(58, 31, 45, 0.14)",
      },
    },
  },
  plugins: [],
};

export default config;
