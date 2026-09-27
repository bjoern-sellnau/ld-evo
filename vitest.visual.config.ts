import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { alias: { '@content': path.resolve(import.meta.dirname, 'content'), '@': path.resolve(import.meta.dirname, 'src') } },
  test: { include: ['tests/visual/**/*.test.{ts,tsx}'], environment: 'node', testTimeout: 30_000, hookTimeout: 30_000 },
});
