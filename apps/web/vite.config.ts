import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

/**
 * PWA (Stage 4B, ADR-012, F12): the service worker precaches the app's own files (HTML, JS,
 * CSS, bundled font, icons) so Lessonreel opens with no internet. It caches NOTHING from the
 * network at run time: Firebase, Gemini and App Check requests always go to the network (F12.5).
 */
export default defineConfig({
  server: { port: 5173 },
  // Same port as dev so the App Check debug token (stored per origin) keeps working.
  preview: { port: 5173, strictPort: true },
  build: { target: "es2022", sourcemap: true, chunkSizeWarningLimit: 1200 },
  plugins: [
    VitePWA({
      registerType: "prompt", // F12.4: ask before switching to a new version
      injectRegister: false, // registered in main.ts so we can show our own messages
      includeAssets: ["icon.svg", "apple-touch-icon.png"],
      manifest: {
        name: "Lessonreel",
        short_name: "Lessonreel",
        description:
          "Turn your lesson notes into a narrated explainer video, even with no internet.",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#faf7f0",
        theme_color: "#2f6f4f",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
          { src: "icon.svg", sizes: "any", type: "image/svg+xml" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff,woff2}"], // example/ clips load on demand, not for every visitor
        navigateFallback: "index.html",
        navigateFallbackDenylist: [/^\/__\//], // Firebase's reserved /__/ paths
        runtimeCaching: [], // F12.5: never cache API calls
        cleanupOutdatedCaches: true,
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
      },
      devOptions: { enabled: false },
    }),
  ],
});
