import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  outDir: 'dist',
  clean: true,
  dts: true,
  minify: false,
  sourcemap: false,
  target: 'node18',
  splitting: false,
  treeshake: true,
});
