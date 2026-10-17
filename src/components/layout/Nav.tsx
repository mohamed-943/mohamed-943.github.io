import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { scrollToTarget } from '../../lib/useSmoothScroll'
import './nav.css'

const LINKS = [
  { id: 'projets', label: 'Projets' },
  { id: 'parcours', label: 'Parcours' },
  { id: 'competences', label: 'Compétences' },
  { id: 'certifications', label: 'Certifications' },
  { id: 'contact', label: 'Contact' },
]

/** Monogramme : un nœud central relié à trois agents. */
const Mark = () => (
  <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true">
    <g stroke="currentColor" strokeWidth="1.6" fill="none">
      <path d="M16 16 L6 8 M16 16 L26 9 M16 16 L17 27" opacity="0.6" />
      <circle cx="6" cy="8" r="3" />
      <circle cx="26" cy="9" r="3" />
      <circle cx="17" cy="27" r="3" />
    </g>
    <circle cx="16" cy="16" r="4.5" fill="var(--signal)" />
  </svg>
)

export default function Nav() {
  const [open, setOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const last = useRef(0)
  const { pathname } = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 24)
      setHidden(y > 400 && y > last.current)
      last.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const go = (id: string) => (e: MouseEvent) => {
    e.preventDefault()
    setOpen(false)
    if (pathname !== '/') navigate(`/#${id}`)
    else scrollToTarget(`#${id}`)
  }

  return (
    <nav
      className={`nav${hidden && !open ? ' is-hidden' : ''}${scrolled ? ' is-scrolled' : ''}${open ? ' is-open' : ''}`}
      aria-label="Navigation principale"
    >
      <div className="nav-inner wrap">
        <Link to="/" className="nav-brand" onClick={() => setOpen(false)}>
          <Mark />
          <span>Mohamed Traoré</span>
        </Link>
        <button className="nav-toggle" aria-expanded={open} aria-controls="nav-menu" onClick={() => setOpen((o) => !o)}>
          <span className="sr-only">{open ? 'Fermer le menu' : 'Ouvrir le menu'}</span>
          <span className="nav-burger" aria-hidden="true" />
        </button>
        <ul className="nav-links" id="nav-menu">
          {LINKS.map((l) => (
            <li key={l.id}>
              <a href={`/#${l.id}`} onClick={go(l.id)}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
