import { useEffect } from 'react'
import Hero from '../components/hero/Hero'
import Projects from '../components/sections/Projects'
import Journey from '../components/sections/Journey'
import Skills from '../components/sections/Skills'
import Certifications from '../components/sections/Certifications'
import Contact from '../components/sections/Contact'

export default function Home() {
  useEffect(() => {
    document.title = 'Mohamed Traoré | AI Engineer et Data Engineer'
  }, [])
  return (
    <>
      <Hero />
      <main id="contenu">
        <Projects />
        <Journey />
        <Skills />
        <Certifications />
        <Contact />
      </main>
    </>
  )
}
