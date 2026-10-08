import NextLink from 'next/link'
import type {Link} from '@/sanity/types'
import {resolveLink} from '@/lib/links'

export function Button({link, tone = 'primary'}: {link?: Link; tone?: 'primary' | 'secondary'}) {
  const resolved = resolveLink(link)
  if (!resolved) return null
  const className = `btn btn--${tone}`
  return resolved.external ? (
    <a className={className} href={resolved.href}>
      {resolved.label}
    </a>
  ) : (
    <NextLink className={className} href={resolved.href}>
      {resolved.label}
    </NextLink>
  )
}

export function Actions({primary, secondary}: {primary?: Link; secondary?: Link}) {
  if (!resolveLink(primary) && !resolveLink(secondary)) return null
  return (
    <div className="actions">
      <Button link={primary} />
      <Button link={secondary} tone="secondary" />
    </div>
  )
}
