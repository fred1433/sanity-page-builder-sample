import {stegaClean} from 'next-sanity'
import type {Link} from '@/sanity/types'
import {pagePath} from './routes'

/** Resolves a Sanity button to an href, or null when it has nowhere to go (older or incomplete content). */
export function resolveLink(link: Link | undefined): {href: string; external: boolean; label: string} | null {
  if (!link?.label) return null
  if (stegaClean(link.kind) === 'external') return link.href ? {href: stegaClean(link.href), external: true, label: link.label} : null
  const path = pagePath(stegaClean(link.type), stegaClean(link.slug))
  return path ? {href: path, external: false, label: link.label} : null
}
