import { Frame } from './Frame'
import { C } from './theme'
import { useCoverTimeline, LEN } from './useCoverTimeline'

// Le signal circule de l'agent superviseur au diagnostic, interroge les outils MCP,
// puis s'arrête : rien ne part tant que le médecin n'a pas validé.
const N = {
  sup: { x: 96, y: 200, l: 'Superviseur' },
  diag: { x: 250, y: 118, l: 'Diagnostic' },
  mcp: { x: 250, y: 296, l: 'Outils MCP' },
  doc: { x: 410, y: 200, l: 'Médecin' },
  rep: { x: 560, y: 200, l: 'Rapport' },
}
const P = {
  a: `M${N.sup.x} ${N.sup.y} C 150 200, 180 118, ${N.diag.x} ${N.diag.y}`,
  b: `M${N.diag.x} ${N.diag.y} L ${N.mcp.x} ${N.mcp.y}`,
  c: `M${N.mcp.x} ${N.mcp.y} L ${N.diag.x} ${N.diag.y}`,
  d: `M${N.diag.x} ${N.diag.y} C 320 118, 350 200, ${N.doc.x} ${N.doc.y}`,
  e: `M${N.doc.x} ${N.doc.y} L ${N.rep.x} ${N.rep.y}`,
}

export default function ClinicalCover({ active }: { active: boolean }) {
  const ref = useCoverTimeline((tl, q) => {
    const pk = q('.cl-packet')
    const move = (path: string, d = 0.9) => ({ motionPath: { path }, duration: d, ease: 'power2.inOut' })
    tl.fromTo(q('.cl-scene'), { opacity: 0 }, { opacity: 1, duration: 0.4 })
      .fromTo(
        q('.cl-node'),
        { scale: 0.6, opacity: 0, transformOrigin: '50% 50%' },
        { scale: 1, opacity: 1, duration: 0.6, stagger: 0.08, ease: 'back.out(2)' },
        0.1,
      )
      .fromTo(q('.cl-edge'), { strokeDashoffset: LEN }, { strokeDashoffset: 0, duration: 0.6, stagger: 0.08 }, 0.3)
      .set(pk, { opacity: 1 }, 1)
      .fromTo(pk, { x: 0, y: 0 }, move(P.a), 1)
      .to(q('.cl-diag-ring'), { scale: 1.5, opacity: 0, duration: 0.7, transformOrigin: '50% 50%', startAt: { scale: 1, opacity: 1 } }, 1.9)
      .to(pk, move(P.b, 0.6), 2)
      .to(pk, move(P.c, 0.6), 2.6)
      .to(pk, move(P.d), 3.2)
      .set(pk, { opacity: 0 }, 4.1)
      .fromTo(q('.cl-pause'), { opacity: 0 }, { opacity: 1, duration: 0.3 }, 4.1)
      .fromTo(q('.cl-wait'), { strokeDashoffset: LEN }, { strokeDashoffset: 0, duration: 1.6, ease: 'none' }, 4.2)
      .to(q('.cl-pause'), { opacity: 0, duration: 0.2 }, 5.8)
      .fromTo(q('.cl-ok'), { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.5, ease: 'back.out(3)' }, 5.85)
      .fromTo(q('.cl-caption'), { opacity: 0 }, { opacity: 1, duration: 0.4 }, 5.9)
      .set(pk, { opacity: 1 }, 6.2)
      .to(pk, move(P.e, 0.7), 6.2)
      .set(pk, { opacity: 0 }, 6.9)
      .fromTo(q('.cl-doc'), { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, 6.9)
      .fromTo(q('.cl-bar'), { scaleX: 0, transformOrigin: '0 50%' }, { scaleX: 1, duration: 0.5, stagger: 0.08 }, 7.1)
      .to(q('.cl-scene'), { opacity: 0, duration: 0.5 }, 9)
  }, active)

  return (
    <Frame
      ref={ref}
      active={active}
      label="Animation : un graphe d'agents s'interrompt pour la validation du médecin avant de produire le rapport"
    >
      <g className="cl-scene">
        {Object.values(P)
          .filter((_, i) => i !== 2)
          .map((d, i) => (
            <path key={i} className="cl-edge" d={d} pathLength={1} strokeDasharray="1 1" stroke={C.line} strokeWidth="2" fill="none" />
          ))}
        {(Object.keys(N) as (keyof typeof N)[]).map((k) => {
          const n = N[k]
          const human = k === 'doc'
          return (
            <g key={k} className="cl-node">
              <circle cx={n.x} cy={n.y} r={human ? 34 : 26} fill={C.panel} stroke={human ? C.amber : C.cyan} strokeWidth="1.8" />
              <text
                x={n.x}
                y={n.y + (human ? 58 : 48)}
                textAnchor="middle"
                fill={human ? C.amber : C.ink}
                fontSize="13"
                fontFamily="var(--font-sans)"
                fontWeight="500"
              >
                {n.l}
              </text>
              {k === 'diag' && (
                <circle className="cl-diag-ring" cx={n.x} cy={n.y} r="26" fill="none" stroke={C.cyan} strokeWidth="2" opacity="0" />
              )}
            </g>
          )
        })}
        {/* attente de la décision humaine */}
        <circle
          className="cl-wait"
          cx={N.doc.x}
          cy={N.doc.y}
          r="44"
          fill="none"
          stroke={C.amber}
          strokeWidth="3"
          pathLength={1}
          strokeDasharray="1 1"
          transform={`rotate(-90 ${N.doc.x} ${N.doc.y})`}
        />
        <g className="cl-pause" opacity="0">
          <rect x={N.doc.x - 9} y={N.doc.y - 11} width="6" height="22" rx="2" fill={C.amber} />
          <rect x={N.doc.x + 3} y={N.doc.y - 11} width="6" height="22" rx="2" fill={C.amber} />
        </g>
        <path
          className="cl-ok"
          d={`M${N.doc.x - 11} ${N.doc.y} l7 7 l14 -15`}
          stroke={C.amber}
          strokeWidth="3.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <text
          className="cl-caption"
          x={N.doc.x}
          y={N.doc.y - 58}
          textAnchor="middle"
          fill={C.ink}
          fontSize="12"
          fontFamily="var(--font-sans)"
        >
          validé par le médecin
        </text>
        {/* icônes */}
        <path d={`M${N.sup.x - 9} ${N.sup.y + 6} l9 -14 l9 14 z`} fill="none" stroke={C.cyan} strokeWidth="1.6" />
        <path
          d={`M${N.mcp.x - 9} ${N.mcp.y - 4} h18 M${N.mcp.x - 9} ${N.mcp.y + 4} h12`}
          stroke={C.cyan}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d={`M${N.diag.x} ${N.diag.y - 10} v20 M${N.diag.x - 10} ${N.diag.y} h20`}
          stroke={C.cyan}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <g className="cl-doc">
          <rect x={N.rep.x - 15} y={N.rep.y - 18} width="30" height="36" rx="4" fill="none" stroke={C.cyan} strokeWidth="1.6" />
          <rect className="cl-bar" x={N.rep.x - 9} y={N.rep.y - 9} width="18" height="3" rx="1.5" fill={C.cyan} />
          <rect className="cl-bar" x={N.rep.x - 9} y={N.rep.y - 2} width="14" height="3" rx="1.5" fill={C.cyan} />
          <rect className="cl-bar" x={N.rep.x - 9} y={N.rep.y + 5} width="16" height="3" rx="1.5" fill={C.cyan} />
        </g>
        <circle className="cl-packet" r="6" fill={C.ice} opacity="0" style={{ filter: 'drop-shadow(0 0 6px #38bdf8)' }} />
      </g>
    </Frame>
  )
}
