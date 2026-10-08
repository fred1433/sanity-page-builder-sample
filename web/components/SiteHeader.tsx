import NextLink from 'next/link'
import type {NavItem} from '@/sanity/types'
import {sealPaths} from '@/lib/guilloche'

export function SiteHeader({nav}: {nav: NavItem[]}) {
  return (
    <header className="site-header">
      <div className="wrap site-header__inner">
        <NextLink href="/" className="wordmark" aria-label="Orvane, home">
          <svg className="wordmark__seal" viewBox="0 0 56 56" width={28} height={28} aria-hidden="true">
            <path d={sealPaths(56)} fill="none" />
          </svg>
          <span>orvane</span>
        </NextLink>
        <nav aria-label="Solutions">
          <ul className="site-nav">
            {nav.map((item) => (
              <li key={item._id}>
                <NextLink href={`/solutions/${item.slug}/`}>{item.title}</NextLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}
