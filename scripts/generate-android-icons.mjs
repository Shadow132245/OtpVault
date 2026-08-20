import sharp from 'sharp'
import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const androidDir = join(__dirname, '..', 'src-tauri', 'icons', 'android')

const SVG_ANDROID = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#4f46e5"/>
      <stop offset="100%" stop-color="#7c3aed"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="108" ry="108" fill="url(#bg)"/>
  <path d="M256 60 L408 140 L408 272 Q408 380 256 460 Q104 380 104 272 L104 140 Z" fill="none" stroke="white" stroke-width="14" stroke-linejoin="round"/>
  <circle cx="256" cy="236" r="52" fill="none" stroke="white" stroke-width="12"/>
  <rect x="242" y="278" width="28" height="48" rx="6" fill="white"/>
</svg>`

const sizes = [
  { name: 'mipmap-mdpi.png', size: 48 },
  { name: 'mipmap-hdpi.png', size: 72 },
  { name: 'mipmap-xhdpi.png', size: 96 },
  { name: 'mipmap-xxhdpi.png', size: 144 },
  { name: 'mipmap-xxxhdpi.png', size: 192 },
  { name: 'icon.png', size: 512 },
]

async function generate() {
  const svgBuffer = Buffer.from(SVG_ANDROID)
  for (const { name, size } of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(join(androidDir, name))
    console.log(`  Created ${name} (${size}x${size})`)
  }
}

generate().catch(console.error)
