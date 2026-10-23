# Benchmark UX — Rétro-ingénierie visuelle d'un onboarding d'application éducative

**Projet destinataire :** LuxApp / Luxo — apprentissage du luxembourgeois pour francophones  
**Date de l'observation :** 23 octobre 2026  
**Corpus :** 10 captures d'écran Android fournies dans la conversation ; fichiers source 54135.jpg à 54153.jpg, par ordre chronologique  
**Nature du document :** relevé factuel, analyse du parcours observable, hypothèses explicitement signalées ; **aucune spécification de développement validée**  
**Dépôt de référence :** aym2020/LuxApp, branche main ; PLAYBOOK.md et structure du frontend consultés avant rédaction  
**Périmètre :** écrans d'accueil et d'inscription/personnalisation observés uniquement. Ni la phase d'apprentissage ni le fonctionnement du backend ne sont visibles.

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

**Statut :** benchmark descriptif archivé. **Aucun fichier applicatif modifié.**
