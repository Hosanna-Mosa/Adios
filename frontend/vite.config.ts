import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  // Production builds ship without console.* calls; `npm run dev` keeps them.
  esbuild: mode === "production" ? { drop: ["console", "debugger"] } : undefined,
}));
