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
    # getClientRects : fonctionne aussi pour les éléments fixés (barre du bas, panneau)
    return page.evaluate("s => { const e = document.querySelector(s); return !!e && e.getClientRects().length > 0; }", selecteur)


with sync_playwright() as p:
    nav = p.chromium.launch()
    page = nav.new_page(viewport={'width': 390, 'height': 844}, device_scale_factor=2)
    page.route('**/*gstatic*/**', lambda r: r.abort())
    page.route('**/fonts.googleapis.com/**', lambda r: r.abort())
    page.on('pageerror', lambda e: erreurs_js.append(str(e)))
    page.on('dialog', lambda d: d.accept())
    page.goto(URL)
    page.wait_for_selector('#today')

    # ── V3 : profil neuf = accueil « Prêt à commencer ? » + puces de niveau ──
    assert 'Prêt à commencer' in page.inner_text('#view-dashboard')
    assert page.locator('.puce-niv').count() == len(page.evaluate('niveauxDisponibles()'))
    assert page.get_attribute('.puce-niv >> nth=0', 'aria-pressed') == 'true'
    assert 'Commencer' in page.inner_text('#today') and 'Leçon 1' in page.inner_text('#today')
    assert page.locator('.ac-btn').all_inner_texts() == ['Leçons', 'Réviser', 'Examens', 'Erreurs fréquentes']
    assert not visible(page, '.ac-chiffres'), 'pas de chiffres au premier lancement'
    assert not visible(page, '#nav-bas'), 'pas de barre du bas sur l\'accueil'
    assert page.locator('#view-dashboard >> text=Réinitialiser').count() == 0
    assert '1592' not in page.inner_text('#view-dashboard')
    ok('profil neuf : « Commencer · Leçon 1 », A1.1 présélectionné, 4 accès visibles, ni chiffres, ni barre, ni « Réinitialiser »')

    page.click('#today .carte-suite')
    assert page.evaluate('niveauChoisi()') == 'A1.1'
    assert actif(page, 'view-msintro'), '1re découverte : introduction de la mission attendue'
    assert 'J\'ai compris' in page.inner_text('#msi-content')
    ok('« Commencer » → leçon 1 en unités, introduction de la mission (1re découverte)')

    # ── Leçon migrée : l'acquis v1 est gardé (ids < 1000), le guide passe à la leçon 2 ──
    page.evaluate("""() => {
        const progress = getProgress();
        progress[1] = { quiz: {}, trous: {}, ecriture: {} };
        for (let i = 1; i <= 35; i++) progress[1].quiz[i] = 3;
        for (let i = 1; i <= 25; i++) progress[1].trous[i] = 3;
        for (let i = 0; i < 43; i++) progress[1].ecriture[i] = 3;
        saveProgress(progress);
        updateQuestionStats(1, 'quiz', 1, true);
        goDashboard();
    }""")
    assert page.evaluate('acquisV1(lecons.find(l => l.id === 1))')
    assert page.evaluate('leconTerminee(lecons.find(l => l.id === 1))')
    assert page.evaluate('getUnitBest(1, 1)') is None, 'aucun score inventé pour les nouvelles unités'
    assert 'Leçon 2' in page.evaluate('prochainPas().texte')
    assert not page.evaluate('getLeconVue(2)')
    page.evaluate('prochainPas().fn()')
    assert actif(page, 'view-msintro'), '1re visite : introduction de la mission attendue'
    page.evaluate('goDashboard(); prochainPas().fn()')
    assert actif(page, 'view-msintro'), 'introduction pas confirmée : on la remontre'
    page.click('#msi-content button:has-text("Voir les unités")')
    assert actif(page, 'view-plecon') and visible(page, '.ms-carte.compacte')
    page.evaluate('goDashboard(); prochainPas().fn()')
    assert actif(page, 'view-msintro'), '« Voir les unités » est de l\'exploration : introduction remontrée (spec 18)'
    page.click('#msi-content button.primary')  # « J'ai compris » : confirmation
    page.evaluate('goDashboard(); prochainPas().fn()')
    assert actif(page, 'view-pintro'), 'intro confirmée : intro de l\'unité attendue'
    ok('leçon 1 acquise en v1 → terminée, sans score inventé ; prochain pas = leçon 2 ; introduction de mission jusqu\'à confirmation, ensuite → intro d\'unité')

    # ── S3 : compteurs acquis (dans le menu « Plus », S9) ──
    page.evaluate('goDashboard()')
    page.click('.ac-menu')
    tuiles = page.locator('.plus-acquis span').all_inner_texts()
    # Spec 46 : les vraies unités d'un côté, la leçon acquise en v1 de l'autre
    assert tuiles == ['unités terminées', 'leçons acquises · v1', 'missions réussies', 'jours de pratique'], tuiles
    assert page.inner_text('.plus-acquis b >> nth=0') == '0' and page.inner_text('.plus-acquis b >> nth=1') == '1'
    page.click('.plus-ligne:has-text("Réglages")')
    assert actif(page, 'view-reglages') and visible(page, '#view-reglages .dash-reset')
    page.screenshot(path=OUT + 'lot1-reglages.png', full_page=True)
    ok('acquis dans « Plus » (unités, missions réussies, jours) ; « Réinitialiser » dans Réglages')

    # ── S4 : mission lisible ──
    page.evaluate('openParcoursLecon(lecons.find(l => l.id === 2))')
    assert page.locator('.ms-carte.compacte .ms-bulle').count() == 0, 'carte compacte : pas de scène'
    assert page.inner_text('.ms-carte .ms-etat') == 'À découvrir'
    nb_scene = page.evaluate('pLecon.scene.length')
    assert page.inner_text('.ms-bas') == 'Tu sais dire 0 réplique sur %d' % nb_scene, page.inner_text('.ms-bas')
    page.click('.ms-carte button:has-text("Voir le scénario")')
    assert page.locator('.panneau .ms-bulle').count() == nb_scene
    page.evaluate('fermerPanneau()')
    page.evaluate('saveUnitBest(2, 1, 100); renderParcoursLecon(); voirScenario()')
    assert page.locator('.panneau .ms-pastille.apprise').count() >= 1
    page.evaluate('fermerPanneau()')
    assert page.inner_text('.ms-carte .ms-etat') == 'En préparation'
    page.evaluate('saveMissionBest(2, 60, 2); renderParcoursLecon()')  # scène version 2 (spec 34)
    assert 'JOUÉE 60 % · À REJOUER' in page.inner_text('.ms-carte .pc-mini-label')
    assert not page.evaluate('missionReussie(lecons.find(l => l.id === 2))')
    page.evaluate('saveMissionBest(2, 85, 2); marquerMissionReussie(2, 2); renderParcoursLecon()')  # réussie = au moins une vie (spec 32)
    assert 'RÉUSSIE 85 %' in page.inner_text('.ms-carte .pc-mini-label')
    page.evaluate('goDashboard(); ouvrirPlus()')
    assert page.inner_text('.plus-acquis b >> nth=1') == '1'
    page.evaluate('fermerPanneau()')
    ok('mission : carte compacte (À découvrir → En préparation), scénario complet dans un panneau, pastilles d\'unité, Jouée 60 % / Réussie 85 %, tuile comptée')

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
    page.locator('#mc-btn-reconstruire').count() and page.click('#mc-btn-reconstruire')  # mot nouveau : découverte d'abord
    page.fill('#mc-input', 'bag')
    page.click('#mc-btn-valider')
    err1 = page.inner_text('#mc-erreur')
    assert 'Mapp' not in err1, err1
    page.locator('#mc-btn-reconstruire').count() and page.click('#mc-btn-reconstruire')  # mot nouveau : découverte d'abord
    page.fill('#mc-input', 'Mappe')
    page.click('#mc-btn-valider')
    err2 = page.inner_text('#mc-erreur')
    assert 'Mapp' in err2, err2
    page.screenshot(path=OUT + 'lot1-aide-2e-essai.png', full_page=True)
    # S5 : unité « article à écrire » : l'article n'est pas affiché, « Mapp » seul est refusé.
    assert page.locator('#pc-body .mc-article').count() == 0, 'article affiché alors qu\'il est à écrire'
    page.locator('#mc-btn-reconstruire').count() and page.click('#mc-btn-reconstruire')  # mot nouveau : découverte d'abord
    page.fill('#mc-input', 'Mapp')
    page.click('#mc-btn-valider')
    assert not page.evaluate('pAttente'), '« Mapp » sans article accepté'
    page.locator('#mc-btn-reconstruire').count() and page.click('#mc-btn-reconstruire')  # mot nouveau : découverte d'abord
    page.fill('#mc-input', 'eng Mapp')
    page.click('#mc-btn-valider')
    assert 'Attention' in page.inner_text('#pc-feedback')
    ok('mot caché « un sac » : 1er essai sans « Mapp » (' + err1.split('\n')[-1][:50] + '…), 2e essai : note complète ; '
       '« Mapp » seul refusé, « eng Mapp » juste (S5)')

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
