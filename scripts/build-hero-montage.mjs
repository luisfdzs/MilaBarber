/**
 * EL MONTAJE DE LA PORTADA. Se ejecuta con `npm run hero`.
 *
 * Coge los planos que haya en `.hero-src/` y produce en `public/hero/` los seis ficheros
 * que espera `components/sections/HeroMontage.tsx`:
 *
 *   montage-wide.webm  montage-wide.mp4  poster-wide.jpg   (16:9, pantallas apaisadas)
 *   montage-tall.webm  montage-tall.mp4  poster-tall.jpg   (9:16, móviles en vertical)
 *
 * `.hero-src/` está en `.gitignore`: los originales pesan cientos de megas y no tienen por
 * qué vivir en el repositorio. Lo que se sube es el resultado, que son unos pocos megas.
 *
 * EL TRATAMIENTO ES LO QUE HACE QUE ESTO SEA UNA PORTADA Y NO UN VÍDEO. La referencia del
 * encargo —Swiftmet, y antes sanity.io— no pone «un vídeo de fondo»: pone una textura que
 * se mueve despacio y sobre la que se puede leer. De ahí las cuatro decisiones del filtro:
 *
 * - **Sin audio.** Un vídeo de fondo con sonido es un vídeo que el navegador no deja
 *   autoreproducir, y además nadie lo quiere.
 * - **Saturación y contraste bajados.** Una barbería tiene focos y espejos: el material
 *   viene con blancos reventados y rojos de neón justo donde va el titular.
 * - **Ralentizado.** El movimiento rápido pide la vista; la portada tiene que dejarla
 *   libre para el titular y el botón de reservar.
 * - **Bucle sin costura.** El final funde con el principio (ver `SEAMLESS` abajo). Sin eso
 *   hay un salto cada veinte segundos, y un salto periódico se nota mucho más que el
 *   propio vídeo.
 *
 * DOS PROPORCIONES Y NO UNA porque un 16:9 recortado a la pantalla de un móvil en vertical
 * deja el plano en una franja central: se pierde justo lo que se quería enseñar. El motivo
 * de que la elección se haga en el navegador y no en el HTML está en `HeroMontage.tsx`.
 */

import { spawn } from 'node:child_process'
import { mkdir, readdir, rm } from 'node:fs/promises'
import path from 'node:path'

const SRC_DIR = '.hero-src'
const OUT_DIR = path.join('public', 'hero')

/** Segundos que se toman de cada plano. */
const SEGMENT = 5
/** Segundos de fundido entre plano y plano. */
const FADE = 1
/** Desde qué segundo de cada original se recorta. Los primeros fotogramas suelen sobrar. */
const SKIP = 1
/** Cuánto se ralentiza. 1.35 = un 35 % más lento. */
const SLOWDOWN = 1.35

const VARIANTS = [
  { name: 'wide', width: 1920, height: 1080 },
  { name: 'tall', width: 1080, height: 1920 },
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
  console.error('Hace falta ffmpeg y no está en el PATH.')
  console.error('  Windows:  winget install Gyan.FFmpeg')
  console.error('  macOS:    brew install ffmpeg')
  process.exit(1)
}

console.log(`${clips.length} plano(s) en ${SRC_DIR}/:`)
for (const clip of clips) console.log(`  · ${path.basename(clip)}`)

await mkdir(OUT_DIR, { recursive: true })

for (const variant of VARIANTS) {
  console.log(`\n${variant.name} (${variant.width}×${variant.height}):`)
  await buildVariant(variant)
}

console.log(`\nListo. Los ficheros están en ${OUT_DIR}/.`)
console.log('Ya se ven en la portada: `lib/hero.ts` los detecta mirando el disco.')

/* --------------------------------------------------------------------------
   Construcción
   ----------------------------------------------------------------------- */

async function buildVariant({ name, width, height }) {
  const webm = path.join(OUT_DIR, `montage-${name}.webm`)
  const mp4 = path.join(OUT_DIR, `montage-${name}.mp4`)
  const poster = path.join(OUT_DIR, `poster-${name}.jpg`)

  const { filter, output, duration } = buildFilter(width, height)
  const inputs = clips.flatMap((clip) => ['-i', clip])

  /**
   * VP9 primero porque es el que va a servirse casi siempre: pesa la mitad que el H.264 a
   * la misma calidad y lo leen todos los navegadores menos Safari viejo. `-crf 36` es alto
   * a propósito —esto va detrás de un degradado y de un titular, no es una película— y es
   * lo que mantiene el fichero en un par de megas, que es el presupuesto razonable para
   * decoración que se descarga con datos móviles.
   *
   * `-row-mt 1` reparte la codificación entre núcleos; sin ella VP9 tarda varias veces más.
   */
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

  /**
   * El MP4 es el plan B para Safari. `-movflags +faststart` mueve el índice al principio
   * del fichero: sin eso el navegador tiene que descargarlo entero antes de pintar el
   * primer fotograma, que para un vídeo de fondo es la diferencia entre aparecer a los
   * dos segundos y no aparecer.
   */
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

  /**
   * El póster se saca del propio montaje ya montado y ya tratado, no del original. Tiene
   * que ser **un fotograma del vídeo**: es lo que se ve mientras el vídeo carga, y si el
   * color no coincide, el cambio de uno a otro es un parpadeo.
   */
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

/**
 * El filtro completo: normaliza cada plano, los encadena con fundidos y cierra el bucle.
 *
 * SEAMLESS: se añade **una repetición del primer plano al final** y se funde con él; luego
 * el `-t` de la codificación corta justo antes de que esa repetición quede a la vista. El
 * resultado es que el último fotograma ya está fundiendo hacia lo que muestra el primero,
 * así que al saltar al principio no hay corte. Es el truco estándar y es la diferencia
 * entre un fondo que no se nota y uno que da un tirón cada veinte segundos.
 */
function buildFilter(width, height) {
  // El orden de la pasada: todos los planos y, al final, otra vez el primero.
  const order = [...clips.map((_, i) => i), 0]

  const parts = order.map((clipIndex, position) => {
    // La repetición final arranca en otro punto del mismo plano para que el fundido no sea
    // una imagen sobre sí misma, que se vería como un simple aclarado.
    const start = position === order.length - 1 ? SKIP + SEGMENT / 2 : SKIP
    return (
      `[${clipIndex}:v]` +
      `trim=start=${start}:duration=${(SEGMENT * SLOWDOWN).toFixed(3)},` +
      `setpts=${SLOWDOWN}*(PTS-STARTPTS),` +
      `fps=25,` +
      // `increase` + `crop` = llenar el marco sin deformar, recortando lo que sobra.
      `scale=${width}:${height}:force_original_aspect_ratio=increase,` +
      `crop=${width}:${height},` +
      `setsar=1,` +
      // El tratamiento. Ver la cabecera del fichero.
      `eq=saturation=0.70:contrast=1.05:brightness=-0.03,` +
      `format=yuv420p` +
      `[v${position}]`
    )
  })

  // Cadena de fundidos. Con segmentos iguales, cada uno empieza SEGMENT-FADE después del
  // anterior; el resto lo tapa el propio fundido.
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
    // Se corta donde empieza la repetición del primer plano: a partir de ahí el bucle ya
    // enseñaría dos veces lo mismo.
    duration: Number((clips.length * (SEGMENT - FADE)).toFixed(3)),
  }
}

/* --------------------------------------------------------------------------
   Utilidades
   ----------------------------------------------------------------------- */

async function findClips() {
  try {
    const entries = await readdir(SRC_DIR, { withFileTypes: true })
    return (
      entries
        .filter(
          (entry) => entry.isFile() && VIDEO_EXTENSIONS.has(path.extname(entry.name).toLowerCase()),
        )
        // Por nombre: numerar los ficheros (01-tijeras.mp4, 02-degradado.mp4…) es la forma
        // de decidir el orden del montaje sin tocar este script.
        .sort((a, b) => a.name.localeCompare(b.name, 'es'))
        .map((entry) => path.join(SRC_DIR, entry.name))
    )
  } catch (error) {
    if (error.code === 'ENOENT') return []
    throw error
  }
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
    const child = spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', ...args], {
      stdio: quiet ? 'ignore' : ['ignore', 'inherit', 'inherit'],
    })
    child.on('error', reject)
    child.on('close', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`ffmpeg ha terminado con el código ${code}`))
    })
  })
}

// Sin esto, un fallo a mitad dejaría medio fichero escrito en `public/hero/` y `lib/hero.ts`
// lo daría por bueno: la portada pediría un vídeo corrupto.
process.on('uncaughtException', async (error) => {
  console.error(`\nHa fallado el montaje: ${error.message}`)
  for (const { name } of VARIANTS) {
    await rm(path.join(OUT_DIR, `montage-${name}.webm`), { force: true })
    await rm(path.join(OUT_DIR, `montage-${name}.mp4`), { force: true })
  }
  process.exit(1)
})
