import { Frame } from './Frame'
import { C } from './theme'
import { useCoverTimeline, LEN } from './useCoverTimeline'

// Une identité part vers 4 familles de sources, les résultats convergent vers un score de risque.
const SOURCES = ['Sanctions', 'PEP', 'Presse', 'Réseaux']
const SY = [62, 142, 222, 302]
const GX = 530
const GY = 214
const R = 66
const SCORE = 0.62

export default function ReputationCover({ active }: { active: boolean }) {
  const ref = useCoverTimeline((tl, q) => {
    const num = q('.rc-num')[0]
    const n = { v: 0 }
    tl.call(() => void (num && (num.textContent = '0')), [], 0)
      .fromTo(q('.rc-scene'), { opacity: 0 }, { opacity: 1, duration: 0.4 })
      .fromTo(q('.rc-card'), { x: -20, opacity: 0 }, { x: 0, opacity: 1, duration: 0.7 }, 0.1)
      .fromTo(q('.rc-out'), { strokeDashoffset: LEN }, { strokeDashoffset: 0, duration: 0.7, stagger: 0.12, ease: 'power2.inOut' }, 0.6)
      .fromTo(q('.rc-pill'), { opacity: 0.35 }, { opacity: 1, duration: 0.3, stagger: 0.12 }, 1.1)
      .fromTo(q('.rc-pill-box'), { stroke: C.line }, { stroke: C.cyan, duration: 0.3, stagger: 0.12 }, 1.1)
      .fromTo(
        q('.rc-check'),
        { scale: 0, transformOrigin: '50% 50%' },
        { scale: 1, duration: 0.5, stagger: 0.12, ease: 'back.out(3)' },
        1.3,
      )
      .fromTo(q('.rc-in'), { strokeDashoffset: LEN }, { strokeDashoffset: 0, duration: 0.7, stagger: 0.1, ease: 'power2.inOut' }, 1.9)
      .fromTo(
        q('.rc-arc'),
        { strokeDashoffset: LEN },
        { strokeDashoffset: (i: number, el: Element) => LEN(i, el) * (1 - SCORE), duration: 1.4, ease: 'power3.inOut' },
        2.6,
      )
      .fromTo(q('.rc-arc'), { stroke: C.cyan }, { stroke: C.amber, duration: 0.5 }, 3.4)
      .fromTo(
        q('.rc-needle'),
        { rotation: -90, svgOrigin: `${GX} ${GY}` },
        { rotation: -90 + SCORE * 180, duration: 1.4, ease: 'power3.inOut' },
        2.6,
      )
      .fromTo(
        n,
        { v: 0 },
        {
          v: Math.round(SCORE * 100),
          duration: 1.4,
          ease: 'power3.inOut',
          onUpdate: () => num && (num.textContent = String(Math.round(n.v))),
        },
        2.6,
      )
      .fromTo(q('.rc-verdict'), { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.5 }, 3.6)
      .fromTo(q('.rc-bar'), { scaleX: 0, transformOrigin: '0 50%' }, { scaleX: 1, duration: 0.6, stagger: 0.1 }, 3.8)
      .to(q('.rc-scene'), { opacity: 0, duration: 0.5 }, 6.4)
  }, active)

  return (
    <Frame ref={ref} active={active} label="Animation : une identité interroge quatre sources puis reçoit un score de risque">
      <g className="rc-scene">
        {/* liaisons */}
        {SY.map((y, i) => (
          <path
            key={`o${i}`}
            className="rc-out"
            d={`M178 200 C 230 200, 230 ${y + 20}, 282 ${y + 20}`}
            pathLength={1}
            strokeDasharray="1 1"
            fill="none"
            stroke={C.cyan}
            strokeWidth="1.5"
            opacity="0.7"
          />
        ))}
        {SY.map((y, i) => (
          <path
            key={`i${i}`}
            className="rc-in"
            d={`M410 ${y + 20} C 450 ${y + 20}, 440 ${GY}, ${GX - R - 8} ${GY}`}
            pathLength={1}
            strokeDasharray="1 1"
            fill="none"
            stroke={C.cyan}
            strokeWidth="1.5"
            opacity="0.5"
          />
        ))}

        {/* identité */}
        <g className="rc-card">
          <rect x="34" y="146" width="144" height="108" rx="14" fill={C.panel} stroke={C.line} />
          <circle cx="70" cy="186" r="18" fill="none" stroke={C.cyan} strokeWidth="1.5" />
          <circle cx="70" cy="181" r="6" fill={C.cyan} />
          <path d="M58 197 q12 -9 24 0" stroke={C.cyan} strokeWidth="1.5" fill="none" />
          <rect x="98" y="176" width="62" height="7" rx="3.5" fill={C.ink} opacity="0.9" />
          <rect x="98" y="190" width="42" height="6" rx="3" fill={C.mute} />
          <rect x="50" y="222" width="110" height="6" rx="3" fill={C.mute} opacity="0.7" />
          <rect x="50" y="234" width="80" height="6" rx="3" fill={C.mute} opacity="0.5" />
        </g>

        {/* sources */}
        {SOURCES.map((s, i) => (
          <g key={s} className="rc-pill">
            <rect
              className="rc-pill-box"
              x="282"
              y={SY[i]}
              width="128"
              height="40"
              rx="20"
              fill={C.panel}
              stroke={C.line}
              strokeWidth="1.5"
            />
            <text x="302" y={SY[i] + 25} fill={C.ink} fontSize="14" fontFamily="var(--font-sans)" fontWeight="500">
              {s}
            </text>
            <g className="rc-check">
              <circle cx="390" cy={SY[i] + 20} r="9" fill={C.cyan} />
              <path d={`M385.5 ${SY[i] + 20} l3 3 l5 -6`} stroke="#081426" strokeWidth="2" fill="none" strokeLinecap="round" />
            </g>
          </g>
        ))}

        {/* jauge */}
        <path d={`M${GX - R} ${GY} A ${R} ${R} 0 0 1 ${GX + R} ${GY}`} stroke={C.line} strokeWidth="10" fill="none" strokeLinecap="round" />
        <path
          className="rc-arc"
          d={`M${GX - R} ${GY} A ${R} ${R} 0 0 1 ${GX + R} ${GY}`}
          pathLength={1}
          strokeDasharray="1 1"
          stroke={C.cyan}
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
        />
        <line className="rc-needle" x1={GX} y1={GY} x2={GX} y2={GY - R + 18} stroke={C.ink} strokeWidth="2.5" strokeLinecap="round" />
        <circle cx={GX} cy={GY} r="6" fill={C.ink} />
        <text
          className="rc-num"
          x={GX}
          y={GY + 40}
          textAnchor="middle"
          fill={C.ink}
          fontSize="30"
          fontWeight="700"
          fontFamily="var(--font-sans)"
        >
          0
        </text>
        <text className="rc-verdict" x={GX} y={GY + 62} textAnchor="middle" fill={C.amber} fontSize="13" fontFamily="var(--font-sans)">
          Risque modéré
        </text>
        <rect className="rc-bar" x="470" y="302" width="120" height="6" rx="3" fill={C.mute} />
        <rect className="rc-bar" x="470" y="316" width="96" height="6" rx="3" fill={C.mute} />
        <rect className="rc-bar" x="470" y="330" width="108" height="6" rx="3" fill={C.mute} />
      </g>
    </Frame>
  )
}
