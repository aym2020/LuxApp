"""Leçon 5 — D'Zuelen (les nombres) : migration v1 → v2.
Fil : l'inventaire du bureau (Wéi vill … ginn et? – Et sinn …)."""
from fabrique import Lecon

L = Lecon('A1.1/lecon-05.json')
NB = 'CHOISIS LE NOMBRE'

L.instructions = {
    'flashcards': "Mot caché : écris en lettres luxembourgeoises le nombre donné en chiffres.",
    'quiz': "Lis le nombre luxembourgeois et choisis sa valeur en chiffres.",
    'trous': "Complète la phrase avec le nombre luxembourgeois correct.",
    'ecriture': "Écris le nombre en toutes lettres en luxembourgeois, soudé, et les phrases de la mission (Et sinn …). Respecte an / a."
}

L.fil("L'inventaire du bureau",
      "Ton chef prépare l'inventaire du bureau. Il te demande combien il y a d'ordinateurs, de chaises, de livres et de feuilles : tu comptes et tu réponds.",
      "répondre à « Wéi vill … ? » avec « Et sinn … » et dire un nombre de 0 à 1000.")

L.replique(1, "Le chef", "Moien! Wéi vill Computere ginn et?", "Bonjour ! Combien d'ordinateurs y a-t-il ?")
L.replique(1, 'toi', "Et sinn néng.", "Il y en a neuf.", "Il y a … = <b>Et sinn</b> … · 9 = <b>néng</b>.")
L.replique(2, "Le chef", "A wéi vill Still?", "Et combien de chaises ?")
L.replique(2, 'toi', "Et sinn uechtzéng.", "Il y en a dix-huit.", "18 = <b>uechtzéng</b> (pas aachtzéng).")
L.replique(3, "Le chef", "A wéi vill Bicher?", "Et combien de livres ?")
L.replique(3, 'toi', "Et sinn eenanzwanzeg.", "Il y en a vingt et un.", "21 = <b>een</b> + <b>an</b> + zwanzeg, soudé.")
L.replique(4, "Le chef", "A wéi vill Blieder?", "Et combien de feuilles ?")
L.replique(4, 'toi', "Et sinn zweehonnertfofzeg.", "Il y en a deux cent cinquante.", "250 = zwee<b>honnert</b>fofzeg, tout soudé.")
L.replique(4, "Le chef", "Super, merci!", "Super, merci !")

N_SOUDE = "Un nombre s'écrit <b>soudé</b>, sans espace ni majuscule."
N_ZWOU = "2 = <b>zwee</b> (masculin, neutre) · <b>zwou</b> (féminin) : zwou Dieren."

# ═══ UNITÉ 1 : DE 0 À 12 ════════════════════════════════════════════════════
L.unite(1, "De 0 à 12",
        "Compter : <b>Wéi vill … ginn et?</b> – <b>Et sinn …</b> (Combien … ? – Il y en a …)",
        "eent, zwee, dräi, véier, fënnef, sechs, siwen, aacht, néng, zéng",
        ["2 : <b>zwee</b> (masculin, neutre), mais <b>zwou</b> (féminin) : zwou Dieren.",
         "Les nombres sont des adjectifs : <b>pas de majuscule</b>."],
        phrase=["Wéi vill Computere ginn et? – Et sinn néng.", "Combien d'ordinateurs y a-t-il ? – Il y en a neuf."],
        phrases=[["Et sinn aacht Käerzen.", "Il y a huit bougies."], ["Wéi vill Käerze ginn et?", "Combien de bougies y a-t-il ?"]])

for fr, lu in [("1", "eent"), ("2", "zwee"), ("3", "dräi"), ("4", "véier"), ("5", "fënnef"), ("6", "sechs"),
               ("7", "siwen"), ("8", "aacht"), ("9", "néng"), ("10", "zéng")]:
    L.carte(1, fr, lu, attention=N_ZWOU if lu == 'zwee' else None)
L.carte(1, "0", "null", plus=True)
L.carte(1, "2 (féminin)", "zwou", "zwou Dieren", plus=True, attention=N_ZWOU)
L.carte(1, "11", "eelef", "À retenir", plus=True)
L.carte(1, "12", "zwielef", "À retenir", plus=True)

L.quiz(1, "dräi", "3", ["2", "4", "13"], NB)
L.quiz(1, "véier", "4", ["5", "14", "40"], NB)
L.quiz(1, "fënnef", "5", ["4", "6", "15"], NB)
L.quiz(1, "sechs", "6", ["7", "16", "60"], NB)
L.quiz(1, "siwen", "7", ["6", "8", "9"], NB)
L.quiz(1, "aacht", "8", ["7", "9", "18"], NB)
L.quiz(1, "néng", "9", ["8", "10", "19"], NB)
L.quiz(1, "zéng", "10", ["9", "11", "100"], NB)
L.quiz(1, "eelef", "11", ["10", "12", "21"], NB, plus=True)
L.quiz(1, "zwielef", "12", ["11", "13", "20"], NB, plus=True)
L.quiz(1, "null", "0", ["1", "10", "100"], NB, plus=True)

L.trou(1, "Il y a trois bus.", "Et sinn", "dräi", "Bussen.", ["dräi", "zwee", "véier", "dräizéng"], "dräi = 3")
L.trou(1, "Il y a quatre tables.", "Et sinn", "véier", "Dëscher.", ["véier", "fënnef", "véierzéng", "véierzeg"], "véier = 4")
L.trou(1, "Il y a cinq téléphones.", "Et sinn", "fënnef", "Telefonen.", ["fënnef", "véier", "sechs", "fofzéng"], "fënnef = 5")
L.trou(1, "Il y a six voitures.", "Et sinn", "sechs", "Autoen.", ["sechs", "siwen", "siechzéng", "fënnef"], "sechs = 6")
L.trou(1, "Il y a huit bougies.", "Et sinn", "aacht", "Käerzen.", ["aacht", "néng", "uechtzéng", "aachtzeg"], "aacht = 8")
L.trou(1, "Il y a neuf ordinateurs.", "Et sinn", "néng", "Computeren.", ["néng", "aacht", "nonzéng", "zéng"], "néng = 9")
L.trou(1, "Il y a dix bouteilles.", "Et sinn", "zéng", "Fläschen.", ["zéng", "néng", "zwanzeg", "eelef"], "zéng = 10")
L.trou(1, "Il y en a neuf.", "Et", "sinn", "néng.", ["sinn", "ass", "geet", "huet"], "Il y a … = Et sinn …")
L.trou(1, "Deux portes.", "", "zwou", "Dieren", ["zwou", "zwee"], "Dier est féminin → zwou", plus=True, attention=N_ZWOU)
L.trou(1, "Il y a douze chaises.", "Et sinn", "zwielef", "Still.", ["zwielef", "eelef", "zwanzeg", "zéng"], "zwielef = 12", plus=True)

L.ecrit(1, "3", "dräi")
L.ecrit(1, "4", "véier")
L.ecrit(1, "6", "sechs")
L.ecrit(1, "8", "aacht")
L.ecrit(1, "10", "zéng")
L.ecrit(1, "Il y a huit bougies.", "Et sinn aacht Käerzen.")
L.ecrit(1, "Combien de bougies y a-t-il ?", "Wéi vill Käerze ginn et?")
L.ecrit(1, "Il y en a neuf.", "Et sinn néng.")
for fr, lu in [("0", "null"), ("1", "eent"), ("2 (masculin ou neutre)", "zwee"), ("2 (féminin)", "zwou"), ("5", "fënnef"),
               ("7", "siwen"), ("9", "néng"), ("11", "eelef"), ("12", "zwielef")]:
    L.ecrit(1, fr, lu, plus=True, attention=N_ZWOU if lu in ('zwee', 'zwou') else None)
L.ecrit(1, "Deux portes", "zwou Dieren", plus=True, attention=N_ZWOU)
L.ecrit(1, "Deux bus", "zwee Bussen", plus=True, attention=N_ZWOU)

# ═══ UNITÉ 2 : DE 13 À 20 ═══════════════════════════════════════════════════
L.unite(2, "De 13 à 20",
        "13 à 19 : unité + <b>zéng</b>, avec des formes à retenir : <b>fofzéng</b> (15), <b>siechzéng</b> (16), <b>uechtzéng</b> (18), <b>nonzéng</b> (19)",
        "dräizéng (13) · véierzéng (14) · siwwenzéng (17) · zwanzeg (20)",
        ["<b>fofzéng</b> = 15 (pas fënnefzéng) · <b>uechtzéng</b> = 18 (pas aachtzéng).",
         "<b>siwwenzéng</b> (17) s'écrit avec deux w, comme siwwenzeg (70)."],
        phrase=["A wéi vill Still? – Et sinn uechtzéng.", "Et combien de chaises ? – Il y en a dix-huit."],
        phrases=[["Et sinn uechtzéng Autoen.", "Il y a dix-huit voitures."], ["Et sinn zwanzeg Still.", "Il y a vingt chaises."]])

N_IRR = "À retenir : <b>fofzéng</b> (15), <b>siechzéng</b> (16), <b>uechtzéng</b> (18), <b>nonzéng</b> (19)."
for fr, lu in [("13", "dräizéng"), ("14", "véierzéng"), ("15", "fofzéng"), ("16", "siechzéng"), ("17", "siwwenzéng"),
               ("18", "uechtzéng"), ("19", "nonzéng"), ("20", "zwanzeg")]:
    L.carte(2, fr, lu, attention=N_IRR if lu in ('fofzéng', 'siechzéng', 'uechtzéng', 'nonzéng') else None)

L.quiz(2, "dräizéng", "13", ["30", "3", "14"], NB)
L.quiz(2, "véierzéng", "14", ["40", "4", "13"], NB)
L.quiz(2, "fofzéng", "15", ["14", "16", "50"], NB, attention=N_IRR)
L.quiz(2, "siechzéng", "16", ["60", "6", "17"], NB, attention=N_IRR)
L.quiz(2, "siwwenzéng", "17", ["70", "7", "16"], NB)
L.quiz(2, "uechtzéng", "18", ["80", "8", "19"], NB, attention=N_IRR)
L.quiz(2, "nonzéng", "19", ["90", "9", "18"], NB, attention=N_IRR)
L.quiz(2, "zwanzeg", "20", ["12", "2", "30"], NB)

L.trou(2, "Il y a dix-huit voitures.", "Et sinn", "uechtzéng", "Autoen.", ["uechtzéng", "aachtzéng", "siwwenzéng", "nonzéng"], "uechtzéng = 18", attention=N_IRR)
L.trou(2, "Il y a quinze chaises.", "Et sinn", "fofzéng", "Still.", ["fofzéng", "fënnefzéng", "véierzéng", "fofzeg"], "fofzéng = 15", attention=N_IRR)
L.trou(2, "Il y a treize livres.", "Et sinn", "dräizéng", "Bicher.", ["dräizéng", "drësseg", "dräi", "véierzéng"], "dräizéng = 13")
L.trou(2, "Il y a seize tasses.", "Et sinn", "siechzéng", "Tasen.", ["siechzéng", "sechszéng", "siechzeg", "siwwenzéng"], "siechzéng = 16", attention=N_IRR)
L.trou(2, "Il y a dix-sept bus.", "Et sinn", "siwwenzéng", "Bussen.", ["siwwenzéng", "siwenzéng", "siwwenzeg", "siechzéng"], "siwwenzéng = 17, deux w")
L.trou(2, "Il y a dix-neuf portes.", "Et sinn", "nonzéng", "Dieren.", ["nonzéng", "néngzéng", "nonzeg", "uechtzéng"], "nonzéng = 19", attention=N_IRR)
L.trou(2, "Il y a vingt chaises.", "Et sinn", "zwanzeg", "Still.", ["zwanzeg", "zwielef", "zwee", "drësseg"], "zwanzeg = 20")
L.trou(2, "Il y a quatorze cahiers.", "Et sinn", "véierzéng", "Hefter.", ["véierzéng", "véierzeg", "véier", "dräizéng"], "véierzéng = 14", plus=True)

L.ecrit(2, "13", "dräizéng")
L.ecrit(2, "15", "fofzéng", attention=N_IRR)
L.ecrit(2, "16", "siechzéng", attention=N_IRR)
L.ecrit(2, "17", "siwwenzéng")
L.ecrit(2, "18", "uechtzéng", attention=N_IRR)
L.ecrit(2, "19", "nonzéng", attention=N_IRR)
L.ecrit(2, "20", "zwanzeg")
L.ecrit(2, "Il y en a dix-huit.", "Et sinn uechtzéng.", attention=N_IRR)
L.ecrit(2, "14", "véierzéng", plus=True)

# ═══ UNITÉ 3 : LES DIZAINES, DE 21 À 99 ═════════════════════════════════════
L.unite(3, "Les dizaines, de 21 à 99",
        "21 à 99 : <b>unité + an / a + dizaine</b>, le tout soudé : fënnef<b>an</b>zwanzeg (25) · 1 devient <b>een</b> : eenanzwanzeg (21)",
        "eenanzwanzeg (21) · néngandrësseg (39) · siwenavéierzeg (47)",
        ["<b>an</b> devant zwanzeg, drësseg, aachtzeg, nonzeg · <b>a</b> devant véierzeg, fofzeg, siechzeg, siwwenzeg.",
         "L'unité vient <b>avant</b> la dizaine : 25 = « cinq-et-vingt »."],
        phrase=["A wéi vill Bicher? – Et sinn eenanzwanzeg.", "Et combien de livres ? – Il y en a vingt et un."],
        phrases=[["Et sinn zweeanzwanzeg Bussen.", "Il y a vingt-deux bus."], ["Et sinn siwenavéierzeg Telefonen.", "Il y a quarante-sept téléphones."]])

N_ANA = "Liaison : <b>an</b> devant zwanzeg, drësseg, aachtzeg, nonzeg · <b>a</b> devant véierzeg, fofzeg, siechzeg, siwwenzeg."
for fr, lu in [("30", "drësseg"), ("40", "véierzeg"), ("50", "fofzeg"), ("60", "siechzeg"), ("70", "siwwenzeg"),
               ("80", "aachtzeg"), ("90", "nonzeg"), ("21", "eenanzwanzeg")]:
    L.carte(3, fr, lu, attention=N_ANA if lu == 'eenanzwanzeg' else None)
L.carte(3, "47", "siwenavéierzeg", "unité + a + dizaine", plus=True, attention=N_ANA)

L.quiz(3, "drësseg", "30", ["13", "40", "20"], NB)
L.quiz(3, "aachtzeg", "80", ["8", "18", "90"], NB)
L.quiz(3, "nonzeg", "90", ["9", "19", "80"], NB)
L.quiz(3, "fënnefanzwanzeg", "25", ["52", "35", "24"], NB)
L.quiz(3, "néngandrësseg", "39", ["93", "29", "49"], NB)
L.quiz(3, "dräiavéierzeg", "43", ["34", "53", "33"], NB, attention=N_ANA)
L.quiz(3, "siwenafofzeg", "57", ["75", "67", "47"], NB, attention=N_ANA)
L.quiz(3, "aachtasiechzeg", "68", ["86", "78", "58"], NB, attention=N_ANA)
L.quiz(3, "véierzeg", "40", ["14", "4", "50"], NB, plus=True)
L.quiz(3, "fofzeg", "50", ["15", "5", "60"], NB, plus=True)
L.quiz(3, "siechzeg", "60", ["16", "6", "70"], NB, plus=True)
L.quiz(3, "siwwenzeg", "70", ["17", "7", "60"], NB, plus=True)
L.quiz(3, "eenasiwwenzeg", "71", ["17", "81", "61"], NB, plus=True)
L.quiz(3, "dräianaachtzeg", "83", ["38", "73", "93"], NB, plus=True)

L.trou(3, "Il y a vingt-deux bus.", "Et sinn", "zweeanzwanzeg", "Bussen.", ["zweeanzwanzeg", "zwanzeg", "dräianzwanzeg", "zwielef"], "22 = zweeanzwanzeg")
L.trou(3, "Il y a quarante-sept téléphones.", "Et sinn", "siwenavéierzeg", "Telefonen.", ["siwenavéierzeg", "véierasiwwenzeg", "siwenandrësseg", "aachtavéierzeg"], "47 = siwenavéierzeg", attention=N_ANA)
L.trou(3, "Il y a trente et une tables.", "Et sinn", "eenandrësseg", "Dëscher.", ["eenandrësseg", "drësseg", "eenanzwanzeg", "zweeandrësseg"], "31 = eenandrësseg")
L.trou(3, "Il y a cinquante-neuf ordinateurs.", "Et sinn", "néngafofzeg", "Computeren.", ["néngafofzeg", "néngavéierzeg", "aachtafofzeg", "fofzeg"], "59 = néngafofzeg", attention=N_ANA)
L.trou(3, "Il y a soixante-trois chaises.", "Et sinn", "dräiasiechzeg", "Still.", ["dräiasiechzeg", "dräiasiwwenzeg", "véierasiechzeg", "siechzeg"], "63 = dräiasiechzeg", attention=N_ANA)
L.trou(3, "Il y a quatre-vingt-quatre trains.", "Et sinn", "véieranaachtzeg", "Zich.", ["véieranaachtzeg", "véierannonzeg", "aachtanvéierzeg", "dräianaachtzeg"], "84 = véieranaachtzeg", attention=N_ANA)
L.trou(3, "Il y a vingt-cinq montres.", "Et sinn", "fënnefanzwanzeg", "Aueren.", ["fënnefanzwanzeg", "véieranzwanzeg", "fënnefandrësseg", "zwanzeg"], "25 = fënnefanzwanzeg")
L.trou(3, "Il y en a vingt et un.", "Et sinn", "eenanzwanzeg", ".", ["eenanzwanzeg", "eentanzwanzeg", "zwanzegeent", "eelef"], "21 = een + an + zwanzeg", attention=N_ANA)
L.trou(3, "Il y a soixante-dix-huit avions.", "Et sinn", "aachtasiwwenzeg", "Fligeren.", ["aachtasiwwenzeg", "siwenanaachtzeg", "aachtasiechzeg", "siwwenzeg"], "78 = aachtasiwwenzeg", plus=True)
L.trou(3, "Il y a quatre-vingt-dix-neuf portes.", "Et sinn", "néngannonzeg", "Dieren.", ["néngannonzeg", "nénganaachtzeg", "nonzeg", "aachtannonzeg"], "99 = néngannonzeg", plus=True)
L.trou(3, "Il y a quarante tableaux.", "Et sinn", "véierzeg", "Tafelen.", ["véierzeg", "drësseg", "fofzeg", "véier"], "40 = véierzeg", plus=True)
L.trou(3, "Il y a cinquante-deux tasses.", "Et sinn", "zweeafofzeg", "Tasen.", ["zweeafofzeg", "zwouafofzeg", "zweeavéierzeg", "dräiafofzeg"], "52 = zweeafofzeg", plus=True)
L.trou(3, "Il y a trente-sept fenêtres.", "Et sinn", "siwenandrësseg", "Fënsteren.", ["siwenandrësseg", "siwenavéierzeg", "aachtandrësseg", "drësseg"], "37 = siwenandrësseg", plus=True)
L.trou(3, "Il y a soixante-quatorze bouteilles.", "Et sinn", "véierasiwwenzeg", "Fläschen.", ["véierasiwwenzeg", "véierasiechzeg", "fënnefasiwwenzeg", "siwwenzeg"], "74 = véierasiwwenzeg", plus=True)
L.trou(3, "Il y a vingt-neuf lampes.", "Et sinn", "nénganzwanzeg", "Luuchten.", ["nénganzwanzeg", "néngandrësseg", "aachtanzwanzeg", "zwanzeg"], "29 = nénganzwanzeg", plus=True)
L.trou(3, "Il y a quatre-vingt-un livres.", "Et sinn", "eenanaachtzeg", "Bicher.", ["eenanaachtzeg", "eenannonzeg", "eenasiwwenzeg", "zweeanaachtzeg"], "81 = eenanaachtzeg", plus=True)

L.ecrit(3, "21", "eenanzwanzeg", attention=N_ANA)
L.ecrit(3, "25", "fënnefanzwanzeg")
L.ecrit(3, "30", "drësseg")
L.ecrit(3, "47", "siwenavéierzeg", attention=N_ANA)
L.ecrit(3, "50", "fofzeg")
L.ecrit(3, "80", "aachtzeg")
L.ecrit(3, "90", "nonzeg")
L.ecrit(3, "Il y en a vingt et un.", "Et sinn eenanzwanzeg.", attention=N_ANA)
for fr, lu in [("24", "véieranzwanzeg"), ("32", "zweeandrësseg"), ("34", "véierandrësseg"), ("35", "fënnefandrësseg"),
               ("38", "aachtandrësseg"), ("48", "aachtavéierzeg"), ("49", "néngavéierzeg"), ("52", "zweeafofzeg"),
               ("56", "sechsafofzeg"), ("75", "fënnefasiwwenzeg"), ("85", "fënnefanaachtzeg"), ("96", "sechsannonzeg"),
               ("98", "aachtannonzeg")]:
    L.ecrit(3, fr, lu, plus=True)

# ═══ UNITÉ 4 : CENTAINES ET MILLIERS ════════════════════════════════════════
L.unite(4, "Centaines et milliers",
        "Centaines et milliers : tout <b>soudé</b> · <b>honnert</b> (100), <b>dausend</b> (1000) · 250 = zweehonnertfofzeg",
        "honnerteenanzwanzeg (121) · dräihonnertvéier (304) · zweedausendfënnefanzwanzeg (2025)",
        ["Aucune espace : <b>zweehonnertfofzeg</b>, pas « zweehonnert fofzeg ».",
         "Années avant 2000, par centaines : 1984 = <b>nonzénghonnertvéieranaachtzeg</b>."],
        phrase=["A wéi vill Blieder? – Et sinn zweehonnertfofzeg.", "Et combien de feuilles ? – Il y en a deux cent cinquante."],
        phrases=[["Et sinn honnert Blieder.", "Il y a cent feuilles."], ["Et sinn dausend Gebaier.", "Il y a mille bâtiments."]])

for fr, lu in [("100", "honnert"), ("200", "zweehonnert"), ("300", "dräihonnert"), ("1000", "dausend"),
               ("2000", "zweedausend"), ("10 000", "zéngdausend")]:
    L.carte(4, fr, lu, attention=N_SOUDE)

L.quiz(4, "zweehonnertfënnefanzwanzeg", "225", ["252", "215", "325"], NB)
L.quiz(4, "nénghonnerteelef", "911", ["901", "919", "811"], NB)
L.quiz(4, "zweehonnertzwielef", "212", ["221", "202", "312"], NB)
L.quiz(4, "dräihonnertaachtzeg", "380", ["308", "390", "280"], NB)
L.quiz(4, "véierhonnertsiwen", "407", ["470", "417", "507"], NB)
L.quiz(4, "honnertnéngannonzeg", "199", ["109", "189", "299"], NB)
L.quiz(4, "zweehonnertfofzeg", "250", ["205", "150", "215"], NB, attention=N_SOUDE)
L.quiz(4, "dausend", "1000", ["100", "10 000", "200"], NB)
for q, r, d in [("siwenhonnertvéierannonzeg", "794", ["749", "784", "694"]),
                ("fënnefhonnertvéieravéierzeg", "544", ["454", "554", "644"]),
                ("sechshonnertnonzeg", "690", ["609", "680", "790"]),
                ("siwenhonnertdräianzwanzeg", "723", ["732", "713", "823"]),
                ("aachthonnertfofzéng", "815", ["851", "805", "915"]),
                ("nénghonnertsiwwenzeg", "970", ["907", "960", "870"]),
                ("dräihonnerteenandrësseg", "331", ["313", "341", "231"]),
                ("véierhonnertzweeasiechzeg", "462", ["426", "472", "562"]),
                ("fënnefhonnertaachtanaachtzeg", "588", ["858", "578", "688"]),
                ("sechshonnertvéierannonzeg", "694", ["649", "684", "794"]),
                ("siwenhonnertfënnefavéierzeg", "745", ["754", "735", "845"]),
                ("aachthonnertzweeanzwanzeg", "822", ["282", "832", "722"])]:
    L.quiz(4, q, r, d, NB, plus=True)

L.trou(4, "Il y a cent feuilles.", "Et sinn", "honnert", "Blieder.", ["honnert", "zéng", "dausend", "nonzeg"], "100 = honnert")
L.trou(4, "Il y a deux cents maisons.", "Et sinn", "zweehonnert", "Haiser.", ["zweehonnert", "honnert", "dausend", "dräihonnert"], "200 = zweehonnert", attention=N_SOUDE)
L.trou(4, "Il y a trois cents verres.", "Et sinn", "dräihonnert", "Glieser.", ["dräihonnert", "zweehonnert", "véierhonnert", "honnert"], "300 = dräihonnert")
L.trou(4, "Il y a mille bâtiments.", "Et sinn", "dausend", "Gebaier.", ["dausend", "honnert", "zéngdausend", "zweehonnert"], "1000 = dausend")
L.trou(4, "Il y en a deux cent cinquante.", "Et sinn", "zweehonnertfofzeg", ".", ["zweehonnertfofzeg", "fofzegzweehonnert", "zweehonnertfënnefzeg", "zweehonnertfofzéng"],
       "250 = zweehonnert + fofzeg, soudé", attention=N_SOUDE)
L.trou(4, "Il y a cinq cents livres.", "Et sinn", "fënnefhonnert", "Bicher.", ["fënnefhonnert", "fofzeghonnert", "fënnefdausend", "fofzéng"], "500 = fënnefhonnert")

L.ecrit(4, "100", "honnert")
L.ecrit(4, "200", "zweehonnert")
L.ecrit(4, "500", "fënnefhonnert")
L.ecrit(4, "1000", "dausend")
L.ecrit(4, "128", "honnertaachtanzwanzeg", attention=N_SOUDE)
L.ecrit(4, "304", "dräihonnertvéier", attention=N_SOUDE)
L.ecrit(4, "Il y en a deux cent cinquante.", "Et sinn zweehonnertfofzeg.", attention=N_SOUDE)
for fr, lu in [("326", "dräihonnertsechsanzwanzeg"), ("385", "dräihonnertfënnefanaachtzeg"), ("659", "sechshonnertnéngafofzeg"),
               ("675", "sechshonnertfënnefasiwwenzeg"), ("704", "siwenhonnertvéier"), ("766", "siwenhonnertsechsasiechzeg"),
               ("819", "aachthonnertnonzéng"), ("834", "aachthonnertvéierandrësseg"), ("929", "nénghonnertnénganzwanzeg"),
               ("991", "nénghonnerteenannonzeg")]:
    L.ecrit(4, fr, lu, plus=True)

# ═══ COURS ══════════════════════════════════════════════════════════════════
L.bloc({'type': 'texte', 'contenu': "Les nombres luxembourgeois se construisent à partir des unités, des dizaines et des centaines. "
        "La règle clé : l'unité se place <b>avant</b> la dizaine, et tout s'écrit <b>soudé</b> (sans espace, sans majuscule)."})
L.bloc({'type': 'vocab', 'titre': "De 1 à 10", 'items': [["eent", "1"], ["zwee", "2"], ["dräi", "3"], ["véier", "4"], ["fënnef", "5"],
        ["sechs", "6"], ["siwen", "7"], ["aacht", "8"], ["néng", "9"], ["zéng", "10"]]}, 1)
L.bloc({'type': 'callout', 'variant': 'retenir', 'titre': "Compter",
        'lignes': ["<b>Wéi vill … ginn et?</b> = Combien de … y a-t-il ?", "<b>Et sinn …</b> = Il y a … / Il y en a …",
                   "2 : <b>zwee</b> (masculin, neutre) : zwee Bussen · <b>zwou</b> (féminin) : zwou Dieren."]}, 1)
L.bloc({'type': 'vocab', 'titre': "0, 11 et 12", 'items': [["null", "0"], ["eelef", "11"], ["zwielef", "12"], ["zwou", "2 (féminin)"]]}, 1, plus=True)
L.bloc({'type': 'vocab', 'titre': "De 13 à 20", 'items': [["dräizéng", "13"], ["véierzéng", "14"], ["fofzéng", "15"], ["siechzéng", "16"],
        ["siwwenzéng", "17"], ["uechtzéng", "18"], ["nonzéng", "19"], ["zwanzeg", "20"]]}, 2)
L.bloc({'type': 'callout', 'variant': 'attention', 'titre': "Formes à retenir",
        'lignes': ["<b>fofzéng</b> (15), <b>siechzéng</b> (16), <b>uechtzéng</b> (18), <b>nonzéng</b> (19) : la première partie change.",
                   "<b>siwwenzéng</b> (17) prend deux w."]}, 2)
L.bloc({'type': 'vocab', 'titre': "Les dizaines", 'items': [["zwanzeg", "20"], ["drësseg", "30"], ["véierzeg", "40"], ["fofzeg", "50"],
        ["siechzeg", "60"], ["siwwenzeg", "70"], ["aachtzeg", "80"], ["nonzeg", "90"]]}, 3)
L.bloc({'type': 'callout', 'variant': 'astuce', 'titre': "Construire de 21 à 99",
        'lignes': ["Schéma : <b>unité + an / a + dizaine</b>, le tout soudé : <b>fënnefanzwanzeg</b> = « cinq-et-vingt » = 25.",
                   "Le <b>1</b> devient <b>een</b> : <b>eenanzwanzeg</b> (21)."]}, 3)
L.bloc({'type': 'tableau', 'titre': "an ou a ? (règle UNITEDZOHA)", 'entetes': ["Dizaine", "Liaison", "Exemple"],
        'lignes': [["20 — zwanzeg", "an", "eenanzwanzeg (21)"], ["30 — drësseg", "an", "eenandrësseg (31)"],
                   ["40 — véierzeg", "a", "siwenavéierzeg (47)"], ["50 — fofzeg", "a", "eenafofzeg (51)"],
                   ["60 — siechzeg", "a", "eenasiechzeg (61)"], ["70 — siwwenzeg", "a", "eenasiwwenzeg (71)"],
                   ["80 — aachtzeg", "an", "eenanaachtzeg (81)"], ["90 — nonzeg", "an", "eenannonzeg (91)"]]}, 3)
L.bloc({'type': 'callout', 'variant': 'info', 'titre': "Quand garder le n ?",
        'lignes': ["On garde <b>an</b> si la dizaine commence par une voyelle ou par <b>n, d, t, z, h</b> (moyen mnémotechnique <b>UNITEDZOHA</b>).",
                   "Sinon, on met <b>a</b> : devant v, f, s (véierzeg, fofzeg, siechzeg, siwwenzeg)."]}, 3)
L.bloc({'type': 'tableau', 'titre': "Centaines et milliers", 'entetes': ["Nombre", "Luxembourgeois"],
        'lignes': [["100", "honnert"], ["200", "zweehonnert"], ["300", "dräihonnert"], ["121", "honnerteenanzwanzeg"],
                   ["250", "zweehonnertfofzeg"], ["1000", "dausend"], ["2000", "zweedausend"], ["10 000", "zéngdausend"]]}, 4)
L.bloc({'type': 'callout', 'variant': 'attention', 'titre': "Tout est soudé, sans espace",
        'lignes': ["Même avec honnert et dausend : <b>zweehonnertfofzeg</b> (250), pas « zweehonnert fofzeg ».",
                   "Les nombres sont des adjectifs → <b>pas de majuscule</b>."]}, 4)
L.bloc({'type': 'callout', 'variant': 'info', 'titre': "Les années",
        'lignes': ["Avant 2000, on lit par centaines : 1984 = <b>nonzénghonnertvéieranaachtzeg</b> (19-cent-84).",
                   "À partir de 2000 : 2025 = <b>zweedausendfënnefanzwanzeg</b>."]}, 4, plus=True)
L.bloc({'type': 'dialogue', 'titre': "L'inventaire du bureau", 'echanges': [[x['lu'], x['fr']] for x in L.scene]}, 0)

L.ecrire()
