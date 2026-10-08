import type {Metadata} from 'next'
import {notFound} from 'next/navigation'
import {sanityFetch} from '@/sanity/live'
import {SOLUTION_QUERY} from '@/sanity/queries'
import type {PageData} from '@/sanity/types'
import {Sections} from '@/components/Sections'

export const dynamic = 'force-dynamic'

type Props = {params: Promise<{slug: string}>}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const {slug} = await props.params
  const {data} = (await sanityFetch({query: SOLUTION_QUERY, params: {slug}, stega: false})) as {data: PageData}
  return {title: data?.title, description: data?.description}
}

export default async function SolutionPage(props: Props) {
  const {slug} = await props.params
  const {data} = (await sanityFetch({query: SOLUTION_QUERY, params: {slug}})) as {data: PageData}
  if (!data) notFound()
  return <Sections sections={data.sections} page={{_id: data._id, _type: data._type}} />
}
