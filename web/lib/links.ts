import {stegaClean} from 'next-sanity'
import type {Link} from '@/sanity/types'

/** Resolves a Sanity button to an href, or null when it has nowhere to go (older or incomplete content). */
export function resolveLink(link: Link | undefined): {href: string; external: boolean; label: string} | null {
  if (!link?.label) return null
  const kind = stegaClean(link.kind)
  if (kind === 'external') return link.href ? {href: stegaClean(link.href), external: true, label: link.label} : null
  const type = stegaClean(link.type)
  if (type === 'landing') return {href: '/', external: false, label: link.label}
  if (type === 'solution' && link.slug) return {href: `/solutions/${stegaClean(link.slug)}/`, external: false, label: link.label}
  return null
}
