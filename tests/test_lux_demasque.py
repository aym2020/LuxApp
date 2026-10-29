"""SPEC 110 — Lux Démasque, dossier Milo dans le vrai navigateur (lot D1).
Parcours complet par l'interface : rencontre → déposition → précision → réseaux → carnet →
objection ratée puis réussie (×3) → bilan 3/3 → nouveau dossier. Retour Android ferme
d'abord les fenêtres ; aide FR désactivée = luxembourgeois seul ; déposition sans scroll de
page de 320 à 430 px ; Lux Match reste masqué."""
from playwright.sync_api import sync_playwright
from helpers import ok, ouvrir, vue, URL

MESURE = "({ scroll: document.documentElement.scrollHeight - innerHeight, large: document.documentElement.scrollWidth > innerWidth })"


def ouvrir_dossier(pg):
    pg.evaluate("ouvrirJeux()")
    pg.wait_for_selector('.ld-jouer-hub')
    pg.click('.ld-jouer-hub')
    pg.wait_for_selector('#ld-selection-carte')
    pg.click('.ld-dating-meet')
    pg.wait_for_selector('.ld-rencontre')


def objecter(pg, index, texte_piece):
    pg.evaluate(f"LuxDemasqueCore.allerA(ld.partie, {index}); ldMajDeposition()")
    pg.click('#ld-objecter')
    pg.click(f"#ld-objection .ld-carnet-el:has-text('{texte_piece}')")
    pg.wait_for_selector('#ld-verdict')
    titre = pg.inner_text('#ld-verdict .ld-verdict-titre')
    pg.click('#ld-verdict .ld-btn')
    return titre


with sync_playwright() as p:
    b, pg, erreurs_js = ouvrir(p, mobile=True)
    pg.evaluate("ouvrirJeux()")
    pg.wait_for_selector('.ld-carte-hub')
    assert pg.locator('.lm-carte-hub').count() == 0
    ok('carte Lux Démasque dans Jeux, Lux Match toujours masqué')

    ouvrir_dossier(pg)
    assert vue(pg) == 'view-luxdemasque'
    assert 'Milo, 30 ans' in pg.inner_text('.ld-fiche')
    pg.click('.ld-rencontre .ld-btn-or')
    pg.wait_for_selector('#ld-declaration')
    assert 'Ech schaffen am Tourismus' in pg.inner_text('#ld-declaration')
    assert pg.inner_text('#ld-compteur').strip().startswith('0/3')
    ok('déposition : 1re déclaration en LU, compteur 0/3')

    # Précision unique et mémorisée.
    pg.click('#ld-preciser')
    assert 'Bei Horizon Voyages' in pg.inner_text('#ld-declaration')
    assert pg.is_disabled('#ld-preciser')
    for _ in range(5):
        pg.click('.ld-nav[aria-label="Déclaration suivante"]')
    assert pg.evaluate("ld.partie.entendues.length") == 6
    assert pg.is_disabled('.ld-nav[aria-label="Déclaration suivante"]')
    pg.click('.ld-nav[aria-label="Déclaration précédente"]')
    assert 'Ech kache gär' in pg.inner_text('#ld-declaration')
    ok('navigation libre entre les 6 déclarations, précision mémorisée')

    # Objection sans pièce : invitation à fouiller, aucune erreur comptée.
    pg.click('#ld-objecter')
    assert 'Ton carnet est vide' in pg.inner_text('#ld-objection')
    pg.evaluate("history.back()")
    pg.wait_for_function("!document.getElementById('ld-objection')")
    assert vue(pg) == 'view-luxdemasque' and pg.evaluate("ld.partie.erreurs") == 0
    ok('Retour Android ferme la fenêtre d’objection sans quitter le jeu')

    # Réseaux : chaque pièce ouverte entre au carnet ; Retour ferme la pièce puis les réseaux.
    pg.click('.ld-outil:has-text("Réseaux")')
    for onglet in ['Pix', 'Pro', 'Amis']:
        pg.click(f'#ld-reseaux .ld-onglet:has-text("{onglet}")')
        n = pg.locator('#ld-reseaux .ld-vignette').count()
        for k in range(n):
            pg.locator('#ld-reseaux .ld-vignette').nth(k).click()
            pg.wait_for_selector('#ld-piece .ld-transcription')
            assert pg.inner_text('#ld-piece .ld-transcription').strip()
            pg.evaluate("history.back()")
            pg.wait_for_function("!document.getElementById('ld-piece')")
            assert pg.locator('#ld-reseaux').count() == 1
    pg.evaluate("history.back()")
    pg.wait_for_function("!document.getElementById('ld-reseaux')")
    assert pg.evaluate("ld.partie.consultees.length") == 8
    assert pg.inner_text('.ld-outil:has-text("Carnet") b') == '8'
    ok('8 pièces consultées et au carnet, chacune avec sa transcription ; Retour ferme pièce puis réseaux')

    # Avant toute preuve : aucune révélation (montage) visible nulle part.
    assert pg.locator('.ld-revelation').count() == 0
    # Objections : une ratée (leurre) puis les trois bonnes.
    assert 'rejetée' in objecter(pg, 3, 'Photo : Kyoto')
    assert pg.evaluate("ld.partie.erreurs") == 1
    pg.evaluate(f"LuxDemasqueCore.allerA(ld.partie, 3); ldMajDeposition()")
    pg.click('#ld-objecter')
    pg.click("#ld-objection .ld-carnet-el:has-text('LuxRun')")
    pg.wait_for_selector('.ld-fx-ok .ld-fx-cri')           # effet OBJECTION ! plein écran
    assert 'LuxRun' in pg.inner_text('.ld-fx-piece')        # la pièce est brandie
    pg.wait_for_selector('#ld-verdict')
    assert pg.locator('.ld-fx').count() == 0
    assert 'démasquée' in pg.inner_text('#ld-verdict .ld-verdict-titre')
    assert 'MONTAGE' in pg.inner_text('#ld-verdict .ld-revelation')   # le montage, après la preuve
    assert pg.evaluate("getComputedStyle(document.querySelector('#ld-verdict .ld-fenetre')).overflowY") == 'visible'
    pg.click('#ld-verdict .ld-btn')
    assert pg.inner_text('#ld-compteur').strip().startswith('1/3')
    assert 'DÉMASQUÉE' in pg.inner_text('#ld-declaration') and pg.is_disabled('#ld-objecter')
    assert 'démasquée' in objecter(pg, 1, 'Profil de Sami')
    assert 'démasquée' in objecter(pg, 0, 'Profil Pro de Milo')
    pg.wait_for_selector('.ld-bilan')
    assert '3 / 3' in pg.inner_text('.ld-bilan-titre')
    assert pg.evaluate("ld.partie.fin.score") == 900 - 50
    ok('objection ratée (−50) puis 3/3 : bilan, score 850')

    # Bilan : action principale avant les détails ; motivations révélées.
    haut_cta = pg.evaluate("document.querySelector('.ld-bilan .ld-btn-or').getBoundingClientRect().bottom")
    assert haut_cta < 740, haut_cta
    assert 'Paraître aventureux' in pg.inner_text('.ld-bilan')
    pg.click('.ld-bilan .ld-btn-or')
    pg.wait_for_selector('.ld-rencontre')
    assert pg.evaluate("ld.partie.phase") == 'rencontre' and pg.evaluate("ld.partie.erreurs") == 0
    assert 'Noah, 32 ans' in pg.inner_text('.ld-fiche')   # Milo résolu → dossier rédigé suivant
    ok('« Nouveau dossier » visible sans scroller, Milo résolu → dossier suivant (Noah), partie propre')

    # Aide FR désactivée : luxembourgeois seul, l'enquête reste identique.
    pg.click('.ld-rencontre .ld-btn-or')
    pg.wait_for_selector('#ld-declaration')
    pg.click('.ld-fr-btn')
    assert pg.locator('#ld-declaration .ld-fr').count() == 0
    pg.click('#ld-preciser')
    assert pg.locator('#ld-declaration .ld-fr').count() == 0 and 'Zënter zwee Joer' in pg.inner_text('#ld-declaration')
    pg.click('.ld-fr-btn')
    assert pg.locator('#ld-declaration .ld-fr').count() >= 2
    ok('aide FR : désactivée = LU seul, réactivée = traductions')

    # Quitter : Retour hors fenêtre revient au hub, aucune partie active.
    pg.evaluate("history.back()")
    pg.wait_for_function("document.getElementById('view-jeux').classList.contains('active')")
    assert pg.evaluate("ld.partie") is None
    ok('Retour hors fenêtre → hub Jeux, partie arrêtée')
    b.close()

    # Tailles Android : pas de scroll de page dans la déposition, pas de débordement horizontal.
    for (w, h) in [(320, 640), (360, 740), (393, 852), (430, 932)]:
        nav = p.chromium.launch()
        page = nav.new_context(viewport={'width': w, 'height': h}, is_mobile=True, has_touch=True).new_page()
        page.route('**/*gstatic*/**', lambda r: r.abort()); page.route('**/fonts.googleapis.com/**', lambda r: r.abort())
        page.goto(URL); page.wait_for_selector('#today')
        page.evaluate("ouvrirLuxDemasque()"); page.wait_for_selector('.ld-rencontre')
        page.click('.ld-rencontre .ld-btn-or'); page.wait_for_selector('#ld-declaration')
        page.evaluate("ld.partie.dossier.declarations.forEach(d => { LuxDemasqueCore.allerA(ld.partie, ld.partie.dossier.declarations.indexOf(d)); LuxDemasqueCore.preciser(ld.partie); }); LuxDemasqueCore.allerA(ld.partie, 0); ldMajDeposition()")
        m = page.evaluate(MESURE)
        assert m['scroll'] <= 0 and not m['large'], (w, h, m)
        bas = page.evaluate("document.getElementById('ld-objecter').getBoundingClientRect().bottom")
        assert bas <= h, (w, h, bas)
        cibles = page.evaluate("Math.min(...[...document.querySelectorAll('#ld-jeu button')].filter(b => b.offsetParent).map(b => Math.min(b.getBoundingClientRect().width, b.getBoundingClientRect().height)))")
        assert cibles >= 44, (w, cibles)
        nav.close()
    ok('déposition à 320/360/393/430 px : zéro scroll de page, OBJECTION visible, cibles ≥ 44 px')
    assert not erreurs_js, erreurs_js
