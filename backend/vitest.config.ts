import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';

// SWC is required so decorator metadata is emitted (Nest DI depends on it).
export default defineConfig({
  plugins: [swc.vite({ module: { type: 'es6' } })],
  test: {
    globals: true,
    root: './',
    include: ['src/**/*.spec.ts'],
    setupFiles: ['./test/setup-env.ts'],
  },
});
