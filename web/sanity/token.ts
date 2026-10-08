import 'server-only'

// A Viewer token. It never has write access. The Studio uses it to switch on Draft Mode,
// and defineLive passes it to the browser only inside an authorised preview session.
export const token = process.env.SANITY_API_READ_TOKEN
