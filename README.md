# Portfolio — Mohamed Traoré

Site personnel d’AI Engineer / Data Engineer : études de cas de projets avec schémas d’architecture animés, parcours, compétences, certifications et contact.

**Stack** : React 19, TypeScript, Vite, GSAP (ScrollTrigger, MotionPath), Three.js (réseau d’agents en WebGL), Lenis. Déployé par GitHub Actions sur GitHub Pages ; image Docker Nginx non-root.

## Démarrer

```bash
npm ci
npm run dev        # http://localhost:5173
```

| Commande                | Rôle                                                   |
| ----------------------- | ------------------------------------------------------ |
| `npm run dev`           | serveur de développement                               |
| `npm run check`         | formatage, lint, types et tests (comme la CI)          |
| `npm run build`         | build de production dans `dist/`                       |
| `make up` / `make down` | site de production dans Docker (http://localhost:8080) |
| `make help`             | toutes les commandes                                   |

Mettre une modification en ligne (branche, PR, déploiement) : voir [docs/WORKFLOW.md](docs/WORKFLOW.md).

## Organisation

```
src/
  data/            le contenu du site (à modifier ici)  → docs/CONTENU.md
  components/
    hero/          réseau d'agents WebGL (Three.js, shaders)
    covers/        6 couvertures en motion design (SVG + GSAP), une par projet
    sections/      projets, parcours, compétences, certifications, contact
    PipelineDiagram.tsx   schémas d'architecture générés depuis les données
  pages/           accueil, étude de cas, 404
docker/nginx.conf  serveur de production (SPA, cache, en-têtes de sécurité)
.github/workflows  CI, déploiement, release, surveillance  → docs/DEVOPS.md
```

## Motion design

- **Hero** : réseau de ~150 nœuds en WebGL. Au centre l’orchestrateur (la photo), autour 5 agents, puis outils et données ; des signaux remontent en continu, quelques sources « en alerte » en ambre. Le réseau se forme à l’ouverture et se disperse au défilement.
- **Couvertures de projets** : six scènes animées qui racontent ce que fait chaque système (collecte → score de risque, pause pour validation médicale, détection d’un pic de gaz, récupération top-5, interpolation d’une coupure, décisions de trading). Elles ne jouent que lorsqu’elles sont visibles.
- **Schémas d’architecture** : générés depuis `projects.ts`, ils se construisent colonne par colonne puis des paquets de données circulent sur les liaisons.
- L’ambre est réservé au sens « alerte ou décision » ; tout le reste est cyan.
- Avec « Réduire les animations » activé dans le système, tout s’affiche en image fixe.

## Licence

Code sous licence MIT. Textes, photo et CV : © Mohamed Traoré, tous droits réservés.
