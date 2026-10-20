# SPEC 71 — Prononciation en contexte : bulle et écran d'exemples

| Champ | Valeur |
|---|---|
| Priorité | P1 — audio |
| Statut | **Implémentée sur `v2`** — s'active quand les phrases LOD sont téléchargées (accès à `lod.lu`) |
| Complète | SPEC 70 (remplace l'affichage en ligne de la phrase) |
| Référence | maquettes `LuxApp_SPEC71_maquettes.html` (Cours, Lexique, Exemples) |
| Fichiers | `public/contexte.js` (nouveau), `public/dialogue.js`, `public/app.js`, `public/navigation.js`, `public/index.html`, `public/style.css`, `tests/test_contexte_audio.py`, `tests/test_audio_lod.js`, `tools/critique.sh` |

## Principe

Moins d'interface, plus d'apprentissage : aucune ligne du cours ne change de hauteur, les exemples ne s'affichent que si l'utilisateur les ouvre.

## 1. Bouton menthe → bulle flottante

- Or : enregistrement du mot exact (inchangé). Menthe : l'expression dite dans une phrase LOD.
- Au clic : la phrase est jouée et une **bulle** flotte sous le bouton (au-dessus s'il n'y a pas la place), flèche vers le bouton :
  titre « Prononciation en contexte », phrase LOD avec l'expression en menthe, traduction française,
  pied « La phrase entière est prononcée » et « Fermer × ».
- Fermeture : « Fermer », appui à côté, second appui sur le bouton (arrête aussi le son), Échap, **Retour du téléphone**.
- La bulle suit son bouton quand la page défile (ou quand la barre d'adresse du téléphone bouge) et se ferme si le bouton sort de l'écran.
- Accessibilité : `aria-expanded` sur le bouton, bulle `role="dialog"`, nom accessible du bouton avec la phrase entière.
- S'applique partout où le bouton existe (cours, lexique, corrections, mot caché…), comme le bouton or (SPEC 68).

## 2. Exemples : un écran dédié

- En bas d'un bloc de vocabulaire du cours (onglet et panneau Cours) : lien menthe « N exemples en contexte · Écouter des phrases complètes du LOD », **seulement** s'il existe au moins un son validé et téléchargé pour les mots du bloc.
- Il ouvre un écran plein écran : en-tête « Leçon N · Exemples » + titre de la leçon, nom du bloc, « Les mots en situation »,
  une carte par phrase : « Exemple 01 », pastille « Dans une phrase » (menthe) ou « Phrase exacte » (or), phrase LOD (expression en menthe), traduction, bouton « Écouter la phrase ».
- Jamais de longue liste au milieu du cours. Retour (flèche, Échap, Retour du téléphone) ramène au cours, toujours ouvert.

## 3. Hors périmètre

- Lien « Voir les exemples de cette leçon » du lexique (maquette) : le lexique de LuxApp réunit toutes les leçons ; ses mots ont déjà le bouton or ou menthe avec la bulle.
- Règles, exercices et autres sections du cours : inchangés.

## Recette

- [x] `tests/test_contexte_audio.py` (suite critique) : bulle sans changement de hauteur du cours, expression surlignée, traduction ; fermeture par « Fermer » et Retour ; lien avec le bon nombre, écran d'exemples (pastilles), fermé par Retour et Échap, cours toujours ouvert.
- [x] `tests/test_audio_lod.js` : surlignage (casse, échappement), exemples d'un bloc (contexte puis exact, rien sans son), pas de lien sans exemple, ordre des scripts, Retour.
- [x] Rendu vérifié au format téléphone (bulle, écran d'exemples).
- [ ] Sur Android après téléchargement des phrases LOD : son, bulle, Retour.
