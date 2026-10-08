import {createClient} from 'next-sanity'
import {apiVersion, dataset, projectId, studioUrl} from './env'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: 'published',
  // Stega only switches on in Draft Mode: it is what makes rendered text clickable in Presentation.
  stega: {studioUrl},
})
