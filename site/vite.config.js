import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/true-binary-sort/',
  plugins: [react()],
  define: {
    global: 'globalThis' // makes 'global' available like Node
  }
});
