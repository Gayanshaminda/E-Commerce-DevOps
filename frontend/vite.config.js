import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        host: '0.0.0.0',
        port: 5173,
        proxy: {
            "/api": {
                target: "https://e607-203-189-184-48.ngrok-free.app", // Use your ngrok public URL
                changeOrigin: true,
                secure: false, // Disable SSL verification if using HTTP
                rewrite: (path) => path // Keep the original path
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
});
