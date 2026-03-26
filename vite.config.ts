import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

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
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "pwa-icon-192.png", "pwa-icon-512.png"],
      manifest: {
        name: "Percentilers – CAT Coaching for 95+ Percentile",
        short_name: "Percentilers",
        description: "Structured CAT 2026 preparation with expert mentorship, mock analysis, and a proven 95+ percentile strategy.",
        theme_color: "#FF6A00",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        icons: [
          { src: "/pwa-icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/pwa-icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "/pwa-icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        navigateFallbackDenylist: [/^\/~oauth/],
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,woff2}"],
        // Exclude the FCM service worker from VitePWA's precache — it must be served fresh
        globIgnores: ["firebase-messaging-sw.js"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: "CacheFirst",
            options: { cacheName: "google-fonts", expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('lucide-react')) return 'vendor-icons';
          if (id.includes('node_modules/react-dom')) return 'vendor-react';
          if (id.includes('node_modules/react/')) return 'vendor-react';
          if (id.includes('react-router-dom') || id.includes('@remix-run') || id.includes('react-router')) return 'vendor-router';
          if (id.includes('framer-motion')) return 'vendor-motion';
          if (id.includes('@supabase')) return 'vendor-supabase';
          if (id.includes('@tanstack/react-query')) return 'vendor-query';
        },
      },
    },
    cssCodeSplit: true,
    target: 'es2020',
    minify: 'esbuild',
  },
}));
