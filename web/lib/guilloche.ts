// Guilloché line work, the engraved pattern printed on banknotes and cheques.
// Pure functions: the same parameters always give the same path, so server and client agree.

const r1 = (n: number) => Math.round(n * 10) / 10

/**
 * A rosette in the engraved style: concentric rings, each modulated by a sine wave
 * and turned a little against the previous one, so the rings weave into a net.
 * Returns one path per layer (ring net, petal crown, inner knot).
 */
export function rosettePaths(cx: number, cy: number, scale = 1): string[] {
  const ring = (radius: number, amp: number, lobes: number, phase: number, steps = 720) => {
    let d = ''
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * Math.PI * 2
      const r = (radius + amp * Math.sin(lobes * t + phase)) * scale
      d += `${i ? 'L' : 'M'}${r1(cx + r * Math.cos(t))} ${r1(cy + r * Math.sin(t))}`
    }
    return d + 'Z'
  }
  let net = ''
  for (let j = 0; j < 22; j++) net += ring(52 + j * 4.6, 7, 18, j * 0.42)
  let crown = ''
  for (let j = 0; j < 9; j++) crown += ring(156 + j * 2.2, 9, 36, j * 0.7 + Math.PI / 36)
  let knot = ''
  for (let j = 0; j < 12; j++) knot += ring(14 + j * 3, 5, 9, j * 0.9)
  return [net, crown, knot]
}

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
