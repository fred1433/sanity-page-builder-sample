import type {Section} from '@/sanity/types'
import {Hero} from './sections/Hero'
import {FeatureGrid} from './sections/FeatureGrid'
import {ImageText} from './sections/ImageText'
import {Testimonials, type PageRef} from './sections/Testimonials'
import {Cta} from './sections/Cta'

/** Renders the page builder. Unknown section types (newer content, older code) are skipped, not fatal. */
export function Sections({sections, page}: {sections?: Section[] | null; page?: PageRef}) {
  if (!sections?.length) {
    return (
      <section className="empty wrap">
        <p>This page has no sections yet. Add one in the Studio to see it here.</p>
      </section>
    )
  }
  return (
    <>
      {sections.map((section, i) => {
        switch (section._type) {
          case 'hero':
            return <Hero key={section._key} section={section} isFirst={i === 0} />
          case 'featureGrid':
            return <FeatureGrid key={section._key} section={section} />
          case 'imageText':
            return <ImageText key={section._key} section={section} />
          case 'testimonials':
            return <Testimonials key={section._key} section={section} page={page} />
          case 'cta':
            return <Cta key={section._key} section={section} />
          default:
            return null
        }
      })}
    </>
  )
}
