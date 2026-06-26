import sharp from 'sharp'
import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const wixDir = join(__dirname, '..', 'installer', 'wix')

async function main() {
  // Test 1: SVG with text
  const svgText = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100">
    <rect width="200" height="100" fill="#6366f1"/>
    <text x="100" y="55" text-anchor="middle" fill="white" font-size="24" font-family="Arial,sans-serif">Hello World</text>
  </svg>`
  await sharp(Buffer.from(svgText)).png().toFile(join(wixDir, 'test-svg-text.png'))
  console.log('test-svg-text.png')

  // Test 2: Sharp text API
  const t = await sharp({ text: { text: 'Hello World', font: 'Segoe UI, Arial, sans-serif', width: 200, height: 30 } })
    .resize(200, 30)
    .png()
    .toBuffer()
  await sharp(t).png().toFile(join(wixDir, 'test-sharp-text.png'))
  console.log('test-sharp-text.png')

  // Test 3: Check file sizes
  const fs = await import('fs')
  const s1 = fs.statSync(join(wixDir, 'test-svg-text.png')).size
  const s2 = fs.statSync(join(wixDir, 'test-sharp-text.png')).size
  console.log(`SVG text PNG: ${s1} bytes`)
  console.log(`Sharp text PNG: ${s2} bytes`)

  // Test 4: Render SVG+bg, composite sharp text
  const bg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100">
    <rect width="200" height="100" fill="#6366f1"/>
  </svg>`)

  const composite = await sharp(bg).png().toBuffer()
  const result = await sharp(composite)
    .composite([
      { input: t, top: 35, left: 10 }
    ])
    .png()
    .toFile(join(wixDir, 'test-composite.png'))
  console.log('test-composite.png')

  // Test 5: Now read back and check if text rendered
  // Convert composite to raw and check for non-background pixels
  const raw = await sharp(join(wixDir, 'test-composite.png')).raw().toBuffer({ resolveWithObject: true })
  const { data, info } = raw
  // Count non-uniform pixels in the text region (y: 35-65, x: 10-210)
  let nonBgPixels = 0
  for (let y = 35; y < 65 && y < info.height; y++) {
    for (let x = 10; x < 210 && x < info.width; x++) {
      const i = (y * info.width + x) * 4
      // If not pure purple background
      if (!(data[i] === 99 && data[i+1] === 102 && data[i+2] === 241)) {
        nonBgPixels++
      }
    }
  }
  console.log(`Non-background pixels in text region: ${nonBgPixels}`)
}

main().catch(console.error)
