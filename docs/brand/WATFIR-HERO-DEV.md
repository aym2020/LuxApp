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

Les images proviennent d'une illustration originale validée visuellement (turquoise, noir et orange). **Le précédent traitement automatique de l'ancienne photographie a été abandonné.** La version de production est le fond sans texte ; la référence avec typographie est uniquement un document graphique. Il s'agit d'une illustration d'ambiance, pas d'une photographie documentaire.

La référence aplatie sert uniquement à valider la direction graphique. **En production, aucune lettre du titre n'est incrustée dans le fond** : `MOIEN.` et le sous-titre sont générés par `public/watfir-dev.js`, stylisés par `public/watfir-dev.css`. Ils restent sélectionnables, accessibles et adaptatifs.

## Intégration

Le fichier `public/index.html` charge `watfir-dev.css` après les styles 2.1, et `watfir-dev.js` après `accueil-v21.js`. La nouvelle composition est limitée à l'accueil ; les exercices, le chemin et les cours conservent leur style.

Les couleurs sont des choix de **marque** ; les couleurs d'état pédagogiques (correct/incorrect) ne sont pas redéfinies à ce stade. Le nom Watfir reste un nom de travail en attendant la vérification de disponibilité juridique et commerciale.

## Validation des assets

```bash
python -m pip install pillow
python scripts/build_watfir_hero.py
node --test test/accueil-v21.test.cjs test/watfir-dev.test.cjs
```

Le script conservé sous ce nom **ne génère plus d'image** : il valide uniquement les WebP livrés. Le workflow `.github/workflows/build-watfir-hero.yml` exécute les tests sans jamais réécrire ni publier des images. Toute nouvelle illustration devra faire l'objet d'une revue visuelle avant remplacement.

## Vérifications encore nécessaires sur téléphone

- Chargement à 320, 360, 390 px, notamment la largeur du titre « MOIEN » ;
- Contraste du lettrage en recadrage et à 200 % de zoom ;
- Première visite, niveau déjà commencé, niveau terminé, compte invité et compte connecté ;
- Clic sur Commencer/Continuer, Réviser, Examens, Erreurs et Voir mon chemin ;
- Chargement en réseau mobile lent, cache et rafraîchissement après déploiement.

Cette expérimentation ne doit pas être fusionnée vers `v2` sans validation visuelle.
