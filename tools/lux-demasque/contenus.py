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
  'modele3d': 'Casual_Male', 'couleurs': {'haut': '#3a6fb0', 'bas': '#2b2b38'},
  'accrocheFr': 'Voyageur, chef d’équipe, amoureux des chats. Cherche quelqu’un qui aime les belles histoires.',
  'salut': L('Moien! Ech sinn de Milo.', 'Salut ! Moi, c’est Milo.', 'lecon_modele'),
  'reseaux': {
   'pix': {'pseudo': '@milo.explore', 'bioFr': 'Voyages · chat · pesto', 'pieces': ['PIX_KYOTO', 'PIX_CANAPE', 'PIX_PIXEL']},
   'pro': {'pseudo': 'Milo R.', 'bioFr': 'Tourisme · voyages · gestion d’équipe', 'pieces': ['PRO_PROFIL', 'PRO_EQUIPE']},
   'amis': {'pseudo': 'Milo', 'bioFr': 'Bonnevoie ❤️', 'pieces': ['AMIS_SAMI', 'LUXRUN_AOUT', 'AMIS_LEA']}
  }
 }
}

# ─── Pièces (FR) : source, date, transcription complète, visuel décrit ─────────
def piece(id, source, auteur, dateFr, titre, transcription, visuel):
    return {'id': id, 'source': source, 'auteur': auteur, 'dateFr': dateFr, 'titre': titre, 'transcription': transcription, 'visuel': visuel}
pieces = [
 piece('PRO_PROFIL', 'pro', 'Milo R.', None, 'Profil Pro de Milo',
       'Milo R., 30 ans · Tourisme · voyages · gestion d’équipe. Expérience : chef d’équipe chez Horizon Voyages (Luxembourg), mars 2021 – juin 2026. Formation : BTS Tourisme, 2017.',
       {'type': 'profil', 'lignes': [['Chef d’équipe · Horizon Voyages', 'mars 2021 – juin 2026'], ['BTS Tourisme', '2017']]}),
 piece('PRO_EQUIPE', 'pro', 'Milo R.', '14 avril 2026', 'Publication : mon équipe',
       '« Fier de mon équipe chez Horizon Voyages ! 🧳 Cinq ans déjà. »',
       {'type': 'post', 'image': 'equipe'}),
 piece('AMIS_SAMI', 'amis', 'Sami K.', None, 'Profil de Sami (ami de Milo)',
       'Sami K. · Graphiste · Coloc à Bonnevoie avec Milo (et Pixel 🐈).',
       {'type': 'profil', 'lignes': [['Graphiste', ''], ['Coloc à Bonnevoie avec Milo (et Pixel 🐈)', '']]}),
 piece('PIX_CANAPE', 'pix', 'Milo', '4 octobre 2026', 'Photo : soirée match',
       'Photo : deux amis sur un canapé devant un match. Légende : « Sami est passé voir le match 📺 ».',
       {'type': 'photo', 'scene': 'canape'}),
 piece('LUXRUN_AOUT', 'amis', 'Milo', '31 août 2026', 'Capture LuxRun partagée par Milo',
       'Appli LuxRun — Août 2026 : 5 courses, les dimanches 2, 9, 16, 23 et 30 août, Parc de Bonnevoie, 10 minutes chacune. Message de Milo : « Régulier ! 💪 »',
       {'type': 'appli', 'lignes': [['dim. 2 août', 'Parc de Bonnevoie · 10 min'], ['dim. 9 août', 'Parc de Bonnevoie · 10 min'], ['dim. 16 août', 'Parc de Bonnevoie · 10 min'], ['dim. 23 août', 'Parc de Bonnevoie · 10 min'], ['dim. 30 août', 'Parc de Bonnevoie · 10 min']]}),
 piece('PIX_KYOTO', 'pix', 'Milo', '31 août 2026', 'Photo : Kyoto',
       'Photo : un temple et des lanternes rouges. Légende : « Kyoto ✨ 3 semaines inoubliables ».',
       {'type': 'photo', 'scene': 'kyoto'}),
 piece('AMIS_LEA', 'amis', 'Léa M.', '12 septembre 2026', 'Publication de Léa : le pesto',
       '« Merci Milo pour le pesto de samedi ! 🍝 »',
       {'type': 'post', 'image': 'pesto'}),
 piece('PIX_PIXEL', 'pix', 'Milo', '2 octobre 2026', 'Photo : Pixel',
       'Photo : un chat roux endormi. Légende : « Pixel, champion de sieste ».',
       {'type': 'photo', 'scene': 'chat'}),
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
                'explicationFr': 'LuxRun le place au Parc de Bonnevoie tous les dimanches d’août : trois semaines au Japon en août, c’est impossible.'},
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
 'personnages': personnages, 'pieces': pieces, 'dossiers': dossiers,
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
