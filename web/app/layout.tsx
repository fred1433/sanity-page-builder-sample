import type {Metadata, Viewport} from 'next'
import {draftMode} from 'next/headers'
import {Bodoni_Moda, Schibsted_Grotesk} from 'next/font/google'
import {VisualEditing} from 'next-sanity/visual-editing'
import {SanityLive, sanityFetch} from '@/sanity/live'
import {basePath, siteOrigin} from '@/sanity/env'
import {NAV_QUERY} from '@/sanity/queries'
import type {NavItem} from '@/sanity/types'
import {SampleBanner} from '@/components/SampleBanner'
import {SiteHeader} from '@/components/SiteHeader'
import {SiteFooter} from '@/components/SiteFooter'
import './globals.css'

const grotesk = Schibsted_Grotesk({subsets: ['latin'], weight: ['400', '500', '700', '800'], variable: '--font-grotesk', display: 'swap'})
const bodoni = Bodoni_Moda({subsets: ['latin'], weight: ['500'], variable: '--font-bodoni', display: 'swap'})

export const metadata: Metadata = {
  title: {default: 'Orvane', template: '%s, Orvane'},
  description: 'An independent Sanity and Next.js sample: a page builder, visual editing and a reviewed change. Fictional content.',
  robots: {index: false, follow: false},
  metadataBase: new URL(siteOrigin),
  openGraph: {
    type: 'website',
    siteName: 'Orvane, a Sanity sample',
    images: [{url: `${basePath}/og.jpg`, width: 1200, height: 630, alt: 'The Orvane statement card: group cash of 48,216,930 pounds, with an engraved rosette'}],
  },
  twitter: {card: 'summary_large_image'},
}

export const viewport: Viewport = {themeColor: '#F1F3EE'}

export default async function RootLayout({children}: {children: React.ReactNode}) {
  const {isEnabled} = await draftMode()
  const {data: nav} = (await sanityFetch({query: NAV_QUERY})) as {data: NavItem[] | null}
  return (
    <html lang="en-GB" className={`${grotesk.variable} ${bodoni.variable}`}>
      <body>
        <SampleBanner />
        <SiteHeader nav={nav || []} />
        <main id="main">{children}</main>
        <SiteFooter />
        <SanityLive includeDrafts={isEnabled} />
        {isEnabled && <VisualEditing />}
      </body>
    </html>
  )
}
