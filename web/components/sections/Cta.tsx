import {stegaClean} from 'next-sanity'
import type {CtaSection} from '@/sanity/types'
import {Actions} from '../Button'
import {Lattice} from '../Lattice'

export function Cta({section}: {section: CtaSection}) {
  const tone = stegaClean(section.tone) === 'paper' ? 'paper' : 'ink'
  return (
    <section className={`cta cta--${tone}`}>
      <Lattice className="cta__lattice" height={18} />
      <div className="wrap cta__inner">
        {section.heading && <h2 className="cta__heading">{section.heading}</h2>}
        <div className="cta__aside">
          {section.body && <p className="cta__body">{section.body}</p>}
          <Actions primary={section.primary} secondary={section.secondary} />
        </div>
      </div>
    </section>
  )
}
