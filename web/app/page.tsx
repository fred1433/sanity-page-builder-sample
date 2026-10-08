import {sanityFetch} from '@/sanity/live'
import {LANDING_QUERY} from '@/sanity/queries'
import type {PageData} from '@/sanity/types'
import {Sections} from '@/components/Sections'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const {data} = (await sanityFetch({query: LANDING_QUERY})) as {data: PageData}
  return (
    <main>
      <p>{data?.title}</p>
      <Sections sections={data?.sections} />
    </main>
  )
}
