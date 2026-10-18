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
    page.screenshot(path=OUT + 'lot2-01-nouveau.png', full_page=True)
    page.click('.puce-niv:has-text("A1.2")')
    assert page.get_attribute('.puce-niv:has-text("A1.2")', 'aria-pressed') == 'true'
    assert 'Leçon 20' in page.inner_text('#today')
    page.click('#today .carte-suite')
    assert page.evaluate('niveauChoisi()') == 'A1.2'
    assert actif(page, 'view-msintro') and page.evaluate('pLecon.id') == 20  # leçon 20 : introduction de la mission
    page.evaluate('goDashboard()')
    assert page.get_attribute('.puce-niv:has-text("A1.2")', 'aria-pressed') == 'true'
    assert 'Commencer' in page.inner_text('#today') and 'Leçon 20' in page.inner_text('#today')
    ok('puce A1.2 → « Commencer » → leçon 20 (en unités) ; pas encore pratiqué : toujours « Commencer · Leçon 20 »')

    # ── S13 : changer de niveau depuis l'accueil ; révision tous niveaux ──
    page.click('.puce-niv:has-text("A1.1")')
    assert page.evaluate('niveauActif') == 'A1.1' and page.evaluate('niveauChoisi()') == 'A1.1'
    assert page.get_attribute('.puce-niv:has-text("A1.1")', 'aria-pressed') == 'true'
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
    chiffres = page.inner_text('.ac-chiffres')
    assert '/ 17' in chiffres and 'Progression' in chiffres and 'Série' in chiffres, chiffres
    assert 'Continuer' in page.inner_text('#today')
    assert '5' in page.inner_text('.ac-btn.rev') and 'à revoir' in page.inner_text('.ac-btn.rev'), page.inner_text('.ac-btn.rev')
    page.click('.ac-btn.rev')
    assert actif(page, 'view-session')
    assert all(x == 20 for x in page.evaluate('session.questions.map(q => q.leconId)'))
    ok('niveau A1.1 choisi par la puce ; « Réviser · 5 à revoir » reprend des questions A1.2')

    # ── S9 : barre du bas ──
    assert not visible(page, '#nav-bas'), 'pas de barre pendant une séance'
    page.click('#view-session .back-btn')
    assert actif(page, 'view-dashboard') and not visible(page, '#nav-bas'), 'pas de barre sur l\'accueil'
    page.click('.ac-btn.lecons')
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
    carte = page.inner_text('#today')
    assert 'Continuer' in carte and 'Leçon 2' in carte and 'restante' in carte, carte
    ok('barre : Accueil, Chemin, Réviser, Plus ; masquée sur l\'accueil, en séance et en exercice ; maison → accueil « Continuer · questions restantes »')

    # ── S13 : chemin avec 7 leçons terminées ──
    page.evaluate('clearRun()')
    for lid in range(1, 8):
        page.evaluate(FINIR_LECON, lid)
    page.evaluate('goLessons()')
    page.wait_for_timeout(400)
    # Spec 33 : un chemin continu, chaque leçon à sa place (plus de bloc « Terminées »)
    ordre = page.evaluate("[...document.querySelectorAll('.chemin > li[id^=chemin-lecon-]')].map(li => Number(li.id.split('-').pop()))")
    assert ordre == sorted(ordre) and ordre[:8] == list(range(1, 9)), ordre
    assert page.locator('.pas.fait.replie').count() == 7
    assert '7 terminées' in page.inner_text('.resume').lower()
    encours = page.inner_text('.pas.encours')
    assert 'leçon 8' in encours.lower() and 'mission' in encours.lower() and 'bilan' in encours.lower(), encours
    assert page.locator('.pas.futur').count() == 9
    page.screenshot(path=OUT + 'lot2-03-chemin.png', full_page=True)
    page.click('#chemin-u-8-2 button')
    assert actif(page, 'view-pintro')
    page.evaluate('goLessons()')
    # Accordéon : un appui sur une leçon future la déplie (une seule dépliée à la fois)
    page.click('.pas.futur .chemin-lecon:has-text("Les langues")')
    assert page.locator('.pas.ouverte').count() == 1 and 'Les langues' in page.inner_text('.pas.ouverte')
    assert 'leçon 8' not in page.inner_text('.pas.ouverte').lower()
    page.click('.pas.ouverte .lien-or')  # « Voir toute la leçon »
    assert actif(page, 'view-lecon') or actif(page, 'view-plecon') or actif(page, 'view-msintro')  # leçon future : intro de mission à la 1re découverte
    page.evaluate('goLessons()')
    page.click('.pas.encours .carte-lecon')  # on redéplie la leçon conseillée
    page.click('.pas.encours .unites li.bilan button')
    assert actif(page, 'view-session') and page.evaluate('session.questions.length') > 0
    ok('chemin : leçons 1 à 7 vertes à leur place, leçon 8 dépliée (unités, mission, bilan) ; tout s\'ouvre')

    # ── S12 : animation de l'étape tout juste finie, une seule fois ──
    page.evaluate("saveUnitBest(8, 1, 90); dernierFini = { leconId: 8, uniteId: 1 }; goLessons()")
    assert page.locator('.unites li.vient-de-finir').count() == 1
    page.evaluate('renderLessons()')
    assert page.locator('.vient-de-finir').count() == 0
    ok('unité finie : animée une fois sur le chemin, plus au réaffichage')

    # ── Spec 27 : trois états lisibles, animation complète à la 1re réussite seulement ──
    page.evaluate("dernierFini = { leconId: 8, uniteId: 1, premiere: true }; goLessons()")
    assert page.locator('#chemin-u-8-1.ok.vient-de-finir.premiere').count() == 1
    assert page.locator('.pas.encours .unites li.actuelle.pulse.apres').count() == 1
    assert page.locator('.pas.encours .unites li.a-venir').count() >= 1
    couleurs = page.evaluate("""() => ['ok', 'actuelle', 'a-venir'].map(c =>
        getComputedStyle(document.querySelector('.pas.encours .unites li.' + c + ' button')).color)""")
    assert len(set(couleurs)) == 3, couleurs
    page.evaluate('renderLessons()')
    assert page.locator('.premiere, .apres').count() == 0
    ok('chemin : terminée (blanc, coche verte), recommandée (or), à découvrir (neutre) ; 1re réussite animée une fois')

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
    assert 'Passer en A1.2' in page.inner_text('#today .carte-suite')
    assert page.evaluate('niveauActif') == 'A1.1'
    page.screenshot(path=OUT + 'lot2-04-niveau-termine.png', full_page=True)
    page.click('#today .carte-suite')
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
