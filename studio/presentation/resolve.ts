import {defineDocuments, defineLocations, type PresentationPluginOptions} from 'sanity/presentation'
import {previewBasePath} from '../env'

const base = previewBasePath

export const resolve: PresentationPluginOptions['resolve'] = {
  // Which document to open when the preview shows a given route.
  mainDocuments: defineDocuments([
    {route: `${base}/`, filter: `_type == "landing" && _id == "landing"`},
    {route: `${base}/solutions/:slug`, filter: `_type == "solution" && slug.current == $slug`},
  ]),
  // Where a document is used, listed at the top of the document form.
  locations: {
    landing: defineLocations({
      message: 'This is the home page',
      locations: [{title: 'Home', href: `${base}/`}],
    }),
    solution: defineLocations({
      select: {title: 'title', slug: 'slug.current'},
      resolve: (doc) =>
        doc?.slug
          ? {
              locations: [
                {title: doc.title || 'Untitled', href: `${base}/solutions/${doc.slug}`},
                {title: 'Home', href: `${base}/`},
              ],
            }
          : undefined,
    }),
  },
}
