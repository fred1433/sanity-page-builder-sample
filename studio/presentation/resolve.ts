import {defineDocuments, type PresentationPluginOptions} from 'sanity/presentation'
import {previewBasePath} from '../env'

const base = previewBasePath

// The web address of a landing or solution page, computed in GROQ so the result is used as is.
const HREF = `select(_type == "landing" => $base + "/", $base + "/solutions/" + slug.current)`

export const resolve: PresentationPluginOptions['resolve'] = {
  // Which document to open when the preview shows a given route.
  mainDocuments: defineDocuments([
    {route: `${base}/`, filter: `_type == "landing" && _id == "landing"`},
    {route: `${base}/solutions/:slug`, filter: `_type == "solution" && slug.current == $slug`},
  ]),
  // Where a document is used, listed at the top of the document form.
  locations: ({id, type, perspectiveStack}, {documentStore}) => {
    if (type === 'landing') return {message: 'This is the home page', locations: [{title: 'Home', href: `${base}/`}]}
    const options = {perspective: perspectiveStack}
    if (type === 'solution') {
      // Same locations as before: the page itself, then the home page that links to it.
      return documentStore.listenQuery(
        `*[_id == $id][0]{"locations": select(defined(slug.current) => [{"title": coalesce(title, "Untitled"), "href": ${HREF}}, {"title": "Home", "href": $base + "/"}])}`,
        {id, base},
        options,
      )
    }
    if (type === 'testimonial') {
      // A testimonial has no page of its own: list every page whose testimonials section picks it.
      return documentStore.listenQuery(
        `{
          "locations": *[_type in ["landing", "solution"] && references($id) && (_type == "landing" || defined(slug.current))]
            | order(_type asc, title asc){"title": select(_type == "landing" => "Home", coalesce(title, "Untitled")), "href": ${HREF}},
          "message": select(count(*[_type in ["landing", "solution"] && references($id)]) == 0 => "Not used on any page yet. Pick it in a testimonials section.")
        }`,
        {id, base},
        options,
      )
    }
    return null
  },
}
