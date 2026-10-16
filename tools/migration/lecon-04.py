"""Leçon 4 — De Konträr (les contraires) : migration v1 → v2.
Fil : à la brocante, la vendeuse vante un vieux vélo, tu réponds par le contraire."""
from fabrique import Lecon

L = Lecon('A1.1/lecon-04.json')
CO = 'CHOISIS LE CONTRAIRE'

L.instructions = {
    'flashcards': "Mot caché : retrouve l'adjectif luxembourgeois à partir du français.",
    'quiz': "Lis l'adjectif luxembourgeois et choisis son contraire en luxembourgeois.",
    'trous': "Complète la phrase avec l'adjectif luxembourgeois qui correspond au sens.",
    'ecriture': "Écris en luxembourgeois les adjectifs et les phrases de la mission : décrire un objet et répondre par le contraire."
}

L.fil("À la brocante",
      "Tu cherches un vélo à la brocante. La vendeuse vante un vieux vélo : à chaque qualité, tu réponds par le contraire.",
      "décrire un objet avec un adjectif et répondre par son contraire.")

L.replique(1, "La vendeuse", "Moien! De Vëlo ass nei!", "Bonjour ! Le vélo est neuf !")
L.replique(1, 'toi', "De Vëlo ass net nei. En ass al.", "Le vélo n'est pas neuf. Il est vieux.",
           "nei ↔ <b>al</b> · un adjectif se nie avec <b>net</b> (leçon 3).")
L.replique(2, "La vendeuse", "Jo, mee en ass séier a liicht!", "Oui, mais il est rapide et léger !")
L.replique(2, 'toi', "Nee, en ass lues a schwéier!", "Non, il est lent et lourd !",
           "séier ↔ <b>lues</b> · liicht ↔ <b>schwéier</b> · et = <b>a</b> devant s.")
L.replique(3, "La vendeuse", "Mee en ass bëlleg!", "Mais il n'est pas cher !")
L.replique(3, 'toi', "Nee, en ass deier. An en ass futti!", "Non, il est cher. Et il est cassé !",
           "bëlleg ↔ <b>deier</b> · cassé = <b>futti</b>.")

N_NET = "Un adjectif se nie avec <b>net</b> : ass <b>net</b> nei."
N_INVAR = "L'adjectif après <b>ass</b> ne change jamais : de Bus, d'Dier, d'Buch ass <b>al</b>."

# ═══ UNITÉ 1 : NOUVEAU, VIEUX, GRAND, PETIT ═════════════════════════════════
L.unite(1, "Neuf ou vieux, grand ou petit",
        "Objet + <b>ass</b> + adjectif, sans accord : De Vëlo ass <b>al</b>. · Contraires : nei ↔ al · grouss ↔ kleng · héich ↔ niddereg",
        "Den Handy ass nei. · Den Telefon ass al. · D'Maus ass kleng.",
        ["L'adjectif après <b>ass</b> reste <b>invariable</b> : d'Maus ass <b>kleng</b> (pas de « -e »).",
         "Dire non : <b>net</b> devant l'adjectif : De Vëlo ass <b>net</b> nei."],
        phrase=["De Vëlo ass net nei. En ass al.", "Le vélo n'est pas neuf. Il est vieux."],
        phrases=[["Den Elefant ass grouss.", "L'éléphant est grand."], ["D'Mauer ass niddereg.", "Le muret est bas."]])

L.carte(1, "neuf, nouveau", "nei", "Contraire : al")
L.carte(1, "vieux", "al", "Contraire : nei")
L.carte(1, "grand", "grouss", "Contraire : kleng")
L.carte(1, "petit", "kleng", "Contraire : grouss")
L.carte(1, "haut", "héich", "Contraire : niddereg")
L.carte(1, "bas", "niddereg", "Contraire : héich")
L.carte(1, "le vélo", "Vëlo", "Masculin · pluriel : Vëloen", article="de")

L.quiz(1, "nei", "al", ["kleng", "lues", "eidel"], CO)
L.quiz(1, "al", "nei", ["grouss", "lues", "eidel"], CO)
L.quiz(1, "grouss", "kleng", ["dënn", "niddereg", "lues"], CO)
L.quiz(1, "kleng", "grouss", ["héich", "déck", "séier"], CO)
L.quiz(1, "héich", "niddereg", ["kleng", "lues", "dënn"], CO)
L.quiz(1, "niddereg", "héich", ["grouss", "déck", "voll"], CO)

L.trou(1, "Le smartphone est neuf.", "Den Handy ass", "nei", ".", ["nei", "al", "grouss", "kleng"], "nei = neuf, nouveau")
L.trou(1, "Le téléphone est vieux.", "Den Telefon ass", "al", ".", ["al", "nei", "lues", "séier"], "al = vieux · contraire de nei")
L.trou(1, "La souris est petite.", "D'Maus ass", "kleng", ".", ["kleng", "grouss", "héich", "séier"], "kleng = petit", attention=N_INVAR)
L.trou(1, "L'éléphant est grand.", "Den Elefant ass", "grouss", ".", ["grouss", "kleng", "lues", "dënn"], "grouss = grand · contraire de kleng")
L.trou(1, "Le bâtiment est haut.", "D'Gebai ass", "héich", ".", ["héich", "niddereg", "grouss", "kleng"], "héich = haut")
L.trou(1, "Le muret est bas.", "D'Mauer ass", "niddereg", ".", ["niddereg", "héich", "déck", "dënn"], "niddereg = bas · contraire de héich")
L.trou(1, "Le vélo n'est pas neuf. Il est vieux.", "De Vëlo ass net nei. En ass", "al", ".", ["al", "nei", "grouss", "kleng"],
       "nei ↔ al", attention="nei ↔ <b>al</b>.")

L.ecrit(1, "Neuf, nouveau", "Nei")
L.ecrit(1, "Vieux", "Al")
L.ecrit(1, "Grand", "Grouss")
L.ecrit(1, "Petit", "Kleng")
L.ecrit(1, "Le smartphone est neuf.", "Den Handy ass nei.")
L.ecrit(1, "Le téléphone est vieux.", "Den Telefon ass al.")
L.ecrit(1, "La souris est petite.", "D'Maus ass kleng.", attention=N_INVAR)
L.ecrit(1, "Le vélo n'est pas neuf. Il est vieux.", "De Vëlo ass net nei. En ass al.", attention=N_NET)
L.ecrit(1, "Haut", "Héich", plus=True)
L.ecrit(1, "Bas", "Niddereg", plus=True)
L.ecrit(1, "Le bâtiment est haut.", "D'Gebai ass héich.", plus=True)
L.ecrit(1, "Le muret est bas.", "D'Mauer ass niddereg.", plus=True)

# ═══ UNITÉ 2 : RAPIDE, LENT, LÉGER, LOURD ═══════════════════════════════════
L.unite(2, "Rapide ou lent, léger ou lourd",
        "Contraires : séier ↔ lues · liicht ↔ schwéier · ronn ↔ eckeg · Et : <b>a</b> devant la plupart des consonnes",
        "Den Auto ass séier. · De Schleek ass lues. · D'Fieder ass liicht.",
        ["Deux adjectifs : <b>a</b> devant une consonne (séier <b>a</b> liicht), <b>an</b> devant une voyelle.",
         "<b>liicht</b> = léger (pas « lumière ») · son contraire : <b>schwéier</b>."],
        phrase=["Nee, en ass lues a schwéier!", "Non, il est lent et lourd !"],
        phrases=[["Den Auto ass séier.", "La voiture est rapide."], ["De Ball ass ronn.", "La balle est ronde."]])

N_A = "Et = <b>a</b> devant la plupart des consonnes : lues <b>a</b> schwéier · <b>an</b> devant une voyelle."
L.carte(2, "rapide", "séier", "Contraire : lues")
L.carte(2, "lent", "lues", "Contraire : séier")
L.carte(2, "léger", "liicht", "Contraire : schwéier")
L.carte(2, "lourd", "schwéier", "Contraire : liicht")
L.carte(2, "rond", "ronn", "Contraire : eckeg")
L.carte(2, "anguleux, à angles", "eckeg", "Contraire : ronn")
L.carte(2, "mince, fin", "dënn", "Contraire : déck", plus=True)
L.carte(2, "épais", "déck", "Contraire : dënn", plus=True)

L.quiz(2, "séier", "lues", ["liicht", "eidel", "al"], CO)
L.quiz(2, "lues", "séier", ["nei", "liicht", "ronn"], CO)
L.quiz(2, "liicht", "schwéier", ["séier", "nei", "ronn"], CO)
L.quiz(2, "schwéier", "liicht", ["séier", "nei", "ronn"], CO)
L.quiz(2, "ronn", "eckeg", ["kleng", "voll", "dënn"], CO)
L.quiz(2, "eckeg", "ronn", ["dënn", "grouss", "voll"], CO)
L.quiz(2, "dënn", "déck", ["kleng", "eidel", "niddereg"], CO, plus=True)
L.quiz(2, "déck", "dënn", ["kleng", "niddereg", "eidel"], CO, plus=True)

L.trou(2, "La voiture est rapide.", "Den Auto ass", "séier", ".", ["séier", "lues", "grouss", "nei"], "séier = rapide · contraire de lues")
L.trou(2, "L'escargot est lent.", "De Schleek ass", "lues", ".", ["lues", "séier", "al", "niddereg"], "lues = lent")
L.trou(2, "La plume est légère.", "D'Fieder ass", "liicht", ".", ["liicht", "schwéier", "dënn", "déck"], "liicht = léger · d'Fieder (féminin)")
L.trou(2, "L'enclume est lourde.", "Den Amboss ass", "schwéier", ".", ["schwéier", "liicht", "grouss", "déck"], "schwéier = lourd")
L.trou(2, "La balle est ronde.", "De Ball ass", "ronn", ".", ["ronn", "eckeg", "déck", "dënn"], "ronn = rond · contraire de eckeg")
L.trou(2, "La boîte a des angles.", "D'Këscht ass", "eckeg", ".", ["eckeg", "ronn", "déck", "dënn"], "eckeg = anguleux, à angles")
L.trou(2, "Non, il est lent et lourd !", "Nee, en ass lues", "a", "schwéier!", ["a", "an", "ass"], "a devant s", attention=N_A)
L.trou(2, "Le fil est fin.", "De Fuedem ass", "dënn", ".", ["dënn", "déck", "schwéier", "grouss"], "dënn = fin, mince", plus=True)
L.trou(2, "Le dictionnaire est épais.", "D'Wierderbuch ass", "déck", ".", ["déck", "dënn", "liicht", "eidel"], "déck = épais", plus=True)

L.ecrit(2, "Rapide", "Séier")
L.ecrit(2, "Lent", "Lues")
L.ecrit(2, "Léger", "Liicht")
L.ecrit(2, "Lourd", "Schwéier")
L.ecrit(2, "La voiture est rapide.", "Den Auto ass séier.")
L.ecrit(2, "L'escargot est lent.", "De Schleek ass lues.")
L.ecrit(2, "La plume est légère.", "D'Fieder ass liicht.")
L.ecrit(2, "Non, il est lent et lourd !", "Nee, en ass lues a schwéier!", attention=N_A)
L.ecrit(2, "Rond", "Ronn", plus=True)
L.ecrit(2, "Anguleux", "Eckeg", plus=True)
L.ecrit(2, "Mince, fin", "Dënn", plus=True)
L.ecrit(2, "Épais", "Déck", plus=True)
L.ecrit(2, "L'enclume est lourde.", "Den Amboss ass schwéier.", plus=True)
L.ecrit(2, "La balle est ronde.", "De Ball ass ronn.", plus=True)
L.ecrit(2, "Le fil est fin.", "De Fuedem ass dënn.", plus=True)
L.ecrit(2, "Le livre est épais.", "D'Buch ass déck.", plus=True)

# ═══ UNITÉ 3 : LE PRIX ET L'ÉTAT ════════════════════════════════════════════
L.unite(3, "Le prix et l'état",
        "Contraires : deier ↔ bëlleg · futti ↔ ganz · schéin ↔ ellen · voll ↔ eidel",
        "De Moto ass deier. · Den Handy ass futti. · Den Auto ass schéin.",
        ["<b>ganz</b> a deux sens : intact (≠ futti) et très (ganz gutt, leçon 1).",
         "<b>bëlleg</b> = pas cher, bon marché · son contraire : <b>deier</b>."],
        phrase=["Nee, en ass deier. An en ass futti!", "Non, il est cher. Et il est cassé !"],
        phrases=[["Den Handy ass ganz.", "Le smartphone est intact."], ["D'Fläsch ass voll.", "La bouteille est pleine."]])

N_GANZ = "Ici <b>ganz</b> = intact, entier (≠ futti). Ailleurs ganz = très (ganz gutt)."
L.carte(3, "cher", "deier", "Contraire : bëlleg")
L.carte(3, "pas cher, bon marché", "bëlleg", "Contraire : deier")
L.carte(3, "cassé, en panne", "futti", "Contraire : ganz")
L.carte(3, "intact, entier", "ganz", "Contraire : futti · ≠ ganz = très", attention=N_GANZ)
L.carte(3, "beau", "schéin", "Contraire : ellen")
L.carte(3, "laid", "ellen", "Contraire : schéin")
L.carte(3, "plein", "voll", "Contraire : eidel", plus=True)
L.carte(3, "vide", "eidel", "Contraire : voll", plus=True)

L.quiz(3, "deier", "bëlleg", ["eidel", "al", "lues"], CO)
L.quiz(3, "bëlleg", "deier", ["al", "lues", "eidel"], CO)
L.quiz(3, "futti", "ganz", ["eidel", "al", "dënn"], CO, attention=N_GANZ)
L.quiz(3, "ganz", "futti", ["voll", "nei", "héich"], CO, attention=N_GANZ)
L.quiz(3, "schéin", "ellen", ["al", "kleng", "lues"], CO)
L.quiz(3, "ellen", "schéin", ["grouss", "nei", "voll"], CO)
L.quiz(3, "voll", "eidel", ["dënn", "niddereg", "bëlleg"], CO, plus=True)
L.quiz(3, "eidel", "voll", ["kleng", "dënn", "niddereg"], CO, plus=True)

L.trou(3, "La voiture est chère.", "Den Auto ass", "deier", ".", ["deier", "bëlleg", "séier", "nei"], "deier = cher · contraire de bëlleg")
L.trou(3, "Le stylo est bon marché.", "De Stëft ass", "bëlleg", ".", ["bëlleg", "deier", "al", "eidel"], "bëlleg = bon marché")
L.trou(3, "Le smartphone est cassé.", "Den Handy ass", "futti", ".", ["futti", "ganz", "nei", "al"], "futti = cassé, en panne")
L.trou(3, "La montre est intacte.", "D'Auer ass", "ganz", ".", ["ganz", "futti", "eidel", "lues"], "ganz = intact (≠ futti)", attention=N_GANZ)
L.trou(3, "La voiture est belle.", "Den Auto ass", "schéin", ".", ["schéin", "ellen", "deier", "séier"], "schéin = beau")
L.trou(3, "Le tableau est laid.", "D'Bild ass", "ellen", ".", ["ellen", "schéin", "eidel", "kleng"], "ellen = laid")
L.trou(3, "Non, il est cher. Et il est cassé !", "Nee, en ass deier. An en ass", "futti", "!", ["futti", "ganz", "bëlleg", "nei"],
       "futti = cassé")
L.trou(3, "Le seau est vide.", "Den Eemer ass", "eidel", ".", ["eidel", "voll", "kleng", "dënn"], "eidel = vide", plus=True)
L.trou(3, "La bouteille est pleine.", "D'Fläsch ass", "voll", ".", ["voll", "eidel", "déck", "liicht"], "voll = plein", plus=True)

L.ecrit(3, "Cher", "Deier")
L.ecrit(3, "Pas cher", "Bëlleg")
L.ecrit(3, "Cassé", "Futti")
L.ecrit(3, "Intact", "Ganz", attention=N_GANZ)
L.ecrit(3, "La moto est chère.", "De Moto ass deier.")
L.ecrit(3, "Le smartphone est cassé.", "Den Handy ass futti.")
L.ecrit(3, "La voiture est belle.", "Den Auto ass schéin.")
L.ecrit(3, "Non, il est cher. Et il est cassé !", "Nee, en ass deier. An en ass futti!")
L.ecrit(3, "Beau", "Schéin", plus=True)
L.ecrit(3, "Laid", "Ellen", plus=True)
L.ecrit(3, "Plein", "Voll", plus=True)
L.ecrit(3, "Vide", "Eidel", plus=True)
L.ecrit(3, "Le stylo est bon marché.", "De Stëft ass bëlleg.", plus=True)
L.ecrit(3, "Le seau est vide.", "Den Eemer ass eidel.", plus=True)
L.ecrit(3, "La bouteille est pleine.", "D'Fläsch ass voll.", plus=True)

# ═══ COURS ══════════════════════════════════════════════════════════════════
L.bloc({'type': 'texte', 'contenu': "Cette leçon présente des adjectifs et leurs <b>contraires</b>. L'adjectif se place après "
        "<b>ass</b> et reste <b>invariable</b> : <b>De Bus ass grouss.</b> Un contraire se retient mieux à deux : si tu connais "
        "<b>grouss</b>, tu connais <b>kleng</b>."})
L.bloc({'type': 'tableau', 'titre': "Neuf, vieux, grand, petit", 'entetes': ["Adjectif", "↔ Contraire"],
        'lignes': [["nei (neuf, nouveau)", "al (vieux)"], ["grouss (grand)", "kleng (petit)"], ["héich (haut)", "niddereg (bas)"]]}, 1)
L.bloc({'type': 'callout', 'variant': 'retenir', 'titre': "Décrire et dire non",
        'lignes': ["Objet + <b>ass</b> + adjectif : <b>De Vëlo ass al.</b>",
                   "Non : <b>net</b> devant l'adjectif : <b>De Vëlo ass net nei.</b>",
                   "Le vélo = <b>de Vëlo</b> (masculin) → pronom <b>en</b> : En ass al."]}, 1)
L.bloc({'type': 'tableau', 'titre': "Rapide, lent, léger, lourd", 'entetes': ["Adjectif", "↔ Contraire"],
        'lignes': [["séier (rapide)", "lues (lent)"], ["liicht (léger)", "schwéier (lourd)"], ["ronn (rond)", "eckeg (anguleux)"]]}, 2)
L.bloc({'type': 'callout', 'variant': 'astuce', 'titre': "Deux adjectifs : a ou an ?",
        'lignes': ["Et = <b>an</b>, qui devient <b>a</b> devant la plupart des consonnes : séier <b>a</b> liicht, lues <b>a</b> schwéier.",
                   "Devant une voyelle et n, d, t, z, h, on garde <b>an</b>."]}, 2)
L.bloc({'type': 'tableau', 'titre': "Mince, épais", 'entetes': ["Adjectif", "↔ Contraire"], 'lignes': [["dënn (mince, fin)", "déck (épais)"]]}, 2, plus=True)
L.bloc({'type': 'tableau', 'titre': "Le prix et l'état", 'entetes': ["Adjectif", "↔ Contraire"],
        'lignes': [["deier (cher)", "bëlleg (pas cher)"], ["futti (cassé)", "ganz (intact)"], ["schéin (beau)", "ellen (laid)"]]}, 3)
L.bloc({'type': 'callout', 'variant': 'attention', 'titre': "ganz : deux sens",
        'lignes': ["Ici <b>ganz</b> = <b>intact, entier</b> (≠ futti) : <b>Den Handy ass ganz.</b>",
                   "Mais <b>ganz</b> veut aussi dire <b>très</b> : ganz gutt = très bien (leçon 1)."]}, 3)
L.bloc({'type': 'tableau', 'titre': "Plein, vide", 'entetes': ["Adjectif", "↔ Contraire"], 'lignes': [["voll (plein)", "eidel (vide)"]]}, 3, plus=True)
L.bloc({'type': 'tableau', 'titre': "Exemples : décrire un objet", 'entetes': ["Luxembourgeois", "Français"],
        'lignes': [["Den Handy ass nei.", "Le smartphone est neuf."], ["Den Telefon ass al.", "Le téléphone est vieux."],
                   ["D'Fieder ass liicht.", "La plume est légère."], ["Den Auto ass séier.", "La voiture est rapide."],
                   ["De Moto ass deier.", "La moto est chère."], ["Den Handy ass futti.", "Le smartphone est cassé."]]})
L.bloc({'type': 'dialogue', 'titre': "À la brocante", 'echanges': [[x['lu'], x['fr']] for x in L.scene]}, 0)

L.ecrire()
