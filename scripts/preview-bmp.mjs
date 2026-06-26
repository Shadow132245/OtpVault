import sharp from 'sharp'
import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const wixDir = join(__dirname, '..', 'installer', 'wix')

// Convert BMP buffer to PNG
function bmpToPixels(buf) {
  // Skip 14-byte file header + 40-byte DIB header
  const pixelOffset = buf.readUInt32LE(10)
  const width = buf.readInt32LE(18)
  const height = buf.readInt32LE(22)
  const bpp = buf.readUInt16LE(28)
  const rowSize = Math.ceil((width * (bpp / 8)) / 4) * 4

  const pixels = Buffer.alloc(width * height * 4)
  for (let y = 0; y < height; y++) {
    const srcRow = pixelOffset + (height - 1 - y) * rowSize
    for (let x = 0; x < width; x++) {
      const src = srcRow + x * 3
      const dst = (y * width + x) * 4
      pixels[dst] = buf[src + 2]      // R
      pixels[dst + 1] = buf[src + 1]  // G
      pixels[dst + 2] = buf[src]      // B
      pixels[dst + 3] = 255           // A
    }
  }
  return { pixels, width, height }
}

async function main() {
  const banner = bmpToPixels(readFileSync(join(wixDir, 'banner.bmp')))
  await sharp(banner.pixels, { raw: { width: banner.width, height: banner.height, channels: 4 } })
    .png()
    .toFile(join(wixDir, 'banner-preview.png'))
  console.log('banner-preview.png created')

  const dialog = bmpToPixels(readFileSync(join(wixDir, 'dialog.bmp')))
  await sharp(dialog.pixels, { raw: { width: dialog.width, height: dialog.height, channels: 4 } })
    .png()
    .toFile(join(wixDir, 'dialog-preview.png'))
  console.log('dialog-preview.png created')
}

main().catch(console.error)
