# Le portfolio comme labo DevOps

Ce dépôt n’est pas seulement un site : c’est un terrain d’entraînement qui applique, sur un vrai projet que des recruteurs vont visiter, chaque phase du cours **DevOps & Docker (HESTIM, 2026/2027)**.

Le principe : vous développez dans VS Code, vous poussez sur GitHub, et tout le reste (vérifications, image Docker, scan de sécurité, mise en ligne, surveillance) se fait automatiquement.

```
 PLAN ──► CODE ──► BUILD ──► TEST ──► RELEASE ──► DEPLOY ──► OPERATE ──► MONITOR
  │        │        │         │         │           │           │           │
Issues   VS Code   Vite +   Vitest,   tag Git →   GitHub     Compose,    monitor.yml,
GitHub   + hooks   Docker   oxlint,   image GHCR  Pages      healthcheck Lighthouse,
         Git       multi-   Trivy                 (auto)     read-only   métriques DORA
                   étapes
```

| Phase   | Dans ce dépôt                                             | Fichier                             |
| ------- | --------------------------------------------------------- | ----------------------------------- |
| PLAN    | Issues et tableau GitHub Projects, une branche par tâche  | GitHub                              |
| CODE    | VS Code configuré, hooks Git (format + message de commit) | `.vscode/`, `.husky/`               |
| BUILD   | Build Vite, image Docker multi-étapes                     | `vite.config.ts`, `Dockerfile`      |
| TEST    | Formatage, lint, types, tests, test de fumée, scan Trivy  | `.github/workflows/ci.yml`          |
| RELEASE | Version sémantique, image publiée sur ghcr.io             | `.github/workflows/release.yml`     |
| DEPLOY  | Mise en ligne automatique à chaque push sur `main`        | `.github/workflows/deploy.yml`      |
| OPERATE | Conteneur non-root, lecture seule, healthcheck            | `compose.yaml`, `docker/nginx.conf` |
| MONITOR | Disponibilité toutes les 6 h, audit Lighthouse            | `.github/workflows/monitor.yml`     |

---

## 0. Prérequis (une seule fois)

- **VS Code**, **Git**, **Node.js 22** (`node -v`), **Docker Desktop** (`docker version`), un compte **GitHub**.
- Ouvrir le dossier dans VS Code, puis accepter « Installer les extensions recommandées » (Prettier, oxc, Vitest, Docker, GitHub Actions, GitLens).

```bash
npm ci          # installe exactement les versions du package-lock.json
npm run dev     # http://localhost:5173
```

Dans VS Code : `Ctrl+Shift+B` lance le build, `Ctrl+Shift+P` → « Tasks: Run Task » liste toutes les tâches (serveur, Docker, Compose).

---

## 1. PLAN — organiser le travail

1. Créez le dépôt GitHub **`mohamed-943.github.io`** (ce nom donne l’adresse `https://mohamed-943.github.io/`).
2. Onglet **Issues** : une issue par tâche, par exemple « Ajouter les captures de SENTINEL », « Publier le dépôt docmind-rag ».
3. Onglet **Projects** → nouveau tableau « Portfolio » (colonnes À faire / En cours / Fait) et rattachez-y les issues.
4. Règle de travail : **`main` = ce qui est en ligne**. On ne travaille jamais directement dessus :

```bash
git switch -c feat/captures-sentinel
# … modifications …
git commit -m "feat: ajoute les captures du tableau de bord SENTINEL"
git push -u origin feat/captures-sentinel
# puis « Compare & pull request » sur GitHub ; la CI tourne sur la PR ; on fusionne quand tout est vert
```

> **Protéger `main`** : Settings → Branches → Add rule → `main` → cocher « Require a pull request » et « Require status checks » (choisir _Qualité, tests et build_). Une PR rouge ne peut plus être fusionnée.

---

## 2. CODE — un poste de travail qui vous protège

- **Format automatique** à chaque sauvegarde (Prettier) et corrections du linter (oxlint).
- **Hook `pre-commit`** (`.husky/pre-commit`) : formate et vérifie les fichiers modifiés avant chaque commit.
- **Hook `commit-msg`** (`.husky/commit-msg`) : impose le format _Conventional Commits_ (`feat:`, `fix:`, `docs:`…). Essayez `git commit -m "modif"` : le commit est refusé, avec l’explication.

Les hooks s’installent tout seuls avec `npm ci` (script `prepare`). Tout le contenu du site est dans `src/data/` : voir [CONTENU.md](CONTENU.md).

---

## 3. BUILD — du code source à une image Docker

### Le build web

```bash
npm run build      # vérifie les types puis produit dist/ (HTML, JS, CSS optimisés)
npm run preview    # sert dist/ sur http://localhost:4173
```

### L’image Docker (cours, partie III)

Le `Dockerfile` utilise **4 étapes** :

| Étape     | Base                                      | Rôle                                                              |
| --------- | ----------------------------------------- | ----------------------------------------------------------------- |
| `deps`    | `node:22-alpine`                          | `npm ci` — couche en cache tant que `package*.json` ne change pas |
| `dev`     | `deps`                                    | serveur Vite pour le développement en conteneur                   |
| `build`   | `deps`                                    | `npm run build` → `/app/dist`                                     |
| `runtime` | `nginxinc/nginx-unprivileged:1.27-alpine` | ne contient **que** `dist/` + la config Nginx                     |

```bash
make image                         # = docker build --target runtime -t portfolio-mohamed:local .
docker images portfolio-mohamed    # comparez la taille avec node:22-alpine (~ 150 Mo) : Node n'est pas dans l'image finale
docker history portfolio-mohamed:local
make run                           # http://localhost:8080
```

À observer : relancez `make image` sans rien changer → toutes les étapes affichent `CACHED`. Modifiez un texte dans `src/data/profile.ts` → seules les étapes après `COPY . .` sont rejouées.

---

## 4. TEST — la CI comme filet de sécurité

En local, la même chose que la CI :

```bash
npm run check    # formatage + lint + types + tests
```

À chaque push, `.github/workflows/ci.yml` exécute deux jobs :

1. **Qualité, tests et build** : Prettier, oxlint, TypeScript, Vitest, build, et un **budget de poids** (le JS principal doit rester sous 600 Ko).
2. **Image Docker** : construit l’image, lance le conteneur, vérifie `/healthz`, la page d’accueil, une route React (`/projets/sentinel`) et la présence de l’en-tête de sécurité CSP, puis **Trivy** scanne l’image et échoue en cas de vulnérabilité critique ou haute corrigeable.

Les tests de `src/data/data.test.ts` vérifient le contenu : liens du schéma d’architecture, captures déclarées réellement présentes, CV téléchargeables, pas de certification en double.

---

## 5. RELEASE — publier une version

On numérote les versions en **SemVer** : `MAJEUR.MINEUR.CORRECTIF` (ex. `1.2.0` = nouvelles fonctionnalités sans rupture).

```bash
git switch main && git pull
git tag v1.1.0 -m "Captures des projets"
git push origin v1.1.0
```

`.github/workflows/release.yml` construit l’image et la publie sur **GitHub Container Registry** avec les tags `1.1.0`, `1.1` et `latest`, puis crée la _Release_ GitHub avec les notes générées depuis les commits. N’importe quelle machine avec Docker peut alors lancer le portfolio :

```bash
docker run -d -p 8080:8080 ghcr.io/mohamed-943/portfolio:1.1.0
```

---

## 6. DEPLOY — mise en ligne continue

Une seule configuration à faire sur GitHub : **Settings → Pages → Build and deployment → Source : GitHub Actions**.

Ensuite, chaque fusion sur `main` déclenche `.github/workflows/deploy.yml` : tests, build, publication sur GitHub Pages. Le pied de page du site affiche le commit en ligne : vous savez toujours quelle version les recruteurs voient.

| Variable (Settings → Secrets and variables → Actions → **Variables**) | Effet                                                     |
| --------------------------------------------------------------------- | --------------------------------------------------------- |
| `CUSTOM_DOMAIN` (ex. `mohamedtraore.dev`)                             | publie sur votre domaine (pensez au DNS)                  |
| `FORMSPREE_ID`                                                        | le formulaire de contact envoie sans ouvrir la messagerie |
| `SITE_URL`                                                            | adresse surveillée par `monitor.yml`                      |

> **Livraison continue ou déploiement continu ?** Ici c’est du _déploiement continu_ : rien n’attend un humain après la fusion. Pour passer en _livraison continue_, ajoutez une règle d’approbation à l’environnement `github-pages` (Settings → Environments).

---

## 7. OPERATE — exploiter le conteneur

```bash
make up        # docker compose up -d --build
docker compose ps                                               # STATUS doit afficher (healthy)
docker inspect --format '{{.State.Health.Status}}' portfolio-web
curl -I http://localhost:8080                                   # en-têtes de sécurité et de cache
make logs
make down
```

Ce que montre `compose.yaml` :

- **Healthcheck** sur `/healthz` (comme MariaDB dans l’atelier GLPI).
- **`read_only: true`** + `tmpfs: /tmp` : même compromis, personne ne peut écrire dans le conteneur.
- **Utilisateur non-root** (image `nginx-unprivileged`, port 8080) et `no-new-privileges`.
- **`restart: unless-stopped`** : le conteneur redémarre après un crash ou un redémarrage de Docker.

**Pourquoi pas de volume ici, alors que GLPI en avait besoin ?** Le portfolio est _sans état_ : tout est dans l’image, on peut supprimer et recréer le conteneur sans rien perdre. GLPI stocke des tickets dans MariaDB : sans volume, ils disparaissent. Le seul volume du projet est le _bind mount_ du service `dev`, qui reflète vos fichiers VS Code dans le conteneur :

```bash
make dev-docker    # Vite dans un conteneur, http://localhost:5173, rechargement à chaud
```

---

## 8. MONITOR — savoir avant les recruteurs

`.github/workflows/monitor.yml` tourne toutes les 6 heures (et à la demande depuis l’onglet Actions) :

- le site répond en **200** en moins de **3 s** ;
- les deux CV sont bien servis en PDF ;
- un audit **Lighthouse** mesure performance, accessibilité, bonnes pratiques et SEO (seuils dans `lighthouserc.json`).

En cas d’échec, GitHub vous envoie un e-mail.

### Mesurer vos métriques DORA

| Métrique                     | Où la lire                                                                      |
| ---------------------------- | ------------------------------------------------------------------------------- |
| Fréquence de déploiement     | Actions → _Déploiement GitHub Pages_ : nombre d’exécutions réussies par semaine |
| Délai de mise en production  | durée entre l’ouverture d’une PR et la fin du déploiement correspondant         |
| Taux d’échec des changements | déploiements suivis d’un `fix:` ou d’un `revert` / total des déploiements       |
| Temps de restauration        | durée entre une alerte de `monitor.yml` et le déploiement correctif             |

---

## Correspondance avec le cours

| Cours                                                                 | Ici                                                                               |
| --------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `docker run -p 8080:80 …`                                             | `make run` → `-p 8080:8080` (port non privilégié)                                 |
| Instructions `FROM`, `WORKDIR`, `COPY`, `RUN`, `ENV`, `EXPOSE`, `CMD` | toutes dans le `Dockerfile`, plus `ARG`, `LABEL`, `HEALTHCHECK`                   |
| Bonnes pratiques Dockerfile                                           | `.dockerignore`, ordre des couches pour le cache, image finale minimale, non-root |
| Volumes nommés / bind mounts                                          | service `dev` : bind mount `.:/app` + volume anonyme `node_modules`               |
| Réseau créé avec DNS interne                                          | Compose crée le réseau `portfolio_default` (`docker network ls`)                  |
| `compose.yaml` avec healthcheck (GLPI)                                | `compose.yaml`, service `web`                                                     |
| Intégration / livraison / déploiement continus (théorie)              | `ci.yml`, `release.yml`, `deploy.yml` (pratique)                                  |

---

## Défis pour progresser

1. **Port** : servez le site sur `9090` sans toucher au `Dockerfile` (indice : `compose.yaml`).
2. **CI rouge** : ajoutez un test qui échoue dans `data.test.ts`, poussez sur une branche, observez la PR bloquée, corrigez.
3. **Sécurité** : remplacez temporairement l’image finale par `nginx:1.18`, lancez la CI et lisez le rapport Trivy. Remettez la bonne image.
4. **Retour arrière** : cassez volontairement une page, déployez, puis `git revert <commit>` et mesurez votre _temps de restauration_.
5. **Taille** : comparez `docker images` avec et sans l’étape `runtime` (`--target build`). Expliquez la différence en une phrase.
6. **Cloud** (AWS Cloud Foundations) : lancez l’image publiée sur ghcr.io sur une instance EC2 `t2.micro` (`docker run -d -p 80:8080 …`), ouvrez le port 80 dans le groupe de sécurité, puis arrêtez l’instance.
7. **Bonus** : ajoutez un job qui vérifie que tous les liens externes du site répondent (indice : action `lycheeverse/lychee-action`).

---

## Dépannage

| Symptôme                                         | Cause probable                            | Réparation                                                                                |
| ------------------------------------------------ | ----------------------------------------- | ----------------------------------------------------------------------------------------- |
| `npm ci` échoue                                  | `package-lock.json` désynchronisé         | `npm install` puis commit du lock                                                         |
| Commit refusé                                    | message hors format Conventional Commits  | `git commit -m "fix: …"`                                                                  |
| `port is already allocated`                      | un autre conteneur ou Vite occupe le port | `docker ps`, `make down`, ou changer le port                                              |
| Page blanche sur GitHub Pages                    | mauvaise base d’URL                       | dépôt nommé `mohamed-943.github.io`, ou laisser `deploy.yml` calculer `VITE_BASE`         |
| `/projets/xxx` en 404 après rechargement (Pages) | `404.html` absent                         | il est créé par le build : vérifier `dist/404.html`                                       |
| Polices ou styles bloqués dans le conteneur      | politique CSP trop stricte                | lire la console du navigateur, ajuster `Content-Security-Policy` dans `docker/nginx.conf` |
| `unhealthy` dans `docker compose ps`             | Nginx ne démarre pas                      | `make logs`, puis `docker run --rm portfolio-mohamed:local nginx -t`                      |
| Trivy fait échouer la CI                         | vulnérabilité dans l’image de base        | mettre à jour le tag de base (Dependabot ouvre la PR chaque semaine)                      |

---

## Ce que vous pourrez écrire sur votre CV (une fois en place)

> Mis en place la chaîne CI/CD de mon portfolio avec GitHub Actions : tests automatisés, image Docker multi-étapes non-root, scan de vulnérabilités Trivy, déploiement continu sur GitHub Pages et surveillance planifiée.
