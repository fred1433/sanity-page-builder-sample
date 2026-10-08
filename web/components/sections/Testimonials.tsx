import {createDataAttribute} from 'next-sanity'
import {dataset, projectId, studioUrl} from '@/sanity/env'
import type {TestimonialsSection} from '@/sanity/types'

export type PageRef = {_id: string; _type: string}

/**
 * Testimonials picked by reference. The first one is set large, so the order editors choose is visible.
 * Each quote carries a data-sanity attribute on the page's array item, which lets editors drag to reorder in Presentation;
 * the quote text itself stays clickable and opens the testimonial document.
 */
export function Testimonials({section, page}: {section: TestimonialsSection; page?: PageRef}) {
  // A reference to a missing or unpublished testimonial resolves to nothing: skip it rather than show an empty quote.
  const items = (section.items || []).filter((item) => item.quote && item.name)
  if (!section.heading && !items.length) return null
  const attr = (path: string) =>
    page
      ? createDataAttribute({id: page._id.replace(/^drafts\./, ''), type: page._type, path, projectId, dataset, baseUrl: studioUrl}).toString()
      : undefined
  const listPath = `sections[_key=="${section._key}"].items`

  return (
    <section className="testimonials">
      <div className="wrap testimonials__grid">
        <header className="testimonials__head">{section.heading && <h2 className="section-heading">{section.heading}</h2>}</header>
        {items.length > 0 && (
          <ul className="testimonials__list" data-sanity={attr(listPath)}>
            {items.map((item, i) => (
              <li key={item._key} className={i === 0 ? 'quote quote--lead' : 'quote'} data-sanity={attr(`${listPath}[_key=="${item._key}"]`)}>
                <figure className="quote__figure">
                  <blockquote className="quote__text">
                    <p>{item.quote}</p>
                  </blockquote>
                  <figcaption className="quote__by">
                    <span className="quote__name">{item.name}</span>
                    {item.role && <span className="quote__role">{item.role}</span>}
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
