import {stegaClean} from 'next-sanity'
import type {FeatureGridSection} from '@/sanity/types'

export function FeatureGrid({section}: {section: FeatureGridSection}) {
  const columns = Number(stegaClean(section.columns)) === 2 ? 2 : 3
  const items = (section.items || []).filter((item) => item.title || item.body)
  return (
    <section className="features">
      <div className="wrap features__grid">
        <header className="features__head">
          {section.heading && <h2 className="section-heading">{section.heading}</h2>}
          {section.intro && <p className="features__intro">{section.intro}</p>}
        </header>
        {items.length > 0 && (
          <ul className={`features__list features__list--${columns}`}>
            {items.map((item) => (
              <li key={item._key} className="feature">
                {item.title && <h3 className="feature__title">{item.title}</h3>}
                {item.body && <p className="feature__body">{item.body}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
