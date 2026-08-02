'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * EL MONTAJE DE LA PORTADA: el vídeo en bucle que se ve detrás del titular.
 *
 * La referencia declarada del encargo es la portada de Swiftmet, que a su vez copia el
 * ciclo de sanity.io: un plano de veinte y pico segundos, en bucle, tratado hasta que es
 * textura y no película. Aquí el material es el propio local —tijeras, la máquina, el
 * degradado tomando forma—, montado por `npm run hero` a partir de los planos que estén
 * en `.hero-src/`. El guion y el tratamiento viven en `scripts/build-hero-montage.mjs`;
 * este componente sólo reproduce lo ya renderizado en `public/hero/`.
 *
 * POR QUÉ EL VÍDEO LO PONE JAVASCRIPT Y NO EL HTML. Hacen falta dos proporciones —16:9 no
 * se puede recortar a la pantalla de un móvil en vertical sin dejar el plano en una
 * franja— y el HTML no tiene forma fiable de elegir una: el atributo `media` de `<source>`
 * dentro de `<video>` se quitó de la especificación y los navegadores lo ignoran, y dos
 * `<video>` en el DOM ocultando uno con CSS descargan **los dos**.
 *
 * Así que el HTML estático lleva sólo el póster —una imagen, que es lo que se ve en el
 * primer pintado— y al montar se decide qué vídeo pedir. El vídeo es decorativo: que
 * llegue 300 ms más tarde no le cuesta nada a nadie, y mantiene el LCP en el titular, que
 * es lo que hay que leer.
 *
 * LO QUE HACE QUE NO SEA UNA MOLESTIA:
 * - `prefers-reduced-motion: reduce` → **no se descarga el vídeo**. Se queda el póster,
 *   que es un fotograma del propio montaje. No es «la versión degradada»: es la portada
 *   quieta.
 * - `connection.saveData` o red `2g`/`slow-2g` → tampoco. Media clientela va a llegar
 *   desde el enlace de Instagram, con datos móviles y a veces con tarifa contada;
 *   gastarles dos megas en decoración sin preguntar no está bien.
 * - `IntersectionObserver` → al salir de pantalla se pausa. Nadie tiene por qué
 *   decodificar vídeo mientras lee los precios cuatro pantallas más abajo.
 * - **Y si no hay vídeo, no pasa nada.** Mientras la barbería no entregue material, en
 *   `public/hero/` sólo está el póster: se pinta la foto fija y el componente no pide
 *   ningún vídeo (`hasVideo`). No hay hueco roto ni petición 404.
 *
 * El vídeo va `muted`, `loop`, `playsInline` y sin controles: los tres primeros son lo
 * que exigen los navegadores para autoreproducir, y `playsInline` además evita que iOS lo
 * abra a pantalla completa. `aria-hidden` porque es decoración: lo que la portada dice
 * está en el titular, no aquí.
 */

/** Los dos cortes que produce `build-hero-montage.mjs`. */
const VARIANTS = {
  wide: {
    webm: '/hero/montage-wide.webm',
    mp4: '/hero/montage-wide.mp4',
    poster: '/hero/poster-wide.jpg',
  },
  tall: {
    webm: '/hero/montage-tall.webm',
    mp4: '/hero/montage-tall.mp4',
    poster: '/hero/poster-tall.jpg',
  },
}

/**
 * Vertical por debajo de esta proporción de aspecto. 0,9 y no 1: una tableta en vertical
 * (3:4 = 0,75) quiere el corte alto, pero un portátil apaisado corto (16:10 = 1,6) no, y
 * entre ambos no hay nada que dude.
 */
const TALL_BELOW_RATIO = 0.9

/** ¿Merece la pena pedir dos megas de decoración en esta conexión? */
function wantsHeavyMedia() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false

  // `connection` es Network Information API: no está en todos los navegadores (Safari no
  // la trae) y por eso se lee con optional chaining en lugar de darla por garantizada.
  const connection = (
    navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string }
    }
  ).connection
  if (connection?.saveData) return false
  if (connection?.effectiveType && /^(slow-)?2g$/.test(connection.effectiveType)) return false

  return true
}

type Props = {
  /** Nombre accesible del vídeo. */
  label: string
  /**
   * ¿Hay vídeo montado en `public/hero/`? Lo decide el servidor mirando el disco (ver
   * `lib/hero.ts`) en vez de intentar cargarlo y ver si falla: una petición que devuelve
   * 404 ensucia la consola de cualquiera que abra las herramientas y no aporta nada.
   */
  hasVideo: boolean
}

export function HeroMontage({ label, hasVideo }: Props) {
  /**
   * `null` = todavía no se ha decidido nada (primer render, igual en servidor y en
   * cliente: sólo el póster). Cualquier otro valor = el corte que toca.
   */
  const [variant, setVariant] = useState<keyof typeof VARIANTS | null>(null)
  const [playing, setPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!hasVideo || !wantsHeavyMedia()) return
    const pick = () =>
      setVariant(window.innerWidth / window.innerHeight < TALL_BELOW_RATIO ? 'tall' : 'wide')
    pick()
    // Girar el teléfono cambia el corte que toca. `resize` cubre también el cambio de
    // orientación, que no dispara un evento propio en todos los navegadores.
    window.addEventListener('resize', pick)
    return () => window.removeEventListener('resize', pick)
  }, [hasVideo])

  // Pausa fuera de pantalla. El `<video loop>` no sabe que ya no se le ve.
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return
        if (entry.isIntersecting) void video.play().catch(() => {})
        else video.pause()
      },
      { threshold: 0.01 },
    )
    observer.observe(video)
    return () => observer.disconnect()
  }, [variant])

  // El póster que se pinta de entrada es el apaisado: en el HTML estático todavía no se
  // sabe la forma de la pantalla, y es el que sirve para las dos con `object-cover`.
  const poster = variant ? VARIANTS[variant].poster : VARIANTS.wide.poster

  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element -- El póster tiene que estar en
          el HTML estático como imagen de fondo a sangre, sin el <div> envolvente que mete
          next/image con `fill`: aquí ya hay un contenedor posicionado y una capa de más
          rompe el apilado con el vídeo y el degradado. Además es un fichero local ya
          optimizado por el propio ffmpeg, así que no hay nada que next/image aporte. */}
      <img
        src={poster}
        alt=""
        className="absolute inset-0 size-full object-cover"
        // El póster ES la portada mientras el vídeo no está (o nunca llega, si se han
        // pedido menos animaciones), así que se pide cuanto antes.
        fetchPriority="high"
      />

      {variant && (
        <video
          ref={videoRef}
          key={variant}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-label={label}
          onPlaying={() => setPlaying(true)}
          className={`absolute inset-0 size-full object-cover transition-opacity duration-1000 ${
            playing ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* VP9 primero: pesa la mitad que el H.264 a la misma calidad. El navegador se
              queda con el primer formato que sabe leer, así que el orden es la preferencia. */}
          <source src={VARIANTS[variant].webm} type="video/webm" />
          <source src={VARIANTS[variant].mp4} type="video/mp4" />
        </video>
      )}

      {/* EL DEGRADADO NO ES ADORNO: ES LO QUE HACE LEGIBLE EL TITULAR. Una barbería es un
          sitio con espejos y focos, así que el material tiene reflejos casi blancos justo
          donde va el texto. Un velo uniforme apagaría el plano entero; el degradado
          concentra la protección abajo, donde están el titular y el botón, y deja respirar
          la parte alta, que es donde se ve la imagen.

          Dos capas y no una: la vertical sostiene el bloque de texto, y el velo general
          —muy flojo— cierra el caso del reflejo que llena toda la pantalla. */}
      <div className="absolute inset-0 bg-linear-to-t from-night via-night/55 via-42% to-night/10" />
      <div className="absolute inset-0 bg-night/15" />
    </div>
  )
}
