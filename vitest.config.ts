import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@config': path.resolve(__dirname, './src/config'),
      '@interfaces': path.resolve(__dirname, './src/interfaces'),
      '@tools': path.resolve(__dirname, './src/tools'),
      '@validation': path.resolve(__dirname, './src/tools/validation'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
