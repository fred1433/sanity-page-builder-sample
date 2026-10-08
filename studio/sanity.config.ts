import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {presentationTool} from 'sanity/presentation'
import {dataset, previewBasePath, previewOrigin, projectId} from './env'
import {schemaTypes} from './schemaTypes'
import {structure} from './structure'
import {resolve} from './presentation/resolve'

export default defineConfig({
  name: 'default',
  title: 'Orvane',
  projectId,
  dataset,
  plugins: [
    presentationTool({
      resolve,
      previewUrl: {
        initial: `${previewOrigin}${previewBasePath}/`,
        previewMode: {enable: `${previewBasePath}/api/draft-mode/enable`},
      },
    }),
    structureTool({structure}),
  ],
  schema: {
    types: schemaTypes,
    // The landing page is a singleton: no "new landing page" in the global create menu.
    templates: (templates) => templates.filter(({schemaType}) => schemaType !== 'landing'),
  },
  document: {
    actions: (actions, {schemaType}) =>
      schemaType === 'landing'
        ? actions.filter(({action}) => action !== 'duplicate' && action !== 'delete')
        : actions,
  },
})
