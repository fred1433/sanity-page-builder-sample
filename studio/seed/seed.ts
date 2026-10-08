/**
 * Seeds the sample content: three testimonials, one landing page and two solution pages.
 * Run with: npx sanity exec seed/seed.ts --with-user-token
 * Images are uploaded from seed/images. Documents are written with createOrReplace, so the script can be re-run.
 */
import {readFileSync, existsSync} from 'node:fs'
import {join} from 'node:path'
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2026-10-01'})
const dir = join(process.cwd(), 'seed')

let n = 0
const key = () => `k${(++n).toString(36).padStart(4, '0')}`
const ref = (_ref: string) => ({_type: 'reference', _ref})
const toPage = (id: string) => ({_type: 'link', kind: 'internal', page: ref(id)})
const block = (text: string) => ({_type: 'block', _key: key(), style: 'normal', markDefs: [], children: [{_type: 'span', _key: key(), text, marks: []}]})

async function upload(file: string) {
  const path = join(dir, 'images', file)
  if (!existsSync(path)) return undefined
  const asset = await client.assets.upload('image', readFileSync(path), {filename: file})
  return asset._id
}

async function main() {
  const ledgerImage = await upload('statement.png')
  const teamImage = await upload('approvals.png')

  const testimonials = [
    {
      _id: 'testimonial-priya-raman',
      _type: 'testimonial',
      quote:
        'We used to spend the first hour of every day logging into bank portals. Now the position is waiting when we sit down, and the morning call starts with decisions instead of numbers.',
      name: 'Priya Raman',
      role: 'Group Treasurer, food manufacturer',
    },
    {
      _id: 'testimonial-tomas-ferreira',
      _type: 'testimonial',
      quote: 'With actuals sitting next to the forecast, we caught a duplicated supplier payment the morning it cleared, not three weeks later at month end.',
      name: 'Tomás Ferreira',
      role: 'Finance Director, logistics group',
    },
    {
      _id: 'testimonial-hannah-okafor',
      _type: 'testimonial',
      quote: 'Our bank mandate finally lives in the approval rules instead of a spreadsheet nobody trusted.',
      name: 'Hannah Okafor',
      role: 'Head of Treasury Operations, retail group',
    },
  ]
  const quotes = (heading: string, ids: string[]) => ({
    _key: key(),
    _type: 'testimonials',
    heading,
    items: ids.map((id) => ({_key: key(), ...ref(id)})),
  })

  const landing = {
    _id: 'landing',
    _type: 'landing',
    title: 'Orvane, cash positioning for multi-bank finance teams',
    description: 'One reconciled cash position across every bank and entity, ready before the morning call.',
    sections: [
      {
        _key: key(),
        _type: 'hero',
        variant: 'statement',
        heading: 'Every bank, every entity, one cash position before the morning call.',
        intro:
          'Orvane collects balances and transactions from each of your banks overnight, so treasury starts the day with one reconciled position instead of fourteen portal logins.',
        figure: {label: 'Group cash across 14 accounts', gbp: 48216930, eur: 55449470, usd: 64610690, note: 'Illustrative figures'},
        primary: {...toPage('solution-cash-visibility'), label: 'See cash visibility'},
        secondary: {...toPage('solution-forecasting'), label: 'How forecasting works'},
      },
      {
        _key: key(),
        _type: 'featureGrid',
        heading: 'What changes in the first month',
        intro: 'Three habits most finance teams drop once the numbers arrive on their own.',
        columns: 3,
        items: [
          {_key: key(), _type: 'feature', title: 'One position, not fourteen logins', body: 'Balances from every bank and entity land in a single view, refreshed overnight and during the day where the bank supports it.'},
          {_key: key(), _type: 'feature', title: 'Forecasts next to actuals', body: 'Forecast lines sit beside what actually cleared, so a variance shows up the day it happens rather than at month end.'},
          {_key: key(), _type: 'feature', title: 'Payments with a second signature', body: 'Approval rules follow your bank mandate. Amount, currency and counterparty decide who signs.'},
        ],
      },
      {
        _key: key(),
        _type: 'imageText',
        heading: 'The same numbers for treasury, controllers and the board',
        body: [
          block('Each team reads the position at the depth it needs. A controller opens a single transaction; the board pack shows the group total; both come from the same reconciled ledger.'),
          block('Nothing is re-keyed into a spreadsheet between the bank and the report.'),
        ],
        image: ledgerImage ? {_type: 'image', alt: 'A consolidated bank statement listing balances by entity and currency', asset: ref(ledgerImage)} : undefined,
        imageSide: 'right',
      },
      quotes('What finance teams say', ['testimonial-priya-raman', 'testimonial-tomas-ferreira', 'testimonial-hannah-okafor']),
      {
        _key: key(),
        _type: 'cta',
        heading: 'Bring your bank list. We will bring the position.',
        body: 'Start with the morning view, then see how the forecast checks itself against the bank.',
        tone: 'ink',
        primary: {...toPage('solution-cash-visibility'), label: 'Start with cash visibility'},
        secondary: {...toPage('solution-forecasting'), label: 'Read about forecasting'},
      },
    ],
  }

  const cash = {
    _id: 'solution-cash-visibility',
    _type: 'solution',
    title: 'Cash visibility',
    slug: {_type: 'slug', current: 'cash-visibility'},
    description: 'Group cash by entity, bank and currency, reconciled every morning.',
    sections: [
      {
        _key: key(),
        _type: 'hero',
        variant: 'plain',
        heading: 'Group cash by entity, bank and currency, every morning.',
        intro: 'Statements arrive overnight, are matched against the ledger, and become one position your whole team can read.',
        primary: {...toPage('solution-forecasting'), label: 'How forecasting works'},
        secondary: {...toPage('landing'), label: 'Back to the overview'},
      },
      {
        _key: key(),
        _type: 'featureGrid',
        heading: 'What the morning view shows',
        columns: 2,
        items: [
          {_key: key(), _type: 'feature', title: 'Opening and closing balances', body: 'Per account, per entity and in total, in the original currency and in your reporting currency.'},
          {_key: key(), _type: 'feature', title: 'Unmatched transactions', body: 'Anything the ledger cannot explain is listed first, with the bank reference attached.'},
          {_key: key(), _type: 'feature', title: 'Trapped cash', body: 'Balances that cannot move today, because of a cut-off or a local rule, are marked as such.'},
          {_key: key(), _type: 'feature', title: 'Change since yesterday', body: 'The movement in each balance is explained by the transactions behind it.'},
        ],
      },
      {
        _key: key(),
        _type: 'imageText',
        heading: 'Reconciled before anyone opens a spreadsheet',
        body: [block('Matching rules are set once with your controllers. After that, each morning starts from the exceptions rather than from the full statement.')],
        imageSide: 'left',
      },
      {
        _key: key(),
        _type: 'cta',
        heading: 'Next: a forecast built on the same position',
        tone: 'paper',
        primary: {...toPage('solution-forecasting'), label: 'Read about forecasting'},
        secondary: {...toPage('landing'), label: 'Back to the overview'},
      },
    ],
  }

  const forecasting = {
    _id: 'solution-forecasting',
    _type: 'solution',
    title: 'Forecasting',
    slug: {_type: 'slug', current: 'forecasting'},
    description: 'A thirteen week cash forecast that is checked against what actually cleared.',
    sections: [
      {
        _key: key(),
        _type: 'hero',
        variant: 'plain',
        heading: 'A thirteen week forecast that checks itself against the bank.',
        intro: 'Each forecast line is compared with what actually cleared, so the forecast improves week after week instead of being rebuilt every quarter.',
        primary: {...toPage('solution-cash-visibility'), label: 'See cash visibility'},
        secondary: {...toPage('landing'), label: 'Back to the overview'},
      },
      {
        _key: key(),
        _type: 'featureGrid',
        heading: 'How the forecast is built',
        columns: 3,
        items: [
          {_key: key(), _type: 'feature', title: 'Start from actuals', body: 'Twelve months of cleared transactions give each category its baseline.'},
          {_key: key(), _type: 'feature', title: 'Add what you know', body: 'Owners add known receipts and payments, such as a tax date or a supplier run.'},
          {_key: key(), _type: 'feature', title: 'Measure the gap', body: 'Every Monday the previous week is scored, line by line, against the bank.'},
        ],
      },
      {
        _key: key(),
        _type: 'imageText',
        heading: 'Approvals that follow your bank mandate',
        body: [block('Payments created from the forecast route to the right signatories, by amount and by currency, before anything reaches the bank.')],
        image: teamImage ? {_type: 'image', alt: 'A payment approval routed to two signatories', asset: ref(teamImage)} : undefined,
        imageSide: 'right',
      },
      quotes('Variances, caught the day they happen', ['testimonial-tomas-ferreira', 'testimonial-priya-raman']),
      {
        _key: key(),
        _type: 'cta',
        heading: 'Score last quarter’s forecast against the bank',
        body: 'The forecast starts from the same reconciled position as the morning view.',
        tone: 'ink',
        primary: {...toPage('solution-cash-visibility'), label: 'See cash visibility'},
        secondary: {...toPage('landing'), label: 'Back to the overview'},
      },
    ],
  }

  // Testimonials first: the pages reference them. Any leftover drafts of these documents are dropped.
  const docs = [...testimonials, landing, cash, forecasting] as Array<{_id: string; _type: string}>
  const tx = client.transaction()
  for (const doc of docs) tx.createOrReplace(doc).delete(`drafts.${doc._id}`)
  await tx.commit()
  console.log('Seeded', docs.map((d) => d._id).join(', '))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
