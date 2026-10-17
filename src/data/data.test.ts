// Tests de cohérence du contenu : la CI refuse un déploiement si une donnée est cassée.
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { projects } from './projects'
import { certifications } from './certifications'
import { experiences } from './experience'
import { profile } from './profile'

const pub = (p: string) => fileURLToPath(new URL(`../../public/${p.replace(/^\//, '')}`, import.meta.url))

describe('projets', () => {
  it('ont des slugs uniques et compatibles avec une URL', () => {
    const slugs = projects.map((p) => p.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
    slugs.forEach((s) => expect(s).toMatch(/^[a-z0-9-]+$/))
  })

  it.each(projects.map((p) => [p.slug, p] as const))('%s : le schéma ne référence que des nœuds existants', (_, p) => {
    const ids = new Set(p.pipeline.nodes.map((n) => n.id))
    expect(ids.size).toBe(p.pipeline.nodes.length)
    p.pipeline.edges.forEach(([a, b]) => {
      expect(ids, `arête ${a} → ${b}`).toContain(a)
      expect(ids, `arête ${a} → ${b}`).toContain(b)
    })
  })

  it.each(projects.map((p) => [p.slug, p] as const))('%s : contenu complet', (_, p) => {
    expect(p.problem.length).toBeGreaterThan(40)
    expect(p.approach.length).toBeGreaterThan(0)
    expect(p.metrics.length).toBeGreaterThan(0)
    expect(p.repo).toMatch(/^https:\/\/github\.com\//)
  })

  it.each(projects.map((p) => [p.slug, p] as const))('%s : les captures déclarées existent dans public/', (_, p) => {
    p.screenshots.forEach((s) => {
      expect(existsSync(pub(s.src)), s.src).toBe(true)
      expect(s.alt.length, `texte alternatif de ${s.src}`).toBeGreaterThan(5)
    })
  })
})

describe('profil', () => {
  it('les CV et la photo existent', () => {
    expect(existsSync(pub(profile.cv.ai))).toBe(true)
    expect(existsSync(pub(profile.cv.data))).toBe(true)
    expect(existsSync(pub(profile.photo))).toBe(true)
  })
  it('a une adresse e-mail valide', () => {
    expect(profile.email).toMatch(/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/)
  })
})

describe('certifications et expériences', () => {
  it('pas de certification en double', () => {
    const t = certifications.map((c) => c.title)
    expect(new Set(t).size).toBe(t.length)
  })
  it('chaque expérience a au moins un point', () => {
    experiences.forEach((e) => expect(e.points.length).toBeGreaterThan(0))
  })
})
