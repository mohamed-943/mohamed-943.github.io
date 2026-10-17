import { useRef } from 'react'
import { gsap, useGSAP, prefersReducedMotion } from '../../lib/motion'

/**
 * Construit une boucle GSAP pour une couverture animée.
 * - joue seulement quand `active` est vrai ET que la couverture est visible à l'écran ;
 * - avec « réduire les animations », affiche une image fixe représentative (stillAt).
 */
export function useCoverTimeline(build: (tl: gsap.core.Timeline, q: (sel: string) => Element[]) => void, active: boolean, stillAt = 0.62) {
  const ref = useRef<SVGSVGElement>(null)
  const tl = useRef<gsap.core.Timeline | null>(null)
  const visible = useRef(false)

  useGSAP(
    () => {
      const el = ref.current
      if (!el) return
      const q = gsap.utils.selector(el)
      prepareStrokes(el)
      const t = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 0.6, defaults: { ease: 'power3.out' } })
      build(t, q)
      tl.current = t
      if (prefersReducedMotion()) {
        t.progress(stillAt).pause()
        return
      }
      const io = new IntersectionObserver(([e]) => {
        visible.current = e.isIntersecting
        if (e.isIntersecting && el.dataset.active === 'true') t.play()
        else t.pause()
      })
      io.observe(el)
      return () => io.disconnect()
    },
    { scope: ref },
  )

  useGSAP(
    () => {
      const t = tl.current
      if (!t || prefersReducedMotion()) return
      if (active && visible.current) t.play()
      else if (!active) t.pause()
    },
    { dependencies: [active] },
  )

  return ref
}

/**
 * Remplace pathLength="1" par la longueur réelle du tracé (plus fiable selon les navigateurs)
 * et la mémorise dans data-len. Les animations « dessin » utilisent ensuite LEN.
 */
export function prepareStrokes(root: Element) {
  root.querySelectorAll<SVGGeometryElement>('[pathLength]').forEach((el) => {
    const L = el.getTotalLength()
    el.removeAttribute('pathLength')
    el.style.strokeDasharray = `${L} ${L}`
    el.style.strokeDashoffset = String(L)
    el.dataset.len = String(L)
  })
}

/** Valeur de tween : longueur réelle de l'élément (tracé masqué). */
export const LEN = (_: number, el: Element) => Number((el as SVGElement).dataset.len ?? 0)
