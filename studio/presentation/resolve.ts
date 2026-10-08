import {map} from 'rxjs'
import {defineDocuments, type PresentationPluginOptions} from 'sanity/presentation'
import {previewBasePath} from '../env'
import {pagePath, SOLUTION_ROUTE} from '../../web/lib/routes'

const base = previewBasePath

type PageRow = {type?: string; slug?: string | null; title?: string | null}

/** Turns page rows from GROQ into Presentation locations, with paths from the shared route builder. */
const toLocations = (rows: PageRow[]) =>
  rows.flatMap((row) => {
    const path = pagePath(row.type, row.slug)
    return path ? [{title: row.type === 'landing' ? 'Home' : row.title || 'Untitled', href: `${base}${path}`}] : []
  })

export const resolve: PresentationPluginOptions['resolve'] = {
  // Which document to open when the preview shows a given route.
  mainDocuments: defineDocuments([
    {route: `${base}/`, filter: `_type == "landing" && _id == "landing"`},
    {route: `${base}${SOLUTION_ROUTE}`, filter: `_type == "solution" && slug.current == $slug`},
  ]),
  // Where a document is used, listed at the top of the document form.
  locations: ({id, type, perspectiveStack}, {documentStore}) => {
    if (type === 'landing') return {message: 'This is the home page', locations: [{title: 'Home', href: `${base}/`}]}
    const options = {perspective: perspectiveStack}
    if (type === 'solution') {
      // The page itself, then the home page that links to it.
      return documentStore
        .listenQuery(`*[_id == $id][0]{"type": _type, "slug": slug.current, title}`, {id}, options)
        .pipe(map((row: PageRow | null) => ({locations: toLocations(row ? [row, {type: 'landing'}] : [])})))
    }
    if (type === 'testimonial') {
      // A testimonial has no page of its own: list every page whose testimonials section picks it.
      return documentStore
        .listenQuery(`*[_type in ["landing", "solution"] && references($id)] | order(_type asc, title asc){"type": _type, "slug": slug.current, title}`, {id}, options)
        .pipe(
          map((rows: PageRow[]) => {
            const locations = toLocations(rows || [])
            return locations.length ? {locations} : {message: 'Not used on any page yet. Pick it in a testimonials section.', locations: []}
          }),
        )
    }
    return null
  },
}
