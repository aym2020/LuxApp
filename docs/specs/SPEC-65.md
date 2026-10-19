# SPEC 65 — Bienvenue chaleureuse et popup invité centrée

| Champ | Valeur |
|---|---|
| Priorité | P1 — première impression et cohérence graphique |
| Statut | **Implémentée sur `v2` — recette Android à confirmer** |
| Complète | SPEC 63 et 64 |
| Fichiers | `public/portail.js`, `public/style.css`, `tests/test_spec_63_portail.js` |

## Constats

- L'illustration « Moien ! / Bonjour ! » (pousse et bulles) paraissait pauvre, avec un grand vide entre elle et les boutons.
- Les boutons du portail (48 px, 14 px, arrondi 12 px) étaient plus petits que les accès de l'accueil (60 px, 17 px gras, arrondi 16 px).
- « Continuer sans compte » était repoussé tout en bas de l'écran.
- La confirmation invité occupait toute la largeur jusqu'au bas de l'écran (feuille), avec un ton d'avertissement (nuage barré, « Continuer sans compte ? »).

## Exigences

1. **Bienvenue** : remplacer l'illustration par trois atouts, avec les icônes et couleurs des accès de l'accueil :
   - or : « Leçons courtes — Une notion à la fois, à ton rythme » ;
   - vert : « Révisions au bon moment — Pour ne rien oublier » ;
   - bleu : « Examens blancs — Pour te préparer aux tests officiels » (pas de mention d'un seul niveau : l'app ira au-delà de A1).
2. Contenu centré verticalement sous la marque ; les actions suivent directement les atouts (plus de vide au milieu). Halo doré discret en haut de l'écran.
3. **Boutons du portail** au gabarit des accès de l'accueil : 60 px de haut, 1,05 rem gras, arrondi 16 px. « Continuer sans compte » reste un bouton texte (≥ 44 px), en `--couleur-texte-2`, juste sous les deux boutons.
4. **Popup invité** : carte centrée avec marges (24 px, 12 px sous 350 px de large), coins arrondis 24 px, largeur max 420 px, sans poignée.
5. Ton accueillant : pictogramme pousse verte, titre « C'est parti ! », texte « Tu peux commencer les leçons tout de suite, sans compte. », encadré « Bon à savoir : ta progression reste sur ce téléphone. Crée un compte quand tu veux pour la garder en sécurité et la retrouver partout. »
6. Actions : « Commencer sans compte » en or (le choix que la personne vient de faire), « Créer un compte » en secondaire (seulement si Firebase est disponible), « Retour » en texte.
7. Aucun changement de logique : connexion, mode invité, retour à la bienvenue à chaque lancement et progression locale restent ceux des SPEC 63 et 64.

## Recette

- [x] Atouts affichés, illustration et poignée supprimées, aucune mention « test A1 ».
- [x] Boutons à 60 px / arrondi 16 px, popup centrée (`align-items:center`, arrondi 24 px).
- [x] Sans défilement à 393 × 852, 360 × 740 et 320 × 650 (navigateur local, Firebase simulé).
- [ ] Recette visuelle sur Android réel.

## Implémentation

- `portail.js` : `portailFleur()` remplacée par `portailAtouts()` ; nouveau contenu de `portailAlerteHtml()` ; bloc `.pa-centre` sur la bienvenue.
- `style.css` : styles `.pa-atouts`, halo `.pa-bienvenue`, `.pa-bouton` au gabarit 60 px, `.pa-alerte` / `.pa-feuille` en carte centrée ; styles `.pa-scene`, `.pa-bulle`, `.pa-poignee` supprimés.
- `tests/test_spec_63_portail.js` : assertions SPEC 65 ajoutées.
