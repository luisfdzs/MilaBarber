'use client'

import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { apiVersion, dataset, projectId } from './sanity/env'
import { schemaTypes } from './sanity/schemas'
import { structure } from './sanity/structure'

/**
 * PANEL DE CONTENIDO — se sirve dentro de la propia web, en /admin.
 *
 * Quien edita entra con su cuenta (invitada por correo desde sanity.io/manage): no hay
 * contraseñas compartidas y se puede quitar el acceso a una persona sin afectar al
 * resto. Cada cambio queda con autor y fecha, y hay historial para deshacer.
 *
 * **Este panel NO es el panel de la barbería para su día a día.** Aquí se cambia el
 * contenido de la web —fotos, precios, avisos—; la agenda y los clientes están en
 * `/cuenta` y en la zona de administración, que leen de MongoDB. Son dos cosas
 * distintas y conviene que lo parezcan.
 *
 * El panel está **en español**, al revés que en el proyecto de referencia: lo usan
 * Hassan y Mohammed, no un equipo internacional.
 */
export default defineConfig({
  name: 'milabarber',
  title: 'Mila Barber',
  basePath: '/admin',
  projectId,
  dataset,
  schema: { types: schemaTypes },
  plugins: [
    structureTool({ structure }),
    // Vision permite lanzar consultas GROQ a mano: útil para desarrollo, invisible para
    // quien sólo edita contenido.
    visionTool({ defaultApiVersion: apiVersion }),
  ],
  document: {
    // «Textos de la web» es único: no se ofrece crear otro.
    newDocumentOptions: (prev) => prev.filter((template) => template.templateId !== 'businessInfo'),
  },
})
