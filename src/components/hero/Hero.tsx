import { useRef } from 'react'
import { profile } from '../../data/profile'
import { asset } from '../../lib/asset'
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from '../../lib/motion'
import { scrollToTarget } from '../../lib/useSmoothScroll'
import { DownloadIcon, GitHubIcon, LinkedInIcon } from '../Icons'
import type { AgentNetwork } from './network'
import './hero.css'

const Letters = ({ text }: { text: string }) => (
  <span className="hero-line" aria-hidden="true">
    {[...text].map((c, i) => (
      <span className="hero-char" key={i}>
        {c}
      </span>
    ))}
  </span>
)

export default function Hero() {
  const root = useRef<HTMLElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const ring = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const reduced = prefersReducedMotion()
      let net: AgentNetwork | null = null
      let disposed = false
      const state = { progress: reduced ? 1 : 0 }

      const pulse = () => {
        if (!ring.current) return
        ring.current.animate(
          [
            { transform: 'scale(1)', opacity: 0.9 },
            { transform: 'scale(1.32)', opacity: 0 },
          ],
          { duration: 1400, easing: 'cubic-bezier(.16,1,.3,1)' },
        )
      }

      // Three.js est chargé à part : le texte s'affiche sans attendre le WebGL.
      import('./network').then(({ AgentNetwork }) => {
        if (disposed || !canvas.current) return
        try {
          net = new AgentNetwork(canvas.current, { reducedMotion: reduced, onPulse: pulse })
        } catch {
          root.current?.classList.add('no-webgl')
          return
        }
        net.setProgress(state.progress)
        const io = new IntersectionObserver(([e]) => (e.isIntersecting ? net?.start() : net?.stop()))
        io.observe(canvas.current)
        cleanups.push(() => io.disconnect())
      })

      const cleanups: (() => void)[] = []
      const onMove = (e: PointerEvent) => {
        net?.setPointer((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1)
      }
      window.addEventListener('pointermove', onMove, { passive: true })
      cleanups.push(() => window.removeEventListener('pointermove', onMove))

      if (!reduced) {
        // Séquence d'ouverture unique : le réseau se forme pendant que le nom s'écrit.
        const tl = gsap.timeline({ delay: 0.15 })
        tl.to(state, {
          progress: 1,
          duration: 2.8,
          ease: 'power2.inOut',
          onUpdate: () => net?.setProgress(state.progress),
        })
          .from('.hero-photo', { scale: 0.4, opacity: 0, duration: 1.6 }, 0.35)
          .from('.hero-char', { yPercent: 115, duration: 1.3, stagger: 0.035 }, 0.2)
          .from('.hero-reveal', { y: 24, opacity: 0, duration: 1.1, stagger: 0.09 }, 0.9)

        // En quittant le hero, le réseau se disperse et s'efface.
        ScrollTrigger.create({
          trigger: root.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
          onUpdate: (self) => net?.setScroll(self.progress),
        })
        gsap.to('.hero-copy', {
          yPercent: -18,
          opacity: 0.2,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
        })
      }

      return () => {
        disposed = true
        cleanups.forEach((f) => f())
        net?.dispose()
      }
    },
    { scope: root },
  )

  return (
    <header className="hero" ref={root} id="accueil">
      <div className="hero-stage" aria-hidden="true">
        <canvas ref={canvas} className="hero-canvas" />
        <div className="hero-photo">
          <div className="hero-ring" ref={ring} />
          <img src={asset(profile.photo)} alt="" width={480} height={480} />
        </div>
      </div>

      <div className="hero-copy wrap">
        <h1 className="hero-name">
          <span className="sr-only">{profile.name}, AI Engineer et Data Engineer</span>
          <Letters text="Mohamed" />
          <Letters text="Traoré" />
        </h1>
        <p className="hero-roles hero-reveal">AI Engineer / Data Engineer</p>
        <p className="hero-headline hero-reveal">{profile.headline}</p>
        <p className="hero-status hero-reveal">
          <span className="status-dot" aria-hidden="true" />
          {profile.availability}. Mobile au Maroc, en France et en Belgique.
        </p>
        <div className="hero-actions hero-reveal">
          <a className="btn btn-primary" href={asset(profile.cv.ai)} download>
            <DownloadIcon /> CV AI Engineer
          </a>
          <a className="btn btn-ghost" href={asset(profile.cv.data)} download>
            <DownloadIcon /> CV Data Engineer
          </a>
          <a className="icon-btn" href={profile.github} target="_blank" rel="noreferrer">
            <GitHubIcon title="GitHub" />
          </a>
          <a className="icon-btn" href={profile.linkedin} target="_blank" rel="noreferrer">
            <LinkedInIcon title="LinkedIn" />
          </a>
        </div>
        <a
          className="hero-scroll hero-reveal"
          href="#projets"
          onClick={(e) => {
            e.preventDefault()
            scrollToTarget('#projets')
          }}
        >
          Voir les projets
        </a>
      </div>
    </header>
  )
}
