import {defineField, defineType} from 'sanity'
import {BulbOutlineIcon} from '@sanity/icons/BulbOutline'

export const cta = defineType({
  name: 'cta',
  title: 'Call to action',
  type: 'object',
  icon: BulbOutlineIcon,
  initialValue: {tone: 'ink'},
  fields: [
    defineField({name: 'heading', title: 'Heading', type: 'string', validation: (Rule) => [Rule.required(), Rule.max(80).warning('Keep the closing line short.')]}),
    defineField({name: 'body', title: 'Text', type: 'text', rows: 2}),
    defineField({
      name: 'primary',
      title: 'Main button',
      type: 'link',
      validation: (Rule) =>
        Rule.custom((value) => {
          const v = value as {label?: string} | undefined
          return v?.label?.trim() ? true : 'A call to action needs a main button. Give it a label and a destination.'
        }),
    }),
    defineField({name: 'secondary', title: 'Second button', type: 'link'}),
    defineField({
      name: 'tone',
      title: 'Background',
      type: 'string',
      options: {list: [{title: 'Ink', value: 'ink'}, {title: 'Paper', value: 'paper'}], layout: 'radio', direction: 'horizontal'},
    }),
  ],
  preview: {
    select: {title: 'heading', tone: 'tone'},
    prepare: ({title, tone}) => ({title: title || 'Call to action', subtitle: `Call to action, ${tone || 'ink'}`}),
  },
})
