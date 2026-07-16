import sharp from 'sharp'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO = join(__dirname, '..')

const SVG_FULL = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6366f1"/>
      <stop offset="100%" stop-color="#4f46e5"/>
    </linearGradient>
  </defs>
  <rect x="32" y="32" width="448" height="448" rx="96" ry="96" fill="url(#bg)"/>
  <g fill="none" stroke="white" stroke-width="36" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="155" cy="256" r="58"/>
    <polyline points="230,145 335,315 440,145"/>
  </g>
</svg>`

// Foreground only: shield on transparent
const SVG_FG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <g fill="none" stroke="#4f46e5" stroke-width="36" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="155" cy="256" r="58"/>
    <polyline points="230,145 335,315 440,145"/>
  </g>
</svg>`

const fullBuf = Buffer.from(SVG_FULL)
const fgBuf = Buffer.from(SVG_FG)

const pwaDir = join(REPO, 'otpvault-pwa', 'public', 'icons')
const androidBase = join(REPO, 'otpvault-pwa', 'android', 'app', 'src', 'main', 'res')

const densities = [
  { dir: 'mipmap-mdpi', size: 48 },
  { dir: 'mipmap-hdpi', size: 72 },
  { dir: 'mipmap-xhdpi', size: 96 },
  { dir: 'mipmap-xxhdpi', size: 144 },
  { dir: 'mipmap-xxxhdpi', size: 192 },
]

async function main() {
  // PWA icons
  console.log('=== PWA Icons ===')
  for (const [name, size] of [['icon-192x192.png', 192], ['icon-512x512.png', 512], ['favicon.png', 48]]) {
    await sharp(fullBuf).resize(size, size).png().toFile(join(pwaDir, name))
    console.log(`  ${name} (${size}x${size})`)
  }

  // Android mipmaps
  console.log('\n=== Android Mipmaps ===')
  for (const d of densities) {
    const mipDir = join(androidBase, d.dir)
    await sharp(fullBuf).resize(d.size, d.size).png().toFile(join(mipDir, 'ic_launcher.png'))
    await sharp(fullBuf).resize(d.size, d.size).png().toFile(join(mipDir, 'ic_launcher_round.png'))
    await sharp(fgBuf).resize(d.size, d.size).png().toFile(join(mipDir, 'ic_launcher_foreground.png'))
    console.log(`  ${d.dir}: ic_launcher.png, ic_launcher_round.png, ic_launcher_foreground.png (${d.size}x${d.size})`)
  }

  console.log('\n✓ All icons generated')
}
main().catch(console.error)
