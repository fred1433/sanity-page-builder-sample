import {defineQuery} from 'next-sanity'

const LINK = `{label, kind, href, "slug": page->slug.current, "type": page->_type}`

const SECTIONS = `sections[]{
  _key,
  _type,
  _type == "hero" => {variant, heading, intro, figure, primary${LINK}, secondary${LINK}},
  _type == "featureGrid" => {heading, intro, columns, items[]{_key, title, body}},
  _type == "imageText" => {heading, body, imageSide, image{..., asset->{_id, url, metadata{dimensions, lqip}}}, link${LINK}},
  _type == "cta" => {heading, body, tone, primary${LINK}, secondary${LINK}}
}`

export const LANDING_QUERY = defineQuery(`*[_id == "landing"][0]{_id, _type, title, description, ${SECTIONS}}`)

export const SOLUTION_QUERY = defineQuery(
  `*[_type == "solution" && slug.current == $slug][0]{_id, _type, title, description, "slug": slug.current, ${SECTIONS}}`,
)



export const SOLUTION_SLUGS_QUERY = defineQuery(`*[_type == "solution" && defined(slug.current)]{"slug": slug.current}`)
export const NAV_QUERY = defineQuery(`*[_type == "solution" && defined(slug.current)] | order(title asc){_id, title, "slug": slug.current}`)
