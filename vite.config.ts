import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vitest/config'
import { diskIndex } from './build/disk-index/disk-index.ts'

const disk = fileURLToPath(new URL('./disk', import.meta.url))

const browserTests = 'src/**/*.browser.test.tsx'

const wideViewport = { width: 1280, height: 800 }

export default defineConfig({
  plugins: [react(), tailwindcss(), diskIndex({ root: disk })],
  resolve: { tsconfigPaths: true },
  publicDir: disk,
  build: {
    target: 'esnext',
  },
  test: {
    globals: false,
    projects: [
      {
        extends: true,
        test: {
          name: 'machine',
          environment: 'node',
          include: [
            'build/**/*.test.ts',
            'tests/conventions/*.test.ts',
            'src/{apps,fs,kernel,lib,session,tty}/**/*.test.ts',
          ],
        },
      },
      {
        extends: true,
        test: {
          name: 'screen',
          environment: 'jsdom',
          pool: 'vmThreads',
          css: true,
          setupFiles: ['./tests/helpers/setup.ts'],
          include: ['src/{hooks,ui}/**/*.test.{ts,tsx}'],
          exclude: [browserTests],
        },
      },
      {
        extends: true,
        test: {
          name: 'browser',
          setupFiles: ['./tests/helpers/browser-setup.ts'],
          include: [browserTests],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'chromium', viewport: wideViewport }],
          },
        },
      },
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.{ts,tsx}', 'build/**/*.ts'],
      exclude: [
        'src/main.tsx',
        'src/kernel/contract/contract.ts',
        'src/**/*.test.{ts,tsx}',
        'build/**/*.test.ts',
      ],
      thresholds: { statements: 100, functions: 100, lines: 100, branches: 100 },
    },
  },
})
