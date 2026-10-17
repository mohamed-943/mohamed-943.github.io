import { Frame } from './Frame'
import { C } from './theme'
import { useCoverTimeline, LEN } from './useCoverTimeline'

// Le marché se construit bougie après bougie ; l'agent prend deux décisions, le portefeuille évolue.
const N = 24
const X0 = 54
const STEP = 22.5
const candles = (() => {
  let p = 250
  return Array.from({ length: N }, (_, i) => {
    const o = p
    const drift = Math.sin(i * 0.55) * 14 + Math.cos(i * 1.7) * 9 + (i > 12 ? -3 : 3)
    const c = o - drift * 2.2
    p = c
    const hi = Math.min(o, c) - 6 - (i % 3) * 4
    const lo = Math.max(o, c) + 6 + ((i + 1) % 3) * 4
    return { x: X0 + i * STEP, o, c, hi, lo, up: c < o }
  })
})()
const DECISIONS = [
  { i: 5, label: 'achat' },
  { i: 15, label: 'vente' },
]
const PF = Array.from({ length: N }, (_, i) => {
  const v = 352 - (i < 5 ? 0 : i < 15 ? (i - 5) * 3.2 : 32 - (i - 15) * 0.6) + Math.sin(i * 1.3) * 2
  return `${i ? 'L' : 'M'}${X0 + i * STEP} ${v.toFixed(1)}`
}).join(' ')

export default function TradingCover({ active }: { active: boolean }) {
  const ref = useCoverTimeline(
    (tl, q) => {
      const per = 0.12
      tl.fromTo(q('.tr-scene'), { opacity: 0 }, { opacity: 1, duration: 0.4 })
        .fromTo(
          q('.tr-candle'),
          { scaleY: 0, opacity: 0, transformOrigin: '50% 50%' },
          { scaleY: 1, opacity: 1, duration: 0.4, stagger: per },
          0.2,
        )
        .fromTo(q('.tr-pf'), { strokeDashoffset: LEN }, { strokeDashoffset: 0, duration: N * per, ease: 'none' }, 0.2)
      DECISIONS.forEach((d, k) => {
        const t = 0.2 + d.i * per + 0.2
        tl.fromTo(q(`.tr-dec-${k}`), { opacity: 0, y: k ? -8 : 8 }, { opacity: 1, y: 0, duration: 0.5, ease: 'back.out(2)' }, t)
      })
      tl.fromTo(q('.tr-tag'), { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0.2 + N * per).to(
        q('.tr-scene'),
        { opacity: 0, duration: 0.5 },
        N * per + 2.4,
      )
    },
    active,
    0.8,
  )

  return (
    <Frame
      ref={ref}
      active={active}
      label="Animation : un graphique en chandeliers se construit, l'agent prend une position d'achat puis de vente"
    >
      <g className="tr-scene">
        {[80, 140, 200, 260].map((y) => (
          <line key={y} x1={X0 - 14} x2="600" y1={y} y2={y} stroke={C.line} strokeDasharray="2 6" />
        ))}
        {candles.map((k, i) => (
          <g key={i} className="tr-candle">
            <line x1={k.x} x2={k.x} y1={k.hi} y2={k.lo} stroke={k.up ? C.cyan : C.mute} strokeWidth="1.4" />
            <rect
              x={k.x - 6}
              y={Math.min(k.o, k.c)}
              width="12"
              height={Math.max(3, Math.abs(k.c - k.o))}
              rx="2"
              fill={k.up ? C.cyan : 'none'}
              stroke={k.up ? 'none' : C.mute}
              strokeWidth="1.4"
            />
          </g>
        ))}
        {DECISIONS.map((d, k) => {
          const c = candles[d.i]
          const y = k ? c.hi - 22 : c.lo + 22
          return (
            <g key={k} className={`tr-dec-${k}`}>
              <line x1={c.x} x2={c.x} y1="56" y2="296" stroke={C.amber} strokeDasharray="3 4" opacity="0.6" />
              <path d={k ? `M${c.x - 8} ${y - 6} h16 l-8 12 z` : `M${c.x - 8} ${y + 6} h16 l-8 -12 z`} fill={C.amber} />
              <text x={c.x + 12} y={y + 5} fill={C.amber} fontSize="12" fontFamily="var(--font-sans)" fontWeight="500">
                {d.label}
              </text>
            </g>
          )
        })}
        <text x={X0 - 14} y="318" fill={C.mute} fontSize="11" fontFamily="var(--font-sans)">
          portefeuille
        </text>
        <path className="tr-pf" d={PF} pathLength={1} strokeDasharray="1 1" fill="none" stroke={C.ice} strokeWidth="2" />
        <g className="tr-tag">
          <rect x="452" y="20" width="150" height="28" rx="14" fill={C.panel} stroke={C.line} />
          <text x="527" y="38" textAnchor="middle" fill={C.ink} fontSize="12" fontFamily="var(--font-sans)">
            paper trading
          </text>
        </g>
      </g>
    </Frame>
  )
}
