import {notFound} from 'next/navigation'
import {sanityFetch} from '@/sanity/live'
import {SOLUTION_QUERY} from '@/sanity/queries'
import type {PageData} from '@/sanity/types'
import {Sections} from '@/components/Sections'

export const dynamic = 'force-dynamic'

export default async function SolutionPage(props: {params: Promise<{slug: string}>}) {
  const {slug} = await props.params
  const {data} = (await sanityFetch({query: SOLUTION_QUERY, params: {slug}})) as {data: PageData}
  if (!data) notFound()
  return (
    <main>
      <h1>{data.title}</h1>
      <Sections sections={data.sections} />
    </main>
  )
}
