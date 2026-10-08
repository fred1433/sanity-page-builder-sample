// Guilloché line work, the engraved pattern printed on banknotes and cheques.
// Pure functions: the same parameters always give the same path, so server and client agree.

const r1 = (n: number) => Math.round(n * 10) / 10

/** An interlaced band of phase-shifted sine waves, width w and height h. */
export function latticePaths(w: number, h: number, waves = 6, wavelength = 28): string[] {
  const out: string[] = []
  for (let i = 0; i < waves; i++) {
    const phase = (i / waves) * Math.PI * 2
    let path = ''
    for (let x = 0; x <= w; x += 2) {
      const y = h / 2 + (h / 2 - 1) * Math.sin((x / wavelength) * Math.PI * 2 + phase)
      path += `${x ? 'L' : 'M'}${x} ${r1(y)}`
    }
    out.push(path)
  }
  return out
}

/** A small rosette for the wordmark: fewer, heavier rings that stay legible at 28 px. */
export function sealPaths(size: number): string {
  const c = size / 2
  let d = ''
  for (let j = 0; j < 6; j++) {
    const radius = size * (0.18 + j * 0.055)
    const amp = size * 0.035
    for (let i = 0; i <= 120; i++) {
      const t = (i / 120) * Math.PI * 2
      const r = radius + amp * Math.sin(12 * t + j * 0.6)
      d += `${i ? 'L' : 'M'}${r1(c + r * Math.cos(t))} ${r1(c + r * Math.sin(t))}`
    }
    d += 'Z'
  }
  return d
}
