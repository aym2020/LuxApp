# Watfir — hero Pop Editorial (branche dev)

## Périmètre

Cette expérimentation est volontairement confinée à `dev`. Aucun fichier de `v2`, `2.1` ou `main` n'a été modifié.

L'accueil historique (`accueil.js`, `accueil-v21.js`) conserve le calcul des leçons, la reprise, la progression, les niveaux A1.1/A1.2, les accès de révision, l'authentification et les réglages.

## Images

| Asset | Résolution | Utilisation |
| --- | --- | --- |
| `public/art/watfir-hero-background-fhd.webp` | 1920×1080 | Fond sur écrans haute densité |
| `public/art/watfir-hero-background-mobile.webp` | 960×540 | Fond mobile optimisé |
| `docs/brand/watfir-hero-reference-fhd.webp` | 1920×1080 | Référence aplatie avec « MOIEN » et « Le luxembourgeois autrement. » |

Les images sont générées de manière déterministe par `scripts/build_watfir_hero.py`, à partir du visuel texte-libre déjà conservé dans `public/art/hero-luxapp-fhd.webp`. La transformation associe turquoise `#08D9BD`, noir encre `#101110` et orange `#FF6924` dans un traitement d'affiche à aplats. Il s'agit d'une image créative stylisée, pas d'une photographie documentaire.

La référence aplatie sert uniquement à valider la direction graphique. **En production, aucune lettre du titre n'est incrustée dans le fond** : `MOIEN.` et le sous-titre sont générés par `public/watfir-dev.js`, stylisés par `public/watfir-dev.css`. Ils restent sélectionnables, accessibles et adaptatifs.

## Intégration

Le fichier `public/index.html` charge `watfir-dev.css` après les styles 2.1, et `watfir-dev.js` après `accueil-v21.js`. La nouvelle composition est limitée à l'accueil ; les exercices, le chemin et les cours conservent leur style.

Les couleurs sont des choix de **marque** ; les couleurs d'état pédagogiques (correct/incorrect) ne sont pas redéfinies à ce stade. Le nom Watfir reste un nom de travail en attendant la vérification de disponibilité juridique et commerciale.

## Générer ou modifier les assets

```bash
python -m pip install pillow numpy
python scripts/build_watfir_hero.py
node --test test/accueil-v21.test.cjs test/watfir-dev.test.cjs
```

Le workflow `.github/workflows/build-watfir-hero.yml` exécute ces étapes puis commit automatiquement les trois WebP **sur dev seulement**. Il vérifie les résolutions, le format et les plafonds de poids avant publication.

## Vérifications encore nécessaires sur téléphone

- Chargement à 320, 360, 390 px, notamment la largeur du titre « MOIEN » ;
- Contraste du lettrage en recadrage et à 200 % de zoom ;
- Première visite, niveau déjà commencé, niveau terminé, compte invité et compte connecté ;
- Clic sur Commencer/Continuer, Réviser, Examens, Erreurs et Voir mon chemin ;
- Chargement en réseau mobile lent, cache et rafraîchissement après déploiement.

Cette expérimentation ne doit pas être fusionnée vers `v2` sans validation visuelle.
