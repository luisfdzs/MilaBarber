'use client'

import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { apiVersion, dataset, projectId } from './sanity/env'
import { schemaTypes } from './sanity/schemas'
import { structure } from './sanity/structure'

export default defineConfig({
  name: 'milabarber',
  title: 'Mila Barber',
  basePath: '/admin',
  projectId,
  dataset,
  schema: { types: schemaTypes },
  plugins: [structureTool({ structure }), visionTool({ defaultApiVersion: apiVersion })],
  document: {
    newDocumentOptions: (prev) => prev.filter((template) => template.templateId !== 'businessInfo'),
  },
})
