import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const wixDir = join(__dirname, '..', 'installer', 'wix')

function analyzeBMP(filePath, label) {
  const data = readFileSync(filePath)
  const w = data.readInt32LE(18)  // These are correct for BMP
  const h = data.readInt32LE(22)
  const offset = data.readUInt32LE(10)
  const rowSize = Math.ceil(w * 3 / 4) * 4

  function getPixel(x, y) {
    const i = offset + (h - 1 - y) * rowSize + x * 3
    return { r: data[i + 2], g: data[i + 1], b: data[i] }
  }

  // Check for dark pixels (text)
  let darkCount = 0
  let nonWhiteCount = 0
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = getPixel(x, y)
      if (p.r < 100 && p.g < 100 && p.b < 100) darkCount++
      if (p.r < 240 || p.g < 240 || p.b < 240) nonWhiteCount++
    }
  }
  const total = w * h
  console.log(`\n=== ${label} (${w}x${h}) ===`)
  console.log(`  Total pixels: ${total}`)
  console.log(`  Dark pixels (text shapes): ${darkCount}`)
  console.log(`  Non-white pixels (any content): ${nonWhiteCount}`)

  // Sample specific regions
  if (label.includes('BANNER')) {
    console.log(`  OV text (17,12): ${JSON.stringify(getPixel(17, 12))}`)
    console.log(`  OtpVault text (60,8): ${JSON.stringify(getPixel(60, 8))}`)
    console.log(`  Tagline (60,28): ${JSON.stringify(getPixel(60, 28))}`)
    console.log(`  Version (444,21): ${JSON.stringify(getPixel(444, 21))}`)
  } else {
    console.log(`  OV logo (215,40): ${JSON.stringify(getPixel(215, 40))}`)
    console.log(`  Title (114,118): ${JSON.stringify(getPixel(114, 118))}`)
    console.log(`  Subtitle (159,158): ${JSON.stringify(getPixel(159, 158))}`)
    console.log(`  Feature 1 (70,200): ${JSON.stringify(getPixel(70, 200))}`)
    console.log(`  Feature 2 (70,233): ${JSON.stringify(getPixel(70, 233))}`)
    console.log(`  Feature 3 (70,266): ${JSON.stringify(getPixel(70, 266))}`)
    console.log(`  Accent (0,2): ${JSON.stringify(getPixel(0, 2))}`)
  }
}

analyzeBMP(join(wixDir, 'banner.bmp'), 'BANNER')
analyzeBMP(join(wixDir, 'dialog.bmp'), 'DIALOG')

// Convert to PNG for user to view
async function bmpToPng(srcPath, dstName) {
  const data = readFileSync(srcPath)
  const w = data.readInt32LE(18)
  const h = data.readInt32LE(22)
  const offset = data.readUInt32LE(10)
  const rowSize = Math.ceil(w * 3 / 4) * 4

  const pixels = Buffer.alloc(w * h * 4)
  for (let y = 0; y < h; y++) {
    const srcRow = offset + (h - 1 - y) * rowSize
    for (let x = 0; x < w; x++) {
      const src = srcRow + x * 3
      const dst = (y * w + x) * 4
      pixels[dst] = data[src + 2]
      pixels[dst + 1] = data[src + 1]
      pixels[dst + 2] = data[src]
      pixels[dst + 3] = 255
    }
  }
  await sharp(pixels, { raw: { width: w, height: h, channels: 4 } })
    .png()
    .toFile(join(wixDir, dstName))
  console.log(`  Saved ${dstName}`)
}

await bmpToPng(join(wixDir, 'banner.bmp'), 'banner-preview.png')
await bmpToPng(join(wixDir, 'dialog.bmp'), 'dialog-preview.png')
