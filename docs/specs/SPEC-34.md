# SPEC 34 — Système de vies lisible et missions à 10 répliques

| Champ | Valeur |
|---|---|
| Statut | **Implémentée — validation à confirmer** |
| Priorité | **P0** |
| Branche | `v2` |
| Périmètre | `public/mission.js`, `public/accueil.js`, `public/progress.js`, `public/niveau.js`, `public/chemin.js`, `public/parcours.js`, `public/index.html`, `public/style.css`, `data/lecons/` (scènes), `tools/valider-lecons.js`, tests |
| Origine | Spec « système de vies et intégration des missions à 10 répliques » du 18/10/2026 (reçue en même temps que la SPEC 33, d'où le numéro 34) |

## Décisions du 18/10/2026

- **Règle de réussite : SPEC 32 conservée** (au moins une vie à la fin = mission réussie, mission normale comme « Tente ta chance »). Les seuils 80 % / 90 % de la spec reçue ne sont pas réintroduits ; le texte du rappel des règles suit la SPEC 32.
- **Brouillons `data/missions/` relus et corrigés**, pas intégrés tels quels : chaque scène existante (titre, contexte, personnages, aides déjà relues) est **étendue à 10 réponses** en reprenant les bonnes répliques des brouillons. Aucune réplique n'exige un mot absent de la leçon ou des leçons précédentes (contrôle automatique), chaque réplique est rattachée à une unité du fil, dans l'ordre des unités.
- **Leçon 26** (pas de brouillon) : mission écrite à partir de ses unités. **Brouillons 18 et 19** : mis de côté tant que ces leçons n'existent pas.

## Exigences et implémentation

- **Rappel des règles** : à la toute 1re mission (mémorisé dans la progression, donc synchronisé : `progress.guide.vies`), panneau « Tu as 3 vies ! » (3 cœurs animés, règles en 3 phrases, bouton « C'est parti ! → ») ; la conversation ne démarre qu'à sa fermeture. Ensuite, un appui sur les cœurs rouvre le rappel (« Continuer la mission »), sans effet sur la partie.
- **Cœurs** : ligne dédiée sous l'en-tête, centrée, 24 px, compteur « n / 10 » dessous ; visibles clavier ouvert. Vie perdue : le cœur bat une fois puis passe du rouge au contour gris.
- **Missions** : les 24 leçons ont exactement **10 réponses à produire** (`mission.version: 2`). `valider-lecons` refuse une scène qui n'a pas 10 réponses, une version < 2 ou une unité du fil sans réponse.
- **Versions** : chaque version de scène a son score et sa réussite (`mission.score` pour la v1, `mission.scoreV2` / `mission.reussieV2` pour la v2). Un ancien résultat ne valide jamais la nouvelle scène (`missionReussie`), mais la leçon acquise grâce à lui reste acquise (`leconAcquiseParMission`) : progression, étoiles et unités préservées.
- Règles conservées : 3 vies, une seule vie par réplique, coquille gratuite, aide après erreur, révélation après deux essais, conversation finissable sans vie.

## Critères d'acceptation

- [x] 1re mission : rappel des règles avant la conversation ; missions suivantes : pas de rappel automatique.
- [x] Appui sur les cœurs : rappel des règles, partie inchangée.
- [x] Cœurs 24 px centrés, compteur « n / 10 ».
- [x] 1re erreur réelle = 1 vie ; 2e erreur sur la même réplique = aucune vie de plus ; coquille = aucune vie.
- [x] 10/10, 9/10, 8/10 réussies ; 7/10 avec trois erreurs = échec.
- [x] Chaque mission (24 leçons) : 10 réponses, toutes acceptées telles qu'écrites, bilan 10 / 10.
- [x] Ancien score : pas de validation automatique de la nouvelle scène ; leçon déjà acquise conservée.
- [ ] Recette Android / iOS (clavier, en-tête, animation).

## Tests

`tests/test_mission_vies.py` (rappel des règles, cœurs, table 10/9/8/7), `tests/test_missions_10.py` (nouveau : les 24 missions jouées), `tests/test_mission_validation.py` (versions), `valider-lecons` et tests de contenu (10 réponses). Suite critique verte.

## Points relevés dans les leçons (hors périmètre, non modifiés)

- Leçon 9 : « Franséisch **an** Lëtzebuergesch » (phrase de l'unité 1) devrait être « Franséisch **a** Lëtzebuergesch » (le n tombe devant L) ; « **Hien** schwätzt » (écriture) devrait être « **Hie** schwätzt » ; « Wat fir eng Sprooch schwätz**t** du? » à vérifier sur LOD (« du schwätz »).
- Leçon 13 : les aides de l'ancienne scène étaient décalées d'une réplique (corrigées dans la nouvelle scène).
- Leçon 10 : l'ancienne scène utilisait « Mäi Frënd » (possessifs vus en leçon 23) : retiré.
