import { useRef } from 'react'
import type { Pipeline } from '../data/types'
import { gsap, useGSAP, prefersReducedMotion } from '../lib/motion'
import { prepareStrokes, LEN } from './covers/useCoverTimeline'
import './pipeline.css'

// Schéma d'architecture généré à partir des données du projet.
// Les nœuds apparaissent colonne par colonne, puis des signaux circulent en continu sur les liaisons.
const BW = 136
const BH = 56
const CW = 178
const RH = 84
const PAD = 24

export default function PipelineDiagram({ pipeline }: { pipeline: Pipeline }) {
  const ref = useRef<HTMLDivElement>(null)
  const maxCol = Math.max(...pipeline.nodes.map((n) => n.col))
  const maxRow = Math.max(...pipeline.nodes.map((n) => n.row))
  const W = PAD * 2 + maxCol * CW + BW
  const H = PAD * 2 + maxRow * RH + BH
  const pos = Object.fromEntries(pipeline.nodes.map((n) => [n.id, { x: PAD + n.col * CW, y: PAD + n.row * RH, n }]))

  const edgePath = (a: string, b: string) => {
    const s = pos[a]
    const t = pos[b]
    if (t.n.col > s.n.col) {
      const x1 = s.x + BW
      const y1 = s.y + BH / 2
      const x2 = t.x
      const y2 = t.y + BH / 2
      const mx = (x1 + x2) / 2
      return `M${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`
    }
    if (t.n.col === s.n.col) {
      const down = t.n.row > s.n.row
      const x = s.x + BW / 2 + (down ? -12 : 12)
      return `M${x} ${down ? s.y + BH : s.y} L ${x} ${down ? t.y : t.y + BH}`
    }
    // liaison de retour : passe sous les nœuds
    const x1 = s.x + BW / 2
    const x2 = t.x + BW / 2
    const yb = Math.max(s.y, t.y) + BH + 26
    return `M${x1} ${s.y + BH} C ${x1} ${yb}, ${x2} ${yb}, ${x2} ${t.y + BH}`
  }

  useGSAP(
    () => {
      const q = gsap.utils.selector(ref)
      if (prefersReducedMotion() || !ref.current) return
      prepareStrokes(ref.current)
      const tl = gsap.timeline({ scrollTrigger: { trigger: ref.current, start: 'top 78%' } })
      tl.from(q('.pl-node'), { opacity: 0, y: 14, duration: 0.7, stagger: (i) => Number(q('.pl-node')[i].getAttribute('data-col')) * 0.14 })
        .fromTo(q('.pl-edge'), { strokeDashoffset: LEN }, { strokeDashoffset: 0, duration: 0.8, stagger: 0.05, ease: 'power2.inOut' }, 0.2)
        .add(() => {
          q('.pl-packet').forEach((el, i) => {
            const path = q('.pl-edge')[i] as unknown as SVGPathElement
            gsap.set(el, { opacity: 1 })
            gsap.to(el, {
              motionPath: { path, align: path, alignOrigin: [0.5, 0.5] },
              duration: 1.6,
              repeat: -1,
              repeatDelay: 1.4,
              delay: Number(el.getAttribute('data-col')) * 0.35,
              ease: 'power1.inOut',
            })
          })
        })
    },
    { scope: ref },
  )

  return (
    <figure className="pipeline">
      <div className="pipeline-scroll" ref={ref} tabIndex={0} aria-label="Schéma d'architecture, défilable horizontalement">
        <svg viewBox={`0 0 ${W} ${H}`} style={{ minWidth: Math.min(W, 900) }} role="img" aria-label={pipeline.caption}>
          {pipeline.edges.map(([a, b], i) => (
            <path key={i} className="pl-edge" d={edgePath(a, b)} pathLength={1} />
          ))}
          {pipeline.edges.map(([a], i) => (
            <circle key={i} className="pl-packet" r="4" data-col={pos[a].n.col} opacity="0" />
          ))}
          {pipeline.nodes.map((n) => {
            const p = pos[n.id]
            return (
              <g key={n.id} className={`pl-node${n.accent ? ' is-accent' : ''}`} data-col={n.col} transform={`translate(${p.x} ${p.y})`}>
                <rect width={BW} height={BH} rx="10" />
                <text x="14" y={n.sub ? 23 : 33} className="pl-label">
                  {n.label}
                </text>
                {n.sub && (
                  <text x="14" y="42" className="pl-sub">
                    {n.sub}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>
      <figcaption>{pipeline.caption}</figcaption>
    </figure>
  )
}
