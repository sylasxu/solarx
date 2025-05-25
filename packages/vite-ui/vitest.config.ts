import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { pigment } from '@pigment-css/vite-plugin'

export default defineConfig({
  plugins: [
    pigment({
      theme: {
        palette: {
          primary: {
            500: '#0ea5e9',
          },
        },
      },
    }),
    react(),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})