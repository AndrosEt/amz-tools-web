import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    },
    historyApiFallback: true
  },
  css: {
    preprocessorOptions: {
      scss: {
        charset: false,
        additionalData: `
          @use "sass:math";
          @use "@/styles/variables" as *;
        `
      }
    }
  }
})
