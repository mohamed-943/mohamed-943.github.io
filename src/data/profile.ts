export const profile = {
  name: 'Mohamed Traoré',
  firstName: 'Mohamed',
  roles: ['AI Engineer', 'Data Engineer'],
  headline: 'Je conçois des systèmes d’IA agentique et des pipelines de données fiables, traçables et conformes.',
  intro:
    'Élève ingénieur en dernière année (IA & Big Data) à HESTIM Casablanca, en double diplôme avec un Master 2 Cyberdéfense des SI à l’UPHF. Mon dernier stage : un agent de vérification de réputation KYC / LCB-FT mis en service sur une plateforme de conformité financière.',
  availability: 'Stage PFE de 4 à 6 mois, dès février 2027',
  mobility: 'Maroc, France, Belgique',
  location: 'Casablanca',
  email: 'mohamednoordinetraore@gmail.com',
  phone: '+212 6 60 63 74 61',
  linkedin: 'https://www.linkedin.com/in/mohamed-traor%C3%A9-737547361',
  github: 'https://github.com/mohamed-943',
  photo: '/img/mohamed.jpg',
  cv: {
    ai: '/cv/CV_Mohamed_Traore_AI_Engineer.pdf',
    data: '/cv/CV_Mohamed_Traore_Data_Engineer.pdf',
  },
  languages: [
    { name: 'Français', level: 'courant' },
    { name: 'Anglais', level: 'intermédiaire (B1)' },
  ],
  education: [
    {
      title: 'Master 2 Cyberdéfense des Systèmes d’Information',
      school: 'UPHF — Université Polytechnique Hauts-de-France (double diplôme)',
      period: 'nov. 2026 – 2027',
      detail: 'Analyse de risques EBIOS RM (ANSSI), forensics réseau avec Security Onion, sécurité mobile Android.',
    },
    {
      title: 'Diplôme d’ingénieur Informatique & IA, option IA & Big Data',
      school: 'HESTIM Engineering & Business School, Casablanca',
      period: 'promo 2027',
      detail: 'Machine learning, big data, cloud AWS, développement logiciel, projets PACTE en équipe.',
    },
  ],
} as const
