import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  // Auto-detect environment: Linux (Docker) -> backend:8000, Windows -> localhost:8000
  const isWindows = process.platform === 'win32';
  const defaultTarget = isWindows ? 'http://localhost:8000' : 'http://backend:8000';

  const apiTarget = process.env.VITE_API_TARGET || env.VITE_API_TARGET || defaultTarget;

  console.log(`[Vite Proxy] Platform: ${process.platform}`);
  console.log(`[Vite Proxy] Configured API Target: ${apiTarget}`);

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 3000,
      host: true, // Listen on all addresses
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
