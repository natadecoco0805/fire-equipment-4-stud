import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [],
      manifest: {
        name: '消防設備士 甲種第4類 学習ノート',
        short_name: '甲4学習',
        description: '消防設備士甲種第4類の個人学習アプリ',
        theme_color: '#142b3b',
        background_color: '#f4f7f9',
        display: 'standalone',
        start_url: './',
        icons: []
      },
      workbox: { globPatterns: ['**/*.{js,css,html,svg,png,ico,json}'] }
    })
  ],
})
