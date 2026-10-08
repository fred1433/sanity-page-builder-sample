import {defineArrayMember, defineType} from 'sanity'

/**
 * The page builder: an ordered list of typed sections.
 * Sections are inline objects because their content belongs to one page.
 */
export const pageBuilder = defineType({
  name: 'pageBuilder',
  title: 'Sections',
  type: 'array',
  of: [
    defineArrayMember({type: 'hero'}),
    defineArrayMember({type: 'featureGrid'}),
    defineArrayMember({type: 'imageText'}),
    defineArrayMember({type: 'testimonials'}),
    defineArrayMember({type: 'cta'}),
  ],
  options: {
    insertMenu: {
      views: [{name: 'list'}],
    },
  },
  validation: (Rule) => [
    Rule.required().min(1).error('Add at least one section.'),
    Rule.custom((sections) => {
      const list = (sections || []) as Array<{_type: string}>
      const heroes = list.filter((s) => s._type === 'hero').length
      if (heroes > 1) return 'A page can only have one hero. Remove the extra one or change it to another section.'
      if (heroes === 1 && list[0]?._type !== 'hero') return 'Move the hero to the top of the page.'
      return true
    }),
  ],
})
