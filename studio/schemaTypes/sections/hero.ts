import {defineField, defineType} from 'sanity'
import {BlockElementIcon} from '@sanity/icons/BlockElement'

export const hero = defineType({
  name: 'hero',
  title: 'Hero',
  type: 'object',
  icon: BlockElementIcon,
  initialValue: {variant: 'plain'},
  fields: [
    defineField({
      name: 'variant',
      title: 'Layout',
      type: 'string',
      options: {
        list: [
          {title: 'Statement: heading with the consolidated balance', value: 'statement'},
          {title: 'Plain: heading only', value: 'plain'},
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (Rule) => [
        Rule.required().error('A hero needs a heading.'),
        Rule.max(90).warning('Over 90 characters the heading runs to five lines on a phone. Consider moving detail into the intro.'),
      ],
    }),
    defineField({
      name: 'intro',
      title: 'Intro',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.max(260).warning('Keep the intro under 260 characters so the buttons stay above the fold.'),
    }),
    defineField({
      name: 'figure',
      title: 'Consolidated balance',
      description: 'Illustrative amounts shown on the statement card. Visitors can switch currency.',
      type: 'object',
      hidden: ({parent}) => parent?.variant !== 'statement',
      options: {collapsible: true, collapsed: false},
      fields: [
        defineField({name: 'label', title: 'Caption', type: 'string', initialValue: 'Cash across every bank, consolidated'}),
        defineField({name: 'gbp', title: 'Amount in GBP', type: 'number', validation: (Rule) => Rule.min(0)}),
        defineField({name: 'eur', title: 'Amount in EUR', type: 'number', validation: (Rule) => Rule.min(0)}),
        defineField({name: 'usd', title: 'Amount in USD', type: 'number', validation: (Rule) => Rule.min(0)}),
        defineField({name: 'note', title: 'Footnote', type: 'string', initialValue: 'Illustrative figures'}),
      ],
      validation: (Rule) =>
        Rule.custom((figure, {parent}) => {
          if ((parent as {variant?: string})?.variant !== 'statement') return true
          const f = figure as {gbp?: number; eur?: number; usd?: number} | undefined
          if (!f?.gbp || !f?.eur || !f?.usd) return 'The statement layout needs all three amounts. Fill GBP, EUR and USD, or switch the layout to Plain.'
          return true
        }),
    }),
    defineField({name: 'primary', title: 'Main button', type: 'link'}),
    defineField({name: 'secondary', title: 'Second button', type: 'link'}),
  ],
  preview: {
    select: {title: 'heading', variant: 'variant'},
    prepare: ({title, variant}) => ({title: title || 'Hero without a heading', subtitle: `Hero, ${variant || 'plain'}`}),
  },
})
