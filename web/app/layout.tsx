import type {Metadata} from 'next'
import {draftMode} from 'next/headers'
import {VisualEditing} from 'next-sanity/visual-editing'
import {SanityLive} from '@/sanity/live'

export const metadata: Metadata = {title: 'Orvane'}

export default async function RootLayout({children}: {children: React.ReactNode}) {
  const {isEnabled} = await draftMode()
  return (
    <html lang="en-GB">
      <body>
        {children}
        <SanityLive includeDrafts={isEnabled} />
        {isEnabled && <VisualEditing />}
      </body>
    </html>
  )
}
