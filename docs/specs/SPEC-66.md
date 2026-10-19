# SPEC 66 — Accueil interactif, audio, transitions, dialogues LuxApp et Retour Android

| Champ | Valeur |
|---|---|
| Priorité | P1 — fluidité et première impression |
| Statut | **Implémentée sur `v2` — recette Android / PWA à confirmer** |
| Remplace | Écran de bienvenue et popup invité des SPEC 63 à 65 |
| Fichiers | `public/portail.js`, `public/dialogue.js` (nouveau), `public/audio/moien.mp3` (nouveau), `public/app.js`, `public/navigation.js`, `public/examens.js`, `public/revision.js`, `public/style.css`, `public/index.html` |

## Décisions (validées par Clayton)

- **Popup invité supprimée** : « Commencer à apprendre » mène directement au tableau de bord, avec le message discret « Ta progression est enregistrée sur cet appareil. ». Les confirmations sont réservées aux actions qui le justifient.
- **Dialogues** : carte centrée (pas de bottom sheet), fond assombri et flouté, fondu + léger zoom (250 ms), croix de fermeture.
- **Boutons fusionnés** : « Commencer à apprendre » (or), « Créer un compte » (secondaire), « J'ai déjà un compte » (lien). Plus de « Continuer sans compte » en doublon sur la bienvenue.
- **Audio** : fichier officiel LOD `MOIEN2.mp3` (miroir `robertoentringer/lod-mp3-mirror`, données ouvertes LOD), enregistré dans `public/audio/moien.mp3`.

## Exigences

1. **Bienvenue** centrée : marque, « Le luxembourgeois, à ta portée. », « Quelques minutes par jour pour apprendre à parler luxembourgeois. », carte pédagogique, trois atouts (icône + intitulé : Leçons courtes, Révisions intelligentes, Examens blancs), actions. Entrée séquencée (≈ 320 ms par élément, décalage 70 ms), sans rebond ni mouvement permanent. Tient sans défilement de 320 × 650 à 393 × 852.
2. **Carte « Moien! »** : appui → retournement 3D (400 ms) vers « Bonjour ! » ; nouvel appui → retour. Appuis répétés pendant l'animation ignorés. Sans animation si `prefers-reduced-motion`.
3. **Audio** : bouton « Écouter la prononciation » sous la carte. Lecture uniquement après appui, jamais automatique ; une seule lecture à la fois ; ondes du haut-parleur animées pendant la lecture ; message « Audio indisponible » en cas d'échec. `jouerAudio(fichier, bouton)` est générique, prêt pour d'autres mots.
4. **Formulaires** connexion / inscription : flèche Retour visible ; glissement d'entrée (280 ms, sens inverse au retour) ; erreurs sous le champ concerné (e-mail vide ou invalide, mot de passe manquant ou < 6 caractères à l'inscription, compte existant, e-mail refusé) ; bouton en état de chargement et double envoi bloqué ; e-mail conservé lors du passage connexion ↔ inscription (« S'inscrire » / « Se connecter »).
5. **Retour Android** : formulaire ouvert → retour à la bienvenue ; dialogue ouvert → fermeture du seul dialogue ; bienvenue → comportement système. S'appuie sur la navigation centralisée existante (`pileNav`, garde unique `history.pushState`, `popstate`), sans fausses entrées.
6. **Dialogues LuxApp** (`confirmer()`) à la place de `confirm()` : réinitialiser toute la progression, réinitialiser une leçon, quitter un examen commencé, corriger une partie incomplète. Escape, croix, voile ou Retour = annuler ; focus rendu à l'élément d'origine.
7. **Messages brefs** (`notifier()`) à la place de `alert()` : critères de révision manquants, aucune question disponible, rien de fragile.
8. **Transitions d'écran** : arrivée du nouvel écran en 260 ms (glissement + fondu), sens inverse quand on revient en arrière. Animations `transform`/`opacity` uniquement, sans `fill forwards` (un `transform` maintenu décalerait les barres fixes des écrans). Coupées si `prefers-reduced-motion` et en mode test (`LUX_TESTS=1`).
9. Aucune donnée de progression, leçon ou algorithme modifié.

## Complément — prononciation des mots des leçons

- `tools/audio-lod.js new_lod-art.xml [--essai]` rapproche les cartes « mot caché » des articles LOD (export XML des articles, data.public.lu ; le fichier de 100 Mo n'est pas versionné) et télécharge les MP3 du miroir LOD.
- Un son n'est gardé que si le mot de la carte (sans article ni ponctuation) est exactement le mot LOD, si la traduction française de la carte correspond à un sens LOD, et si un seul article convient — ou plusieurs homographes de même prononciation (même API), en privilégiant le sens principal (ex. « Moien! » → `MOIEN2`, interjection « bonjour »).
- Résultat au 20/10/2026 : **372 mots** sur 782 cartes (`public/audio/lod/*.mp3`, ≈ 14 Mo ; table `public/audio/lod.json`). Non couverts : expressions de plusieurs mots (211), mots absents de LOD (63, ex. formes féminines, grands nombres), sens non reconnu automatiquement (68, ex. nombres écrits en chiffres), homographes de prononciations différentes (6).
- Écran « Nouveau mot » du mot caché : bouton « Écouter » quand un son validé existe, jamais de lecture automatique.
- Test : `tests/test_audio_lod.js`.

## Recette

- [x] Bienvenue : carte, retournement, double appui ignoré, aucun son au chargement, sans défilement à 320 × 650 et 393 × 852 (navigateur local, Firebase simulé).
- [x] Formulaires : erreurs sous les champs, e-mail gardé, chargement, Retour → bienvenue.
- [x] Invité : tableau de bord direct + message ; bienvenue à nouveau au lancement suivant.
- [x] Dialogue : affichage, Annuler, Retour du téléphone qui ne ferme que le dialogue (test_examens).
- [x] Suite critique verte.
- [ ] Recette Android réelle et PWA installée (lecture audio, clavier ouvert, Retour).
