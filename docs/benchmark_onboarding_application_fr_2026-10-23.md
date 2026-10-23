# Benchmark UX — Rétro-ingénierie visuelle d'un onboarding d'application éducative

**Projet destinataire :** LuxApp / Luxo — apprentissage du luxembourgeois pour francophones  
**Date de l'observation :** 23 octobre 2026  
**Corpus :** 20 captures d'écran Android fournies en deux séries ; fichiers 54135.jpg à 54173.jpg (noms impairs successifs). La première série est documentée aux sections 1–10 et annexes A–F ; la deuxième aux annexes G–J.  
**Nature du document :** relevé factuel, analyse du parcours observable, hypothèses explicitement signalées ; **aucune spécification de développement validée**  
**Dépôt de référence :** aym2020/LuxApp ; version initiale sur main, édition enrichie destinée à 2.1 ; PLAYBOOK.md, AGENTS.md, charte UI 2.1, design tokens et frontend de 2.1 consultés  
**Périmètre :** accueil, onboarding/personnalisation, création apparente du parcours, bénéfices projetés et offre premium observés uniquement. Ni les exercices complets ni l'implémentation/backend ne sont visibles.

## 0. Convention de preuve

- **[VU]** : présent à l'écran ou déductible directement de la succession des captures, sans spéculer sur son implémentation.
- **[INFÉRENCE]** : fonction ou effet UX probable, qui demande confirmation par manipulation de l'application.
- **[INCONNU]** : comportement, donnée, implémentation ou mesure impossible à établir par des images statiques.
- Les intitulés, valeurs, statistiques et messages cités sont **ceux de l'application observée**, pas des faits audités.
- Les captures ont une résolution enregistrée de **709 × 1536 pixels** et montrent un téléphone Android Samsung en portrait. Les dimensions ci-dessous se rapportent aux images en pixels, **pas** à des unités CSS ou dp (densité de l'écran inconnue).
- Les numéros d'écrans ci-dessous sont ceux du corpus, **pas** les vrais numéros des étapes internes de l'application.
- Les captures ne sont pas stockées dans le dépôt avec ce document : leurs noms sont des références au matériel fourni dans la conversation.

## 1. Vue d'ensemble : proposition de valeur, progression et logique d'engagement

**[VU]** L'application se présente comme une expérience de lutte ludique contre les fautes de français. Avant de montrer un exercice, elle fait passer l'utilisateur par une séquence de présentation et de personnalisation :

1. promesse initiale et crédibilité chiffrée ;
2. présentation d'un personnage-guide ;
3. collecte d'une tranche d'âge ;
4. collecte de la motivation ;
5. message chiffré rassurant sur l'apprentissage ludique ;
6. choix d'un pseudo ;
7. choix d'un avatar lié à une personnalité culturelle ;
8. choix d'un pays ;
9. choix d'une région à l'intérieur de ce pays ;
10. confirmation de l'appartenance à une équipe régionale avec statistique hebdomadaire.

**[INFÉRENCE]** L'enchaînement construit de l'engagement avant la première séance : « je découvre » → « cela me concerne » → « je me nomme » → « je me représente » → « j'appartiens à une équipe » → « mon activité peut faire gagner cette équipe ». Cette interprétation explique la cohérence du parcours, mais ne prouve pas un effet sur les conversions ou la rétention.

**[VU]** Les captures sautent au moins un état du parcours : on passe visuellement d'une première étape mise en évidence à une troisième. Il ne faut donc pas considérer les dix captures comme la totalité de l'onboarding.

### 1.1 Inventaire rapide

| Capture | Fichier | Écran et action | Ce qui est distinctif |
|---|---|---|---|
| 01 | 54135.jpg | Écran d'accueil, « Commencer » | Promesse forte, mascotte qui dépasse d'un panneau, preuve sociale, liens compte/code/CGU |
| 02 | 54137.jpg | Présentation de Molière/Momo, « C'est parti » | Mascotte souriante, relation de compagnon, début du compteur de progression |
| 03 | 54139.jpg | Tranche d'âge, « Continuer » | Six groupes, sélection verte 25–34 ans |
| 04 | 54141.jpg | Motivation, « Continuer » | Cinq objectifs, sélection verte « Par amour du français » |
| 05 | 54143.jpg | Réassurance « 92 % », « J'ai compris » | Pause narrative après une réponse, chiffre central, carte-argument |
| 06 | 54145.jpg | Saisie du pseudo, « Valider » | Champ libre, clavier Android ouvert, CTA conservé au-dessus du clavier |
| 07 | 54147.jpg | Choix d'avatar, « Valider » | Portraits de personnalités, avatar sélectionné cerclé, courte biographie |
| 08 | 54149.jpg | Choix du pays | Prédétection « United States », liste de pays, promesse de batailles |
| 09 | 54151.jpg | Choix de la région française | Navigation hiérarchique pays → région, grande liste défilante |
| 10 | 54153.jpg | Confirmation « Grand Est », « Continuer » | Drapeau, 3 116 joueurs hebdomadaires annoncés, invitation à faire gagner la région |

## 2. Relevé détaillé, écran par écran

### 2.1 Écran 01 — Accueil et proposition de valeur (54135.jpg)

**Contenu et microcopy [VU]**

- Accroche sur trois lignes, centrée, grande typographie blanche **avec empattements** : « Rejoins la / bataille contre / les fautes ».
- Partie haute sur fond **bleu moyen**, différente du bleu presque noir des écrans suivants.
- Illustration centrale : un petit personnage aux cheveux bleu foncé bouclés, sourcils épais, moustache, regard inquiet, agrippé à une séparation horizontale ; la tête et les mains émergent visuellement au-dessus d'un bloc sombre. La composition crée de la profondeur et de la curiosité.
- Bandeau de crédibilité au milieu, sur fond bleu très sombre : grandes branches de laurier blanches gauche/droite, « +900 000 », « utilisateurs écrivent », puis « avec confiance » en gras.
- Gros bouton vert presque pleine largeur : **« Commencer → »**, texte blanc large et gras, ombre/bord inférieur vert foncé donnant du relief.
- Deux actions secondaires sous le CTA : **« J'ai déjà un compte »** (souligné) et **« J'ai un code »** (plus petit, souligné).
- Mention en bas : en cliquant sur « Commencer », reconnaissance de la lecture/compréhension des **conditions générales d'utilisation** et de la **politique de confidentialité**, présentées comme liens soulignés.

**Composition [VU]**

- Pas de barre de progression sur cette page ; introduction indépendante de la séquence de questions.
- Page divisée en deux grandes zones chromatiques, avec point d'articulation au niveau du personnage.
- Hiérarchie : promesse → mascotte → preuve sociale → bouton principal → alternatives → texte légal.
- Le texte légal reste visiblement présent, non masqué derrière le bouton ni la navigation Android.
- Le bouton d'entrée est plus haut que les boutons en pied de page des autres captures, car les liens secondaires et les mentions légales suivent.
- Marges latérales généreuses, bouton et composition presque symétriques.

**Fonction plausible [INFÉRENCE]**

- Le message « bataille » pose d'emblée le thème du jeu ; les « +900 000 » jouent un rôle de preuve sociale.
- « J'ai déjà un compte » est une sortie explicite vers l'authentification, distincte du parcours nouveau venu.
- « J'ai un code » peut désigner un mécanisme d'invitation, de licence ou de promotion, mais on ne peut pas déterminer lequel.

**Limites [INCONNU]**

- Le nombre annoncé de 900 000 utilisateurs n'est pas vérifiable sur la capture ; période, périmètre et méthodologie absents.
- On ne voit pas ce que déclenchent précisément la connexion, le code ou les liens légaux.

### 2.2 Écran 02 — Introduction du compagnon (54137.jpg)

**Contenu [VU]**

- Fond bleu nuit uniforme.
- En haut à gauche : flèche de retour turquoise clair.
- En haut : barre de **13 indicateurs blancs** relevés sur cette capture, sous forme de ronds ; le premier élément actif est un ovale allongé.
- Grande illustration centrale d'un personnage stylisé : cheveux bleus, moustache, barbichette, sourire avec dents visibles, chemise turquoise pâle, col blanc ; il tient une plume dans une main et fait le signe V avec deux doigts de l'autre.
- Gros titre sans empattements : **« Bienvenue ! »**
- Présentation, sur plusieurs lignes : « Je suis Molière, mais on m'appelle aussi Momo. Je serai à tes côtés pour combattre les fautes les plus difficiles. »
- Bouton vert en bas : **« C'est parti → »**.

**Mécanique UX [VU / INFÉRENCE]**

- Le guide reçoit **un nom officiel et un surnom familier**, ce qui transforme une simple mascotte décorative en personnage de relation.
- Le « je » à la première personne et le « à tes côtés » cadrent l'application comme un accompagnement.
- L'illustration occupe beaucoup d'espace ; peu de texte, aucune tâche complexe. L'entrée dans l'onboarding est intentionnellement douce.
- Le CTA reste très bas, séparé de la description : l'étape se valide par un geste unique.
- La flèche retour rend l'avancée visuellement réversible ; son comportement exact n'est pas testé.

**Point de détail** : la première capture montre le même univers graphique et probablement le même compagnon en version inquiète ; ici, il est joyeux et actif. **[INFÉRENCE]** Une même figure joue plusieurs émotions dans le parcours.

### 2.3 Écran 03 — Tranche d'âge (54139.jpg)

**Contenu [VU]**

- Barre de progression avec le **troisième** repère allongé ; les autres restent des ronds blancs.
- Titre centré : **« Quelle est ta tranche d'âge ? »**
- Sous-titre centré : « Pour adapter la difficulté et le vocabulaire à ton profil. »
- Six propositions, chacune dans un grand rectangle bleu-gris aux coins très arrondis :
  1. « Moins de 13 ans »
  2. « 13-17 ans »
  3. « 18-24 ans »
  4. « 25-34 ans »
  5. « 35-54 ans »
  6. « 55 ans et plus »
- « **25-34 ans** » est sélectionné et devient vert vif.
- CTA en bas : **« Continuer »** sans flèche visible.
- La dernière carte est partiellement proche de la limite inférieure de la zone de contenu, avant le pied de page réservé au CTA.

**Schéma d'interaction [INFÉRENCE]**

- Choix unique exclusif : une option active à la fois, puis validation par « Continuer ».
- Séparation entre sélection et validation : une mauvaise pression sur un groupe ne déclenche pas immédiatement l'étape suivante.
- L'explication donne une raison pratique à la demande de donnée personnelle : personnaliser difficulté et vocabulaire.

**Points de vérification [INCONNU]**

- Aucune preuve que l'âge modifie réellement un exercice ou une recommandation.
- On ne voit pas d'état initial, d'interdiction de continuer sans choix, ni de traitement particulier des mineurs.
- L'âge demandé est une **fourchette**, non une date de naissance.

### 2.4 Écran 04 — Motivation déclarée (54141.jpg)

**Contenu [VU]**

- Quatrième repère actif de la barre de progression.
- Titre : **« Pourquoi es-tu ici ? »**
- Cinq cartes verticales :
  1. « Pour le travail »
  2. « Préparation d'examens »
  3. « Pour mes enfants »
  4. « Par amour du français »
  5. « Pour mes élèves (prof) »
- L'option « **Par amour du français** » est sélectionnée en vert.
- Bouton **« Continuer »** fixé visuellement près du bas.
- Vaste espace vertical sous la liste : les questions ne cherchent pas à remplir artificiellement toute la hauteur du téléphone.

**Mécanique UX [VU / INFÉRENCE]**

- Les choix mélangent motivations utilitaires (travail, examens), contexte familial, intérêt personnel et profession d'enseignant.
- Le discours est au tutoiement ; les réponses sont formulées à la première personne pour être immédiatement appropriées.
- L'écran donne l'impression de construire une trajectoire adaptée, sans exposer encore le catalogue d'exercices.
- Le choix est unique à l'écran ; aucune option « autre », aucun champ texte et aucun bouton « passer » visibles.

**Non établi [INCONNU]** : cette motivation peut ensuite servir à personnaliser les contenus ou uniquement à segmenter des profils ; impossible de trancher sans observation du produit.

### 2.5 Écran 05 — Pause de réassurance à 92 % (54143.jpg)

**Contenu [VU]**

- La barre conserve le **quatrième repère actif**, comme sur l'écran de motivation précédent. Cet écran semble donc inséré dans le même jalon de progression.
- Énorme valeur centrale : **« 92% »**.
- Sous-titre : « des utilisateurs trouvent l'apprentissage ludique ».
- Encadré rectangulaire bleu, coins arrondis et bordure plus claire, avec petite flèche turquoise pointant à droite : « Apprendre le français peut être un plaisir quotidien avec la bonne méthode ».
- Bouton en bas : **« J'ai compris »**.
- Aucun champ, aucune option à choisir, aucune image de personnage.

**Logique probable [INFÉRENCE]**

- L'application intercale une **récompense narrative / réassurance** entre deux opérations de personnalisation.
- L'utilisateur vient d'exprimer une motivation, puis lit un chiffre qui confirme qu'apprendre peut être plaisant : continuité persuasive plutôt qu'écran formulaire.
- Le bouton « J'ai compris » marque l'adhésion au message, contrairement aux « Continuer » des écrans purement fonctionnels.

**Réserve [INCONNU]**

- Le 92 % est un chiffre marketing sans source, dénominateur, question d'enquête ni période visibles. Ne pas l'interpréter comme donnée indépendante.
- L'encadré ressemble à un élément cliquable (chevron), mais aucune preuve de clic, dépliage ou navigation.

### 2.6 Écran 06 — Choix du pseudo et gestion du clavier Android (54145.jpg)

**Contenu [VU]**

- Cinquième repère actif.
- Titre : **« Choisis ton nom »**.
- Sous-titre : « Un pseudo pour personnaliser ton expérience. »
- Un seul grand champ de saisie sur fond bleu-gris foncé, texte blanc de grande taille, cadre clair et curseur turquoise.
- Une chaîne libre est saisie ; l'exemple fourni contient un terme offensant. La capture établit qu'il est **possible de le saisir**, pas qu'il est validé ou accepté par un contrôle serveur.
- Bouton **« Valider »** vert juste sous le champ.
- Clavier Samsung **AZERTY rose** ouvert ; rangée de chiffres, barre de suggestions, indicateur « FR · EN », touche validation en bas à droite.
- L'interface remonte pour que titre, sous-titre, champ et bouton « Valider » restent visibles au-dessus du clavier.
- La barre de navigation Android apparaît sous le clavier ; le système prend une grande partie de la hauteur.

**Enseignements d'ergonomie [VU / INFÉRENCE]**

- Le clavier n'obstrue pas le contrôle principal ; la mise en page réagit à la zone disponible.
- Le champ utilise une taille d'écriture importante, cohérente avec les cartes de choix : pas de transition brutale vers un formulaire de petite taille.
- Un seul champ par écran réduit la charge cognitive.
- Séparer « nom/pseudo » de « compte/email » diminue le sentiment d'inscription administrative.

**Tests nécessaires [INCONNU]**

- Nombre maximal de caractères, espaces/Unicode/emoji, validation d'un pseudo vide ou dupliqué.
- Modération des insultes et noms haineux, sécurité d'affichage/échappement HTML, éventuelle visibilité publique du pseudo dans les classements.
- Comportement de la touche « valider » du clavier ; déplacement automatique du focus ; sauvegarde lors du retour.
- Gestion des écrans plus petits, de l'agrandissement des caractères et des claviers tiers.

### 2.7 Écran 07 — Choix d'avatar culturel avec biographie (54147.jpg)

**Contenu [VU]**

- Sixième repère actif.
- Titre centré **avec empattements** : « Choisis ton avatar ».
- Grille visuelle à **trois colonnes** de portraits presque circulaires sur un **fond rouge** : style illustration peinte/éditoriale plutôt que photographie neutre.
- Premier rang :
  - **Simone de Beauvoir**
  - **Jacques Brel**
  - **Albert Camus**
- Deuxième rang :
  - **Alexandre Dumas** (**sélectionné**)
  - **Victor Hugo**
  - **George Sand**
- Début d'un troisième rang visible, avec au moins deux autres portraits **partiellement masqués** ; leurs noms ne sont pas lisibles sur la capture et ne doivent pas être inventés.
- Le portrait Alexandre Dumas est entouré d'une **bordure circulaire épaisse bleu/turquoise clair** qui signale la sélection, en plus de son nom.
- Sous la grille, un texte explicatif lié au choix sélectionné : « Alexandre Dumas était un écrivain français célèbre pour ses romans d'aventures tels que "Les Trois Mousquetaires" et "Le Comte de Monte-Cristo". »
- Gros bouton vert « Valider » en bas.
- La place réservée à la description et au CTA réduit la place visible pour le reste de la grille : le troisième rang se retrouve partiellement hors cadre.

**Mécanique UX [VU / INFÉRENCE]**

- L'avatar est **nommé** : ce n'est pas uniquement un dessin personnalisable, mais un personnage associé à une référence culturelle.
- Le changement de sélection semble modifier la biographie (un seul texte visible pour Dumas) : **probable mais non testé**.
- Le cercle turquoise introduit un marqueur distinct de la sélection verte utilisée pour les réponses textuelles.
- Mélange intéressant de figures intellectuelles, littéraires et artistiques : le choix semble conçu pour donner une identité culturelle plutôt qu'un simple avatar cartoon.
- Le prénom/noms des auteurs s'affichent sur une ou deux lignes, selon leur longueur.
- L'étape demande un engagement identitaire : l'utilisateur **choisit qui le représente**, plutôt que de choisir une couleur neutre.

**Limites [INCONNU]**

- On ne sait pas si ces avatars sont des images locales, des ressources distantes, des portraits uniques ou des variantes déverrouillables.
- Aucun mécanisme de déblocage, rareté ou personnalisation détaillée visible.
- Aucune preuve que le choix change les exercices.
- Les conditions de droits d'utilisation des illustrations ne peuvent être déterminées à partir des images.
- Le CTA et la biographie entrent potentiellement en concurrence avec la capacité à faire défiler la grille sur des petits écrans.

### 2.8 Écran 08 — Choix du pays / affiliation géographique (54149.jpg)

**Contenu [VU]**

- Septième repère actif.
- Titre en deux lignes : **« Représente ta région »**.
- Explication : « Affronte les autres régions dans les batailles. Tu pourras changer à tout moment. »
- Liste verticale de grands blocs bleu-gris. Chaque option comporte un drapeau emoji et un libellé :
  - 🇺🇸 **United States** — sous-texte turquoise « Détecté automatiquement », flèche vers la droite ;
  - 🇫🇷 **France** ;
  - 🇨🇦 **Canada** ;
  - 🇧🇪 **Belgique** ;
  - 🇨🇭 **Suisse** ;
  - 🇦🇫 **Afghanistan** ;
  - 🇦🇱 **Albanie**.
- D'autres pays peuvent exister sous la zone visible ; la liste est plus longue que l'écran.
- Pas de bouton vert de confirmation visible sur cette capture.
- L'option de détection automatique est en haut et fonctionne comme **suggestion prioritaire**, non comme choix imposé (la France reste accessible).

**Mécanique UX [VU / INFÉRENCE]**

- Le produit introduit une **compétition par communauté géographique** avant l'entrée dans les exercices.
- « Tu pourras changer à tout moment » réduit le coût psychologique de la décision : affiliation non irréversible.
- Le pays sert visiblement de premier niveau d'une sélection hiérarchique, et non nécessairement de région au sens administratif.
- Le passage à l'écran suivant montre le sous-choix de la France. **[INFÉRENCE]** Toucher un pays ouvre directement ses subdivisions, sans étape de validation intermédiaire.

**Non déterminé [INCONNU]**

- « Détecté automatiquement » ne prouve pas une géolocalisation GPS : cela peut venir de l'adresse IP, d'un paramètre de langue/région, ou d'autre chose.
- La liste de tous les pays, son ordre complet, la recherche, les pays sans subdivisions, et la possibilité de masquer sa zone sont invisibles.
- Aucun indicateur de permission système de localisation n'apparaît dans les captures.

### 2.9 Écran 09 — Sous-sélection d'une région française (54151.jpg)

**Contenu [VU]**

- Le repère de progression reste sur le **septième jalon**, comme sur le choix de pays : pays et subdivision font partie du même grand bloc logique.
- Un **second bouton retour** apparaît dans le contenu, sous la barre principale. Il s'ajoute au retour global en haut à gauche.
- Titre : **« Choisis ta région »**.
- Sous-titre/breadcrumb centré : drapeau français et « France ».
- Grande liste de rectangles bleu-gris, labels alignés à gauche :
  - **Corse**
  - **Grand Est**
  - **Hauts-de-France**
  - **Île-de-France**
  - **Normandie**
  - **Nouvelle-Aquitaine**
  - **Occitanie**
- Un bloc partiel est visible juste au-dessus de « Corse », et un autre commence en bas de l'écran : la liste semble être défilée ou affichée dans une zone défilante.
- Pas de bouton « Continuer » visible.
- La capture ne montre pas de sélection verte ; le chemin observé mène ensuite à **Grand Est**.

**Mécanique UX [VU / INFÉRENCE]**

- Sélecteur **à deux niveaux** : pays → région ; le nom du pays reste affiché comme contexte.
- La flèche secondaire permet **probablement** de revenir à la liste des pays, sans reculer dans l'onboarding global.
- Le pays fonctionne comme périmètre de compétition, et la subdivision comme équipe choisie.
- La région « Grand Est » n'est pas présélectionnée visuellement sur cette capture.

**Point UX à surveiller**

- Deux flèches de retour à des niveaux différents, mais presque identiques visuellement, peuvent rendre ambigu le comportement de navigation.
- Les listes de longue taille doivent garder une zone défilante correcte et ne pas couper les options sous les barres système.

### 2.10 Écran 10 — Confirmation de la région et activation sociale (54153.jpg)

**Contenu [VU]**

- La barre de progression semble désormais afficher **14 repères**, contre 13 sur les captures 02–09. Le huitième est allongé. Son premier repère se retrouve très près de la flèche retour, avec risque de chevauchement visuel.
- Fond bleu nuit uniforme, pas de menu.
- Gros drapeau **français** centré vers le haut ; en dessous, titre **avec empattements** : « Grand Est ».
- Encadré gris foncé arrondi au centre :
  - valeur mise en avant : **« 3 116 »** ;
  - explication : « personnes ont fait une partie cette semaine dans ta région ».
- Phrase de motivation, centrée et en gras sur la fin : « À toi de faire **gagner ta région** cette semaine ! »
- Grand bouton vert en bas : « **Continuer →** ».
- L'utilisateur obtient immédiatement le sentiment d'avoir rejoint un groupe actif, avec une taille donnée.

**Logique UX [INFÉRENCE]**

- L'écran est un **moment de validation d'appartenance** après deux listes de sélection.
- La statistique est formulée en activité **hebdomadaire** plutôt qu'en membres inscrits : cela suggère une compétition renouvelée.
- La phrase finale transforme une donnée d'activité (« 3 116 personnes ») en rôle personnel (« toi, tu peux aider à gagner »).
- Le bouton oriente vers le parcours suivant, non visible.

**Limites [INCONNU]**

- Le nombre 3 116 n'est pas vérifié : aucune indication de source, actualisation, périmètre temporel exact, filtre anti-bots ou méthode de comptage.
- On n'a pas vu de classement, de score régional, de mécanisme de bataille, ni de règles permettant de « gagner ».
- Le passage de 13 à 14 repères peut être dû à un changement de configuration, une anomalie de layout, ou un autre mécanisme non visible. Il faut **retester**, pas supposer qu'il est intentionnel.

## 3. Système visuel relevé

### 3.1 Couleurs (échantillonnage approximatif des fichiers JPEG)

| Usage | Teinte estimée | Observation |
|---|---|---|
| Fond principal onboarding | **#0C1524** | Bleu nuit quasi uniforme sur captures 02–10 |
| Bande supérieure page d'accueil | **#457B9D** | Bleu moyen, beaucoup plus clair que la suite |
| Cartes/options non sélectionnées | **#1A324E** | Bleu-gris contrastant légèrement avec le fond |
| Bouton principal (face) | **#1A8F0B** | Vert intense ; capture avec sélection peut tirer vers **#1FA10D** |
| Ombre / tranche du CTA | Vert plus foncé | Effet relief, « bouton pressable » |
| Texte principal | Blanc cassé très clair | Titre et réponses lisibles sur fond sombre |
| Flèches / accents décoratifs | Turquoise pâle | Retour, curseur, sélection de l'avatar |
| Carte d'info finale | **#29313E** | Gris anthracite plus neutre que les cartes de sélection |
| Portraits d'avatar | Rouge saturé | Uniformité graphique de la galerie |
| Clavier de la capture 06 | Rose | Couleur du clavier **système**, pas un choix prouvé de l'application |

Les codes ci-dessus sont des échantillons de captures compressées : **ne pas les confondre avec les variables CSS officielles** de l'application source.

### 3.2 Typographie et densité

- Grandes typographies, plus proches d'un produit de jeu mobile que d'un formulaire standard.
- **Alternance serif/sans-serif** : promesse initiale, « Choisis ton avatar » et « Grand Est » avec empattements ; questions, gros chiffres, boutons et descriptions plutôt sans empattements. Les familles exactes ne sont pas identifiables de manière certaine.
- Titres fortement hiérarchisés, avec gras important ; textes explicatifs d'une taille suffisamment élevée pour occuper plusieurs lignes.
- Usage quasi systématique du **centrage** pour titres, nombres et incitations ; alignement à gauche des libellés dans les longues listes géographiques.
- Textes principaux en blanc ; textes secondaires un peu plus atténués ; options et CTA très contrastés.
- Très peu de décor gratuit : chaque couleur marquée indique soit une action, soit une sélection, soit une personnalité.

### 3.3 Composants récurrents

**A. Barre d'étapes**
- Flèche retour turquoise à gauche.
- Une rangée de petits disques blancs.
- Étape active dessinée sous forme de pilule allongée blanche.
- Pas de pourcentage ni d'intitulé « étape 3/13 ».
- Navigation apparemment pensée comme un parcours segmenté mais sans texte de progression.
- Écrans intermédiaires conservant un même jalon (motivation + 92 %, pays + région).
- **Anomalie observée** : 13 repères sur 02–09 ; 14 sur 10, avec un début de barre très à gauche.

**B. Boutons principaux**
- Vert vif presque pleine largeur, bord très arrondi.
- Texte blanc gras centré, assez volumineux.
- Faux volume par bande/ombre vert foncé au bas ; effet de bouton physique.
- CTA en pied de page quand le contenu le permet.
- Libellés contextuels : « Commencer », « C'est parti », « Continuer », « J'ai compris », « Valider ».
- Flèche blanche à droite sur certaines actions, pas toutes.
- Jamais de bouton principal complexe à deux actions simultanées sur ces captures.

**C. Cartes de choix**
- Rectangles presque pleine largeur, fond bleu-gris, angles très arrondis.
- Sélection textuelle en vert vif sur écrans âge et motivation.
- Espacement vertical généreux, donnant de grandes cibles tactiles.
- Lorsque la liste est longue (pays/régions), priorité au défilement plutôt qu'à un bouton « Continuer » toujours visible.

**D. Personnages et avatars**
- Compagnon Momo représenté dans au moins deux états émotionnels (accueil inquiet, bienvenue joyeux).
- Illustrations 2D stylisées, palette cohérente avec la marque.
- Avatars culturels représentés par des portraits illustrés sur fond rouge ; sélection signifiée par un contour turquoise clair.
- Le portrait peut être accompagné d'un texte culturel/biographique : utilité à la fois identitaire et pédagogique.

**E. Cartes d'information**
- Chiffres très grands : « +900 000 », « 92% », « 3 116 ».
- Format chiffre + phrase de justification/valorisation.
- Sur le 92 %, une carte explicative supplémentaire ; sur la région, une carte grise de contexte.
- Aucun graphique ou tableau : lisibilité en une seule lecture.

### 3.4 Écran mobile et navigation système

- **Portrait Android** : barre d'état système visible en haut et barre de navigation visible en bas.
- Aucun écran observé ne force le plein écran immersif ; l'application cohabite avec l'OS.
- Grand CTA inférieur au-dessus de la barre de navigation, avec respiration suffisante sur la majorité des écrans.
- Gestion apparemment correcte de l'ouverture du clavier dans le cas montré (capture 06).
- Le contenu des listes/galeries dépasse parfois la hauteur visible ; défilement vraisemblable et important pour l'ergonomie.
- La capture 10 met en évidence un problème potentiel de **collision** entre la flèche retour et les premiers marqueurs de progression.

## 4. Reconstruction fonctionnelle possible du parcours

### 4.1 Graphe des étapes visibles

    Accueil marketing
      ├─ Commencer ─────────► Bienvenue / Momo [étape visuelle 1]
      ├─ J'ai déjà un compte [destination non observée]
      └─ J'ai un code [destination non observée]

    Bienvenue / Momo
      └─ C'est parti ───────► [au moins un état absent du corpus]
                               └─ Tranche d'âge [étape 3]
                                   └─ Motivation [étape 4]
                                       └─ Réassurance 92 % [étape 4 conservée]
                                           └─ Pseudo [étape 5]
                                               └─ Avatar [étape 6]
                                                   └─ Pays [étape 7]
                                                       └─ Région [étape 7 conservée]
                                                           └─ Confirmation [étape 8]
                                                               └─ [suite non observée]

Les transitions ci-dessus reflètent l'ordre des captures, **pas une inspection instrumentée des événements**. Les raccourcis, retours, variantes et transitions automatiques restent à tester.

### 4.2 État minimal qu'une telle interface semble devoir manipuler [INFÉRENCE]

- Avancement : écran courant, jalon de progression, historique de navigation.
- Profil déclaré : tranche d'âge, raison de présence.
- Identité du joueur : pseudo, identifiant d'avatar.
- Territoire : pays sélectionné, subdivision éventuelle, possibilité de changer plus tard.
- Affichage de réassurance : statistiques marketing, textes contextuels.
- Éventuellement : compte/authentification, confirmation des conditions, permissions ; rien de tout cela n'est démontré dans les captures.

Cette liste n'est pas le schéma de données réel de l'application observée.

### 4.3 Patterns d'interactions visibles

| Pattern | Preuve dans le corpus | Ce qu'on peut et ne peut pas conclure |
|---|---|---|
| Choix exclusif | Une carte verte parmi plusieurs | Selection unique visible ; conservation après retour inconnue |
| Choix puis confirmation | Âge, motivation, avatar | Validation explicitement séparée par CTA |
| Action sans choix | Présentation, 92 %, confirmation régionale | Passage par une action unique |
| Saisie de texte libre | Pseudo + clavier | Champ éditable ; contraintes et validation inconnues |
| Navigation hiérarchique | Pays puis régions | Au moins 2 profondeurs ; seconde flèche retour |
| Liste défilante | Région/pays et galerie partiellement visibles | Beaucoup d'options ; comportement du scroll à confirmer |
| Prédétection | « United States — Détecté automatiquement » | Suggestion par inférence de localisation ; technique inconnue |
| Statistique de communauté | 900 000, 92 %, 3 116 | Présentation chiffrée ; source et caractère temps réel inconnus |
| Compagnon personnifié | Momo et son discours | Une identité éditoriale ; fréquence d'apparition future inconnue |
| Sélection d'avatar visuelle | Cercle cyan autour de Dumas | État choisi fortement signalé ; mécanisme d'enregistrement inconnu |

## 5. Psychologie UX et gamification : inventaire, pas validation causale

### 5.1 Promesse concrète et métaphore du jeu

L'application ne dit pas seulement « apprendre le français » mais « rejoindre la bataille contre les fautes ». La métaphore transforme une difficulté individuelle potentiellement culpabilisante en combat collectif où l'erreur devient un adversaire. **[INFÉRENCE]** C'est susceptible de diminuer l'appréhension, mais aucune mesure n'est disponible.

### 5.2 Personnage relationnel

Le compagnon reçoit un nom culturel prestigieux, puis un surnom accessible (« Momo »), et parle à la première personne. Deux versions visuelles suggèrent une gamme d'émotions. Le guide ne fait pas une démonstration technique ; il annonce qu'il sera « à tes côtés ». C'est un **dispositif de compagnonnage**, dont la persistance après onboarding n'est pas démontrée.

### 5.3 Personnalisation graduelle

L'ordre semble choisi du moins engageant vers le plus identitaire : âge → motivation → pseudo → avatar → territoire. Cela évite un formulaire lourd sur une seule page. Chacune des premières questions nécessite peu de lecture et un seul geste. **[INFÉRENCE]** Cette progression peut créer un sentiment d'appropriation et réduire la friction perçue.

### 5.4 Proof points intercalés

Trois chiffres structurent le corpus :
- « +900 000 utilisateurs écrivent avec confiance » : **ampleur du produit**.
- « 92 % des utilisateurs trouvent l'apprentissage ludique » : **réassurance sur la méthode**.
- « 3 116 personnes ont fait une partie cette semaine dans ta région » : **activité de la communauté proche**.

Ils ne prouvent pas à eux seuls la fiabilité des indicateurs. Leur rôle **dans le discours produit**, en revanche, est très lisible : crédibilité globale → satisfaction → dynamique locale.

### 5.5 Identité culturelle

L'étape d'avatar n'exige pas d'importer une photo ou de créer un personnage de zéro. Elle fournit des références culturelles nommées, chacune immédiatement reconnaissable ou découvrable. La biographie rend la sélection gratifiante, même avant le premier exercice.

### 5.6 Appartenance géographique et enjeu hebdomadaire

Le pays, puis la région, deviennent un **camp**. Le texte ne se contente pas d'annoncer un classement : il promet d'« affronter » d'autres régions et de « faire gagner » la sienne. La fenêtre « cette semaine » donne à l'action une temporalité courte. Les batailles réelles, barèmes, récompenses, classements et règles de remise à zéro ne sont pas visibles.

### 5.7 Micro-engagements et variété de rythme

La séquence alterne :
- présentation narrative sans effort ;
- question fermée ;
- autre question fermée ;
- pause informative ;
- saisie créative ;
- choix iconographique ;
- navigation dans une taxonomie géographique ;
- confirmation valorisante.

**[INFÉRENCE]** Cette alternance évite qu'une longue suite de champs similaires ressemble à une inscription administrative.

## 6. Détails UX remarquables et fragilités observables

### Points forts visibles

1. **Une tâche principale par écran**, sans concurrence avec des menus, annonces ou tableaux de bord.
2. **CTA très reconnaissables**, taille généreuse et profondeur visuelle constante.
3. **Feedback de sélection immédiat** via la couleur verte ou le cercle cyan.
4. **Promesse de personnalisation explicitée** : on sait pourquoi l'âge est demandé.
5. **Écran-clavier exploitable** sur le téléphone observé : on voit à la fois le contenu utile et l'action de validation.
6. **Identité de marque incarnée** par Momo, ses expressions et les portraits culturels.
7. **Continuité thématique** du mot « bataille » de l'écran 01 jusqu'à la confirmation territoriale.
8. **Réversibilité annoncée** du choix territorial et flèche de retour à la plupart des étapes.
9. **Réassurance progressive**, non limitée à la première page.
10. **Activation collective** avant de commencer à jouer : la première partie est présentée comme contributive.

### Fragilités et cas limites visibles ou plausibles

1. **Barre de progression incohérente** : 13 marqueurs sur les captures 02–09, 14 sur 10 ; risque de superposition avec la flèche retour en fin de corpus.
2. **Deux retours** sur la page de sous-région : leurs destinations ne sont pas expliquées par un libellé.
3. **Galerie avatar tronquée** par le panneau biographique et le CTA sur la capture 07 ; tester la visibilité de toutes les options au scroll.
4. **Dernière carte d'âge proche du bas** sur la capture 03 ; vérifier que le scroll ne passe pas sous un bouton fixe.
5. **Validation d'un pseudo potentiellement problématique** : la saisie offensive est visible ; le traitement de modération est non observé.
6. **Affichage de chiffres marketing sans source visible** : risque de défiance si non justifiés ou artificiels.
7. **Détection automatique incohérente avec le choix réalisé** (États-Unis proposé alors que France/Grand Est est choisi) ; ce n'est pas nécessairement une erreur technique, mais mérite test.
8. **Absence de saut visible** : un parcours long peut fatiguer certains profils. L'existence de « Passer » ailleurs est inconnue.
9. **Profil de mineur** : les catégories « moins de 13 ans » et « 13–17 ans » imposent de vérifier séparément les traitements et règles de collecte associés.
10. **Précision terminologique** : « région » désigne d'abord une liste de pays puis des subdivisions. Le produit privilégie l'intuition, mais les règles de segmentation ne sont pas explicitées.
11. **Accessibilité non démontrée** : contrastes apparents élevés, mais aucune preuve concernant lecteurs d'écran, focus clavier, annonces de sélection, zoom texte ou réduction du mouvement.
12. **Variation de libellés de CTA** : probablement intentionnelle, mais pas une grammaire entièrement uniforme (« Valider » / « Continuer » / « J'ai compris »).
13. **Absence de traitement des erreurs visible** : réseau perdu, pseudo vide, permission refusée, territoire sans région, sauvegarde interrompue.
14. **Aucune preuve que les réponses de profil modifient réellement le contenu** : possible personnalisation réelle, simple analytics ou mise en scène.
15. **Dépendance potentielle à un classement social** : à tester pour les utilisateurs qui ne souhaitent pas jouer en équipe.

## 7. Ce que le corpus ne permet PAS de rétro-ingénier

L'absence d'observation doit rester explicite. Les captures ne donnent accès ni à la logique interne ni aux fonctionnalités après onboarding.

- Architecture (native Android, PWA, WebView ou framework), technologies et feuilles de style.
- Source des illustrations, polices exactes, animations, sons, vibration, effets de clic, temporisations.
- Modalités d'inscription réelles, obligation de créer un compte, possibilité d'être invité/anonyme.
- Sauvegarde du profil : stockage local, synchronisation cloud, réinitialisation ou reprise de session.
- Validation des champs, unicité des pseudos, filtrage de contenu public, gestion des mineurs.
- Source des statistiques, période exacte du 92 %, actualisation du 3 116, sélection de joueurs actifs.
- Géolocalisation et permissions éventuelles.
- Relation entre âge/motivation et exercices servis.
- Nombre total de vrais écrans : la barre évoque au moins 13 jalons mais ne garantit pas 13 pages distinctes.
- Si certaines pages avancent automatiquement à la sélection ou après une animation.
- Fonctionnement des batailles, équipes, classements, points, saisons, trophées, récompenses et anti-triche.
- Profil public, pseudonyme affiché à d'autres utilisateurs, possibilité d'en changer.
- Écran d'arrivée après « Continuer » sur le Grand Est.
- Performances, taux d'abandon, rétention, satisfaction et conversion réels.

## 8. Méthode pour compléter l'audit lors d'une session instrumentée

**À tester plus tard, sans décision de refonte dans ce document :**

- Enregistrer une vidéo complète du parcours, depuis lancement jusqu'au premier exercice, en incluant toutes les étapes non capturées.
- Tester retour, saut éventuel, fermeture/réouverture, changement de choix déjà validé, orientation et reprise hors ligne.
- Tester les cartes et CTA sans sélection ; observer les états désactivés, les animations et les erreurs.
- Vérifier les transitions pays → région et le retour secondaire ; choisir un pays sans subdivision connue.
- Tester la galerie complète d'avatars, une sélection au bas du scroll et un changement de biographie.
- Tester pseudos courts/longs, Unicode, emoji, caractères spéciaux, mots offensants, clavier physique et clavier Gboard.
- Tester un Android de petite hauteur, textes système agrandis et clavier affiché.
- Enregistrer ce qui change réellement après une autre tranche d'âge et une autre motivation.
- Vérifier où apparaissent les points régionaux, leur fréquence de mise à jour et l'incidence d'une partie.
- Vérifier les permissions et politiques de confidentialité affichées au moment où des données deviennent nécessaires.

## 9. Correspondance avec le LuxApp actuel — faits constatés sur GitHub

Cette section sert de **point de repère**, et non de demande de développement.

**État de l'application à la lecture de main (23/10/2026) :**

- Le frontend actuel est une application web à fichiers statiques **HTML/CSS/JavaScript**, avec backend **Node/Express**, selon le PLAYBOOK.md.
- Le dashboard actuel expose principalement la **série**, la **progression**, les **questions/leçons maîtrisées**, puis les entrées **Leçons**, **Réviser**, **Examens**, **Erreurs fréquentes** (public/index.html).
- La configuration du design dans public/style.css utilise un **fond sombre presque noir**, des cartes sombres et un accent **or/ambre**, différent du bleu nuit + vert de l'application observée.
- Le PLAYBOOK.md documente les niveaux A1.1/A1.2, la progression durable, la synchronisation Firebase optionnelle et plusieurs conventions (notamment **pas d'emoji sur les boutons d'action**).
- Cette référence visuelle est donc une **source d'inspiration indépendante**, pas une description du code actuel de LuxApp ; ni son UI ni ses choix de marque ne doivent être recopiés mécaniquement.

### Catalogue neutre de mécanismes à discuter ultérieurement

| Mécanisme observé | Enjeu potentiel pour LuxApp/Luxo | Prérequis ou vigilance |
|---|---|---|
| Mascotte avec nom et personnalité | Incarnation de l'apprentissage du luxembourgeois | Identité originale ; cohérence visuelle et pédagogique |
| Onboarding question par question | Découverte du niveau, du contexte et de l'objectif | Ne pas ajouter de friction avant une première leçon utile |
| Age + objectif | Personnalisation éventuellement différenciée | Usage effectif des données, minimisation et mineurs |
| Pseudo + avatar | Appropriation du compte/profil | Modération si affichage public, distinction avatar/progression |
| Appartenance territoriale | Frontaliers / résidents, communautés d'apprenants | Définir pays/communes/cantons/régions sans biais |
| Défis par territoire | Motivation sociale hebdomadaire | Barème juste, anti-triche, transparence des chiffres |
| Chiffres de preuve sociale | Réassurance sur la valeur pédagogique | Ne jamais afficher de données inventées |
| CTA en pied d'écran | Ergonomie du parcours Android | Clavier, safe-area, scroll, petits écrans |
| Marqueurs de progression | Réduction de l'incertitude sur la longueur | Nombre de repères stable et accessible |
| Biographie des avatars | Contenu culturel léger au sein d'un choix | Droit des illustrations, exactitude des textes |
| Promesse d'apprentissage ludique | Positionnement grand public | Garder les exercices sérieux et la progression explicable |

**Aucune de ces lignes ne vaut décision d'implémentation.** Il faudra arbitrer la pertinence de chaque mécanisme selon l'objectif réel de LuxApp : apprendre le luxembourgeois aux francophones, en particulier A1.1/A1.2, sur mobile, sans dégrader les fonctions ni la progression déjà existantes.

## 10. Synthèse de rétro-ingénierie

Le système observé ne vend pas d'abord **une bibliothèque de leçons**. Il met en scène un **futur joueur** : une promesse de progrès, un guide attachant, un profil, un nom, une représentation visuelle, puis une communauté locale avec laquelle il pourra rivaliser. La cohérence entre « bataille contre les fautes » (écran 01) et « fais gagner ta région » (écran 10) est le trait le plus saillant du corpus.

Son second trait est opérationnel : il emploie presque toujours une décision simple, un retour visuel évident et un CTA massif dans une interface mobile sans distractions. L'utilisateur peut avancer sans connaître les fonctionnalités détaillées du produit.

Le principal garde-fou pour LuxApp est de **séparer ce qui marche visuellement de ce qui est réellement démontré** : ni les statistiques marketing, ni l'adaptation pédagogique, ni le classement hebdomadaire ne sont vérifiés par les dix images. La documentation consigne donc les patterns et leurs conditions d'usage, pour permettre une analyse comparative ultérieure sans inventer de fonctionnalités.

---

**Statut initial (version main) :** benchmark descriptif archivé. **Aucun fichier applicatif modifié.** La version 2.1 se poursuit par les annexes de mesures et de rétro-ingénierie détaillées ci-dessous.


---


# ANNEXE A — Inventaire forensique visuel et métriques écran par écran (édition approfondie 2.1)

**Nature :** relevé de l'image raster, complément des sections 1 à 10. Cette annexe doit être lue AVEC les descriptions et citations de texte de chaque écran dans la partie initiale ; elle n'en remplace aucune.

**Méthode de mesure :** les 10 fichiers JPEG originaux ont été lus individuellement en 709 × 1536. Les positions et couleurs planes ont été échantillonnées sur pixels réels ; les limites des formes arrondies, des glyphes et des images ont été estimées visuellement. Coordonnées = pixels de la capture, origine (0,0) en haut à gauche, rectangles x1–x2 / y1–y2. Tolérance visuelle typique ±5–10 px sur les coins arrondis, contours antialiasés et textes. **Pas de conversion en dp, rem ou px CSS** sans connaître le DPR et le zoom. Les unités présentées servent à reconstruire la **hiérarchie des rapports de taille**, pas à recopier du CSS 1:1.

## A.1. Dimensions et surfaces réellement échantillonnées

| Élément / contexte | Capture + point prélevé | Échantillon RGB | HEX mesuré | Statut |
|---|---|---|---|---|
| Fond sombre principal | 54137, (10,300) | 12,21,36 | **#0C1524** | [MESURÉ] |
| Fond sombre, confirmation région | 54153, (350,440) | 12,21,36 | **#0C1524** | [MESURÉ] |
| Bleu supérieur de l'accueil | 54135, (20,200) | 69,123,157 | **#457B9D** | [MESURÉ] |
| Surface carte inactive | 54139, (100,490) | 26,50,78 | **#1A324E** | [MESURÉ] |
| Surface carte inactive pays | 54149, (100,440) | 26,50,78 | **#1A324E** | [MESURÉ] |
| Face pleine du CTA | 54137, (90,1310) | 26,143,11 | **#1A8F0B** | [MESURÉ] |
| Option verte active | 54139, (100,900) | 31,161,13 | **#1FA10D** | [MESURÉ] |
| Carte statistique région | 54153, (80,550) | 41,49,62 | **#29313E** | [MESURÉ] |

Remarques : le même vert paraît différent selon le rôle (CTA / sélection), la lumière de la capture et l'anti-aliasing JPEG. Le clavier rose de la capture 06 **n'appartient pas à la palette de marque** ; c'est un composant du système de saisie Android. Les couleurs RGB des textes et bordures n'ont pas été extraites comme variables CSS officielles.

### Rapport de surfaces visuelles

- **Fond #0C1524** : occupe la quasi-totalité des captures 02–10 ; évite toute texture ou gradient visible dans les zones nues.
- **Surface #1A324E** : élève les options d'un niveau de contraste sans l'effet « carte flottante » marqué des interfaces à ombres.
- **Vert #1A8F0B** : réservé aux appels à l'action et, avec nuance plus vive, aux sélections textuelles ; ce lien sémantique peut signifier « continuer / choisi » dans l'app de référence.
- **Blanc très clair** : titre, actions, pastilles, chiffres de crédibilité ; contraste fort.
- **Turquoise désaturé** : retour, indication d'autodétection, curseur et contour d'avatar. Accent secondaire fonctionnel.
- **Rouge de portrait** : contenu imagé et identitaire ; non utilisé pour coder une erreur sur les écrans observés.
- **Gris de la confirmation région** : carte neutre non interactive, visuellement distincte des cartes bleues de choix.

**Traduction pour LuxApp 2.1 :** il ne faut **pas** transposer la sémantique du vert au bouton principal : dans le système LuxApp 2.1, l'or désigne l'action principale et le vert la réussite réelle. Le pattern d'accent fort est transférable ; sa couleur ne l'est pas mécaniquement.

## A.2. Géométrie générale des 10 images

- Raster commun : **709 px de largeur × 1536 px de hauteur** (rapport largeur/hauteur ≈ 0,462).
- Région réservée à la **barre d'état système** : environ y=0–55 selon les images. Heure 11:43 pour 01–09, 11:44 pour 10, batterie à 93 %, indicateurs Wi-Fi/réseau/silence. **Ne pas reproduire ces icônes dans l'app**.
- Barre de navigation Android : symboles système visibles autour de y=1470–1522 ; le fond peut appartenir à la couche OS et son style dépend de la navigation système.
- Zone utile de l'app sans clavier : grosso modo y=55–1470. Boutons et listes s'arrêtent au-dessus de la navigation.
- Retour global situé x≈36–59, y≈83–124 ; la plupart des captures montrent la même flèche turquoise vers la gauche.
- Barre de jalons située approximativement y=83–107 ; les ronds ont ≈22 px de diamètre au niveau de leur scanline centrale, l'actif ≈46 px de largeur.
- Les grands boutons « footer » se trouvent souvent autour de **y=1280–1390** ; l'espace en dessous garde une marge de sécurité avant la navigation OS.
- Les vues de listes ont souvent **x≈39–670**, soit ~630 px de large et ~39 px de marge latérale ; d'autres cartes utilisent x≈59–650, soit ~590 px.
- Le seuil de visibilité bas des listes se situe souvent vers **y=1403**, le bas de leur conteneur défilant, et non y=1536.
- Ces constantes donnent des **proportions**, pas une preuve d'utilisation de position:fixed, 100dvh, flex ou Grid dans le produit d'origine.

## A.3. Mesures individuelles : bounding boxes et rythme

### Capture 01 — 54135.jpg / écran promotionnel

| Élément | Rectangle apparent (px) | Analyse du placement |
|---|---|---|
| Bandeau bleu clair | x=0–708, y≈0–665 | Fond plein écran supérieur ; la frontière à y≈666 coupe l'illustration |
| Accroche trois lignes | centre x≈350, y≈125–335 | Forte masse typographique verticale ; serif, capitales initiales |
| Illustration Momo inquiet | x≈162–550, y≈397–704 | Cheveux/visage/mains débordent sur la séparation des deux zones |
| Zone de preuve sociale | centre x≈350, y≈754–891 | 2 rameaux symétriques entourent le texte, chiffre dominant |
| CTA « Commencer » | **x≈53–656, y≈917–1026** | ~603 px de largeur, ~109 px de hauteur totale visible avec épaisseur verte foncée |
| Lien compte existant | centre, y≈1078–1126 | Soulignement large ; deuxième priorité |
| Lien code | centre, y≈1158–1192 | Petite ligne soulignée, troisième priorité |
| Mentions légales | x≈31–661, y≈1254–1404 | Alignement gauche, mots-clés en gras et liens soulignés |
| Navigation OS | y≈1470–1535 | Pas de CTA masqué |

**Détails complémentaires :**
- Le contraste haut/bas est obtenu par deux **aplats**, non par un dégradé visible.
- Les deux mains visibles sous l'illustration s'appuient visuellement sur la frontière ; astuce de superposition qui donne de la personnalité au personnage.
- Momo n'est **pas** installé dans une carte ou un cercle standard : sa silhouette est découpée et chevauche des plans.
- Les rameaux blancs encadrent un argument de popularité ; symétrie gauche/droite, sans ombre ou animation visible.
- Le titre prend trois lignes pour conserver des mots lisibles et éviter une accroche horizontale trop dense.
- Texte du CTA blanc dominant ; flèche blanche à droite ; pilule rectangulaire très arrondie et épaisse.
- Les liens secondaires sont **des textes soulignés**, pas de petites pastilles ni des CTA secondaires concurrents.
- Les CGU et la confidentialité utilisent une typographie assez grande, permettant leur lecture malgré leur place en fin de page.
- **Point de reconstruction :** prélever le silhouettage du personnage séparément de la mise en page ; l'effet chevauchement est structurel, pas un simple centrage d'image.

### Capture 02 — 54137.jpg / introduction du mentor

| Élément | Rectangle apparent (px) | Analyse |
|---|---|---|
| Flèche + 13 jalons | x≈35–626, y≈82–113 | Retour indépendant, progression en ronds |
| Mascotte joyeuse | x≈180–505, y≈264–638 | Grande illustration isolée dans un vide sombre |
| Titre « Bienvenue ! » | x≈72–444, y≈848–914 | Titre très grand, gras et aligné à gauche |
| Paragraphe du mentor | x≈70–609, y≈995–1234 | Quatre lignes environ, texte très grand |
| CTA « C'est parti » | **x≈57–652, y≈1287–1390** | Grande action ancrée au bas du contenu |

**Micro-composition :**
- Il existe un **grand vide entre mascotte et bloc texte** ; le personnage se situe plus haut, le texte et l'action plus bas.
- À la différence des questions à venir, le titre et la présentation sont **alignés à gauche** au sein d'une colonne.
- La mascotte occupe un tiers à la moitié de la largeur, ce qui laisse respirer le contour des cheveux, la plume et la main levée.
- Départ relationnel : d'abord son identité « Molière », puis surnom « Momo », puis sa mission d'accompagnement.
- Flèche de CTA distincte du chevron de retour ; le sens de lecture produit une avancée visuelle gauche → droite.

### Capture 03 — 54139.jpg / âge

| Élément | Rectangle apparent (px) |
|---|---|
| Titre centré sur deux lignes | y≈167–289 |
| Explication sur deux lignes | y≈317–396 |
| Carte « Moins de 13 ans » | x≈59–650, y≈462–573 |
| Carte « 13–17 ans » | x≈59–650, y≈596–706 |
| Carte « 18–24 ans » | x≈59–650, y≈729–840 |
| Carte « 25–34 ans » verte | x≈59–650, y≈863–975 |
| Carte « 35–54 ans » | x≈59–650, y≈997–1109 |
| Carte « 55 ans et plus » | x≈59–650, y≈1131–1235 |
| CTA « Continuer » | x≈64–645, y≈1279–1382 |

**Mesures de rythme :**
- Cartes ~110 px de haut ; espacement vertical ≈23–24 px ; au moins six grandes zones tactiles alignées.
- Titre, sous-titre puis liste sont séparés par des espaces supérieurs à l'espacement entre cartes.
- Les libellés sont centrés verticalement ET horizontalement ; aucune icône dans cette liste.
- La carte verte n'a pas de coche visible, **la couleur seule indique ici la sélection**.
- Les cartes inactives portent un fin liseré un peu plus clair que le fond intérieur.
- Le bouton principal se trouve dans une bande inférieure distincte du flux de cartes, sans séparateur visible.
- **Point UX :** six options + CTA sur un viewport de cette hauteur laissent peu de marge pour très grands caractères.

### Capture 04 — 54141.jpg / raison de présence

| Élément | Rectangle apparent (px) |
|---|---|
| Titre centré | y≈213–273 |
| Carte travail | x≈40–669, y≈373–484 |
| Carte examens | x≈40–669, y≈507–618 |
| Carte enfants | x≈40–669, y≈641–751 |
| Carte amour du français, verte | x≈40–669, y≈775–885 |
| Carte enseignant | x≈40–669, y≈909–1020 |
| CTA « Continuer » | x≈64–645, y≈1279–1382 |

**Différences significatives avec l'âge :**
- Marges latérales des cartes plus faibles (x≈40 au lieu de x≈59) : environ **629 px** de largeur contre 591.
- Même rythme de ~110 px par option et ~24 px de gouttière.
- Contrairement à l'âge, **pas de sous-titre explicatif** : la question tient seule.
- Réserve verticale importante entre dernière carte et CTA (~260 px) ; cela évite que l'interface semble pleine ou obligée de remplir l'espace.
- Certains libellés sont motivés par une situation personnelle, d'autres par une démarche formelle ; les cinq sont au même niveau visuel.
- Sélection verte pleine surface, pas de coche ni bouton radio.
- **Point de reconstruction :** largeur des groupes de choix dépend visiblement du gabarit d'écran / des variantes de layout ; ne pas postuler un seul token de marge fixe pour tous les écrans.

### Capture 05 — 54143.jpg / 92 % et message

| Élément | Rectangle apparent (px) |
|---|---|
| Barre de jalons, **4e actif** | y≈83–107 |
| « 92% » massif | centre x≈350, y≈486–579 |
| Explication sous le nombre | centre x≈350, y≈621–708 |
| Encadré argumentatif | x≈47–662, y≈760–925 |
| CTA « J'ai compris » | x≈72–637, y≈1270–1375 |

**Détails :**
- Les chiffres sont la seule composante extrêmement grande de l'écran, sans jauge circulaire ni illustration.
- L'argument sous le pourcentage se lit comme un petit texte éditorial, pas comme un libellé de donnée technique.
- Carte légèrement bordée, fond identique à certaines options ; elle s'interprète comme un **encart de propos**.
- Le petit chevron turquoise dans l'encart est aligné au début du texte, à gauche ; sa fonction exacte n'est pas observée.
- Le bouton de fin paraît légèrement plus étroit que sur plusieurs autres pages (environ 565 px dans la capture).
- **Observation comportementale forte :** écran 04 et 05 partagent la 4e pilule de progression ; ce n'est pas un nouveau jalon.

### Capture 06 — 54145.jpg / pseudo avec clavier

| Élément | Rectangle apparent (px) |
|---|---|
| Barre de 13 jalons, **5e actif** | y≈83–107 |
| Titre | x≈94–617, y≈281–354 |
| Sous-titre centré | y≈380–423 |
| Champ actif à bordure claire | x≈39–670, y≈462–600 |
| CTA « Valider » | x≈59–650, y≈649–753 |
| Clavier Samsung rose | **y≈882–1443** |
| Navigation système sous clavier | y≈1444–1535 |

**Analyse clavier (critique pour Android) :**
- La surface occupée par l'IME est d'environ **560 px** en hauteur visible, plus la zone de navigation système.
- Le **champ** (~138 px) et son CTA (~104 px) sont tous les deux **entièrement au-dessus** du clavier.
- Un espace d'environ **129 px** subsiste entre le bas visible du CTA (≈753) et le début du clavier (≈882), ce qui réduit le risque de saisie mal placée dans cet état.
- La barre de progression demeure visible malgré le clavier.
- Le champ possède une **bordure plus claire et plus affirmée** que les cartes non interactives ; le focus est également marqué par un curseur turquoise.
- Le texte saisi est très grand et semi-gras ; le champ n'est pas présenté comme un input administratif standard.
- Le clavier affiche suggestions lexicales, chiffres, emoji, sélecteur langues, micro et touche de validation système. Ces éléments sont **fournis par Android** et doivent être testés avec plusieurs IME ; l'application ne peut pas présumer leur couleur ou leur hauteur.
- La capture ne prouve **pas** l'usage de scrollIntoView, de visualViewport ou de interactive-widget=resizes-content dans l'app de référence : **seul le résultat visible** est établi.
- **Risque produit :** la présence dans le champ d'un pseudo volontairement offensant ne prouve pas son acceptation serveur ; la saisie, la validation, la persistance et l'affichage public sont des étapes distinctes à tester.

### Capture 07 — 54147.jpg / galerie d'avatars

| Élément | Rectangle apparent (px) |
|---|---|
| Barre à 13 jalons, **6e actif** | y≈83–107 |
| Titre « Choisis ton avatar » serif | y≈167–228 |
| Rangée 1 de portraits | cercles centrés vers x≈142, 354, 571 ; y≈274–454 |
| Rangée 1 de noms | y≈469–548 |
| Rangée 2 de portraits | cercles x≈53–232, 273–453, 486–665 ; y≈589–770 |
| Rangée 2 de noms | y≈788–860 |
| Rangée 3, seulement visible en partie | y≈904–1018 |
| Biographie du portrait choisi | zone x≈92–619, y≈1040–1233 |
| CTA « Valider » | x≈71–638, y≈1287–1390 |

**Sélecteur graphique :**
- Les images ont un traitement éditorial volontairement homogène : portraits illustrés, cadrage buste/tête, fond rouge, cercle de même ordre de taille et espacement stable.
- La galerie est une **grille à trois colonnes**, avec regroupement image + nom ; certains noms occupent deux lignes.
- La personnalité choisie est signalée par **un anneau cyan épais** qui suit le cercle ; le contraste de sélection ne repose donc pas seulement sur un changement du portrait.
- Les noms restent en texte clair ; leur longueur est absorbée par la hauteur du groupe, pas par une troncature « ... » visible.
- Les portraits n'ont pas tous la même expression ni la même période historique : l'uniformité provient du cadrage, des couleurs et du style, non d'un rendu générique des personnes.
- Une biographie **en texte centré** contextualise le choix. Elle peut apporter un mini-contenu culturel à un écran de personnalisation.
- Le dernier rang apparaît tronqué par la zone basse. **Ne pas conclure** que la grille et la biographie sont deux couches superposées : un scroll ou un conteneur à hauteur contrainte peut produire cet aspect.
- **Hypothèse à tester** : la biographie suit le choix et la galerie reste scrollable sans que le CTA disparaisse.

### Capture 08 — 54149.jpg / choix géographique niveau pays

| Élément | Rectangle apparent (px) |
|---|---|
| Titre « Représente ta région » | y≈174–235 |
| Explication / réversibilité | y≈259–368 |
| USA : carte autodétectée | x≈39–670, y≈413–568 (hauteur ~155) |
| France | x≈39–670, y≈588–709 (hauteur ~121) |
| Canada | x≈39–670, y≈729–851 |
| Belgique | x≈39–670, y≈871–993 |
| Suisse | x≈39–670, y≈1013–1136 |
| Afghanistan | x≈39–670, y≈1155–1277 |
| Albanie | x≈39–670, y≈1297–1404 visible |

**Hiérarchie interne des lignes :**
- Première carte plus haute, avec **drapeau + titre + annotation turquoise « Détecté automatiquement » + flèche**.
- Les autres cartes ont un seul niveau de texte (drapeau à gauche + pays).
- Espace régulier d'environ 20 px entre les cartes. Rayons importants, mais plus petits proportionnellement à leur largeur que ceux du CTA.
- Drapeaux en emoji de taille importante ; ils servent d'icônes de reconnaissance et non d'illustrations externes identifiables.
- Texte aligné à gauche, avec padding intérieur généreux ; le drapeau s'aligne sur le bloc de texte.
- Pas de « Continuer » visible : le choix du pays semble fonctionner comme **navigation dans une liste** et non comme validation d'un formulaire.
- Le choix américain en tête est formulé comme une **suggestion** ; sa provenance technique n'est pas démontrée.

### Capture 09 — 54151.jpg / choix géographique niveau région

| Élément | Rectangle apparent (px) |
|---|---|
| Progression | **7e actif, comme l'écran précédent** |
| Flèche secondaire dans le contenu | x≈61–86, y≈248–283 |
| Titre « Choisis ta région » | y≈215–267 |
| Pays actif « France » et drapeau | y≈285–322 |
| Carte partielle sans nom au-dessus de Corse | y≈380–418 |
| Corse | x≈39–670, y≈437–552 |
| Grand Est | x≈39–670, y≈571–685 |
| Hauts-de-France | x≈39–670, y≈705–819 |
| Île-de-France | x≈39–670, y≈839–953 |
| Normandie | x≈39–670, y≈973–1087 |
| Nouvelle-Aquitaine | x≈39–670, y≈1107–1221 |
| Occitanie | x≈39–670, y≈1241–1355 |
| Carte suivante partielle | y≈1375–1404 |

**Comportement de liste inféré et sensibilité UI :**
- Les cartes régionales font ~114 px de haut et ont ~19–20 px de séparation.
- Le **haut de la liste est coupé en cours d'option** : cela peut refléter un scroll déjà effectué, un clipping ou une zone réservée au header ; la seule capture ne tranche pas.
- **Le bas de la liste est également coupé** à y≈1404, mais aucune action verte ne s'y superpose.
- La flèche globale supérieure + la flèche interne créent deux relations de retour : **onboarding ↩ / choix pays ↩** plausibles, mais non confirmées.
- Les libellés de région sont nettement plus grands qu'un menu déroulant natif classique.
- L'information « France » sert de fil d'Ariane humain plutôt qu'un composant breadcrumb complexe ; il n'y a pas une chaîne de navigation multi-niveaux en texte.
- Sur un petit écran, le footer vide doit rester distinct d'une liste que l'on peut faire défiler jusqu'au dernier choix.

### Capture 10 — 54153.jpg / ralliement à une équipe

| Élément | Rectangle apparent (px) |
|---|---|
| Progression **14 jalons**, **8e actif** | y≈83–107 ; premiers repères démarrent x≈61 |
| Drapeau France, grand format | x≈278–432, y≈230–340 |
| Titre serif « Grand Est » | y≈393–448 |
| Carte d'activité, grise | x≈47–663, y≈531–720 |
| Grand chiffre « 3 116 » | y≈558–613 |
| Légende hebdomadaire | y≈626–704 |
| Message d'activation locale | y≈766–863 |
| CTA « Continuer → » | x≈57–652, y≈1287–1390 |

**Ce qui distingue la page :**
- Le drapeau sélectionné est **promu au rang d'illustration centrale**, ce qui rend l'affiliation immédiatement visible.
- L'intitulé de région devient un **titre de célébration en serif**, pas un choix cliquable.
- La carte de statistique est neutre/grise : le chiffre de communauté est annoncé comme une donnée, pas comme une récompense débloquée.
- Le slogan « À toi de faire gagner ta région cette semaine ! » est placé hors carte, plus près du centre émotionnel de l'écran.
- Le CTA retrouve le modèle standard de pied de page ; la suite du parcours n'est pas visible.
- **Erreur graphique reproductible depuis la capture** : le premier marqueur de la nouvelle barre se trouve à x≈61–83 et semble en conflit spatial avec la flèche retour (située autour de x≈35–60), contrairement aux captures 02–09 où les jalons commencent à x≈83.
- **Le chiffre d'activité régionale est un texte de l'app, pas une donnée confirmée.**

## A.4. Vérification mécanique des jalons blancs

Sur les images raster, une coupe horizontale à **y=95** a été analysée en conservant les segments blancs de longueur ≥8 px :

| Capture | Nombre de segments blancs distincts | Élément actif |
|---|---:|---:|
| 02 — 54137 | **13** | 1er (ovale x≈71–117) |
| 03 — 54139 | **13** | 3e (x≈158–204) |
| 04 — 54141 | **13** | 4e (x≈201–247) |
| 05 — 54143 | **13** | 4e (x≈201–247) |
| 06 — 54145 | **13** | 5e (x≈244–290) |
| 07 — 54147 | **13** | 6e (x≈288–334) |
| 08 — 54149 | **13** | 7e (x≈331–377) |
| 09 — 54151 | **13** | 7e (x≈331–377) |
| 10 — 54153 | **14** | 8e (x≈353–399) |

**Mesure directement répétable :** sur 02–09, la plupart des ronds ont une largeur visible ~23 px à y=95 et le marqueur actif ~47 px. L'espacement des centres est ~43–44 px. Sur 10, l'ajout d'un repère décale les centres vers la gauche, et le premier peut chevaucher la zone de retour. Cette divergence **ne doit pas être interprétée comme un vrai « nouveau niveau » de progression** tant qu'on ne sait pas pourquoi la barre change.

**Mécanique notable :** une barre de jalons peut compter des **grands blocs d'intention** et non les vraies pages. Ici 04→05 et 08→09 montrent la même étape active. Il serait faux de dire que chaque écran du corpus = une étape.

---

# ANNEXE B — Design system reconstitué, signatures visuelles et différences entre composants

## B.1. Tokens hypothétiques de la référence (PAS son CSS original)

| Token descriptif | Approximation dans les images | Usage observé |
|---|---|---|
| body.dark | #0C1524 | Arrière-plan des écrans 02–10 |
| landing.hero | #457B9D | Aplat haut de l'accueil |
| surface.option | #1A324E | Choix âge/motivation/pays/région, encadré 92 % |
| action.face | #1A8F0B | Face du CTA ;
| selected.face | #1FA10D | Carte active sur âge et motivation |
| surface.stat | #29313E | Carte 3 116 |
| accent.cool | turquoise pâle | Retour, annotation, focus, contour avatar |
| avatar.background | rouge vif | Fond des portraits illustrés |
| text.main | blanc très clair | Titres et corps primaires |
| text.secondary | blanc/gris clair | Sous-titres, explications, éléments moins prioritaires |
| card.stroke | bleu-gris très discret | Contour des options |
| cta.depth | vert sombre | Liseré/tranche inférieure des CTA |

Il s'agit d'une **nomenclature inventée pour documenter la capture**, pas de noms de variables ou classes du produit source. Le point-virgule éventuel est une notation de tableau, pas une feuille CSS livrée.

## B.2. Typographies et usage grammatical

**Titres éditoriaux avec empattements :**
- Accueil : « Rejoins la bataille contre les fautes ».
- Avatar : « Choisis ton avatar ».
- Territoire choisi : « Grand Est ».
- Le serif apporte une impression **littéraire, culturelle et narrative**, cohérente avec Molière et les avatars d'écrivains.

**Titres d'action sans empattements :**
- « Bienvenue ! », « Quelle est ta tranche d'âge ? », « Pourquoi es-tu ici ? », « Choisis ton nom », « Représente ta région », « Choisis ta région ».
- Les titres de tâches courantes utilisent un dessin de lettres plus simple et épais, plus direct en lecture mobile.

**Chiffres héroïsés :**
- « +900 000 » : preuve sociale encadrée de rameaux.
- « 92% » : chiffre presque isolé, sans unité additionnelle.
- « 3 116 » : chiffre héro dans une carte locale, avec contexte « cette semaine ».
- Le langage visuel explique le chiffre par **une phrase courte immédiatement adjacente**.

**Textes de réponse :**
- Taille plus grande que dans beaucoup de formulaires ;
- poids régulier à moyen pour l'option inactive ;
- seul le CTA porte un gras très marqué ;
- peu de capitales intégrales, hormis les acronymes de l'OS.

**Échelle typographique raster approximative :**
- Grande accroche/titre de page : ordre de 45–65 px **dans la capture**, pas en CSS.
- Corps d'explication/questions secondaires : ordre de 29–40 px raster.
- Libellés de cartes de choix : ordre de 36–45 px raster.
- Boutons principaux : ordre de 43–51 px raster, gras.
- Chiffre exceptionnel « 92% » : plus de 90 px raster.
- Mentions légales : ordre de 26–31 px raster.
- Ne pas transformer ces fourchettes directement en styles ; les polices exactes, ascenders, line-height et DPR ne sont pas connus.

## B.3. Espacement et géométrie : règles implicites

- **Un gros objet par zone** : titre OU personnage OU statistique OU liste selon la position verticale.
- Le **groupe question + contexte** occupe la zone supérieure ou intermédiaire ; le **groupe options** suit ; le CTA est séparé.
- La même famille de cartes s'appuie sur un rythme d'environ **114 px de hauteur + 20 px de séparation** pour les listes pays/région, et ~110 px + ~24 px pour âge/motivation.
- Les grandes cartes sont presque pleine largeur, mais **n'atteignent pas les bords de l'écran** : ~39 à ~59 px de respiration.
- Rayon des CTA très grand ; formes de pilules visuelles ; les options restent des **rectangles arrondis** dont les extrémités sont moins ovalisées.
- Les cartes ne possèdent pas de grandes ombres portées visibles : leur contraste de surface et leur bordure suffisent.
- Le bas de page des écrans simples est généreux. Le vide n'est pas une erreur : il dramatise le prochain geste et garde le CTA accessible au pouce.
- Quand le contenu ne tient plus (pays, région, avatar), les options deviennent défilantes. La capture seule ne révèle pas si **toute la page** ou uniquement **la liste interne** défile.
- Les cartes de sélection n'ont pas de séparateurs individuels supplémentaires entre option et libellé : toute la surface est vraisemblablement une cible tactile.

## B.4. Inventaire complet des composants visuellement distincts

### Composant 01 — Retour global
- Icône flèche vers la gauche, trait relativement épais, couleur turquoise pastel.
- Pas de label « Retour » adjacent.
- Hitbox inconnue, mais icône proche du bord gauche.
- Sémantique : revenir d'une étape ; destination à vérifier.

### Composant 02 — Stepper elliptique
- Suite d'ellipses blanches.
- Disque = étape inactive ; pilule allongée = étape courante.
- Taille et contraste inchangés pendant le parcours.
- Pas de segment de liaison, texte, étape « terminée » différenciée ou valeur de pourcentage.
- Chaque jalon prend une place horizontale fixe sauf l'étirement de l'actif.

### Composant 03 — CTA vert avec relief
- Presque toute la largeur, bords très arrondis.
- Texte blanc gras et très grand.
- Couche sombre sous la face verte évoquant une base en volume/ombre inférieure de 7–10 px dans la capture.
- Flèche droite sur certaines variantes (« Commencer », « C'est parti », dernière « Continuer »), absente d'autres (« Valider », « J'ai compris », « Continuer » des choix).
- État pressé, état disabled, animation et feedback haptique **non observés**.
- À ne pas confondre avec les cartes sélectionnées, même si teinte verte proche.

### Composant 04 — Carte de choix centrée
- Fond bleu-gris, border fine, rayon important.
- Libellé blanc centré horizontalement et verticalement.
- État choisi = fond vert (âge, motivation).
- Ni checkbox visible, ni puce radio, ni coche.
- CTA explicite sous la liste pour valider.

### Composant 05 — Carte de pays à navigation
- Avatar de pays = drapeau emoji, grand, aligné à gauche.
- Nom en texte très grand, aligné à gauche.
- Surface simple (pas de sélection verte au moment de l'observation).
- Carte autodétectée = sous-titre turquoise supplémentaire et chevron à droite.
- Sélection apparente déclenchant un second niveau de liste ; **inférence**.

### Composant 06 — Carte de région à navigation
- Texte grand et aligné à gauche.
- Pas de drapeau dans chaque ligne, car pays rappelé au-dessus.
- Pas de CTA associé dans la capture.
- Doublon de retour (global / sous-sélecteur) à vérifier.

### Composant 07 — Champ libre
- Grand rectangle arrondi fond bleu-gris.
- Bordure claire visible autour de toute la forme, plus affirmée que celles des options.
- Texte grand, blanc, curseur turquoise.
- Déclenchement du clavier système ; CTA placé sous le champ dans la fenêtre redimensionnée/repositionnée.
- Le texte de substitution, label HTML et attributs du champ ne sont pas visibles dans l'état photographié.

### Composant 08 — Sélecteur de portrait
- Portrait circulaire à fond rouge avec cadrage homogène.
- Légende nom sous chaque image, sur une ou deux lignes.
- Contour turquoise lorsque choisi ; pas de coche.
- Galerie de trois colonnes, plusieurs rangées.
- Biographie contextuelle sous la zone portraits ; association probable au choix actif.

### Composant 09 — Carte de preuve sociale
- Accueil : aucun fond de carte spécifique, encadrement par lauriers.
- 92 % : chiffre hors carte, commentaire dans carte bleue.
- Équipe régionale : chiffre à l'intérieur d'une carte grise.
- **Même intention rhétorique, trois compositions différentes** : le produit varie la mise en scène des statistiques pour éviter la répétition.

### Composant 10 — Barre / zone de pied
- Même rôle sur 02–07 et 10 : réserver de la place à un CTA isolé.
- Pas de barre de navigation interne Home/Leçons/Profil observée.
- Pas de bouton de « fermer » explicite sur le parcours.
- Sur 08–09, espace libéré pour listes ; pas de CTA vert affiché.

### Composant 11 — Illustration mascotte
- Même identité visuelle, deux attitudes/emplacements.
- Palette de cheveux bleus, peau pêche, détails du visage lisibles à petit format.
- Dans la page 01, une silhouette « sous la barre » crée une situation comique/fragile.
- Dans la page 02, une plume et un V de la main donnent un ton confiant et encourageant.
- Aucune preuve d'une animation entre ces poses ni d'un système de sprites.

### Composant 12 — Zone légale / liens
- Liens de connexion et code très visibles, soulignés.
- Texte de confidentialité non réduit à une micro-taille ; liens internes à la phrase.
- Écran promotionnel seul, pas répété dans le onboarding capturé.

## B.5. Règles de hiérarchisation de l'attention

**Page héro / accueil :** promesse typographique → émotion mascotte → réassurance chiffrée → bouton → options secondaires → conformité.

**Écran narratif :** personnage → présentation personnelle → promesse de soutien → CTA.

**Écran de questionnaire :** progression → question → éventuel motif explicatif → options larges → CTA.

**Page statistique :** progression → métrique géante → explication → encadré narratif → CTA.

**Écran pseudo :** progression → instruction → unique champ → CTA → clavier OS, sans autre distraction.

**Galerie avatar :** progression → identité culturelle à choisir → vignette sélectionnée → texte de contexte → CTA.

**Territoire :** progression → intention de compétition → liste de pays → sous-liste de régions → validation sociale avec chiffre → CTA.

L'application évite à chaque fois d'afficher simultanément un **tableau de bord**, plusieurs compteurs de monnaie, une navigation à onglets et un formulaire. C'est un tunnel de découverte, pas une page d'accueil fonctionnelle.

---

# ANNEXE C — États UX, logique probable et points non observables

## C.1. États par composant et matrice de test réutilisable

| Composant | État VU | Autres états à examiner | Risque à reproduire |
|---|---|---|---|
| Option âge | 1 active, 5 inactives | aucune active, deuxième choix, retour, changement | validation sans choix, choix ancien perdu |
| Option motivation | 1 active, 4 inactives | retour, absence de choix, changement | objectif déclaré mais jamais utilisé |
| Page 92 % | affichage statique | carte cliquable ? retour ? rafraîchissement ? | chiffre marketing présenté comme statistique vérifiée |
| Pseudo | champ rempli et focus | vide, trop long, filtrage, trim, Unicode, emoji, doublon, validation | clavier masque CTA, pseudo offensant affiché publiquement |
| Avatar | Dumas sélectionné + bio | aucune sélection, changement, fin de galerie, portrait manquant | grille tronquée, biographie décalée |
| Pays | USA suggéré, France visible | pays avec/sans subdivisions, recherche, refus localisation | impasse de navigation, confusion choix détecté/choix réel |
| Région | liste France sans choix sur image | scroll début/fin, sélection, double retour | perte du pays choisi, liste inaccessible |
| Confirmation région | Grand Est + chiffre | absence de données, 0 participants, région non supportée | score fictif, mauvaise affiliation |
| Stepper | 13/14 points, étape active | retour, saut, dernière étape, très petit écran | débordement/collision avec Retour |
| CTA | action visible | chargement, disabled, tap répété, erreur réseau | double validation ou changement d'écran prématuré |
| Liens accueil | soulignés | navigation compte/code/légal, retour | tunnel de création inaccessible, perte d'étape |
| Barre Android | visible | clavier Gboard, navigation gestuelle, rotation, zoom | mauvaise prise en compte safe-area / visualViewport |

## C.2. Navigation hiérarchique vs parcours global

Deux mécanismes indépendants paraissent coexister :

1. **Navigation dans l'onboarding** — étape précédente / suivante ; progression en haut (flèche turquoise + dots).
2. **Navigation dans le sélecteur géographique** — pays → région ; seconde flèche retour dans le contenu de l'écran France.

Cela implique, **dans une reconstruction hypothétique**, au minimum un état « étape courante » et un état « sous-page du sélecteur ». Si l'on confond les deux, le bouton « Retour » peut remonter deux étapes au lieu de revenir à la liste des pays.

**Test concret futur :** entrer dans France → Grand Est, puis revenir ; vérifier si on revient à la région, aux pays, ou à l'étape précédente, et si le choix France demeure. Le même test doit être exécuté avec le **bouton Retour Android**, distinct des flèches dessinées.

## C.3. États de progression distincts

Les captures illustrent trois notions souvent confondues :

- **Page physique** : un écran réel, ici dix fichiers capturés.
- **Jalon visible** : un des 13/14 repères.
- **Microétape** : sous-écran du même jalon (motivation → réassurance, pays → région).

**Observation :** 04/05 partagent l'actif n°4 ; 08/09 partagent l'actif n°7. Ainsi, 2 pages ne signifient pas toujours 2 déplacements de la pilule. Toute éventuelle implémentation devrait porter explicitement un index de jalon indépendant de l'identifiant de page pour éviter de dériver naïvement les points d'un tableau d'écrans.

## C.4. Priorisation du profil et traitement des données

- Âge par fourchette : réduit la précision collectée ; justification affichée (adapter difficulté et vocabulaire).
- Motivation : variable catégorielle plutôt que texte libre ; cinq valeurs visibles.
- Pseudo : la seule entrée libre des captures.
- Avatar : valeur choisie dans un catalogue fini.
- Pays / région : donnée de regroupement géographique avec option de changement annoncée.

**Cela n'établit pas** si des données sont envoyées au serveur avant le premier cours, combien de temps elles sont conservées, ni si elles sont nécessaires à l'apprentissage. Pour LuxApp, chaque champ ajouté doit avoir une finalité réelle, un stockage explicable et un comportement invité/compte.

## C.5. Conception du feedback

**Observé :**
- Sélection confirmée immédiatement par la couleur ou le contour.
- Pas de spinner ni barre de chargement.
- Pas de toast, alert, snackbar, check animé ou panneau d'erreur.
- Les écrans de réassurance ne sont pas des résultats d'exercices et ne montrent pas de score calculé.

**À vérifier, non observé :**
- Tap-down et tap-up (transformation, fondu, haptique, vibration).
- Transition écran suivante (slide, fade, morph, zoom, sans animation).
- Animation de Momo et de la pilule active.
- Retour audible, voice-over, narration ou prononciation.
- Gestion des erreurs réseau, offline, lenteur et invalidité.

## C.6. Design émotionnel : une alternance définissable

| Phase | Déclencheur | Emotion suggérée par l'UI | Élément matérialisant |
|---|---|---|---|
| Accroche | voir l'application | curiosité / défi | bataille + mascotte inquiète |
| Rencontre | présentation | confiance / complicité | Momo souriant qui promet d'aider |
| Profil 1 | tranche d'âge | pertinence | adaptation annoncée |
| Profil 2 | motivation | autonomie | choix du « pourquoi » |
| Réassurance | 92 % | optimisme | chiffre / promesse ludique |
| Nom | pseudo | appropriation | identité textuelle choisie |
| Avatar | culture | représentation | figure littéraire + biographie |
| Territoire | pays/région | appartenance | affiliation géographique |
| Confirmation | Grand Est + 3 116 | contribution | groupe actif et victoire hebdomadaire à viser |

C'est une **lecture de design** ; les émotions réelles des utilisateurs ne sont pas mesurées.

---

# ANNEXE D — Analyse approfondie Android, responsive, accessibilité et reconstruction

## D.1. Invariants de lisibilité mobile reconstituables

- Tous les choix listés offrent de **grandes zones tactiles** ; les utilisateurs n'ont pas à viser une petite case radio.
- Les libellés simples sont centrés, ceux des listes longues sont à gauche pour accélérer le balayage vertical.
- Le CTA est séparé de la zone de réponse et garde une distance avec la barre système.
- Le retour visible se trouve toujours dans la même zone supérieure, sauf retour additionnel du sous-sélecteur.
- L'écran entier adopte un **fond de marque continu** ; pas de flash blanc visible dans les images.
- La saisie du pseudo est le seul cas avec clavier ouvert, dont le contenu critique reste accessible.
- Les pages longues montrent le contenu coupé **de manière régulière à la frontière d'un conteneur**, ce qui signale la nécessité d'un vrai scroll.
- Les illustrations ne remplacent pas les intitulés : un lecteur voit le nom de l'avatar ou le pays en texte.
- La page de région contient deux retours : une validation d'accessibilité doit préciser leur nom vocal et leur cible.

## D.2. Problèmes qui apparaîtraient sur 320–430 CSS px si on copiait les tailles raster

**A ne pas faire :** appliquer un style 110px de haut aux cartes parce que la capture montre 110 pixels. Le téléphone source utilise un facteur d'échelle inconnu. Il faut d'abord choisir une largeur de référence en CSS, rendre, comparer visuellement et tester le clavier.

Pour une implémentation hypothétique mobile-first :
- Utiliser **des tailles adaptatives** (rem/clamp et espace disponible) et des dimensions minimales tactiles.
- Garder **un unique scroll vertical prévisible** par vue, ou documenter précisément la zone scrollable si footer fixé.
- Eviter de fixer le CTA à une coordonnée absolue : le clavier, le texte agrandi et la hauteur dynamique changent le viewport.
- Réserver un **padding-bottom** compatible avec la hauteur du footer/safe-area quand la liste défile.
- Respecter la zone de **safe-area** en bas et les insets système.
- Pour une saisie, tester interaction entre **visualViewport**, redimensionnement effectif et clavier Samsung/Gboard ; ne pas coder autour d'une hauteur de clavier fixe.
- Empêcher le **double scroll** (corps + liste) qui piège les gestes.
- Ne pas imposer un plein écran immersif : les captures montrent volontairement les barres Android.
- Afficher un état focus distinct et accessible sur chaque composant.
- Tester des noms longs (ex. régions), l'augmentation de la police Android et les traductions longues.

## D.3. Tests visuels reproductibles conseillés

**Jeu de viewports de recette** : 320 × 700, 360 × 740, 390 × 844, 430 × 932 (en pixels CSS de navigateur) puis téléphone Samsung réel. Il s'agit de tailles **de test proposées**, pas de dimensions de l'application d'origine.

Pour chaque écran :
1. Contrôler visibilité du **titre complet**, de l'objet central et de la prochaine action.
2. Vérifier le **nombre de scrolls nécessaires** et la possibilité d'atteindre la dernière option.
3. Tester avec texte système **130 % et 200 %** ; aucun libellé ne doit disparaître dans un bouton.
4. Tester navigation Retour app et Retour Android ; le pays et la région doivent rester cohérents.
5. Tester démarrage sans connexion, sans géolocalisation et sans statistiques disponibles.
6. Tester lecture vocale des éléments, ordre de focus et nom du bouton.
7. Vérifier contraste et état sélectionné **sans dépendance exclusive à la couleur**.
8. Vérifier barre d'étapes **sans chevauchement** avec retour, même à 13–14 jalons.
9. Vérifier effets press/tap et suppression des animations selon préférences système.
10. Capturer screenshot de chaque état, noter la version et le téléphone. Une capture de code ou une CI verte ne valide pas une ergonomie Android.

## D.4. Checklist de fidélité pour reconstruire le parcours à titre expérimental

**Fidélité visuelle :**
- couleur de fond, de carte, d'action et de sélection cohérentes dans toute la séquence ;
- largeur des colonnes, respirations, zones verticales et alternance de centrage ;
- distinction lisible entre serif narratif et sans-serif fonctionnel ;
- illustrations à la même place relative, sans écraser les textes ;
- CTA reconnaissable d'un écran à l'autre ;
- états de sélection explicites ;
- portraits à style graphique homogène ;
- listes sans chevauchement par un footer ;
- position stable de la progression/Retour.

**Fidélité comportementale :**
- choix exclusif sans validation intempestive ;
- possibilité de corriger un choix au retour ;
- mini-étapes ne modifiant pas forcément le jalon ;
- avatar et sa biographie synchronisés ;
- sous-navigation pays/région séparée du tunnel ;
- bascule du CTA au-dessus du clavier ;
- limites de saisie et validation des pseudos ;
- persistence/reprise après interruption ;
- vraie affiliation de région liée à l'activité si elle est annoncée ;
- statistiques authentiques et explicables.

**Fidélité pédagogique/produit :**
- personnalisation si et seulement si elle impacte une expérience réelle ;
- motivation et région facultatives si elles n'ont pas de valeur immédiate ;
- apprentissage accessible rapidement ;
- pas de métrique décorative fabriquée ;
- onboarding bref ou reportable si nécessaire ;
- respect du niveau A1.1/A1.2 et des exercices existants.

---

# ANNEXE E — Comparaison avec LuxApp 2.1 réel et garde-fous de design

Cette comparaison a été complétée **sur le code GitHub de la branche 2.1** et ses documents, non sur les anciennes pièces jointes.

## E.1. Architecture et composants déjà présents dans 2.1

- **public/index.html** : inclusions explicites de design-tokens.css, components.css, style.css, accueil-v21.css, jeux-v21.css, revision-v21.css, chemin-v21.css, lecon-v21.css, mission-intro-v21.css, etc.
- **public/index.html** : un **portail-auth** indépendant du dashboard (SPEC 63), un écran accueil, un écran jeux, un écran survie, un écran réglages et un écran Chemin, plus les vues pédagogiques.
- **public/design-tokens.css** : système de tokens existant avec catégories fonds, surfaces, bordures, typographies, espacements, rayons, hauteurs et feedback tactile.
- **public/components.css** : composants partagés (CTA, boutons, labels, cartes, retour, footer, tailles tactiles) déjà définis.
- **docs/CHARTE_UI_2.1.md** : charte visuelle approuvée **chaleur / sobriété / fond chaud**, serif éditorial, accent d'action **or #F5CF4D**, pas bleu nuit/vert automatique.
- **AGENTS.md / PLAYBOOK.md** : exigent de préserver la progression, les exercices, les états, la navigation, la sauvegarde et les tests ; nouvelles expérimentations UI sur **2.1**.
- **TODO.md** : P0 d'abord (stabilité, clavier, navigation, cloud, validation Samsung), puis **P1-10 « Simplifier le premier lancement »**.
- **docs/RECETTES-2.1.md** : protocole de recette isolé ; aucun changement d'exercices n'est justifié par le présent benchmark.

## E.2. Comparaison conceptuelle

| Sujet | App observée | LuxApp 2.1 actuel | Ce que le benchmark permet de discuter |
|---|---|---|---|
| Identité de marque | Bleu nuit + vert + personnage Momo | Fond chaud + action or + patrimoine luxembourgeois | Incarner sans copier la palette |
| Entrée | Long tunnel d'engagement avant exercices | Portail et accueil puis chemin pédagogique | Arbitrer friction initiale vs appropriation |
| Mascotte | Personnage-dialogue humanisé | Mise en scène éditoriale et contextes pédagogiques | Évaluer si un guide récurrent serait utile |
| Avatar | Personnalités littéraires en grille | Non établi comme mécanisme équivalent | Tester intérêt sans confondre pédagogie et décoration |
| Territoire | Batailles pays/région hebdomadaires annoncées | Jeux / Survie existants ; pas de compétition régionale établie ici | Définir justice, consentement et anti-triche avant d'envisager |
| Progression onboarding | 13/14 jalons visuels | Progression de leçons, missions et jeu déjà structurée | Ne pas remplacer maîtrise réelle par compteur narratif |
| Statistiques | Popularité, satisfaction, activité régionale | Indicateurs personnels fondés sur progression | N'utiliser que des statistiques vérifiables |
| Couleur succès/action | Vert sur CTA et sélection | Or action, vert réussite, turquoise révision | Préserver absolument la sémantique 2.1 |
| Écran clavier | Pseudo visible au-dessus du clavier Samsung | Risque P0-02 documenté pour écriture | Étudier la géométrie, ne pas copier le CSS |
| CTA | Grand bouton green 3D | CTA or prévu et composants partagés | Récupérer la lisibilité/relief si compatible charte |

## E.3. Règles d'intégration si une expérimentation Luxo est demandée plus tard

1. **Ne pas implémenter directement ce benchmark**. Il consigne les faits et pistes, sans valider un redesign.
2. Ne jamais recopier un écran, des illustrations protégées ni le personnage Momo ; inventer une identité originale.
3. Ne pas passer de l'or à un vert d'action pour « ressembler » à l'application observée : c'est contraire au design system de 2.1.
4. Maintenir la hiérarchie : marque/niveau → contexte → une action prioritaire → alternatives.
5. Faire de la personnalisation une **valeur pédagogique mesurable** (travail, installation, démarches, Sproochentest, objectifs) plutôt qu'une collecte pour le décor.
6. Si l'on crée un parcours d'entrée, permettre à l'utilisateur de **débuter rapidement une leçon** ; profiler plus tard certaines préférences si possible.
7. Pour les jeux communautaires, établir sources des scores, équité des territoires, fréquence des saisons, pseudonymes et anti-triche **avant** de dessiner des classements.
8. Séparer identité joueur / données de progression / comptes cloud et maintenir une expérience invité.
9. Toute maquette doit être testée sur Android **clavier ouvert**, petites hauteurs, navigation système, texte grand et retour.
10. Respecter PLAYBOOK, AGENTS, la charte UI 2.1 et les recettes avant tout changement fonctionnel ; conserver l'existant.
11. Ne pas modifier les JSON de leçons pour illustrer un benchmark graphique.
12. Garder les métriques sociales **réelles** ; utiliser un vrai état vide plutôt qu'un nombre arbitraire.

---

# ANNEXE F — Référentiel de capture, précision et suivi d'observation

## F.1. Index du corpus

1. 54135.jpg — écran marketing, promesse, masque de Momo, preuve sociale, création/connexion/code.
2. 54137.jpg — Momo joyeux, plume, bienvenue, jalon 1/13.
3. 54139.jpg — âge, 25–34 ans sélectionné, jalon 3/13.
4. 54141.jpg — motivation, « Par amour du français » sélectionné, jalon 4/13.
5. 54143.jpg — chiffre 92 %, argument ludique, même jalon 4/13.
6. 54145.jpg — pseudo saisi, clavier Android visible, jalon 5/13.
7. 54147.jpg — galerie illustrée, Dumas choisi, biographie, jalon 6/13.
8. 54149.jpg — choix pays, États-Unis proposés par détection, France visible, jalon 7/13.
9. 54151.jpg — liste France/régions, double retour, Grand Est visible, jalon 7/13.
10. 54153.jpg — Grand Est confirmé, 3 116 annoncés, jalon 8/14.

Toutes les images sont fournies par l'utilisateur dans la conversation du 23 octobre 2026. Elles ne sont **pas** jointes à ce fichier GitHub et aucune illustration originale de l'application observée n'a été copiée dans le dépôt.

## F.2. Factuel, probable, inconnu : synthèse de fiabilité

**Certain et directement visible :**
- 10 captures en portrait Android ;
- textes et options reproduits dans la partie principale ;
- plusieurs variantes de CTA vert ;
- fond bleu nuit / surfaces bleu-gris ;
- choix de pseudo/avatar/pays/région ;
- mascotte en deux illustrations ;
- indicateur de progression avec changement de 13 à 14 ;
- coexistence page « 92 % » et page de motivation au même jalon ;
- coexistence pays/région au même jalon ;
- champ et bouton visibles avec clavier ouvert ;
- découpe de certaines listes/portraits dans la fenêtre ;
- statistiques **affichées** « +900 000 », « 92 % », « 3 116 ».

**Probable mais à reproduire avant de conclure :**
- navigation immédiate de pays vers région ;
- portrait et biographie synchronisés ;
- stockage des choix de profil ;
- footer réellement fixe ;
- rendu d'avatar dans des composants scrollables ;
- personnalisation ultérieure du cours ;
- véritable compétition hebdomadaire.

**Totalement indéterminé :**
- langages, framework, API, base de données ;
- règles et mécaniques du jeu ;
- qualité réelle des chiffres affichés ;
- logique de scoring ou matchmaking ;
- animations et haptique ;
- sauvegarde du pseudo et visibilité sociale ;
- résultat des clics sur options secondaires ;
- politique de protection des mineurs ;
- accessibilité réelle et performances de l'application.

**Statut final de ce document : ARCHIVE DE RÉFÉRENCE UI/UX ENRICHIE sur la branche 2.1, sans modification de code, de design tokens, de jeux ou de contenu pédagogique.**


---

# ANNEXE G — Deuxième série : dix captures supplémentaires, du choix des priorités à l'essai premium

**Ajout du 23/10/2026, branche 2.1.** Cette annexe prolonge **le même benchmark** : l'ancien corpus 54135–54153 représente les écrans 01–10 ; les dix images 54155–54173 constituent les **écrans/états photographiés 11–20**. Le total du dossier devient **20 captures**. Aucun code de l'application étudiée n'est accessible ; seuls les éléments visuels, textes et enchaînements peuvent être décrits avec certitude.

**Convention complémentaire :** [OBSERVÉ] = visible dans les nouvelles captures ; [MESURÉ] = échantillon effectivement lu dans les fichiers JPG de 709×1536 pixels ; [HYPOTHÈSE] = fonction ou mécanisme possible mais non démontré. Les dimensions dans les tableaux sont des positions en pixels **du JPEG**, pas des dimensions CSS ou dp Android. Lorsque des captures montrent le même jalon, elles peuvent être des états successifs d'un seul écran et non des pages différentes.

## G.1 — Tableau d'inventaire et continuité de la séquence

| Image | Réf. | Repère actif à y≈95 (sur 14) | Élément principal | Bouton(s) visible(s) | Nature de la capture |
|---|---|---|---|---|---|
| 54155.jpg | 11 | 9/14 | « Quelles sont tes priorités ? » : choix d'objectifs | « Continuer » | Questionnaire, sélection cochée |
| 54157.jpg | 12 | 9/14 | « C'est toi, ça ? » : je relis mon message | Grandes réponses « Non » / « Oui » | Première affirmation autoévaluative |
| 54159.jpg | 13 | 9/14 | « C'est toi, ça ? » : une faute dans un e-mail professionnel | « Non » / « Oui » | Deuxième affirmation, même jalon |
| 54161.jpg | 14 | 10/14 | « Comment as-tu connu Français sans Fautes ? » | Options de canal + « Continuer » gris | Attribution marketing / acquisition |
| 54163.jpg | 15 | 12/14 | Logos universitaires, « Création de ton parcours », 100 %, témoignage | « Voir mes résultats » | Écran de préparation / réassurance |
| 54165.jpg | 16 | 12/14 | « Tes futurs résultats », première promesse | « Continuer » | État 1 de la timeline |
| 54167.jpg | 17 | 12/14 | Même titre ; deuxième promesse apparue | « Continuer » | État 2 de la même timeline |
| 54169.jpg | 18 | 12/14 | Même titre ; troisième promesse partiellement visible | « Voir le parcours » | État 3 / zone basse tronquée |
| 54171.jpg | 19 | 12/14 | Timeline défilée : troisième promesse lisible | « Voir le parcours » | Autre position de défilement |
| 54173.jpg | 20 | 13/14 | Mascotte avec cadeau, « 7 jours offerts » | « J'en profite » | Offre d'essai premium |

**Fait structurel nouveau :** sur toutes ces captures, le compteur possède **14 repères** à y≈95. Cela confirme que le passage de 13 à 14 constaté à partir de 54153 n'était pas limité à une seule image. **L'origine de ce changement reste inconnue** : il peut être lié à une variante de parcours, un défaut du stepper ou une répartition différente des étapes.

**Autre fait important :** le 11e jalon n'est **pas** représenté dans cette nouvelle série (on passe du 10e actif à l'écran 54161 au 12e actif dans 54163). De même, aucune preuve ne relie chaque page visuelle à un jalon unique. **Ne pas inventer la page manquante ni les étapes réelles non filmées.**

## G.2 — Capture 11 (54155.jpg) : priorités et choix d'objectifs

### Textes relevés [OBSERVÉ]

- En haut, flèche Retour turquoise et **14 indicateurs** ; le **9e** prend la forme d'une pilule allongée.
- Grand titre sur deux lignes, centré et gras : **« Quelles sont tes priorités ? »**
- Sous-titre sur deux lignes : **« On va personnaliser ton expérience. »**
- Trois grandes cartes **avec libellé à gauche et contrôle circulaire à droite** :
  - **« Écrire sans fautes »**, sélectionnée ; fond vert, petite pastille blanche à droite contenant une coche verte.
  - **« M'exprimer plus clairement »**, inactive ; fond bleu-gris, cercle vide à droite, texte sur deux lignes.
  - **« Enrichir mon vocabulaire »**, inactive ; même style, texte sur deux lignes.
- Gros bouton vert inférieur **« Continuer »**.

### Mesures et composition

| Élément | Estimation sur 709×1536 |
|---|---|
| Titre | x≈140–573, y≈195–321 |
| Sous-titre | x≈155–559, y≈355–435 |
| Première carte verte | x≈63–646, y≈499–625 (hauteur ~126) |
| Deuxième carte | x≈63–646, y≈649–833 (hauteur ~184) |
| Troisième carte | x≈63–646, y≈858–1043 (hauteur ~185) |
| CTA | x≈86–623, y≈1287–1390 |

- Les cartes **n'ont pas toutes la même hauteur** : la première tient sur une ligne, les deux autres sur deux ; la zone de contrôle circulaire reste alignée verticalement au milieu de chaque carte.
- Le bord droit des cartes apparaît légèrement **coupé** autour de x≈646 (portion plate verticale dans cette capture), contrairement aux rectangles parfaitement arrondis de l'écran âge. À auditer comme effet de **conteneur, clipping, padding ou masquage**, pas comme propriété CSS certaine.
- La sélection dispose ici de **deux indices visibles** (fond vert + coche) : elle est plus accessible que les cartes vertes sans coche des premiers écrans.
- L'espacement vertical avant le CTA est très grand, et l'option 3 ne risque pas de toucher le pied de page dans la capture affichée.
- La question est au pluriel (« priorités ») et utilise des **cases cochées** plutôt que des radios classiques. **[HYPOTHÈSE]** Il pourrait s'agir d'une **sélection multiple** ; la capture ne montre qu'**une** option choisie et ne prouve pas que deux peuvent l'être simultanément.
- L'utilisateur n'entre pas de texte libre : la personnalisation conserve un coût d'interaction très faible.

### Fonction UX

Cet écran passe d'une information descriptive (« quel âge as-tu / pourquoi es-tu ici ? ») à une intention d'apprentissage **opérationnelle** : orthographe, expression, lexique. Pour LuxApp, le parallèle possible serait de distinguer **prononciation/compréhension orale**, **vocabulaire du quotidien**, **grammaire/écriture**, **Sproochentest**, sans créer des objectifs qui n'influencent jamais le parcours. Il s'agit d'une transposition analytique, non d'un choix d'implémentation.

## G.3 — Captures 12 et 13 (54157.jpg / 54159.jpg) : auto-identification par phrases, réponses binaires

### Structure visuelle commune [OBSERVÉ]

- Même 9e jalon actif sur 14 : les deux propositions restent dans **le même grand segment de personnalisation** que l'écran des priorités.
- Grand titre **« C'est toi, ça ? »**, centré, gras, ponctuation familière.
- Consigne au-dessous : **« Lis cette phrase et dis-nous si tu te reconnais. »**
- Grande carte bleue centrée, texte entre guillemets français **« … »**, affiché en **italique** et sur trois lignes.
- **Deux grands pavés bleus carrés/rectangulaires** dans la partie basse, disposés côte à côte :
  - À gauche : une **croix orange** (dessin X) puis **« Non »** en blanc gras.
  - À droite : une **coche verte** puis **« Oui »** en blanc gras.
- Contrairement aux écrans précédents, **aucun troisième bouton « Continuer »** n'est visible. Les deux pavés semblent constituer les actions principales, avec choix immédiat probable.
- Il n'y a **aucun état sélectionné ou corrigé** visible ; les icônes colorées signifient les réponses, pas la réussite/erreur à un exercice.

### Textes exacts de chaque affirmation

**54157 — Affirmation 1 :**

> « Je relis mon message plusieurs fois avant d'appuyer sur Envoyer. »

**54159 — Affirmation 2 :**

> « Une faute dans un email pro me reste en tête toute la journée. »

Important : la deuxième formulation écrit bien **« email pro »** (pas « e-mail professionnel »), et la première capitalise **« Envoyer »** ; conserver ce vocabulaire lors de la transcription.

### Géométrie observable

| Élément | Rectangle approximatif commun |
|---|---|
| Titre | x≈176–544, y≈193–250 |
| Consigne | x≈88–617, y≈279–352 |
| Carte de citation | x≈79–630, y≈417–682 (~551×265) |
| Pavé gauche | x≈79–339, y≈1153–1412 (~260×259) |
| Pavé droit | x≈370–630, y≈1153–1412 (~260×259) |
| Espace entre pavés | ≈31 px |
| Bord inférieur de l'app avant navigation | ≈1415–1468 |

- La carte citation ne comporte ni titre interne, ni icône, ni bordure forte, ni auteur : l'affirmation est **l'unique contenu**.
- Typographie centrale : texte grand, italique, guillemets français typographiques, interligne généreux ; la première citation commence par « Je » et interpelle la **reconnaissance de soi**.
- Les boutons « Oui/Non » ont une **proportion presque carrée**, contrairement aux choix âge/motivation très larges et horizontaux.
- Le symbole en haut du pavé et son label en bas sont **séparés verticalement**, rendant le choix lisible au regard comme au pouce.
- Les icônes ont des couleurs chaudes/froides fortement distinctes de la surface bleue commune. La croix orange ne signifie pas une « mauvaise réponse » : ici, les deux réponses sont a priori légitimes.
- Le centre de l'écran reste très vide entre citation et pavés ; cela fait de la réflexion et de l'autoévaluation la tâche centrale.
- Sur 54159, l'aspect intérieur de la carte autour des lettres est légèrement différent par compression/éclairage JPEG ; aucune raison de conclure à une autre couleur d'état.

### Fonction et mécanisme psychologique [HYPOTHÈSE]

Les deux phrases portent sur une **appréhension sociale de l'erreur** : multiplier les vérifications avant d'envoyer, puis ruminer une faute en contexte professionnel. La technique est celle d'une affirmation concrète et familière plutôt que d'une question abstraite (« Es-tu anxieux face à l'écrit ? »). Cette reconnaissance peut servir à personnaliser le discours de l'application, mais **rien ne prouve** qu'elle modifie les contenus ou qu'elle réalise un test psychométrique.

**À vérifier :** progression au tap Oui/Non, persistance d'une réponse si retour, possibilité de changer, ordre des affirmations, nombre total, éventuelle adaptation au métier, neutralité de l'expérience si l'utilisateur répond Non à tout, présence d'une sauvegarde.

## G.4 — Capture 14 (54161.jpg) : provenance de l'acquisition

### Contenu exact [OBSERVÉ]

Titre centré sur deux lignes :
**« Comment as-tu connu Français sans Fautes ? »**

Options visibles :

1. **Recherche Google**
2. **En cherchant sur le Play Store** — sur **deux lignes**.
3. **Instagram**
4. **Facebook**
5. **TikTok**
6. **YouTube**
7. Une **option supplémentaire partiellement visible** tout en bas de la zone défilante ; impossible de lire son libellé.

Un **bouton « Continuer » gris clair (#A6A6A6 dans un échantillon)** est présent dans une bande de bas d'écran. Son aspect est celui d'un **état désactivé**, sans preuve de l'attribut HTML disabled. Aucune option des six visibles n'est mise en surbrillance sur cette capture.

### Composants et géométrie

| Élément | Rectangle apparent |
|---|---|
| Retour + étape 10/14 | y≈83–107 |
| Titre | x≈91–618, y≈167–290 |
| Google | x≈59–650, y≈358–468 |
| Play Store | x≈59–650, y≈492–661, ~169 px car deux lignes |
| Instagram | x≈59–650, y≈686–795 |
| Facebook | x≈59–650, y≈819–928 |
| TikTok | x≈59–650, y≈953–1063 |
| YouTube | x≈59–650, y≈1087–1196 |
| Carte suivante, bord haut seulement | vers y≈1222–1235 |
| Bande de pied masquant la suite | à partir d'environ y≈1235 |
| CTA gris | x≈64–646, y≈1279–1375 |

**Détails du système :**
- Le formulaire mélange des canaux **organique web**, **store Android**, et **réseaux sociaux** au sein d'un seul groupe.
- Les cartes sont identiques aux sélections classiques et s'allongent pour les labels plus longs.
- Le bouton gris est placé **hors du scroll des options** visuellement, comme une zone fixe de validation ; l'implémentation exacte reste inconnue.
- L'option partielle montre qu'il y a **plus de réponses que l'espace visible**. Sans scroll correct ou avec un bouton qui masque le contenu, un utilisateur pourrait ne jamais voir toutes les options.
- **[HYPOTHÈSE]** « Continuer » deviendrait vert après sélection ; on ne voit pas cette transition.
- Cette information relève de la **mesure d'acquisition marketing**, pas du niveau linguistique ni d'une compétence pédagogique. Elle illustre qu'un tunnel peut intégrer de l'analytics sans l'annoncer comme tel. Pour LuxApp, imposer cette question avant la première leçon serait une friction supplémentaire à justifier.

## G.5 — Capture 15 (54163.jpg) : préparation du parcours, caution sociale, témoignage

### Découpage en trois preuves de réassurance [OBSERVÉ]

**Bloc 1 — Établissements mis en avant :**
- Texte uppercase et espacé : **« ILS L'UTILISENT AUSSI : »**.
- Une grande carte **blanche**, aux coins très arrondis, contrastant fortement avec le fond sombre.
- Trois logos, horizontalement alignés : **Sorbonne Université**, **ETH Zürich**, **University of Toronto**.
- Leur présence est une **affirmation promotionnelle de l'application**. Les captures ne démontrent **aucun partenariat, aucune licence, aucune validation par ces institutions**, ni la nature exacte de leur utilisation.

**Bloc 2 — Simulation de préparation :**
- Gros titre blanc **« Création de ton parcours »**, sur **deux lignes**.
- Étiquette **« 100% »** alignée vers l'extrémité droite d'une barre horizontale.
- Barre de remplissage **turquoise clair** presque pleine largeur, avec extrémités arrondies, autour de y≈777–792.
- **[OBSERVÉ]** On voit seulement l'état **100 % terminé**.
- **[INCONNU]** Aucun calcul de programme réellement personnalisé, durée de chargement, génération de leçons, progression de 0 à 100 %, appel réseau ou animation n'est visible sur une photo statique.

**Bloc 3 — Témoignage :**
- Carte bleu-gris arrondie en bas de page, dont le contenu est **partiellement caché** sous la zone du bouton.
- Cinq étoiles orange/jaune alignées **★★★★★**.
- Citation italique : **« J'adore les exercices, c'est comme un jeu ! Je redécouvre des règles que j'avais oubliées depuis l'école. »**
- Signature turquoise pâle : **« François, retraité passionné »**.
- Bouton vert à l'avant-plan : **« Voir mes résultats »**.

### Relevé spatial

| Élément | Position raster estimée |
|---|---|
| « ILS L'UTILISENT AUSSI : » | y≈250–279 |
| Bande blanche et logos | x≈79–630, y≈301–431 |
| Titre « Création… » | y≈550–680 |
| « 100 % » | x≈491–575, y≈734–765 |
| Barre turquoise | x≈134–575, y≈777–793 |
| Carte témoignage | x≈79–630, débute y≈840 et se poursuit au-dessous de y≈1240 |
| Étoiles | y≈893–925 |
| Citation | y≈947–1165 |
| Signature | y≈1197–1244 |
| CTA | x≈101–608, y≈1287–1390 |

### Analyse UX détaillée

- **Caution institutionnelle visuelle** : logos regroupés dans une **surface blanche**, vraisemblablement pour conserver la lisibilité et la fidélité des couleurs des marques. Ce n'est pas une mosaïque de logos répartis sur le fond sombre.
- **Progression terminale** : le pourcentage 100 % donne le sentiment d'une opération achevée. L'utilisateur perçoit un parcours qui a été « fabriqué pour lui », même si on ne sait pas si c'est le cas.
- **Témoignage cinq étoiles** : une seconde forme de preuve sociale plus qualitative. Les étoiles, la citation et la signature sont visuellement séparées (niveau de fiabilité non vérifiable).
- **CTA « Voir mes résultats »** : promet un résultat personnel. La capture suivante affiche cependant **« Tes futurs résultats »**, c'est-à-dire des bénéfices projetés, pas un score mesuré. Cette nuance est essentielle pour notre rétro-ingénierie.
- **Risque :** cumul important de techniques persuasives — institutions, chargement, avis, promesse de résultat — dans un écran. Un benchmark doit les noter sans les reprendre comme des faits.
- La signature ne prouve pas que François est une personne réelle ou que son témoignage a été recueilli avec son consentement.
- **Point de détail visuel** : c'est l'une des seules pages du tunnel qui introduisent un **grand aplat blanc**, une **barre turquoise horizontale** et des **étoiles jaunes** à la fois, tout en conservant le CTA vert constant.

## G.6 — Captures 16 à 19 (54165, 54167, 54169, 54171) : une « timeline de bénéfices » révélée

### Important : quatre photographies du **même écran logique**

- Même **titre**, sous-titre et jalon **12/14** sur les quatre images.
- Les captures 16 et 17 diffèrent par le **nombre de bénéfices visibles** (un, puis deux).
- La capture 18 montre **trois bénéfices**, le dernier partiellement masqué en bas ; son CTA a changé de libellé.
- La capture 19 montre **la même liste dans une autre position verticale** : le premier bénéfice est remonté au-dessus de la fenêtre, les second et troisième sont visibles.
- Il est donc plus fidèle de lire ce groupe comme une **progression de présentation et un défilement**, plutôt que quatre pages indépendantes.
- **[HYPOTHÈSE]** Le nouvel item peut être ajouté au clic sur « Continuer » avec une animation, ou être révélé par un changement d'état/scroll. Les images ne montrent **ni frames d'animation, ni événements de clic**, donc la temporalité et la transition sont inconnues.

### En-tête identique

**« Tes futurs résultats »**  
**« En seulement 5 minutes par jour »**

- Titre blanc très large, gras, centré autour de y≈196–241.
- Sous-titre blanc plus fin autour de y≈279–308.
- Retour cyan et stepper 12/14 à y≈83–107.
- À la différence de l'écran 15, aucune marque universitaire ni témoignage ; l'attention est focalisée sur un **chemin de résultats dans le temps**.

### Item 1 — visible dans les quatre états, sauf partiellement découpé après scroll (54165–54171)

- Icône : une **croix rose/fuchsia** sur **disque bleu très sombre**.
- Titre blanc gras : **« Moins de fautes »**.
- Délais annoncés en turquoise pâle : **« En quelques jours »**.
- Bénéfice détaillé en texte blanc, sur plusieurs lignes :  
  **« Tu comprendras et supprimeras 80 % de tes fautes les plus fréquentes. »**
- Une ligne verticale fine gris bleu descend sous le cercle de l'icône et occupe l'espace jusqu'au prochain item.
- Le **80 %** est une **promesse marketing future**, pas un score que cette photo aurait démontré. Aucun protocole ne justifie le chiffre.

### Item 2 — apparaît à partir de la capture 17

- Icône : **mégaphone** (emoji/illustration), sur disque bleu sombre.
- Titre : **« Phrases plus claires »**.
- Délai : **« En quelques semaines »**.
- Texte : **« Tu auras une communication plus efficace et structurée. »**
- Même colonne gauche d'icônes, même titre en blanc gras, même délai turquoise, même description blanche.
- Trait vertical gris bleu prolongeant la timeline.

### Item 3 — partiellement visible sur la capture 18, lisible après scroll sur 19

- Icône : **cœur bleu** sur disque bleu sombre.
- Titre : **« Vocabulaire enrichi »**.
- Délai : **« En quelques mois »**.
- Texte : **« Ton vocabulaire sera enrichi, tu t'exprimeras avec plus de précision. »**
- Sur 54169, la partie inférieure de la description est **masquée par la bande basse** au-dessus du CTA.
- Sur 54171, un **défilement du contenu** déplace les items et fait apparaître la description entière.
- Le changement de visibilité n'est pas un quatrième bénéfice : c'est **le troisième item de la même frise**.

### Actions affichées et séquence apparente

| Image | Items visibles | CTA en pied | Ce qu'on peut déduire |
|---|---|---|---|
| 54165 | 1 | **Continuer** | Première étape visuelle de présentation |
| 54167 | 1 + 2 | **Continuer** | Deuxième promesse désormais affichée |
| 54169 | 1 + 2 + début 3 | **Voir le parcours** | Troisième promesse présente, peut-être état final |
| 54171 | fin du 1 + 2 + 3 entier | **Voir le parcours** | Scroll du contenu, footer stable visuellement |

**Point UX très instructif :** la **commande change de signification** en fin de séquence. Tant qu'il reste du contenu à présenter, « Continuer » ; lorsque les trois bénéfices sont là, **« Voir le parcours »**. Cela montre un type d'interface où le CTA n'est pas seulement « suivant » mais **indique le prochain acte de l'utilisateur**.

### Géométrie de la frise

- Icônes/cercles disposés dans une colonne à gauche, centrés autour de **x≈138**.
- Ligne de connexion verticale près de **x≈136–139**.
- Colonne de textes commence autour de **x≈205**.
- Premier item démarre autour de **y≈377**, avec titre près de y≈398 et description y≈513–669.
- Deuxième item démarre autour de **y≈743–766**, avec description jusqu'à environ y≈987.
- Troisième item démarre autour de **y≈1061–1090** dans l'état non défilé ; sa description se poursuit **au-delà du footer** dans 54169.
- Dans 54171, la position scrollée remonte le deuxième item autour de **y≈640** et le troisième autour de **y≈966** ; la ligne de connexion et les textes défilent ensemble.
- CTA standard bas : **x≈86–623, y≈1287–1390**.
- **Zone du contenu limitée avant ~y=1210–1240** : la présence du footer semble contraindre la hauteur réellement lisible.
- Le décalage temporel (« jours / semaines / mois ») est porté **par des étiquettes turquoise**, distinctes des titres blancs et des descriptions.

### Traits stylistiques

- Graphisme plus **fonctionnel/éditorial** que les pages Momo : une chronologie à icônes, traits verticaux et textes.
- Contrairement aux cartes de choix, les items ne sont **pas enfermés dans trois grandes cartes** ; seul le pictogramme reçoit une surface circulaire.
- La ligne de connexion organise la lecture verticalement et fait sentir la progression.
- Le premier item emploie une croix fuchsia « moins de fautes » (éradication des erreurs), le deuxième un mégaphone « expression », le troisième un cœur bleu « vocabulaire ». Les images mélangent vecteur simple et emoji d'aspect natif.
- Les intervalles temporels augmentent : **quelques jours → quelques semaines → quelques mois**, créant un crescendo et une promesse de continuité.
- Le texte conserve le tutoiement et le **futur simple** : « tu comprendras », « tu auras », « sera enrichi ».
- En dehors de la frise, pas de statistiques de jeu, pas de carte de leçon et pas de démonstration réelle d'apprentissage.

### Risques et inconnues

- Le « 5 minutes par jour » et les « 80 % » ne sont **pas prouvés** et ne doivent pas être copiés comme promesses LuxApp.
- L'animation éventuelle, l'auto-scroll, les délais entre dévoilements et les gestes exacts restent non observés.
- Les captures ne démontrent pas que les trois résultats sont adaptés aux priorités choisies. Leur correspondance avec les trois options de 54155 suggère une **possibilité de personnalisation ou de simple recyclage du même discours** ; il faut comparer avec un autre profil avant de conclure.
- Sur petits écrans, un footer fixe peut couvrir le bas de la troisième promesse si le scroll est absent/mal configuré.
- Le langage « futurs résultats » est plus exact que « résultats obtenus », mais il conserve une formulation très affirmative quant aux bénéfices.
- Une page de résultats utilisateur ne devrait pas confondre **bénéfice attendu** et **compétence démontrée par un test**.

## G.7 — Capture 20 (54173.jpg) : offre « 7 jours offerts » et transition vers le premium

### Textes exacts et disposition [OBSERVÉ]

- Barre supérieure : flèche Retour turquoise, 14 jalons, **13e pilule active**.
- Grande illustration de **Momo souriant qui présente un paquet-cadeau orangé** avec ruban jaune, en buste devant un **grand disque bleu foncé**.
- Titre très grand en blanc gras : **« 7 jours offerts »**.
- Explication centrée sur trois lignes : **« Momo t'offre une semaine pour tester toutes les fonctionnalités premium. »**
- Phrase de réassurance placée plus bas et en gras : **« Aucun engagement • Annulation simple »**.
- Gros CTA vert : **« J'en profite »**.
- Aucun prix, date de première facturation, moyen de paiement, condition de renouvellement, bouton « Pas maintenant » ou mention de résiliation détaillée **n'est visible dans cette capture**.

### Approximation de la mise en page

| Élément | Zone visible |
|---|---|
| Barre d'étapes | y≈83–107, 13/14 |
| Cercle et illustration Momo-cadeau | x≈186–523, y≈228–563 |
| Titre principal | y≈659–721 |
| Description | y≈808–948 |
| Rassurance « Aucun engagement… » | y≈1105–1184 |
| CTA « J'en profite » | x≈86–623, y≈1270–1373 |
| Navigation Android | y≈1470–1535 |

- Le cercle bleu a approximativement **le tiers à la moitié de la largeur** du viewport et crée une vignette visuellement isolée.
- Ici, Momo ne tient plus une plume mais un **cadeau** ; le personnage glisse du rôle de guide éducatif au rôle de **présentateur d'une offre**.
- Orange et jaune du cadeau forment un nouvel accent chaud au milieu de la palette bleue/verte.
- Les **trois étages verticaux** sont très nets : illustration ; offre et explication ; rassurance et CTA.
- Le slogan « Aucun engagement • Annulation simple » se lit avant le bouton d'acquisition ; il réduit visuellement la peur du paiement/résiliation.
- Le CTA reste une pilule verte à forte épaisseur, dans la même famille que tous les CTA du tunnel.
- Aucune autre action de décision commerciale n'apparaît dans la portion visible de l'écran.

### Analyse produit et limites [HYPOTHÈSE / INCONNU]

- Il s'agit probablement d'une **mise en avant d'essai premium** après plusieurs étapes de personnalisation, ce qui maximise la perception de valeur investie dans la création du parcours. Ce positionnement est une **lecture du parcours**, pas une preuve de taux de conversion.
- L'affirmation « 7 jours offerts » peut désigner un essai qui mène ou non à un abonnement ; on ne voit pas l'écran suivant. **Ne pas présumer la gratuité durable, l'absence de moyen de paiement ou un renouvellement automatique.**
- « Aucun engagement » et « Annulation simple » sont des affirmations marketing qui demanderaient une vérification des conditions réelles.
- La barre 13/14 suggère **une étape supplémentaire à venir**, mais son contenu exact est inconnu.
- L'absence de « Passer » **dans l'image** ne prouve pas que l'utilisateur est forcé de souscrire ; le Retour Android, la flèche supérieure ou un autre chemin peuvent exister.
- Pour un benchmark responsable, séparer le pattern **mascotte + cadeau + promesse d'essai** des conditions commerciales et de consentement, qui nécessitent un écran contractuel explicite.

---

# ANNEXE H — Mesures croisées, couleurs et inventaire de tous les états nouveaux

## H.1 — Echantillonnage réellement exécuté sur les dix nouveaux JPG

Les points listés ci-dessous proviennent de la lecture RGB des images /mnt/data/54155.jpg à 54173.jpg. Chaque valeur a été calculée sur le pixel identifié ; elle ne constitue pas la palette source originale.

| Pixel d'échantillon | Coordonnée | RGB | HEX |
|---|---|---|---|
| Fond 54155 | (10,300) | (12,21,36) | **#0C1524** |
| Priorité choisie 54155 | (200,510) | (31,160,15) | **#1FA00F** |
| Priorité inactive 54155 | (200,680) | (26,50,78) | **#1A324E** |
| CTA 54155 | (200,1310) | (26,143,11) | **#1A8F0B** |
| Carte affirmation 54157 | (110,470) | (26,50,78) | **#1A324E** |
| Pavé Oui/Non 54157 | (110,1190) | (26,50,78) | **#1A324E** |
| Carte Play Store 54161 | (90,520) | (26,50,78) | **#1A324E** |
| CTA inactif 54161 | (100,1310) | (166,166,166) | **#A6A6A6** |
| Fond blanc logos 54163 | (100,340) | (255,255,255) | **#FFFFFF** |
| Carte avis 54163 | (100,880) | (26,50,78) | **#1A324E** |
| Barre 100 % 54163 | (350,790) | (172,216,219) | **#ACD8DB** |
| Disque de la timeline 54165 | (110,410) | (21,36,65) | **#152441** |
| Disque premium 54173 | (350,236) | (26,50,78) | **#1A324E** |
| CTA premium 54173 | (100,1330) | (26,143,11) | **#1A8F0B** |

**Constat :** continuité du fond, des cartes et du CTA ; les nouvelles pages ajoutent un **bouton gris désactivé**, des **contrôles Oui/Non**, une **barre turquoise**, une **caution de logos sur blanc**, une **frise verticale** et **un cercle premium à illustration**.

## H.2 — Vérification technique du stepper au niveau d'une ligne raster

Méthode : coupe à y=95 ; identification de segments contigus dont les trois composantes RGB dépassent 240 ; segments de largeur ≥6 px. Les segments de ~23 px représentent les ronds, ~47 px la pilule active.

| Capture | Nombre de segments blancs | Position du segment large |
|---|---:|---:|
| 54155 | **14** | **9** (x≈396–442) |
| 54157 | **14** | **9** (x≈396–442) |
| 54159 | **14** | **9** (x≈396–442) |
| 54161 | **14** | **10** (x≈439–485) |
| 54163 | **14** | **12** (x≈483–528) |
| 54165 | **14** | **12** (x≈483–528) |
| 54167 | **14** | **12** (x≈483–528) |
| 54169 | **14** | **12** (x≈483–528) |
| 54171 | **14** | **12** (x≈483–528) |
| 54173 | **14** | **13** (x≈526–572) |

Ensemble du corpus : passage documenté de **13 ronds sur 54137–54151** à **14 ronds sur 54153–54173**. **Pas de preuve** que l'ajout de repère soit lié au pays/région, à un changement de version ou à une erreur. Le risque de collision entre retour et premiers repères, déjà noté pour 54153, doit être vérifié sur l'ensemble du tunnel.

## H.3 — Etat de chaque composant et déclencheur probable

| Sujet | Etats visibles | Comportements inconnus |
|---|---|---|
| Carte priorité | Verte + coche blanche/verte ; bleue + cercle blanc vide | Multisélection, modification, état disabled, validation obligatoire |
| Réponse binaire | Deux pavés bleus + X orange / ✓ verte | Pression, animation, enregistrement, passage automatique, ordre |
| Source d'acquisition | Six cartes bleues visibles, CTA gris | Activation du CTA, sélection unique/multiple, écran optionnel |
| Progression de création | 100 % + barre turquoise saturée | Calcul réel, animation, attente réseau, échec, reprise |
| Caution universitaire | 3 logos sur blanc | Permissions d'utilisation des marques, partenariat réel |
| Témoignage | 5 étoiles, texte, signature | Donnée sourcée, clic, rotation des avis, authenticité |
| Bénéfices temporels | 1, puis 2, puis 3 items | Animation, clic incrémental, scroll automatique, autre priorité |
| Footer de timeline | « Continuer » puis « Voir le parcours » | Conditions du changement, désactivation à la fin |
| Offre premium | Mascotte cadeau + 7 jours + CTA | Prix, paiement, prélèvement, refus, suite et annulation |

---

# ANNEXE I — Analyse UX transversale des vingt captures et logique de conversion

## I.1 — Entonnoir observé (sans inventer les écrans non fournis)

La succession visible dessine les **phases** suivantes, dont certaines comportent plusieurs écrans sous un seul jalon :

1. **Promesse** : bataille contre les fautes, utilisateurs nombreux.
2. **Compagnonnage** : Momo/Molière, aide personnelle.
3. **Profil sommaire** : âge, motivation, message de réassurance.
4. **Identité du joueur** : pseudo, avatar littéraire.
5. **Appartenance** : pays, subdivision, encouragement régional.
6. **Définition des objectifs** : orthographe, expression, vocabulaire.
7. **Auto-identification** : deux phrases « C'est toi, ça ? », réponses Oui/Non.
8. **Origine marketing** : Google/Play Store/réseaux.
9. **Valorisation avant résultat** : logos universitaires, « Création de ton parcours », 100 %, avis 5 étoiles.
10. **Projection dans le bénéfice** : trois échéances jours/semaines/mois révélées successivement.
11. **Proposition premium** : 7 jours d'essai offerts par Momo.

**Tension centrale :** le produit repousse l'accès aux leçons jusqu'après de nombreux engagements. Ce long tunnel peut renforcer la perception d'une expérience personnalisée, mais aussi provoquer des **abandons**. Les captures ne contiennent **aucun** taux de complétion, aucun A/B test ni mesure de rétention : impossible d'évaluer quantitativement l'efficacité.

## I.2 — Mécanismes psychologiques et indices matériels

| Mécanisme | Elément attesté | Interprétation UX, pas effet prouvé |
|---|---|---|
| Personnification | « Momo », deux poses initiales + cadeau premium | Compagnon relationnel, continuité de marque |
| Micro-engagement | âge, raison, pseudo, avatar, région | Choix successifs simples, sentiment de participation |
| Identité sociale | compétition régionale, 3 116 personnes actives affichées | Appartenance à un groupe et défi collectif |
| Préférence déclarée | trois priorités cochables | Engagement sur ce qu'on souhaite améliorer |
| Identification personnelle | « Je relis mon message… », « Une faute… » | Reconnaissance de situations quotidiennes |
| Mesure d'acquisition | question Play Store/Google/social | Analyse marketing intégrée au tunnel |
| Autorité perçue | logos Sorbonne, ETH Zürich, Toronto | Transfert possible de crédibilité, affiliation non vérifiée |
| Préparation simulable | barre de création à 100 % | Impression d'un travail fait « pour moi » |
| Preuve sociale | 900 000, 92 %, 3 116, avis 5 étoiles | Réassurance, validité empirique non connue |
| Projection temporelle | quelques jours / semaines / mois | Rend les bénéfices imaginables et graduels |
| Effet cadeau | Momo avec paquet et « 7 jours offerts » | Récompense après l'effort, incitation premium |
| Réduction du risque | « Aucun engagement • Annulation simple » | Réassurance commerciale, conditions inconnues |
| CTA évolutif | Continuer → Voir le parcours → J'en profite | Guide la transition apprentissage → acquisition |

Ce découpage enrichit le précédent audit : **les nouvelles captures montrent davantage le marketing de conversion que le moteur pédagogique**. Il ne faut donc pas assimiler leur qualité persuasive à une preuve d'efficacité didactique.

## I.3 — Parallèle utile pour LuxApp / Luxo sans décision produit

Pour LuxApp, l'inspiration la plus exploitable est la **progression narrative** et la qualité des interactions, pas la quantité de questions marketing :

- Choisir un **objectif concret lié au luxembourgeois** (communiquer au travail, comprendre au quotidien, préparer l'A1.2/Sproochentest), puis proposer réellement un point de départ adapté.
- Une courte question sur une **situation vécue** peut engager davantage qu'un long questionnaire, mais elle n'a d'intérêt que si sa réponse modifie une recommandation ou une leçon.
- Utiliser des **étapes motivantes** sans prétendre générer en 100 % un programme nouveau si le catalogue reste identique pour tous.
- Une frise **« ce que je vais apprendre »** devrait décrire des compétences objectivement liées aux leçons : se présenter, demander un itinéraire, comprendre une consigne, conjuguer des verbes fréquents, etc., avec des délais non garantis plutôt qu'un « 80 % » arbitraire.
- Une offre premium peut être présentée après la découverte réelle de la valeur, sans bloquer artificiellement les premières leçons ; prix, renouvellement, modalité d'annulation et alternative gratuite doivent être compréhensibles.
- Les logos d'établissements, chiffres sociaux et citations ne devraient figurer **que s'ils sont vérifiables et autorisés**.
- Sur la branche 2.1, **préserver la charte** : fond presque noir chaud et or pour l'action (design-tokens.css / CHARTE_UI_2.1.md) ; conserver vert pour succès réel, non vert universel comme cette app.
- Priorité du backlog LuxApp 2.1 : fonctionnement, navigation, exercices et clavier Samsung avant longue expérimentation d'onboarding.

## I.4 — Points UX particulièrement révélateurs des captures nouvelles

**1. Une question peut avoir deux modes de validation.**  
Le choix d'objectifs possède un grand CTA « Continuer » ; les deux affirmations Oui/Non n'en ont pas, les cartes sont elles-mêmes les grandes actions de navigation. L'app ne force pas une seule grammaire de formulaire.

**2. La taille des cartes dépend du texte.**  
La sélection prioritaire fait ~126 px sur une ligne mais ~185 px sur deux ; le Play Store fait ~169 px. Les composants s'étendent verticalement au lieu de réduire drastiquement la typographie.

**3. L'état désactivé est explicite.**  
« Continuer » gris sur la provenance contraste avec les CTA verts. Cela signale probablement l'absence de sélection valide et donne une information avant le clic. **Vérification nécessaire** pour confirmer les règles.

**4. Les couleurs ne suffisent pas toujours.**  
Priorité choisie = vert **et coche**. Affirmation = orange/vert **et mots Non/Oui**. Mais certaines anciennes sélections n'utilisaient que le vert ; leur accessibilité reste inégale.

**5. Le « résultat » change de nature.**  
« Voir mes résultats » aboutit visuellement à « Tes futurs résultats », sans test mesuré présenté. Ce sont des **promesses de bénéfices**. Reprendre ce pattern avec une terminologie trop affirmative dans un produit éducatif peut réduire la confiance.

**6. Une seule page peut contenir plusieurs révélations.**  
La frise apparaît à l'identique avec un, deux ou trois items. La navigation semble avoir un état de progression interne au screen ; ce n'est pas un écran standard figé.

**7. Le pied de page peut masquer le texte à la première vue.**  
La capture 18 coupe la description du troisième item, la 19 la montre après scroll. Ce n'est pas forcément un bug : le contenu reste accessible, mais il faut que le scroll soit **évident et fluide**.

**8. La récompense commerciale est narrativisée.**  
Momo remet un cadeau juste après la création de profil et la promesse de progression. Cela fait de l'essai premium une étape émotionnelle plutôt qu'une simple page de prix.

---

# ANNEXE J — Protocole de recette et limites de cette documentation complémentaire

### Scénarios à refaire dans l'application de référence, si accès futur

1. **Priorités** : cliquer une seule carte, deux cartes, puis trois ; vérifier si multi-sélection autorisée, changement de coche et validation.
2. **Deux phrases d'identification** : tester Oui puis Non, puis retour, puis l'inverse ; vérifier l'ordre et si le jalon reste 9/14.
3. **Acquisition** : choisir un canal, vérifier le passage du CTA gris au vert, scroller jusqu'aux dernières options, changer de sélection.
4. **Création** : filmer depuis l'entrée de la page jusqu'à 100 % ; déterminer s'il s'agit d'une animation artificielle, d'un calcul ou d'un chargement réel, et mesurer la durée.
5. **Cautions** : ouvrir les éventuels liens de logos/avis, identifier les sources et ne rien conclure d'un logo seul.
6. **Timeline** : filmer le passage d'un item au suivant, tester les CTA, noter si la révélation est immédiate, animée, au clic ou automatique ; tester le scroll avec le footer.
7. **Résultats** : répéter le parcours avec d'autres priorités et réponses pour déterminer si les bénéfices changent.
8. **Essai** : cliquer « J'en profite » en environnement contrôlé, **sans confirmer de paiement**, lire les conditions, vérifier existence d'un chemin gratuit et d'un refus ; ne pas souscrire pour réaliser un simple benchmark.
9. **Android** : tester clavier, petites hauteurs, gestes système, lecteur d'écran, zoom 200 % et scrolling des options sous footer.
10. **Stepper** : filmer le passage de la région aux priorités et du jalon 10 au jalon 12 pour expliquer 13→14 repères et la page manquante.

### Limites strictes

- Les vingt captures ne révèlent **pas le code ni les API** du produit tiers.
- Elles ne prouvent ni calcul d'un parcours personnalisé, ni étude universitaire, ni effet pédagogique d'une semaine d'essai.
- Les **projections de résultats** sont des arguments affichés, non des résultats quantifiés d'un apprentissage réel.
- Les transitions et animations **ne peuvent être certifiées sur des images fixes** ; seules leurs images de départ/arrivée sont observables.
- Les mesures RGB et géométriques sont spécifiques aux captures, pas une extraction des tokens natifs de l'autre application.
- Les droits sur les portraits, la mascotte, les logos et les témoignages ne sont pas établis ; **aucun de ces éléments graphiques n'a été ajouté au dépôt LuxApp**.

**Statut : 20 captures documentées dans un fichier unique ; descriptions détaillées, géométrie, couleurs, parcours, UI, ergonomie, conversion et inconnues ; aucun changement fonctionnel apporté à LuxApp.**
