import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'LuxuryStay - Enterprise Hotel Booking',
        short_name: 'LuxuryStay',
        description: 'Premium enterprise hotel booking platform',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=512&h=512&fit=crop',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=512&h=512&fit=crop',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        // Group npm dependencies into a small number of cacheable vendor chunks
        // instead of one chunk per package (was ~70 tiny chunks, bad on mobile).
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          const pkg = id.toString().split('node_modules/')[1].split('/')[0];
          return pkg;
        }
      }
    }
  },
  define: {
    'import.meta.env.VITE_CLERK_PUBLISHABLE_KEY': JSON.stringify(process.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_ZW5nYWdpbmctZmlzaC00NC5jbGVyay5hY2NvdW50cy5kZXYk'),
    'import.meta.env.VITE_RAZORPAY_KEY': JSON.stringify(process.env.VITE_RAZORPAY_KEY || 'rzp_test_T7sZuIYyX4QpJO'),
    'import.meta.env.VITE_OPENROUTER_API_KEY': JSON.stringify(process.env.VITE_OPENROUTER_API_KEY || 'sk-or-v1-dummy'),
  },
})
