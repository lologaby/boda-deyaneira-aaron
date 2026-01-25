/**
 * Export logo-og.svg to logo-og.png (1200×630) for og:image / twitter:image.
 * WhatsApp, Facebook, etc. do not support SVG for link previews; they need PNG/JPEG.
 *
 * Run: node scripts/export-og-png.js
 * Or: npm run prebuild (runs before npm run build)
 */
import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { Resvg } from '@resvg/resvg-js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const svgPath = join(root, 'public', 'images', 'logo-og.svg')
const pngPath = join(root, 'public', 'images', 'logo-og.png')

const svg = readFileSync(svgPath)
const resvg = new Resvg(svg)
const png = resvg.render().asPng()
writeFileSync(pngPath, png)
console.log('Wrote', pngPath)
