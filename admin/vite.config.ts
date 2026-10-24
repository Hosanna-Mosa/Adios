import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

/**
 * Content-Security-Policy for the production build. The admin keeps its session
 * token in localStorage, so the real guard against a stolen token is that no
 * injected script can run: scripts load only from this origin, Google Maps and
 * Google Tag Manager (Firebase Analytics), and inline scripts / on* handlers are
 * refused. Styles keep 'unsafe-inline' (Radix, charts and Google Maps set
 * inline styles); images allow any https URL because they come from API data
 * (Cloudinary, restaurant photos). Build-only: the dev server needs inline
 * scripts for hot reload. A new external script or API host must be added here.
 */
function contentSecurityPolicy(apiUrl: string | undefined): Plugin {
  let apiOrigin = "";
  try {
    apiOrigin = apiUrl ? new URL(apiUrl).origin : "";
  } catch {
    apiOrigin = "";
  }
  const socketOrigin = apiOrigin.replace(/^http/, "ws");
  const policy = [
    "default-src 'self'",
    // Google hosts per the Maps JavaScript API CSP guide, plus Tag Manager for Analytics.
    "script-src 'self' blob: https://*.googleapis.com https://*.gstatic.com https://*.google.com https://*.ggpht.com https://*.googleusercontent.com https://www.googletagmanager.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    `connect-src 'self' ${apiOrigin} ${socketOrigin} https://*.googleapis.com https://*.gstatic.com https://*.google.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com data: blob:`,
    "worker-src 'self' blob:",
    "frame-src https://*.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
  return {
    name: "admin-content-security-policy",
    apply: "build",
    transformIndexHtml: () => [
      { tag: "meta", attrs: { "http-equiv": "Content-Security-Policy", content: policy }, injectTo: "head-prepend" },
    ],
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    contentSecurityPolicy(loadEnv(mode, process.cwd(), "VITE_").VITE_API_URL),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
}));
