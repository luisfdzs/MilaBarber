import 'server-only'
import { existsSync } from 'node:fs'
import path from 'node:path'

/**
 * ¿QUÉ MATERIAL HAY PARA LA PORTADA?
 *
 * Se mira el disco, en servidor, y baja la respuesta ya decidida al componente. La
 * alternativa —intentar cargar el vídeo y ver si falla— llenaría la consola de 404 en
 * cuanto alguien abriera las herramientas del navegador, y en el hueco de la foto se
 * vería un icono de imagen rota antes de que nadie pudiera evitarlo.
 *
 * Existe porque **el sitio se monta antes de tener el material definitivo**. Mila Barber
 * tiene vídeo en Instagram y fotos del local, pero nada de eso está todavía en el
 * repositorio, y una web que sólo funciona cuando el cliente entrega los archivos es una
 * web que no se puede enseñar. Con esto, la portada tiene tres estados y los tres se ven
 * bien: sin nada (fondo de la casa), con póster (foto fija) y con póster y vídeo (el
 * montaje en bucle).
 *
 * Se llama en el render del servidor de una página estática, así que estas dos lecturas
 * de disco ocurren en el build, no en la petición de nadie.
 */

const heroDir = path.join(process.cwd(), 'public', 'hero')

export type HeroMedia = {
  /** Hay al menos el póster apaisado: la portada puede enseñar imagen fija. */
  hasPoster: boolean
  /** Hay montaje renderizado: la portada puede enseñar el bucle. */
  hasVideo: boolean
}

export function getHeroMedia(): HeroMedia {
  const hasPoster = existsSync(path.join(heroDir, 'poster-wide.jpg'))
  // Basta con comprobar el WebM apaisado: `npm run hero` genera los cuatro ficheros de
  // una vez o ninguno, así que si está éste están todos.
  const hasVideo = existsSync(path.join(heroDir, 'montage-wide.webm'))
  return { hasPoster, hasVideo }
}
