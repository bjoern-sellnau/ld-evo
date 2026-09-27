import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { alias: { '@content': path.resolve(import.meta.dirname, 'content'), '@': path.resolve(import.meta.dirname, 'src') } },
  test: { include: ['tests/unit/**/*.test.{ts,tsx}'], environment: 'node' },
});
