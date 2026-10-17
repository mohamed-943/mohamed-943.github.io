/// <reference types="vitest/config" />
import { copyFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { execSync } from 'node:child_process'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

// Commit déployé : fourni par GitHub Actions, sinon lu dans Git, sinon « local ».
const sha = (() => {
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA
  try {
    return execSync('git rev-parse HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim()
  } catch {
    return 'local'
  }
})()

const buildDate = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

// GitHub Pages ne connaît pas les routes React : 404.html = index.html pour que /projets/xxx fonctionne.
const spaFallback = (): Plugin => ({
  name: 'spa-fallback-404',
  apply: 'build',
  closeBundle() {
    const out = resolve(import.meta.dirname, 'dist')
    copyFileSync(resolve(out, 'index.html'), resolve(out, '404.html'))
  },
})

export default defineConfig({
  // '/' pour un dépôt <utilisateur>.github.io ou un domaine perso ; '/nom-du-depot/' sinon.
  base: process.env.VITE_BASE ?? '/',
  plugins: [react(), spaFallback()],
  define: {
    __BUILD_SHA__: JSON.stringify(sha),
    __BUILD_DATE__: JSON.stringify(buildDate),
    __BUILD_REPO__: JSON.stringify(process.env.GITHUB_REPOSITORY ?? 'mohamed-943/mohamed-943.github.io'),
  },
  server: { host: true, port: 5173 },
  preview: { host: true, port: 4173 },
  build: {
    target: 'es2022',
    sourcemap: false,
    chunkSizeWarningLimit: 700,
    // Les polices ne sont jamais intégrées en data: — la politique CSP (font-src 'self') les bloquerait.
    assetsInlineLimit: (file: string) => (/\.(woff2?|ttf)$/.test(file) ? false : undefined),
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
