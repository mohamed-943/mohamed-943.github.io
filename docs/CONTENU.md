# Modifier le contenu

Tout le texte du site vit dans `src/data/`. Les composants n’ont jamais besoin d’être touchés pour mettre à jour le contenu.

| Fichier                      | Contenu                                                            |
| ---------------------------- | ------------------------------------------------------------------ |
| `src/data/profile.ts`        | nom, accroche, disponibilité, contacts, formation, langues         |
| `src/data/projects.ts`       | les 6 études de cas, leurs schémas d’architecture, chiffres        |
| `src/data/experience.ts`     | stages                                                             |
| `src/data/skills.ts`         | compétences (`learning` = en cours d’apprentissage, en pointillés) |
| `src/data/certifications.ts` | certifications (`featured: true` = mises en avant)                 |

Après chaque modification : `npm run check`, puis commit et push. La CI vérifie la cohérence avant la mise en ligne.

## Ajouter des captures d’écran

1. Faites vos captures en **1600 × 1000 px** environ (format 16:10), sans données personnelles ni données client.
2. Convertissez en WebP (≈ 5 fois plus léger) :
   ```bash
   npx sharp-cli -i capture.png -o public/projects/sentinel/dashboard.webp -f webp -q 82
   ```
   ou, si vous avez ImageMagick : `magick capture.png -quality 82 public/projects/sentinel/dashboard.webp`
3. Déclarez-les dans `src/data/projects.ts`, sur le bon projet :
   ```ts
   screenshots: [
     { src: '/projects/sentinel/dashboard.webp', alt: 'Tableau de bord Flask : alertes par zone et courbes des capteurs' },
   ],
   ```
4. `npm test` vérifie que chaque fichier déclaré existe et a un texte alternatif.

Les captures s’affichent dans l’étude de cas, sous les résultats. La couverture animée reste en tête de page.

## Publier le lien vers le code d’un projet

Quand le dépôt GitHub du projet est public, passez `repoPublished: true` : le bouton « Voir le code » apparaît. Tant qu’il vaut `false`, le bouton est grisé (« Code bientôt public »), pour qu’un recruteur ne tombe jamais sur une page 404.

Pour Reputation Check, le champ `confidentiality` remplace le bouton par une mention : à garder tant qu’il n’y a pas d’accord écrit de l’entreprise.

## Changer la photo

Remplacez `public/img/mohamed.jpg` par une photo carrée de **480 × 480 px** minimum, visage centré (la photo actuelle est extraite de la bannière GitHub, en attendant la photo professionnelle).

## Ajouter un projet

Copiez un bloc existant dans `projects.ts`. Pour le schéma d’architecture, chaque nœud a une colonne (`col`, de gauche à droite) et une ligne (`row`, de haut en bas, décimales acceptées) ; `accent: true` met un nœud en ambre (l’étape décisive : alerte, score, validation humaine). Les arêtes sont des paires `['source', 'cible']`. La couverture animée (`cover`) doit être l’une des six existantes, ou une nouvelle à créer dans `src/components/covers/`.

## Mettre un lien de vérification sur une certification

Ajoutez `url: 'https://coursera.org/verify/…'` : le titre devient cliquable.
