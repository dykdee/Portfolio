import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      outDir: 'dist',
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return;

            if (
              id.includes('/react/')
              || id.includes('/react-dom/')
              || id.includes('/react-router-dom/')
              || id.includes('/scheduler/')
            ) {
              return 'react-vendor';
            }

            if (id.includes('/firebase/')) {
              return 'firebase-vendor';
            }

            if (
              id.includes('/recharts/')
              || id.includes('/d3-')
              || id.includes('/victory-vendor/')
            ) {
              return 'charts-vendor';
            }
          },
        },
      },
    },
    server: {
      port: 8000,
      host: '0.0.0.0',
      middlewareMode: false,
      hmr: process.env.DISABLE_HMR !== 'true',
      proxy: {
        '/api': {
          target: process.env.VITE_BACKEND_URL || 'http://127.0.0.1:4001',
          changeOrigin: false,
          ws: true,
          rewrite: (path) => path,
        },
      },
    },
  };
});