import type {StructureResolver} from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Landing page')
        .id('landing')
        .child(S.document().schemaType('landing').documentId('landing')),
      S.divider(),
      ...S.documentTypeListItems().filter((item) => item.getId() !== 'landing'),
    ])
