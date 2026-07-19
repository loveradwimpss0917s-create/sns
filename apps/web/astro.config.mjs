import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import cloudflare from "@astrojs/cloudflare";
import AstroPWA from "@vite-pwa/astro";

// Vlog管制室 — Astro + React islands, deployed to Cloudflare Pages (SSR via Pages Functions).
// See docs/Architecture.md for the full rationale.
export default defineConfig({
  output: "server",
  adapter: cloudflare({ imageService: "cloudflare" }),
  integrations: [
    react(),
    tailwind({ applyBaseStyles: false }),
    AstroPWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "icons/*.svg"],
      manifest: {
        name: "Vlog管制室 | Vlog Control Room",
        short_name: "Vlog管制室",
        description: "顔出し・声出しゼロで資産化するライフスタイルブランドのAI運営OS",
        theme_color: "#2B2A28",
        background_color: "#EFE6D8",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "/icons/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
          { src: "/icons/icon-512.svg", sizes: "512x512", type: "image/svg+xml" },
          {
            src: "/icons/icon-512-maskable.svg",
            sizes: "512x512",
            type: "image/svg+xml",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        navigateFallback: "/offline",
        globPatterns: ["**/*.{css,js,html,svg,png,ico,woff2}"],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith("/api/"),
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "api-cache",
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
          {
            urlPattern: ({ request }) => request.destination === "image",
            handler: "CacheFirst",
            options: {
              cacheName: "image-cache",
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
});
