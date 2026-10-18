"""Navigation (specs 12 à 16) : Mon chemin en accordéon et compact, Retour qui
ramène à l'écran précédent (aussi le bouton Retour du téléphone), mission en
conversation. Téléphone simulé (écran tactile : le clavier ne s'ouvre jamais seul)."""
import os
from playwright.sync_api import sync_playwright
U = os.environ.get('LUX_URL', 'http://localhost:3456/')
S = os.path.join(os.path.dirname(__file__), 'captures', 'nav-')
os.makedirs(os.path.dirname(S), exist_ok=True)
def ok(m): print('  ok  ', m, flush=True)
def actif(pg, v): return pg.evaluate("id => document.getElementById(id).classList.contains('active')", v)
def rect(pg, sel): return pg.evaluate("s => { const r = document.querySelector(s).getBoundingClientRect(); return {top: r.top, bottom: r.bottom}; }", sel)
def nav_haut(pg): return pg.evaluate("innerHeight - document.getElementById('nav-bas').offsetHeight")
with sync_playwright() as p:
    b=p.chromium.launch()
    ctx=b.new_context(viewport={'width':390,'height':844}, device_scale_factor=2, is_mobile=True, has_touch=True)
    pg=ctx.new_page()
    errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.route('**/*gstatic*/**', lambda r: r.abort()); pg.route('**/fonts.googleapis.com/**', lambda r: r.abort())
    pg.goto(U); pg.wait_for_selector('#today')
    pg.evaluate("(p => { p.guide = { viesMasquees: 1 }; saveProgress(p); })(getProgress())")  # rappel des vies masqué (spec 36)
    pg.evaluate("choisirNiveau('A1.1'); marquerJour(1); saveUnitBest(1,1,90); marquerIntroMissionVue(1); goDashboard()")
    # 1. Chemin depuis l'accueil
    pg.click('.ac-btn:has-text("Leçons")'); pg.wait_for_timeout(700)
    h1 = rect(pg, '.chemin-tete h1'); cta = rect(pg, '.pas.ouverte .btn-jaune')
    assert h1['top'] >= 0 and pg.evaluate('scrollY') == 0, h1
    assert cta['bottom'] <= nav_haut(pg), (cta, nav_haut(pg))
    assert pg.locator('.pas.ouverte').count() == 1 and pg.locator('#chemin-lecon-1.ouverte').count() == 1
    assert pg.locator('.unites li.actuelle.pulse').count() == 1 and pg.locator('.unites .ic.droite').count() >= 4
    pg.screenshot(path=S+'01-chemin.png')
    ok('chemin depuis l\'accueil : titre visible, leçon 1 dépliée, CTA « %s » au-dessus de la barre, étape conseillée qui pulse, chevrons' % pg.inner_text('.pas.ouverte .btn-jaune'))
    # 2. Leçon 4
    pg.click('#chemin-lecon-4 .carte-lecon'); pg.wait_for_timeout(500)
    assert pg.locator('.pas.ouverte').count() == 1 and pg.locator('#chemin-lecon-4.ouverte').count() == 1
    r = rect(pg, '#chemin-lecon-4'); assert r['top'] >= 0 and r['bottom'] <= nav_haut(pg) + 1, r
    pg.screenshot(path=S+'02-lecon4.png')
    ok('leçon 4 : leçon 1 repliée, leçon 4 dépliée et cadrée · CTA « %s » (pour cette leçon)' % pg.inner_text('#chemin-lecon-4 .btn-jaune'))
    assert pg.evaluate('prochainPas().lecon.id') == 1
    ok('déplier la leçon 4 ne change pas la leçon conseillée (toujours la 1)')
    # 3. Replier
    pg.click('#chemin-lecon-4 .carte-tete'); pg.wait_for_timeout(300)
    assert pg.locator('.pas.ouverte').count() == 0
    ok('replier : plus aucune leçon dépliée')
    # 4-5. Unité depuis le chemin puis retour
    pg.click('#chemin-lecon-1 .carte-lecon'); pg.wait_for_timeout(400)
    pg.click('#chemin-u-1-2 button')
    assert actif(pg, 'view-pintro') and 'Mon chemin' in pg.inner_text('#view-pintro [data-retour]')
    pg.click('#pi-commencer')
    assert actif(pg, 'view-parcours')
    cible = pg.evaluate("motATaper(pLecon, trouverItem(pLecon,'flashcards', run.steps[run.stepIdx].queue[0]))")
    pg.locator('#mc-btn-reconstruire').count() and pg.click('#mc-btn-reconstruire')
    pg.fill('#mc-input', cible); pg.click('#mc-btn-valider'); pg.click('#pc-continuer')
    # cours ouvert puis fermé
    pg.click('#view-parcours .pc-cours-btn'); assert pg.is_visible('#cours-panel')
    pg.go_back(); pg.wait_for_timeout(300)
    assert not pg.is_visible('#cours-panel') and actif(pg, 'view-parcours')
    ok('Retour du téléphone avec le cours ouvert : le cours se ferme, l\'exercice reste')
    pg.click('#view-parcours [data-retour]'); pg.wait_for_timeout(300)
    assert actif(pg, 'view-lessons') and pg.locator('#chemin-lecon-1.ouverte').count() == 1
    r = rect(pg, '#chemin-u-1-2'); assert 0 <= r['top'] and r['bottom'] <= nav_haut(pg), r
    assert 'Reprendre' in pg.inner_text('#chemin-lecon-1 .btn-jaune')
    pg.screenshot(path=S+'03-retour-chemin.png')
    ok('exercice ouvert depuis le chemin → Retour : chemin, leçon 1 dépliée, unité 2 visible, « %s »' % pg.inner_text('#chemin-lecon-1 .btn-jaune'))
    # 6. Depuis la liste des unités
    pg.click('#chemin-lecon-1 .lien-or')
    assert actif(pg, 'view-plecon') and 'Mon chemin' in pg.inner_text('#view-plecon [data-retour]')
    pg.evaluate("openIntro(3)"); pg.click('#pi-commencer')
    pg.go_back(); pg.wait_for_timeout(300)
    assert actif(pg, 'view-plecon'), 'retour Android depuis l\'exercice'
    top = rect(pg, '#pl-unite-3')['top']
    ok('exercice ouvert depuis la liste des unités → Retour du téléphone : liste, unité 3 à %d px' % top)
    pg.go_back(); pg.wait_for_timeout(300)
    assert actif(pg, 'view-lessons')
    ok('Retour du téléphone depuis la leçon : Mon chemin')
    pg.go_back(); pg.wait_for_timeout(300)
    assert actif(pg, 'view-dashboard')
    ok('Retour du téléphone depuis le chemin : accueil (la racine, sans écran piège)')
    # 9-10. Tente ta chance : dialogue compact
    pg.evaluate("marquerIntroMissionVue(2); goLessons()"); pg.click('#chemin-lecon-2 .carte-lecon')
    pg.click('#chemin-lecon-2 .lien-or'); pg.click('#pl-mission .ms-tenter')
    assert actif(pg, 'view-mission')
    assert pg.evaluate("document.activeElement.id") != 'ms-input'
    caches = pg.evaluate("[...document.querySelectorAll('#ms-body .ms-bulle:not(.ms-saisie) em')].every(e => getComputedStyle(e).display === 'none')")
    assert caches
    pg.screenshot(path=S+'04-mission.png')
    ok('Tente ta chance : bulle de saisie, traductions des autres cachées, clavier fermé')
    pg.fill('#ms-input', 'zzz'); pg.click('#ms-btn-valider')
    assert pg.is_visible('#ms-erreur') and pg.input_value('#ms-input') == 'zzz'
    pg.screenshot(path=S+'05-mission-erreur.png')
    pg.fill('#ms-input', pg.evaluate("pLecon.scene[ms.idx].lu")); pg.click('#ms-btn-valider')
    assert pg.locator('#ms-body .ms-bulle.valide').count() == 1 and pg.is_visible('#ms-continuer')
    pg.screenshot(path=S+'06-mission-juste.png')
    ok('réplique validée : la bulle devient « Toi ✓ » dans la conversation, Continuer')
    pg.click('#ms-continuer')
    if pg.locator('#ms-body .ms-bulle:not(.ms-saisie)').count():
        pg.click('#ms-body .ms-bulle:not(.ms-saisie) >> nth=0')
        assert pg.locator('#ms-body .ms-bulle.traduite').count() >= 1
        ok('appui sur une bulle : sa traduction s\'affiche')
    pg.click('#view-mission [data-retour]'); pg.wait_for_timeout(300)
    assert actif(pg, 'view-plecon')
    ok('Retour depuis la mission : la leçon d\'où on venait')
    # 12. Carte en bas d'écran
    pg.evaluate("goLessons()"); pg.click('#chemin-lecon-8 .carte-lecon'); pg.wait_for_timeout(600)
    cta = rect(pg, '#chemin-lecon-8 .btn-jaune')
    assert cta['bottom'] <= nav_haut(pg) + 1 and cta['top'] >= 0, cta
    pg.screenshot(path=S+'07-lecon8-bas.png')
    ok('leçon 8 dépliée en bas du chemin : carte cadrée, CTA accessible au-dessus de la barre')
    print('\nErreurs JavaScript :', errs or 'aucune')
    assert not errs
