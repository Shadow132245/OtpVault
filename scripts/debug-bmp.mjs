import sharp from 'sharp'
import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const wixDir = join(__dirname, '..', 'installer', 'wix')

const bannerSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="493" height="58">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#6366f1"/>
      <stop offset="100%" stop-color="#4338ca"/>
    </linearGradient>
    <linearGradient id="logoBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#818cf8"/>
      <stop offset="100%" stop-color="#6366f1"/>
    </linearGradient>
  </defs>
  <rect width="493" height="58" fill="url(#bg)"/>
  <circle cx="430" cy="10" r="30" fill="rgba(255,255,255,0.04)"/>
  <circle cx="460" cy="45" r="25" fill="rgba(255,255,255,0.03)"/>
  <circle cx="480" cy="20" r="15" fill="rgba(255,255,255,0.05)"/>
  <rect x="14" y="10" width="38" height="38" rx="10" fill="url(#logoBg)" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
</svg>`

const dialogSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="493" height="312">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#f1f5f9"/>
    </linearGradient>
    <linearGradient id="logoBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#818cf8"/>
      <stop offset="100%" stop-color="#4f46e5"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#6366f1"/>
      <stop offset="100%" stop-color="#818cf8"/>
    </linearGradient>
  </defs>
  <rect width="493" height="312" fill="url(#bg)"/>
  <rect width="493" height="4" fill="url(#accent)"/>
  <rect x="206.5" y="30" width="80" height="80" rx="20" fill="url(#logoBg)"/>
  <rect x="206.5" y="30" width="80" height="80" rx="20" fill="none" stroke="rgba(99,102,241,0.2)" stroke-width="2"/>
</svg>`

async function main() {
  // Render SVGs directly to PNGs for inspection
  await sharp(Buffer.from(bannerSVG)).resize(493, 58).png().toFile(join(wixDir, 'banner-shapes.png'))
  console.log('banner-shapes.png created')

  await sharp(Buffer.from(dialogSVG)).resize(493, 312).png().toFile(join(wixDir, 'dialog-shapes.png'))
  console.log('dialog-shapes.png created')

  // Now check the generated BMPs
  const bannerBmp = readFileSync(join(wixDir, 'banner.bmp'))
  const dialogBmp = readFileSync(join(wixDir, 'dialog.bmp'))
  console.log(`banner.bmp: ${bannerBmp.length} bytes`)
  console.log(`dialog.bmp: ${dialogBmp.length} bytes`)

  // Check if BMPs have any non-background content
  // Count unique pixel values
  const pixelOffset = bannerBmp.readUInt32LE(10)
  const height = bannerBmp.readInt32LE(22)
  const width = bannerBmp.readInt32LE(18)
  const rowSize = Math.ceil((width * 3) / 4) * 4
  console.log(`banner: ${width}x${height}, pixelOffset=${pixelOffset}, rowSize=${rowSize}`)
}

main().catch(console.error)
