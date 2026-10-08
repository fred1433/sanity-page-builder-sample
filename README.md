# Sanity page builder sample

An independent Sanity and Next.js sample built for a fictional B2B finance company, Orvane. All content is invented, and the maintenance change described below was staged on this sample, not on client code.

**[Live site](https://theaipipe.com/demos/kota-sanity/)** · **[Editor workflow video, 80 s](https://theaipipe.com/demos/kota-sanity/workflow.mp4)** (filmed with the project owner's account)

[![The Studio's Presentation tool next to the page it edits](docs/workflow-poster.jpg)](https://theaipipe.com/demos/kota-sanity/workflow.mp4)

## What an editor can do

- Build a page from five approved section types (hero, feature grid, image and text, testimonials, call to action), each with a readable preview, starting values and a few layout options, and reorder them with the Studio's array controls.
- In Presentation, click editable page content (headings, intros, button labels, feature and image texts, quotes, names and roles, the statement card's caption and footnote) to open its field, and watch the preview follow while typing. The statement amounts are edited in the form; they are not clickable on the page.
- Keep the public site on the published version until Publish; publishing shows on the next visit, with no redeploy. Outside the Studio, a "Draft preview · Exit preview" control marks a draft session.
- Be stopped, with a message that says how to fix it, before publishing: a button with a label but no destination (or the reverse), a second hero or a hero below the top, a feature grid outside 2 to 6 items, an image without alternative text, a statement card missing an amount, a page address with slashes, `?` or `#`, a testimonial without its quote or attribution, the same testimonial twice. Fields hidden by the current layout are not validated.
- Long headings trigger a warning; optional images can be left out without breaking the page.

## The change: an optional testimonials section

The four-section site was committed first; the testimonials section was then added as a separate change by Claude Code, with this request, verbatim:

> Add an optional testimonials section to the existing page builder. Editors must be able to select and reorder testimonials. Require quote text and attribution. Keep the existing pages valid without this section and preserve their current content. Create the example content as drafts. Check the schema, query/types, frontend rendering and visual editing, including mobile.

- The change: [commit 6550fe9](../../commit/6550fe9) (schema, validation, GROQ projection, hand-written types, responsive component, Presentation locations).
- The review pass: [commit d97c389](../../commit/d97c389), by Claude in a second Claude Code session, separate from the headless run that wrote the change. No human acceptance is claimed.
- Existing pages: their content and layout are preserved ([before](docs/review/before), [after](docs/review/after)); the rosette ornament was corrected during review.
- Everything that came after, fix by fix: [docs/maintenance_log.md](docs/maintenance_log.md).

## Content model and technical choices

- Sections are inline objects in one `pageBuilder` array, because their content belongs to one page. Testimonials are documents referenced by the section, because a quote is reused across pages and corrected in one place.
- The landing page is a singleton; the two solution pages share one type and one template. Paths come from one function, `web/lib/routes.ts`, used by the header, the buttons and Presentation.
- The schema in `studio/` is the source of truth; the Studio is hosted by Sanity. The front end is Next.js 16 on Cloudflare Workers through OpenNext, under a sub path, rendered per request from the Sanity CDN.
- Visual editing uses `defineLive` with a Viewer token on the server, stega for click-to-edit and the maintained `defineEnableDraftMode` handler. No write token is in the repository or in browser code.
- GROQ result types are written by hand (`web/sanity/types.ts`), not generated. No AI runs on the site or in the Studio.

## Running it

```bash
# Studio
cd studio && npm install
cp .env.example .env          # set SANITY_STUDIO_PROJECT_ID and SANITY_STUDIO_DATASET
npx sanity login
npx sanity cors add http://localhost:3000 --credentials
npx sanity exec seed/seed.ts --with-user-token -- --bootstrap   # creates the six sample documents if missing
npx sanity dev                # keeps running on http://localhost:3333
```

```bash
# Front end, in a second terminal from the repository root
cd web && npm install
cp .env.example .env.local    # set NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET and SANITY_API_READ_TOKEN (a Viewer token)
npm run dev
```

- Without `--bootstrap`, the seed is a **reset**: it replaces the six sample documents (three testimonials, the landing page, two solution pages) and deletes their drafts.
- There is no default project: without the `.env` files the Studio and the build stop and name the missing variable.
- Checks: `python scripts/run_all_checks.py` with `SANITY_PROJECT_ID`, `SANITY_DATASET`, `SITE_URL` and `STUDIO_URL` set. It runs the Presentation checks and the release checks, exits non-zero on any failure, and writes a report tied to the commit in [docs/checks](docs/checks). The scripts refuse to run if any page has an unpublished draft, write only to their own test documents, and delete them at the end.
- Deploy: copy `web/wrangler.example.jsonc` to `wrangler.jsonc`, set your route, then `npm run deploy` in `web/`. No starter was used.

## How the change was made with Claude Code

The author's account of the setup: Claude Code ran headless in this repository on a subscription, with no `ANTHROPIC_API_KEY` set; the official Sanity plugin was enabled (`.claude/settings.json`) along with the repository's `CLAUDE.md`; Sanity's MCP server was authenticated with a temporary Editor token kept outside the repository and deleted afterwards. These are the author's statements, not independently verifiable from the repository.

One real MCP exchange from the session log, shortened (project identifiers and revision ids removed; the roles shown were replaced with sector descriptions during review):

```text
tool call   mcp__sanity__create_documents
  intent:     "Example testimonials for the new testimonials page builder section, as drafts"
  documents:  [{type: "testimonial", content: {_id: "testimonial-priya-raman",
                 quote: "We used to spend the first hour of every day logging into bank portals. ...",
                 name: "Priya Raman", role: "<role edited in review>"}},
               ... two more testimonials]
tool result
  Processed 3 documents: 3 successful, 0 failed
  The created documents are drafts. Use publish_documents to make them live.
  <_id>drafts.testimonial-priya-raman</_id> <_type>testimonial</_type> <name>Priya Raman</name> ...
```

The rest of the run, in the author's account: MCP read the existing pages and Sanity's page-builder rules, Claude Code wrote the schema, query, types and component locally, deployed the schema with the CLI, added the sections to two page drafts through MCP, validated them with `sanity documents validate`, and checked drafts and published pages with Playwright. The review pass and every later fix are in [docs/maintenance_log.md](docs/maintenance_log.md).
