# SPEC 72 — Finaliser la SPEC 71 : audios réels, couleurs, audit d'enrichissement

| Champ | Valeur |
|---|---|
| Priorité | P1 — audio et contenu |
| Statut | **Implémentée sur `v2`** — audios en attente du passage Termux ; enrichissement en attente de validation |
| Complète | SPEC 69, 70, 71 |
| Fichiers | `tools/termux-audio-lod.sh` (nouveau), `public/design-tokens.css`, `public/style.css`, `public/contexte.js`, `public/dialogue.js`, `tests/test_audio_lod.js`, `docs/audit-enrichissement-lecons-1-3.md` (nouveau), `PLAYBOOK.md` |

## 1. Audios réels (procédure Termux)

`lod.lu` est refusé par le proxy de l'environnement de Claude, mais accessible depuis le téléphone (Termux).

- Première fois : `pkg install -y git nodejs gh && gh auth login`
- Ensuite, une seule commande :
  `curl -sSfL https://raw.githubusercontent.com/aym2020/LuxApp/v2/tools/termux-audio-lod.sh | bash`
- Le script : clone ou met à jour `~/LuxApp` depuis `v2`, met de côté toute modification locale (`git stash`, rien n'est perdu),
  repart de `v2` sur la branche **`audio-phrases`**, lance `node tools/audio-lod.js` (seulement les sons manquants, contrôle MP3 / M4A),
  `node tests/test_audio_lod.js` (arrêt sans envoi en cas d'échec), `node tools/lod/audit-audio.js`, puis pousse `public/audio` et le rapport
  sur `audio-phrases`. Jamais sur `v2` ni `main`. Aucune manipulation de JSON à la main.
- Claude vérifie la branche, puis fusionne les fichiers audio dans `v2`.
- Cible : 26 phrases exactes + 62 phrases contextuelles (88 enregistrements, quelques doublons). Pas de téléchargement massif des 57 360 exemples.
- Testé de bout en bout dans l'environnement de Claude sur un clone local (lod.lu bloqué : modification locale mise de côté, branche créée, contrôles passés, rien envoyé).

## 2. Couleurs (dernière maquette validée)

| Rôle | Couleur |
|---|---|
| Son exact du mot ou de la phrase | or (`--couleur-action`) |
| Son dans une phrase (bouton, titre de bulle, lien, écran d'exemples) | **gris sable** `--couleur-audio-contexte: #c9bc9f` (+ `-fond`, `-bord`, `-voile`) |
| Expression étudiée surlignée (bulle, écran d'exemples) | **doré** (`--couleur-action`) |
| Reste de la phrase | **blanc cassé** (`--couleur-texte`) |

Le vert menthe est retiré de tous les composants audio (test `test_audio_lod.js`).

## 3. Audit d'enrichissement — leçons 1 à 3

`docs/audit-enrichissement-lecons-1-3.md` : 20 phrases LOD vérifiées mot pour mot dans l'index (19 en A1, 1 en A2), avec traduction,
pour le cours et le lexique ; remplacements possibles dans les exercices et missions ; couverture avant / après.

- Constat : le LOD n'a presque aucune phrase « de manuel » (« Dat ass e Stull. », « D'Buch ass blo. »). Les exercices reposent sur ces structures :
  **les garder**, et gagner l'audio par des exemples LOD dans le cours et le lexique.
- Gain : leçon 1 24,3 % → 34,6 % ; leçon 2 57,1 % → 59,2 % ; leçon 3 35,9 % → 41,4 %.
- Orthographe à valider : « wann ech gelift » → **« wannechgelift »** (graphie du LOD, `WANNECHGELIFT1`), leçons 1 et 25.
- Aucune leçon modifiée.

## Recette

- [x] `tests/test_audio_lod.js` : gris sable, doré, blanc cassé, plus de vert menthe dans les composants audio.
- [x] Rendu vérifié au format téléphone (bulle, écran d'exemples).
- [x] Script Termux testé sur un clone local (sans envoi).
- [ ] Passage Termux de Clayton → branche `audio-phrases` → fusion dans `v2` par Claude.
- [ ] Écoute sur Android : bulle, exemples, Retour.
- [ ] Validation de l'audit des leçons 1 à 3 (et de « wannechgelift »).
