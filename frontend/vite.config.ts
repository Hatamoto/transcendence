import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Listen on 0.0.0.0
	proxy: {
		'/auth': 'http://auth-server:4000',
		'/api': 'http://main-server:5001',
		'/socket.io': {
			target: 'ws://main-server:5001',
			ws: true
		  }
	},
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true, // Required inside Docker for file changes to be detected
      interval: 100, // (optional) reduce CPU load if needed
    },
  },
})