import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import path from "node:path";

export default defineConfig({
  plugins: [preact()],
  base: "./",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src/renderer"),
      "@shared": path.resolve(__dirname, "./src/shared"),
      react: "preact/compat",
      "react-dom": "preact/compat"
    }
  },
  server: {
    port: 5173,
    strictPort: true
  },
  build: {
    outDir: "dist",
    emptyOutDir: true
  }
});
