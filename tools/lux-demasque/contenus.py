# Génère data/jeux/lux-demasque/contenus-v01.json (SPEC 110) : personnages, dossiers rédigés,
# pièces et répliques LU/FR avec leur statut de relecture.
# Usage : python3 tools/lux-demasque/contenus.py  (depuis n'importe quel dossier)
#
# Règle : aucune phrase LU n'est fabriquée par le moteur. Chaque réplique est écrite ici,
# avec un statut :
#   lecon          phrase présente telle quelle dans data/lecons ou data/examens (vérifié ici) ;
#   lecon_modele   même structure qu'une phrase de leçon, un nom ou un nombre change ;
#   audit_regles   vérifiée par Claude (conjugaison, règle du n, prépositions, accords) ;
#   a_verifier_lod mot ou tournure absent des leçons : à confirmer sur LOD.lu / par un locuteur.
import json, os, glob, re
RACINE = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
L = lambda lu, fr, statut='audit_regles', note=None: dict({'lu': lu, 'fr': fr, 'review': statut}, **({'noteFr': note} if note else {}))

# ─── Personnages (fictifs, adultes) ──────────────────────────────────────────
personnages = {
 'milo': {
  'id': 'milo', 'nom': 'Milo', 'age': 30, 'villeFr': 'Bonnevoie (Luxembourg)',
  # Modèle Quaternius de Lux Match (public/lux-match/, CC0), recoloré.
  'apparence3d': {'modele': 'Casual_Male', 'peau': '#d9a27a', 'cheveux': '#2a1a12', 'haut': '#c0392b', 'bas': '#2b2b38'},
  'accrocheFr': 'Voyageur, chef d’équipe, amoureux des chats. Cherche quelqu’un qui aime les belles histoires.',
  'salut': L('Moien! Ech sinn de Milo.', 'Salut ! Moi, c’est Milo.', 'lecon_modele'),
  'reseaux': {
   'pix': {'pseudo': '@milo.explore', 'bioFr': 'Voyages · chat · pesto', 'pieces': ['PIX_KYOTO', 'PIX_CANAPE', 'PIX_PIXEL']},
   'pro': {'pseudo': 'Milo R.', 'bioFr': 'Tourisme · voyages · gestion d’équipe', 'pieces': ['PRO_PROFIL', 'PRO_EQUIPE']},
   'amis': {'pseudo': 'Milo', 'bioFr': 'Bonnevoie ❤️', 'pieces': ['AMIS_SAMI', 'LUXRUN_AOUT', 'AMIS_LEA']}
  }
 }
}

# Personnes qui apparaissent seulement sur les photos (jamais interrogées).
figurants = {
 'sami': {'id': 'sami', 'nom': 'Sami', 'apparence3d': {'modele': 'Casual2_Male', 'peau': '#a8714f', 'cheveux': '#121010', 'haut': '#2fa35a', 'bas': '#3a3a48'}}
}
# Une « photo » = un décor low-poly (lux-match-3d.js) + les personnes posées dedans.
def personne(qui, pose='Idle', x=0, z=0, rotation=0): return {'qui': qui, 'pose': pose, 'x': x, 'z': z, 'rotation': rotation}

# ─── Pièces (FR) : source, date, transcription complète, visuel décrit ─────────
def piece(id, source, auteur, dateFr, titre, transcription, visuel):
    return {'id': id, 'source': source, 'auteur': auteur, 'dateFr': dateFr, 'titre': titre, 'transcription': transcription, 'visuel': visuel}
pieces = [
 piece('PRO_PROFIL', 'pro', 'Milo R.', None, 'Profil Pro de Milo',
       'Milo R., 30 ans · Tourisme · voyages · gestion d’équipe. Expérience : chef d’équipe chez Horizon Voyages (Luxembourg), mars 2021 – juin 2026. Formation : BTS Tourisme, 2017.',
       {'type': 'profil', 'lignes': [['Chef d’équipe · Horizon Voyages', 'mars 2021 – juin 2026'], ['BTS Tourisme', '2017']]}),
 piece('PRO_EQUIPE', 'pro', 'Milo R.', '14 avril 2026', 'Publication : mon équipe',
       '« Fier de mon équipe chez Horizon Voyages ! 🧳 Cinq ans déjà. »',
       {'type': 'post', 'image': 'equipe', 'scene': 'bureau', 'personnes': [personne('milo', 'Victory', 0.2, -0.2, -0.2)]}),
 piece('AMIS_SAMI', 'amis', 'Sami K.', None, 'Profil de Sami (ami de Milo)',
       'Sami K. · Graphiste · Coloc à Bonnevoie avec Milo (et Pixel 🐈).',
       {'type': 'profil', 'lignes': [['Graphiste', ''], ['Coloc à Bonnevoie avec Milo (et Pixel 🐈)', '']]}),
 piece('PIX_CANAPE', 'pix', 'Milo', '4 octobre 2026', 'Photo : soirée match',
       'Photo : deux amis sur un canapé devant un match. Légende : « Sami est passé voir le match 📺 ».',
       {'type': 'photo', 'scene': 'canape', 'personnes': [personne('milo', 'Victory', -0.7, 0.2, 0.25), personne('sami', 'Victory', 0.75, 0.1, -0.25)]}),
 piece('LUXRUN_AOUT', 'amis', 'Milo', '31 août 2026', 'Capture LuxRun partagée par Milo',
       'Appli LuxRun — Août 2026 : 5 courses, les dimanches 2, 9, 16, 23 et 30 août, Parc de Bonnevoie, 10 minutes chacune. Message de Milo : « Régulier ! 💪 »',
       {'type': 'appli', 'lignes': [['dim. 2 août', 'Parc de Bonnevoie · 10 min'], ['dim. 9 août', 'Parc de Bonnevoie · 10 min'], ['dim. 16 août', 'Parc de Bonnevoie · 10 min'], ['dim. 23 août', 'Parc de Bonnevoie · 10 min'], ['dim. 30 août', 'Parc de Bonnevoie · 10 min']]}),
 piece('PIX_KYOTO', 'pix', 'Milo', '31 août 2026', 'Photo : Kyoto',
       'Photo : un temple et des lanternes rouges. Légende : « Kyoto ✨ 3 semaines inoubliables ».',
       {'type': 'photo', 'scene': 'kyoto', 'personnes': [personne('milo', 'Victory', 0.5, 0.3, -0.25)]}),
 piece('AMIS_LEA', 'amis', 'Léa M.', '12 septembre 2026', 'Publication de Léa : le pesto',
       '« Merci Milo pour le pesto de samedi ! 🍝 »',
       {'type': 'post', 'image': 'pesto', 'scene': 'pesto', 'personnes': []}),
 piece('PIX_PIXEL', 'pix', 'Milo', '2 octobre 2026', 'Photo : Pixel',
       'Photo : un chat roux endormi. Légende : « Pixel, champion de sieste ».',
       {'type': 'photo', 'scene': 'chat', 'personnes': []}),
]

# ─── Déclarations du dossier Milo ─────────────────────────────────────────────
def decl(id, theme, base, press, refus, vrai=True, mensonge=None, refusPieces=None):
    d = {'id': id, 'theme': theme, 'base': base, 'press': press, 'refus': refus, 'vrai': vrai}
    if mensonge: d['mensonge'] = mensonge
    if refusPieces: d['refusPieces'] = refusPieces
    return d
P = lambda q, r: {'question': q, 'reponse': r}

declarations = [
 decl('MILO_JOB', 'travail',
      L('Ech schaffen am Tourismus. Ech hunn eng Equipe.', 'Je travaille dans le tourisme. J’ai une équipe.', 'a_verifier_lod'),
      P(L('Wou schaffs du?', 'Tu travailles où ?', 'lecon'),
        L('Bei Horizon Voyages. Ech sinn all Dag am Büro.', 'Chez Horizon Voyages. Je suis au bureau tous les jours.')),
      L('Nee, nee. Ech schaffen am Tourismus!', 'Non, non. Je travaille dans le tourisme !', 'a_verifier_lod'),
      vrai=False,
      mensonge={'id': 'MILO_JOB_LIE', 'preuves': [['PRO_PROFIL']], 'exigePrecision': True,
                'refusSansPrecision': L('Wéi? Ech hunn « Tourismus » gesot, net Horizon!', 'Quoi ? J’ai dit « tourisme », pas Horizon !', 'a_verifier_lod'),
                'justification': L('Bis Juni, jo. Elo sichen ech eng nei Aarbecht.', 'Jusqu’en juin, oui. Maintenant, je cherche un nouveau travail.'),
                'aveuFr': 'Il baisse les yeux : « Je voulais juste faire bonne impression… »',
                'motivationFr': 'Paraître stable pendant qu’il cherche un nouvel emploi.',
                'explicationFr': 'Son profil Pro arrête Horizon Voyages en juin 2026. Or il t’a dit y être « tous les jours », en octobre.'},
      refusPieces={'PRO_EQUIPE': L('Gesäis du? Dat ass meng Equipe!', 'Tu vois ? C’est mon équipe !', 'a_verifier_lod')}),
 decl('MILO_FLAT', 'logement',
      L('Ech wunnen eleng. Ech hunn en Appartement zu Bonnevoie.', 'J’habite seul. J’ai un appartement à Bonnevoie.'),
      P(L('Wunns du eleng?', 'Tu habites seul ?'),
        L('Jo, eleng. Mat menger Kaz.', 'Oui, seul. Avec mon chat.')),
      L('Nee! Ech wunne wierklech eleng.', 'Non ! J’habite vraiment seul.', 'a_verifier_lod'),
      vrai=False,
      mensonge={'id': 'MILO_FLAT_LIE', 'preuves': [['AMIS_SAMI']],
                'justification': L('Okay, ech wunne mam Sami. Mee ech hu mäin Zëmmer!', 'Bon, j’habite avec Sami. Mais j’ai ma chambre !'),
                'aveuFr': '« …Enfin, quand Sami ne squatte pas la cuisine. »',
                'motivationFr': 'Paraître autonome.',
                'explicationFr': 'Sami se présente lui-même comme son coloc à Bonnevoie : Milo n’habite pas seul.'},
      refusPieces={'PIX_CANAPE': L('De Sami war just fir de Match do!', 'Sami était juste là pour le match !', 'a_verifier_lod')}),
 decl('MILO_RUN', 'sport',
      L('Ech gi Sonndes moies lafen.', 'Je vais courir le dimanche matin.', 'lecon_modele'),
      P(L('Wéi laang?', 'Combien de temps ?'),
        L('Zéng Minutten. Mee ech gi lafen!', 'Dix minutes. Mais je vais courir !')),
      L('Zéng Minutte sinn och Sport!', 'Dix minutes, c’est aussi du sport !')),
 decl('MILO_JAPAN', 'voyage',
      L('Am August war ech dräi Wochen a Japan.', 'En août, j’étais trois semaines au Japon.'),
      P(L('Wat hues du do gemaach?', 'Qu’est-ce que tu as fait là-bas ?', 'lecon_modele'),
        L('Ech hu vill Fotoe gemaach!', 'J’ai pris plein de photos !')),
      L('Ech war a Japan, wierklech!', 'J’étais au Japon, vraiment !', 'a_verifier_lod'),
      vrai=False,
      mensonge={'id': 'MILO_JAPAN_LIE', 'preuves': [['LUXRUN_AOUT']],
                'justification': L('Ech war net a Japan. Ech war doheem.', 'Je n’étais pas au Japon. J’étais à la maison.', 'lecon_modele'),
                'aveuFr': '« Kyoto vu de mon canapé. J’ai même ajouté les lanternes ! »',
                'motivationFr': 'Paraître aventureux.',
                'explicationFr': 'LuxRun le place au Parc de Bonnevoie tous les dimanches d’août : trois semaines au Japon en août, c’est impossible.',
                # Montré seulement APRÈS la preuve : le montage de la photo « Kyoto ».
                'revelation': {'piece': 'PIX_KYOTO', 'fr': 'Regarde mieux : six lanternes identiques, alignées au centimètre, et Milo collé devant le temple.'}},
      refusPieces={'PIX_KYOTO': L('Kuck! Dat ass Kyoto!', 'Regarde ! C’est Kyoto !')}),
 decl('MILO_COOK', 'cuisine',
      L('Ech kache gär fir meng Frënn.', 'J’aime cuisiner pour mes amis.'),
      P(L('Wat kachs du?', 'Qu’est-ce que tu cuisines ?'),
        L('Nuddele mat Pesto. Ëmmer!', 'Des pâtes au pesto. Toujours !', 'a_verifier_lod')),
      L('Hues du mäi Pesto net gär?', 'Tu n’aimes pas mon pesto ?', 'a_verifier_lod')),
 decl('MILO_CAT', 'animal',
      L('Ech hunn eng Kaz. Si heescht Pixel.', 'J’ai un chat. Il s’appelle Pixel.', 'audit_regles', 'Kaz est féminin : on dit « si », même pour un chat.'),
      P(L('Wou ass deng Kaz?', 'Il est où, ton chat ?'),
        L('Doheem. Si schléift.', 'À la maison. Il dort.')),
      L('Nee! Dat ass wierklech meng Kaz!', 'Non ! C’est vraiment mon chat !', 'a_verifier_lod')),
]

dossiers = [{
 'id': 'MILO_001', 'numero': '001', 'npc': 'milo', 'difficulte': 'pilote',
 'dateFr': 'samedi 24 octobre 2026', 'lieuFr': 'au café',
 'declarations': declarations,
 'pieces': [p['id'] for p in pieces],
 'fin': {
   'complet': L('Okay… Du hues gewonnen.', 'Bon… Tu as gagné.', 'a_verifier_lod'),
   'partiel': L('Gesäis du? Ech hunn net gelunn!', 'Tu vois ? Je n’ai pas menti !', 'a_verifier_lod')},
 'reviewStatus': 'lu_audit_claude'
}]


# ═══ Lot D4 — affaires atomiques (SPEC 110 §4.1) ═══════════════════════════════
# Une affaire = UNE déclaration complète et autonome : phrase LU, précision, refus, vérité
# ou mensonge, pièces (FR) qui la prouvent ou la confirment, leurres, réaction et aveu.
# Le générateur (lux-demasque-core.js) n'invente rien : il choisit des affaires compatibles
# (thèmes différents, incompatibilités déclarées) et remplace seulement {npc} — le prénom du
# prétendant — dans les textes FR des pièces. Aucune phrase LU ne contient de variable.
personnages.update({
 'noah': {
  'id': 'noah', 'nom': 'Noah', 'age': 32, 'villeFr': 'Luxembourg-ville',
  'apparence3d': {'modele': 'Suit_Male', 'peau': '#e8b48f', 'cheveux': '#5a3a1e', 'costume': '#2b3a55'},
  'accrocheFr': 'Sérieux au travail, drôle le week-end. Je cherche une vraie complicité.',
  'salut': L('Moien! Ech sinn den Noah.', 'Salut ! Moi, c’est Noah.', 'lecon_modele'),
  'reseaux': {'pix': {'pseudo': '@noah.lux', 'bioFr': 'Week-ends, musique, famille'}, 'pro': {'pseudo': 'Noah B.', 'bioFr': 'Santé · urgences'}, 'amis': {'pseudo': 'Noah', 'bioFr': 'Luxembourg ❤️'}}
 },
 'tom': {
  'id': 'tom', 'nom': 'Tom', 'age': 28, 'villeFr': 'Luxembourg-ville',
  'apparence3d': {'modele': 'Casual3_Male', 'peau': '#c98a5f', 'cheveux': '#141010', 'haut': '#2f6fd6', 'bas': '#24242e'},
  'accrocheFr': 'Toujours partant pour une nouvelle aventure. Et pour un bon repas.',
  'salut': L('Moien! Ech sinn den Tom.', 'Salut ! Moi, c’est Tom.', 'lecon_modele'),
  'reseaux': {'pix': {'pseudo': '@tom.go', 'bioFr': 'Voyages · sport · bonne bouffe'}, 'pro': {'pseudo': 'Tom M.', 'bioFr': 'Restauration'}, 'amis': {'pseudo': 'Tom', 'bioFr': 'Toujours dehors'}}
 }
})
# Prétendants du générateur : jamais ceux des dossiers rédigés (Milo, Noah, Tom ont un canon
# fixe — chat Pixel, sœur Clara… — qu'un autre tirage contredirait). Profils neutres.
RESEAUX_NEUTRES = lambda pseudo: {'pix': {'pseudo': '@' + pseudo.lower() + '.photos', 'bioFr': 'Photos du quotidien'}, 'pro': {'pseudo': pseudo, 'bioFr': 'Profil professionnel'}, 'amis': {'pseudo': pseudo, 'bioFr': 'Amis & famille'}}
def pretendant(id, nom, age, article, modele, teintes, accroche):
    return {'id': id, 'nom': nom, 'age': age, 'villeFr': 'Luxembourg-ville', 'apparence3d': dict({'modele': modele}, **teintes),
            'accrocheFr': accroche, 'salut': L('Moien! Ech sinn ' + article + ' ' + nom + '.', 'Salut ! Moi, c’est ' + nom + '.', 'lecon_modele'),
            'reseaux': RESEAUX_NEUTRES(nom), 'generateur': True}
personnages.update({
 'leo': pretendant('leo', 'Léo', 29, 'de', 'Casual_Male', {'peau': '#f0c3a0', 'cheveux': '#c98a3a', 'haut': '#2fa35a', 'bas': '#2c3550'}, 'Curieux de tout, surtout de toi.'),
 'hugo': pretendant('hugo', 'Hugo', 34, 'den', 'Suit_Male', {'peau': '#c98a5f', 'cheveux': '#1a1210', 'costume': '#3a2a4a'}, 'Calme, fiable… et plein de surprises.'),
 'sam': pretendant('sam', 'Sam', 27, 'de', 'Casual3_Male', {'peau': '#e0a985', 'cheveux': '#5a3a22', 'haut': '#d8343c', 'bas': '#1d2a4a'}, 'Je raconte bien les histoires. Viens vérifier !'),
 'jules': pretendant('jules', 'Jules', 31, 'de', 'Casual_Male', {'peau': '#8a5a3c', 'cheveux': '#0e0c0a', 'haut': '#f2c230', 'bas': '#3a3a48'}, 'Un café, une balade, une bonne discussion.'),
 'enzo': pretendant('enzo', 'Enzo', 30, 'den', 'Suit_Male', {'peau': '#f2d0b0', 'cheveux': '#3a2a1a', 'costume': '#1c3a2e'}, 'Organisé au travail, spontané le reste du temps.'),
 'nico': pretendant('nico', 'Nico', 33, 'den', 'Casual3_Male', {'peau': '#d9a27a', 'cheveux': '#6a4a2a', 'haut': '#7a3fc4', 'bas': '#24242e'}, 'Toujours le sourire, souvent une anecdote.'),
})
figurants.update({
 'karim': {'id': 'karim', 'nom': 'Karim', 'apparence3d': {'modele': 'Casual2_Male', 'peau': '#b07a55', 'cheveux': '#1a1210', 'haut': '#d8a020', 'bas': '#3a3a48'}}
})

def apiece(id, source, auteur, dateFr, titre, transcription, visuel):
    return {'id': id, 'source': source, 'auteur': auteur, 'dateFr': dateFr, 'titre': titre, 'transcription': transcription, 'visuel': visuel}
def affaire(id, theme, base, press, refus, pieces, vrai=True, mensonge=None, refusPieces=None, incompatibles=None, croise=False):
    a = {'id': id, 'theme': theme, 'vrai': vrai, 'base': base, 'press': press, 'refus': refus, 'pieces': pieces}
    if mensonge: a['mensonge'] = mensonge
    if refusPieces: a['refusPieces'] = refusPieces
    if incompatibles: a['incompatibles'] = incompatibles
    if croise: a['croise'] = True   # mensonge démontré par recoupement de dates
    return a
MOI = lambda pose='Idle', x=0.2, z=0, r=-0.2: personne('npc', pose, x, z, r)

affaires = [
 # ─── Mensonges ───────────────────────────────────────────────────────────
 affaire('A_TRAVAIL_CONTRAT', 'travail',
   L('Ech schaffen an engem Restaurant. Ech sinn e Kach.', 'Je travaille dans un restaurant. Je suis cuisinier.'),
   P(L('Wou schaffs du?', 'Tu travailles où ?', 'lecon'), L('Am Restaurant Bei Lucie. Ech sinn all Dag do.', 'Au restaurant Bei Lucie. J’y suis tous les jours.')),
   L('Nee, nee. Ech sinn e Kach!', 'Non, non. Je suis cuisinier !'),
   [apiece('PRO_CONTRAT', 'pro', '{npc}', None, 'Profil Pro de {npc}', '{npc} · Restauration. Expérience : cuisinier au restaurant Bei Lucie (Luxembourg-Gare), septembre 2022 – mai 2026. Formation : CAP cuisine, 2019.',
           {'type': 'profil', 'lignes': [['Cuisinier · Bei Lucie', 'sept. 2022 – mai 2026'], ['CAP cuisine', '2019']]}),
    apiece('PRO_PLAT', 'pro', '{npc}', '12 mars 2026', 'Publication : mon plat', '« Mon plat signature chez Bei Lucie 🍝 Venez goûter ! »', {'type': 'post', 'image': 'plat', 'scene': 'pesto', 'personnes': []})],
   vrai=False,
   mensonge={'preuves': [['PRO_CONTRAT']], 'exigePrecision': True,
     'refusSansPrecision': L('Wéi? Ech hunn den Numm net gesot!', 'Quoi ? Je n’ai pas dit quel restaurant !', 'a_verifier_lod'),
     'justification': L('Bis Mee, jo. Elo sichen ech eng nei Aarbecht.', 'Jusqu’en mai, oui. Maintenant, je cherche un nouveau travail.'),
     'aveuFr': 'Il soupire : « Je voulais avoir l’air installé… »', 'motivationFr': 'Paraître stable pendant qu’il cherche un emploi.',
     'explicationFr': 'Son profil Pro arrête Bei Lucie en mai 2026. Or il t’a dit y être « tous les jours », en octobre.'},
   refusPieces={'PRO_PLAT': L('Kuck! Dat hunn ech gekacht!', 'Regarde ! C’est moi qui l’ai cuisiné !')}),
 affaire('A_TRAVAIL_DOKTER', 'travail',
   L('Ech sinn en Dokter. Ech schaffen am Spidol.', 'Je suis médecin. Je travaille à l’hôpital.'),
   P(L('Zënter wéini?', 'Depuis quand ?'), L('Zënter zwee Joer.', 'Depuis deux ans.')),
   L('Jo! Ech sinn en Dokter!', 'Oui ! Je suis médecin !'),
   [apiece('AMIS_COLLEGUE', 'amis', 'Inès R.', '15 septembre 2026', 'Publication d’Inès (collègue de {npc})', '« Bravo à {npc}, notre infirmier de nuit, pour ses deux ans aux urgences ! 🎉 »', {'type': 'post', 'image': 'fete', 'scene': 'hopital', 'personnes': [MOI('Victory', -0.4, 0.3, 0.2)]}),
    apiece('PIX_NUIT', 'pix', '{npc}', '3 octobre 2026', 'Photo : nuit de garde', 'Photo : un couloir d’hôpital la nuit. Légende : « Encore une nuit à l’hôpital 🏥 ».', {'type': 'photo', 'scene': 'hopital', 'personnes': [MOI()]})],
   vrai=False,
   mensonge={'preuves': [['AMIS_COLLEGUE']],
     'justification': L('Okay… ech sinn en Infirmier. Net Dokter.', 'Bon… je suis infirmier. Pas médecin.'),
     'aveuFr': '« Mais je fais des piqûres, c’est presque pareil ! »', 'motivationFr': 'Impressionner avec un titre plus prestigieux.',
     'explicationFr': 'Sa collègue le présente comme « notre infirmier de nuit » aux urgences : il n’est pas médecin.'},
   refusPieces={'PIX_NUIT': L('Gesäis du? Ech sinn am Spidol!', 'Tu vois ? Je suis à l’hôpital !', 'a_verifier_lod')}),
 affaire('A_LOGEMENT_COLOC', 'logement',
   L('Ech wunnen eleng. Ech hunn en Appartement an der Stad.', 'J’habite seul. J’ai un appartement en ville.'),
   P(L('Wunns du eleng?', 'Tu habites seul ?'), L('Jo, ganz eleng.', 'Oui, tout seul.')),
   L('Nee! Ech wunne wierklech eleng.', 'Non ! J’habite vraiment seul.', 'a_verifier_lod'),
   [apiece('AMIS_KARIM', 'amis', 'Karim D.', None, 'Profil de Karim (ami de {npc})', 'Karim D. · Kinésithérapeute · Coloc avec {npc} au centre-ville depuis 2025 🏠', {'type': 'profil', 'lignes': [['Kinésithérapeute', ''], ['Coloc avec {npc} au centre-ville depuis 2025 🏠', '']]}),
    apiece('PIX_MATCH', 'pix', '{npc}', '4 octobre 2026', 'Photo : soirée match', 'Photo : deux amis devant un match. Légende : « Karim est passé voir le match 📺 ».', {'type': 'photo', 'scene': 'canape', 'personnes': [MOI('Victory', -0.7, 0.2, 0.25), personne('karim', 'Victory', 0.75, 0.1, -0.25)]})],
   vrai=False,
   mensonge={'preuves': [['AMIS_KARIM']],
     'justification': L('Okay, ech wunne mam Karim. Mee ech hu mäin Zëmmer!', 'Bon, j’habite avec Karim. Mais j’ai ma chambre !'),
     'aveuFr': '« Bon… c’est lui qui a la grande chambre. »', 'motivationFr': 'Paraître autonome.',
     'explicationFr': 'Karim se présente lui-même comme son coloc au centre-ville : il n’habite pas seul.'},
   refusPieces={'PIX_MATCH': L('De Karim war just fir de Match do!', 'Karim était juste là pour le match !', 'a_verifier_lod')}),
 affaire('A_VOYAGE_JAPON', 'voyage',
   L('Am August war ech dräi Wochen a Japan.', 'En août, j’étais trois semaines au Japon.'),
   P(L('Wat hues du do gemaach?', 'Qu’est-ce que tu as fait là-bas ?', 'lecon_modele'), L('Ech hu vill Fotoe gemaach!', 'J’ai pris plein de photos !')),
   L('Ech war a Japan, wierklech!', 'J’étais au Japon, vraiment !', 'a_verifier_lod'),
   [apiece('LUXRUN_MERL', 'amis', '{npc}', '31 août 2026', 'Capture LuxRun partagée par {npc}', 'Appli LuxRun — Août 2026 : 5 courses, les dimanches 2, 9, 16, 23 et 30 août, Parc de Merl, 10 minutes chacune. Message de {npc} : « Régulier ! 💪 »',
           {'type': 'appli', 'lignes': [['dim. ' + str(j) + ' août', 'Parc de Merl · 10 min'] for j in (2, 9, 16, 23, 30)]}),
    apiece('PIX_KYOTO2', 'pix', '{npc}', '31 août 2026', 'Photo : Kyoto', 'Photo : un temple et des lanternes rouges. Légende : « Kyoto ✨ 3 semaines inoubliables ».', {'type': 'photo', 'scene': 'kyoto', 'personnes': [MOI('Victory', 0.5, 0.3, -0.25)]})],
   vrai=False, croise=True, incompatibles=['A_SPORT_TOUSLESJOURS'],
   mensonge={'preuves': [['LUXRUN_MERL']],
     'justification': L('Ech war net a Japan. Ech war doheem.', 'Je n’étais pas au Japon. J’étais à la maison.', 'lecon_modele'),
     'aveuFr': '« Kyoto vu de mon canapé. J’ai même ajouté les lanternes ! »', 'motivationFr': 'Paraître aventureux.',
     'explicationFr': 'LuxRun le place au Parc de Merl tous les dimanches d’août : trois semaines au Japon en août, c’est impossible.',
     'revelation': {'piece': 'PIX_KYOTO2', 'fr': 'Regarde mieux : six lanternes identiques, alignées au centimètre, et {npc} collé devant le temple.'}},
   refusPieces={'PIX_KYOTO2': L('Kuck! Dat ass Kyoto!', 'Regarde ! C’est Kyoto !')}),
 affaire('A_VOYAGE_ESPAGNE', 'voyage',
   L('Am Juli war ech zwou Wochen a Spuenien.', 'En juillet, j’étais deux semaines en Espagne.'),
   P(L('Wou genee?', 'Où exactement ?'), L('Zu Barcelona. Et war super!', 'À Barcelone. C’était super !')),
   L('Ech war a Spuenien, wierklech!', 'J’étais en Espagne, vraiment !', 'a_verifier_lod'),
   [apiece('AMIS_COACH', 'amis', 'Coach Marc', '31 juillet 2026', 'Publication du coach de foot', '« Juillet 2026 : bravo {npc}, présent aux 9 entraînements du mois — tous les mardis et jeudis ! ⚽ »', {'type': 'post', 'image': 'foot', 'scene': 'foot', 'personnes': [MOI('Victory', 0.1, 0.4, 0)]}),
    apiece('PIX_BARCELONE', 'pix', '{npc}', '1er août 2026', 'Photo : Barcelone', 'Photo : des façades colorées et un tram jaune. Légende : « Barcelone ☀️ deux semaines de rêve ».', {'type': 'photo', 'scene': 'lisbonne', 'personnes': [MOI('Victory', -0.6, 0.4, 0.2)]})],
   vrai=False, croise=True,
   mensonge={'preuves': [['AMIS_COACH']],
     'justification': L('Ech war net a Spuenien. Ech war beim Fussball.', 'Je n’étais pas en Espagne. J’étais au foot.', 'a_verifier_lod'),
     'aveuFr': '« Barcelone, c’était mon fond d’écran… »', 'motivationFr': 'Paraître grand voyageur.',
     'explicationFr': 'Son coach le félicite d’avoir été là aux 9 entraînements de juillet, tous les mardis et jeudis : deux semaines en Espagne en juillet, c’est impossible.'},
   refusPieces={'PIX_BARCELONE': L('Kuck! Dat ass Barcelona!', 'Regarde ! C’est Barcelone !')}),
 affaire('A_SPORT_TOUSLESJOURS', 'sport',
   L('Ech ginn all Dag lafen.', 'Je vais courir tous les jours.', 'lecon'),
   P(L('Wéi laang?', 'Combien de temps ?'), L('Eng Stonn!', 'Une heure !')),
   L('Jo, all Dag!', 'Oui, tous les jours !'),
   [apiece('LUXRUN_SEPT', 'amis', '{npc}', '30 septembre 2026', 'Capture LuxRun partagée par {npc}', 'Appli LuxRun (suivi automatique par la montre) — Septembre 2026 : 2 courses, le 6 et le 20 septembre, 25 minutes chacune. Message de {npc} : « Ma montre compte tout ⌚ »',
           {'type': 'appli', 'lignes': [['dim. 6 sept.', '25 min'], ['dim. 20 sept.', '25 min'], ['Total septembre', '2 courses']]}),
    apiece('PIX_COURSE', 'pix', '{npc}', '6 septembre 2026', 'Photo : course du matin', 'Photo : un parc au petit matin. Légende : « Course du matin 🏃 ».', {'type': 'photo', 'scene': 'parc', 'personnes': [MOI('Walk', 0.1, 0.3, -0.3)]})],
   vrai=False, croise=True, incompatibles=['A_VOYAGE_JAPON'],
   mensonge={'preuves': [['LUXRUN_SEPT']],
     'justification': L('Okay… net all Dag. Zweemol am September.', 'Bon… pas tous les jours. Deux fois en septembre.', 'a_verifier_lod'),
     'aveuFr': '« Mais je pense à courir tous les jours ! »', 'motivationFr': 'Paraître sportif.',
     'explicationFr': 'Sa montre, qui compte toutes ses courses, n’en a enregistré que deux en septembre.'},
   refusPieces={'PIX_COURSE': L('Gesäis du? Ech lafen!', 'Tu vois ? Je cours !', 'a_verifier_lod')}),
 affaire('A_LOISIR_BAND', 'loisir',
   L('Ech spille Gittar an enger Band.', 'Je joue de la guitare dans un groupe.', 'a_verifier_lod'),
   P(L('Wéi heescht d’Band?', 'Comment s’appelle le groupe ?', 'a_verifier_lod'), L('The Kirchberg Cats!', 'The Kirchberg Cats !')),
   L('Ech spille wierklech Gittar!', 'Je joue vraiment de la guitare !', 'a_verifier_lod'),
   [apiece('AMIS_BAND', 'amis', 'The Kirchberg Cats', None, 'Page du groupe The Kirchberg Cats', 'The Kirchberg Cats (groupe pop, Luxembourg) · Membres : Julie (chant), Marc (guitare), Paul (basse), Lina (batterie). Prochain concert : 7 novembre.', {'type': 'profil', 'lignes': [['Julie', 'chant'], ['Marc', 'guitare'], ['Paul', 'basse'], ['Lina', 'batterie']]}),
    apiece('PIX_CONCERT', 'pix', '{npc}', '19 septembre 2026', 'Photo : concert', 'Photo : {npc} dans le public, sous les lumières. Légende : « Concert des Kirchberg Cats 🎸 trop bien ! ».', {'type': 'photo', 'scene': 'reception', 'personnes': [MOI('Victory', 0.3, 0.6, -0.2)]})],
   vrai=False,
   mensonge={'preuves': [['AMIS_BAND']], 'exigePrecision': True,
     'refusSansPrecision': L('Wéi? Wéi eng Band?', 'Quoi ? Quel groupe ?', 'a_verifier_lod'),
     'justification': L('Okay… ech si just Fan.', 'Bon… je suis juste fan.', 'a_verifier_lod'),
     'aveuFr': '« Mais je connais tous les accords… de leur chanson la plus simple. »', 'motivationFr': 'Paraître artiste.',
     'explicationFr': 'La page du groupe liste ses quatre membres : {npc} n’en fait pas partie, et c’est Marc qui joue de la guitare.'},
   refusPieces={'PIX_CONCERT': L('Kuck! Ech sinn um Concert!', 'Regarde ! Je suis au concert !', 'a_verifier_lod')}),
 affaire('A_LANGUE_DAITSCH', 'langue',
   L('Ech schwätze perfekt Däitsch.', 'Je parle parfaitement allemand.', 'a_verifier_lod'),
   P(L('Wou hues du dat geléiert?', 'Où est-ce que tu as appris ça ?', 'a_verifier_lod'), L('Zu Berlin. Dräi Joer!', 'À Berlin. Trois ans !')),
   L('Jo, perfekt!', 'Oui, parfaitement !', 'a_verifier_lod'),
   [apiece('PRO_LANGUES', 'pro', '{npc}', None, 'Profil Pro de {npc} : langues', 'Langues : français (langue maternelle), anglais (B2), allemand (A1 – débutant). Parcours : études et emplois au Luxembourg uniquement.',
           {'type': 'profil', 'lignes': [['Français', 'langue maternelle'], ['Anglais', 'B2'], ['Allemand', 'A1 – débutant']]}),
    apiece('PIX_TREVES', 'pix', '{npc}', '27 septembre 2026', 'Photo : Trèves', 'Photo : {npc} dans un train. Légende : « Week-end à Trèves 🇩🇪 ».', {'type': 'photo', 'scene': 'train', 'personnes': [MOI('Idle', 0.1, 0.2, -0.3)]})],
   vrai=False,
   mensonge={'preuves': [['PRO_LANGUES']],
     'justification': L('Okay… just e bëssen Däitsch.', 'Bon… juste un peu d’allemand.'),
     'aveuFr': '« Je sais dire « Guten Tag » avec un accent parfait. »', 'motivationFr': 'Paraître brillant.',
     'explicationFr': 'Son propre profil Pro indique « allemand : A1 – débutant » et un parcours uniquement au Luxembourg.'},
   refusPieces={'PIX_TREVES': L('Kuck! Ech war an Däitschland!', 'Regarde ! J’étais en Allemagne !')}),
 affaire('A_ANIMAL_HOND', 'animal',
   L('Ech hunn en Hond. Hien heescht Rex.', 'J’ai un chien. Il s’appelle Rex.'),
   P(L('Wou ass hien elo?', 'Il est où maintenant ?'), L('Doheem. Hie schléift.', 'À la maison. Il dort.')),
   L('De Rex ass mäin Hond!', 'Rex est mon chien !'),
   [apiece('AMIS_CLARA_REX', 'amis', 'Clara (sœur de {npc})', '20 octobre 2026', 'Publication de Clara', '« Merci à mon frère {npc} d’avoir promené MON chien Rex pendant mes vacances 🐶 Rex est rentré à la maison avec moi ! »', {'type': 'post', 'image': 'chien', 'scene': 'chien', 'personnes': []}),
    apiece('PIX_REX', 'pix', '{npc}', '10 octobre 2026', 'Photo : Rex', 'Photo : {npc} et un chien brun au parc. Légende : « Rex et moi 🐶 ».', {'type': 'photo', 'scene': 'chien', 'personnes': [MOI('Victory', -0.6, 0.2, 0.25)]})],
   vrai=False,
   mensonge={'preuves': [['AMIS_CLARA_REX']],
     'justification': L('Okay… de Rex ass dem Clara säin Hond.', 'Bon… Rex est le chien de Clara.', 'audit_regles'),
     'aveuFr': '« Mais il m’aime plus qu’elle ! »', 'motivationFr': 'Paraître responsable et attachant.',
     'explicationFr': 'Sa sœur Clara remercie {npc} d’avoir promené SON chien Rex pendant ses vacances : Rex n’est pas à lui.'},
   refusPieces={'PIX_REX': L('Kuck! Dat ass de Rex!', 'Regarde ! C’est Rex !')}),
 # ─── Vérités (avec une pièce qui les confirme, jamais une preuve contre) ──────
 affaire('V_TRAVAIL_BUREAU', 'travail',
   L('Ech schaffen an engem Büro.', 'Je travaille dans un bureau.', 'lecon'),
   P(L('Wéini schaffs du?', 'Tu travailles quand ?'), L('Vu Méindeg bis Freideg.', 'Du lundi au vendredi.')),
   L('Ech schaffen an engem Büro, wierklech!', 'Je travaille dans un bureau, vraiment !', 'a_verifier_lod'),
   [apiece('PRO_COMPTABLE', 'pro', '{npc}', None, 'Profil Pro de {npc}', '{npc} · Comptable à la Fiduciaire Moselle (Luxembourg) depuis 2021, du lundi au vendredi.', {'type': 'profil', 'lignes': [['Comptable · Fiduciaire Moselle', 'depuis 2021']]}),
    apiece('PIX_BUREAU', 'pix', '{npc}', '19 octobre 2026', 'Photo : lundi matin', 'Photo : {npc} à son bureau, devant un écran. Légende : « Lundi : café et tableaux ☕📊 ».', {'type': 'photo', 'scene': 'bureau', 'personnes': [MOI('Idle', 0.3, 0.2, -0.2)]})]),
 affaire('V_LOGEMENT_SEUL', 'logement',
   L('Ech wunnen eleng. Mäin Appartement ass kleng.', 'J’habite seul. Mon appartement est petit.'),
   P(L('Wou wunns du?', 'Tu habites où ?', 'lecon'), L('An der Stad.', 'En ville.')),
   L('Jo, eleng! Mäin Appartement ass kleng!', 'Oui, seul ! Mon appartement est petit !'),
   [apiece('PIX_APPART', 'pix', '{npc}', '2 septembre 2026', 'Photo : mon appart', 'Photo : un petit salon avec une plante. Légende : « Mon petit appart, mon petit bonheur 🌿 ».', {'type': 'photo', 'scene': 'canape', 'personnes': [MOI('Idle', 0.0, 0.4, 0)]}),
    apiece('AMIS_VOISINE', 'amis', 'Mme Weber', '14 octobre 2026', 'Publication de Mme Weber (voisine)', '« Merci à {npc}, mon gentil voisin du 3e, d’avoir arrosé mes plantes pendant mes vacances 🌱 »', {'type': 'profil', 'lignes': [['Mme Weber · voisine de {npc}', '14 octobre 2026'], ['« Merci pour mes plantes 🌱 »', '']]})]),
 affaire('V_SPORT_TENNIS', 'sport',
   L('Ech spillen Tennis.', 'Je joue au tennis.'),
   P(L('Wéini?', 'Quand ?'), L('Samschdes moies.', 'Le samedi matin.')),
   L('Ech spille wierklech Tennis!', 'Je joue vraiment au tennis !', 'a_verifier_lod'),
   [apiece('PIX_TENNIS', 'pix', '{npc}', '17 octobre 2026', 'Photo : tennis', 'Photo : {npc} au parc, raquette à la main. Légende : « Tennis du samedi matin 🎾 ».', {'type': 'photo', 'scene': 'parc', 'personnes': [MOI('Victory', 0.1, 0.3, -0.2)]}),
    apiece('AMIS_CLUB', 'amis', 'TC Belair', '12 septembre 2026', 'Publication du TC Belair', '« Bravo à {npc}, vainqueur du petit tournoi du samedi matin ! 🎾 »', {'type': 'profil', 'lignes': [['TC Belair · club de tennis', '12 septembre 2026'], ['« Bravo à {npc}, vainqueur du tournoi ! 🎾 »', '']]})]),
 affaire('V_ANIMAL_KAZ', 'animal',
   L('Ech hunn eng Kaz. Si heescht Mimi.', 'J’ai un chat. Il s’appelle Mimi.', 'audit_regles', 'Kaz est féminin : on dit « si », même pour un chat.'),
   P(L('Wou ass deng Kaz?', 'Il est où, ton chat ?'), L('Doheem. Si schléift.', 'À la maison. Il dort.')),
   L('Nee! Dat ass wierklech meng Kaz!', 'Non ! C’est vraiment mon chat !', 'a_verifier_lod'),
   [apiece('PIX_MIMI', 'pix', '{npc}', '5 octobre 2026', 'Photo : Mimi', 'Photo : un chat roux endormi sur un coussin. Légende : « Mimi, reine de la sieste ».', {'type': 'photo', 'scene': 'chat', 'personnes': []}),
    apiece('AMIS_VETO', 'amis', 'Clinique vétérinaire du Parc', '8 octobre 2026', 'Publication de la clinique vétérinaire', '« Mimi, le chat de {npc}, est venu pour son vaccin. Quel patient ! 🐱 »', {'type': 'profil', 'lignes': [['Clinique vétérinaire du Parc', '8 octobre 2026'], ['« Mimi, le chat de {npc} : vaccin fait ! 🐱 »', '']]})]),
 affaire('V_CUISINE_ZOPP', 'cuisine',
   L('Ech kache gär fir meng Frënn.', 'J’aime cuisiner pour mes amis.'),
   P(L('Wat kachs du?', 'Qu’est-ce que tu cuisines ?'), L('Gromperenzopp!', 'De la soupe de pommes de terre !', 'a_verifier_lod')),
   L('Hues du meng Zopp net gär?', 'Tu n’aimes pas ma soupe ?', 'a_verifier_lod'),
   [apiece('AMIS_ZOPP', 'amis', 'Léa M.', '26 septembre 2026', 'Publication de Léa', '« Merci {npc} pour la soupe de pommes de terre de samedi ! 🥔 »', {'type': 'post', 'image': 'soupe', 'scene': 'soupe', 'personnes': []}),
    apiece('PIX_ZOPP', 'pix', '{npc}', '26 septembre 2026', 'Photo : ma soupe', 'Photo : {npc} derrière une grande marmite. Légende : « Soupe de pommes de terre pour les copains 🥔 ».', {'type': 'photo', 'scene': 'soupe', 'personnes': [MOI('Idle', -0.9, -0.6, 0.3)]})]),
 affaire('V_LOISIR_LIESEN', 'loisir',
   L('Ech liese gär. Ech hu vill Bicher.', 'J’aime lire. J’ai beaucoup de livres.'),
   P(L('Wéi vill Bicher?', 'Combien de livres ?', 'lecon_modele'), L('Honnert!', 'Cent !', 'a_verifier_lod')),
   L('Jo! Ech liese wierklech gär!', 'Oui ! J’aime vraiment lire !', 'a_verifier_lod'),
   [apiece('PIX_LIVRES', 'pix', '{npc}', '11 octobre 2026', 'Photo : mes livres', 'Photo : une pile de livres sur une table. Légende : « La pile de la semaine 📚 ».', {'type': 'photo', 'scene': 'carnet', 'personnes': []}),
    apiece('AMIS_LECTURE', 'amis', 'Club de lecture de Bonnevoie', '8 octobre 2026', 'Publication du club de lecture', '« Merci à {npc}, qui nous a présenté son livre du mois ! 📚 »', {'type': 'profil', 'lignes': [['Club de lecture · Bonnevoie', '8 octobre 2026'], ['« Merci à {npc} pour le livre du mois ! 📚 »', '']]})]),
 affaire('V_LANGUE_ENGLESCH', 'langue',
   L('Ech schwätzen Englesch a Franséisch.', 'Je parle anglais et français.', 'lecon'),
   P(L('An Däitsch?', 'Et allemand ?', 'a_verifier_lod'), L('Nee, just e bëssen.', 'Non, juste un peu.')),
   L('Jo, Englesch a Franséisch!', 'Oui, anglais et français !'),
   [apiece('PRO_LANGUES2', 'pro', '{npc}', None, 'Profil Pro de {npc} : langues', 'Langues : français (langue maternelle), anglais (C1), allemand (A2).', {'type': 'profil', 'lignes': [['Français', 'langue maternelle'], ['Anglais', 'C1'], ['Allemand', 'A2']]}),
    apiece('AMIS_SARAH', 'amis', 'Sarah K.', '15 octobre 2026', 'Publication de Sarah', '« Thanks {npc} ! Merci pour la traduction en anglais de mon CV 🇬🇧 »', {'type': 'profil', 'lignes': [['Sarah K. · amie de {npc}', '15 octobre 2026'], ['« Merci pour la traduction de mon CV 🇬🇧 »', '']]})]),
 affaire('V_FAMILLE_CLARA', 'famille',
   L('Ech hunn eng Schwëster. Si heescht Clara.', 'J’ai une sœur. Elle s’appelle Clara.'),
   P(L('Wou wunnt si?', 'Elle habite où ?'), L('Zu Esch.', 'À Esch.')),
   L('Jo, ech hunn eng Schwëster!', 'Oui, j’ai une sœur !'),
   [apiece('AMIS_CLARA', 'amis', 'Clara', None, 'Profil de Clara', 'Clara · sœur de {npc} · Esch-sur-Alzette.', {'type': 'profil', 'lignes': [['Sœur de {npc}', ''], ['Esch-sur-Alzette', '']]}),
    apiece('PIX_CLARA', 'pix', '{npc}', '4 octobre 2026', 'Photo : dimanche à Esch', 'Photo : {npc} dans un parc. Légende : « Dimanche à Esch avec ma sœur Clara ❤️ ».', {'type': 'photo', 'scene': 'parc', 'personnes': [MOI('Idle', -0.3, 0.3, 0.2)]})]),
]
# Pièces communes à deux affaires : interdites (une pièce n'appartient qu'à une affaire).
# Dossiers rédigés (§4.2 « commencer par quelques dossiers rédigés ») : combinaisons choisies et
# relues ; le générateur prend ensuite le relais avec des combinaisons validées.
dossiers_rediges = [
 {'id': 'NOAH_001', 'numero': '002', 'npc': 'noah', 'affaires': ['A_TRAVAIL_DOKTER', 'V_FAMILLE_CLARA', 'A_LOISIR_BAND', 'V_CUISINE_ZOPP', 'A_ANIMAL_HOND', 'V_LANGUE_ENGLESCH']},
 {'id': 'TOM_001', 'numero': '003', 'npc': 'tom', 'affaires': ['A_TRAVAIL_CONTRAT', 'V_SPORT_TENNIS', 'A_VOYAGE_ESPAGNE', 'V_LOGEMENT_SEUL', 'A_LANGUE_DAITSCH', 'V_LOISIR_LIESEN']},
]
generateur = {
 'npcs': ['leo', 'hugo', 'sam', 'jules', 'enzo', 'nico'],
 'mensonges': [3, 3], 'verites': [3, 3],
 # Règles d'équilibre (SPEC 110 §2.2) : au moins un mensonge qui exige une précision,
 # au moins un mensonge démontré par recoupement de dates.
 'auMoinsUnePrecision': True, 'auMoinsUnCroise': True,
 'dateFr': 'samedi 24 octobre 2026', 'lieuFr': 'au café',
 'fin': {'complet': L('Okay… Du hues gewonnen.', 'Bon… Tu as gagné.', 'a_verifier_lod'),
         'partiel': L('Gesäis du? Ech hunn net gelunn!', 'Tu vois ? Je n’ai pas menti !', 'a_verifier_lod')}
}

contenus = {
 'schemaVersion': 1, 'contentVersion': 'demasque-v1',
 'status': 'demo_textes_lu_en_relecture',
 'source': 'SPEC 110 §3 + docs/LUX-DEMASQUE-DOSSIER-MILO.md (matrice D0), rédaction LU Claude 27/10/2026',
 'reviewLegend': {
   'lecon': 'Phrase présente telle quelle dans les leçons ou examens (vérifié automatiquement par le générateur et les tests).',
   'lecon_modele': 'Même structure qu’une phrase de leçon, seul un nom, un nombre ou un lieu change.',
   'audit_regles': 'Vérifiée par Claude : conjugaison, règle du n, prépositions, accords (leçons). Relecture native à faire.',
   'a_verifier_lod': 'Mot ou tournure absent des leçons : à confirmer sur LOD.lu et par un locuteur.'},
 'publiables': ['lecon', 'lecon_modele', 'audit_regles', 'a_verifier_lod'],
 'personnages': personnages, 'figurants': figurants, 'pieces': pieces, 'dossiers': dossiers,
 'affaires': affaires, 'dossiersRediges': dossiers_rediges, 'generateur': generateur,
}

# Contrôle : une phrase marquée « lecon » doit être littéralement dans les leçons/examens.
corpus = []
def walk(x):
    if isinstance(x, str): corpus.append(x)
    elif isinstance(x, list): [walk(i) for i in x]
    elif isinstance(x, dict): [walk(v) for v in x.values()]
for f in glob.glob(RACINE + '/data/lecons/**/*.json', recursive=True) + glob.glob(RACINE + '/data/examens/**/*.json', recursive=True): walk(json.load(open(f)))
norm = lambda t: re.sub(r'\s+', ' ', re.sub(r'[!?.,:;«»"]', ' ', t.lower())).strip()
texte = ' | '.join(norm(c) for c in corpus)
def literal(lu): return all(norm(ph) in texte for ph in re.split(r'(?<=[.!?])\s+', lu) if norm(ph))
def verifier(x):
    if isinstance(x, dict):
        if 'lu' in x and x.get('review') == 'lecon' and not literal(x['lu']): raise SystemExit('« lecon » introuvable dans les leçons : ' + x['lu'])
        if 'lu' in x and x.get('review') != 'lecon' and literal(x['lu']): x['review'] = 'lecon'  # promotion automatique
        for v in x.values(): verifier(v)
    elif isinstance(x, list): [verifier(v) for v in x]
verifier(contenus)
json.dump(contenus, open(RACINE + '/data/jeux/lux-demasque/contenus-v01.json', 'w'), ensure_ascii=False, indent=1)
print('ok', len(dossiers), 'dossier(s)', len(pieces), 'pièces')
