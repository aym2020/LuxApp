"""Leçon 3 — Objete beschreiwen (les couleurs) : migration v1 → v2.
Fil : aux objets trouvés, décrire son sac et son stylo."""
from fabrique import Lecon

L = Lecon('A1.1/lecon-03.json')
TR = 'CHOISIS LA TRADUCTION'

L.instructions = {
    'flashcards': "Mot caché : retrouve la couleur ou le mot luxembourgeois à partir du français.",
    'quiz': "Lis la couleur ou la phrase luxembourgeoise et choisis la bonne traduction française.",
    'trous': "Complète avec la bonne couleur, avec a / an pour relier deux couleurs, ou avec net pour dire non.",
    'ecriture': "Écris en luxembourgeois les phrases de la mission : demander et dire la couleur d'un objet, relier deux couleurs, dire qu'un objet n'est pas d'une couleur."
}

L.fil("Aux objets trouvés",
      "Tu as oublié ton sac et ton stylo dans le bus. Au bureau des objets trouvés, l'employée te demande de les décrire.",
      "demander et dire la couleur d'un objet, relier deux couleurs, dire qu'un objet n'est pas d'une couleur.")

L.replique(1, "L'employée", "Moien! Wat fir eng Faarf huet d'Mapp?", "Bonjour ! De quelle couleur est le sac ?")
L.replique(1, 'toi', "D'Mapp ass schwaarz.", "Le sac est noir.",
           "<b>D'</b>Mapp (féminin) + <b>ass</b> + la couleur, sans accord.")
L.replique(2, "L'employée", "Ass d'Mapp schwaarz a brong?", "Le sac est-il noir et marron ?")
L.replique(2, 'toi', "Jo, d'Mapp ass schwaarz a brong.", "Oui, le sac est noir et marron.",
           "Et = <b>an</b>, mais <b>a</b> devant b : schwaarz <b>a</b> brong.")
L.replique(3, "L'employée", "An de Stëft? Ass de Stëft rout?", "Et le stylo ? Le stylo est-il rouge ?")
L.replique(3, 'toi', "Nee, en ass net rout. En ass blo.", "Non, il n'est pas rouge. Il est bleu.",
           "Une couleur se nie avec <b>net</b> · de Stëft (masculin) → <b>en</b>.")
L.replique(3, "L'employée", "Hei ass de Stëft!", "Voici le stylo !")

# ═══ UNITÉ 1 : DIRE LA COULEUR ══════════════════════════════════════════════
L.unite(1, "Dire la couleur",
        "Objet + <b>ass</b> + couleur : <b>D'Mapp ass schwaarz.</b> · La couleur ne s'accorde jamais.",
        "De Bus ass gréng. · D'Dier ass wäiss. · Den Auto ass rout.",
        ["L'article défini : <b>de</b> (masculin), <b>den</b> devant voyelle et n, d, t, z, h, <b>d'</b> (féminin et neutre).",
         "Demander : <b>Wat fir eng Faarf huet</b> de Bus? = De quelle couleur est le bus ?"],
        phrase=["Wat fir eng Faarf huet d'Mapp? – D'Mapp ass schwaarz.", "De quelle couleur est le sac ? – Le sac est noir."],
        phrases=[["De Bus ass gréng.", "Le bus est vert."], ["Den Auto ass rout.", "La voiture est rouge."]])

N_INVAR = "La couleur ne change pas : de Bus, d'Dier, d'Buch ass <b>wäiss</b>."
N_ART = "Article défini : <b>de</b> (m.), <b>den</b> (m. devant voyelle, n, d, t, z, h), <b>d'</b> (f. et n.)."
L.carte(1, "noir", "schwaarz", "Contraire : wäiss")
L.carte(1, "blanc", "wäiss", "Contraire : schwaarz")
L.carte(1, "rouge", "rout")
L.carte(1, "jaune", "giel")
L.carte(1, "bleu", "blo")
L.carte(1, "vert", "gréng")
L.carte(1, "la couleur", "Faarf", "Pluriel : Faarwen", article="d'")
L.carte(1, "De quelle couleur … ?", "Wat fir eng Faarf", "Wat fir eng Faarf huet de Bus?")

L.quiz(1, "schwaarz", "noir", ["blanc", "gris", "marron"], TR)
L.quiz(1, "wäiss", "blanc", ["noir", "beige", "gris"], TR)
L.quiz(1, "rout", "rouge", ["orange", "rose", "violet"], TR)
L.quiz(1, "giel", "jaune", ["orange", "beige", "blanc"], TR)
L.quiz(1, "blo", "bleu", ["vert", "violet", "gris"], TR)
L.quiz(1, "gréng", "vert", ["bleu", "jaune", "marron"], TR)
L.quiz(1, "Wat fir eng Faarf huet de Bus?", "De quelle couleur est le bus ?", ["Où est le bus ?", "Est-ce que le bus est vert ?", "Le bus est vert."], TR)
L.quiz(1, "D'Mapp ass schwaarz.", "Le sac est noir.", ["Le sac est blanc.", "Le sac n'est pas noir.", "Est-ce que le sac est noir ?"], TR)

L.trou(1, "La voiture est rouge.", "Den Auto ass", "rout", ".", ["rout", "blo", "gréng", "giel"], "rout = rouge · den Auto (masculin, devant voyelle)")
L.trou(1, "La porte est blanche.", "D'Dier ass", "wäiss", ".", ["wäiss", "giel", "blo", "schwaarz"], "wäiss = blanc · d'Dier (féminin)")
L.trou(1, "Le livre est noir.", "D'Buch ass", "schwaarz", ".", ["schwaarz", "wäiss", "rout", "gréng"], "schwaarz = noir · d'Buch (neutre)")
L.trou(1, "Le tableau est bleu.", "D'Bild ass", "blo", ".", ["blo", "gréng", "giel", "rout"], "blo = bleu")
L.trou(1, "La tasse est jaune.", "D'Taass ass", "giel", ".", ["giel", "wäiss", "rout", "blo"], "giel = jaune")
L.trou(1, "La feuille est verte.", "D'Blat ass", "gréng", ".", ["gréng", "giel", "blo", "rout"], "gréng = vert", attention=N_INVAR)
L.trou(1, "La voiture est rouge.", "", "Den", "Auto ass rout.", ["Den", "De", "D'"], "den devant une voyelle (Auto)", attention=N_ART)
L.trou(1, "De quelle couleur est le bus ?", "Wat fir eng", "Faarf", "huet de Bus?", ["Faarf", "Bus", "gréng", "ass"], "Wat fir eng Faarf = de quelle couleur")

L.ecrit(1, "La couleur", "D'Faarf")
L.ecrit(1, "De quelle couleur est le bus ?", "Wat fir eng Faarf huet de Bus?")
L.ecrit(1, "Le sac est noir.", "D'Mapp ass schwaarz.")
L.ecrit(1, "La porte est blanche.", "D'Dier ass wäiss.", attention=N_INVAR)
L.ecrit(1, "La voiture est rouge.", "Den Auto ass rout.", attention=N_ART)
L.ecrit(1, "Le livre est bleu.", "D'Buch ass blo.")
L.ecrit(1, "La lampe est jaune.", "D'Luucht ass giel.")
L.ecrit(1, "La fenêtre est verte.", "D'Fënster ass gréng.")

# ═══ UNITÉ 2 : POSER LA QUESTION, RELIER DEUX COULEURS ═════════════════════
L.unite(2, "Poser la question, relier deux couleurs",
        "Question : le verbe en premier, <b>Ass</b> d'Mapp schwaarz? · Oui : <b>Jo</b>, … · Et : <b>an</b>, ou <b>a</b> devant la plupart des consonnes",
        "Ass de Bus gréng? – Jo, de Bus ass gréng. · schwaarz <b>a</b> brong · brong <b>an</b> orange",
        ["<b>an</b> devient <b>a</b> devant la plupart des consonnes : schwaarz <b>a</b> wäiss (comme e / en, leçon 2).",
         "Question oui / non : <b>Ass</b> vient en premier, sans mot interrogatif."],
        phrase=["Ass d'Mapp schwaarz a brong? – Jo, d'Mapp ass schwaarz a brong.", "Le sac est-il noir et marron ? – Oui, le sac est noir et marron."],
        phrases=[["Ass de Bus gréng?", "Est-ce que le bus est vert ?"], ["Den Dësch ass brong a wäiss.", "La table est marron et blanche."]])

N_A = "Et = <b>an</b>, mais <b>a</b> devant la plupart des consonnes : schwaarz <b>a</b> brong. On garde <b>an</b> devant une voyelle et n, d, t, z, h."
L.carte(2, "gris", "gro")
L.carte(2, "marron", "brong")
L.carte(2, "mauve, violet", "mof")
L.carte(2, "rose", "rosa")
L.carte(2, "oui", "Jo")
L.carte(2, "et", "an", "a devant la plupart des consonnes : schwaarz a brong", attention=N_A)
L.carte(2, "orange", "orange", "Même mot", plus=True)
L.carte(2, "beige", "beige", "Même mot", plus=True)

L.quiz(2, "gro", "gris", ["noir", "blanc", "beige"], TR)
L.quiz(2, "brong", "marron", ["orange", "beige", "gris"], TR)
L.quiz(2, "mof", "mauve, violet", ["rose", "bleu", "gris"], TR)
L.quiz(2, "rosa", "rose", ["rouge", "mauve, violet", "orange"], TR)
L.quiz(2, "Ass de Bus gréng?", "Est-ce que le bus est vert ?", ["Le bus est vert.", "De quelle couleur est le bus ?", "Le bus n'est pas vert."], TR)
L.quiz(2, "Jo, de Bus ass gréng.", "Oui, le bus est vert.", ["Non, le bus est vert.", "Est-ce que le bus est vert ?", "Non, le bus n'est pas vert."], TR)
L.quiz(2, "schwaarz a wäiss", "noir et blanc", ["noir ou blanc", "noir, pas blanc", "gris et blanc"], TR, attention=N_A)
L.quiz(2, "orange", "orange", ["rouge", "jaune", "marron"], TR, plus=True)
L.quiz(2, "beige", "beige", ["marron", "blanc", "gris"], TR, plus=True)

L.trou(2, "La fenêtre est grise.", "D'Fënster ass", "gro", ".", ["gro", "brong", "schwaarz", "wäiss"], "gro = gris")
L.trou(2, "La maison est marron.", "D'Haus ass", "brong", ".", ["brong", "gro", "schwaarz", "gréng"], "brong = marron")
L.trou(2, "La montre est mauve.", "D'Auer ass", "mof", ".", ["mof", "rosa", "blo", "giel"], "mof = mauve, violet")
L.trou(2, "La lampe est rose.", "D'Luucht ass", "rosa", ".", ["rosa", "rout", "wäiss", "gro"], "rosa = rose")
L.trou(2, "Est-ce que le bus est vert ?", "", "Ass", "de Bus gréng?", ["Ass", "Wat", "Jo", "Net"], "Question oui / non : Ass en premier")
L.trou(2, "Oui, le bus est vert.", "", "Jo", "de Bus ass gréng.", ["Jo", "Nee", "Ass", "An"], "Jo = oui")
L.trou(2, "Le sac est noir et marron.", "D'Mapp ass schwaarz", "a", "brong.", ["a", "an", "ass"], "a devant b", attention=N_A)
L.trou(2, "La table est marron et orange.", "Den Dësch ass brong", "an", "orange.", ["an", "a", "ass"], "an devant une voyelle", attention=N_A)
L.trou(2, "La tasse est beige.", "D'Taass ass", "beige", ".", ["beige", "brong", "wäiss", "gro"], "beige = beige", plus=True)

L.ecrit(2, "Est-ce que le bus est rose ?", "Ass de Bus rosa?")
L.ecrit(2, "Oui, le bus est vert.", "Jo, de Bus ass gréng.")
L.ecrit(2, "Le sac est-il noir et marron ?", "Ass d'Mapp schwaarz a brong?", attention=N_A)
L.ecrit(2, "Oui, le sac est noir et marron.", "Jo, d'Mapp ass schwaarz a brong.", attention=N_A)
L.ecrit(2, "La table est grise.", "Den Dësch ass gro.")
L.ecrit(2, "La chaise est marron.", "De Stull ass brong.")
L.ecrit(2, "La table est marron et blanche.", "Den Dësch ass brong a wäiss.", attention=N_A)
L.ecrit(2, "La bouteille est rose.", "D'Fläsch ass rosa.")
L.ecrit(2, "Le tableau est mauve.", "D'Bild ass mof.", plus=True)
L.ecrit(2, "La tasse est beige.", "D'Taass ass beige.", plus=True)
L.ecrit(2, "Le bus est orange.", "De Bus ass orange.", plus=True)

# ═══ UNITÉ 3 : DIRE NON, REMPLACER L'OBJET ══════════════════════════════════
L.unite(3, "Dire non, remplacer l'objet",
        "Une couleur se nie avec <b>net</b> : De Bus ass <b>net</b> rosa. · Il / elle : <b>en</b> (m.), <b>si</b> (f.), <b>et</b> (n.)",
        "Nee, de Stëft ass net rout. · En ass blo. · D'Fënster ass brong. → Si ass brong.",
        ["Couleur = adjectif → <b>net</b>, jamais kee / keng (qui nient un nom, leçon 2).",
         "Le pronom suit le genre luxembourgeois : de Stëft → <b>en</b>, d'Mapp → <b>si</b>, d'Buch → <b>et</b>."],
        phrase=["Nee, en ass net rout. En ass blo.", "Non, il n'est pas rouge. Il est bleu."],
        phrases=[["De Bus ass net rosa.", "Le bus n'est pas rose."], ["D'Blat ass wäiss. → Et ass wäiss.", "La feuille est blanche. → Elle est blanche."]])

N_NET = "Une couleur se nie avec <b>net</b> : ass <b>net</b> rosa (pas kee / keng)."
N_PRON = "Pronom selon le genre : <b>en</b> (m.), <b>si</b> (f.), <b>et</b> (n.)."
L.carte(3, "non", "Nee")
L.carte(3, "ne … pas (devant une couleur)", "net", "De Bus ass net rosa.", attention=N_NET)
L.carte(3, "il (masculin)", "en", "de Stëft → en ass blo", attention=N_PRON)
L.carte(3, "elle (féminin)", "si", "d'Mapp → si ass schwaarz", attention=N_PRON)
L.carte(3, "il, elle (neutre)", "et", "d'Buch → et ass rout", attention=N_PRON)
L.carte(3, "le stylo", "Stëft", "Masculin · pronom : en", article="de")

L.quiz(3, "Nee, de Bus ass net rosa.", "Non, le bus n'est pas rose.", ["Oui, le bus est rose.", "Non, le bus est rose.", "Le bus est-il rose ?"], TR, attention=N_NET)
L.quiz(3, "En ass blo.", "Il est bleu.", ["Elle est bleue.", "Il n'est pas bleu.", "Est-il bleu ?"], TR, attention=N_PRON)
L.quiz(3, "Si ass wäiss.", "Elle est blanche.", ["Il est blanc.", "Elle n'est pas blanche.", "Est-elle blanche ?"], TR, attention=N_PRON)
L.quiz(3, "D'Buch ass gro. Et ass gro.", "Le livre est gris. Il est gris.", ["Le livre est gris. Elle est grise.", "Le livre n'est pas gris.", "Le livre est-il gris ?"], TR, attention=N_PRON)
L.quiz(3, "Den Dësch ass net giel.", "La table n'est pas jaune.", ["La table est jaune.", "La table est-elle jaune ?", "La chaise n'est pas jaune."], TR)
L.quiz(3, "Nee, en ass net rout. En ass blo.", "Non, il n'est pas rouge. Il est bleu.", ["Oui, il est rouge. Il est bleu.", "Non, elle n'est pas rouge. Elle est bleue.", "Il est rouge et bleu."], TR)

L.trou(3, "Non, le bus n'est pas rose.", "Nee, de Bus ass", "net", "rosa.", ["net", "keng", "kee", "ass"], "net devant une couleur (≠ kee / keng devant un nom)", attention=N_NET)
L.trou(3, "La porte n'est pas noire.", "D'Dier ass", "net", "schwaarz.", ["net", "keng", "Nee", "a"], "net = ne … pas", attention=N_NET)
L.trou(3, "Non, le stylo n'est pas rouge.", "", "Nee", "de Stëft ass net rout.", ["Nee", "Jo", "Net", "Ass"], "Nee = non")
L.trou(3, "Le stylo est bleu. Il est bleu.", "De Stëft ass blo.", "En", "ass blo.", ["En", "Si", "Et"], "de Stëft (m.) → en", attention=N_PRON)
L.trou(3, "La fenêtre est marron. Elle est marron.", "D'Fënster ass brong.", "Si", "ass brong.", ["Si", "En", "Et"], "d'Fënster (f.) → si", attention=N_PRON)
L.trou(3, "La feuille est blanche. Elle est blanche.", "D'Blat ass wäiss.", "Et", "ass wäiss.", ["Et", "Si", "En"], "d'Blat (n.) → et", attention=N_PRON)
L.trou(3, "Le sac n'est pas bleu, il est noir.", "D'Mapp ass net blo,", "si", "ass schwaarz.", ["si", "en", "et"], "d'Mapp (f.) → si", attention=N_PRON)

L.ecrit(3, "Non, le bus n'est pas rose.", "Nee, de Bus ass net rosa.", attention=N_NET)
L.ecrit(3, "Le stylo n'est pas bleu, il est noir.", "De Stëft ass net blo, en ass schwaarz.", attention=N_PRON)
L.ecrit(3, "Non, il n'est pas rouge. Il est bleu.", "Nee, en ass net rout. En ass blo.")
L.ecrit(3, "La fenêtre est marron. Elle est marron.", "D'Fënster ass brong. Si ass brong.", attention=N_PRON)
L.ecrit(3, "La feuille est blanche. Elle est blanche.", "D'Blat ass wäiss. Et ass wäiss.", attention=N_PRON)
L.ecrit(3, "Le cahier n'est pas rouge.", "D'Heft ass net rout.", attention=N_NET)

# ═══ COURS ══════════════════════════════════════════════════════════════════
L.bloc({'type': 'texte', 'contenu': "Pour décrire un objet : <b>article + nom + ass + couleur</b>. Exemple : <b>De Bus ass gréng.</b> "
        "(Le bus est vert.) La couleur est <b>invariable</b> : elle ne change jamais selon le genre."})
L.bloc({'type': 'vocab', 'titre': "Les couleurs (d'Faarwen)", 'items': [["schwaarz", "noir"], ["wäiss", "blanc"], ["rout", "rouge"],
        ["giel", "jaune"], ["blo", "bleu"], ["gréng", "vert"]]}, 1)
L.bloc({'type': 'tableau', 'titre': "L'article défini", 'entetes': ["Genre", "Article", "Exemple"],
        'lignes': [["Masculin", "de", "de Bus, de Stëft"], ["Masculin devant voyelle, n, d, t, z, h", "den", "den Auto, den Dësch"],
                   ["Féminin", "d'", "d'Mapp, d'Dier"], ["Neutre", "d'", "d'Buch, d'Blat"]]}, 1)
L.bloc({'type': 'callout', 'variant': 'retenir', 'titre': "Demander et dire la couleur",
        'lignes': ["<b>Wat fir eng Faarf huet</b> d'Mapp? = De quelle couleur est le sac ?",
                   "<b>D'Mapp ass schwaarz.</b> = Le sac est noir."]}, 1)
L.bloc({'type': 'vocab', 'titre': "Encore des couleurs", 'items': [["gro", "gris"], ["brong", "marron"], ["mof", "mauve, violet"], ["rosa", "rose"]]}, 2)
L.bloc({'type': 'vocab', 'titre': "Les mêmes qu'en français", 'items': [["orange", "orange"], ["beige", "beige"]]}, 2, plus=True)
L.bloc({'type': 'tableau', 'titre': "Question oui / non", 'entetes': ["Type", "Luxembourgeois", "Français"],
        'lignes': [["Question", "Ass de Bus gréng?", "Est-ce que le bus est vert ?"], ["Oui", "Jo, de Bus ass gréng.", "Oui, le bus est vert."]]}, 2)
L.bloc({'type': 'callout', 'variant': 'astuce', 'titre': "Relier deux couleurs : an ou a ?",
        'lignes': ["<b>an</b> = et. Le n tombe devant la plupart des consonnes : schwaarz <b>a</b> brong, brong <b>a</b> wäiss.",
                   "On garde <b>an</b> devant une voyelle et n, d, t, z, h : brong <b>an</b> orange. Même règle que e / en (leçon 2)."]}, 2)
L.bloc({'type': 'callout', 'variant': 'attention', 'titre': "Nier une couleur : net (jamais kee / keng)",
        'lignes': ["Une couleur est un <b>adjectif</b> : on la nie avec <b>net</b>.", "<b>De Bus ass net rosa.</b> — et non « kee / keng ».",
                   "<b>Nee</b> = non · <b>kee / keen / keng</b> nient un <b>nom</b> (leçon 2)."]}, 3)
L.bloc({'type': 'tableau', 'titre': "Remplacer l'objet par un pronom", 'entetes': ["Genre", "Pronom", "Exemple"],
        'lignes': [["Masculin", "en", "De Stëft ass blo. → En ass blo."], ["Féminin", "si", "D'Fënster ass brong. → Si ass brong."],
                   ["Neutre", "et", "D'Blat ass wäiss. → Et ass wäiss."]]}, 3)
L.bloc({'type': 'vocab', 'titre': "Dire non", 'items': [["Nee", "non"], ["net", "ne … pas"], ["de Stëft", "le stylo"],
        ["Nee, en ass net rout. En ass blo.", "Non, il n'est pas rouge. Il est bleu."]]}, 3)
L.bloc({'type': 'dialogue', 'titre': "Aux objets trouvés", 'echanges': [[x['lu'], x['fr']] for x in L.scene]}, 0)

L.ecrire()
