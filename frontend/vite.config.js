import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    // Optimize build output
    target: 'esnext',
    minify: 'terser',
    sourcemap: false,
    
    // Optimize chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks for better caching
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          charts: ['recharts'],
          stripe: ['@stripe/react-stripe-js', '@stripe/stripe-js'],
          // firebase: ['firebase'], // Removed - not using Firebase
          utils: ['axios', 'date-fns', 'framer-motion'],
        },
        // Optimize chunk naming
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    
    // Optimize bundle size
    chunkSizeWarningLimit: 1000,
    
    // Enable tree shaking
    treeshake: true,
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@mui/material',
      '@mui/icons-material',
      'axios',
      'date-fns',
    ],
  },
  
  // CSS optimization - let PostCSS config handle it
  css: {
    // PostCSS config is handled by postcss.config.js
  },
});

