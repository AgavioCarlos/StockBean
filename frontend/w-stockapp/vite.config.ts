import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react-swc'
import svgr from 'vite-plugin-svgr'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), svgr()],
  server: {
    host: true,
    port: 5173,
    allowedHosts: ['stockapp', 'localhost', 'baluarte.agaviocarlos.com'],
    proxy: {        
        target: 'http://localhost:8080',
}
  },
  preview: {
    host: true,
    port: 5173,
    allowedHosts: ['stockapp', 'localhost', 'baluarte.agaviocarlos.com']
  }
})
