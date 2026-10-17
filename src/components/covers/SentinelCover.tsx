import { useId } from 'react'
import { Frame } from './Frame'
import { C, H } from './theme'
import { useCoverTimeline } from './useCoverTimeline'

// Trois flux de capteurs défilent ; le balayage du modèle repère un pic sur le capteur de gaz.
const X0 = 92
const X1 = 600
const SPIKE = 430
const ROWS = [
  { y: 118, label: 'Gaz', seed: 1.3, spike: true },
  { y: 208, label: 'Temp.', seed: 2.7, spike: false },
  { y: 298, label: 'Fumée', seed: 4.1, spike: false },
]

function wave(y: number, seed: number, spike: boolean) {
  let d = ''
  for (let x = X0; x <= X1; x += 4) {
    const n = Math.sin(x * 0.045 + seed) * 7 + Math.sin(x * 0.13 + seed * 2) * 4 + Math.sin(x * 0.31 + seed * 5) * 2
    const s = spike ? Math.exp(-((x - SPIKE) ** 2) / 120) * -52 : 0
    d += `${x === X0 ? 'M' : 'L'}${x} ${(y + n + s).toFixed(1)} `
  }
  return d
}

function spikeSeg(y: number, seed: number) {
  let d = ''
  for (let x = SPIKE - 28; x <= SPIKE + 28; x += 4) {
    const n = Math.sin(x * 0.045 + seed) * 7 + Math.sin(x * 0.13 + seed * 2) * 4 + Math.sin(x * 0.31 + seed * 5) * 2
    const s = Math.exp(-((x - SPIKE) ** 2) / 120) * -52
    d += `${x === SPIKE - 28 ? 'M' : 'L'}${x} ${(y + n + s).toFixed(1)} `
  }
  return d
}

export default function SentinelCover({ active }: { active: boolean }) {
  const clip = `se${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  const ref = useCoverTimeline(
    (tl, q) => {
      const sweep = 4
      const hit = (sweep * (SPIKE - X0)) / (X1 - X0)
      tl.fromTo(q('.se-scene'), { opacity: 0 }, { opacity: 1, duration: 0.4 })
        .fromTo(q('.se-clip'), { attr: { width: 0 } }, { attr: { width: X1 - X0 + 8 }, duration: sweep, ease: 'none' }, 0.3)
        .fromTo(q('.se-scan'), { x: 0 }, { x: X1 - X0, duration: sweep, ease: 'none' }, 0.3)
        .fromTo(q('.se-spike'), { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0.3 + hit)
        .fromTo(
          q('.se-ring'),
          { scale: 0.4, opacity: 1, transformOrigin: '50% 50%' },
          { scale: 2.4, opacity: 0, duration: 1.2, ease: 'power2.out', immediateRender: false },
          0.3 + hit,
        )
        .fromTo(
          q('.se-ring2'),
          { scale: 0.4, opacity: 1, transformOrigin: '50% 50%' },
          { scale: 2.4, opacity: 0, duration: 1.2, ease: 'power2.out', immediateRender: false },
          0.7 + hit,
        )
        .fromTo(q('.se-badge'), { y: -10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, 0.4 + hit)
        .to(q('.se-scan'), { opacity: 0, duration: 0.3 }, 0.3 + sweep)
        .to(q('.se-scene'), { opacity: 0, duration: 0.5 }, sweep + 1.8)
        .set(q('.se-scan'), { opacity: 1 })
    },
    active,
    0.55,
  )

  return (
    <Frame ref={ref} active={active} label="Animation : trois flux de capteurs, un pic sur le capteur de gaz est signalé comme anomalie">
      <g className="se-scene">
        <clipPath id={clip}>
          <rect className="se-clip" x={X0 - 4} y="0" width="0" height={H} />
        </clipPath>
        {ROWS.map((r) => (
          <g key={r.label}>
            <text x="30" y={r.y + 5} fill={C.mute} fontSize="13" fontFamily="var(--font-sans)">
              {r.label}
            </text>
            <line x1={X0} x2={X1} y1={r.y} y2={r.y} stroke={C.line} strokeDasharray="2 6" />
            <path
              className="se-wave"
              d={wave(r.y, r.seed, r.spike)}
              clipPath={`url(#${clip})`}
              fill="none"
              stroke={C.cyan}
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
          </g>
        ))}
        <path
          className="se-spike"
          d={spikeSeg(ROWS[0].y, ROWS[0].seed)}
          fill="none"
          stroke={C.amber}
          strokeWidth="2.6"
          strokeLinejoin="round"
        />
        <circle className="se-ring" opacity="0" cx={SPIKE} cy={ROWS[0].y - 50} r="14" fill="none" stroke={C.amber} strokeWidth="2" />
        <circle className="se-ring2" opacity="0" cx={SPIKE} cy={ROWS[0].y - 50} r="14" fill="none" stroke={C.amber} strokeWidth="1.5" />
        <g className="se-scan">
          <rect x={X0 - 1} y="44" width="2" height="300" fill={C.cyan} opacity="0.9" />
          <rect x={X0 - 40} y="44" width="40" height="300" fill={C.cyan} opacity="0.06" />
        </g>
        <g className="se-badge">
          <rect x="440" y="340" width="168" height="36" rx="18" fill="rgba(245,165,36,0.14)" stroke={C.amber} />
          <circle cx="462" cy="358" r="5" fill={C.amber} />
          <text x="476" y="363" fill={C.ink} fontSize="13" fontFamily="var(--font-sans)" fontWeight="500">
            Anomalie : gaz
          </text>
        </g>
      </g>
    </Frame>
  )
}
