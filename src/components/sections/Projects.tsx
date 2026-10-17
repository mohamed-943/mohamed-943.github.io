import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { projects } from '../../data/projects'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from '../../lib/motion'
import ProjectCover from '../covers/ProjectCover'
import { ArrowIcon } from '../Icons'
import './projects.css'

export default function Projects() {
  const root = useRef<HTMLElement>(null)
  const [[active, prev], setPair] = useState<[number, number]>([0, -1])
  const setActive = (i: number) => setPair(([a, b]) => (i === a ? [a, b] : [i, a]))
  const wide = useMediaQuery('(min-width: 960px)')

  useGSAP(
    () => {
      if (!wide) return
      const items = gsap.utils.toArray<HTMLElement>('.pj-item')
      items.forEach((el, i) => {
        ScrollTrigger.create({
          trigger: el,
          start: 'top 55%',
          end: 'bottom 55%',
          onToggle: (self) => self.isActive && setActive(i),
        })
      })
    },
    { scope: root, dependencies: [wide] },
  )

  // Transition de la scène : la nouvelle couverture se dévoile par un balayage vertical.
  useGSAP(
    () => {
      if (!wide || prefersReducedMotion()) return
      gsap.fromTo(
        `.pj-layer[data-i="${active}"]`,
        { clipPath: 'inset(100% 0% 0% 0%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'expo.inOut' },
      )
    },
    { scope: root, dependencies: [active, wide] },
  )

  return (
    <section className="section projects" id="projets" ref={root} aria-labelledby="projets-title">
      <div className="wrap">
        <div className="section-head">
          <h2 className="section-title" id="projets-title">
            Projets
          </h2>
          <p className="section-lead">
            Six systèmes conçus de bout en bout. Chaque étude de cas suit le même fil : le problème, l’architecture, les choix techniques,
            les résultats mesurés.
          </p>
        </div>

        <div className="pj-grid">
          <ol className="pj-list">
            {projects.map((p, i) => (
              <li key={p.slug} className={`pj-item${i === active && wide ? ' is-active' : ''}`}>
                {!wide && <ProjectCover kind={p.cover} className="pj-inline-cover" />}
                <p className="pj-meta">
                  {p.period} <span aria-hidden="true">/</span> {p.domains.join(', ')}
                </p>
                <h3 className="pj-title">
                  <Link to={`/projets/${p.slug}`}>{p.title}</Link>
                </h3>
                <p className="pj-summary">{p.summary}</p>
                <dl className="pj-metrics">
                  {p.metrics.slice(0, 2).map((m) => (
                    <div key={m.label}>
                      <dt>{m.label}</dt>
                      <dd>{m.value}</dd>
                    </div>
                  ))}
                </dl>
                <Link className="pj-link" to={`/projets/${p.slug}`} aria-label={`Lire l’étude de cas : ${p.title}`}>
                  Lire l’étude de cas <ArrowIcon />
                </Link>
              </li>
            ))}
          </ol>

          {wide && (
            <div className="pj-stage" aria-hidden="true">
              <div className="pj-stage-inner">
                {projects.map((p, i) => (
                  <div key={p.slug} className="pj-layer" data-i={i} style={{ zIndex: i === active ? 2 : i === prev ? 1 : 0 }}>
                    <ProjectCover kind={p.cover} active={i === active} />
                  </div>
                ))}
              </div>
              <p className="pj-stage-caption">
                <span className="pj-count">
                  {String(active + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}
                </span>
                {projects[active].context}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
