import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import csp from 'vite-plugin-csp';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(),
    nodePolyfills({
      globals: {
        Buffer: true,
      },
      protocolImports: true,
    }),
  
  ],
  build: {
    // Ensure the build does not use inline scripts
    rollupOptions: {
      output: {
        inlineDynamicImports: false
      }
    }
  },
  server: {
    hmr: false, // Disable HMR to avoid inline script injection
    headers: {
      'Content-Security-Policy': "connect-src https://*.dial.to/ https://proxy.dial.to/; img-src https://*.dial.to/ https://proxy.dial.to/;"
    }
  },
})
