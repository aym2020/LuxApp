"""Lot 1 : guide v1/v2 (S1), première visite (S2), accueil (S3), mission lisible (S4),
aide à l'erreur en deux temps (S6), rôles typographiques (S12). Format mobile."""
import os
from playwright.sync_api import sync_playwright

URL = os.environ.get('LUX_URL', 'http://localhost:3456/')
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'captures') + '/'
os.makedirs(OUT, exist_ok=True)
erreurs_js = []


def ok(msg):
    print('  ok  ', msg)


def actif(page, vue):
    return page.evaluate("id => document.getElementById(id).classList.contains('active')", vue)


def visible(page, selecteur):
    return page.evaluate("s => { const e = document.querySelector(s); return !!e && e.offsetParent !== null; }", selecteur)


with sync_playwright() as p:
    nav = p.chromium.launch()
    page = nav.new_page(viewport={'width': 390, 'height': 844}, device_scale_factor=2)
    page.route('**/*gstatic*/**', lambda r: r.abort())
    page.route('**/fonts.googleapis.com/**', lambda r: r.abort())
    page.on('pageerror', lambda e: erreurs_js.append(str(e)))
    page.on('dialog', lambda d: d.accept())
    page.goto(URL)
    page.wait_for_selector('#today')

    # ── S3 : profil neuf ──
    assert page.inner_text('#today .tb-titre') == 'Bienvenue'
    assert 'Leçon 1' in page.inner_text('#today .tb-lecon')
    assert not visible(page, '#dash-acquis'), 'tuiles visibles sur un profil neuf'
    assert not visible(page, '#btn-pieges') and not visible(page, '#btn-erreurs')
    assert page.locator('#view-dashboard >> text=Réinitialiser').count() == 0
    assert '1592' not in page.inner_text('#view-dashboard')
    ok('profil neuf : carte Bienvenue seule, ni tuiles, ni pièges, ni « Réinitialiser », ni « 1592 »')

    page.click('#today button:has-text("C\'est parti")')
    assert actif(page, 'view-lecon'), 'la leçon 1 (v1) doit s\'ouvrir'
    ok('« C\'est parti » → leçon 1 (format v1, écran à onglets)')

    # ── S1 + S2 : leçon 1 faite → leçon 2, d'abord l'écran de la leçon ──
    page.evaluate("""() => {
        const l1 = lecons.find(l => l.id === 1);
        const progress = getProgress();
        progress[1] = progress[1] || {};
        ['quiz', 'trous'].forEach(t => {
            progress[1][t] = {};
            (l1[t] || []).forEach(q => { progress[1][t][q.id] = 3; });
        });
        progress[1].ecriture = {};
        (l1.ecriture || []).forEach((q, i) => { progress[1].ecriture[ecritureId(q, i)] = 3; });
        saveProgress(progress);
        updateQuestionStats(1, 'quiz', l1.quiz[0].id, true);
        goDashboard();
    }""")
    assert page.evaluate('leconV1Faite(lecons.find(l => l.id === 1))')
    assert 'Leçon 2' in page.evaluate('prochainPas().texte')
    assert not page.evaluate('getLeconVue(2)')
    page.evaluate('prochainPas().fn()')
    assert actif(page, 'view-plecon'), '1re visite : écran de la leçon attendu'
    assert visible(page, '.ms-carte')
    page.evaluate('goDashboard(); prochainPas().fn()')
    assert actif(page, 'view-pintro'), '2e visite : intro de l\'unité attendue'
    ok('leçon 1 au statut « bien » → prochain pas = leçon 2 ; 1re visite → écran de la leçon, ensuite → intro')

    # ── S3 : compteurs acquis ──
    page.evaluate('goDashboard()')
    tuiles = page.locator('#dash-acquis .dash-tuile span').all_inner_texts()
    assert tuiles == ['Unités terminées', 'Missions réussies', 'Leçons sans faute', 'Jours de pratique'], tuiles
    assert page.inner_text('#dash-acquis .dash-tuile b >> nth=0') == '1'  # leçon 1 v1
    page.click('.dash-reglages')
    assert actif(page, 'view-reglages') and visible(page, '#view-reglages .dash-reset')
    page.screenshot(path=OUT + 'lot1-reglages.png', full_page=True)
    ok('tuiles acquises (unités, missions réussies, sans faute, jours) ; « Réinitialiser » dans Réglages')

    # ── S4 : mission lisible ──
    page.evaluate('openParcoursLecon(lecons.find(l => l.id === 2))')
    assert page.locator('.ms-carte > .ms-scene .ms-bulle').count() == 3
    assert page.locator('.ms-carte .ms-bulle.cachee').count() == 0
    assert 'Voir toute la scène · 10 répliques' in page.inner_text('.ms-suite summary')
    assert page.inner_text('.ms-bas') == 'Tu sais dire 0 réplique sur 10'
    page.click('.ms-suite summary')
    assert page.locator('.ms-carte .ms-bulle').count() == 10
    page.evaluate('saveUnitBest(2, 1, 100); renderParcoursLecon()')
    assert 'sur 10' in page.inner_text('.ms-bas') and page.locator('.ms-pastille.apprise').count() >= 1
    page.evaluate('saveMissionBest(2, 60); renderParcoursLecon()')
    assert 'JOUÉE 60 % · À REJOUER' in page.inner_text('.ms-carte .pc-mini-label')
    assert not page.evaluate('missionReussie(lecons.find(l => l.id === 2))')
    page.evaluate('saveMissionBest(2, 85); renderParcoursLecon()')
    assert 'RÉUSSIE 85 %' in page.inner_text('.ms-carte .pc-mini-label')
    page.evaluate('goDashboard()')
    assert page.inner_text('#dash-acquis .dash-tuile b >> nth=1') == '1'
    ok('mission : 3 répliques lisibles + « Voir toute la scène », pastilles d\'unité, Jouée 60 % / Réussie 85 %, tuile comptée')

    # ── S6 : mot caché « un sac » ──
    page.evaluate("""() => {
        openParcoursLecon(lecons.find(l => l.id === 2));
        startUnite(1, 'unite');
        // On place la carte « Mapp » en tête de l'étape.
        const s = run.steps[run.stepIdx];
        const id = pLecon.flashcards.find(c => c.lu === 'Mapp').id;
        s.queue = [id].concat(s.queue.filter(x => x !== id));
        renderItem();
    }""")
    assert 'sac' in page.inner_text('.mc-fr')
    page.fill('#mc-input', 'bag')
    page.click('#mc-btn-valider')
    err1 = page.inner_text('#mc-erreur')
    assert 'Mapp' not in err1, err1
    page.fill('#mc-input', 'Mappe')
    page.click('#mc-btn-valider')
    err2 = page.inner_text('#mc-erreur')
    assert 'Mapp' in err2, err2
    page.screenshot(path=OUT + 'lot1-aide-2e-essai.png', full_page=True)
    page.fill('#mc-input', 'Mapp')
    page.click('#mc-btn-valider')
    assert 'Attention' in page.inner_text('#pc-feedback')
    ok('mot caché « un sac » : 1er essai sans « Mapp » (' + err1.split('\n')[-1][:50] + '…), 2e essai : note complète, juste : note affichée')

    # ── S6 : diagnostic en écriture (étape seule) ──
    page.evaluate("""() => {
        openParcoursLecon(lecons.find(l => l.id === 2));
        startEtapeSeule(1, 'ecriture');
    }""")
    attendu = page.evaluate("trouverItem(pLecon, 'ecriture', etapeCourante().queue[0]).lu")
    mots = attendu.split(' ')
    faux = ' '.join(mots[:-1])  # dernier mot retiré
    page.fill('#pc-ecr-input', faux)
    page.click('#pc-body .pc-btn.primary')
    e1 = page.inner_text('#pc-ecr-erreur')
    assert 'Il manque un mot.' in e1 and attendu not in e1, e1
    assert page.evaluate("!document.getElementById('pc-ecr-input').disabled")
    page.screenshot(path=OUT + 'lot1-ecriture-diagnostic.png', full_page=True)
    page.fill('#pc-ecr-input', 'xxx')
    page.click('#pc-body .pc-btn.primary')
    assert attendu.rstrip('.?!') in page.inner_text('#pc-feedback')
    ok('écriture « ' + attendu + ' » : 1er essai → « Il manque un mot », sans la réponse ; 2e essai → réponse')

    # ── S12 : aucune taille de texte sous 12 px sur les écrans du lot ──
    trop_petits = page.evaluate("""() => {
        const vues = ['goDashboard()', 'goLessons()', "openParcoursLecon(lecons.find(l => l.id === 2))", 'openIntro(1)'];
        const out = [];
        vues.forEach(v => {
            eval(v);
            document.querySelectorAll('.view.active *').forEach(el => {
                if (!el.offsetParent || !el.childNodes.length) return;
                const texte = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
                if (texte && parseFloat(getComputedStyle(el).fontSize) < 12) out.push(v + ' ' + el.className + ' ' + getComputedStyle(el).fontSize);
            });
        });
        return out;
    }""")
    assert not trop_petits, trop_petits[:5]
    ok('aucun texte sous 12 px (accueil, leçons, leçon 2, intro)')

    print('\nErreurs JavaScript :', erreurs_js or 'aucune')
    nav.close()
