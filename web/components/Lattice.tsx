import {latticePaths} from '@/lib/guilloche'

export function Lattice({width = 1200, height = 14, className}: {width?: number; height?: number; className?: string}) {
  return (
    <svg className={className} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true">
      {latticePaths(width, height).map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  )
}
