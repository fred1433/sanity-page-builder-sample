import {PortableText, stegaClean} from 'next-sanity'
import type {ImageTextSection} from '@/sanity/types'
import {urlFor} from '@/sanity/image'
import {Actions} from '../Button'

export function ImageText({section}: {section: ImageTextSection}) {
  const side = stegaClean(section.imageSide) === 'left' ? 'left' : 'right'
  const image = section.image?.asset ? section.image : null
  const dims = image?.asset?.metadata?.dimensions
  return (
    <section className={`imagetext imagetext--${image ? side : 'solo'}`}>
      <div className="wrap imagetext__grid">
        <div className="imagetext__text">
          {section.heading && <h2 className="section-heading">{section.heading}</h2>}
          {section.body && (
            <div className="prose">
              <PortableText value={section.body} />
            </div>
          )}
          <Actions primary={section.link} />
        </div>
        {image && (
          <div className="imagetext__media">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={urlFor(image).width(1200).auto('format').url()}
              srcSet={[600, 900, 1200, 1600].map((w) => `${urlFor(image).width(w).auto('format').url()} ${w}w`).join(', ')}
              sizes="(min-width: 960px) 50vw, 100vw"
              width={dims?.width}
              height={dims?.height}
              alt={stegaClean(image.alt) || ''}
              loading="lazy"
              style={image.asset?.metadata?.lqip ? {backgroundImage: `url(${image.asset.metadata.lqip})`} : undefined}
            />
          </div>
        )}
      </div>
    </section>
  )
}
