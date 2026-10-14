import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { VitePWA } from "vite-plugin-pwa"
import { defineConfig } from "vite"
import { fileURLToPath } from "node:url"

export default defineConfig({
  base: process.env.BASE_PATH || "/",
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "robots.txt"],
      manifest: {
        name: "Sarashina Mercury",
        short_name: "Sarashina",
        description:
          "Sarashina AI を自分の API キーで使う、国産 LLM の PWA クライアント",
        lang: "ja",
        theme_color: "#020617",
        background_color: "#020617",
        display: "standalone",
        start_url: ".",
        scope: ".",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png"
          },
          {
            src: "pwa-maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ]
      }
    })
  ],
  build: {
    rollupOptions: {
      input: {
        app: "index.html"
      },
      output: {
        entryFileNames: "assets/sarashina-mercury-[hash].js",
        chunkFileNames: "assets/sarashina-mercury-[hash].js",
        assetFileNames: (assetInfo) => {
          const name = assetInfo.names?.[0] ?? assetInfo.name ?? ""
          if (name.endsWith(".css")) return "assets/sarashina-mercury-[hash][extname]"
          return "assets/[name]-[hash][extname]"
        }
      }
    }
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url))
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
