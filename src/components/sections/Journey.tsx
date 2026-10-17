import { useRef } from 'react'
import { experiences } from '../../data/experience'
import { profile } from '../../data/profile'
import { gsap, useGSAP, prefersReducedMotion } from '../../lib/motion'
import './journey.css'

export default function Journey() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      // Le fil du parcours se remplit au rythme du défilement.
      gsap.fromTo(
        '.jr-fill',
        { scaleY: 0 },
        { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.jr-track', start: 'top 70%', end: 'bottom 60%', scrub: 0.6 } },
      )
      gsap.utils.toArray<HTMLElement>('.jr-item').forEach((el) => {
        gsap.from(el.querySelector('.jr-dot'), {
          scale: 0,
          duration: 0.6,
          ease: 'back.out(3)',
          scrollTrigger: { trigger: el, start: 'top 68%' },
        })
      })
    },
    { scope: root },
  )

  return (
    <section className="section journey" id="parcours" ref={root} aria-labelledby="parcours-title">
      <div className="wrap">
        <div className="section-head">
          <h2 className="section-title" id="parcours-title">
            Parcours
          </h2>
          <p className="section-lead">{profile.intro}</p>
        </div>

        <div className="jr-cols">
          <div>
            <h3 className="jr-heading">Expériences</h3>
            <div className="jr-track">
              <span className="jr-line" aria-hidden="true">
                <span className="jr-fill" />
              </span>
              <ol className="jr-items">
                {experiences.map((e) => (
                  <li className="jr-item" key={e.company}>
                    <span className="jr-dot" aria-hidden="true" />
                    <p className="jr-period">{e.period}</p>
                    <h4 className="jr-role">
                      {e.role}, <span>{e.company}</span>
                    </h4>
                    <p className="jr-sector">
                      {e.sector}, {e.place}
                    </p>
                    <ul className="jr-points">
                      {e.points.map((pt) => (
                        <li key={pt}>{pt}</li>
                      ))}
                    </ul>
                    <ul className="jr-stack" aria-label="Technologies">
                      {e.stack.map((s) => (
                        <li className="tag" key={s}>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="jr-side">
            <h3 className="jr-heading">Formation</h3>
            <ul className="jr-edu">
              {profile.education.map((ed) => (
                <li key={ed.title}>
                  <p className="jr-period">{ed.period}</p>
                  <h4 className="jr-edu-title">{ed.title}</h4>
                  <p className="jr-sector">{ed.school}</p>
                  <p className="jr-edu-detail">{ed.detail}</p>
                </li>
              ))}
            </ul>
            <h3 className="jr-heading">Langues</h3>
            <ul className="jr-langs">
              {profile.languages.map((l) => (
                <li key={l.name}>
                  <span>{l.name}</span> {l.level}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
