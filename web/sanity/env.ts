// Read from web/.env.local (see .env.example). There is no default project: a missing value fails the build with a clear message.
function required(name: string, value: string | undefined): string {
  if (!value) throw new Error(`Missing ${name}. Copy web/.env.example to web/.env.local and fill it in.`)
  return value
}

export const projectId = required('NEXT_PUBLIC_SANITY_PROJECT_ID', process.env.NEXT_PUBLIC_SANITY_PROJECT_ID)
export const dataset = required('NEXT_PUBLIC_SANITY_DATASET', process.env.NEXT_PUBLIC_SANITY_DATASET)
export const apiVersion = '2026-10-01'
export const studioUrl = process.env.NEXT_PUBLIC_SANITY_STUDIO_URL || 'http://localhost:3333'
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
// Public origin of the site, used for absolute links such as the social preview image.
export const siteOrigin = process.env.NEXT_PUBLIC_SITE_ORIGIN || 'http://localhost:3000'
