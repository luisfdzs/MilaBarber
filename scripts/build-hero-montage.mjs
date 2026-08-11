import { spawn } from 'node:child_process'
import { mkdir, readdir, rm } from 'node:fs/promises'
import path from 'node:path'
import ffmpegStatic from 'ffmpeg-static'

const SRC_DIR = '.hero-src'
const OUT_DIR = path.join('public', 'hero')

const FFMPEG = ffmpegStatic ?? 'ffmpeg'

const SEGMENT = 5
const FADE = 1
const SKIP = 1
const SLOWDOWN = 1.35

const VARIANTS = [
  { name: 'wide', width: 1280, height: 720 },
  { name: 'tall', width: 720, height: 1280 },
]

const VIDEO_EXTENSIONS = new Set(['.mp4', '.mov', '.m4v', '.webm', '.mkv'])

const clips = await findClips()

if (clips.length === 0) {
  console.error(`No hay ningún vídeo en ${SRC_DIR}/.`)
  console.error('Mete ahí los planos del local (mp4, mov…) y vuelve a ejecutar `npm run hero`.')
  console.error('La web funciona igual sin esto: la portada se queda con el fondo de la casa.')
  process.exit(1)
}

if (!(await hasFfmpeg())) {
  console.error(`No se puede ejecutar ffmpeg (${FFMPEG}).`)
  console.error('El binario lo trae el paquete `ffmpeg-static`: prueba `npm install`.')
  console.error('Si aun así falla, instálalo en el sistema y volverá a usarse desde el PATH:')
  console.error('  Windows:  winget install Gyan.FFmpeg')
  console.error('  macOS:    brew install ffmpeg')
  process.exit(1)
}

const NEEDED = SEGMENT * SLOWDOWN

console.log(`${clips.length} plano(s) en ${SRC_DIR}/:`)
for (const clip of clips) {
  const name = path.basename(clip.file)
  const duration = await probeDuration(clip.file)
  const short = duration !== null && clip.start + NEEDED > duration
  console.log(
    `  · ${name} — desde el segundo ${clip.start}` +
      (duration === null ? '' : ` de ${duration.toFixed(1)}`) +
      (short ? `  ⚠️  se queda corto: hacen falta ${NEEDED.toFixed(1)} s desde ahí` : ''),
  )
}

await mkdir(OUT_DIR, { recursive: true })

for (const variant of VARIANTS) {
  console.log(`\n${variant.name} (${variant.width}×${variant.height}):`)
  await buildVariant(variant)
}

console.log(`\nListo. Los ficheros están en ${OUT_DIR}/.`)
console.log('Ya se ven en la portada: `lib/hero.ts` los detecta mirando el disco.')

async function buildVariant({ name, width, height }) {
  const webm = path.join(OUT_DIR, `montage-${name}.webm`)
  const mp4 = path.join(OUT_DIR, `montage-${name}.mp4`)
  const poster = path.join(OUT_DIR, `poster-${name}.jpg`)

  const { filter, output, duration } = buildFilter(width, height)
  const inputs = clips.flatMap((clip) => ['-i', clip.file])

  console.log('  · webm (VP9)…')
  await ffmpeg([
    ...inputs,
    '-filter_complex',
    filter,
    '-map',
    output,
    '-an',
    '-c:v',
    'libvpx-vp9',
    '-crf',
    '36',
    '-b:v',
    '0',
    '-row-mt',
    '1',
    '-pix_fmt',
    'yuv420p',
    '-t',
    String(duration),
    '-y',
    webm,
  ])

  console.log('  · mp4 (H.264)…')
  await ffmpeg([
    ...inputs,
    '-filter_complex',
    filter,
    '-map',
    output,
    '-an',
    '-c:v',
    'libx264',
    '-preset',
    'slow',
    '-crf',
    '26',
    '-profile:v',
    'main',
    '-pix_fmt',
    'yuv420p',
    '-movflags',
    '+faststart',
    '-t',
    String(duration),
    '-y',
    mp4,
  ])

  console.log('  · póster…')
  await ffmpeg([
    '-ss',
    String(Math.min(2, duration / 2)),
    '-i',
    webm,
    '-frames:v',
    '1',
    '-q:v',
    '3',
    '-y',
    poster,
  ])
}

function buildFilter(width, height) {
  const order = [...clips.map((_, i) => i), 0]

  const parts = order.map((clipIndex, position) => {
    const skip = clips[clipIndex].start
    const start = position === order.length - 1 ? skip + SEGMENT / 2 : skip
    return (
      `[${clipIndex}:v]` +
      `trim=start=${start}:duration=${(SEGMENT * SLOWDOWN).toFixed(3)},` +
      `setpts=${SLOWDOWN}*(PTS-STARTPTS),` +
      `fps=25,` +
      `scale=${width}:${height}:force_original_aspect_ratio=increase,` +
      `crop=${width}:${height},` +
      `setsar=1,` +
      `eq=saturation=0.70:contrast=1.05:brightness=-0.03,` +
      `format=yuv420p` +
      `[v${position}]`
    )
  })

  let previous = '[v0]'
  for (let i = 1; i < order.length; i += 1) {
    const offset = (i * (SEGMENT - FADE)).toFixed(3)
    const label = i === order.length - 1 ? '[out]' : `[x${i}]`
    parts.push(`${previous}[v${i}]xfade=transition=fade:duration=${FADE}:offset=${offset}${label}`)
    previous = label
  }

  return {
    filter: parts.join(';'),
    output: '[out]',
    duration: Number((clips.length * (SEGMENT - FADE)).toFixed(3)),
  }
}

async function findClips() {
  try {
    const entries = await readdir(SRC_DIR, { withFileTypes: true })
    return entries
      .filter(
        (entry) => entry.isFile() && VIDEO_EXTENSIONS.has(path.extname(entry.name).toLowerCase()),
      )
      .sort((a, b) => a.name.localeCompare(b.name, 'es'))
      .map((entry) => {
        const marked = path
          .basename(entry.name, path.extname(entry.name))
          .match(/@(\d+(?:[.,]\d+)?)$/)
        return {
          file: path.join(SRC_DIR, entry.name),
          start: marked ? Number(marked[1].replace(',', '.')) : SKIP,
        }
      })
  } catch (error) {
    if (error.code === 'ENOENT') return []
    throw error
  }
}

function probeDuration(file) {
  return new Promise((resolve) => {
    const child = spawn(FFMPEG, ['-hide_banner', '-i', file])
    let stderr = ''
    child.stderr.on('data', (chunk) => (stderr += chunk))
    child.on('error', () => resolve(null))
    child.on('close', () => {
      const m = stderr.match(/Duration:\s*(\d+):(\d\d):(\d\d(?:\.\d+)?)/)
      resolve(m ? Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]) : null)
    })
  })
}

async function hasFfmpeg() {
  try {
    await ffmpeg(['-version'], { quiet: true })
    return true
  } catch {
    return false
  }
}

function ffmpeg(args, { quiet = false } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(FFMPEG, ['-hide_banner', '-loglevel', 'error', ...args], {
      stdio: quiet ? 'ignore' : ['ignore', 'inherit', 'inherit'],
    })
    child.on('error', reject)
    child.on('close', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`ffmpeg ha terminado con el código ${code}`))
    })
  })
}

process.on('uncaughtException', async (error) => {
  console.error(`\nHa fallado el montaje: ${error.message}`)
  for (const { name } of VARIANTS) {
    await rm(path.join(OUT_DIR, `montage-${name}.webm`), { force: true })
    await rm(path.join(OUT_DIR, `montage-${name}.mp4`), { force: true })
  }
  process.exit(1)
})
