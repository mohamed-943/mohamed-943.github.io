import type { Certification } from './types'

// Ajouter `url` vers la page de vérification (Coursera, Credly…) quand elle est disponible.
export const certifications: Certification[] = [
  { title: 'Machine Learning with Python', issuer: 'IBM', date: 'juin 2026', year: 2026, domain: 'IA & Data', featured: true },
  { title: 'Tools for Data Science', issuer: 'IBM', date: 'juin 2026', year: 2026, domain: 'IA & Data' },
  { title: 'What is Data Science?', issuer: 'IBM', date: 'juin 2026', year: 2026, domain: 'IA & Data' },
  {
    title: 'Relational Database Administration (DBA)',
    issuer: 'IBM',
    date: 'août 2025',
    year: 2025,
    domain: 'Bases de données',
    featured: true,
  },
  { title: 'Oracle Database Platform', issuer: 'LearnQuest', date: 'déc. 2024', year: 2024, domain: 'Bases de données' },
  { title: 'Oracle Database Foundations', issuer: 'LearnQuest', date: 'nov. 2024', year: 2024, domain: 'Bases de données', featured: true },
  { title: 'AWS Academy Cloud Foundations', issuer: 'AWS Academy', date: '', year: 0, domain: 'Cloud & Réseaux', featured: true },
  { title: 'Support et sécurité des réseaux', issuer: 'Cisco', date: 'avr. 2026', year: 2026, domain: 'Cloud & Réseaux', featured: true },
  { title: 'Notions de base sur les réseaux', issuer: 'Cisco', date: 'déc. 2025', year: 2025, domain: 'Cloud & Réseaux' },
  {
    title: 'Hands-on Introduction to Linux Commands and Shell Scripting',
    issuer: 'IBM',
    date: 'nov. 2023',
    year: 2023,
    domain: 'Cloud & Réseaux',
  },
  {
    title: 'Java Programming: Solving Problems with Software',
    issuer: 'Duke University',
    date: 'juin 2024',
    year: 2024,
    domain: 'Programmation',
  },
  {
    title: 'Programming Foundations with JavaScript, HTML and CSS',
    issuer: 'Duke University',
    date: 'févr. 2024',
    year: 2024,
    domain: 'Programmation',
  },
  {
    title: 'Introduction to Python Programming',
    issuer: 'University of Pennsylvania',
    date: 'janv. 2024',
    year: 2024,
    domain: 'Programmation',
  },
  {
    title: 'Project Planning: Putting It All Together',
    issuer: 'Google',
    date: 'juin 2026',
    year: 2026,
    domain: 'Gestion de projet',
    featured: true,
  },
  {
    title: 'Gestion de projet : les bases de la réussite',
    issuer: 'UC Irvine',
    date: 'nov. 2024',
    year: 2024,
    domain: 'Gestion de projet',
  },
]

export const inProgress = [
  { title: 'IBM AI Engineering', progress: '1 / 13 cours' },
  { title: 'IBM Data Science', progress: '3 / 12 cours' },
]
