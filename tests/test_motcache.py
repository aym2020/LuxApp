"""Mot caché : découvrir le mot nouveau, puis le reconstruire en touchant des
lettres mélangées (sans clavier du téléphone). Téléphone simulé (écran tactile)."""
import os
from playwright.sync_api import sync_playwright

URL = os.environ.get('LUX_URL', 'http://localhost:3456/')
OUT = os.path.join(os.path.dirname(__file__), 'captures', 'mc-')
os.makedirs(os.path.dirname(OUT), exist_ok=True)


def ok(m):
    print('  ok  ', m, flush=True)


def carte(pg):
    return pg.evaluate("trouverItem(pLecon, 'flashcards', run.steps[run.stepIdx].queue[0])")


def lettres_libres(pg):
    return pg.evaluate("mcCasesLettres().libres.map(i => mc.cases[i].ch)")


def toucher(pg, lettre):
    # Touche la première lettre proposée identique (encore disponible).
    i = pg.evaluate("""l => mc.tuiles.findIndex((t, i) => !tuilesUtilisees()[i] && normalize(t.ch) === normalize(l))""", lettre)
    assert i != -1, lettre
    pg.tap('#mc-lettres .mc-tuile >> nth=%d' % i)


with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
    pg = ctx.new_page()
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.route('**/*gstatic*/**', lambda r: r.abort())
    pg.route('**/fonts.googleapis.com/**', lambda r: r.abort())
    pg.goto(URL)
    pg.wait_for_selector('#today')
    pg.evaluate("choisirNiveau('A1.1'); marquerIntroMissionVue(2); openParcoursLecon(lecons.find(l => l.id === 2)); startUnite(1, 'unite')")

    # 1. Mot jamais vu : découverte d'abord
    c = carte(pg)
    assert pg.is_visible('#mc-btn-reconstruire') and pg.locator('#mc-input').count() == 0
    assert pg.evaluate('motComplet(trouverItem(pLecon, "flashcards", run.steps[run.stepIdx].queue[0]))') in pg.inner_text('.mc-decouverte')
    pg.screenshot(path=OUT + '1-decouverte.png')
    ok('mot nouveau « %s » : il est montré d\'abord (%s)' % (c['fr'], pg.inner_text('.mc-decouverte-lu')))

    # 2. Reconstruction : lettres du mot + intruses, pas de clavier
    pg.tap('#mc-btn-reconstruire')
    assert pg.get_attribute('#mc-input', 'inputmode') == 'none'
    libres = lettres_libres(pg)
    nb = pg.locator('#mc-lettres .mc-tuile').count()
    assert nb == len(libres) + (3 if len(libres) >= 6 else 2), (nb, libres)
    assert pg.locator('.mc-decouverte').count() == 0, 'le mot est caché pendant la reconstruction'
    ok('reconstruction : %d lettres proposées pour %d cases (intruses comprises), clavier du téléphone désactivé' % (nb, len(libres)))

    # 3. Toucher, effacer
    toucher(pg, libres[0])
    assert pg.locator('.mc-case.tapee').count() == 1 and pg.locator('.mc-tuile.utilisee').count() == 1
    pg.tap('#mc-btn-effacer')
    assert pg.locator('.mc-case.tapee').count() == 0 and pg.locator('.mc-tuile.utilisee').count() == 0
    ok('toucher une lettre la pose dans la 1re case vide ; ⌫ la retire')

    # 4. Erreur : 1re lettre juste, le reste faux -> vertes gardées, nouvelles lettres
    toucher(pg, libres[0])
    intruses = pg.evaluate("mc.tuiles.map((t, i) => tuilesUtilisees()[i] ? null : i).filter(i => i !== null)")
    for i in intruses[:len(libres) - 1]:
        pg.tap('#mc-lettres .mc-tuile >> nth=%d' % i)
    pg.tap('#mc-btn-valider')
    pt = pg.evaluate("pAttente")
    if not pt:
        assert pg.locator('.mc-case.vert').count() >= 1
        assert pg.locator('#mc-lettres .mc-tuile').count() == len(lettres_libres(pg)) + (3 if len(lettres_libres(pg)) >= 6 else 2)
        pg.screenshot(path=OUT + '2-erreur.png')
        ok('erreur : %d lettre(s) verte(s) gardée(s), nouvelles lettres pour les cases vides' % pg.locator('.mc-case.vert').count())
        # 5. Les cases vides seulement, puis juste
        for l in lettres_libres(pg):
            toucher(pg, l)
        pg.tap('#mc-btn-valider')
    assert pg.evaluate('pAttente') and 'Bien joué' in pg.inner_text('#pc-feedback')
    assert c['fr'] in pg.inner_text('#pc-feedback')
    # Une seule action : plus de Valider / Indice / Effacer ni de lettres, « Continuer » en vert
    for sel in ('#mc-btn-valider', '#mc-btn-indice', '#mc-btn-effacer', '#mc-lettres'):
        assert not pg.is_visible(sel), sel + ' encore visible après la correction'
    assert 'ok' in pg.get_attribute('#pc-continuer', 'class') and 'Score du mot' in pg.inner_text('#pc-feedback')
    ok('après la correction : seul « Continuer » (vert), score du mot affiché dans le panneau')
    pg.screenshot(path=OUT + '3-juste.png')
    ok('mot reconstruit : « Bien joué ! %s = %s »' % (pg.evaluate("motComplet(mc.card)"), c['fr']))

    # 6. Mot déjà vu : reconstruction directe
    pg.evaluate("startUnite(1, 'unite')")
    vus = pg.evaluate("motDejaVu(trouverItem(pLecon, 'flashcards', run.steps[run.stepIdx].queue[0]))")
    if vus:
        assert pg.locator('#mc-btn-reconstruire').count() == 0 and pg.locator('#mc-lettres .mc-tuile').count() > 0
        ok('mot déjà vu : pas de découverte, reconstruction directe')
    else:
        pg.evaluate("""() => { const s = run.steps[run.stepIdx]; s.queue = [""" + str(c['id']) + """].concat(s.queue.filter(x => x !== """ + str(c['id']) + """)); renderItem(); }""")
        assert pg.locator('#mc-btn-reconstruire').count() == 0
        ok('mot déjà vu : pas de découverte, reconstruction directe')

    # 7. Spec 21 : chaque tuile a son identité (mot de test « Eet ëtt » : E/e, ë, trois t)
    pg.evaluate("""() => {
        const carte = { id: 990001, fr: 'Test', lu: 'Eet ëtt', unite: 1 };
        startUnite(1, 'unite');
        renderMotCache(carte);
        if (document.getElementById('mc-btn-reconstruire')) renderReconstruction();
        // Tuiles fixées pour le test (pas d'intruse, ordre connu)
        mc.tuiles = ['t', 'E', 'ë', 't', 'e', 't'].map(ch => ({ ch })); mc.choix = []; renderCases();
    }""")
    def tuiles_utilisees():
        return pg.evaluate("[...document.querySelectorAll('#mc-lettres .mc-tuile')].map(b => b.classList.contains('utilisee'))")
    def cases():
        return pg.evaluate("[...document.querySelectorAll('#mc-cases .mc-case')].map(c => c.textContent)")
    pg.tap('[data-tuile="1"]')            # E
    pg.tap('[data-tuile="4"]')            # e
    assert tuiles_utilisees() == [False, True, False, False, True, False], tuiles_utilisees()
    assert cases()[:2] == ['E', 'e'], cases()
    ok('E puis e : exactement ces deux tuiles, casse conservée')
    pg.tap('[data-tuile="3"]')            # le 2e « t », pas le 1er
    assert tuiles_utilisees() == [False, True, False, True, True, False], tuiles_utilisees()
    ok('2e « t » touché : seule cette tuile est prise, les autres « t » restent libres')
    pg.tap('[data-tuile="2"]')            # ë
    assert cases()[3] == 'ë', cases()
    ok('lettre accentuée : « ë » posé tel quel')
    pg.tap('#mc-btn-effacer')
    assert tuiles_utilisees() == [False, True, False, True, True, False] and cases()[3] == '', (tuiles_utilisees(), cases())
    ok('⌫ libère exactement la dernière tuile touchée (ë)')
    pg.evaluate("Math.random = () => 0.99")  # l'indice révèle la dernière case libre (un « t »)
    pg.tap('#mc-btn-indice')
    assert pg.locator('#mc-lettres .mc-tuile').count() == 5 and cases()[:3] == ['E', 'e', 't'], cases()
    ok('indice : une tuile « t » libre disparaît, les lettres posées restent')
    # Nouvelle tentative : réponse fausse → lettres vertes gardées, nouvelles tuiles, aucune tuile prise
    for k in reversed(pg.evaluate("[...document.querySelectorAll('#mc-lettres .mc-tuile:not(.utilisee)')].map(b => b.dataset.tuile)")):  # ordre inversé = faux
        pg.tap('[data-tuile="%s"]' % k)
    pg.tap('#mc-btn-valider')
    assert not pg.evaluate('pAttente'), 'la réponse dans le désordre devait être fausse'
    assert pg.evaluate('mc.choix.length') == 0 and not any(tuiles_utilisees())
    assert pg.locator('.mc-case.vert').count() >= 3
    ok('nouvelle tentative : lettres justes en vert, tuiles renouvelées, aucune déjà prise')

    print('\nErreurs JavaScript :', errs or 'aucune')
    assert not errs
    b.close()
