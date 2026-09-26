/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/renderer/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        palette: {
          base: "var(--palette-base)",
          surface: "var(--palette-surface)",
          border: "var(--palette-border)",
          muted: "var(--palette-muted)",
          charcoal: "var(--palette-charcoal)"
        },
        surface: {
          base: "var(--palette-base)",
          card: "var(--palette-surface)",
          glass: "var(--palette-glass)",
          border: "var(--palette-border)"
        }
      },
      animation: {
        "spin-slow": "spin 12s linear infinite",
        "pulse-subtle": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite"
      }
    }
  },
  plugins: []
};
