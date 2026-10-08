# Working on this repository

A Sanity Studio and a Next.js front end for a fictional B2B company (Orvane). Keep changes small and reviewable.

## Layout
- `studio/`: Sanity Studio. The schema in `studio/schemaTypes` is the source of truth. Never manage a schema through MCP.
- `web/`: Next.js App Router, deployed to Cloudflare Workers with OpenNext. Draft Mode and Presentation are wired in `web/sanity/live.ts` and `web/app/api/draft-mode`.
- `scripts/`: Playwright checks (Presentation acceptance, page snapshots).

## Conventions
- The page builder is `studio/schemaTypes/objects/pageBuilder.ts`: an array of typed sections.
- Content that belongs to one page is an inline object. Content meant to be reused across pages is a document, added to a section by reference.
- Every section has an icon, a preview, initial values and validation messages that tell the editor how to fix the problem.
- Adding a section touches, in order: the schema type, `schemaTypes/index.ts`, `pageBuilder.ts`, the GROQ projection in `web/sanity/queries.ts`, the hand-written type in `web/sanity/types.ts`, a component in `web/components/sections`, the switch in `web/components/Sections.tsx`, and `web/app/globals.css`.
- The front end must render when optional fields are missing or content is older than the code. Compare option values with `stegaClean`.
- Styling follows the tokens at the top of `web/app/globals.css`. No new fonts or colours.

## Sanity MCP
- Use it to read the deployed schema and existing documents, and to create example content as drafts.
- Never publish documents and never deploy schemas through MCP.
- Content Lake does not run Studio validation, so check anything created through MCP with `cd studio && npx sanity documents validate --yes`.

## Checks before handing back
- `cd studio && npx tsc --noEmit && npx sanity build --yes`
- `cd web && npx tsc --noEmit && npx next build`
- Existing pages must still render: compare `scripts/page_snapshots.py` output with `docs/review/before`.
- Do not deploy and do not edit `.env*` files.
