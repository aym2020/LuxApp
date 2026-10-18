"""Spec 42 : nouvelle leçon « sinn / hunn » (id 27, affichée Leçon 20) sans
migration ; retours ciblés sur le mot en erreur ; aide vocabulaire fermée par
défaut et sans pénalité ; chemin cadré sur la leçon après « Refaire mes erreurs »."""
from playwright.sync_api import sync_playwright
from helpers import ok, vue, ouvrir, masquer_regles_vies, finir, lecon_cadree


def ecrire(pg, texte):
    pg.fill('#pc-ecr-input', texte)
    pg.click('#pc-ecr-valider')


def aller_a(pg, item_id):
    """Étape écriture : répond juste jusqu'à l'item voulu."""
    for _ in range(40):
        if pg.evaluate("run.steps[0].queue[0]") == item_id:
            return
        ecrire(pg, pg.evaluate("trouverItem(pLecon, 'ecriture', run.steps[0].queue[0]).lu"))
        pg.click('#pc-continuer')
    raise AssertionError('item %d non atteint' % item_id)


def ecriture(pg, lecon, unite, item_id):
    pg.evaluate("l => { choisirNiveau(lecons.find(x => x.id === l).niveau || 'A1.1'); openParcoursLecon(lecons.find(x => x.id === l)); }", lecon)
    pg.evaluate("u => startEtapeSeule(u, 'ecriture')", unite)
    aller_a(pg, item_id)


with sync_playwright() as p:
    b, pg, erreurs_js = ouvrir(p, mobile=True)
    masquer_regles_vies(pg)
    pg.evaluate("lecons.forEach(l => marquerIntroMissionVue(l.id))")

    # ── 1. Nouvelle leçon en tête de l'A1.2, numéros affichés décalés, ids inchangés ──
    ordre = pg.evaluate("leconsDuNiveau('A1.2').map(l => [l.id, numLecon(l)])")
    assert ordre[0] == [27, 20] and ordre[1] == [20, 21] and ordre[-1] == [26, 27], ordre
    pg.evaluate("choisirNiveau('A1.2'); goLessons()")
    carte = pg.inner_text('#chemin-lecon-27').lower()
    assert 'leçon 20' in carte and 'être et avoir' in carte, carte
    assert 'leçon 25' in pg.inner_text('#chemin-lecon-24').lower()
    l27 = pg.evaluate("(() => { const l = lecons.find(x => x.id === 27); return { u: l.unites.length, toi: l.scene.filter(x => x.qui === 'toi').length }; })()")
    assert l27 == {'u': 3, 'toi': 10}, l27
    ok('A1.2 : « Sinn an hunn » (id 27) affichée Leçon 20 en tête ; ancienne 20 → Leçon 21 … 26 → Leçon 27 ; ids inchangés')

    # Progression : rien n'est crédité à la nouvelle leçon, l'ancienne reste attachée à son id
    pg.evaluate("saveUnitBest(24, 1, 90)")
    assert pg.evaluate("getUnitBest(24, 1)") == 90 and pg.evaluate("getUnitBest(27, 1)") is None
    ok('progression : acquis de l\'id 24 (Leçon 25) intacts, nouvelle leçon sans acquis')

    # ── 2. Retours ciblés ──
    ecriture(pg, 4, 1, 2008)
    ecrire(pg, 'de velo ass net nei. hien ass al')
    err = pg.inner_text('#pc-ecr-erreur')
    assert 'objet masculin' in err and '« en »' in err and 'adjectif se nie' not in err, err
    ok('« hien ass al » : aide sur hien / en, plus la note hors sujet sur « net »')

    ecriture(pg, 24, 1, 2042)
    ecrire(pg, 'Mir bass an de Kino gaangen.')
    err = pg.inner_text('#pc-ecr-erreur')
    assert 'Bon verbe' in err and 'conjugaison' in err, err
    ecrire(pg, 'Mir sinn an de Kino gaangen.')
    pg.click('#pc-continuer')
    ok('« mir bass » : « bon verbe, vérifie la conjugaison » (accord au sujet)')

    # ── 3. Aide vocabulaire ──
    ecriture(pg, 24, 1, 2038)
    assert pg.locator('#pc-body .aide-vocab').count() == 1
    assert not pg.evaluate("document.querySelector('#pc-body .aide-vocab').open"), 'fermée par défaut'
    stats_avant = pg.evaluate("JSON.stringify(getStatsStore()[24] || {})")
    pg.click('#pc-body .aide-vocab summary')
    texte = pg.inner_text('#pc-body .aide-vocab')
    assert 'mam Auto' in texte and "an d'Stad" in texte and 'an der Stad' in texte, texte
    assert 'gefuer' not in texte and ' si ' not in (' ' + texte + ' '), 'ni participe ni auxiliaire'
    assert pg.evaluate("JSON.stringify(getStatsStore()[24] || {})") == stats_avant and pg.evaluate("ecrEssais") == 0
    assert pg.is_visible('#pc-ecr-valider')
    ecrire(pg, "Ech si mam Auto an d'Stad gefuer.")
    assert 'Juste !' in pg.inner_text('#pc-feedback')
    pg.click('#pc-continuer')
    ok('aide vocabulaire : fermée, ouverte avant le 1er essai → mam Auto, an d\'Stad (+ an der Stad), sans auxiliaire ni participe, sans pénalité')

    # Pas d'aide sur un item qui n'en déclare pas
    ecriture(pg, 24, 1, 2001)
    assert pg.locator('#pc-body .aide-vocab').count() == 0
    pg.evaluate("openMission()")
    assert pg.evaluate("pLecon.scene[ms.idx].lu") == "Ech si mam Auto an d'Stad gefuer."
    assert pg.locator('#ms-reponse .aide-vocab').count() == 1
    pg.click('#ms-reponse .aide-vocab summary')
    assert 'mam Auto' in pg.inner_text('#ms-reponse .aide-vocab') and pg.evaluate("ms.vies") == 3
    ok('mission : même aide sur la réplique concernée, aucune vie perdue ; aucune aide ailleurs')

    # ── 5. Chemin cadré sur la leçon après « Refaire mes erreurs » (A1.2, près du bas) ──
    pg.evaluate("choisirNiveau('A1.2'); goLessons()")
    pg.evaluate("ouvrirUniteDepuisChemin(24, 2)")
    pg.click('#pi-commencer')
    finir(pg, erreurs=1)
    pg.click('text=Refaire mes erreurs')
    finir(pg)
    pg.click('#pf-suite')
    pg.wait_for_timeout(800)  # après rendu, polices et fermeture éventuelle du clavier
    r = lecon_cadree(pg, 24)
    pg.wait_for_timeout(400)
    assert pg.evaluate('scrollY') == r['y'], 'pas de déplacement ultérieur'
    ok('Refaire mes erreurs (Leçon 25) → chemin principal, leçon seule dépliée et cadrée, stable (spec 44)')

    b.close()

print()
print('Erreurs JavaScript :', erreurs_js or 'aucune')
if erreurs_js:
    raise SystemExit(1)
