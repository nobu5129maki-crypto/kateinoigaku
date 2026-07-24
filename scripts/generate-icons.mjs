import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const source = path.resolve('public/icons/icon-source.png')
const outDir = path.resolve('public/icons')
const bg = { r: 31, g: 92, b: 77, alpha: 1 }

fs.mkdirSync(outDir, { recursive: true })

const sizes = [48, 72, 96, 128, 144, 152, 167, 180, 192, 256, 384, 512, 1024]

async function makeSquare(size) {
  return sharp(source)
    .resize(size, size, { fit: 'cover', position: 'centre' })
    .flatten({ background: bg })
    .png()
    .toFile(path.join(outDir, `icon-${size}.png`))
}

async function makeMaskable(size) {
  const inner = Math.round(size * 0.72)
  const icon = await sharp(source)
    .resize(inner, inner, { fit: 'cover', position: 'centre' })
    .flatten({ background: bg })
    .png()
    .toBuffer()

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: bg,
    },
  })
    .composite([{ input: icon, gravity: 'centre' }])
    .png()
    .toFile(path.join(outDir, `maskable-${size}.png`))
}

async function main() {
  for (const size of sizes) {
    await makeSquare(size)
  }
  await makeMaskable(192)
  await makeMaskable(512)

  await sharp(source)
    .resize(180, 180, { fit: 'cover' })
    .flatten({ background: bg })
    .png()
    .toFile(path.join(outDir, 'apple-touch-icon.png'))

  await sharp(source)
    .resize(32, 32, { fit: 'cover' })
    .flatten({ background: bg })
    .png()
    .toFile(path.join('public', 'favicon-32.png'))

  await sharp(source)
    .resize(16, 16, { fit: 'cover' })
    .flatten({ background: bg })
    .png()
    .toFile(path.join('public', 'favicon-16.png'))

  await sharp(source)
    .resize(1024, 1024, { fit: 'cover' })
    .flatten({ background: bg })
    .png()
    .toFile(path.join(outDir, 'icon-master-1024.png'))

  console.log('Icons generated in public/icons')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
