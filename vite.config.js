import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [react()],
    
    // Build configuration
    build: {
      outDir: 'dist',
      sourcemap: mode === 'development',
      minify: mode === 'production' ? 'terser' : false,
      terserOptions: mode === 'production' ? {
        compress: {
          drop_console: true, // Remove console.log in production
          drop_debugger: true, // Remove debugger statements
        },
      } : {},
      rollupOptions: {
        output: {
          manualChunks: {
            // Split vendor code for better caching
            vendor: ['react', 'react-dom', 'react-router-dom'],
            axios: ['axios'],
          },
        },
      },
      chunkSizeWarningLimit: 1000, // Warn if chunk > 1MB
    },

    // Server configuration (development)
    server: {
      port: 5173,
      strictPort: false,
      host: true,
      open: false,
    },

    // Preview configuration (production preview)
    preview: {
      port: 4173,
      strictPort: false,
      host: true,
    },

    // Environment variables prefix
    envPrefix: 'VITE_',
  };
});
