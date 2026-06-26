import sharp from 'sharp'
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const wixDir = join(__dirname, '..', 'installer', 'wix')
mkdirSync(wixDir, { recursive: true })

function createBMP(width, height, rawRgba) {
  const rowSize = Math.ceil((width * 3) / 4) * 4
  const pixelDataSize = rowSize * height
  const fileSize = 14 + 40 + pixelDataSize
  const buf = Buffer.alloc(fileSize)
  let off = 0

  buf.write('BM', off); off += 2
  buf.writeUInt32LE(fileSize, off); off += 4
  buf.writeUInt16LE(0, off); off += 2
  buf.writeUInt16LE(0, off); off += 2
  buf.writeUInt32LE(14 + 40, off); off += 4

  buf.writeUInt32LE(40, off); off += 4
  buf.writeInt32LE(width, off); off += 4
  buf.writeInt32LE(height, off); off += 4
  buf.writeUInt16LE(1, off); off += 4
  buf.writeUInt32LE(0, off); off += 4
  buf.writeUInt32LE(pixelDataSize, off); off += 4
  buf.writeInt32LE(2835, off); off += 4
  buf.writeInt32LE(2835, off); off += 4
  buf.writeUInt32LE(0, off); off += 4
  buf.writeUInt32LE(0, off); off += 4

  for (let y = height - 1; y >= 0; y--) {
    const rowStart = off
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4
      const r = rawRgba[i], g = rawRgba[i + 1], b = rawRgba[i + 2], a = rawRgba[i + 3]
      const blend = (fg, bg) => Math.round(fg * (a / 255) + bg * (1 - a / 255))
      buf[off++] = blend(b, 255)
      buf[off++] = blend(g, 255)
      buf[off++] = blend(r, 255)
    }
    off = rowStart + rowSize
  }
  return buf
}

async function main() {
  console.log('Generating professional installer bitmaps...')

  // ─── BANNER: 493×58 ────────────────────────────────────────────────
  // Render entire SVG to PNG first (this handles text correctly)
  const bannerSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="493" height="58">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#6366f1"/>
        <stop offset="100%" stop-color="#4338ca"/>
      </linearGradient>
      <linearGradient id="lb" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#818cf8"/>
        <stop offset="100%" stop-color="#6366f1"/>
      </linearGradient>
    </defs>
    <rect width="493" height="58" fill="url(#bg)"/>
    <circle cx="430" cy="10" r="30" fill="rgba(255,255,255,0.04)"/>
    <circle cx="460" cy="45" r="25" fill="rgba(255,255,255,0.03)"/>
    <circle cx="480" cy="20" r="15" fill="rgba(255,255,255,0.05)"/>
    <rect x="14" y="10" width="38" height="38" rx="10" fill="url(#lb)" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
    <text x="33" y="36" text-anchor="middle" fill="white" font-size="18" font-weight="bold" font-family="Arial,sans-serif">OV</text>
    <text x="62" y="27" fill="white" font-size="15" font-weight="bold" font-family="Arial,sans-serif">OtpVault</text>
    <text x="62" y="44" fill="rgba(255,255,255,0.75)" font-size="10" font-family="Arial,sans-serif">Secure 2FA Authenticator</text>
    <rect x="440" y="20" width="45" height="18" rx="9" fill="rgba(255,255,255,0.12)"/>
    <text x="462" y="32" text-anchor="middle" fill="rgba(255,255,255,0.7)" font-size="9" font-family="Arial,sans-serif">v0.1.0</text>
  </svg>`

  const bannerPng = await sharp(Buffer.from(bannerSVG)).png().toBuffer()
  const bannerRaw = await sharp(bannerPng).raw().toBuffer({ resolveWithObject: true })
  const bannerBmp = createBMP(493, 58, bannerRaw.data)
  writeFileSync(join(wixDir, 'banner.bmp'), bannerBmp)
  console.log(`  banner.bmp (493×58) — ${Math.round(bannerBmp.length / 1024)} KB`)

  // ─── DIALOG: 493×312 ──────────────────────────────────────────────
  const dialogSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="493" height="312">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="100%" stop-color="#f1f5f9"/>
      </linearGradient>
      <linearGradient id="ac" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#6366f1"/>
        <stop offset="100%" stop-color="#818cf8"/>
      </linearGradient>
      <linearGradient id="lb" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#818cf8"/>
        <stop offset="100%" stop-color="#4f46e5"/>
      </linearGradient>
    </defs>
    <rect width="493" height="312" fill="url(#bg)"/>
    <rect width="493" height="4" fill="url(#ac)"/>
    <rect x="206.5" y="30" width="80" height="80" rx="20" fill="url(#lb)"/>
    <rect x="206.5" y="30" width="80" height="80" rx="20" fill="none" stroke="rgba(99,102,241,0.2)" stroke-width="2"/>
    <text x="246.5" y="78" text-anchor="middle" fill="white" font-size="36" font-weight="bold" font-family="Arial,sans-serif">OV</text>
    <text x="246.5" y="145" text-anchor="middle" fill="#1e1b4b" font-size="20" font-weight="bold" font-family="Arial,sans-serif">Welcome to OtpVault</text>
    <rect x="150" y="158" width="193" height="22" rx="11" fill="rgba(99,102,241,0.08)"/>
    <text x="246.5" y="173" text-anchor="middle" fill="#4f46e5" font-size="11" font-weight="bold" font-family="Arial,sans-serif">SECURE 2FA AUTHENTICATOR</text>
    <rect x="40" y="195" width="413" height="28" rx="6" fill="white" stroke="#e2e8f0" stroke-width="1"/>
    <rect x="52" y="203" width="10" height="10" rx="3" fill="#6366f1"/>
    <text x="70" y="213" fill="#334155" font-size="12" font-family="Arial,sans-serif">Encrypted vault for your TOTP secrets</text>
    <rect x="40" y="228" width="413" height="28" rx="6" fill="white" stroke="#e2e8f0" stroke-width="1"/>
    <rect x="52" y="236" width="10" height="10" rx="3" fill="#6366f1"/>
    <text x="70" y="246" fill="#334155" font-size="12" font-family="Arial,sans-serif">Cloud backup via Supabase with AES-256-GCM encryption</text>
    <rect x="40" y="261" width="413" height="28" rx="6" fill="white" stroke="#e2e8f0" stroke-width="1"/>
    <rect x="52" y="269" width="10" height="10" rx="3" fill="#6366f1"/>
    <text x="70" y="279" fill="#334155" font-size="12" font-family="Arial,sans-serif">Works offline, syncs securely across devices</text>
    <circle cx="240" cy="301" r="3" fill="#cbd5e1"/>
    <circle cx="246.5" cy="301" r="3" fill="#6366f1"/>
    <circle cx="253" cy="301" r="3" fill="#cbd5e1"/>
  </svg>`

  const dialogPng = await sharp(Buffer.from(dialogSVG)).png().toBuffer()
  const dialogRaw = await sharp(dialogPng).raw().toBuffer({ resolveWithObject: true })
  const dialogBmp = createBMP(493, 312, dialogRaw.data)
  writeFileSync(join(wixDir, 'dialog.bmp'), dialogBmp)
  console.log(`  dialog.bmp (493×312) — ${Math.round(dialogBmp.length / 1024)} KB`)

  // Also save PNG previews
  writeFileSync(join(wixDir, 'banner-preview.png'), bannerPng)
  writeFileSync(join(wixDir, 'dialog-preview.png'), dialogPng)
  console.log('PNG previews saved')
  console.log('Done!')
}

main().catch(console.error)
