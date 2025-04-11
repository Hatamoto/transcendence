import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Listen on 0.0.0.0
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true, // Required inside Docker for file changes to be detected
      interval: 100, // (optional) reduce CPU load if needed
    },
  },
})