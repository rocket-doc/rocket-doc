import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'lib'),
    },
  },
  test: {
    include: ['lib/**/*.test.ts'],
    environment: 'node',
  },
})
