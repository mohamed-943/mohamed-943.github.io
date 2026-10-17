import { Frame } from './Frame'
import { C } from './theme'
import { useCoverTimeline, LEN } from './useCoverTimeline'

// Carte de chaleur heures × jours : une coupure de mesures apparaît, puis est comblée par interpolation.
const COLS = 24
const ROWS = 9
const S = 19
const G = 3.6
const X0 = 54
const Y0 = 166
const GAP_ROW = 5
const GAP_FROM = 7
const GAP_TO = 13

const level = (c: number, r: number) => {
  const evening = Math.exp(-((c - 20) ** 2) / 8) * 0.75
  const morning = Math.exp(-((c - 8) ** 2) / 4) * 0.45
  const weekend = r >= 7 ? 0.15 : 0
  return Math.min(1, 0.08 + evening + morning + weekend + ((Math.sin(c * 3.1 + r * 1.7) + 1) / 2) * 0.14)
}
const isGap = (c: number, r: number) => r === GAP_ROW && c >= GAP_FROM && c <= GAP_TO

const LINE = Array.from({ length: COLS * 2 + 1 }, (_, i) => {
  const c = i / 2
  const v = level(c, 2)
  return `${i ? 'L' : 'M'}${(X0 + c * (S + G)).toFixed(1)} ${(128 - v * 80).toFixed(1)}`
}).join(' ')

export default function EnergyCover({ active }: { active: boolean }) {
  const ref = useCoverTimeline(
    (tl, q) => {
      tl.fromTo(q('.en-scene'), { opacity: 0 }, { opacity: 1, duration: 0.4 })
        .fromTo(
          q('.en-cell'),
          { opacity: 0, scale: 0.4, transformOrigin: '50% 50%' },
          { opacity: 1, scale: 1, duration: 0.5, stagger: { each: 0.004, grid: [ROWS, COLS], from: 'start', axis: 'x' } },
          0.1,
        )
        .fromTo(q('.en-hole'), { opacity: 0 }, { opacity: 1, duration: 0.4 }, 1.4)
        .fromTo(q('.en-curve'), { strokeDashoffset: LEN }, { strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut' }, 0.4)
        .fromTo(q('.en-label'), { opacity: 0 }, { opacity: 1, duration: 0.4 }, 1.9)
        .fromTo(q('.en-fill'), { opacity: 0, fill: C.amber }, { opacity: 1, duration: 0.3, stagger: 0.12 }, 2.7)
        .to(q('.en-fill'), { fill: C.cyan, duration: 0.6, stagger: 0.12 }, 3.3)
        .to(q('.en-hole'), { opacity: 0, duration: 0.4 }, 4.3)
        .to(q('.en-label'), { opacity: 0, duration: 0.3 }, 4.3)
        .fromTo(q('.en-done'), { opacity: 0 }, { opacity: 1, duration: 0.4 }, 4.5)
        .to(q('.en-scene'), { opacity: 0, duration: 0.5 }, 6.6)
    },
    active,
    0.5,
  )

  const cells = []
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++) {
      const x = X0 + c * (S + G)
      const y = Y0 + r * (S + G)
      if (isGap(c, r)) {
        cells.push(
          <rect
            key={`${r}-${c}`}
            className="en-cell"
            x={x}
            y={y}
            width={S}
            height={S}
            rx="3"
            fill="none"
            stroke={C.mute}
            strokeDasharray="2 3"
          />,
        )
        cells.push(
          <rect
            key={`f${r}-${c}`}
            className="en-fill"
            x={x}
            y={y}
            width={S}
            height={S}
            rx="3"
            fill={C.cyan}
            fillOpacity={level(c, r) * 0.85 + 0.1}
          />,
        )
      } else
        cells.push(
          <rect
            key={`${r}-${c}`}
            className="en-cell"
            x={x}
            y={y}
            width={S}
            height={S}
            rx="3"
            fill={C.cyan}
            fillOpacity={level(c, r) * 0.85 + 0.08}
          />,
        )
    }

  const hx = X0 + GAP_FROM * (S + G) - 4
  const hy = Y0 + GAP_ROW * (S + G) - 4
  const hw = (GAP_TO - GAP_FROM + 1) * (S + G) + 4

  return (
    <Frame
      ref={ref}
      active={active}
      label="Animation : carte de chaleur de consommation électrique, une coupure de mesures est comblée par interpolation"
    >
      <g className="en-scene">
        <path className="en-curve" d={LINE} pathLength={1} strokeDasharray="1 1" fill="none" stroke={C.cyan} strokeWidth="2" />
        <text x={X0} y="40" fill={C.mute} fontSize="12" fontFamily="var(--font-sans)">
          puissance moyenne par heure
        </text>
        {cells}
        <rect className="en-hole" x={hx} y={hy} width={hw} height={S + 8} rx="6" fill="none" stroke={C.amber} strokeWidth="1.6" />
        <text
          className="en-label"
          x={hx + hw / 2}
          y={hy - 10}
          textAnchor="middle"
          fill={C.amber}
          fontSize="12"
          fontFamily="var(--font-sans)"
        >
          coupure de mesures
        </text>
        <text className="en-done" x={hx + hw / 2} y={hy - 10} textAnchor="middle" fill={C.ink} fontSize="12" fontFamily="var(--font-sans)">
          interpolée
        </text>
        {[0, 6, 12, 18, 23].map((h) => (
          <text
            key={h}
            x={X0 + h * (S + G) + S / 2}
            y={Y0 + ROWS * (S + G) + 14}
            textAnchor="middle"
            fill={C.mute}
            fontSize="11"
            fontFamily="var(--font-sans)"
          >
            {h}h
          </text>
        ))}
      </g>
    </Frame>
  )
}
