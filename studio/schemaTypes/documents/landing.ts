import {defineField, defineType} from 'sanity'
import {HomeIcon} from '@sanity/icons/Home'

export const landing = defineType({
  name: 'landing',
  title: 'Landing page',
  type: 'document',
  icon: HomeIcon,
  fields: [
    defineField({name: 'title', title: 'Page title', type: 'string', description: 'Used in the browser tab and search results.', validation: (Rule) => Rule.required()}),
    defineField({name: 'description', title: 'Search description', type: 'text', rows: 2, validation: (Rule) => Rule.max(160).warning('Search engines cut descriptions after about 160 characters.')}),
    defineField({name: 'sections', title: 'Sections', type: 'pageBuilder'}),
  ],
  preview: {prepare: () => ({title: 'Landing page'})},
})
