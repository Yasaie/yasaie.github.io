import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react-swc'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'
import { diskIndex } from './build/disk-index/disk-index.ts'

const disk = fileURLToPath(new URL('./disk', import.meta.url))

export default defineConfig({
  plugins: [react(), tailwindcss(), tsconfigPaths(), diskIndex({ root: disk })],
  publicDir: disk,
  build: {
    target: 'esnext',
    sourcemap: true,
  },
  test: {
    environment: 'jsdom',
    globals: false,
    css: true,
    setupFiles: ['./src/test/setup/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'build/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.{ts,tsx}', 'build/**/*.ts'],
      exclude: ['src/main.tsx', 'src/test/**', 'src/**/*.test.{ts,tsx}', 'build/**/*.test.ts'],
    },
  },
})
