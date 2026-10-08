// The one place that turns a document into its path on the site.
// Used by the front end (header, buttons) and imported by the Studio (slug rule, Presentation locations).

/** Words separated by single hyphens: no slashes, query strings or fragments. */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/** Route pattern for Presentation's document resolver. */
export const SOLUTION_ROUTE = '/solutions/:slug'

/** Path of a page, relative to the site's base path. Null when the page has no usable address yet. */
export function pagePath(type: string | undefined, slug?: string | null): string | null {
  if (type === 'landing') return '/'
  if (type === 'solution' && slug && SLUG_PATTERN.test(slug)) return `/solutions/${slug}/`
  return null
}
