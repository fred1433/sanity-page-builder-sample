// Generates public/rosette.svg, the engraved rosette used by the statement note, the plain hero and the wordmark.
// Concentric rings, each modulated by a sine wave and turned a little against the previous one.
// Run: node scripts/rosette-svg.mjs
import {writeFileSync} from 'node:fs'

const size = 390
const c = size / 2
const scale = size / 380
const r1 = (n) => Math.round(n * 10) / 10

function ring(radius, amp, lobes, phase, steps = 400) {
  let d = ''
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2
    const r = (radius + amp * Math.sin(lobes * t + phase)) * scale
    d += `${i ? 'L' : 'M'}${r1(c + r * Math.cos(t))} ${r1(c + r * Math.sin(t))}`
  }
  return d + 'Z'
}

const layers = [
  {stroke: '#3d7a68', opacity: 1, d: Array.from({length: 22}, (_, j) => ring(52 + j * 4.6, 7, 18, j * 0.42)).join('')},
  {stroke: '#6b5ca5', opacity: 0.8, d: Array.from({length: 9}, (_, j) => ring(156 + j * 2.2, 9, 36, j * 0.7 + Math.PI / 36)).join('')},
  {stroke: '#0e2b2a', opacity: 0.6, d: Array.from({length: 12}, (_, j) => ring(14 + j * 3, 5, 9, j * 0.9)).join('')},
]

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">${layers
  .map((l) => `<path d="${l.d}" fill="none" stroke="${l.stroke}" stroke-opacity="${l.opacity}" stroke-width="0.5"/>`)
  .join('')}</svg>`
writeFileSync(new URL('../public/rosette.svg', import.meta.url), svg)
console.log('public/rosette.svg', svg.length, 'bytes')
