import {rosettePaths} from '@/lib/guilloche'

export function Rosette({size = 360, className}: {size?: number; className?: string}) {
  const c = size / 2
  const paths = rosettePaths(c, c, size / 380)
  return (
    <svg className={className} viewBox={`0 0 ${size} ${size}`} width={size} height={size} aria-hidden="true">
      {paths.map((d, i) => (
        <path key={i} d={d} fill="none" className={`rosette__line rosette__line--${i}`} />
      ))}
    </svg>
  )
}
