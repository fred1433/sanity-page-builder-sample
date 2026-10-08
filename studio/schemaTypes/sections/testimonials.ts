import {defineArrayMember, defineField, defineType} from 'sanity'
import {BlockquoteIcon} from '@sanity/icons/Blockquote'

export const testimonials = defineType({
  name: 'testimonials',
  title: 'Testimonials',
  type: 'object',
  icon: BlockquoteIcon,
  initialValue: {heading: 'What finance teams say'},
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (Rule) => [Rule.required().error('Give the section a heading.'), Rule.max(80).warning('Keep the heading short.')],
    }),
    defineField({
      name: 'items',
      title: 'Testimonials',
      type: 'array',
      description: 'Pick existing testimonials or create one here. Drag to change the order on the page.',
      of: [defineArrayMember({type: 'reference', to: [{type: 'testimonial'}]})],
      validation: (Rule) => [
        Rule.required().min(1).error('Pick at least one testimonial.'),
        Rule.max(6).error('Six testimonials at most. Use a second section for the rest.'),
        Rule.unique().error('This testimonial is already in the section. Remove the duplicate.'),
      ],
    }),
  ],
  preview: {
    // Selecting `items` next to `items.0.name` does not return the array, so count the first seven keys instead.
    select: {title: 'heading', first: 'items.0.name', k0: 'items.0._key', k1: 'items.1._key', k2: 'items.2._key', k3: 'items.3._key', k4: 'items.4._key', k5: 'items.5._key', k6: 'items.6._key'},
    prepare: ({title, first, ...keys}) => {
      const count = Object.values(keys).filter(Boolean).length
      return {
        title: title || 'Testimonials',
        subtitle: `Testimonials, ${count > 6 ? 'over 6' : count} ${count === 1 ? 'quote' : 'quotes'}${first ? `, starting with ${first}` : ''}`,
      }
    },
  },
})
