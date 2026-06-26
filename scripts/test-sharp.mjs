import sharp from 'sharp'
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50">
  <rect width="50" height="50" fill="#6366f1" rx="8"/>
  <text x="25" y="30" text-anchor="middle" fill="white" font-size="20" font-family="sans-serif">OV</text>
</svg>`
sharp(Buffer.from(svg)).png().toBuffer()
  .then(b => { console.log('sharp works!', b.length); process.exit(0) })
  .catch(e => { console.log('sharp error:', e.message); process.exit(1) })
