import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Read `devApiBase` from .config.json, if the file and field exist. Used only
 * for `vite dev`, where the frontend and PHP API run on different ports, so
 * the frontend needs an absolute base URL. Production builds ignore this and
 * default to a relative path, since the built app and /api share an origin
 * once deployed.
 * @returns {string} The configured dev API base, or '' if not set.
 */
function readDevApiBase() {
  try {
    const raw = readFileSync(fileURLToPath(new URL('./.config.json', import.meta.url)), 'utf8')
    return JSON.parse(raw).devApiBase ?? ''
  } catch {
    return ''
  }
}

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_API_BASE': JSON.stringify(command === 'serve' ? readDevApiBase() : ''),
  },
}))
