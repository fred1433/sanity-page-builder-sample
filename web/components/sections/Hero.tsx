import {stegaClean} from 'next-sanity'
import type {HeroSection} from '@/sanity/types'
import {Actions} from '../Button'
import {Note} from './Note'
import {Rosette} from '../Rosette'

export function Hero({section, isFirst}: {section: HeroSection; isFirst: boolean}) {
  const variant = stegaClean(section.variant) || 'plain'
  const long = stegaClean(section.heading || '').length > 64
  const Heading = isFirst ? 'h1' : 'h2'
  return (
    <section className={`hero hero--${variant}`}>
      <div className="wrap hero__grid">
        {variant === 'plain' && <Rosette size={300} className="hero__seal" />}
        {section.heading && <Heading className={`hero__heading${long ? ' hero__heading--long' : ''}`}>{section.heading}</Heading>}
        <div className="hero__aside">
          {section.intro && <p className="hero__intro">{section.intro}</p>}
          <Actions primary={section.primary} secondary={section.secondary} />
        </div>
      </div>
      {variant === 'statement' && section.figure && (
        <div className="wrap">
          <Note figure={section.figure} seal={<Rosette size={390} />} />
        </div>
      )}
    </section>
  )
}
