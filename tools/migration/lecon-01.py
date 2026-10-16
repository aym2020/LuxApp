"""Leçon 1 — Moien! …an Äddi! (salutations) : migration v1 → v2.
Fil : premier cours de luxembourgeois (saluer, ça va, se présenter, prendre congé)."""
from fabrique import Lecon

L = Lecon('A1.1/lecon-01.json')
TR = 'CHOISIS LA TRADUCTION'

L.instructions = {
    'flashcards': "Mot caché : retrouve la formule luxembourgeoise à partir du français : saluer, demander comment ça va, se présenter, prendre congé.",
    'quiz': "Lis la formule luxembourgeoise et choisis sa traduction française exacte, en respectant le registre (dir = tu, Iech = vous).",
    'trous': "Complète la salutation ou la formule avec le mot exact (Moien, geet, Iech, heesche, gläichfalls…).",
    'ecriture': "Écris en luxembourgeois les formules de la mission : saluer, demander et dire comment ça va, dire ton nom, prendre congé."
}

L.fil("Premier cours de luxembourgeois",
      "C'est ton premier cours au centre de langues. Tu salues Léa, une autre élève, puis Madame Weber, "
      "la professeure, qui te demande ton nom. Tu joues Paul. À la fin du cours, tu prends congé.",
      "saluer, demander et dire comment ça va, dire ton nom poliment, prendre congé.")

L.replique(1, 'Léa', "Moien!", "Bonjour !")
L.replique(1, 'toi', "Gudde Moien!", "Bonjour ! (le matin)",
           "Le matin : <b>Gudde</b> Moien! (sans n devant M).")
L.replique(2, 'Léa', "Wéi geet et dir?", "Comment vas-tu ?")
L.replique(2, 'toi', "Mir geet et gutt. An dir?", "Je vais bien. Et toi ?",
           "On répond avec <b>Mir</b> geet et gutt · entre élèves on tutoie : <b>An dir?</b>")
L.replique(2, 'Léa', "Ganz gutt, merci!", "Très bien, merci !")
L.replique(3, 'Madamm Weber', "Gudde Moien! Wéi heescht Dir?", "Bonjour ! Comment vous appelez-vous ?")
L.replique(3, 'toi', "Ech heesche Paul. Et freet mech.", "Je m'appelle Paul. Enchanté.",
           "<b>Ech heesche</b> Paul (le n tombe devant P) · Enchanté = <b>Et freet mech</b>.")
L.replique(3, 'Madamm Weber', "Mech och!", "Moi aussi !")
L.replique(4, 'Madamm Weber', "Äddi, schéinen Owend!", "Au revoir, bonne soirée !")
L.replique(4, 'toi', "Merci, gläichfalls! Äddi!", "Merci, pareillement ! Au revoir !",
           "À un souhait, on répond <b>Merci, gläichfalls!</b>")

# ═══ UNITÉ 1 : SALUER ═══════════════════════════════════════════════════════
L.unite(1, "Saluer",
        "<b>Moien!</b> à toute heure · <b>Gudde Moien!</b> le matin · <b>Gudde Mëtteg!</b> à midi · <b>Gudden Owend!</b> le soir",
        "Moien Anna! · Gudde Moien, Madamm! · Gudden Owend, Här Michels!",
        ["<b>Moien!</b> marche à toute heure : en cas de doute, dis Moien!",
         "Le soir : <b>Gudden</b> Owend (le n reste devant une voyelle), mais <b>Gudde</b> Moien."],
        phrase=["Gudde Moien!", "Bonjour ! (le matin)"],
        phrases=[["Moien Anna!", "Bonjour Anna !"], ["Gudden Owend, Madamm Wagner!", "Bonsoir, Madame Wagner !"]])

N_GUDDEN = "Le soir : <b>Gudden</b> Owend, avec n devant la voyelle O."
L.carte(1, "Bonjour ! (à toute heure)", "Moien!", "Le plus courant, à toute heure")
L.carte(1, "Bonjour ! (le matin)", "Gudde Moien!", "Gudde = bon")
L.carte(1, "Bonjour ! (midi, après-midi)", "Gudde Mëtteg!", "Mëtteg = midi, après-midi")
L.carte(1, "Bonsoir !", "Gudden Owend!", "Owend = soir · Gudden devant voyelle", attention=N_GUDDEN)
L.carte(1, "Salut ! (entre amis)", "Salut!", "Informel")
L.carte(1, "Madame", "Madamm", "Bonjour Madamm!", attention="Madame = <b>Madamm</b>, avec deux m.")
L.carte(1, "Monsieur", "Här", "Bonjour Här!", attention="Monsieur = <b>Här</b> (mot germanique, pas français).")
L.carte(1, "Salut ! (familier)", "Hallo!", "Informel, comme Salut!", plus=True)

L.quiz(1, "Moien!", "Bonjour ! (à toute heure)", ["Au revoir !", "Bonne nuit !", "Bonsoir !"], TR)
L.quiz(1, "Gudde Moien!", "Bonjour ! (le matin)", ["Bonsoir !", "Bonjour ! (midi, après-midi)", "Bonne nuit !"], TR)
L.quiz(1, "Gudde Mëtteg!", "Bonjour ! (midi, après-midi)", ["Bonjour ! (le matin)", "Bonsoir !", "Bonne nuit !"], TR)
L.quiz(1, "Gudden Owend!", "Bonsoir !", ["Bonjour ! (le matin)", "Bonne nuit !", "Bonjour ! (midi, après-midi)"], TR,
       attention="<b>Gudden Owend!</b> = Bonsoir (pour saluer) ; Bonne nuit = Gutt Nuecht!")
L.quiz(1, "Salut!", "Salut !", ["Bonsoir !", "Au revoir !", "Bonne nuit !"], TR)
L.quiz(1, "Bonjour Madamm!", "Bonjour Madame !", ["Bonjour Monsieur !", "Bonsoir Madame !", "Au revoir Madame !"], TR)
L.quiz(1, "Bonjour Här!", "Bonjour Monsieur !", ["Bonjour Madame !", "Bonsoir Monsieur !", "Au revoir Monsieur !"], TR,
       attention="<b>Här</b> = Monsieur · <b>Madamm</b> = Madame.")
L.quiz(1, "Hallo!", "Salut !", ["Au revoir !", "Bonsoir !", "Merci !"], TR, plus=True)

L.trou(1, "Bonjour !", "", "Moien", "!", ["Moien", "Äddi", "Salut", "Schlecht"], "Moien = Bonjour, à toute heure")
L.trou(1, "Bonjour ! (le matin)", "Gudde", "Moien", "!", ["Moien", "Owend", "Mëtteg", "Nuecht"], "Gudde Moien = bonjour le matin")
L.trou(1, "Bonjour ! (midi)", "Gudde", "Mëtteg", "!", ["Mëtteg", "Moien", "Owend", "Nuecht"], "Gudde Mëtteg = bonjour à midi, l'après-midi")
L.trou(1, "Bonsoir !", "Gudden", "Owend", "!", ["Owend", "Moien", "Nuecht", "Mëtteg"], "Gudden Owend = Bonsoir")
L.trou(1, "Bonsoir !", "", "Gudden", "Owend!", ["Gudden", "Gudde", "Gutt"], "Gudden devant une voyelle (Owend)",
       attention=N_GUDDEN)
L.trou(1, "Bonjour Madame !", "Bonjour", "Madamm", "!", ["Madamm", "Madame", "Här", "Merci"], "Madamm = Madame en luxembourgeois",
       attention="Madame = <b>Madamm</b>, avec deux m.")
L.trou(1, "Bonsoir Monsieur Michels !", "Gudden Owend,", "Här", "Michels!", ["Här", "Madamm", "Salut", "Merci"], "Här = Monsieur")

L.ecrit(1, "Bonjour ! (à toute heure)", "Moien!")
L.ecrit(1, "Bonjour ! (le matin)", "Gudde Moien!")
L.ecrit(1, "Bonjour ! (midi)", "Gudde Mëtteg!")
L.ecrit(1, "Bonsoir !", "Gudden Owend!", attention=N_GUDDEN)
L.ecrit(1, "Bonjour Anna !", "Moien Anna!")
L.ecrit(1, "Bonsoir Madame Wagner.", "Gudden Owend Madamm Wagner.")
L.ecrit(1, "Bonsoir Monsieur Michels.", "Gudden Owend Här Michels.")
L.ecrit(1, "Salut !", "Salut!", plus=True)
L.ecrit(1, "Salut Pierre !", "Salut Pierre!", plus=True)
L.ecrit(1, "Salut Jean !", "Salut Jean!", plus=True)
L.ecrit(1, "Madame.", "Madamm.", plus=True)
L.ecrit(1, "Monsieur.", "Här.", plus=True)

# ═══ UNITÉ 2 : DEMANDER COMMENT ÇA VA ═══════════════════════════════════════
L.unite(2, "Demander comment ça va",
        "Entre amis : <b>dir</b> (tu) · Poliment : <b>Iech</b> (vous, avec majuscule)",
        "Wéi geet et dir? · Wéi geet et Iech? · Mir geet et gutt. An dir?",
        ["On répond avec <b>Mir</b> : Mir geet et gutt (litt. « à moi, ça va bien »).",
         "Poli = <b>Iech</b>, toujours avec une majuscule : Wéi geet et <b>Iech</b>?"],
        phrase=["Wéi geet et dir? – Mir geet et gutt. An dir?", "Comment vas-tu ? – Je vais bien. Et toi ?"],
        phrases=[["Wéi geet et Iech?", "Comment allez-vous ?"], ["Ganz gutt, merci! An Iech?", "Très bien, merci ! Et vous ?"]])

N_IECH = "Poli (vous) = <b>Iech</b>, avec une majuscule · tu = dir."
N_DIR = "Tu = <b>dir</b> (amis, famille) · vous = Iech."
L.carte(2, "Comment vas-tu ?", "Wéi geet et dir?", "Informel · dir = toi", attention=N_DIR)
L.carte(2, "Comment allez-vous ?", "Wéi geet et Iech?", "Formel · Iech avec majuscule", attention=N_IECH)
L.carte(2, "Je vais bien.", "Mir geet et gutt.", "Litt. « à moi, ça va bien »",
        attention="On répond avec <b>Mir</b> : Mir geet et gutt.")
L.carte(2, "Et toi ?", "An dir?", "An = et")
L.carte(2, "Et vous ?", "An Iech?", "Formel", attention=N_IECH)
L.carte(2, "Très bien !", "Ganz gutt!", "ganz = très")
L.carte(2, "Ça va.", "Et geet.", "Réponse neutre")
L.carte(2, "Mal.", "Schlecht.", "Aussi : net gutt")
L.carte(2, "Tip top !", "Tipptopp!", "Très familier", plus=True)
L.carte(2, "Pas terrible.", "Net immens.", "net = pas", plus=True)
L.carte(2, "Très mal.", "Ganz schlecht.", "ganz = très", plus=True)
L.carte(2, "Pas du tout bien.", "Guer net gutt.", "guer = pas du tout", plus=True)
L.carte(2, "Tout va bien ! (tout est en ordre)", "Alles an der Rei!", "Réponse positive très fréquente", plus=True)

L.quiz(2, "Wéi geet et dir?", "Comment vas-tu ?", ["Comment allez-vous ?", "Comment t'appelles-tu ?", "Et toi ?"], TR, attention=N_DIR)
L.quiz(2, "Wéi geet et Iech?", "Comment allez-vous ?", ["Comment vas-tu ?", "Comment vous appelez-vous ?", "Et vous ?"], TR, attention=N_IECH)
L.quiz(2, "Mir geet et gutt.", "Je vais bien.", ["Je vais mal.", "Ça va.", "Très bien !"], TR)
L.quiz(2, "Ganz gutt!", "Très bien !", ["Mal.", "Ça va.", "Très mal."], TR)
L.quiz(2, "Et geet.", "Ça va.", ["Très bien !", "Très mal.", "Je vais bien."], TR)
L.quiz(2, "Schlecht.", "Mal.", ["Très bien !", "Ça va.", "Pas terrible."], TR)
L.quiz(2, "An dir?", "Et toi ?", ["Et vous ?", "Comment vas-tu ?", "Moi aussi."], TR, attention=N_DIR)
L.quiz(2, "An Iech?", "Et vous ?", ["Et toi ?", "Comment allez-vous ?", "Moi aussi."], TR, attention=N_IECH)
L.quiz(2, "Tipptopp!", "Tip top !", ["Très mal.", "Pas terrible.", "Ça va."], TR, plus=True)
L.quiz(2, "Net immens.", "Pas terrible.", ["Très mal.", "Ça va.", "Pas du tout bien."], TR, plus=True)
L.quiz(2, "Ganz schlecht.", "Très mal.", ["Mal.", "Ça va.", "Très bien !"], TR, plus=True)
L.quiz(2, "Guer net gutt.", "Pas du tout bien.", ["Très bien !", "Ça va.", "Pas terrible."], TR, plus=True)
L.quiz(2, "Alles an der Rei!", "Tout va bien !", ["Très mal.", "Pas terrible.", "Bonne journée !"], TR, plus=True)

L.trou(2, "Comment vas-tu ?", "Wéi", "geet", "et dir?", ["geet", "gees", "ass", "huet"], "Wéi geet et dir? = Comment vas-tu ?")
L.trou(2, "Comment allez-vous ? (poli)", "Wéi geet et", "Iech", "?", ["Iech", "dir", "Dir", "Mir"], "Iech = vous poli, avec majuscule",
       attention=N_IECH)
L.trou(2, "Je vais bien.", "", "Mir", "geet et gutt.", ["Mir", "Ech", "Dir", "Iech"], "On répond avec Mir : Mir geet et gutt",
       attention="On répond avec <b>Mir</b> : Mir geet et gutt.")
L.trou(2, "Je vais bien.", "Mir geet et", "gutt", ".", ["gutt", "schlecht", "ganz", "net"], "Mir geet et gutt = Je vais bien")
L.trou(2, "Très bien !", "Ganz", "gutt", "!", ["gutt", "schlecht", "geet", "immens"], "Ganz gutt = Très bien")
L.trou(2, "Ça va.", "Et", "geet", ".", ["geet", "gutt", "schlecht", "ass"], "Et geet = Ça va")
L.trou(2, "Et toi ?", "An", "dir", "?", ["dir", "Iech", "Mir", "du"], "An dir? = Et toi ? · An Iech? = Et vous ?", attention=N_DIR)
L.trou(2, "Et vous ? (poli)", "An", "Iech", "?", ["Iech", "dir", "Dir", "Mir"], "Poli = Iech", attention=N_IECH)
L.trou(2, "Pas terrible.", "Net", "immens", ".", ["immens", "gutt", "schlecht", "geet"], "Net immens = Pas terrible", plus=True)
L.trou(2, "Très mal.", "Ganz", "schlecht", ".", ["schlecht", "gutt", "geet", "immens"], "Ganz schlecht = Très mal", plus=True)
L.trou(2, "Tout va bien !", "Alles an der", "Rei", "!", ["Rei", "Nuecht", "Moien", "Owend"], "Alles an der Rei = tout va bien", plus=True)

L.ecrit(2, "Comment vas-tu ?", "Wéi geet et dir?", attention=N_DIR)
L.ecrit(2, "Comment allez-vous ?", "Wéi geet et Iech?", attention=N_IECH)
L.ecrit(2, "Je vais bien.", "Mir geet et gutt.")
L.ecrit(2, "Je vais bien. Et toi ?", "Mir geet et gutt. An dir?")
L.ecrit(2, "Très bien !", "Ganz gutt!")
L.ecrit(2, "Ça va.", "Et geet.")
L.ecrit(2, "Et vous ?", "An Iech?", attention=N_IECH)
L.ecrit(2, "Très bien, merci ! Et vous ?", "Ganz gutt, merci! An Iech?")
L.ecrit(2, "Mal.", "Schlecht.", plus=True)
L.ecrit(2, "Tip top !", "Tipptopp!", plus=True)
L.ecrit(2, "Pas terrible.", "Net immens.", plus=True)
L.ecrit(2, "Très mal.", "Ganz schlecht.", plus=True)
L.ecrit(2, "Pas du tout bien.", "Guer net gutt.", plus=True)
L.ecrit(2, "Tout va bien ! (tout est en ordre)", "Alles an der Rei!", plus=True)

# ═══ UNITÉ 3 : SE PRÉSENTER ═════════════════════════════════════════════════
L.unite(3, "Se présenter",
        "<b>Ech heeschen …</b> = Je m'appelle … · <b>Mäin Numm ass …</b> = Mon nom est …",
        "Wéi heeschs du? (tu) · Wéi heescht Dir? (vous) · Et freet mech. – Mech och.",
        ["Le n de <b>heeschen</b> tombe devant la plupart des consonnes : Ech <b>heesche</b> Paul, mais Ech <b>heeschen</b> Anna.",
         "Poli : <b>Dir</b> et <b>Ären</b> prennent une majuscule."],
        phrase=["Wéi heescht Dir? – Ech heesche Paul. Et freet mech.", "Comment vous appelez-vous ? – Je m'appelle Paul. Enchanté."],
        phrases=[["Mäin Numm ass Bertha.", "Mon nom est Bertha."],
                 ["Wéi ass Ären Numm, wann ech gelift?", "Quel est votre nom, s'il vous plaît ?"]])

N_HEESCHE = "Le n tombe devant P, M, B… : Ech <b>heesche</b> Paul · il reste devant une voyelle : Ech heeschen Anna."
L.carte(3, "Comment vous appelez-vous ?", "Wéi heescht Dir?", "Formel · Dir avec majuscule")
L.carte(3, "Comment t'appelles-tu ?", "Wéi heeschs du?", "Informel")
L.carte(3, "Je m'appelle Paul.", "Ech heesche Paul.", "heeschen = s'appeler", attention=N_HEESCHE)
L.carte(3, "Mon nom est …", "Mäin Numm ass", "Mäin Numm ass Bertha.")
L.carte(3, "Quel est votre nom ?", "Wéi ass Ären Numm?", "Formel · Ären = votre")
L.carte(3, "Enchanté.", "Et freet mech.", "Litt. « cela me fait plaisir »")
L.carte(3, "Moi aussi.", "Mech och.", "Réponse à Et freet mech.")
L.carte(3, "S'il vous plaît", "Wann ech gelift", "Abrégé à l'écrit : wgl.", plus=True)
L.carte(3, "Excusez-moi !", "Entschëllegt!", "Pour s'excuser ou interpeller", plus=True)

L.quiz(3, "Wéi heescht Dir?", "Comment vous appelez-vous ?", ["Comment t'appelles-tu ?", "Comment allez-vous ?", "Quel est votre nom ?"], TR)
L.quiz(3, "Wéi heeschs du?", "Comment t'appelles-tu ?", ["Comment vas-tu ?", "Comment vous appelez-vous ?", "Quel est votre nom ?"], TR)
L.quiz(3, "Ech heesche Mauro.", "Je m'appelle Mauro.", ["Mon nom est Mauro.", "Je vais bien.", "Je suis Mauro."], TR)
L.quiz(3, "Mäin Numm ass Mauro.", "Mon nom est Mauro.", ["Je m'appelle Mauro.", "Quel est votre nom ?", "Je suis Mauro."], TR)
L.quiz(3, "Wéi ass Ären Numm?", "Quel est votre nom ?", ["Comment allez-vous ?", "Comment t'appelles-tu ?", "Mon nom est …"], TR)
L.quiz(3, "Et freet mech.", "Enchanté.", ["Merci.", "Au revoir.", "Moi aussi."], TR)
L.quiz(3, "Mech och.", "Moi aussi.", ["Enchanté.", "Merci.", "Et toi ?"], TR)
L.quiz(3, "Wann ech gelift", "S'il vous plaît", ["Merci", "Au revoir", "Enchanté"], TR, plus=True)
L.quiz(3, "Entschëllegt!", "Excusez-moi !", ["Merci !", "Enchanté.", "S'il vous plaît"], TR, plus=True)

L.trou(3, "Je m'appelle Bertha.", "Ech", "heesche", "Bertha.", ["heesche", "heeschen", "heeschs", "heescht"],
       "Le n tombe devant B : Ech heesche Bertha", attention=N_HEESCHE)
L.trou(3, "Je m'appelle Anna.", "Ech", "heeschen", "Anna.", ["heeschen", "heesche", "heeschs", "heescht"],
       "Le n reste devant une voyelle : Ech heeschen Anna", attention=N_HEESCHE)
L.trou(3, "Comment t'appelles-tu ?", "Wéi", "heeschs", "du?", ["heeschs", "heescht", "heesche", "geet"], "du heeschs = tu t'appelles")
L.trou(3, "Comment vous appelez-vous ?", "Wéi", "heescht", "Dir?", ["heescht", "heeschs", "heesche", "geet"], "Dir heescht = vous vous appelez")
L.trou(3, "Quel est votre nom ?", "Wéi ass", "Ären", "Numm?", ["Ären", "Mäin", "Iech", "Dir"], "Ären = votre (poli, majuscule)")
L.trou(3, "Mon nom est Daniel.", "", "Mäin", "Numm ass Daniel.", ["Mäin", "Ären", "Mir", "Ech"], "Mäin Numm ass … = Mon nom est …")
L.trou(3, "Enchanté.", "Et", "freet", "mech.", ["freet", "geet", "ass", "heescht"], "Et freet mech = Enchanté")
L.trou(3, "Moi aussi.", "Mech", "och", ".", ["och", "gutt", "dir", "merci"], "och = aussi")
L.trou(3, "Quel est votre nom, s'il vous plaît ?", "Wéi ass Ären Numm, wann ech", "gelift", "?",
       ["gelift", "geet", "heeschen", "freet"], "wann ech gelift = s'il vous plaît", plus=True)

L.ecrit(3, "Comment vous appelez-vous ?", "Wéi heescht Dir?")
L.ecrit(3, "Comment t'appelles-tu ?", "Wéi heeschs du?")
L.ecrit(3, "Je m'appelle Mauro.", "Ech heesche Mauro.", attention=N_HEESCHE)
L.ecrit(3, "Je m'appelle Anna.", "Ech heeschen Anna.", attention=N_HEESCHE)
L.ecrit(3, "Mon nom est Bertha.", "Mäin Numm ass Bertha.")
L.ecrit(3, "Enchanté.", "Et freet mech.")
L.ecrit(3, "Moi aussi.", "Mech och.")
L.ecrit(3, "Je m'appelle Paul. Enchanté.", "Ech heesche Paul. Et freet mech.", attention=N_HEESCHE)
L.ecrit(3, "Mon nom est Daniel.", "Mäin Numm ass Daniel.", plus=True)
L.ecrit(3, "Mon nom est Fabio.", "Mäin Numm ass Fabio.", plus=True)
L.ecrit(3, "Quel est votre nom, s'il vous plaît ?", "Wéi ass Ären Numm, wann ech gelift?", plus=True)

# ═══ UNITÉ 4 : PRENDRE CONGÉ ════════════════════════════════════════════════
L.unite(4, "Prendre congé",
        "<b>Äddi!</b> = au revoir · on souhaite <b>Schéinen Dag!</b> / <b>Schéinen Owend!</b> · on répond <b>Merci, gläichfalls!</b>",
        "Äddi, schéinen Dag! · Gutt Nuecht! (avant de dormir)",
        ["<b>Gutt Nuecht!</b> se dit avant de dormir, jamais pour saluer le soir (= Gudden Owend!).",
         "À un souhait, on répond <b>Merci, gläichfalls!</b> (merci, pareillement)."],
        phrase=["Äddi, schéinen Owend! – Merci, gläichfalls!", "Au revoir, bonne soirée ! – Merci, pareillement !"],
        phrases=[["Äddi, schéinen Dag!", "Au revoir, bonne journée !"], ["Gutt Nuecht!", "Bonne nuit !"]])

N_NUECHT = "<b>Gutt Nuecht!</b> = bonne nuit, avant de dormir · pour saluer le soir : Gudden Owend!"
L.carte(4, "Au revoir ! (courant)", "Äddi!", "Le plus courant")
L.carte(4, "Au revoir ! (familier)", "Awar!", "Familier · aussi Awuer!")
L.carte(4, "Bonne journée !", "Schéinen Dag!", "En partant dans la journée")
L.carte(4, "Bonne soirée !", "Schéinen Owend!", "En partant le soir")
L.carte(4, "Bonne nuit !", "Gutt Nuecht!", "Avant d'aller dormir", attention=N_NUECHT)
L.carte(4, "Merci !", "Merci!", "Comme en français")
L.carte(4, "Merci pareillement !", "Merci gläichfalls!", "Réponse à un souhait")
L.carte(4, "Dors bien !", "Schlof gutt!", "Entre proches, avant de dormir", plus=True)

L.quiz(4, "Äddi!", "Au revoir ! (courant)", ["Merci !", "Bonjour !", "Bonne nuit !"], TR)
L.quiz(4, "Awar!", "Au revoir ! (familier)", ["Bonjour !", "Merci !", "Bonne nuit !"], TR)
L.quiz(4, "Schéinen Dag!", "Bonne journée !", ["Bonne soirée !", "Bonne nuit !", "Bonjour !"], TR)
L.quiz(4, "Schéinen Owend!", "Bonne soirée !", ["Bonne journée !", "Bonsoir !", "Bonne nuit !"], TR,
       attention="<b>Schéinen Owend!</b> = bonne soirée (en partant) · Gudden Owend! = bonsoir (en arrivant).")
L.quiz(4, "Gutt Nuecht!", "Bonne nuit !", ["Bonsoir !", "Dors bien !", "Bonne soirée !"], TR, attention=N_NUECHT)
L.quiz(4, "Merci!", "Merci !", ["Bonjour !", "Au revoir !", "S'il vous plaît"], TR)
L.quiz(4, "Merci gläichfalls!", "Merci pareillement !", ["Merci beaucoup !", "S'il vous plaît !", "Bonne journée !"], TR)
L.quiz(4, "Schlof gutt!", "Dors bien !", ["Bonne nuit !", "Bonne soirée !", "Au revoir !"], TR, plus=True)

L.trou(4, "Au revoir !", "", "Äddi", "!", ["Äddi", "Moien", "Salut", "Merci"], "Äddi = Au revoir · familier : Awar")
L.trou(4, "Bonne journée !", "Schéinen", "Dag", "!", ["Dag", "Owend", "Nuecht", "Moien"], "Schéinen Dag = Bonne journée")
L.trou(4, "Bonne soirée !", "Schéinen", "Owend", "!", ["Owend", "Dag", "Nuecht", "Mëtteg"], "Schéinen Owend = Bonne soirée")
L.trou(4, "Bonne nuit !", "Gutt", "Nuecht", "!", ["Nuecht", "Owend", "Moien", "Dag"], "Gutt Nuecht = Bonne nuit", attention=N_NUECHT)
L.trou(4, "Au revoir, bonne journée !", "Äddi,", "schéinen", "Dag!", ["schéinen", "gutt", "gudde", "ganz"], "Schéinen Dag = Bonne journée")
L.trou(4, "Merci pareillement !", "Merci", "gläichfalls", "!", ["gläichfalls", "gutt", "och", "immens"], "Réponse à un souhait")
L.trou(4, "Dors bien !", "Schlof", "gutt", "!", ["gutt", "ganz", "schlecht", "net"], "Schlof gutt = Dors bien", plus=True)

L.ecrit(4, "Au revoir ! (courant)", "Äddi!")
L.ecrit(4, "Au revoir ! (familier)", "Awar!")
L.ecrit(4, "Bonne journée !", "Schéinen Dag!")
L.ecrit(4, "Bonne soirée !", "Schéinen Owend!")
L.ecrit(4, "Bonne nuit !", "Gutt Nuecht!", attention=N_NUECHT)
L.ecrit(4, "Merci !", "Merci!")
L.ecrit(4, "Merci pareillement !", "Merci gläichfalls!")
L.ecrit(4, "Merci, pareillement ! Au revoir !", "Merci, gläichfalls! Äddi!")
L.ecrit(4, "Dors bien !", "Schlof gutt!", plus=True)
L.ecrit(4, "Merci pour l'invitation !", "Merci fir d'Invitatioun!", plus=True)

# ═══ COURS ══════════════════════════════════════════════════════════════════
L.bloc({'type': 'texte', 'contenu': "Cette leçon apprend à saluer, demander comment ça va, se présenter et prendre congé. "
        "Le point clé : distinguer le registre <b>informel</b> (amis, famille : <b>dir</b>, <b>du</b>) du registre "
        "<b>formel</b> (inconnus, travail : <b>Iech</b>, <b>Dir</b>)."})
L.bloc({'type': 'tableau', 'titre': "Saluer selon le moment", 'entetes': ["Moment", "Salutation"],
        'lignes': [["À toute heure", "Moien!"], ["Le matin", "Gudde Moien!"], ["Midi et après-midi", "Gudde Mëtteg!"], ["Le soir", "Gudden Owend!"]]}, 1)
L.bloc({'type': 'callout', 'variant': 'astuce', 'titre': "Gudde ou Gudden ?",
        'lignes': ["Le n final tombe devant la plupart des consonnes : <b>Gudde</b> Moien, <b>Gudde</b> Mëtteg.",
                   "Il reste devant une voyelle : <b>Gudden</b> Owend. C'est la même règle que e / en (leçon 2)."]}, 1)
L.bloc({'type': 'vocab', 'titre': "Saluer quelqu'un", 'items': [["Salut!", "Salut ! (entre amis)"], ["Hallo!", "Salut !"],
        ["Madamm", "Madame"], ["Här", "Monsieur"], ["Bonjour Madamm!", "Bonjour Madame !"], ["Gudden Owend, Här Michels!", "Bonsoir, Monsieur Michels !"]]}, 1)
L.bloc({'type': 'callout', 'variant': 'info', 'titre': "Des mots venus du français",
        'lignes': ["<b>Merci</b>, <b>Salut</b>, <b>Bonjour</b> et <b>Madamm</b> viennent du français.",
                   "Mais <b>Här</b> (Monsieur) est d'origine germanique."]}, 1, plus=True)
L.bloc({'type': 'callout', 'variant': 'retenir', 'titre': "Informel ou formel ?",
        'lignes': ["Amis, famille : <b>dir</b> → Wéi geet et dir? · An dir?",
                   "Inconnus, travail : <b>Iech</b> → Wéi geet et Iech? · An Iech?",
                   "<b>Iech</b>, <b>Dir</b>, <b>Ären</b> prennent toujours une <b>majuscule</b>."]}, 2)
L.bloc({'type': 'tableau', 'titre': "Comment ça va ? L'échelle", 'entetes': ["Sens", "Luxembourgeois"],
        'lignes': [["Très bien", "Ganz gutt! · Tipptopp!"], ["Bien", "Mir geet et gutt."], ["Ça va", "Et geet."],
                   ["Pas terrible", "Net immens."], ["Mal", "Schlecht."], ["Très mal", "Ganz schlecht. · Guer net gutt."]]}, 2)
L.bloc({'type': 'vocab', 'titre': "Demander et répondre", 'items': [["Wéi geet et dir?", "Comment vas-tu ?"], ["Wéi geet et Iech?", "Comment allez-vous ?"],
        ["Mir geet et gutt.", "Je vais bien."], ["An dir?", "Et toi ?"], ["An Iech?", "Et vous ?"], ["Ganz gutt!", "Très bien !"],
        ["Et geet.", "Ça va."], ["Schlecht.", "Mal."]]}, 2)
L.bloc({'type': 'vocab', 'titre': "Plus de réponses", 'items': [["Tipptopp!", "Tip top !"], ["Net immens.", "Pas terrible."],
        ["Ganz schlecht.", "Très mal."], ["Guer net gutt.", "Pas du tout bien."], ["Alles an der Rei!", "Tout va bien ! (tout est en ordre)"]]}, 2, plus=True)
L.bloc({'type': 'callout', 'variant': 'info', 'titre': "Se présenter : deux structures",
        'lignes': ["<b>Mäin Numm ass …</b> = Mon nom est … (le plus simple).",
                   "<b>Ech heeschen …</b> = Je m'appelle … : ech <b>heeschen</b>, du <b>heeschs</b>, Dir <b>heescht</b>.",
                   "Demander poliment : <b>Wéi ass Ären Numm, wann ech gelift?</b> (à l'écrit : wgl.)"]}, 3)
L.bloc({'type': 'callout', 'variant': 'attention', 'titre': "Ech heesche ou Ech heeschen ?",
        'lignes': ["Devant la plupart des consonnes, le n tombe : <b>Ech heesche Paul.</b>",
                   "Devant une voyelle (et n, d, t, z, h), il reste : <b>Ech heeschen Anna.</b>"]}, 3)
L.bloc({'type': 'vocab', 'titre': "Se présenter et répondre", 'items': [["Wéi heescht Dir?", "Comment vous appelez-vous ?"],
        ["Wéi heeschs du?", "Comment t'appelles-tu ?"], ["Ech heesche Paul.", "Je m'appelle Paul."], ["Mäin Numm ass Bertha.", "Mon nom est Bertha."],
        ["Wéi ass Ären Numm?", "Quel est votre nom ?"], ["Et freet mech.", "Enchanté."], ["Mech och.", "Moi aussi."]]}, 3)
L.bloc({'type': 'vocab', 'titre': "Politesse", 'items': [["Wann ech gelift", "S'il vous plaît"], ["Entschëllegt!", "Excusez-moi !"]]}, 3, plus=True)
L.bloc({'type': 'tableau', 'titre': "Prendre congé", 'entetes': ["Luxembourgeois", "Français", "Quand ?"],
        'lignes': [["Äddi!", "Au revoir", "Le plus courant"], ["Awar! / Awuer!", "Au revoir", "Familier"],
                   ["Schéinen Dag!", "Bonne journée", "En partant dans la journée"], ["Schéinen Owend!", "Bonne soirée", "En partant le soir"],
                   ["Gutt Nuecht!", "Bonne nuit", "Avant d'aller dormir"]]}, 4)
L.bloc({'type': 'callout', 'variant': 'attention', 'titre': "À ne pas confondre",
        'lignes': ["<b>Gudden Owend!</b> = bonsoir, pour <b>saluer</b> en arrivant.",
                   "<b>Schéinen Owend!</b> = bonne soirée, en <b>partant</b>.",
                   "<b>Gutt Nuecht!</b> = bonne nuit, seulement <b>avant de dormir</b>."]}, 4)
L.bloc({'type': 'vocab', 'titre': "Merci", 'items': [["Merci!", "Merci !"], ["Merci gläichfalls!", "Merci pareillement !"],
        ["Merci, gläichfalls! Äddi!", "Merci, pareillement ! Au revoir !"]]}, 4)
L.bloc({'type': 'vocab', 'titre': "Entre proches", 'items': [["Schlof gutt!", "Dors bien !"], ["Merci fir d'Invitatioun!", "Merci pour l'invitation !"]]}, 4, plus=True)
L.bloc({'type': 'dialogue', 'titre': "Premier cours de luxembourgeois",
        'echanges': [[x['lu'], x['fr']] for x in L.scene]}, 0)

L.ecrire()
