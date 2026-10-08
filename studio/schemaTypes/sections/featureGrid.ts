import {defineArrayMember, defineField, defineType} from 'sanity'
import {ThLargeIcon} from '@sanity/icons/ThLarge'

export const featureGrid = defineType({
  name: 'featureGrid',
  title: 'Feature grid',
  type: 'object',
  icon: ThLargeIcon,
  initialValue: {columns: 3},
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (Rule) => [Rule.required(), Rule.max(80).warning('Shorter headings read better above a grid.')],
    }),
    defineField({name: 'intro', title: 'Intro', type: 'text', rows: 2}),
    defineField({
      name: 'columns',
      title: 'Columns on desktop',
      type: 'number',
      options: {list: [2, 3], layout: 'radio', direction: 'horizontal'},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'items',
      title: 'Features',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'feature',
          fields: [
            defineField({name: 'title', title: 'Title', type: 'string', validation: (Rule) => [Rule.required(), Rule.max(60)]}),
            defineField({
              name: 'body',
              title: 'Description',
              type: 'text',
              rows: 3,
              validation: (Rule) => [Rule.required(), Rule.max(240).warning('Over 240 characters this card gets much taller than its neighbours.')],
            }),
          ],
          preview: {select: {title: 'title', subtitle: 'body'}},
        }),
      ],
      validation: (Rule) => [
        Rule.required().min(2).error('A grid needs at least two features.'),
        Rule.max(6).error('Six features at most. Split the rest into a second grid.'),
      ],
    }),
  ],
  preview: {
    select: {title: 'heading', items: 'items'},
    prepare: ({title, items}) => ({title: title || 'Feature grid', subtitle: `Feature grid, ${items?.length || 0} features`}),
  },
})
