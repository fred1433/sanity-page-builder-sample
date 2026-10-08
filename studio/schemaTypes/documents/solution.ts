import {defineField, defineType} from 'sanity'
import {DocumentIcon} from '@sanity/icons/Document'
import {SLUG_PATTERN} from '../../../web/lib/routes'

export const solution = defineType({
  name: 'solution',
  title: 'Solution page',
  type: 'document',
  icon: DocumentIcon,
  fields: [
    defineField({name: 'title', title: 'Name', type: 'string', description: 'Short name used in the menu, for example "Cash visibility".', validation: (Rule) => [Rule.required(), Rule.max(32).warning('Menu items longer than 32 characters crowd the header.')]}),
    defineField({
      name: 'slug',
      title: 'Web address',
      type: 'slug',
      options: {source: 'title', maxLength: 48},
      // The standard uniqueness check still applies; this adds the route format.
      validation: (Rule) => [
        Rule.required().error('Generate a web address from the name.'),
        Rule.custom((slug) => {
          const current = (slug as {current?: string} | undefined)?.current
          if (!current) return true
          return SLUG_PATTERN.test(current) ? true : 'Use words separated by hyphens, without slashes, question marks or #, or click Generate.'
        }).error('Use words separated by hyphens, without slashes, question marks or #, or click Generate.'),
      ],
    }),
    defineField({name: 'description', title: 'Search description', type: 'text', rows: 2, validation: (Rule) => Rule.max(160).warning('Search engines cut descriptions after about 160 characters.')}),
    defineField({name: 'sections', title: 'Sections', type: 'pageBuilder'}),
  ],
  preview: {select: {title: 'title', slug: 'slug.current'}, prepare: ({title, slug}) => ({title, subtitle: slug ? `/solutions/${slug}` : 'No web address yet'})},
})
