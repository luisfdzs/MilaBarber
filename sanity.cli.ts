import { defineCliConfig } from 'sanity/cli'
import { dataset, projectId } from './sanity/env'

/**
 * Configuración del CLI de Sanity (`npx sanity …`). Sólo hace falta para tareas de
 * administración desde la terminal —crear el dataset, importar o exportar contenido—;
 * el panel se sirve desde Next, no desde este fichero.
 */
export default defineCliConfig({
  api: { projectId, dataset },
})
