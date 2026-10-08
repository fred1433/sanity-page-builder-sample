// Hand-written result types for the GROQ queries in queries.ts.
// Every field is optional on purpose: the front end must survive missing or older content.
import type {PortableTextBlock} from 'next-sanity'

export type Link = {label?: string; kind?: 'internal' | 'external'; href?: string; slug?: string; type?: 'landing' | 'solution'} | null

export type HeroSection = {
  _key: string
  _type: 'hero'
  variant?: 'statement' | 'plain'
  heading?: string
  intro?: string
  figure?: {label?: string; gbp?: number; eur?: number; usd?: number; note?: string}
  primary?: Link
  secondary?: Link
}
export type FeatureGridSection = {
  _key: string
  _type: 'featureGrid'
  heading?: string
  intro?: string
  columns?: 2 | 3
  items?: {_key: string; title?: string; body?: string}[]
}
export type ImageTextSection = {
  _key: string
  _type: 'imageText'
  heading?: string
  body?: PortableTextBlock[]
  imageSide?: 'left' | 'right'
  image?: {alt?: string; asset?: {_id: string; url: string; metadata?: {dimensions?: {width: number; height: number}; lqip?: string}}; hotspot?: unknown; crop?: unknown} | null
  link?: Link
}
export type CtaSection = {_key: string; _type: 'cta'; heading?: string; body?: string; tone?: 'ink' | 'paper'; primary?: Link; secondary?: Link}

export type Section = HeroSection | FeatureGridSection | ImageTextSection | CtaSection

export type PageData = {_id: string; _type: 'landing' | 'solution'; title?: string; description?: string; slug?: string; sections?: Section[] | null} | null
export type NavItem = {_id: string; title?: string; slug: string}
