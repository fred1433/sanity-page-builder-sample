import NextLink from 'next/link'
import type {NavItem} from '@/sanity/types'
import {Rosette} from './Rosette'

export function SiteHeader({nav}: {nav: NavItem[]}) {
  return (
    <header className="site-header">
      <div className="wrap site-header__inner">
        <NextLink href="/" className="wordmark" aria-label="Orvane, home">
          <Rosette size={28} className="wordmark__seal" />
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
