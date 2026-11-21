import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        id: './',
        name: 'Kospet.uz',
        short_name: 'Kospet',
        description: 'Official Kospet Uzbekistan Store',
        start_url: './',
        scope: './',
        display: 'standalone',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        icons: [
          {
            src: '/pwa.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa2.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
});