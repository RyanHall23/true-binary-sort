import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.js',
      name: 'TrueBinarySort',
      formats: ['es', 'cjs'],
      fileName: (format) => `true-binary-sort.${format}.js`
    },
    rollupOptions: {
      external: [],
    }
  }
});
