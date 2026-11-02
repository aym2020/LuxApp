# Accueil Watfir — SPEC visuelle V4

**Référence visuelle** : mockup V4 de la conversation du 2 novembre 2026. **L'accueil V4 est désormais intégré sur `2.2` ; le mockup n'est pas une capture d'exécution.** La V3 est la base formelle ; V4 ajoute uniquement un moyen de changer de famille de niveaux. Le reste doit rester stable.

## 1. Inventaire de l'écran (haut → bas)

| Zone | Ce que fixe la maquette V4 | Règle de réalisation |
| --- | --- | --- |
| Header | Picto monument + deux filets rouge/cyan, mot « Watfir » en serif italique, « Lëtzebuergesch », commandes de niveau, mode invité/connexion, paramètres | Ne pas sacrifier les cibles tactiles ; **passer sur 2 lignes** à faible largeur |
| Switch | A1.1 rouge sélectionné, A1.2 bordé crème, chevron bordé crème | Deux voisins de famille seulement, aucune barre horizontale à 8 niveaux |
| Kicker | « LE LUXEMBOURGEOIS, PAS À PAS » | Contraste et chasse lisibles |
| Hero | « Moien! » crème, point exclamatif rouge, phrase de reprise, bandes horizontales cyan/rouge en courbe, tour beige et trois arches | Ensemble composé, illustration non photographique, pas de soleil |
| Progression | « TA PROGRESSION », 6 % A1.1, série 0 jours, trait vertical, barre très fine | **Valeurs réelles** de la couche progression ; exemples de la maquette jamais codés en dur |
| CTA | Carte crème, icône livre, titre « Continuer », leçon « Salutations et comment se présenter » sur deux lignes, détail « Mot caché · 28 questions restantes », chevron, coin bicolore discret | Leçon / exercice / compteur pilotés par l'état réel ; retour et focus stables |
| Accès | Quatre actions sous filet discret : S'entraîner, Examens, Erreurs, Jeux | Actions et destinations existantes, ne pas réinventer leur logique |
| Chemin | Lien texte « Voir mon chemin » + icône livre et flèche | Visuel secondaire, accessible, pas de double CTA |

Les 6 %, 0 jours, 28 questions et le titre de leçon illustrent une situation **fictive**. Le dernier état réellement sauvegardé a priorité.

## 2. Hiérarchie responsive

**Largeur utile cible :** 320 / 360 / 393 / 430 px, desktop recentré sur le shell existant (2.1 : 640/560/500 px selon SPEC 114). Aucune largeur n'autorise une perte fonctionnelle.

- **≥ 430px** : ligne principale compacte, si tous les éléments tiennent réellement, et hero à 2 zones visuelles avec la tour à droite.
- **360–429px** : logo et réglages sur la première ligne ; niveaux + connexion sur la seconde ; ajuster espace du hero sans écraser la typo « Moien! ».
- **320–359px / grandes polices** : header sur deux lignes, voire connexion sous le switch ; garder A1.1 et A1.2 avec chevron selon place, ou bouton `A1.1 ▾` comme repli documenté. Hero adaptable ; CTA reste atteignable (défilement autorisé plutôt que masquage).
- **Hauteur courte / clavier** : `100dvh` avec safe areas ; priorité aux CTA et au contenu ; pas de `overflow:hidden` bloquant l'accès si la hauteur disponible baisse. Ne pas forcer un « tout sans scroll » impossible sur 320×568 / texte 200 %.

Taille des cibles tactiles : **≥44×44 CSS px**, préférer 48×48. Conserver min 16px pour les inputs. Ne pas baser l'ergonomie sur la hauteur de la capture générée.

## 3. Switch de niveaux extensible (décision fonctionnelle V4)

### Vue compacte

Pour le niveau actif A1.1 : afficher **A1.1** (rouge), **A1.2** (outline) et bouton **chevron bas**. L'utilisateur peut changer directement entre les deux sous-niveaux de la famille. Après passage à A2.1 : afficher A2.1 et A2.2 (s'ils existent), pas A1.1/A1.2. Si une famille ne compte qu'un sous-niveau, afficher ce seul sous-niveau et le chevron.

### Bottom sheet

Toucher le chevron → feuille modale par le bas, fond noir, poignée et titre `Choisir un niveau`. Groupes A1, A2, B1, B2... alimentés par les **niveaux effectivement présents** dans les leçons via `listeNiveaux()`, pas une liste figée. Ne pas exposer de niveau sans contenu, sauf variante futur explicitement approuvée « À venir » non interactive.

Le niveau actif est visible par texte + forme (pas la couleur seule). Au toucher d'un niveau : `changerNiveau(n)` existant et fermeture de la feuille après mise à jour. La progression du nouveau niveau, les leçons, l'activité de reprise et les révisions/examens doivent correspondre à ce choix ; aucune donnée de l'ancien niveau n'est effacée.

### Fermeture / accessibilité

- Fermer par bouton `Fermer`, touche `Escape`, clic hors panneau et bouton Retour Android si pertinent ; maintenir le focus dans la modal, le restaurer au chevron après fermeture.
- `role="dialog"`, `aria-modal="true"`, `aria-labelledby` ; bouton chevron `aria-label="Choisir un niveau"`, `aria-expanded` dynamique.
- Empêcher le scroll de fond tant que la feuille est ouverte mais autoriser le scroll **interne** de la feuille si > 6 niveaux.
- Prévoir `env(safe-area-inset-bottom)`, inertie du backdrop, tailles de police 200 %, et navigation au clavier.
- Une option non disponible ne doit jamais modifier `niveauActif`, ni `localStorage`.

### Données / anti-régression

Dans le 2.1 existant, `listeNiveaux()` renvoie les niveaux, `changerNiveau()` modifie `niveauActif`, persiste `luxNiveau` et relance les vues. La 2.2 doit **réutiliser ces fonctions** (et vérifier la version GitHub au moment du développement) et ne pas renuméroter les `l.id`, qui indexent la progression. Éviter de créer une deuxième source de vérité côté bottom sheet.

## 4. CTA de reprise

- Toujours proposer un **vrai** prochain pas si un état le permet, avec destination issue des modules existants.
- Titre sur **deux lignes**, pas de `text-overflow:ellipsis` sur la notion pédagogique essentielle.
- Aucun texte « 28 questions restantes » si la vraie logique ne possède pas ce compteur exact ; employer alors un libellé existant et exact.
- En absence de reprise, afficher une action claire `Commencer une leçon` ou `Voir mon chemin`, pas de carte vide ou de métrique inventée.
- Bouton crème unique ; ne pas répéter une double bordure rouge/cyan.

## 5. Étages de déploiement (séparés)

1. Shell/habillage accueil uniquement : HTML/CSS + assets, sans toucher à l'état.
2. Switch de famille : logique UI et focus/Back, aucun changement au modèle de progression.
3. CTA/progression adaptés et testés avec profils vierges, anciens, complets, invités, offline.
4. Adaptation éventuelle du reste de l'app **écran par écran**, après validation explicite.

## 6. Risques concrets

- Sur 320px, header reproduit littéralement = chevauchement logo / A1.1 / connexion.
- Sur police 200 %, raccourcis 4×1 = textes qui se superposent : prévoir fallback 2×2.
- Après changement de niveau, dernière leçon affichée ou pourcentage encore de l'ancien niveau : invalide.
- Si une modal masque la navigation Android ou ne restitue pas le focus, accessibilité non conforme.
- Plus de soleil coupé ; toutes les extrémités du monument, des arches et des lignes restent dans le `viewBox`.
