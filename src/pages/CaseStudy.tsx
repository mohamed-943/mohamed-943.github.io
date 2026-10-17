import { useEffect, useRef } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { getProject, projects } from '../data/projects'
import { asset } from '../lib/asset'
import { gsap, useGSAP, prefersReducedMotion } from '../lib/motion'
import ProjectCover from '../components/covers/ProjectCover'
import PipelineDiagram from '../components/PipelineDiagram'
import { ArrowIcon, ArrowLeftIcon, GitHubIcon, LockIcon } from '../components/Icons'
import './case-study.css'

export default function CaseStudy() {
  const { slug = '' } = useParams()
  const project = getProject(slug)
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    if (project) document.title = `${project.title} | Mohamed Traoré`
  }, [project])

  useGSAP(
    () => {
      if (!project || prefersReducedMotion()) return
      const tl = gsap.timeline()
      tl.from('.cs-head > *', { y: 28, opacity: 0, duration: 1, stagger: 0.07 }).from(
        '.cs-cover',
        { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.3, ease: 'expo.inOut' },
        0.15,
      )
    },
    { scope: root, dependencies: [slug] },
  )

  if (!project) return <Navigate to="/404" replace />

  const idx = projects.findIndex((p) => p.slug === slug)
  const next = projects[(idx + 1) % projects.length]

  const steps = [
    { id: 'probleme', title: 'Le problème' },
    { id: 'approche', title: 'L’approche' },
    { id: 'architecture', title: 'L’architecture' },
    { id: 'resultats', title: 'Les résultats' },
    { id: 'retours', title: 'Ce que j’en retiens' },
  ]

  return (
    <article className="cs" id="contenu" ref={root} key={slug}>
      <div className="wrap">
        <Link to="/#projets" className="cs-back">
          <ArrowLeftIcon /> Tous les projets
        </Link>

        <header className="cs-head">
          <p className="cs-meta">
            {project.period} <span aria-hidden="true">/</span> {project.context}
          </p>
          <h1 className="cs-title">{project.title}</h1>
          <p className="cs-summary">{project.summary}</p>
          <div className="cs-actions">
            {project.repoPublished ? (
              <a className="btn btn-primary" href={project.repo} target="_blank" rel="noreferrer">
                <GitHubIcon /> Voir le code
              </a>
            ) : project.confidentiality ? (
              <p className="cs-note">
                <LockIcon /> {project.confidentiality}
              </p>
            ) : (
              <span className="btn btn-ghost" aria-disabled="true">
                <GitHubIcon /> Code bientôt public
              </span>
            )}
            {project.demo && (
              <a className="btn btn-ghost" href={project.demo} target="_blank" rel="noreferrer">
                Ouvrir la démo
              </a>
            )}
          </div>
        </header>

        <ProjectCover kind={project.cover} className="cs-cover" />

        <div className="cs-body">
          <section className="cs-step" aria-labelledby={steps[0].id}>
            <h2 id={steps[0].id}>
              <span className="cs-num">1</span>
              {steps[0].title}
            </h2>
            <p className="cs-lead">{project.problem}</p>
          </section>

          <section className="cs-step" aria-labelledby={steps[1].id}>
            <h2 id={steps[1].id}>
              <span className="cs-num">2</span>
              {steps[1].title}
            </h2>
            <ul className="cs-points">
              {project.approach.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </section>

          <section className="cs-step cs-step-wide" aria-labelledby={steps[2].id}>
            <h2 id={steps[2].id}>
              <span className="cs-num">3</span>
              {steps[2].title}
            </h2>
            <div>
              <PipelineDiagram pipeline={project.pipeline} />
              <ul className="cs-stack" aria-label="Technologies">
                {project.stack.map((s) => (
                  <li className="tag" key={s}>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="cs-step" aria-labelledby={steps[3].id}>
            <h2 id={steps[3].id}>
              <span className="cs-num">4</span>
              {steps[3].title}
            </h2>
            <dl className="cs-metrics">
              {project.metrics.map((m) => (
                <div key={m.label}>
                  <dt>{m.label}</dt>
                  <dd>{m.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {project.screenshots.length > 0 && (
            <section className="cs-step cs-step-wide" aria-label="Captures d’écran">
              <h2>
                <span className="cs-num" aria-hidden="true" />
                Captures
              </h2>
              <div className="cs-shots">
                {project.screenshots.map((s) => (
                  <figure key={s.src}>
                    <img src={asset(s.src)} alt={s.alt} loading="lazy" />
                    <figcaption>{s.alt}</figcaption>
                  </figure>
                ))}
              </div>
            </section>
          )}

          <section className="cs-step" aria-labelledby={steps[4].id}>
            <h2 id={steps[4].id}>
              <span className="cs-num">5</span>
              {steps[4].title}
            </h2>
            <ul className="cs-points">
              {project.lessons.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </section>
        </div>

        <Link to={`/projets/${next.slug}`} className="cs-next">
          <span className="cs-next-label">Projet suivant</span>
          <span className="cs-next-title">
            {next.title} <ArrowIcon />
          </span>
        </Link>
      </div>
    </article>
  )
}
