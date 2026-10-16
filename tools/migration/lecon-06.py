"""Leçon 6 — De Plural vun den Objeten (le pluriel) : migration v1 → v2.
Fil : le déménagement du bureau, dire ce qu'il y a dans les cartons."""
from fabrique import Lecon

L = Lecon('A1.1/lecon-06.json')
FO = 'CHOISIS LA BONNE FORME'

L.instructions = {
    'flashcards': "Mot caché : écris « deux … » en luxembourgeois : zwee ou zwou, puis le nom au pluriel.",
    'quiz': "Lis « Deux … » en français et choisis la bonne forme luxembourgeoise (zwee / zwou et le bon pluriel).",
    'trous': "Complète avec zwee ou zwou selon le genre du nom, ou avec la bonne forme du pluriel.",
    'ecriture': "Écris en luxembourgeois « deux … » et les phrases de la mission (Dat sinn …). Respecte zwee / zwou et la forme du pluriel."
}

L.fil("Le déménagement du bureau",
      "Ton équipe déménage. Une collègue ouvre les cartons et te demande ce qu'il y a dedans : tu réponds en comptant les objets.",
      "dire « ce sont deux … » avec zwee ou zwou et le bon pluriel.")

L.replique(1, "La collègue", "Moien! Wat ass an der Këscht?", "Bonjour ! Qu'y a-t-il dans le carton ?")
L.replique(1, 'toi', "Dat sinn zwou Fläschen an zwee Computeren.", "Ce sont deux bouteilles et deux ordinateurs.",
           "Fläsch (féminin) → <b>zwou</b> · Computer (masculin) → <b>zwee</b>.")
L.replique(2, "La collègue", "An dat hei?", "Et ça ?")
L.replique(2, 'toi', "Dat sinn zwee Bicher an zwee Hefter.", "Ce sont deux livres et deux cahiers.",
           "Buch → <b>Bicher</b> · Heft → <b>Hefter</b> : pluriel en -er.")
L.replique(3, "La collègue", "An dat do?", "Et ça, là-bas ?")
L.replique(3, 'toi', "Dat sinn zwee Still.", "Ce sont deux chaises.", "Stull → <b>Still</b> : seule la voyelle change.")
L.replique(3, "La collègue", "Super, merci!", "Super, merci !")

N_ZWOU = "C'est le genre du nom <b>au singulier</b> qui décide : féminin → <b>zwou</b>, masculin et neutre → <b>zwee</b>."

# Une ligne par mot : (unité, plus, français, deux, pluriel, singulier, genre, distracteur de pluriel)
MOTS = [
    # Unité 1 : pluriel en -(e)n
    (1, False, "bouteilles", "zwou", "Fläschen", "eng Fläsch", "f", "Fläsch"),
    (1, False, "montres", "zwou", "Aueren", "eng Auer", "f", "Auer"),
    (1, False, "sacs", "zwou", "Mappen", "eng Mapp", "f", "Mapp"),
    (1, False, "ordinateurs", "zwee", "Computeren", "e Computer", "m", "Computer"),
    (1, False, "téléphones", "zwee", "Telefonen", "en Telefon", "m", "Telefon"),
    (1, False, "bus", "zwee", "Bussen", "e Bus", "m", "Bus"),
    (1, False, "vélos", "zwee", "Vëloen", "e Vëlo", "m", "Vëlo"),
    (1, False, "avions", "zwee", "Fligeren", "e Fliger", "m", "Fliger"),
    (1, True, "enveloppes", "zwou", "Enveloppen", "eng Enveloppe", "f", "Enveloppe"),
    (1, True, "fauteuils", "zwou", "Fotellen", "eng Fotell", "f", "Fotell"),
    (1, True, "plantes", "zwou", "Planzen", "eng Planz", "f", "Planz"),
    (1, True, "poches", "zwou", "Poschen", "eng Posch", "f", "Posch"),
    (1, True, "CD", "zwou", "CDen", "eng CD", "f", "CD"),
    (1, True, "cartes de crédit", "zwou", "Kreditkaarten", "eng Kreditkaart", "f", "Kreditkaart"),
    (1, True, "tasses", "zwou", "Tasen", "eng Taass", "f", "Taass"),
    (1, True, "murs", "zwou", "Maueren", "eng Mauer", "f", "Mauer"),
    (1, True, "réveils", "zwee", "Weckeren", "e Wecker", "m", "Wecker"),
    (1, True, "tampons", "zwee", "Stempelen", "e Stempel", "m", "Stempel"),
    (1, True, "classeurs", "zwee", "Classeuren", "e Classeur", "m", "Classeur"),
    (1, True, "imprimantes", "zwee", "Dréckeren", "en Drécker", "m", "Drécker"),
    # Unité 2 : pluriel en -er, souvent avec changement de voyelle
    (2, False, "livres", "zwee", "Bicher", "e Buch", "n", "Buch"),
    (2, False, "cahiers", "zwee", "Hefter", "en Heft", "n", "Heft"),
    (2, False, "feuilles", "zwee", "Blieder", "e Blat", "n", "Blat"),
    (2, False, "maisons", "zwee", "Haiser", "en Haus", "n", "Haus"),
    (2, False, "verres", "zwee", "Glieser", "e Glas", "n", "Glas"),
    (2, False, "images", "zwee", "Biller", "e Bild", "n", "Bild"),
    (2, False, "stylos", "zwee", "Stëfter", "e Stëft", "m", "Stëft"),
    (2, False, "tables", "zwee", "Dëscher", "en Dësch", "m", "Dësch"),
    (2, True, "étagères", "zwee", "Regaler", "e Regal", "n", "Regal"),
    (2, True, "lunettes", "zwee", "Brëller", "e Brëll", "m", "Brëll"),
    (2, True, "bâtiments", "zwee", "Gebaier", "e Gebai", "n", "Gebai"),
    (2, True, "carnets", "zwee", "Bichelcher", "e Bichelchen", "n", "Bichelchen"),
    # Unité 3 : seule la voyelle change
    (3, False, "chaises", "zwee", "Still", "e Stull", "m", "Stull"),
    (3, False, "souris", "zwou", "Mais", "eng Maus", "f", "Maus"),
    (3, False, "balles", "zwee", "Bäll", "e Ball", "m", "Ball"),
    (3, False, "trains", "zwee", "Zich", "en Zuch", "m", "Zuch"),
]
GENRE = {'m': 'masculin', 'f': 'féminin', 'n': 'neutre'}


def ajouter_mot(u, plus, fr, deux, pluriel, singulier, genre, faux):
    autre = 'zwee' if deux == 'zwou' else 'zwou'
    note = "Pluriel de " + singulier + " (" + GENRE[genre] + ")"
    L.carte(u, "deux " + fr, deux + " " + pluriel, note, plus=plus, attention=N_ZWOU if deux == 'zwou' else None)
    L.quiz(u, "Deux " + fr, deux + " " + pluriel, [deux + " " + faux, autre + " " + pluriel, autre + " " + faux], FO, plus=plus,
           attention=N_ZWOU if deux == 'zwou' else None)


# ═══ UNITÉ 1 ════════════════════════════════════════════════════════════════
L.unite(1, "zwee ou zwou, pluriel en -(e)n",
        "Deux : <b>zwee</b> (masculin, neutre) · <b>zwou</b> (féminin) · Ce sont : <b>Dat sinn</b> … · Le plus courant : le nom prend <b>-(e)n</b>",
        "zwou Fläschen · zwou Aueren · zwee Computeren · zwee Bussen",
        ["C'est le genre <b>luxembourgeois</b> du singulier qui décide : eng Mapp → <b>zwou</b> Mappen (« un sac » est masculin en français).",
         "Le nom change aussi : e Bus → zwee <b>Bussen</b>, e Vëlo → zwee <b>Vëloen</b>."],
        phrase=["Dat sinn zwou Fläschen an zwee Computeren.", "Ce sont deux bouteilles et deux ordinateurs."],
        phrases=[["Dat sinn zwou Aueren.", "Ce sont deux montres."], ["Dat sinn zwee Telefonen.", "Ce sont deux téléphones."]])

for m in MOTS:
    if m[0] == 1:
        ajouter_mot(*m)
L.carte(1, "ce sont", "Dat sinn", "Dat ass … (un) · Dat sinn … (plusieurs)")

L.trou(1, "Deux montres", "", "zwou", "Aueren", ["zwee", "zwou"], "Auer (f.) → zwou", attention=N_ZWOU)
L.trou(1, "Deux bouteilles", "", "zwou", "Fläschen", ["zwee", "zwou"], "Fläsch (f.) → zwou", attention=N_ZWOU)
L.trou(1, "Deux ordinateurs", "", "zwee", "Computeren", ["zwee", "zwou"], "Computer (m.) → zwee")
L.trou(1, "Deux sacs", "", "zwou", "Mappen", ["zwee", "zwou"], "Mapp (f.) → zwou, même si « sac » est masculin", attention=N_ZWOU)
L.trou(1, "Deux vélos", "", "zwee", "Vëloen", ["zwee", "zwou"], "Vëlo (m.) → zwee")
L.trou(1, "Deux bus", "zwee", "Bussen", "", ["Bussen", "Bus", "Busser"], "e Bus → zwee Bussen")
L.trou(1, "Deux téléphones", "zwee", "Telefonen", "", ["Telefonen", "Telefon", "Telefoner"], "en Telefon → zwee Telefonen")
L.trou(1, "Ce sont deux bouteilles.", "Dat", "sinn", "zwou Fläschen.", ["sinn", "ass", "geet"], "Dat sinn = ce sont (plusieurs)")
L.trou(1, "Deux enveloppes", "", "zwou", "Enveloppen", ["zwee", "zwou"], "Enveloppe (f.) → zwou", plus=True, attention=N_ZWOU)
L.trou(1, "Deux réveils", "", "zwee", "Weckeren", ["zwee", "zwou"], "Wecker (m.) → zwee", plus=True)
L.trou(1, "Deux cartes de crédit", "", "zwou", "Kreditkaarten", ["zwee", "zwou"], "Kreditkaart (f.) → zwou", plus=True, attention=N_ZWOU)
L.trou(1, "Deux fauteuils", "", "zwou", "Fotellen", ["zwee", "zwou"], "Fotell (f.) → zwou", plus=True, attention=N_ZWOU)

L.ecrit(1, "Deux bouteilles", "zwou Fläschen", attention=N_ZWOU)
L.ecrit(1, "Deux montres", "zwou Aueren", attention=N_ZWOU)
L.ecrit(1, "Deux sacs", "zwou Mappen", attention=N_ZWOU)
L.ecrit(1, "Deux ordinateurs", "zwee Computeren")
L.ecrit(1, "Deux téléphones", "zwee Telefonen")
L.ecrit(1, "Deux vélos", "zwee Vëloen")
L.ecrit(1, "Ce sont deux bouteilles et deux ordinateurs.", "Dat sinn zwou Fläschen an zwee Computeren.", attention=N_ZWOU)
for fr, lu in [("Deux avions", "zwee Fligeren"), ("Deux bus", "zwee Bussen"), ("Deux classeurs", "zwee Classeuren"),
               ("Deux imprimantes", "zwee Dréckeren"), ("Deux tasses", "zwou Tasen"), ("Deux enveloppes", "zwou Enveloppen"),
               ("Deux cartes de crédit", "zwou Kreditkaarten"), ("Deux fauteuils", "zwou Fotellen"), ("Deux plantes", "zwou Planzen"),
               ("Deux réveils", "zwee Weckeren"), ("Deux murs", "zwou Maueren"), ("Deux tampons", "zwee Stempelen"), ("Deux CD", "zwou CDen")]:
    L.ecrit(1, fr, lu, plus=True)

# ═══ UNITÉ 2 ════════════════════════════════════════════════════════════════
L.unite(2, "Pluriel en -er",
        "Beaucoup de noms prennent <b>-er</b>, souvent avec un changement de voyelle : e Buch → <b>Bicher</b>, e Blat → <b>Blieder</b>",
        "zwee Bicher · zwee Hefter · zwee Haiser · zwee Dëscher",
        ["La voyelle change souvent : Buch → B<b>i</b>cher, Haus → H<b>ai</b>ser, Glas → Gl<b>ie</b>ser.",
         "Le pluriel ne se devine pas toujours : apprends-le <b>avec</b> le singulier."],
        phrase=["Dat sinn zwee Bicher an zwee Hefter.", "Ce sont deux livres et deux cahiers."],
        phrases=[["Dat sinn zwee Haiser.", "Ce sont deux maisons."], ["Dat sinn zwee Stëfter.", "Ce sont deux stylos."]])

N_ER = "Pluriel en <b>-er</b>, avec souvent un changement de voyelle : Buch → Bicher."
for m in MOTS:
    if m[0] == 2:
        ajouter_mot(*m)

L.trou(2, "Deux livres", "zwee", "Bicher", "", ["Bicher", "Buch", "Buchen"], "e Buch → zwee Bicher", attention=N_ER)
L.trou(2, "Deux maisons", "zwee", "Haiser", "", ["Haiser", "Haus", "Hausen"], "en Haus → zwee Haiser", attention=N_ER)
L.trou(2, "Deux verres", "zwee", "Glieser", "", ["Glieser", "Glas", "Glasen"], "e Glas → zwee Glieser", attention=N_ER)
L.trou(2, "Deux feuilles", "zwee", "Blieder", "", ["Blieder", "Blat", "Blaten"], "e Blat → zwee Blieder", attention=N_ER)
L.trou(2, "Deux cahiers", "zwee", "Hefter", "", ["Hefter", "Heft", "Heften"], "en Heft → zwee Hefter")
L.trou(2, "Deux livres", "", "zwee", "Bicher", ["zwee", "zwou"], "Buch (n.) → zwee")
L.trou(2, "Deux images", "", "zwee", "Biller", ["zwee", "zwou"], "Bild (n.) → zwee")
L.trou(2, "Ce sont deux livres et deux cahiers.", "Dat sinn zwee Bicher", "an", "zwee Hefter.", ["an", "a", "ass"], "an devant z (UNITEDZOHA)")
L.trou(2, "Deux bâtiments", "", "zwee", "Gebaier", ["zwee", "zwou"], "Gebai (n.) → zwee", plus=True)
L.trou(2, "Deux étagères", "zwee", "Regaler", "", ["Regaler", "Regal", "Regalen"], "e Regal → zwee Regaler", plus=True)

L.ecrit(2, "Deux livres", "zwee Bicher", attention=N_ER)
L.ecrit(2, "Deux cahiers", "zwee Hefter")
L.ecrit(2, "Deux feuilles", "zwee Blieder", attention=N_ER)
L.ecrit(2, "Deux maisons", "zwee Haiser", attention=N_ER)
L.ecrit(2, "Deux verres", "zwee Glieser", attention=N_ER)
L.ecrit(2, "Deux stylos", "zwee Stëfter")
L.ecrit(2, "Ce sont deux livres et deux cahiers.", "Dat sinn zwee Bicher an zwee Hefter.")
for fr, lu in [("Deux images", "zwee Biller"), ("Deux tables", "zwee Dëscher"), ("Deux étagères", "zwee Regaler"),
               ("Deux lunettes", "zwee Brëller"), ("Deux bâtiments", "zwee Gebaier"), ("Deux carnets", "zwee Bichelcher")]:
    L.ecrit(2, fr, lu, plus=True)

# ═══ UNITÉ 3 ════════════════════════════════════════════════════════════════
L.unite(3, "Seule la voyelle change",
        "Quelques noms changent seulement de voyelle : e Stull → zwee <b>Still</b> · eng Maus → zwou <b>Mais</b>",
        "zwee Still · zwou Mais · zwee Bäll · zwee Zich",
        ["Pas de terminaison : <b>Still</b>, pas « Stullen ».",
         "Le genre décide toujours : eng Maus → <b>zwou</b> Mais."],
        phrase=["Dat sinn zwee Still.", "Ce sont deux chaises."],
        phrases=[["Dat sinn zwou Mais.", "Ce sont deux souris."], ["Dat sinn zwee Bäll.", "Ce sont deux balles."]])

N_VOY = "Seule la voyelle change : Stull → <b>Still</b>, Maus → <b>Mais</b>, Ball → <b>Bäll</b>."
for m in MOTS:
    if m[0] == 3:
        ajouter_mot(*m)
L.carte(3, "ce sont deux chaises", "Dat sinn zwee Still", "Stull → Still", attention=N_VOY)
L.quiz(3, "Dat sinn zwee Still.", "Ce sont deux chaises.", ["C'est une chaise.", "Ce sont deux tables.", "Ce ne sont pas des chaises."], 'CHOISIS LA TRADUCTION')
L.quiz(3, "Dat sinn zwou Mais.", "Ce sont deux souris.", ["C'est une souris.", "Ce sont deux maisons.", "Ce sont deux sacs."], 'CHOISIS LA TRADUCTION')

L.trou(3, "Deux chaises", "zwee", "Still", "", ["Still", "Stull", "Stullen"], "e Stull → zwee Still", attention=N_VOY)
L.trou(3, "Deux souris", "zwou", "Mais", "", ["Mais", "Maus", "Mausen"], "eng Maus → zwou Mais", attention=N_VOY)
L.trou(3, "Deux balles", "zwee", "Bäll", "", ["Bäll", "Ball", "Ballen"], "e Ball → zwee Bäll", attention=N_VOY)
L.trou(3, "Deux trains", "zwee", "Zich", "", ["Zich", "Zuch", "Zuchen"], "en Zuch → zwee Zich", attention=N_VOY)
L.trou(3, "Deux souris", "", "zwou", "Mais", ["zwee", "zwou"], "Maus (f.) → zwou", attention=N_ZWOU)
L.trou(3, "Ce sont deux chaises.", "Dat", "sinn", "zwee Still.", ["sinn", "ass", "geet"], "Dat sinn = ce sont")

L.ecrit(3, "Deux chaises", "zwee Still", attention=N_VOY)
L.ecrit(3, "Deux souris", "zwou Mais", attention=N_VOY)
L.ecrit(3, "Deux balles", "zwee Bäll", attention=N_VOY)
L.ecrit(3, "Deux trains", "zwee Zich", attention=N_VOY)
L.ecrit(3, "Ce sont deux chaises.", "Dat sinn zwee Still.", attention=N_VOY)

# ═══ COURS ══════════════════════════════════════════════════════════════════
L.bloc({'type': 'texte', 'contenu': "Mettre au pluriel demande <b>deux choses</b> : choisir <b>zwee</b> ou <b>zwou</b> selon le genre, "
        "et transformer le <b>nom</b> lui-même. Pour dire « ce sont » : <b>Dat sinn …</b>"})
L.bloc({'type': 'callout', 'variant': 'retenir', 'titre': "zwee ou zwou ?",
        'lignes': ["Nom <b>masculin</b> ou <b>neutre</b> → <b>zwee</b> : zwee Computeren, zwee Bicher.",
                   "Nom <b>féminin</b> → <b>zwou</b> : zwou Fläschen, zwou Aueren.",
                   "C'est le genre <b>luxembourgeois</b> du nom <b>au singulier</b> qui décide."]}, 1)


def tableau(titre, unite, plus):
    lignes = [[m[5], m[3] + " " + m[4], "deux " + m[2]] for m in MOTS if m[0] == unite and m[1] == plus]
    L.bloc({'type': 'tableau', 'titre': titre, 'entetes': ["Singulier", "Pluriel", "Français"], 'lignes': lignes}, unite, plus=plus)


tableau("Pluriel en -(e)n (le plus courant)", 1, False)
tableau("Plus de pluriels en -(e)n", 1, True)
L.bloc({'type': 'vocab', 'titre': "Ce sont …", 'items': [["Dat ass eng Fläsch.", "C'est une bouteille."], ["Dat sinn zwou Fläschen.", "Ce sont deux bouteilles."],
        ["Dat sinn zwou Fläschen an zwee Computeren.", "Ce sont deux bouteilles et deux ordinateurs."]]}, 1)
L.bloc({'type': 'callout', 'variant': 'info', 'titre': "Le nom aussi change",
        'lignes': ["Trois schémas : <b>-(e)n</b> (unité 1), <b>-er</b> souvent avec changement de voyelle (unité 2), "
                   "<b>changement de voyelle seul</b> (unité 3)."]})
tableau("Pluriel en -er", 2, False)
tableau("Plus de pluriels en -er", 2, True)
L.bloc({'type': 'callout', 'variant': 'astuce', 'titre': "À mémoriser avec le mot",
        'lignes': ["Le pluriel ne se devine pas toujours : apprends-le <b>en même temps</b> que le singulier.",
                   "La voyelle change souvent : Buch → B<b>i</b>cher, Haus → H<b>ai</b>ser, Glas → Gl<b>ie</b>ser."]}, 2)
tableau("Seule la voyelle change", 3, False)
L.bloc({'type': 'vocab', 'titre': "Ce sont deux chaises", 'items': [["Dat sinn zwee Still", "Ce sont deux chaises"], ["Dat sinn zwou Mais.", "Ce sont deux souris."]]}, 3)
L.bloc({'type': 'dialogue', 'titre': "Le déménagement du bureau", 'echanges': [[x['lu'], x['fr']] for x in L.scene]}, 0)

L.ecrire()
