import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@content': path.resolve(import.meta.dirname, 'content'),
      '@': path.resolve(import.meta.dirname, 'src'),
      // Next ersetzt 'server-only' im Build; in Tests ist es ein leeres Modul.
      'server-only': path.resolve(import.meta.dirname, 'node_modules/next/dist/compiled/server-only/empty.js'),
    },
  },
  test: { include: ['tests/unit/**/*.test.{ts,tsx}'], environment: 'node' },
});
