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
          base: "#F2EFE9",
          surface: "#E9E5DC",
          border: "#BFBFBD",
          muted: "#8C8C8C",
          charcoal: "#262626"
        },
        surface: {
          base: "#F2EFE9",
          card: "#E9E5DC",
          glass: "rgba(233, 229, 220, 0.85)",
          border: "#BFBFBD"
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
