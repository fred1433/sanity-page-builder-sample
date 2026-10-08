import type {Metadata} from 'next'
import {sanityFetch} from '@/sanity/live'
import {LANDING_QUERY} from '@/sanity/queries'
import type {PageData} from '@/sanity/types'
import {Sections} from '@/components/Sections'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const {data} = (await sanityFetch({query: LANDING_QUERY, stega: false})) as {data: PageData}
  return {title: {absolute: data?.title || 'Orvane'}, description: data?.description}
}

export default async function Home() {
  const {data} = (await sanityFetch({query: LANDING_QUERY})) as {data: PageData}
  return <Sections sections={data?.sections} page={data ? {_id: data._id, _type: data._type} : undefined} />
}
