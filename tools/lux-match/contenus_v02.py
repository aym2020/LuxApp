# Génère data/jeux/lux-match/contenus-v02.json à partir de la bible éditoriale
# (docs/LUX-MATCH-BIBLE-EDITORIALE-A11.md), avec les corrections de l'audit Claude.
# Usage : python3 tools/lux-match/contenus_v02.py  (depuis n'importe quel dossier)
import json, os
RACINE = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
L = lambda lu, fr, statut='audit_regles': {'lu': lu, 'fr': fr, 'review': statut}

persona = {
  'id': 'alex_v01', 'name': 'Alex', 'age': 28, 'origin': 'Frankräich', 'city': 'Metz', 'job': 'Banker',
  'languages': ['Franséisch'], 'nationality': 'Fransous', 'football': False, 'morningCoffee': True,
  'drawing': False, 'gaming': False, 'running': False,
  'lignes': [L('Ech heeschen Alex.', "Je m'appelle Alex.", 'lecon'), L('Ech sinn aachtanzwanzeg Joer al.', "J'ai 28 ans.", 'lecon'),
             L('Ech kommen aus Frankräich.', 'Je viens de France.', 'lecon'), L('Ech wunnen zu Metz.', "J'habite à Metz.", 'lecon'),
             L('Ech sinn e Banker.', 'Je suis banquier.', 'lecon'), L('Ech schwätze Franséisch.', 'Je parle français.', 'lecon')],
  'resumeFr': 'Alex, 28 ans — Je viens de France, j’habite à Metz, je suis banquier et je parle français.',
  'source': 'Bible §4'
}

def profil(**k): return k

profils = [
 profil(id='lena_r01', archetypeId='sportive', name='Léna', age=27, city='Metz', origin='Frankräich', job='Léierin', languages=['Franséisch', 'Lëtzebuergesch'],
   source='P_LENA', voix='sportive, directe, compétitive',
   apparence3d={'modele': 'Casual3_Female', 'peau': '#e0a985', 'cheveux': '#5a3a22', 'haut': '#2f7be0', 'bas': '#1d2a4a'},
   outfitSignal={'style': 'sportif', 'color': 'blo', 'explicit': True, 'clue': 'AMIS_LENA_A01'},
   phoneTolerance='normal', humours=['direct', 'taquine'],
   tinder={'id': 'TINDER.LENA.BIO', **L('Ech wunnen zu Metz. Ech spille gär Fussball.', "J'habite à Metz. J'aime jouer au football.", 'lecon'),
           'tags': [L('Fussball', 'football', 'lecon'), L('Sport', 'sport', 'lecon'), L('Metz', 'Metz', 'lecon')]},
   pix={'private': False, 'followers': 840, 'bio': {'id': 'PIX.LENA.BIO', **L('Fussball, Sport a Frënn.', 'Football, sport et amis.')},
        'photos': [{'id': 'PIX_LENA_P01', **L('Moies am Park. Ech lafe gär.', "Le matin au parc. J'aime courir."), 'scene': 'parc', 'pose': 'Walk', 'jours': 2, 'likes': 64},
                   {'id': 'PIX_LENA_P02', **L('Ech spille gär Fussball.', "J'aime jouer au football.", 'lecon'), 'scene': 'foot', 'pose': 'Jump', 'jours': 6, 'likes': 91}]},
   pro={'poste': 'Enseignante', 'formation': 'Université de Metz', 'ville': 'Metz', 'langues': 'Français, luxembourgeois',
        'texte': {'id': 'PRO.LENA', **L('Ech schaffen als Léierin. Ech wunnen zu Metz.', 'Je suis professeure. J’habite à Metz.', 'lecon')}},
   amis={'bio': L('Ech wunnen zu Metz.', "J'habite à Metz.", 'lecon'),
         'posts': [{'id': 'AMIS_LENA_A01', **L('Meng Liiblingsfaarf ass blo. Sportlech Kleeder si super.', "Ma couleur préférée est le bleu. J'adore les tenues sportives.", 'a_verifier_lod'), 'reveals': 'style', 'obligatoire': True},
                   {'id': 'AMIS_LENA_A02', **L('Ech spille gär Fussball. Och freides!', "J'aime jouer au foot. Même le vendredi !"), 'reveals': 'football'},
                   {'id': 'AMIS_LENA_A03', **L('Eng Fro: Bass du och sportlech?', 'Une question : tu es sportif aussi ?'), 'reveals': 'question_sport'}]},
   variantes=['VAR_LENA_COFFEE', 'VAR_LENA_EARLY'], agePrefPossible=True, exAlexPossible=False,
   repliques={'ville': L('Ech wunnen zu Metz.', "J'habite à Metz.", 'lecon'), 'metier': L('Ech schaffen als Léierin.', 'Je suis professeure.', 'lecon'),
              'age': L('Ech si siwenanzwanzeg Joer al.', "J'ai 27 ans.", 'lecon')},
   beats=['B10_FOOT', 'B06_CITY', 'B05_ORIGIN', 'B11_COFFEE', 'B21_ASK_HER', 'B08_PROFESSION'], beatsForts=['B10_FOOT'],
   reactions={'LOOK_OK': 'Ah, du bleu et des baskets !', 'LOOK_DIFFERENT': 'Tu viens courir en costume ? Ambitieux.', 'BLUFF': 'Tu joues au foot ? Je note !',
              'AVEU': 'Bon, au moins tu ne mens plus sur ton niveau.', 'SINCERE': 'Pas besoin d’aimer le foot pour être sympa.'},
   fins={'SUCCESS': {'id': 'FIN_LENA_SUCCESS', 'fr': 'J’aime les gens qui tiennent parole. Un autre café après un match ?', 'garde': {'aucunMensongeActif': True}},
         'FUN': {'id': 'FIN_LENA_FUN', 'fr': 'Tu as raté le ballon de trois mètres. C’était magnifique. Je veux une revanche.', 'garde': {'choix': ['EV_LENA_FOOT_C1']}},
         'NEUTRAL': {'id': 'FIN_LENA_NEUTRAL', 'fr': 'On n’a pas les mêmes passions, mais j’ai aimé discuter.'},
         'FAIL': {'id': 'FIN_LENA_FAIL', 'fr': 'Tu as juré aimer le foot, puis tu as changé d’histoire. Ça fait beaucoup !', 'garde': {'mensonge': 'football'}}}),
 profil(id='claire_r01', archetypeId='bc_bg', name='Claire', age=31, city='Lëtzebuerg', origin='Frankräich', job='Bankerin', languages=['Franséisch', 'Englesch'],
   source='P_CLAIRE', voix='organisée, ironique, ponctuelle',
   apparence3d={'modele': 'Suit_Female', 'peau': '#f0c3a0', 'cheveux': '#2a1d18', 'costume': '#18161c'},
   outfitSignal={'style': 'bcbg', 'color': 'schwaarz', 'explicit': True, 'clue': 'AMIS_CLAIRE_A01'},
   phoneTolerance='normal', humours=['ironique', 'franchise'],
   tinder={'id': 'TINDER.CLAIRE.BIO', **L('Ech wunnen zu Lëtzebuerg. Ech schaffen an enger Bank.', "J'habite au Luxembourg. Je travaille dans une banque.", 'lecon'),
           'tags': [L('Lëtzebuerg', 'Luxembourg', 'lecon'), L('Bank', 'banque', 'lecon'), L('Reesen', 'voyages')]},
   pix={'private': False, 'followers': 510, 'bio': {'id': 'PIX.CLAIRE.BIO', **L('Lëtzebuerg. Aarbecht. Reesen.', 'Luxembourg. Travail. Voyages.')},
        'photos': [{'id': 'PIX_CLAIRE_P01', **L('Gudden Owend!', 'Bonsoir !', 'lecon'), 'scene': 'reception', 'pose': 'Victory', 'jours': 3, 'likes': 47},
                   {'id': 'PIX_CLAIRE_P02', **L('Lëtzebuerg owes.', 'Luxembourg le soir.'), 'scene': 'ville_nuit', 'pose': 'Idle', 'jours': 9, 'likes': 38}]},
   pro={'poste': 'Banquière', 'formation': 'Université du Luxembourg', 'ville': 'Luxembourg', 'langues': 'Français, anglais',
        'texte': {'id': 'PRO.CLAIRE', **L('Ech schaffen an enger Bank. Ech schwätze Franséisch an Englesch.', 'Je travaille dans une banque. Je parle français et anglais.', 'lecon')}},
   amis={'bio': L('Ech wunnen zu Lëtzebuerg.', "J'habite au Luxembourg.", 'lecon'),
         'posts': [{'id': 'AMIS_CLAIRE_A01', **L('Meng Liiblingsfaarf ass schwaarz. Ech hunn elegant Kleeder gär.', "Ma couleur préférée est le noir. J'aime les vêtements élégants.", 'a_verifier_lod'), 'reveals': 'style', 'obligatoire': True},
                   {'id': 'AMIS_CLAIRE_A02', **L('Ech sinn ëmmer pünktlech.', 'Je suis toujours à l’heure.', 'a_verifier_lod'), 'reveals': 'ponctualite'},
                   {'id': 'AMIS_CLAIRE_A03', **L('Aacht Auer heescht aacht Auer.', 'Huit heures, c’est huit heures.'), 'reveals': 'ponctualite'}]},
   variantes=['VAR_CLAIRE_TRAVEL'], agePrefPossible=True, exAlexPossible=True,
   repliques={'ville': L('Ech wunnen zu Lëtzebuerg.', "J'habite au Luxembourg.", 'lecon'), 'metier': L('Ech schaffen an enger Bank.', 'Je travaille dans une banque.', 'lecon'),
              'age': L('Ech sinn eenandrësseg Joer al.', "J'ai 31 ans.", 'lecon')},
   beats=['B08_PROFESSION', 'B09_WORKPLACE', 'B06_CITY', 'B07_LANGUAGE', 'B13_NATIONALITY', 'B21_ASK_HER'], beatsForts=['B08_PROFESSION'],
   reactions={'LOOK_OK': 'C’est soigné. J’aime bien.', 'LOOK_DIFFERENT': 'C’est… original pour un rendez-vous.', 'BLUFF': 'Ah bon ? Et tu fais ça depuis quand ?',
              'AVEU': 'Merci pour la précision. C’est mieux.', 'SINCERE': 'Au moins, ta réponse est claire.'},
   fins={'SUCCESS': {'id': 'FIN_CLAIRE_SUCCESS', 'fr': 'Tu es agréable et intéressant. Je note un deuxième rendez-vous ?'},
         'FUN': {'id': 'FIN_CLAIRE_FUN', 'fr': 'Médecin ou banquier ? J’ai deux métiers dans mon agenda. Lequel est le vrai ?', 'garde': {'choix': ['EV_CLAIRE_JOB_C1', 'EV_CLAIRE_JOB_C3']}},
         'NEUTRAL': {'id': 'FIN_CLAIRE_NEUTRAL', 'fr': 'La conversation était agréable, mais je crois qu’on cherche autre chose.'},
         'FAIL': {'id': 'FIN_CLAIRE_FAIL', 'fr': 'Ton métier change selon la question… Je vais avoir besoin d’un CV plus clair.', 'garde': {'mensonge': 'job'}}}),
 profil(id='noemie_r01', archetypeId='artiste', name='Noémie', age=25, city='Esch', origin='Belsch', job='Illustratorin', languages=['Franséisch', 'Englesch'],
   source='P_NOEMIE', voix='créative, spontanée, taquine',
   apparence3d={'modele': 'Casual2_Female', 'peau': '#c98a5f', 'cheveux': '#d2398f', 'haut': '#d8343c', 'bas': '#2b2340'},
   outfitSignal={'style': 'creatif', 'color': 'rout', 'explicit': True, 'clue': 'AMIS_NOEMIE_A01'},
   phoneTolerance='normal', humours=['absurde', 'franchise'],
   tinder={'id': 'TINDER.NOEMIE.BIO', **L('Ech wunnen zu Esch. Ech mole gär.', "J'habite à Esch. J'aime dessiner.", 'audit_regles'),
           'tags': [L('Molerei', 'dessin'), L('Musek', 'musique'), L('Esch', 'Esch', 'lecon')]},
   pix={'private': False, 'followers': 1760, 'bio': {'id': 'PIX.NOEMIE.BIO', **L('Faarwen. Molerei. Musek.', 'Couleurs. Dessin. Musique.')},
        'photos': [{'id': 'PIX_NOEMIE_P01', **L('Ech molen haut.', "Je dessine aujourd'hui."), 'scene': 'carnet', 'pose': 'PickUp', 'jours': 1, 'likes': 212},
                   {'id': 'PIX_NOEMIE_P02', **L('Rout a blo!', 'Rouge et bleu !', 'lecon'), 'scene': 'atelier', 'pose': 'Victory', 'jours': 5, 'likes': 188}]},
   pro={'poste': 'Illustratrice', 'formation': 'École d’art', 'ville': 'Esch', 'langues': 'Français, anglais',
        'texte': {'id': 'PRO.NOEMIE', **L('Ech wunnen zu Esch. Ech schaffen als Illustratorin.', "J'habite à Esch. Je travaille comme illustratrice.", 'a_verifier_lod')}},
   amis={'bio': L('Ech wunnen zu Esch.', "J'habite à Esch.", 'lecon'),
         'posts': [{'id': 'AMIS_NOEMIE_A01', **L('Meng Liiblingsfaarf ass rout. Ech hu faarweg Kleeder gär.', "Ma couleur préférée est le rouge. J'aime les vêtements colorés.", 'a_verifier_lod'), 'reveals': 'style', 'obligatoire': True},
                   {'id': 'AMIS_NOEMIE_A02', **L('Ech mole gär. Awer net moies.', "J'aime dessiner. Mais pas le matin."), 'reveals': 'dessin'},
                   {'id': 'AMIS_NOEMIE_A03', **L('Ech maache gär Musek.', "J'aime faire de la musique.", 'a_verifier_lod'), 'reveals': 'musique'}]},
   variantes=['VAR_NOEMIE_MUSIC', 'VAR_NOEMIE_MORNING'], agePrefPossible=True, exAlexPossible=False,
   repliques={'ville': L('Ech wunnen zu Esch.', "J'habite à Esch.", 'lecon'), 'metier': L('Ech schaffen als Illustratorin.', 'Je travaille comme illustratrice.', 'a_verifier_lod'),
              'age': L('Ech si fënnefanzwanzeg Joer al.', "J'ai 25 ans.", 'lecon')},
   beats=['B_DRAW', 'B06_CITY', 'B05_ORIGIN', 'B07_LANGUAGE', 'B12_COFFEE_OFFER', 'B21_ASK_HER'], beatsForts=['B_DRAW'],
   reactions={'LOOK_OK': 'Cette couleur te va bien !', 'LOOK_DIFFERENT': 'Tu as choisi la sobriété. C’est un concept aussi.', 'BLUFF': 'Sérieux ? Il faut que tu me montres !',
              'AVEU': 'La vérité, c’est aussi de l’art.', 'SINCERE': 'J’aime les gens qui ont leurs propres goûts.'},
   fins={'SUCCESS': {'id': 'FIN_NOEMIE_SUCCESS', 'fr': 'J’aime les gens qui assument leurs goûts. Un autre café ?'},
         'FUN': {'id': 'FIN_NOEMIE_FUN', 'fr': 'J’ai gardé ton portrait sur serviette. Il est atroce. Je l’adore.', 'garde': {'choix': ['EV_NOEMIE_DRAW_C1', 'EV_NOEMIE_DRAW_C3']}},
         'NEUTRAL': {'id': 'FIN_NOEMIE_NEUTRAL', 'fr': 'On a passé un moment sympa, sans déclic.'},
         'FAIL': {'id': 'FIN_NOEMIE_FAIL', 'fr': 'Tu as dit adorer dessiner, puis tu as fui devant un crayon. Dommage.', 'garde': {'choix': ['EV_NOEMIE_DRAW_C2']}}}),
 profil(id='maya_r01', archetypeId='geek', name='Maya', age=26, city='Tréier', origin='Däitschland', job='Programméiererin', languages=['Däitsch', 'Englesch'],
   source='P_MAYA', voix='geek, calme, ironique',
   apparence3d={'modele': 'Casual_Female', 'peau': '#8d5a3b', 'cheveux': '#151217', 'haut': '#2fa35a', 'bas': '#3a3430'},
   outfitSignal={'style': 'casual', 'color': 'gréng', 'explicit': True, 'clue': 'AMIS_MAYA_A01'},
   phoneTolerance='normal', humours=['ironique', 'absurde'],
   tinder={'id': 'TINDER.MAYA.BIO', **L('Ech wunnen zu Tréier. Ech spille gär Computerspiller.', "J'habite à Trèves. J'aime jouer aux jeux vidéo.", 'audit_regles'),
           'tags': [L('Computerspiller', 'jeux vidéo'), L('Kaffi', 'café', 'lecon'), L('Tréier', 'Trèves')]},
   pix={'private': True, 'followers': 0, 'bio': {'id': 'PIX.MAYA.BIO', **L('Spiller a Kaffi.', 'Jeux et café.')}, 'photos': []},
   pro={'poste': 'Développeuse', 'formation': 'Informatique', 'ville': 'Trèves', 'langues': 'Allemand, anglais',
        'texte': {'id': 'PRO.MAYA', **L('Ech schaffen als Programméiererin. Ech schwätzen Däitsch an Englesch.', 'Je travaille comme développeuse. Je parle allemand et anglais.', 'a_verifier_lod')}},
   amis={'bio': L('Ech wunnen zu Tréier.', "J'habite à Trèves.", 'lecon'),
         'posts': [{'id': 'AMIS_MAYA_A01', **L('Meng Liiblingsfaarf ass gréng. Ech hunn einfach Kleeder gär.', "Ma couleur préférée est le vert. J'aime les tenues simples.", 'a_verifier_lod'), 'reveals': 'style', 'obligatoire': True},
                   {'id': 'AMIS_MAYA_A02', **L('Ech spille gär Computerspiller.', "J'aime les jeux vidéo."), 'reveals': 'gaming'},
                   {'id': 'AMIS_MAYA_A03', **L('Moies drénken ech Kaffi.', 'Le matin, je bois du café.', 'lecon'), 'reveals': 'cafe'}]},
   variantes=['VAR_MAYA_LANG', 'VAR_MAYA_READING'], agePrefPossible=True, exAlexPossible=False,
   repliques={'ville': L('Ech wunnen zu Tréier.', "J'habite à Trèves.", 'lecon'), 'metier': L('Ech schaffen als Programméiererin.', 'Je travaille comme développeuse.', 'a_verifier_lod'),
              'age': L('Ech si sechsanzwanzeg Joer al.', "J'ai 26 ans.", 'lecon')},
   beats=['B_GAMING', 'B07_LANGUAGE', 'B06_CITY', 'B05_ORIGIN', 'B11_COFFEE', 'B21_ASK_HER'], beatsForts=['B_GAMING', 'B07_LANGUAGE'],
   reactions={'LOOK_OK': 'Style validé. +1 en charisme.', 'LOOK_DIFFERENT': 'Cette tenue est tirée au hasard, non ?', 'BLUFF': 'Ah oui ? Alors on va voir ça !',
              'AVEU': 'Pas grave, on apprend tous au niveau un.', 'SINCERE': 'Tu ne bluffes pas. C’est rare, ça.'},
   fins={'SUCCESS': {'id': 'FIN_MAYA_SUCCESS', 'fr': 'Une belle partie, sans triche. J’accepte une deuxième manche.', 'garde': {'aucunMensongeActif': True}},
         'FUN': {'id': 'FIN_MAYA_FUN', 'fr': 'Tu as perdu au premier niveau mais tu m’as fait rire. Bien joué.', 'garde': {'choix': ['EV_MAYA_RETRO_C1', 'EV_MAYA_RETRO_C3']}},
         'NEUTRAL': {'id': 'FIN_MAYA_NEUTRAL', 'fr': 'On ne joue pas dans la même équipe, mais c’était agréable.'},
         'FAIL': {'id': 'FIN_MAYA_FAIL', 'fr': 'Tu prétends tout connaître, mais ton histoire change à chaque question. Game over.', 'garde': {'contradiction': True}}}),
 profil(id='sofia_r01', archetypeId='voyageuse', name='Sofia', age=29, city='Metz', origin='Portugal', job='Guide', languages=['Portugisesch', 'Franséisch'],
   source='P_SOFIA', voix='curieuse, enthousiaste, langues',
   apparence3d={'modele': 'Doctor_Female_Young', 'peau': '#b97d55', 'cheveux': '#3b2417', 'manteau': '#5c8fd6'},
   outfitSignal={'style': 'casual', 'color': 'blo', 'explicit': True, 'clue': 'AMIS_SOFIA_A01'},
   phoneTolerance='normal', humours=['enthousiaste', 'absurde'],
   tinder={'id': 'TINDER.SOFIA.BIO', **L('Ech kommen aus Portugal. Ech wunnen zu Metz.', "Je viens du Portugal. J'habite à Metz.", 'lecon'),
           'tags': [L('Reesen', 'voyages'), L('Sproochen', 'langues'), L('Portugal', 'Portugal', 'lecon')]},
   pix={'private': False, 'followers': 2140, 'bio': {'id': 'PIX.SOFIA.BIO', **L('Reesen a Sproochen.', 'Voyages et langues.')},
        'photos': [{'id': 'PIX_SOFIA_P01', **L('Lissabon. Ech kommen ëmmer gär zeréck.', "Lisbonne. J'aime toujours y revenir.", 'a_verifier_lod'), 'scene': 'lisbonne', 'pose': 'Victory', 'jours': 4, 'likes': 320},
                   {'id': 'PIX_SOFIA_P02', **L('Mam Zuch ënnerwee.', 'En voyage en train.'), 'scene': 'train', 'pose': 'Idle', 'jours': 11, 'likes': 176}]},
   pro={'poste': 'Guide touristique', 'formation': 'Études de tourisme', 'ville': 'Metz', 'langues': 'Portugais, français',
        'texte': {'id': 'PRO.SOFIA', **L('Ech schwätze Portugisesch a Franséisch.', 'Je parle portugais et français.', 'lecon')}},
   amis={'bio': L('Ech wunnen zu Metz.', "J'habite à Metz.", 'lecon'),
         'posts': [{'id': 'AMIS_SOFIA_A01', **L('Meng Liiblingsfaarf ass blo. Ech hunn e bequeme Look gär.', "Ma couleur préférée est le bleu. J'aime les looks confortables.", 'a_verifier_lod'), 'reveals': 'style', 'obligatoire': True},
                   {'id': 'AMIS_SOFIA_A02', **L('Ech kommen aus Portugal. Ech wunnen zu Metz.', "Je viens du Portugal. J'habite à Metz.", 'lecon'), 'reveals': 'origine'},
                   {'id': 'AMIS_SOFIA_A03', **L('Ech schwätze Portugisesch a Franséisch.', 'Je parle portugais et français.', 'lecon'), 'reveals': 'langues'}]},
   variantes=['VAR_SOFIA_EARLY', 'VAR_SOFIA_COFFEE'], agePrefPossible=True, exAlexPossible=True,
   repliques={'ville': L('Ech wunnen zu Metz.', "J'habite à Metz.", 'lecon'), 'metier': L('Ech schaffen als Guide.', 'Je travaille comme guide touristique.', 'a_verifier_lod'),
              'age': L('Ech sinn nénganzwanzeg Joer al.', "J'ai 29 ans.", 'lecon')},
   beats=['B05_ORIGIN', 'B07_LANGUAGE', 'B06_CITY', 'B13_NATIONALITY', 'B12_COFFEE_OFFER', 'B21_ASK_HER'], beatsForts=['B05_ORIGIN', 'B07_LANGUAGE'],
   reactions={'LOOK_OK': 'J’adore cette couleur. Bon début.', 'LOOK_DIFFERENT': 'Tu voyages toujours dans cette tenue ?', 'BLUFF': 'Vraiment ? Je veux tout savoir !',
              'AVEU': 'Au moins, maintenant on se comprend.', 'SINCERE': 'Super. Et tu aimes voyager ?'},
   fins={'SUCCESS': {'id': 'FIN_SOFIA_SUCCESS', 'fr': 'Merci pour cette soirée. Raconte-moi ta prochaine destination au prochain café !'},
         'FUN': {'id': 'FIN_SOFIA_FUN', 'fr': 'La vache en portugais… Je m’en souviendrai longtemps. J’ai quand même bien ri.', 'garde': {'choix': ['vaca']}},
         'NEUTRAL': {'id': 'FIN_SOFIA_NEUTRAL', 'fr': 'Nos routes se croisent ici. Bon voyage !'},
         'FAIL': {'id': 'FIN_SOFIA_FAIL', 'fr': 'Portugal, France… je ne sais plus du tout d’où tu viens.', 'garde': {'mensonge': 'origin'}}}),
 profil(id='emma_r01', archetypeId='chill', name='Emma', age=30, city='Lëtzebuerg', origin='Frankräich', job='Libraire', languages=['Franséisch', 'Lëtzebuergesch'],
   source='P_EMMA', voix='calme, franche, attentive',
   apparence3d={'modele': 'Casual2_Female', 'peau': '#f2c9a8', 'cheveux': '#d9b268', 'haut': '#d8c3a0', 'bas': '#6b5a4a'},
   outfitSignal={'style': 'loose', 'color': 'beige', 'explicit': True, 'clue': 'AMIS_EMMA_A01'},
   phoneTolerance='anti_phone', humours=['franchise', 'calme'],
   tinder={'id': 'TINDER.EMMA.BIO', **L('Ech wunnen zu Lëtzebuerg. Moies drénken ech Kaffi.', "J'habite au Luxembourg. Le matin, je bois du café.", 'lecon'),
           'tags': [L('Kaffi', 'café', 'lecon'), L('Bicher', 'livres', 'lecon'), L('Lëtzebuerg', 'Luxembourg', 'lecon')]},
   pix={'private': True, 'followers': 0, 'bio': {'id': 'PIX.EMMA.BIO', **L('Kaffi a Bicher.', 'Café et livres.', 'lecon')}, 'photos': []},
   pro={'poste': 'Libraire', 'formation': 'Lettres', 'ville': 'Luxembourg', 'langues': 'Français, luxembourgeois',
        'texte': {'id': 'PRO.EMMA', **L('Ech schaffen an enger Librairie. Ech schwätze Franséisch a Lëtzebuergesch.', 'Je travaille dans une librairie. Je parle français et luxembourgeois.', 'audit_regles')}},
   amis={'bio': L('Ech wunnen zu Lëtzebuerg.', "J'habite au Luxembourg.", 'lecon'),
         'posts': [{'id': 'AMIS_EMMA_A01', **L('Meng Liiblingsfaarf ass beige. Ech hunn einfach Kleeder gär.', "Ma couleur préférée est le beige. J'aime les tenues simples.", 'a_verifier_lod'), 'reveals': 'style', 'obligatoire': True},
                   {'id': 'AMIS_EMMA_A02', **L('Beim Rendez-vous: keen Handy, w.e.g.', 'Pendant le rendez-vous : pas de téléphone, s’il te plaît.', 'audit_regles'), 'reveals': 'anti_phone', 'obligatoire': True},
                   {'id': 'AMIS_EMMA_A03', **L('Moies drénken ech Kaffi. Owes liesen ech gär.', "Le matin, je bois du café. Le soir, j'aime lire.", 'lecon'), 'reveals': 'cafe'}]},
   variantes=['VAR_EMMA_READING', 'VAR_EMMA_TIME'], agePrefPossible=True, exAlexPossible=True,
   repliques={'ville': L('Ech wunnen zu Lëtzebuerg.', "J'habite au Luxembourg.", 'lecon'), 'metier': L('Ech schaffen an enger Librairie.', 'Je travaille dans une librairie.', 'lecon'),
              'age': L('Ech sinn drësseg Joer al.', "J'ai 30 ans.", 'lecon')},
   beats=['EV_EMMA_COFFEE', 'B06_CITY', 'B08_PROFESSION', 'B07_LANGUAGE', 'B12_COFFEE_OFFER', 'B21_ASK_HER'], beatsForts=['EV_EMMA_COFFEE'],
   reactions={'LOOK_OK': 'Ça te va bien. Simple, j’aime.', 'LOOK_DIFFERENT': 'Tu t’es beaucoup préparé, non ?', 'BLUFF': 'Hm. Tu es sûr de toi ?',
              'AVEU': 'Merci. Je préfère ça.', 'SINCERE': 'On peut juste discuter, tu sais.'},
   fins={'SUCCESS': {'id': 'FIN_EMMA_SUCCESS', 'fr': 'Parler sans écran, ça fait du bien. On reprend un café ensemble ?', 'garde': {'telephoneJamaisOuvert': True}},
         'FUN': {'id': 'FIN_EMMA_FUN', 'fr': 'Ton téléphone est mort au milieu du rendez-vous. Au moins, il nous a laissés tranquilles !', 'garde': {'batterieVide': True}},
         'NEUTRAL': {'id': 'FIN_EMMA_NEUTRAL', 'fr': 'C’était calme et agréable, mais je ne crois pas qu’on se reverra.'},
         'FAIL': {'id': 'FIN_EMMA_FAIL', 'fr': 'J’aurais préféré discuter avec toi plutôt qu’avec ton téléphone.', 'garde': {'telephoneOuvert': True}}}),
]

variantes = {
 'VAR_LENA_COFFEE': {'profil': 'lena_r01', **L('Moies drénken ech Kaffi.', 'Le matin, je bois du café.', 'lecon'), 'trait': 'cafe'},
 'VAR_LENA_EARLY': {'profil': 'lena_r01', **L('Ech gi moies fréi eraus.', 'Je sors tôt le matin.', 'a_verifier_lod'), 'trait': 'matinale', 'beat': 'EV_LENA_MORNING'},
 'VAR_CLAIRE_TRAVEL': {'profil': 'claire_r01', **L('Ech reese gär.', "J'aime voyager."), 'trait': 'voyage'},
 'VAR_NOEMIE_MUSIC': {'profil': 'noemie_r01', **L('Ech hu Musek gär.', "J'aime la musique."), 'trait': 'musique'},
 'VAR_NOEMIE_MORNING': {'profil': 'noemie_r01', **L('Moies drénken ech Kaffi.', 'Le matin, je bois du café.', 'lecon'), 'trait': 'cafe'},
 'VAR_MAYA_LANG': {'profil': 'maya_r01', **L('Ech schwätzen Däitsch an Englesch.', 'Je parle allemand et anglais.', 'lecon'), 'trait': 'langues'},
 'VAR_MAYA_READING': {'profil': 'maya_r01', **L('Ech liese gär.', "J'aime lire.", 'lecon'), 'trait': 'lecture'},
 'VAR_SOFIA_EARLY': {'profil': 'sofia_r01', **L('Moies fueren ech gär mam Zuch.', "Le matin, j'aime prendre le train."), 'trait': 'train'},
 'VAR_SOFIA_COFFEE': {'profil': 'sofia_r01', **L('Ech drénke gär Kaffi.', "J'aime boire du café.", 'lecon'), 'trait': 'cafe'},
 'VAR_EMMA_READING': {'profil': 'emma_r01', **L('Owes liesen ech gär.', "Le soir, j'aime lire.", 'lecon'), 'trait': 'lecture'},
 'VAR_EMMA_TIME': {'profil': 'emma_r01', **L('Ech hunn owes Zäit.', "J'ai du temps le soir."), 'trait': 'soiree'},
}
preferences = {
 'PREF_AGE_INDIFFERENT': {**L('Mir ass den Alter net esou wichteg.', "L'âge ne compte pas tant que ça pour moi.", 'a_verifier_lod'), 'agePreference': 'indifferent'},
 'PREF_AGE_SIMILAR': {**L('Ech hu léiwer een, deen ongeféier esou al ass wéi ech.', "Je préfère quelqu'un d'à peu près mon âge.", 'a_verifier_lod'), 'agePreference': 'prefers_similar'},
 'PREF_AGE_OLDER': {**L('Ech hu léiwer eeler Leit.', 'Je préfère les personnes plus âgées.', 'a_verifier_lod'), 'agePreference': 'prefers_older'},
 'PREF_AGE_YOUNGER': {**L('Ech hu léiwer méi jonk Leit.', 'Je préfère les personnes plus jeunes.', 'a_verifier_lod'), 'agePreference': 'prefers_younger'},
 'PREF_EX_ALEX': {**L('Mäin Ex huet Alex geheescht. Dat ass nach ëmmer komesch fir mech.', "Mon ex s'appelait Alex. Ça me fait encore drôle d'entendre ce prénom.", 'a_verifier_lod'), 'dislikedFirstName': 'Alex'},
}

def C(id, lu, fr, truth, lc=True, **k):
    d = {'id': id, 'lu': lu, 'fr': fr, 'truth': truth, 'languageCorrect': lc}
    d.update(k); return d

beats = {
 'B01_SALUT': {'acte': 1, 'type': 'question', 'lessonIds': [1], 'theme': 'salutation', 'prompt': L('Moien! Wéi geet et dir?', 'Salut ! Comment ça va ?', 'lecon'), 'choices': [
    C('REP01_A', 'Mir geet et gutt, merci. An dir?', 'Je vais bien, merci. Et toi ?', 'honest', social={'affinity': 6}),
    C('REP01_B', 'Et geet.', 'Ça va.', 'honest', social={'affinity': 2}),
    C('REP01_C', 'Äddi!', 'Au revoir !', 'error', lc=False, social={'affinity': -5}, correction={'lu': 'Mir geet et gutt, merci. An dir?', 'fr': 'Le rendez-vous commence : on répond à « Wéi geet et dir? », on ne dit pas au revoir.'})]},
 'B02_SALUT_SOIR': {'acte': 1, 'type': 'question', 'lessonIds': [1], 'theme': 'salutation', 'prompt': L('Gudden Owend!', 'Bonsoir !', 'lecon'), 'choices': [
    C('REP02_A', 'Gudden Owend!', 'Bonsoir !', 'honest', social={'affinity': 6}),
    C('REP02_B', 'Moien!', 'Bonjour !', 'honest', social={'affinity': 3}),
    C('REP02_C', 'Gudde Moien!', 'Bonjour ! (le matin)', 'error', lc=False, social={'affinity': -3}, correction={'lu': 'Gudden Owend!', 'fr': '« Gudde Moien » se dit le matin. Le soir : « Gudden Owend ».'})]},
 'B03_NAME': {'acte': 1, 'type': 'question', 'lessonIds': [1], 'theme': 'prenom', 'prompt': L('Wéi heeschs du?', "Comment t'appelles-tu ?", 'lecon'), 'choices': [
    C('REP03_A', 'Ech heeschen Alex.', "Je m'appelle Alex.", 'honest', claims={'prenom': 'Alex'}),
    C('REP03_B', 'Ech heesche Max.', "Je m'appelle Max.", 'lie', claims={'prenom': 'Max'}),
    C('REP03_C', 'Ech heesche James Bond.', "Je m'appelle James Bond.", 'joke', flags=['joke_prenom'])]},
 'B04_AGE': {'acte': 1, 'type': 'question', 'lessonIds': [5, 14], 'theme': 'age', 'troisChoix': True, 'prompt': L('Wéi al bass du?', 'Quel âge as-tu ?', 'lecon'), 'choices': [
    C('REP04_A', 'Ech sinn aachtanzwanzeg Joer al.', "J'ai 28 ans.", 'honest', claims={'age': 28}),
    C('REP04_B', 'Ech sinn drësseg Joer al.', "J'ai 30 ans.", 'lie', claims={'age': 30}),
    C('REP04_C', 'Ech sinn honnertzwanzeg Joer al.', "J'ai 120 ans.", 'joke', flags=['joke_age_120'], review='lecon_modele')]},
 'B05_ORIGIN': {'acte': 2, 'type': 'question', 'lessonIds': [7], 'theme': 'origine', 'prompt': L('Vu wou kënns du?', "D'où viens-tu ?", 'lecon'), 'choices': [
    C('REP05_A', 'Ech kommen aus Frankräich.', 'Je viens de France.', 'honest', claims={'origin': 'Frankräich'}),
    C('REP05_B', 'Ech kommen aus Portugal.', 'Je viens du Portugal.', 'lie', claims={'origin': 'Portugal'}),
    C('REP05_C', 'Ech kommen aus Däitschland.', "Je viens d'Allemagne.", 'lie', claims={'origin': 'Däitschland'})]},
 'B06_CITY': {'acte': 2, 'type': 'question', 'lessonIds': [10], 'theme': 'ville', 'prompt': L('Wou wunns du?', 'Où habites-tu ?', 'lecon'), 'choices': [
    C('REP06_A', 'Ech wunnen zu Metz.', "J'habite à Metz.", 'honest', claims={'city': 'Metz'}),
    C('REP06_B', 'Ech wunnen zu Lëtzebuerg.', "J'habite à Luxembourg-ville.", 'lie', claims={'city': 'Lëtzebuerg'}),
    C('REP06_C', 'Ech wunnen zu Esch.', "J'habite à Esch.", 'lie', claims={'city': 'Esch'})]},
 'B07_LANGUAGE': {'acte': 2, 'type': 'question', 'lessonIds': [9], 'theme': 'langue', 'prompt': L('Wat fir eng Sprooch schwätz du?', 'Quelle langue parles-tu ?', 'lecon'), 'choices': [
    C('REP07_A', 'Ech schwätze Franséisch.', 'Je parle français.', 'honest', claims={'language': 'Franséisch'}),
    C('REP07_B', 'Ech schwätze Portugisesch.', 'Je parle portugais.', 'lie', claims={'language': 'Portugisesch'}),
    C('REP07_C', 'Ech schwätzen Däitsch.', 'Je parle allemand.', 'lie', claims={'language': 'Däitsch'})]},
 'B08_PROFESSION': {'acte': 2, 'type': 'question', 'lessonIds': [11], 'theme': 'metier', 'prompt': L('Wat schaffs du?', 'Que fais-tu comme travail ?', 'lecon'), 'choices': [
    C('REP08_A', 'Ech sinn e Banker.', 'Je suis banquier.', 'honest', claims={'job': 'Banker'}),
    C('REP08_B', 'Ech sinn en Dokter.', 'Je suis médecin.', 'lie', claims={'job': 'Dokter'}),
    C('REP08_C', 'Ech sinn e Polizist.', 'Je suis policier.', 'lie', claims={'job': 'Polizist'})]},
 'B09_WORKPLACE': {'acte': 2, 'type': 'question', 'lessonIds': [11, 10], 'theme': 'travail', 'prompt': L('Wou schaffs du?', 'Où travailles-tu ?', 'lecon'), 'choices': [
    C('REP09_A', 'Ech schaffen an enger Bank.', 'Je travaille dans une banque.', 'honest', claims={'workplace': 'Bank'}),
    C('REP09_B', 'Ech schaffen an engem Spidol.', 'Je travaille dans un hôpital.', 'lie', claims={'workplace': 'Spidol'})]},
 'B10_FOOT': {'acte': 2, 'type': 'question', 'lessonIds': [16], 'theme': 'football', 'pedagogicalScoring': False, 'prompt': L('Spills du gär Fussball?', 'Tu aimes jouer au football ?', 'lecon'), 'choices': [
    C('REP10_A', 'Nee, ech spillen net gär Fussball.', "Non, je n'aime pas jouer au football.", 'honest', claims={'football': False}),
    C('REP10_B', 'Jo, ech spille gär Fussball.', "Oui, j'aime jouer au football.", 'lie', claims={'football': True}),
    C('REP10_C', 'Jo! Ech sinn e Fussballstar!', 'Oui ! Je suis une star du foot !', 'joke', flags=['joke_foot'], review='a_verifier_lod')]},
 'B11_COFFEE': {'acte': 2, 'type': 'question', 'lessonIds': [16], 'theme': 'cafe', 'prompt': L('Drénks du moies Kaffi?', 'Tu bois du café le matin ?', 'lecon'), 'choices': [
    C('REP11_A', 'Jo, ech drénke moies Kaffi.', 'Oui, je bois du café le matin.', 'honest', claims={'morningCoffee': True}),
    C('REP11_B', 'Nee, ech drénke moies kee Kaffi.', 'Non, je ne bois pas de café le matin.', 'lie', claims={'morningCoffee': False}),
    C('REP11_C', 'Kaffi!', 'Café !', 'error', lc=False, social={'affinity': -1}, pragmatique=True, correction={'lu': 'Jo, ech drénke moies Kaffi.', 'fr': 'Pas faux, mais un peu sec : réponds avec une phrase complète.'})]},
 'B12_COFFEE_OFFER': {'acte': 2, 'type': 'question', 'lessonIds': [16], 'theme': 'cafe_offre', 'prompt': L('Drénks du Kaffi?', 'Tu bois du café ?'), 'choices': [
    C('REP12_A', 'Jo, gär.', 'Oui, volontiers.', 'honest', social={'affinity': 5}),
    C('REP12_B', 'Jo, merci.', 'Oui, merci.', 'honest', social={'affinity': 3}),
    C('REP12_C', 'Nee, merci.', 'Non merci.', 'honest', social={'affinity': 1})]},
 'B13_NATIONALITY': {'acte': 2, 'type': 'question', 'lessonIds': [8], 'theme': 'nationalite', 'prompt': L('Wat fir eng Nationalitéit hues du?', 'Quelle est ta nationalité ?', 'lecon'), 'choices': [
    C('REP13_A', 'Ech sinn e Fransous.', 'Je suis français.', 'honest', claims={'nationality': 'Fransous'}),
    C('REP13_B', 'Ech sinn e Portugis.', 'Je suis portugais.', 'lie', claims={'nationality': 'Portugis'}),
    C('REP13_C', 'Ech sinn e Lëtzebuerger.', 'Je suis luxembourgeois.', 'lie', claims={'nationality': 'Lëtzebuerger'})]},
 'B21_ASK_HER': {'acte': 2, 'type': 'demande', 'lessonIds': [1, 10, 11], 'theme': 'question_elle', 'pedagogicalScoring': False, 'prompt': L('Elo bass du drun!', 'À toi de poser une question !', 'audit_regles'), 'choices': [
    C('REP21_A', 'Wou wunns du?', 'Où habites-tu ?', 'question', repond='ville', social={'affinity': 3}),
    C('REP21_B', 'Wat schaffs du?', 'Quel est ton métier ?', 'question', repond='metier', social={'affinity': 3}),
    C('REP21_C', 'Wéi al bass du?', 'Quel âge as-tu ?', 'question', repond='age', social={'affinity': 1})]},
 'B_DRAW': {'acte': 2, 'type': 'question', 'lessonIds': [], 'theme': 'dessin', 'pedagogicalScoring': False, 'prompt': L('Mols du gär?', 'Tu aimes dessiner ?'), 'choices': [
    C('B_DRAW_NO', 'Nee, ech molen net gär.', "Non, je n'aime pas dessiner.", 'honest', claims={'drawing': False}),
    C('B_DRAW_YES', 'Jo, ech mole gär.', "Oui, j'aime dessiner.", 'lie', claims={'drawing': True}),
    C('B_DRAW_JOKE', 'Ech sinn e grousse Kënschtler!', 'Je suis un grand artiste !', 'joke', flags=['joke_art'], review='a_verifier_lod')]},
 'B_GAMING': {'acte': 2, 'type': 'question', 'lessonIds': [], 'theme': 'gaming', 'pedagogicalScoring': False, 'prompt': L('Spills du gär Computerspiller?', 'Tu aimes les jeux vidéo ?'), 'choices': [
    C('B_GAMING_NO', 'Nee, ech spillen net gär Computerspiller.', "Non, je n'aime pas les jeux vidéo.", 'honest', claims={'gaming': False}),
    C('B_GAMING_YES', 'Jo, ech spille gär Computerspiller.', "Oui, j'aime les jeux vidéo.", 'lie', claims={'gaming': True}),
    C('B_GAMING_JOKE', 'Ech sinn de Champion!', 'Je suis le champion !', 'joke', flags=['joke_gaming'])]},
 'EV_LENA_MORNING': {'titreFr': 'la routine du matin de Léna', 'acte': 2, 'type': 'question', 'lessonIds': [16], 'theme': 'routine', 'profil': 'lena_r01', 'requiresVariant': 'VAR_LENA_EARLY', 'prompt': L('Wat méchs du moies?', 'Tu fais quoi le matin ?'), 'choices': [
    C('EV_LENA_MORNING_C1', 'Moies drénken ech Kaffi.', 'Le matin, je bois du café.', 'honest', claims={'morningCoffee': True}, reactionFr='Elle rit : « Ce n’est pas vraiment un échauffement ! »'),
    C('EV_LENA_MORNING_C2', 'Moies ginn ech lafen.', 'Le matin, je vais courir.', 'lie', claims={'running': True}),
    C('EV_LENA_MORNING_C3', "Ech ginn op d'Aarbecht.", 'Je pars au travail.', 'honest', social={'affinity': 2})]},
 'EV_EMMA_COFFEE': {'titreFr': 'le café du matin, votre point commun', 'acte': 2, 'type': 'question', 'lessonIds': [16], 'theme': 'cafe', 'profil': 'emma_r01', 'prompt': L('Drénks du moies Kaffi?', 'Tu bois du café le matin ?', 'lecon'), 'choices': [
    C('EV_EMMA_COFFEE_C1', 'Jo, ech drénke moies Kaffi.', 'Oui, je bois du café le matin.', 'honest', claims={'morningCoffee': True}, social={'affinity': 7}, reactionFr='Elle sourit : un point commun.'),
    C('EV_EMMA_COFFEE_C2', 'Nee, ech drénke moies kee Kaffi.', 'Non, je ne bois pas de café le matin.', 'lie', claims={'morningCoffee': False}),
    C('EV_EMMA_COFFEE_C3', 'Ech sinn e Kaffi!', 'Je suis un café !', 'joke', flags=['joke_cafe'])]},
}
# Rappels (acte 3) : la question revient, la réponse doit rester cohérente avec ce qui a été dit.
rappels = {
 'B15_NAME_RECALL': {'attribut': 'prenom', 'lessonIds': [1], 'prompt': L('Wéi heeschs du nach eng Kéier?', "Tu t'appelles comment, déjà ?", 'a_verifier_lod'), 'choices': [
    {'id': 'REP15_A', 'lu': 'Ech heeschen Alex.', 'fr': "Je m'appelle Alex.", 'valeur': 'Alex'},
    {'id': 'REP15_B', 'lu': 'Ech heesche Max.', 'fr': "Je m'appelle Max.", 'valeur': 'Max'},
    {'id': 'REP15_C', 'lu': 'Ech heesche James Bond.', 'fr': "Je m'appelle James Bond.", 'valeur': 'blague'}]},
 'B16_AGE_RECALL': {'attribut': 'age', 'lessonIds': [5, 14], 'prompt': L('Wéi al bass du nach eng Kéier?', 'Tu as quel âge, déjà ?', 'a_verifier_lod'), 'choices': [
    {'id': 'REP16_A', 'lu': 'Ech sinn aachtanzwanzeg Joer al.', 'fr': "J'ai 28 ans.", 'valeur': 28},
    {'id': 'REP16_B', 'lu': 'Ech sinn drësseg Joer al.', 'fr': "J'ai 30 ans.", 'valeur': 30},
    {'id': 'REP16_C', 'lu': 'Dat war e Witz!', 'fr': "C'était une blague !", 'valeur': 'blague', 'review': 'a_verifier_lod'}]},
 'B17_CITY_RECALL': {'attribut': 'city', 'lessonIds': [10], 'prompt': L('Wou wunns du nach eng Kéier?', 'Tu habites où, déjà ?', 'a_verifier_lod'), 'choices': [
    {'id': 'REP17_A', 'lu': 'Ech wunnen zu Metz.', 'fr': "J'habite à Metz.", 'valeur': 'Metz'},
    {'id': 'REP17_B', 'lu': 'Ech wunnen zu Lëtzebuerg.', 'fr': "J'habite au Luxembourg.", 'valeur': 'Lëtzebuerg'},
    {'id': 'REP17_C', 'lu': 'Ech wunnen zu Esch.', 'fr': "J'habite à Esch.", 'valeur': 'Esch'}]},
 'RAPPEL_ORIGINE': {'attribut': 'origin', 'lessonIds': [7], 'prompt': L('Vu wou kënns du nach eng Kéier?', "Tu viens d'où, déjà ?", 'a_verifier_lod'), 'choices': [
    {'id': 'RAPPEL_ORIGINE_FR', 'lu': 'Ech kommen aus Frankräich.', 'fr': 'Je viens de France.', 'valeur': 'Frankräich'},
    {'id': 'RAPPEL_ORIGINE_PT', 'lu': 'Ech kommen aus Portugal.', 'fr': 'Je viens du Portugal.', 'valeur': 'Portugal'},
    {'id': 'RAPPEL_ORIGINE_DE', 'lu': 'Ech kommen aus Däitschland.', 'fr': "Je viens d'Allemagne.", 'valeur': 'Däitschland'}]},
 'RAPPEL_METIER': {'attribut': 'job', 'lessonIds': [11], 'prompt': L('Wat schaffs du nach eng Kéier?', 'Tu fais quoi comme travail, déjà ?', 'a_verifier_lod'), 'choices': [
    {'id': 'RAPPEL_METIER_BANKER', 'lu': 'Ech sinn e Banker.', 'fr': 'Je suis banquier.', 'valeur': 'Banker'},
    {'id': 'RAPPEL_METIER_DOKTER', 'lu': 'Ech sinn en Dokter.', 'fr': 'Je suis médecin.', 'valeur': 'Dokter'},
    {'id': 'RAPPEL_METIER_POLIZIST', 'lu': 'Ech sinn e Polizist.', 'fr': 'Je suis policier.', 'valeur': 'Polizist'}]},
}
clotures = {
 'B18_END': {'lessonIds': [1], 'prompt': L('Äddi!', 'Au revoir !', 'lecon'), 'choices': [
    C('REP18_A', 'Äddi!', 'Au revoir !', 'honest', social={'affinity': 4}),
    C('REP18_B', 'Schéinen Owend nach!', 'Bonne soirée !', 'honest', social={'affinity': 6}),
    C('REP18_C', 'Moien!', 'Bonjour !', 'error', lc=False, social={'affinity': -3}, correction={'lu': 'Äddi!', 'fr': 'On se quitte : « Äddi! » ou « Schéinen Owend nach! », pas « Moien! ».'})]},
 'B26_DATE_FAREWELL': {'lessonIds': [1], 'pedagogicalScoring': False, 'prompt': L('Et war flott!', "C'était sympa !", 'a_verifier_lod'), 'choices': [
    C('REP26_A', 'Merci, et war flott.', "Merci, c'était sympa.", 'honest', social={'affinity': 5}, review='a_verifier_lod'),
    C('REP26_B', 'Äddi!', 'Au revoir !', 'honest', social={'affinity': 2}),
    C('REP26_C', 'Bis geschwënn!', 'À bientôt !', 'honest', social={'affinity': 4}, review='a_verifier_lod')]},
 'B24_TOMORROW': {'lessonIds': [15, 16], 'pedagogicalScoring': False, 'traductionVisible': True, 'positiveSeulement': True, 'prompt': L('Hues du muer Zäit?', 'Tu as du temps demain ?', 'a_verifier_lod'), 'choices': [
    C('REP24_A', 'Jo, gär!', 'Oui, volontiers !', 'honest', social={'affinity': 4}),
    C('REP24_B', 'Nee, leider net.', 'Non, malheureusement.', 'honest', social={'affinity': -2}, review='a_verifier_lod'),
    C('REP24_C', 'Dat weess ech nach net.', 'Je ne sais pas encore.', 'honest', social={'affinity': 0}, review='a_verifier_lod')]},
}

# Douze parcours pilotes (bible §10). Les EV_* conditionnels sont déclenchés par le moteur,
# B15–B17 désignent l'emplacement du rappel, B18 la clôture.
plans = [
 {'id': 'P01', 'profil': 'lena_r01', 'sequence': ['B01_SALUT', 'B03_NAME', 'B10_FOOT', 'EV_LENA_FOOT', 'B06_CITY', 'B15_NAME_RECALL', 'B18_END'], 'particularite': 'mensonge football → gaffe ou aveu'},
 {'id': 'P02', 'profil': 'lena_r01', 'sequence': ['B02_SALUT_SOIR', 'B03_NAME', 'B11_COFFEE', 'EV_LENA_MORNING', 'B05_ORIGIN', 'B21_ASK_HER', 'B18_END'], 'particularite': 'routine matinale → pas de bluff imposé', 'variante': 'VAR_LENA_EARLY'},
 {'id': 'P03', 'profil': 'claire_r01', 'sequence': ['B02_SALUT_SOIR', 'B03_NAME', 'B08_PROFESSION', 'EV_CLAIRE_JOB', 'B06_CITY', 'B17_CITY_RECALL', 'B18_END'], 'particularite': 'faux métier → contrôle cohérent'},
 {'id': 'P04', 'profil': 'claire_r01', 'valide': False, 'raison': 'B14_TIME et EV_CLAIRE_TIME non intégrés (heure ambiguë).', 'sequence': ['B01_SALUT', 'B03_NAME', 'B04_AGE', 'B14_TIME', 'EV_CLAIRE_TIME', 'B07_LANGUAGE', 'B18_END'], 'particularite': 'horaire public → rappel d’heure'},
 {'id': 'P05', 'profil': 'noemie_r01', 'sequence': ['B01_SALUT', 'B03_NAME', 'B06_CITY', 'B_DRAW', 'EV_NOEMIE_DRAW', 'B07_LANGUAGE', 'B18_END'], 'particularite': 'dessin'},
 {'id': 'P06', 'profil': 'noemie_r01', 'sequence': ['B02_SALUT_SOIR', 'B03_NAME', 'B05_ORIGIN', 'B12_COFFEE_OFFER', 'EV_NOEMIE_COLOR', 'B21_ASK_HER', 'B18_END'], 'particularite': 'couleur/look et café'},
 {'id': 'P07', 'profil': 'maya_r01', 'sequence': ['B01_SALUT', 'B03_NAME', 'B07_LANGUAGE', 'B_GAMING', 'EV_MAYA_RETRO', 'B05_ORIGIN', 'B18_END'], 'particularite': 'console'},
 {'id': 'P08', 'profil': 'maya_r01', 'sequence': ['B02_SALUT_SOIR', 'B03_NAME', 'B07_LANGUAGE', 'EV_MAYA_GERMAN', 'B06_CITY', 'B21_ASK_HER', 'B18_END'], 'particularite': 'bluff sur l’allemand, hors score allemand'},
 {'id': 'P09', 'profil': 'sofia_r01', 'sequence': ['B02_SALUT_SOIR', 'B03_NAME', 'B05_ORIGIN', 'EV_SOFIA_PORTUGAL', 'B07_LANGUAGE', 'B15_NAME_RECALL', 'B18_END'], 'particularite': 'mensonge Portugal → chat/vache/aveu'},
 {'id': 'P10', 'profil': 'sofia_r01', 'valide': False, 'raison': 'B14_TIME et EV_SOFIA_TRAIN non intégrés (heure ambiguë).', 'sequence': ['B01_SALUT', 'B03_NAME', 'B06_CITY', 'B14_TIME', 'EV_SOFIA_TRAIN', 'B21_ASK_HER', 'B18_END'], 'particularite': 'horaire de train'},
 {'id': 'P11', 'profil': 'emma_r01', 'sequence': ['B01_SALUT', 'B03_NAME', 'B11_COFFEE', 'B06_CITY', 'EV_EMMA_PHONE', 'B15_NAME_RECALL', 'B18_END'], 'particularite': 'téléphone consulté et trait déclaré'},
 {'id': 'P12', 'profil': 'emma_r01', 'sequence': ['B02_SALUT_SOIR', 'B03_NAME', 'EV_EMMA_COFFEE', 'B07_LANGUAGE', 'B21_ASK_HER', 'B18_END'], 'particularite': 'conversation détendue sans téléphone'},
]

def E(**k): return k
def EC(id, fr, social, reactionFr, lu=None, visuel=None, **k):
    d = {'id': id, 'fr': fr, 'social': social, 'reactionFr': reactionFr}
    if lu: d['lu'] = lu
    if visuel: d['visuel'] = visuel
    d.update(k); return d
evenements = {
 'EV_LENA_FOOT': E(titreFr='les passes de foot avec Léna', profil='lena_r01', taille='gros', declencheur={'mensonge': {'football': True}}, npc=L('Du spills gär Fussball? Super, da komm, mir spillen!', 'Tu joues au foot ? Super, viens, on fait quelques passes !'), choices=[
    EC('EV_LENA_FOOT_C1', 'Oui, avec plaisir !', {'affinity': 5, 'suspicion': 8}, 'Tu rates le ballon de trois mètres. Elle éclate de rire.', lu='Jo, gär!', visuel='rire'),
    EC('EV_LENA_FOOT_C2', 'Non, en fait je n’aime pas le foot.', {'affinity': 1, 'suspicion': -6}, 'Elle apprécie un aveu un peu tardif.', lu='Nee, ech spillen net gär Fussball.', aveu=True, visuel='hoche'),
    EC('EV_LENA_FOOT_C3', 'Je suis une star du foot !', {'affinity': 2, 'suspicion': 6}, 'Elle te met au défi, avec un sourire incrédule.', lu='Ech sinn e Fussballstar!', visuel='sourcil')]),
 'EV_CLAIRE_JOB': E(titreFr='Claire t’interroge sur ton « hôpital »', profil='claire_r01', taille='petit', declencheur={'mensonge': {'job': 'Dokter'}}, npc=L('Du bass Dokter? Wou schaffs du?', 'Tu es médecin ? Tu travailles où ?'), choices=[
    EC('EV_CLAIRE_JOB_C1', 'Je travaille à l’hôpital.', {'affinity': 2, 'suspicion': 12}, 'Elle lève un sourcil. Ton bluff devient fragile.', lu='Ech schaffen am Spidol.', visuel='sourcil'),
    EC('EV_CLAIRE_JOB_C2', 'Non, en fait je suis banquier.', {'affinity': 1, 'suspicion': -6}, 'Elle sourit : « Pourquoi m’inventer un hôpital ? »', lu='Nee, ech sinn e Banker.', aveu=True, visuel='hoche'),
    EC('EV_CLAIRE_JOB_C3', 'C’était une blague !', {'affinity': -2, 'suspicion': 4}, 'Elle trouve ton sens de l’humour très discutable.', lu='Dat war e Witz!', aveu=True, visuel='sourcil')]),
 'EV_NOEMIE_DRAW': E(titreFr='le portrait sur la serviette', profil='noemie_r01', taille='gros', declencheur={'mensonge': {'drawing': True}}, npc=L('Kanns du mech molen?', 'Tu peux me dessiner ?'), choices=[
    EC('EV_NOEMIE_DRAW_C1', 'Oui, volontiers.', {'affinity': 6, 'suspicion': 4}, 'Ton portrait sur la serviette ressemble à une patate. Elle explose de rire.', lu='Jo, gär!', visuel='rire'),
    EC('EV_NOEMIE_DRAW_C2', 'Non, je ne sais pas dessiner.', {'affinity': 1, 'suspicion': -4}, 'Elle te tend quand même le crayon.', lu='Nee, ech kann net molen.', aveu=True, visuel='hoche'),
    EC('EV_NOEMIE_DRAW_C3', 'C’est de l’art !', {'affinity': 4, 'suspicion': 2}, 'Elle contemple le gribouillis et en fait une critique très sérieuse.', lu='Dat ass Konscht!', visuel='rire')]),
 'EV_NOEMIE_COLOR': E(titreFr='Noémie remarque tes couleurs', profil='noemie_r01', taille='petit', declencheur={'look': {'style': 'creatif', 'color': 'rout'}}, npc=L('Ech hu gär Faarwen!', "J'aime les couleurs !"), choices=[
    EC('EV_NOEMIE_COLOR_C1', 'Merci !', {'affinity': 3}, 'Elle remarque ton effort.', lu='Merci!', visuel='hoche'),
    EC('EV_NOEMIE_COLOR_C2', 'Le rouge est ma couleur préférée.', {'affinity': 4}, 'Elle apprécie le point commun.', lu='Rout ass meng Liiblingsfaarf.', visuel='hoche'),
    EC('EV_NOEMIE_COLOR_C3', 'Je suis une œuvre d’art !', {'affinity': 2}, 'Elle rit de bon cœur.', lu='Ech sinn e Konschtwierk!', visuel='rire', review='a_verifier_lod')]),
 'EV_MAYA_RETRO': E(titreFr='la console rétro de Maya', profil='maya_r01', taille='gros', declencheur={'mensonge': {'gaming': True}}, npc=L('Du spills gär Computerspiller? Da probéier dat!', 'Tu aimes les jeux vidéo ? Alors essaie ma console !'), choices=[
    EC('EV_MAYA_RETRO_C1', 'Oui !', {'affinity': 5, 'suspicion': 5}, 'Tu perds en quatre secondes. Elle te propose une revanche.', lu='Jo!', visuel='rire'),
    EC('EV_MAYA_RETRO_C2', 'Non, je ne connais pas ce jeu.', {'affinity': 3, 'suspicion': -5}, 'Ravie, elle t’explique son jeu préféré.', lu='Nee, ech kennen dat Spill net.', aveu=True, visuel='hoche'),
    EC('EV_MAYA_RETRO_C3', 'Je suis le champion !', {'affinity': 2, 'suspicion': 6}, 'Défaite comique immédiate.', lu='Ech sinn de Champion!', visuel='rire')]),
 'EV_MAYA_GERMAN': E(titreFr='Maya veut parler allemand', profil='maya_r01', taille='petit', declencheur={'mensonge': {'language': 'Däitsch'}}, npc=L('Du schwätz Däitsch? Super!', 'Tu parles allemand ? Super !'), choices=[
    EC('EV_MAYA_GERMAN_C1', 'En fait, je ne parle pas allemand.', {'affinity': 2, 'suspicion': -6}, 'Elle rit : « Tu fais aussi des CV mensongers ? »', lu='Ech schwätzen net Däitsch.', aveu=True, visuel='rire'),
    EC('EV_MAYA_GERMAN_C2', 'Je parle français.', {'affinity': 1, 'suspicion': -3}, 'Réaction détendue.', lu='Ech schwätze Franséisch.', aveu=True, visuel='hoche'),
    EC('EV_MAYA_GERMAN_C3', 'Oui, je parle allemand.', {'affinity': 0, 'suspicion': 8}, 'Elle garde un doute.', lu='Jo, ech schwätzen Däitsch.', visuel='sourcil')]),
 'EV_SOFIA_PORTUGAL': E(titreFr='le quiz des animaux en portugais', profil='sofia_r01', taille='gros', declencheur={'mensonge': {'origin': 'Portugal', 'language': 'Portugisesch'}, 'unSuffit': True}, npc=L('Du kënns aus Portugal? Wat fir en Déier sinn ech? Op Portugisesch!', 'Tu viens du Portugal ? Alors, à quel animal je ressemble ? Réponds en portugais !'), choices=[
    EC('vaca', 'Vaca (vache)', {'affinity': -12, 'suspicion': 14}, '« UNE VACHE ?! » Disque rayé. Grand silence.', texte='Vaca', langue='pt', visuel='scratch'),
    EC('hipopotamo', 'Hipopótamo (hippopotame)', {'affinity': -14, 'suspicion': 14}, '« UN HIPPOPOTAME ?! »', texte='Hipopótamo', langue='pt', visuel='zoom'),
    EC('gata', 'Gata (chatte, l’animal)', {'affinity': 6}, '« Un chat ? C’est mignon ! »', texte='Gata', langue='pt', visuel='joie'),
    EC('aveu', 'En fait, je ne parle pas portugais.', {'affinity': 2, 'suspicion': -8}, 'Elle rit et accepte ton aveu.', lu='Ech schwätzen net Portugisesch.', aveu=True, visuel='rire')]),
 'EV_EMMA_PHONE': E(titreFr='Emma remarque ton téléphone', profil='emma_r01', taille='petit', declencheur={'telephone': True}, npc=L('Bass du ëmmer um Handy?', 'Tu es toujours sur ton téléphone ?', 'audit_regles'), choices=[
    EC('EV_EMMA_PHONE_C1', 'Pardon, je range le téléphone.', {'affinity': -4}, 'Elle reprend calmement la discussion.', lu='Entschëllegt. Ech leeën den Handy ewech.', visuel='hoche', review='a_verifier_lod'),
    EC('EV_EMMA_PHONE_C2', 'Je regarde juste un instant.', {'affinity': -8}, 'Elle attend en silence.', lu='Ech kucken just kuerz.', visuel='froid', review='a_verifier_lod'),
    EC('EV_EMMA_PHONE_C3', 'Oui.', {'affinity': -12, 'suspicion': 4}, 'Elle regarde sa montre sans rien dire.', lu='Jo.', visuel='froid')]),
 'EV_EX_ALEX': E(titreFr='l’ex de ta partenaire s’appelait Alex', profil='tous', taille='petit', declencheur={'trait': 'exAlex', 'claim': {'prenom': 'Alex'}}, npc=L('Alex? Mäin Ex huet och Alex geheescht.', 'Alex ? Mon ex s’appelait Alex aussi…', 'a_verifier_lod'), choices=[
    EC('EV_EX_ALEX_C1', 'Je m’appelle Alex.', {'affinity': 2}, 'Elle souffle : « Bon, tu n’es pas lui. »', lu='Ech heeschen Alex.', visuel='hoche'),
    EC('EV_EX_ALEX_C2', 'Je m’appelle Max.', {'affinity': 1, 'suspicion': 6}, 'Elle hausse un sourcil. Ce prénom, il faudra t’en souvenir.', lu='Ech heesche Max.', claims={'prenom': 'Max'}, remplace=True, mensonge=True, visuel='sourcil'),
    EC('EV_EX_ALEX_C3', 'Je m’appelle James Bond.', {'affinity': 0}, 'Elle hésite entre rire et soupirer.', lu='Ech heesche James Bond.', visuel='sourcil')]),
 'EV_AGE_PREF': E(titreFr='tes « trente ans » l’intéressent', profil='tous', taille='petit', declencheur={'trait': 'agePrefPositive30', 'mensonge': {'age': 30}}, npc=L('Du bass drësseg? Interessant!', 'Ah, tu as trente ans ? Intéressant.', 'a_verifier_lod'), choices=[
    EC('EV_AGE_PREF_C1', 'Oui.', {'affinity': 3, 'suspicion': 2}, 'Elle sourit, convaincue… pour l’instant.', lu='Jo.', visuel='hoche'),
    EC('EV_AGE_PREF_C2', 'En fait, j’ai vingt-huit ans.', {'affinity': 0, 'suspicion': -4}, 'Elle apprécie la correction.', lu='Ech sinn aachtanzwanzeg Joer al.', aveu=True, visuel='hoche'),
    EC('EV_AGE_PREF_C3', 'C’était une blague !', {'affinity': -1, 'suspicion': -2}, 'Elle lève les yeux au ciel, amusée.', lu='Dat war e Witz!', aveu=True, visuel='sourcil')]),
 'B25_TRUTH_REPAIR': E(titreFr='tu as dû t’expliquer', profil='tous', taille='petit', traductionVisible=True, declencheur={'contradiction': True}, npc=L('Ass dat wouer?', 'C’est vrai ?', 'a_verifier_lod'), choices=[
    EC('REP25_A', 'Non, c’était une blague.', {'affinity': 0, 'suspicion': -3}, 'Elle hésite, puis sourit à moitié.', lu='Nee, dat war e Witz.', visuel='sourcil'),
    EC('REP25_B', 'Pardon, j’ai menti.', {'affinity': 2, 'suspicion': -8}, 'Elle apprécie la franchise.', lu='Entschëllegt, ech hu gelunn.', aveu=True, visuel='hoche', review='a_verifier_lod'),
    EC('REP25_C', 'Oui.', {'affinity': -2, 'suspicion': 6}, 'Elle n’a pas l’air convaincue.', lu='Jo.', visuel='sourcil')]),
}
non_integres = [
 {'id': 'B14_TIME', 'raison': 'Heure du rendez-vous ambiguë (7 h / 19 h) : aucune formulation non ambiguë validée (Bible §6.28).'},
 {'id': 'EV_CLAIRE_TIME', 'raison': 'Dépend de B14 (heure canonique non validée).'},
 {'id': 'EV_SOFIA_TRAIN', 'raison': 'Dépend d’un horaire visible sur un billet Pix et de B14.'},
 {'id': 'B19_PARTNER_NAME', 'raison': 'Redondant avec B21 (Alex pose une question).'},
 {'id': 'B20_PARTNER_CITY / B22_ASK_HER_LANG', 'raison': 'Répliques de la partenaire : intégrées comme réponses canoniques de B21 (profils[].repliques), jamais comme boutons.'},
 {'id': 'B23_STYLE_REACTION', 'raison': 'Remplacé par la première impression REACT_*_LOOK_* (FR), « Deng Faarf » à valider.'},
 {'id': 'REP09_C « Ech schaffen doheem »', 'raison': 'Persona sans mode de travail : ni vérité ni mensonge (Bible §6.28).'},
 {'id': 'REACT_* (LU §11)', 'raison': 'Répliques LU candidates non affichées : les réactions sont montrées en FR (feedback social), comme prévu si l’audit n’est pas fait.'},
 {'id': 'PIX/AMIS « Blo. », « Rout. », « Gréng. »', 'raison': 'Fragments v01 remplacés par les posts complets de la Bible.'},
]
corrections = [
 {'avant': 'Ech heeschen Max. / Ech heeschen James Bond.', 'apres': 'Ech heesche Max. / Ech heesche James Bond.', 'regle': 'Règle du n (Eifeler Regel) : le n tombe devant M, J (leçon 1 : « Ech heesche Paul »).'},
 {'avant': 'Ech schwätzen Franséisch / Portugisesch', 'apres': 'Ech schwätze Franséisch / Portugisesch', 'regle': 'Le n tombe devant F et P (leçon 9 : « Ech schwätze Franséisch »).'},
 {'avant': 'Ech molen gär', 'apres': 'Ech mole gär', 'regle': 'Le n tombe devant g.'},
 {'avant': 'Nee, ech spille net gär …', 'apres': 'Nee, ech spillen net gär …', 'regle': 'Le n reste devant n.'},
 {'avant': 'Ech hunn Musek gär', 'apres': 'Ech hu Musek gär', 'regle': 'Le n tombe devant M.'},
 {'avant': 'Ech ginn moies fréi eraus', 'apres': 'Ech gi moies fréi eraus', 'regle': 'Le n tombe devant m.'},
 {'avant': 'Beim Rendez-vous: kee Telefon', 'apres': 'Beim Rendez-vous: keen Handy', 'regle': 'keen garde le n devant t et h (leçons : « keen Telefon », « keen Handy ») ; « Handy » comme dans EV_EMMA_PHONE.'},
 {'avant': 'Nee, ech drénke moies keen Kaffi. (B11, EV_EMMA_COFFEE)', 'apres': 'Nee, ech drénke moies kee Kaffi.', 'regle': 'Le n de keen tombe devant K (leçons : « kee Buch », « kee Portugis »).'},
 {'avant': 'Ech spille gär Fussball. E Freideg och!', 'apres': 'Ech spille gär Fussball. Och freides!', 'regle': '« freides » = le vendredi (habitude).'},
 {'avant': 'Ech spille gär Musek', 'apres': 'Ech maache gär Musek', 'regle': '« Musek maachen » = faire de la musique.'},
 {'avant': 'Ech schaffen als Buchhändlerin', 'apres': 'Ech schaffen an enger Librairie', 'regle': '« Buchhändlerin » est allemand ; « schaffen an enger Librairie » figure dans les leçons.'},
 {'avant': 'Ech sinn eng Konschtfigur! / Jo! Ech sinn de Messi!', 'apres': 'Ech sinn e Konschtwierk! / Jo! Ech sinn e Fussballstar!', 'regle': 'Mot plus naturel ; pas de personne réelle citée.'},
 {'avant': 'Ech si/sinn + âges des partenaires', 'apres': 'Ech si siwenanzwanzeg / fënnefanzwanzeg / sechsanzwanzeg ; Ech sinn eenandrësseg / nénganzwanzeg / drësseg', 'regle': 'Règle du n (leçon 5 : « Ech si siwenanzwanzeg Joer al »).'},
]

contenus = {
 'schemaVersion': 2, 'contentVersion': 'lux-match-a11-v2',
 'status': 'demo_textes_lu_en_relecture',
 'source': 'docs/LUX-MATCH-BIBLE-EDITORIALE-A11.md (27/10/2026), auditée par Claude le 27/10/2026',
 'reviewLegend': {
   'lecon': 'Phrase présente telle quelle dans les leçons (data/lecons) : vérifié automatiquement par les tests.',
   'lecon_modele': 'Même structure qu’une phrase de leçon, seul un nom, un nombre, un lieu ou une langue change (règle du n vérifiée).',
   'audit_regles': 'Vérifiée par Claude : conjugaison, règle du n, prépositions, accords (leçons + règles). Relecture native à faire.',
   'a_verifier_lod': 'Lexique ou tournure hors leçons (profession, adjectif, expression) : à confirmer sur LOD.lu et par un locuteur.'},
 'persona': persona, 'profils': profils, 'variantes': variantes, 'preferences': preferences,
 'plans': plans, 'beats': beats, 'rappels': rappels, 'clotures': clotures, 'evenements': evenements,
 'nonIntegres': non_integres, 'correctionsAudit': corrections,
 'finsAdaptees': [
  {'id': 'FIN_LENA_FAIL', 'bible': '… tu as changé d’histoire trois fois.', 'raison': 'Le nombre de changements n’est pas compté : « trois fois » retiré.'},
  {'id': 'FIN_CLAIRE_SUCCESS', 'bible': 'Tu es ponctuel et intéressant.', 'raison': 'La ponctualité n’est pas jouée (B14 non intégré) : « agréable » à la place.'},
  {'id': 'FIN_CLAIRE_FUN', 'bible': 'J’ai trois métiers différents dans mon agenda.', 'raison': 'Un run ne permet que deux métiers (Banker + mensonge Dokter).'},
  {'id': 'FIN_CLAIRE_FAIL', 'bible': 'Médecin, banquier, policier…', 'raison': 'Idem : seuls les métiers réellement annoncés peuvent être cités.'},
  {'id': 'FIN_NOEMIE_FAIL', 'bible': 'Tu as affirmé être peintre…', 'raison': 'Le joueur dit aimer dessiner (B_DRAW), pas être peintre.'},
  {'id': 'FIN_SOFIA_FAIL', 'bible': 'Portugal, France, Allemagne…', 'raison': 'Texte générique sur l’origine, quelle que soit la combinaison réellement annoncée.'}],
}
# « lecon » = phrase présente telle quelle dans les leçons ; sinon « lecon_modele » (même structure, autre nom/nombre/lieu).
import glob, re
corpus = []
def walk(x):
    if isinstance(x, str): corpus.append(x)
    elif isinstance(x, list): [walk(i) for i in x]
    elif isinstance(x, dict): [walk(v) for v in x.values()]
for f in glob.glob(RACINE + '/data/lecons/**/*.json', recursive=True): walk(json.load(open(f)))
norm = lambda t: re.sub(r'\s+', ' ', re.sub(r'[!?.,:;«»"]', ' ', t.lower())).strip()
texte = ' | '.join(norm(c) for c in corpus)
def literal(lu): return all(norm(ph) in texte for ph in re.split(r'(?<=[.!?])\s+', lu) if norm(ph))
def marquer(x):
    if isinstance(x, dict):
        if 'lu' in x and 'review' not in x: x['review'] = 'lecon' if literal(x['lu']) else 'audit_regles'
        if x.get('review') == 'lecon' and 'lu' in x and not literal(x['lu']): x['review'] = 'lecon_modele'
        for v in x.values(): marquer(v)
    elif isinstance(x, list): [marquer(v) for v in x]
marquer(contenus)
json.dump(contenus, open(RACINE + '/data/jeux/lux-match/contenus-v02.json', 'w'), ensure_ascii=False, indent=1)
print('ok', len(profils), len(beats), len(evenements))
