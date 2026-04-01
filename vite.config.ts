import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      '@tensorflow/tfjs',
      '@tensorflow-models/pose-detection'
    ]
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/]
    }
  }
})
