import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// `base` targets GitHub Pages project sites. Override with VITE_BASE for a custom domain.
const base = process.env.VITE_BASE ?? '/'

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  /*
   * Fail on a taken port instead of quietly moving to the next one.
   *
   * Vite's default is to increment until it finds a free port, which means a
   * second `pnpm dev` does not tell you the first one is still running — it
   * just starts another server. Each one holds a module graph and a watcher
   * over the whole project, so a long session silently accumulates hundreds of
   * megabytes per forgotten instance. On a machine with no swap that margin is
   * the difference between slow and frozen. Refusing to start is the honest
   * behaviour: it makes the stale server visible so it can be stopped.
   */
  server: { port: 5173, strictPort: true },
  preview: { port: 4173, strictPort: true },
  resolve: {
    alias: {
      '@domain': fileURLToPath(new URL('./src/domain', import.meta.url)),
      '@application': fileURLToPath(new URL('./src/application', import.meta.url)),
      '@infrastructure': fileURLToPath(new URL('./src/infrastructure', import.meta.url)),
      '@presentation': fileURLToPath(new URL('./src/presentation', import.meta.url)),
      '@shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
      '@content': fileURLToPath(new URL('./content', import.meta.url)),
    },
  },
  build: {
    target: 'es2022',
    // The 3D chunk is ~880 kB of Three.js and is loaded only by devices that
    // will actually render it. Measured, deliberate, and behind a dynamic
    // import — so the default 500 kB warning is noise here rather than signal.
    chunkSizeWarningLimit: 1000,
  },
})
