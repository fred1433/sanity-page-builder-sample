'use client'

import {useState, type ReactNode} from 'react'
import {Lattice} from '../Lattice'

const CURRENCIES = [
  {code: 'GBP', symbol: '£', key: 'gbp'},
  {code: 'EUR', symbol: '€', key: 'eur'},
  {code: 'USD', symbol: '$', key: 'usd'},
] as const

type Figure = {label?: string; gbp?: number; eur?: number; usd?: number; note?: string}

/** One digit column of the odometer: the ten digits stacked, shifted to show the right one. */
function Digit({value}: {value: number}) {
  return (
    <span className="odo__col" aria-hidden="true">
      <span className="odo__strip" style={{transform: `translateY(${-value * 10}%)`}}>
        {'0123456789'.split('').map((d) => (
          <span key={d}>{d}</span>
        ))}
      </span>
    </span>
  )
}

/**
 * The statement note: consolidated balance, switchable between three currencies.
 */
export function Note({figure, seal}: {figure: Figure; seal?: ReactNode}) {
  const available = CURRENCIES.filter((c) => typeof figure[c.key] === 'number')
  const [index, setIndex] = useState(0)
  if (!available.length) return null
  const current = available[Math.min(index, available.length - 1)]
  const amount = figure[current.key] as number
  const formatted = new Intl.NumberFormat('en-GB', {maximumFractionDigits: 0}).format(amount)

  return (
    <figure className="note">
      <Lattice className="note__lattice note__lattice--top" />
      <div className="note__body">
        {figure.label && <figcaption className="note__caption">{figure.label}</figcaption>}
        <p className="note__figure" style={{['--chars' as string]: formatted.length + 1}}>
          {/* Announced to screen readers whenever the currency changes. */}
          <span className="sr-only" aria-live="polite" aria-atomic="true">{`${current.symbol}${formatted} ${current.code}`}</span>
          <span className="note__symbol" aria-hidden="true">
            {current.symbol}
          </span>
          {formatted.split('').map((ch, i) =>
            /\d/.test(ch) ? (
              <Digit key={`${formatted.length}-${i}`} value={Number(ch)} />
            ) : (
              <span key={`${formatted.length}-${i}`} className="odo__sep" aria-hidden="true">
                {ch}
              </span>
            ),
          )}
        </p>
        <div className="note__row">
          {available.length > 1 && (
            <div className="note__switch" role="group" aria-label="Show the balance in">
              {available.map((c, i) => (
                <button key={c.code} type="button" aria-pressed={c.code === current.code} onClick={() => setIndex(i)}>
                  {c.code}
                </button>
              ))}
            </div>
          )}
          {figure.note && <p className="note__foot">{figure.note}</p>}
        </div>
      </div>
      <div className="note__seal" style={{transform: `rotate(${index * 30}deg)`}}>
        {seal}
      </div>
      <Lattice className="note__lattice note__lattice--bottom" />
    </figure>
  )
}
