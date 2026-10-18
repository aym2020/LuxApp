"""Spec 44 : (1) « Mon chemin » après « Refaire mes erreurs » déplie la leçon
travaillée, seule, cadrée ; (2) une actualisation garde l'écran : chemin
(leçon dépliée + position), leçon, exercice et mission en cours (réponses et
vies gardées), autre onglet. Accueil seulement si la restauration est
impossible (autre profil…). Téléphone Android simulé puis ordinateur."""
from playwright.sync_api import sync_playwright
from helpers import ok, vue, URL, masquer_regles_vies, finir, repondre

L = 8  # leçon A1.1 du milieu du chemin


def actualiser(pg):
    pg.reload()
    pg.wait_for_function("typeof navigationRestauree !== 'undefined' && navigationRestauree === true && lecons.length > 0")
    pg.wait_for_timeout(450)  # placements différés (polices, 400 ms)


def preparer(pg):
    masquer_regles_vies(pg)
    pg.evaluate("choisirNiveau('A1.1'); lecons.forEach(l => marquerIntroMissionVue(l.id))")


def scenario(p, nom, mobile):
    b = p.chromium.launch()
    ctx = b.new_context(viewport={'width': 390, 'height': 844} if mobile else {'width': 1280, 'height': 800},
                        is_mobile=mobile, has_touch=mobile)
    pg = ctx.new_page()
    erreurs = []
    pg.on('pageerror', lambda e: erreurs.append(str(e)))
    pg.route('**/*gstatic*/**', lambda r: r.abort())
    pg.route('**/fonts.googleapis.com/**', lambda r: r.abort())
    pg.goto(URL)
    pg.wait_for_selector('#today')
    preparer(pg)

    # ── 1. Refaire mes erreurs → Mon chemin : leçon travaillée dépliée, seule, cadrée ──
    pg.evaluate("goLessons()")
    pg.evaluate("ouvrirUniteDepuisChemin(%d, 1)" % L)
    pg.click('#pi-commencer')
    finir(pg, erreurs=1)
    pg.click('text=Refaire mes erreurs')
    finir(pg)
    pg.click('#pf-suite')
    pg.wait_for_timeout(600)
    r = pg.evaluate("""id => { const c = document.getElementById('chemin-lecon-' + id).getBoundingClientRect();
        return { vue: document.querySelector('.view.active').id, ouvertes: [...document.querySelectorAll('#lecon-list .ouverte')].map(e => e.id),
                 haut: c.top, bas: c.bottom, zone: basVisibleChemin(), unites: document.querySelectorAll('#chemin-lecon-' + id + ' [id^="chemin-u-"]').length,
                 bouton: !!document.querySelector('#chemin-lecon-' + id + ' .btn-jaune') }; }""", L)
    assert r['vue'] == 'view-lessons' and r['ouvertes'] == ['chemin-lecon-%d' % L], r
    assert r['unites'] >= 2 and r['bouton'], r
    tient = r['bas'] - r['haut'] <= r['zone'] - 12
    assert r['haut'] >= 11 and (r['bas'] <= r['zone'] + 1 if tient else abs(r['haut'] - 12) < 2), r
    y = pg.evaluate('scrollY')
    pg.wait_for_timeout(700)
    assert pg.evaluate('scrollY') == y, 'pas de déplacement ultérieur'
    ok(nom + ' Refaire mes erreurs → Mon chemin : leçon %d seule dépliée (unités, bouton), cadrée, stable' % L)

    # ── 2a. Chemin : leçon dépliée et position gardées ──
    pg.evaluate("window.scrollBy(0, 120)")
    y = pg.evaluate('scrollY')
    longueur = pg.evaluate('history.length')
    actualiser(pg)
    assert vue(pg) == 'view-lessons', vue(pg)
    assert pg.evaluate("[...document.querySelectorAll('#lecon-list .ouverte')].map(e => e.id)") == ['chemin-lecon-%d' % L]
    assert abs(pg.evaluate('scrollY') - y) <= 2, (pg.evaluate('scrollY'), y)
    actualiser(pg)
    assert vue(pg) == 'view-lessons' and pg.evaluate('history.length') == longueur, 'historique stable'
    ok(nom + ' chemin actualisé (×2) : même leçon dépliée, même position (%d px), historique inchangé' % y)

    # Retour après l'actualisation : comme avant (accueil)
    pg.go_back(); pg.wait_for_timeout(200)
    assert vue(pg) == 'view-dashboard', vue(pg)
    ok(nom + ' Retour après actualisation : accueil, comme avant')

    # ── 2b. Dans une leçon ──
    pg.evaluate("goLessons()")
    pg.evaluate("openParcoursLecon(lecons.find(l => l.id === %d))" % L)
    actualiser(pg)
    assert vue(pg) == 'view-plecon' and pg.evaluate('pLecon.id') == L
    pg.go_back(); pg.wait_for_timeout(200)
    assert vue(pg) == 'view-lessons', 'Retour → chemin (historique gardé)'
    ok(nom + ' leçon actualisée : même leçon ; Retour → chemin')

    # ── 2c. Exercice en cours : réponses gardées ──
    pg.evaluate("ouvrirUniteDepuisChemin(%d, 2)" % L)
    pg.click('#pi-commencer')
    for _ in range(4):
        repondre(pg, True)
    avant = pg.evaluate("[run.uniteId, run.stepIdx, run.steps[run.stepIdx].queue.length]")
    actualiser(pg)
    assert vue(pg) == 'view-parcours', vue(pg)
    assert pg.evaluate("[run.uniteId, run.stepIdx, run.steps[run.stepIdx].queue.length]") == avant
    ok(nom + ' exercice actualisé : même partie, même avancement %s' % avant)
    pg.go_back(); pg.wait_for_timeout(200)
    assert vue(pg) == 'view-lessons', vue(pg)

    # ── 2d. Mission en cours : réponses validées et vies gardées ──
    pg.evaluate("openParcoursLecon(lecons.find(l => l.id === %d))" % L)
    pg.evaluate("openMission()")
    for i in range(3):
        lu = pg.evaluate("pLecon.scene[ms.idx].lu")
        if i == 1:
            pg.fill('#ms-input', 'Ech weess et net'); pg.click('#ms-btn-valider')
        pg.fill('#ms-input', lu); pg.click('#ms-btn-valider'); pg.click('#ms-continuer')
    etat = pg.evaluate("({ idx: ms.idx, vies: ms.vies, faits: ms.resultats.filter(Boolean).length })")
    bulles = pg.locator('#ms-body .ms-bulle').count()
    # une erreur en cours sur la réplique suivante (vie déjà perdue)
    pg.fill('#ms-input', 'Ech weess et net'); pg.click('#ms-btn-valider')
    actualiser(pg)
    assert vue(pg) == 'view-mission' and not pg.is_visible('.ms-regles')
    apres = pg.evaluate("({ idx: ms.idx, vies: ms.vies, faits: ms.resultats.filter(Boolean).length, essais: ms.essais })")
    assert apres['idx'] == etat['idx'] and apres['faits'] == 3 and apres['vies'] == etat['vies'] - 1 and apres['essais'] == 1, (etat, apres)
    assert pg.locator('#ms-body .ms-bulle').count() == bulles and pg.locator('#ms-input').count() == 1
    pg.fill('#ms-input', 'Ech weess et net'); pg.click('#ms-btn-valider')
    assert pg.evaluate("ms.vies") == apres['vies'], 'pas de 2e vie perdue sur la même réplique'
    ok(nom + ' mission actualisée : 3 réponses gardées, vies %d, erreur en cours sans vie de plus' % apres['vies'])

    # Réplique validée, « Continuer » pas encore touché : on passe à la suivante
    pg.fill('#ms-input', pg.evaluate("pLecon.scene[ms.idx].lu")); pg.click('#ms-btn-valider')
    idx = pg.evaluate("ms.idx")
    actualiser(pg)
    assert pg.evaluate("ms.idx") > idx and pg.evaluate("ms.resultats.filter(Boolean).length") == 4
    ok(nom + ' réplique validée avant « Continuer » : gardée, la mission reprend à la suivante')

    # ── 2e. Autre onglet ──
    pg.evaluate("fermerPanneau(); openLexique()")
    actualiser(pg)
    assert vue(pg) == 'view-lexique'
    pg.evaluate("openReviewSetup()")
    actualiser(pg)
    assert vue(pg) == 'view-review-setup'
    ok(nom + ' onglets Lexique et Réviser : gardés après actualisation')

    # ── 2f. Restauration impossible → accueil ──
    pg.evaluate("goLessons()")
    pg.evaluate("""() => {
        sauverNavigation();
        const e = JSON.parse(sessionStorage.getItem('luxNavigation'));
        e.profil = 'user:quelqu-un-d-autre';
        sessionStorage.setItem('luxNavigation', JSON.stringify(e));
        window.removeEventListener('pagehide', sauverNavigation);
        sauverNavigation = function () {};  // la note modifiée n'est pas réécrite au départ
    }""")
    pg.reload(); pg.wait_for_function("typeof navigationRestauree !== 'undefined' && navigationRestauree === true && lecons.length > 0")
    pg.wait_for_timeout(100)
    assert vue(pg) == 'view-dashboard'
    ok(nom + ' écran noté pour un autre profil : accueil (isolation)')

    # Retour depuis l'accueil après plusieurs actualisations : on quitte l'app (anciennes entrées sautées)
    pg.go_back()
    pg.wait_for_function("location.href === 'about:blank'", timeout=5000)
    ok(nom + ' Retour depuis l\'accueil : quitte l\'app (aucune entrée d\'historique en trop)')
    b.close()
    return erreurs


with sync_playwright() as p:
    erreurs = scenario(p, '[Android]', True) + scenario(p, '[PC]', False)

print()
print('Erreurs JavaScript :', erreurs or 'aucune')
if erreurs:
    raise SystemExit(1)
