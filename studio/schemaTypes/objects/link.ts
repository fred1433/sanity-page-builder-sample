import {defineField, defineType} from 'sanity'
import {LinkIcon} from '@sanity/icons/Link'

type LinkValue = {label?: string; kind?: 'internal' | 'external'; page?: {_ref?: string}; href?: string}

/**
 * A button: a label plus exactly one destination.
 * The rules below are what stops "a button that goes nowhere" from being published.
 */
export const link = defineType({
  name: 'link',
  title: 'Button',
  type: 'object',
  icon: LinkIcon,
  fields: [
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      description: 'Two to four words that say what happens, for example "Book a walkthrough".',
      validation: (Rule) => [
        Rule.max(32).warning('Buttons longer than 32 characters wrap on phones.'),
        Rule.custom((label, {parent}) => {
          const p = parent as LinkValue | undefined
          const hasDestination = p?.kind === 'external' ? Boolean(p?.href) : Boolean(p?.page?._ref)
          if (hasDestination && !label?.trim()) return 'This button has a destination but no label. Add a label, or remove the destination.'
          return true
        }),
      ],
    }),
    defineField({
      name: 'kind',
      title: 'Goes to',
      type: 'string',
      initialValue: 'internal',
      options: {
        list: [
          {title: 'A page on this site', value: 'internal'},
          {title: 'A web address', value: 'external'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
    }),
    defineField({
      name: 'page',
      title: 'Page',
      type: 'reference',
      to: [{type: 'landing'}, {type: 'solution'}],
      hidden: ({parent}) => (parent as LinkValue | undefined)?.kind === 'external',
      validation: (Rule) =>
        Rule.custom((page, {parent}) => {
          const p = parent as LinkValue | undefined
          if (p?.kind !== 'external' && p?.label?.trim() && !page)
            return `"${p.label}" has no destination. Choose a page here, switch "Goes to" to a web address, or clear the label to hide the button.`
          return true
        }),
    }),
    defineField({
      name: 'href',
      title: 'Web address',
      type: 'url',
      hidden: ({parent}) => (parent as LinkValue | undefined)?.kind !== 'external',
      validation: (Rule) => [
        Rule.uri({scheme: ['https', 'mailto']}).error('Use a full address starting with https:// or mailto:'),
        Rule.custom((href, {parent}) => {
          const p = parent as LinkValue | undefined
          if (p?.kind === 'external' && p?.label?.trim() && !href)
            return `"${p.label}" has no destination. Paste a web address here, switch "Goes to" to a page on this site, or clear the label to hide the button.`
          return true
        }),
      ],
    }),
  ],
  preview: {
    select: {label: 'label', kind: 'kind', href: 'href', page: 'page.title'},
    prepare: ({label, kind, href, page}) => ({
      title: label || 'No label',
      subtitle: kind === 'external' ? href || 'No web address yet' : page || 'No page chosen yet',
    }),
  },
})
