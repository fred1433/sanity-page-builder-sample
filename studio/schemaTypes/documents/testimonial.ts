import {defineField, defineType} from 'sanity'
import {BlockquoteIcon} from '@sanity/icons/Blockquote'

/**
 * A customer quote. A document, not an inline object, because the same quote is picked
 * by testimonials sections on several pages and is corrected in one place.
 */
export const testimonial = defineType({
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  icon: BlockquoteIcon,
  fields: [
    defineField({
      name: 'quote',
      title: 'Quote',
      type: 'text',
      rows: 4,
      description: 'The customer’s words, without quotation marks. The site adds them.',
      validation: (Rule) => [
        Rule.required()
          .custom((quote) => (typeof quote === 'string' && !quote.trim() ? 'Write the quote. A testimonial without one cannot be shown.' : true))
          .error('Write the quote. A testimonial without one cannot be shown.'),
        Rule.max(320).warning('Over 320 characters the quote gets much taller than the ones beside it. Cut it to the sentence that matters.'),
      ],
    }),
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      description: 'Who said it, for example "Priya Raman".',
      validation: (Rule) =>
        Rule.required()
          .custom((name) => (typeof name === 'string' && !name.trim() ? 'Add the name of the person quoted. Unattributed quotes are not shown.' : true))
          .error('Add the name of the person quoted. Unattributed quotes are not shown.'),
    }),
    defineField({
      name: 'role',
      title: 'Role and company',
      type: 'string',
      description: 'For example "Group Treasurer, food manufacturer".',
      validation: (Rule) => Rule.max(80).warning('Keep the role short, it sits on one line under the name.'),
    }),
  ],
  preview: {
    select: {name: 'name', role: 'role', quote: 'quote'},
    prepare: ({name, role, quote}) => ({
      title: name ? (role ? `${name}, ${role}` : name) : 'No attribution yet',
      subtitle: quote || 'No quote yet',
    }),
  },
})
