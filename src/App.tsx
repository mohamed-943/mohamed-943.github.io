import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Nav from './components/layout/Nav'
import Footer from './components/layout/Footer'
import Home from './pages/Home'
import CaseStudy from './pages/CaseStudy'
import NotFound from './pages/NotFound'
import { useSmoothScroll, scrollToTarget, scrollToTop } from './lib/useSmoothScroll'
import { ScrollTrigger } from './lib/motion'

/** À chaque changement de page : haut de page, ou ancre demandée (/#projets). */
function RouteScroll() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const id = hash
      // laisse le temps à la page d'accueil de se monter
      requestAnimationFrame(() => setTimeout(() => scrollToTarget(id, true), 60))
    } else scrollToTop()
    const t = setTimeout(() => ScrollTrigger.refresh(), 300)
    return () => clearTimeout(t)
  }, [pathname, hash])
  return null
}

export default function App() {
  useSmoothScroll()
  return (
    <>
      <a href="#contenu" className="skip-link">
        Aller au contenu
      </a>
      <Nav />
      <RouteScroll />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projets/:slug" element={<CaseStudy />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </>
  )
}
