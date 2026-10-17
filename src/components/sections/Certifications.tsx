import { useMemo, useRef, useState } from 'react'
import { certifications, inProgress } from '../../data/certifications'
import type { Certification } from '../../data/types'
import { gsap, useGSAP, prefersReducedMotion } from '../../lib/motion'
import './certifications.css'

type Filter = 'Toutes' | Certification['domain']
const FILTERS: Filter[] = ['Toutes', 'IA & Data', 'Bases de données', 'Cloud & Réseaux', 'Programmation', 'Gestion de projet']

export default function Certifications() {
  const [filter, setFilter] = useState<Filter>('Toutes')
  const list = useRef<HTMLUListElement>(null)

  const shown = useMemo(
    () =>
      certifications
        .filter((c) => filter === 'Toutes' || c.domain === filter)
        .sort((a, b) => Number(!!b.featured) - Number(!!a.featured) || b.year - a.year),
    [filter],
  )

  // Réponse à l'action : la liste filtrée se recompose ligne par ligne.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.from('.ct-item', { opacity: 0, x: -12, duration: 0.5, stagger: 0.035, ease: 'power3.out' })
    },
    { scope: list, dependencies: [filter] },
  )

  return (
    <section className="section certs" id="certifications" aria-labelledby="certifications-title">
      <div className="wrap">
        <div className="section-head">
          <h2 className="section-title" id="certifications-title">
            Certifications
          </h2>
          <p className="section-lead">
            {certifications.length} certificats obtenus, et deux parcours en cours :{' '}
            {inProgress.map((p) => `${p.title} (${p.progress})`).join(' et ')}.
          </p>
        </div>

        <div className="ct-filters" role="group" aria-label="Filtrer par domaine">
          {FILTERS.map((f) => (
            <button key={f} className="ct-filter" aria-pressed={filter === f} onClick={() => setFilter(f)}>
              {f}
            </button>
          ))}
        </div>

        <ul className="ct-list" ref={list} aria-live="polite">
          {shown.map((c) => (
            <li className={`ct-item${c.featured ? ' is-featured' : ''}`} key={c.title}>
              <span className="ct-title">
                {c.url ? (
                  <a href={c.url} target="_blank" rel="noreferrer">
                    {c.title}
                  </a>
                ) : (
                  c.title
                )}
              </span>
              <span className="ct-issuer">{c.issuer}</span>
              <span className="ct-date">{c.date}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
