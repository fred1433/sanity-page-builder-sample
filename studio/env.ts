// Every value can be overridden so the Studio runs on someone else's project.
export const projectId = process.env.SANITY_STUDIO_PROJECT_ID || 'vg4jfonv'
export const dataset = process.env.SANITY_STUDIO_DATASET || 'production'
// Where the Next.js front end lives, and the sub path it is served under.
export const previewOrigin = process.env.SANITY_STUDIO_PREVIEW_ORIGIN || 'http://localhost:3000'
export const previewBasePath = process.env.SANITY_STUDIO_PREVIEW_BASE_PATH || ''
