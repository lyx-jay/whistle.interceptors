import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/server.ts', 'src/uiServer/index.ts'],
  format: ['cjs'],
  clean: true,
  minify: true,
  splitting: false,
  sourcemap: false,
  outDir: 'dist'
})