import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        host: '0.0.0.0',
        port: 5173,
        proxy: {
            "/api": {
                target: "http://backend_container:5000", 
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path
            }
        }
    },
    preview: {
        host: '0.0.0.0',
        port: 5173
    },
    build: {
        sourcemap: true 
    }
})