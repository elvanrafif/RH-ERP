import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Pisahkan library berat ke chunk sendiri supaya tidak ikut
        // ke bundle awal. Chunk ini hanya di-download saat halaman
        // yang memakainya benar-benar dibuka.
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-charts": ["recharts"],
          "vendor-calendar": [
            "@fullcalendar/react",
            "@fullcalendar/daygrid",
            "@fullcalendar/interaction",
            "@fullcalendar/list",
          ],
          "vendor-motion": ["framer-motion"],
          "vendor-dnd": ["@hello-pangea/dnd"],
          "vendor-query": ["@tanstack/react-query", "@tanstack/react-table"],
        },
      },
    },
  },
})