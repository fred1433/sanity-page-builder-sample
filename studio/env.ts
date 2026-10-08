// Read from studio/.env (see .env.example). There is no default project: a missing value stops the Studio with a clear message.
function required(name: string, value: string | undefined): string {
  if (!value) throw new Error(`Missing ${name}. Copy studio/.env.example to studio/.env and fill it in.`)
  return value
}

export const projectId = required('SANITY_STUDIO_PROJECT_ID', process.env.SANITY_STUDIO_PROJECT_ID)
export const dataset = required('SANITY_STUDIO_DATASET', process.env.SANITY_STUDIO_DATASET)
// Where the Next.js front end lives, and the sub path it is served under.
export const previewOrigin = process.env.SANITY_STUDIO_PREVIEW_ORIGIN || 'http://localhost:3000'
export const previewBasePath = process.env.SANITY_STUDIO_PREVIEW_BASE_PATH || ''
