import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { VitePWA } from "vite-plugin-pwa"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "robots.txt", "apple-touch-icon.png"],
      manifest: {
        name: "Sarashina Mercury",
        short_name: "Sarashina",
        description: "Sarashina AI専用PWAチャットツール",
        theme_color: "#020617",
        background_color: "#020617",
        display: "standalone",
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      "@": "/src"
    }
  },
  server: {
    proxy: {
      "/proxy/sarashina": {
        target: "https://api.sarashina.ai",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy\/sarashina/, "")
      }
    }
  }
})
