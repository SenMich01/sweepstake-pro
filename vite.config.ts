import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  root: "client",

  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client/src"),
      "@shared": path.resolve(
        __dirname,
        "shared"
      ),
      "@assets": path.resolve(
        __dirname,
        "attached_assets"
      ),
    },
  },

  server: {
    port: 5173,
  },

  build: {
    outDir: "../dist/public",
    emptyOutDir: true,
  },
});
