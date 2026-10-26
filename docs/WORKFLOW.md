# Publier une modification

La routine à suivre pour mettre en ligne n’importe quel changement, du plus petit (une faute de frappe) au plus gros. `main` est protégée : tout passe par une branche et une pull request, et la CI doit être verte avant la fusion.

```
branche ──► commit ──► push ──► PR ──► CI verte ──► Squash and merge ──► déploiement automatique ──► en ligne
```

Exemple utilisé ci-dessous : corriger une phrase dans `src/data/profile.ts`.

## 1. Partir d’un `main` à jour

```bash
git switch main
git pull
```

On travaille toujours sur la dernière version en ligne, ce qui évite les conflits.

## 2. Créer une branche

```bash
git switch -c fix/accroche-profil
```

| Préfixe  | Usage                                |
| -------- | ------------------------------------ |
| `fix/`   | correction                           |
| `feat/`  | nouveauté (section, projet, capture) |
| `docs/`  | documentation                        |
| `chore/` | outillage, configuration             |

## 3. Modifier, puis vérifier en local

```bash
npm run dev      # http://localhost:5173, puis Ctrl+C pour arrêter
npm run check    # formatage, lint, types et tests : la même chose que la CI
```

Si `npm run check` est rouge ici, la CI sera rouge sur GitHub. Pensez à **arrêter `npm run dev`** : sous Windows, un serveur Vite oublié verrouille des fichiers et fait échouer `npm ci` (`EPERM`).

## 4. Commit et push

```bash
git add src/data/profile.ts
git commit -m "fix: corrige l'accroche du profil"
git push -u origin fix/accroche-profil
```

- `git add` sur les **fichiers précis** plutôt que `git add .`, pour ne pas embarquer un fichier parasite.
- Les hooks Git formatent les fichiers et vérifient le format du message (_Conventional Commits_ : `fix:`, `feat:`, `docs:`, `chore:`…).

## 5. Pull request et fusion (sur GitHub)

1. Ouvrir le lien `pull/new/…` affiché par le push, puis **Create pull request**.
2. Attendre les **deux checks verts** (_Qualité, tests et build_ et _Image Docker, test de fumée et scan de sécurité_).
3. **Squash and merge**, puis **Delete branch**.

## 6. Vérifier la mise en ligne et nettoyer

1. **Actions → Déploiement GitHub Pages** passe au vert (environ 1 minute).
2. Recharger https://mohamed-943.github.io/ avec `Ctrl+F5` et vérifier la modification.
3. En local :

```bash
git switch main
git pull
git log --oneline -1                 # le commit de fusion doit apparaître
git branch -D fix/accroche-profil    # -D : nécessaire après un squash
```

Vérifier le `git log` **avant** de supprimer la branche locale.

## Version courte

```bash
git switch main
git pull
git switch -c fix/xxx
# … modifier …
npm run check
git add <fichiers>
git commit -m "fix: …"
git push -u origin fix/xxx
# GitHub : PR → checks verts → Squash and merge → Delete branch → vérifier Actions et le site
git switch main
git pull
git branch -D fix/xxx
```

## Publier une version (facultatif)

Le site est mis à jour à **chaque fusion** : un tag n’est pas nécessaire pour mettre en ligne. Une release sert à figer une version et à publier l’image Docker sur `ghcr.io`. On la fait quand plusieurs changements méritent un numéro.

```bash
git switch main
git pull
git tag -a v1.0.1 -m "Corrections du contenu"
git push origin v1.0.1
```

`release.yml` publie alors `ghcr.io/mohamed-943/portfolio` avec les tags `1.0.1`, `1.0` et `latest`, et crée la release GitHub avec des notes générées depuis les PR.

| Changement                               | Version (`MAJEUR.MINEUR.CORRECTIF`) |
| ---------------------------------------- | ----------------------------------- |
| correction de texte, de bug, d’étiquette | `1.0.1`                             |
| nouvelle section, captures de projets    | `1.1.0`                             |
| refonte complète du site                 | `2.0.0`                             |

## Annuler une modification en production

Si une fusion casse le site, on annule le commit fautif, en passant par une branche comme toujours :

```bash
git switch main
git pull
git switch -c revert/xxx
git revert <sha-du-commit>
git push -u origin revert/xxx
```

Puis PR et fusion. `git revert` crée un **nouveau commit** qui annule l’ancien, sans réécrire l’historique : c’est la méthode sûre sur une branche partagée. Pendant ce temps, si le déploiement a échoué, l’ancienne version reste en ligne.

## Pièges fréquents

| Symptôme                                          | Cause                                        | Solution                                                       |
| ------------------------------------------------- | -------------------------------------------- | -------------------------------------------------------------- |
| `npm ci` → `EPERM … unlink`                       | un `npm run dev` tourne encore               | l’arrêter (`Ctrl+C`, ou `Stop-Process -Id <pid>`)              |
| `npx` propose d’installer un paquet inattendu     | `node_modules` incomplet                     | répondre **non**, relancer `npm ci`                            |
| `(END)` ou `:` en bas du terminal                 | Git affiche le résultat dans le pager `less` | appuyer sur `q`                                                |
| `cannot rebase` / `would be overwritten`          | modifications non commitées                  | `git stash`, l’opération, puis `git stash pop`                 |
| `port is already allocated` (Docker)              | un conteneur occupe déjà le port             | `docker ps`, puis `docker stop <nom>`                          |
| fichier « modifié » alors que `git diff` est vide | fins de ligne                                | vérifier avec `git diff`, puis `git restore <fichier>`         |
| PR Dependabot « out-of-date »                     | `main` a avancé                              | commenter `@dependabot rebase` (pas le bouton _Update branch_) |
| push direct sur `main` refusé                     | protection de branche                        | normal : passer par une branche et une PR                      |
