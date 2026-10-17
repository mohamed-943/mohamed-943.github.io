import { useId, type ReactNode, type Ref } from 'react'
import { W, H } from './theme'

/** Cadre commun des couvertures : fond nuit, trame de points, dégradé lumineux. */
export function Frame({ ref, active, label, children }: { ref: Ref<SVGSVGElement>; active: boolean; label: string; children: ReactNode }) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  return (
    <svg
      ref={ref}
      data-active={active}
      viewBox={`0 0 ${W} ${H}`}
      className="cover-svg"
      role="img"
      aria-label={label}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <radialGradient id={`g${id}`} cx="50%" cy="45%" r="70%">
          <stop offset="0" stopColor="#14305a" />
          <stop offset="1" stopColor="#081426" />
        </radialGradient>
        <pattern id={`d${id}`} width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="rgba(148,197,255,0.10)" />
        </pattern>
      </defs>
      <rect width={W} height={H} fill={`url(#g${id})`} />
      <rect width={W} height={H} fill={`url(#d${id})`} />
      {children}
    </svg>
  )
}
