"""Lot 2 : niveau choisi + chemin (S13), plan du jour (S7), barre du bas (S9),
animations (S12). La synchronisation (S8) est testée par tests/test_sync.js."""
import os
from playwright.sync_api import sync_playwright

URL = os.environ.get('LUX_URL', 'http://localhost:3456/')
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'captures') + '/'
os.makedirs(OUT, exist_ok=True)
erreurs_js = []

# Rend une leçon « faite » : v1 au statut « bien », v2 toutes unités + mission.
FINIR_LECON = """id => {
    const l = lecons.find(x => x.id === id);
    if (isParcoursLecon(l)) {
        unitesCoeur(l).forEach(u => saveUnitBest(id, u.id, 95));
        if (l.mission) saveMissionBest(id, 90);
        return;
    }
    const progress = getProgress();
    progress[id] = progress[id] || {};
    ['quiz', 'trous'].forEach(t => {
        progress[id][t] = {};
        (l[t] || []).forEach(q => { progress[id][t][q.id] = 3; });
    });
    progress[id].ecriture = {};
    (l.ecriture || []).forEach((q, i) => { progress[id].ecriture[ecritureId(q, i)] = 3; });
    saveProgress(progress);
    updateQuestionStats(id, 'quiz', l.quiz[0].id, true);
}"""


def ok(msg):
    print('  ok  ', msg)


def actif(page, vue):
    return page.evaluate("id => document.getElementById(id).classList.contains('active')", vue)


def visible(page, selecteur):
    # getClientRects : fonctionne aussi pour les éléments fixés (barre du bas, panneau)
    return page.evaluate("s => { const e = document.querySelector(s); return !!e && e.getClientRects().length > 0; }", selecteur)


def debordement(page):
    return page.evaluate('document.documentElement.scrollWidth - innerWidth')


with sync_playwright() as p:
    nav = p.chromium.launch()
    page = nav.new_page(viewport={'width': 390, 'height': 844}, device_scale_factor=2)
    page.route('**/*gstatic*/**', lambda r: r.abort())
    page.route('**/fonts.googleapis.com/**', lambda r: r.abort())
    page.on('pageerror', lambda e: erreurs_js.append(str(e)))
    page.on('dialog', lambda d: d.accept())
    page.goto(URL)
    page.wait_for_selector('#today')

    # ── S13 : premier lancement, choix du niveau A1.2 ──
    page.screenshot(path=OUT + 'lot2-01-bienvenue.png', full_page=True)
    page.click('#today .choix-niv:has-text("A1.2")')
    assert page.get_attribute('#today .choix-niv:has-text("A1.2")', 'aria-pressed') == 'true'
    page.click('#today .btn-jaune')
    assert page.evaluate('niveauChoisi()') == 'A1.2'
    assert actif(page, 'view-lecon') and '20' in page.inner_text('#lecon-num')
    page.evaluate('goDashboard()')
    assert 'A1.2' in page.inner_text('#btn-niveau')
    assert 'ton parcours · a1.2' in page.inner_text('#today').lower()
    assert '/ 7 leçons' in page.inner_text('#today .compte')
    ok('Bienvenue : A1.2 choisi → leçon 20 ; accueil « Ton parcours · A1.2 · 0 / 7 leçons »')

    # ── S13 : changer de niveau depuis l'accueil ; révision tous niveaux ──
    page.click('#btn-niveau')
    assert page.locator('.panneau .choix-niv').count() == 2
    page.screenshot(path=OUT + 'lot2-02-panneau-niveau.png')
    page.click('.panneau .choix-niv:has-text("A1.1")')
    assert page.evaluate('niveauActif') == 'A1.1' and page.evaluate('niveauChoisi()') == 'A1.1'
    assert not visible(page, '.panneau')
    page.evaluate("""() => {
        // Des questions de la leçon 20 (A1.2) vues il y a 40 jours : dues.
        const l = lecons.find(x => x.id === 20);
        const vieux = new Date(Date.now() - 40 * 86400000).toISOString();
        l.quiz.slice(0, 5).forEach(q => updateQuestionStats(20, 'quiz', q.id, true));
        const store = getStatsStore();
        const wrong = getWrongStore();
        wrong[20] = { quiz: {} };
        l.quiz.slice(0, 5).forEach(q => { store[20].quiz[q.id].lastSeenAt = vieux; wrong[20].quiz[q.id] = 1; });
        saveStatsStore(store);
        saveWrongStore(wrong); // erreurs actives : dues tout de suite (pas d'étalement)
        goDashboard();
    }""")
    assert '5 questions' in page.inner_text('.tuile.rev'), page.inner_text('.tuile.rev')
    page.click('.tuile.rev')
    assert actif(page, 'view-session')
    assert all(x == 20 for x in page.evaluate('session.questions.map(q => q.leconId)'))
    ok('niveau A1.1 choisi dans le panneau ; la révision du jour reprend des questions A1.2')

    # ── S9 : barre du bas ──
    assert not visible(page, '#nav-bas'), 'pas de barre pendant une séance'
    page.click('#view-session .back-btn')
    assert visible(page, '#nav-bas') and page.get_attribute('.nav-bas [data-nav="accueil"]', 'aria-current') == 'page'
    page.click('.nav-bas [data-nav="chemin"]')
    assert actif(page, 'view-lessons') and page.get_attribute('.nav-bas [data-nav="chemin"]', 'aria-current') == 'page'
    page.click('.nav-bas [data-nav="reviser"]')
    assert actif(page, 'view-review-setup')
    page.click('.nav-bas [data-nav="plus"]')
    page.click('.plus-ligne:has-text("Lexique")')
    assert actif(page, 'view-lexique') and visible(page, '#nav-bas')
    assert not visible(page, '#view-lexique .back-btn'), '« ← Accueil » remplacé par la barre'
    page.evaluate("openParcoursLecon(lecons.find(l => l.id === 2)); startUnite(1, 'unite')")
    assert actif(page, 'view-parcours') and not visible(page, '#nav-bas')
    page.click('#view-parcours .maison')
    assert actif(page, 'view-dashboard')
    assert 'reprendre' in page.inner_text('#today .reprendre-tete').lower()
    ok('barre : Accueil, Chemin, Réviser, Plus ; masquée en séance et en exercice ; maison → accueil')

    # ── S13 : chemin avec 7 leçons terminées ──
    page.evaluate('clearRun()')
    for lid in range(1, 8):
        page.evaluate(FINIR_LECON, lid)
    page.evaluate('goLessons()')
    page.wait_for_timeout(400)
    assert page.inner_text('.groupe-tete b') == 'Leçons 1 à 7'
    assert page.locator('.ligne-finie').count() == 0
    assert '7 terminées' in page.inner_text('.resume').lower()
    page.click('.groupe-tete')
    assert page.locator('.ligne-finie').count() == 7
    encours = page.inner_text('.pas.encours')
    assert 'leçon 8' in encours.lower() and 'mission' in encours.lower() and 'bilan' in encours.lower(), encours
    assert page.locator('.pas.futur').count() == 9
    page.screenshot(path=OUT + 'lot2-03-chemin.png', full_page=True)
    page.click('.pas.encours .unites li:has-text("Unité 2") button')
    assert actif(page, 'view-pintro')
    page.evaluate('goLessons()')
    page.click('.pas.futur .chemin-lecon:has-text("Les langues")')
    assert actif(page, 'view-lecon')
    page.evaluate('goLessons()')
    page.click('.pas.encours .unites li.bilan button')
    assert actif(page, 'view-session') and page.evaluate('session.questions.length') > 0
    ok('chemin : « Leçons 1 à 7 » replié puis 7 lignes ; leçon 8 dépliée (unités, mission, bilan) ; tout s\'ouvre')

    # ── S12 : animation de l'étape tout juste finie, une seule fois ──
    page.evaluate("saveUnitBest(8, 1, 90); dernierFini = { leconId: 8, uniteId: 1 }; goLessons()")
    assert page.locator('.unites li.vient-de-finir').count() == 1
    page.evaluate('renderLessons()')
    assert page.locator('.vient-de-finir').count() == 0
    ok('unité finie : animée une fois sur le chemin, plus au réaffichage')

    # ── S7 : fin d'unité → bouton « Accueil » en dernier ; objectif à deux conditions ──
    page.evaluate("openParcoursLecon(lecons.find(l => l.id === 8)); startEtapeSeule(1, 'quiz')")
    page.evaluate("run.steps[0].queue = []; finirRun()")
    boutons = page.locator('.pf-boutons button').all_inner_texts()
    assert boutons[-1] == 'Accueil', boutons
    ok('fin de partie : ' + ' | '.join(boutons))

    # ── S13 : niveau terminé → proposition du niveau suivant (jamais automatique) ──
    for lid in page.evaluate("leconsDuNiveau('A1.1').map(l => l.id)"):
        page.evaluate(FINIR_LECON, lid)
    page.evaluate('goDashboard()')
    assert 'niveau terminé' in page.inner_text('#today').lower()
    assert page.inner_text('#today .btn-jaune') == 'Passer en A1.2'
    assert page.evaluate('niveauActif') == 'A1.1'
    page.screenshot(path=OUT + 'lot2-04-niveau-termine.png', full_page=True)
    page.click('#today .btn-jaune')
    assert page.evaluate('niveauActif') == 'A1.2'
    ok('A1.1 terminé : « Passer en A1.2 » proposé, niveau inchangé tant qu\'on n\'accepte pas')

    # ── S12 : largeurs 320 à 430, sans débordement ──
    for largeur in (320, 360, 390, 430):
        page.set_viewport_size({'width': largeur, 'height': 800})
        for vue in ('goDashboard()', 'goLessons()', 'ouvrirPlus()'):
            page.evaluate('fermerPanneau(); ' + vue)
            page.wait_for_timeout(150)
            d = debordement(page)
            assert d <= 0, (largeur, vue, d)
    page.evaluate('fermerPanneau()')
    ok('accueil, chemin, menu Plus : aucun débordement à 320, 360, 390, 430 px')

    print('\nErreurs JavaScript :', erreurs_js or 'aucune')
    assert not erreurs_js
    nav.close()
