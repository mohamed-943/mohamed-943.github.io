// Types partagés par toutes les données du portfolio.
// Modifier le contenu se fait dans les fichiers de src/data/, jamais dans les composants.

export type CoverKind = 'reputation' | 'clinical' | 'sentinel' | 'rag' | 'energy' | 'trading'

export interface PipelineNode {
  id: string
  label: string
  /** Détail technique affiché sous le libellé (outil, modèle…) */
  sub?: string
  /** Colonne (0 = gauche) et ligne (0 = haut) dans la grille du schéma */
  col: number
  row: number
  /** Nœud qui porte une alerte ou une décision humaine : affiché en ambre */
  accent?: boolean
}

export interface Pipeline {
  nodes: PipelineNode[]
  /** Arêtes orientées [source, cible] */
  edges: [string, string][]
  caption: string
}

export interface Metric {
  value: string
  label: string
}

export interface Project {
  slug: string
  title: string
  /** Une phrase : ce que fait le système, pour qui */
  summary: string
  period: string
  context: string
  domains: ('IA' | 'Data' | 'Sécurité' | 'Web')[]
  cover: CoverKind
  problem: string
  approach: string[]
  pipeline: Pipeline
  stack: string[]
  metrics: Metric[]
  lessons: string[]
  repo: string
  /** false tant que le dépôt GitHub n'est pas public : le bouton est désactivé */
  repoPublished: boolean
  demo?: string
  /** Mention affichée quand le code ne peut pas être publié */
  confidentiality?: string
  /** Chemins sous /public (ex. /projects/sentinel/dashboard.png). Vide = couverture animée seule. */
  screenshots: { src: string; alt: string }[]
}

export interface Experience {
  role: string
  company: string
  sector: string
  place: string
  period: string
  points: string[]
  stack: string[]
}

export interface SkillGroup {
  name: string
  items: string[]
  learning?: string[]
}

export interface Certification {
  title: string
  issuer: string
  date: string
  /** Année pour le tri, 0 si inconnue */
  year: number
  domain: 'IA & Data' | 'Bases de données' | 'Cloud & Réseaux' | 'Programmation' | 'Gestion de projet'
  featured?: boolean
  url?: string
}
