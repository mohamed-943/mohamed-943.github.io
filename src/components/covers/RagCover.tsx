import { Frame } from './Frame'
import { C } from './theme'
import { useCoverTimeline, LEN } from './useCoverTimeline'

// Le document est découpé en passages, projetés dans un espace vectoriel ;
// la question attire ses 5 voisins les plus proches, qui nourrissent la réponse.
const DOTS = Array.from({ length: 30 }, (_, i) => {
  const a = i * 2.399963
  const r = 22 + Math.sqrt(i) * 22
  return { x: 450 + Math.cos(a) * r * 1.35, y: 186 + Math.sin(a) * r * 0.72 }
})
const Q = { x: 462, y: 176 }
const TOP = [...DOTS.keys()]
  .sort((a, b) => Math.hypot(DOTS[a].x - Q.x, DOTS[a].y - Q.y) - Math.hypot(DOTS[b].x - Q.x, DOTS[b].y - Q.y))
  .slice(0, 5)
const CHUNK_Y = [92, 152, 212, 272]
const CHUNK_TO = [DOTS[TOP[0]], DOTS[TOP[2]], DOTS[17], DOTS[24]]

export default function RagCover({ active }: { active: boolean }) {
  const ref = useCoverTimeline(
    (tl, q) => {
      tl.fromTo(q('.rg-scene'), { opacity: 0 }, { opacity: 1, duration: 0.4 })
        .fromTo(q('.rg-line'), { scaleX: 0, transformOrigin: '0 50%' }, { scaleX: 1, duration: 0.4, stagger: 0.03 }, 0.1)
        .fromTo(q('.rg-chunk'), { opacity: 0 }, { opacity: 1, duration: 0.3, stagger: 0.18 }, 0.8)
        .fromTo(q('.rg-fly'), { x: 0, y: 0, opacity: 0 }, { opacity: 1, duration: 0.01, stagger: 0.18 }, 1)
        .to(
          q('.rg-fly'),
          { x: (i) => CHUNK_TO[i].x - 160, y: (i) => CHUNK_TO[i].y - (CHUNK_Y[i] + 20), duration: 1, stagger: 0.18, ease: 'power3.inOut' },
          1,
        )
        .fromTo(
          q('.rg-dot'),
          { scale: 0, transformOrigin: '50% 50%' },
          { scale: 1, duration: 0.5, stagger: { each: 0.02, from: 'random' } },
          1.4,
        )
        .to(q('.rg-fly'), { opacity: 0, duration: 0.3 }, 2.5)
        .fromTo(q('.rg-qbar'), { scaleX: 0, transformOrigin: '0 50%' }, { scaleX: 1, duration: 0.8, ease: 'power2.inOut' }, 2.6)
        .fromTo(q('.rg-q'), { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.6, ease: 'back.out(3)' }, 3.3)
        .fromTo(q('.rg-link'), { strokeDashoffset: LEN }, { strokeDashoffset: 0, duration: 0.5, stagger: 0.1 }, 3.7)
        .fromTo(q('.rg-top'), { scale: 1, transformOrigin: '50% 50%' }, { scale: 1.9, fill: C.ice, duration: 0.4, stagger: 0.1 }, 3.8)
        .fromTo(q('.rg-badge'), { opacity: 0 }, { opacity: 1, duration: 0.4 }, 4.3)
        .fromTo(q('.rg-ans'), { scaleX: 0, transformOrigin: '0 50%' }, { scaleX: 1, duration: 0.5, stagger: 0.12 }, 4.6)
        .to(q('.rg-scene'), { opacity: 0, duration: 0.5 }, 7)
    },
    active,
    0.7,
  )

  return (
    <Frame
      ref={ref}
      active={active}
      label="Animation : un PDF découpé en passages, la question retrouve les cinq passages les plus proches"
    >
      <g className="rg-scene">
        {/* document */}
        <rect x="40" y="56" width="150" height="288" rx="10" fill={C.panel} stroke={C.line} />
        <path d="M160 56 v22 h30" fill="none" stroke={C.line} />
        {Array.from({ length: 16 }, (_, i) => (
          <rect
            key={i}
            className="rg-line"
            x="56"
            y={76 + i * 16}
            width={i % 4 === 3 ? 70 : 112 - (i % 3) * 10}
            height="5"
            rx="2.5"
            fill={C.mute}
          />
        ))}
        {CHUNK_Y.map((y, i) => (
          <rect
            key={i}
            className="rg-chunk"
            x="50"
            y={y - 6}
            width="130"
            height="44"
            rx="6"
            fill="rgba(56,189,248,0.10)"
            stroke={C.cyan}
            strokeDasharray="3 3"
          />
        ))}
        {CHUNK_Y.map((y, i) => (
          <circle key={i} className="rg-fly" cx="160" cy={y + 20} r="5" fill={C.cyan} />
        ))}

        {/* espace vectoriel */}
        {TOP.map((t, i) => (
          <line
            key={i}
            className="rg-link"
            x1={Q.x}
            y1={Q.y}
            x2={DOTS[t].x}
            y2={DOTS[t].y}
            pathLength={1}
            strokeDasharray="1 1"
            stroke={C.cyan}
            strokeWidth="1.4"
          />
        ))}
        {DOTS.map((d, i) => (
          <circle
            key={i}
            className={`rg-dot${TOP.includes(i) ? ' rg-top' : ''}`}
            cx={d.x}
            cy={d.y}
            r="3.2"
            fill={TOP.includes(i) ? C.cyan : C.mute}
          />
        ))}
        <rect className="rg-q" x={Q.x - 7} y={Q.y - 7} width="14" height="14" fill={C.ice} transform={`rotate(45 ${Q.x} ${Q.y})`} />
        <g className="rg-badge">
          <rect x={Q.x + 54} y={Q.y - 62} width="58" height="24" rx="12" fill={C.panel} stroke={C.cyan} />
          <text x={Q.x + 83} y={Q.y - 46} textAnchor="middle" fill={C.ink} fontSize="12" fontFamily="var(--font-sans)">
            top-5
          </text>
        </g>

        {/* question */}
        <rect x="262" y="30" width="340" height="34" rx="17" fill={C.panel} stroke={C.line} />
        <rect className="rg-qbar" x="282" y="44" width="200" height="6" rx="3" fill={C.ink} opacity="0.85" />

        {/* réponse */}
        <rect x="262" y="300" width="340" height="68" rx="12" fill={C.panel} stroke={C.line} />
        <rect className="rg-ans" x="280" y="318" width="290" height="6" rx="3" fill={C.cyan} opacity="0.85" />
        <rect className="rg-ans" x="280" y="332" width="240" height="6" rx="3" fill={C.cyan} opacity="0.65" />
        <rect className="rg-ans" x="280" y="346" width="160" height="6" rx="3" fill={C.cyan} opacity="0.45" />
      </g>
    </Frame>
  )
}
