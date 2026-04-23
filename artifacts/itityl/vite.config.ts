import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

const rawPort = process.env.PORT;

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH;

if (!basePath) {
  throw new Error(
    "BASE_PATH environment variable is required but was not provided.",
  );
}

const isProd = process.env.NODE_ENV === "production";

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    // The Replit runtime-error overlay is a dev helper — ship only in dev
    // so its module doesn't bloat the production bundle users download.
    ...(!isProd ? [runtimeErrorOverlay()] : []),
    ...(!isProd && process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, ".."),
            }),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    sourcemap: false,
    cssMinify: "lightningcss",
    // Split the 630KB mega-chunk into vendor groups so the browser can
    // cache them independently and parse them in parallel. These groups
    // are cherry-picked from what the bundle analyzer showed as the top
    // contributors.
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react/jsx-runtime"],
          framer: ["framer-motion"],
          router: ["wouter"],
          forms: ["react-hook-form", "@hookform/resolvers", "zod"],
          lenis: ["lenis"],
          query: ["@tanstack/react-query"],
        },
      },
    },
  },
  // Strip console.* and debugger calls from the production bundle — they
  // add up across the codebase and leak internal state to end users.
  esbuild: isProd ? { drop: ["console", "debugger"] } : undefined,
  server: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
