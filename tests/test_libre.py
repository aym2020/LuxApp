"""Spec 22 : la progression principale et l'entraînement libre sont séparés.
Refaire une unité terminée (ou le « + », une étape seule, ses erreurs…) ne
change jamais la prochaine étape recommandée ; les deux parties interrompues
sont gardées. Migration d'une ancienne partie. Téléphone simulé."""
import os
from playwright.sync_api import sync_playwright

URL = os.environ.get('LUX_URL', 'http://localhost:3456/')


def ok(m):
    print('  ok  ', m, flush=True)


def actif(pg, v):
    return pg.evaluate("id => document.getElementById(id).classList.contains('active')", v)


def repondre_quelques(pg, n):
    # Répond juste à n items de la partie affichée, puis quitte (Retour).
    for _ in range(n):
        pg.evaluate("""() => {
            const s = run.steps[run.stepIdx]; const id = s.queue[0];
            const it = trouverItem(pLecon, s.type, id);
            enregistrer(it, 1, true); reussir();
        }""")
    pg.click('#view-parcours [data-retour]')
    pg.wait_for_timeout(150)


with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 390, 'height': 844})
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.route('**/*gstatic*/**', lambda r: r.abort())
    pg.route('**/fonts.googleapis.com/**', lambda r: r.abort())
    pg.goto(URL)
    pg.wait_for_selector('#today')
    pg.evaluate("(p => { p.guide = { viesMasquees: 1 }; saveProgress(p); })(getProgress())")  # rappel des vies masqué (spec 36)
    pg.evaluate("choisirNiveau('A1.1'); marquerIntroMissionVue(1); saveUnitBest(1, 1, 100); saveUnitBest(1, 2, 100); goLessons()")

    # Unités 1 et 2 terminées → unité 3 recommandée
    assert pg.evaluate("prochainPas().unite.id") == 3
    assert pg.inner_text('#chemin-lecon-1 .btn-jaune') == 'Continuer'
    ok('unités 1 et 2 terminées : unité 3 recommandée')

    # Refaire l'unité 1, l'interrompre → unité 3 toujours recommandée
    pg.evaluate("openParcoursLecon(lecons.find(l => l.id === 1)); startUnite(1)")
    assert pg.evaluate("run.libre") is True
    repondre_quelques(pg, 3)
    assert pg.evaluate("prochainPas().type") == 'unite' and pg.evaluate("prochainPas().unite.id") == 3
    assert pg.evaluate("getUnitBest(1, 1)") == 100 and pg.evaluate("getUnitBest(1, 2)") == 100
    ok('refaire l\'unité 1 puis l\'interrompre : unité 3 toujours recommandée, unités 1 et 2 toujours terminées')

    # Accueil : Continuer → unité 3, pas « questions restantes » de la répétition
    pg.evaluate("goDashboard()")
    carte = pg.inner_text('#today')
    assert 'questions restantes' not in carte, carte
    ok('accueil : « %s »' % ' · '.join(carte.split('\n')[:4]))

    # Chemin : anneau sur l'unité 3, « Révision en cours » sur l'unité 1, CTA Continuer
    pg.evaluate("goLessons()")
    assert pg.locator('#chemin-u-1-3.actuelle').count() == 1 and pg.locator('#chemin-u-1-1.ok').count() == 1
    assert 'Révision en cours' in pg.inner_text('#chemin-u-1-1')
    assert pg.inner_text('#chemin-lecon-1 .btn-jaune') == 'Continuer'
    ok('chemin : anneau doré sur l\'unité 3, unité 1 ✓ avec « Révision en cours », bouton « Continuer »')

    # Retourner sur l'unité 1 → la révision reprend
    pas = pg.evaluate("run.steps[run.stepIdx].total - run.steps[run.stepIdx].queue.length")
    pg.click('#chemin-u-1-1 button')
    assert actif(pg, 'view-parcours') and pg.evaluate("run.libre") is True
    assert pg.evaluate("run.steps[run.stepIdx].total - run.steps[run.stepIdx].queue.length") == pas
    pg.click('#view-parcours [data-retour]'); pg.wait_for_timeout(150)
    ok('appui sur l\'unité 1 : la révision reprend où elle s\'était arrêtée')

    # Écran de la leçon : « Reprendre la révision » en secondaire, unité 3 en principal
    pg.evaluate("openParcoursLecon(lecons.find(l => l.id === 1))")
    assert pg.locator('#pl-unite-1 .pl-reprendre-revision').count() == 1
    assert pg.locator('#pl-unite-3.prochaine .pc-btn.primary').count() == 1
    ok('écran de la leçon : « Reprendre la révision » sur l\'unité 1, action principale sur l\'unité 3')

    # Partie principale interrompue + répétition libre : les deux gardées
    pg.evaluate("startUnite(3)")
    assert pg.evaluate("run.libre") is False
    repondre_quelques(pg, 2)
    assert pg.evaluate("loadRun().uniteId") == 3 and pg.evaluate("loadRun(true).uniteId") == 1
    ok('unité 3 (principale) interrompue + révision de l\'unité 1 : les deux parties sont gardées')

    # Terminer la répétition libre → la principale reste intacte, meilleur score conservé
    pg.evaluate("""() => { reprendreRun(true);
        run.steps.forEach(s => { s.queue.forEach(id => { s.scores[id] = s.scores[id] ?? 0.5; s.details[id] = s.details[id] || {ok:false}; }); s.queue = []; });
        finirRun(); }""")
    assert pg.evaluate("loadRun(true)") is None and pg.evaluate("loadRun().uniteId") == 3
    assert pg.evaluate("getUnitBest(1, 1)") == 100
    assert pg.evaluate("prochainPas().type") == 'reprise' and pg.evaluate("prochainPas().lecon.id") == 1
    ok('répétition terminée (moins bien) : meilleur score gardé à 100 %, partie principale de l\'unité 3 intacte et proposée')

    # Le « + », une étape seule, les erreurs : libres
    libres = pg.evaluate("""() => ['plus', 'etape', 'erreurs', 'lecon'].map(m => partieLibre(1, m === 'lecon' ? 'all' : 1, m))""")
    assert all(libres), libres
    ok('« + », étape seule, erreurs, leçon complète : entraînement libre')

    # Changer de niveau : rien d'un autre niveau n'est recommandé
    pg.evaluate("choisirNiveau('A1.2')")
    pas = pg.evaluate("prochainPas()")
    assert pas is None or pg.evaluate("prochainPas().lecon.id") >= 18, pas
    pg.evaluate("choisirNiveau('A1.1')")
    ok('niveau A1.2 : aucune recommandation venant de l\'A1.1')

    # Rejouer une mission réussie : parcours inchangé
    pg.evaluate("saveMissionBest(1, 100)")
    avant = pg.evaluate("JSON.stringify([prochainPas().type, prochainPas().lecon.id])")
    pg.evaluate("openParcoursLecon(lecons.find(l => l.id === 1)); openMission()")
    pg.click('#view-mission [data-retour]'); pg.wait_for_timeout(150)
    assert pg.evaluate("JSON.stringify([prochainPas().type, prochainPas().lecon.id])") == avant
    ok('rejouer une mission réussie : parcours inchangé')

    # Migration : une ancienne partie (sans « libre ») qui refait une unité terminée
    pg.evaluate("""() => {
        clearRun(true);
        const ancienne = { leconId: 1, uniteId: 2, mode: 'unite', stepIdx: 0, maj: 1700000000000,
          steps: [{ type: 'quiz', queue: [2101], total: 3, scores: {}, details: {} }] };
        localStorage.setItem(storageKey('luxParcours'), JSON.stringify(ancienne));
        migrerParties();
    }""")
    assert pg.evaluate("loadRun()") is None and pg.evaluate("loadRun(true).uniteId") == 2
    ok('migration : une ancienne répétition passe dans l\'entraînement libre, sans perte')

    print('\nErreurs JavaScript :', errs or 'aucune')
    assert not errs
    b.close()
