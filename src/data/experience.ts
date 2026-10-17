import type { Experience } from './types'

export const experiences: Experience[] = [
  {
    role: 'Stagiaire ingénieur IA',
    company: 'ScreenEdge Africa',
    sector: 'RegTech, conformité financière',
    place: 'Casablanca',
    period: 'mai – juil. 2026',
    points: [
      'Conçu le module « Reputation Check » : orchestrateur et agents presse, légal, social et validation, intégrés à la plateforme de conformité.',
      'Construit la collecte parallèle tolérante aux pannes et la résolution d’identité contre les homonymes.',
      'Développé un classifieur NLP en 5 langues et un score de risque pondéré ; chaque appel IA est tracé pour l’audit.',
      'Validé le module par 49 tests unitaires, environ 20 tests d’intégration et 8 scénarios de bout en bout.',
    ],
    stack: ['Node.js', 'Express', 'React', 'PostgreSQL', 'Playwright', 'Groq'],
  },
  {
    role: 'Stagiaire développeur full-stack',
    company: 'Dabo Academy',
    sector: 'Éducation',
    place: 'en binôme',
    period: 'été 2025 · 2 mois',
    points: [
      'Refondu un site WordPress en application e-commerce, e-learning et événements : 12 entités modélisées en UML, tableau de bord d’administration.',
      'Intégré l’authentification JWT et le paiement Stripe.',
      'Déployé en production avec Gunicorn, Nginx et HTTPS Let’s Encrypt, puis accéléré l’application par des index PostgreSQL.',
    ],
    stack: ['Django REST Framework', 'React', 'Material UI', 'PostgreSQL', 'Stripe', 'Nginx'],
  },
]
