import { defineConfig } from "vite";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), reactRouter()],
  base: "/",
  build: {
    // Keep every image a file. Inlined as base64, small icons would land in
    // the JavaScript every page loads up front, where they barely compress.
    assetsInlineLimit: 0,
  },
});
