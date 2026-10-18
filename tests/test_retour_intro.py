"""Spec 38 : une fois l'introduction de mission consommée (« J'ai compris »,
unité lancée, leçon validée par la mission), Retour n'y ramène plus.
Régression exacte : leçon 20, unité avec une erreur, « Refaire mes erreurs »,
puis Retour. Exploration (« Voir les unités », « Tente ta chance ») préservée."""
from playwright.sync_api import sync_playwright
from helpers import relancer, ok, vue as actif, item_courant, repondre, finir, masquer_regles_vies, ouvrir

L = 20


def pile(pg):
    return pg.evaluate("pileNav.map(e => e.vue)")


def libelle_retour(pg):
    return pg.evaluate("nomEcran(ecranPrecedent())")


def remise_a_zero(pg):
    pg.evaluate("localStorage.clear()")
    relancer(pg)
    masquer_regles_vies(pg)
    pg.evaluate("choisirNiveau('A1.2'); goLessons()")


with sync_playwright() as p:
    b, pg, erreurs_js = ouvrir(p)

    # ── 1. Régression exacte : chemin → introduction → J'ai compris → unité (1 erreur)
    #       → résultats → Refaire mes erreurs → résultat → Retour ──
    remise_a_zero(pg)
    pg.evaluate("lancerActionLecon(%d)" % L)
    assert actif(pg) == 'view-msintro'
    pg.click('#msi-content button.primary')
    assert actif(pg) == 'view-pintro' and libelle_retour(pg) == 'Mon chemin', (pile(pg), libelle_retour(pg))
    pg.click('#pi-commencer')
    finir(pg, erreurs=1)
    assert actif(pg) == 'view-pfin'
    etoiles = pg.evaluate("getUnitBest(%d, pResultat.uniteId)" % L)
    unite = pg.evaluate("pResultat.uniteId")
    pg.click('text=Refaire mes erreurs')
    finir(pg)
    assert actif(pg) == 'view-pfin'
    avant = pile(pg)
    assert 'view-msintro' not in avant, avant
    assert libelle_retour(pg) == 'Mon chemin', libelle_retour(pg)
    assert 'Introduction' not in pg.inner_text('#view-pfin')
    pg.go_back(); pg.wait_for_timeout(200)  # Retour (téléphone ou navigateur)
    assert actif(pg) == 'view-lessons', actif(pg)
    assert pg.evaluate("getUnitBest(%d, %d)" % (L, unite)) == etoiles, 'étoiles inchangées'
    ok('leçon 20 : J\'ai compris → unité (1 erreur) → Refaire mes erreurs → Retour : « Mon chemin », jamais « Introduction » ; étoiles inchangées (pile ' + ' > '.join(avant) + ')')

    # Trois Retours de suite (flèche de l'app) : aucune boucle, jamais l'introduction
    vues = []
    for _ in range(3):
        pg.evaluate("retour()"); pg.wait_for_timeout(100)
        vues.append(actif(pg))
    assert vues == ['view-dashboard'] * 3, vues
    ok('trois Retours de plus : accueil, sans introduction ni résultats')

    # Leçon déjà commencée : pas d'introduction, Retour → chemin
    pg.evaluate("goLessons()"); pg.evaluate("lancerActionLecon(%d)" % L)
    assert actif(pg) != 'view-msintro'
    pg.go_back(); pg.wait_for_timeout(200)
    assert actif(pg) == 'view-lessons'
    ok('leçon déjà commencée : pas d\'introduction, Retour → chemin')

    # ── 2. Exploration : Voir les unités → Retour = introduction (spec 18) ──
    remise_a_zero(pg)
    pg.evaluate("lancerActionLecon(%d)" % L)
    pg.click('#msi-content button:has-text("Voir les unités")')
    assert actif(pg) == 'view-plecon' and libelle_retour(pg) == 'Introduction'
    pg.click('#view-plecon [data-retour]'); pg.wait_for_timeout(200)
    assert actif(pg) == 'view-msintro' and not pg.evaluate("getIntroMissionVue(%d)" % L)
    ok('Voir les unités → Retour : introduction, rien de confirmé')

    # Voir les unités → lancer une unité → résultats → Retour : leçon puis chemin
    pg.click('#msi-content button:has-text("Voir les unités")')
    pg.evaluate("openIntro(unitesCoeur(pLecon)[0].id)")
    assert libelle_retour(pg) == 'Leçon %d' % pg.evaluate('numLecon(%d)' % L), libelle_retour(pg)
    pg.click('#pi-commencer')
    finir(pg)
    assert actif(pg) == 'view-pfin' and 'view-msintro' not in pile(pg), pile(pg)
    pg.go_back(); pg.wait_for_timeout(200)
    assert actif(pg) == 'view-plecon', actif(pg)
    pg.go_back(); pg.wait_for_timeout(200)
    assert actif(pg) == 'view-lessons', actif(pg)
    assert not pg.evaluate("getIntroMissionVue(%d)" % L), 'lancer une unité ne confirme pas l\'introduction'
    ok('Voir les unités → unité → résultats → Retour : la leçon, puis chemin ; introduction non confirmée')

    # ── 3. Tente ta chance abandonnée : Retour = introduction (exploration) ──
    remise_a_zero(pg)
    pg.evaluate("lancerActionLecon(%d)" % L)
    pg.click('#msi-content .msi-tenter')
    assert actif(pg) == 'view-mission' and libelle_retour(pg) == 'Introduction'
    pg.go_back(); pg.wait_for_timeout(200)
    assert actif(pg) == 'view-msintro'
    ok('Tente ta chance abandonnée → Retour : introduction')

    # Tente ta chance réussie : leçon validée, Retour → chemin
    pg.click('#msi-content .msi-tenter')
    pg.evaluate("""() => { while (ms.idx < pLecon.scene.length && document.getElementById('ms-input')) {
        document.getElementById('ms-input').value = pLecon.scene[ms.idx].lu;
        document.getElementById('ms-btn-valider').click();
        const c = document.getElementById('ms-continuer'); if (c) c.click(); } }""")
    pg.wait_for_timeout(300)
    assert pg.evaluate("missionReussie(lecons.find(l => l.id === %d))" % L)
    assert 'view-msintro' not in pile(pg) and libelle_retour(pg) == 'Mon chemin', (pile(pg), libelle_retour(pg))
    assert 'Mon chemin' in pg.get_attribute('#view-mission [data-retour]', 'aria-label')
    pg.go_back(); pg.wait_for_timeout(200)
    assert actif(pg) == 'view-lessons', actif(pg)
    ok('Tente ta chance réussie : leçon validée, Retour → chemin (plus d\'introduction)')

    b.close()

print()
print('Erreurs JavaScript :', erreurs_js or 'aucune')
if erreurs_js:
    raise SystemExit(1)
