import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const wixDir = join(__dirname, '..', 'installer', 'wix')

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
  console.log(`Saved ${dstName}`)
}

await bmpToPng(join(wixDir, 'banner.bmp'), 'banner-preview.png')
await bmpToPng(join(wixDir, 'dialog.bmp'), 'dialog-preview.png')
console.log('Done')
