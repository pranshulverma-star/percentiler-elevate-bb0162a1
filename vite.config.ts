import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
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
