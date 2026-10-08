import {defineArrayMember, defineField, defineType} from 'sanity'
import {ImageIcon} from '@sanity/icons/Image'

export const imageText = defineType({
  name: 'imageText',
  title: 'Image and text',
  type: 'object',
  icon: ImageIcon,
  initialValue: {imageSide: 'right'},
  fields: [
    defineField({name: 'heading', title: 'Heading', type: 'string', validation: (Rule) => [Rule.required(), Rule.max(90).warning('Shorter headings read better next to an image.')]}),
    defineField({
      name: 'body',
      title: 'Text',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [{title: 'Paragraph', value: 'normal'}],
          lists: [{title: 'Bullets', value: 'bullet'}],
          marks: {decorators: [{title: 'Bold', value: 'strong'}, {title: 'Italic', value: 'em'}], annotations: []},
        }),
      ],
    }),
    defineField({
      name: 'image',
      title: 'Image',
      description: 'Optional. Without an image the text takes the full width.',
      type: 'image',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternative text',
          type: 'string',
          validation: (Rule) =>
            // Required only when an image file is actually set: the parent here is the image itself.
            Rule.custom((alt, {parent}) =>
              (parent as {asset?: unknown})?.asset && !alt?.trim() ? 'Describe the image for screen readers, in one sentence.' : true,
            ),
        }),
      ],
    }),
    defineField({
      name: 'imageSide',
      title: 'Image side on desktop',
      type: 'string',
      options: {list: [{title: 'Left', value: 'left'}, {title: 'Right', value: 'right'}], layout: 'radio', direction: 'horizontal'},
    }),
    defineField({name: 'link', title: 'Button', type: 'link'}),
  ],
  preview: {
    select: {title: 'heading', media: 'image'},
    prepare: ({title, media}) => ({title: title || 'Image and text', subtitle: media ? 'Image and text' : 'Image and text, no image', media}),
  },
})
