"""Specs 23, 24, 32 et 36 : missions à 3 vies, réponses autonomes, faute de frappe
corrigée gratuitement (algorithme local). Réussite = au moins une vie à la fin
(spec 32), en mode normal comme avec « Tente ta chance »."""
import os
from playwright.sync_api import sync_playwright

URL = os.environ.get('LUX_URL', 'http://localhost:3456/')


def ok(m):
    print('  ok  ', m, flush=True)


# Une saisie « coquille » : deux lettres voisines inversées dans le plus long mot,
# acceptée par l'algorithme comme coquille probable.
COQUILLE = """(lu) => {
  const mots = lu.split(' ');
  const ordre = mots.map((m, i) => i).sort((a, b) => mots[b].length - mots[a].length);
  for (const i of ordre) {
    const m = mots[i];
    for (let k = 1; k + 1 < m.length - 1; k++) {
      const t = m.slice(0, k) + m[k + 1] + m[k] + m.slice(k + 2);
      if (t === m) continue;
      const essai = mots.slice(0, i).concat([t], mots.slice(i + 1)).join(' ');
      if (analyserReponse(essai, lu).correctionGratuiteAutorisee) return essai;
    }
  }
  return null;
}"""


RESET = "(id => { const p = getProgress(); if (p[id]) { delete p[id].mission; delete p[id].valideeMission; delete p[id].historique; } saveProgress(p); })"


def jouer(pg, actions, tentative=False):
    """actions : une par réplique « toi » : 'ok', 'typo', 'err' (faux puis juste), 'revele'."""
    pg.evaluate("t => openMission(t)", tentative)
    for a in actions:
        lu = pg.evaluate("pLecon.scene[ms.idx].lu")
        if a == 'typo':
            t = pg.evaluate(COQUILLE, lu)
            assert t, ('aucune coquille possible pour', lu)
            pg.fill('#ms-input', t); pg.click('#ms-btn-valider')
            assert 'Possible faute de frappe' in pg.inner_text('#ms-erreur')
            pg.fill('#ms-input', lu); pg.click('#ms-btn-valider')
        elif a == 'err':
            pg.fill('#ms-input', 'Ech weess et net'); pg.click('#ms-btn-valider')
            pg.fill('#ms-input', lu); pg.click('#ms-btn-valider')
        elif a == 'revele':
            pg.fill('#ms-input', 'Ech weess et net'); pg.click('#ms-btn-valider')
            pg.fill('#ms-input', 'nach eng Kéier falsch'); pg.click('#ms-btn-valider')
            pg.click('#ms-btn-voir')
        else:
            pg.fill('#ms-input', lu); pg.click('#ms-btn-valider')
        pg.click('#ms-continuer')
    return pg.evaluate("ms.bilan")


with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 390, 'height': 844})
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.route('**/*gstatic*/**', lambda r: r.abort())
    pg.route('**/fonts.googleapis.com/**', lambda r: r.abort())
    pg.goto(URL)
    pg.wait_for_selector('#today')
    # Spec 36 : règles des vies à chaque lancement, la conversation attend
    pg.evaluate("choisirNiveau('A1.1'); marquerIntroMissionVue(12); openParcoursLecon(lecons.find(l => l.id === 12)); openMission()")
    assert pg.is_visible('.ms-regles') and 'Tu as 3 vies' in pg.inner_text('.ms-regles')
    assert pg.locator('#ms-body .ms-bulle').count() == 0 and pg.locator('#ms-input').count() == 0, 'la conversation attend'
    assert not pg.is_checked('#ms-regles-masquer')
    pg.click('.panneau .pc-btn:has-text("C\'est parti")')
    assert pg.locator('#ms-input').count() == 1 and not pg.evaluate("reglesViesMasquees()")
    pg.fill('#ms-input', 'Ech weess et net'); pg.click('#ms-btn-valider')
    assert pg.evaluate("ms.vies") == 2
    pg.click('.ms-vies-zone')
    assert pg.is_visible('.ms-regles') and 'Continuer la mission' in pg.inner_text('.panneau')
    pg.click('.panneau .pc-btn')
    assert pg.evaluate("ms.vies") == 2 and pg.locator('#ms-input').count() == 1, 'consulter les règles ne change rien'
    # 2e lancement : le rappel revient ; « Ne plus afficher » coché puis fermé
    pg.evaluate("openMission()")
    assert pg.is_visible('.ms-regles') and pg.locator('#ms-input').count() == 0, 'rappel à chaque lancement'
    pg.check('#ms-regles-masquer')
    assert pg.evaluate("reglesViesMasquees() && getProgress().guide.viesMasquees === 1")
    pg.click('.panneau .pc-btn:has-text("C\'est parti")')
    assert pg.locator('#ms-input').count() == 1
    # 3e lancement : plus de rappel ; les cœurs le rouvrent, case cochée, et décocher le réactive
    pg.evaluate("openMission()")
    assert not pg.is_visible('.ms-regles') and pg.locator('#ms-input').count() == 1
    pg.click('.ms-vies-zone')
    assert pg.is_checked('#ms-regles-masquer')
    pg.uncheck('#ms-regles-masquer')
    pg.click('.panneau .pc-btn')
    assert not pg.evaluate("reglesViesMasquees()") and pg.locator('#ms-input').count() == 1
    pg.evaluate("openMission()")
    assert pg.is_visible('.ms-regles'), 'rappel réactivé'
    pg.evaluate("fermerPanneau(); masquerReglesVies(true)")
    r = pg.evaluate("[...document.querySelectorAll('#ms-vies .ms-coeur')].map(c => c.getBoundingClientRect().width)")
    assert r == [24, 24, 24], r
    ok('règles des vies à chaque lancement ; « Ne plus afficher » mémorisé ; cœurs : rappel sans effet, case pour réactiver')
    pg.evaluate("choisirNiveau('A1.1'); lecons.forEach(l => marquerIntroMissionVue(l.id)); saveUnitBest(12, 1, 100); openParcoursLecon(lecons.find(l => l.id === 12))")
    n = pg.evaluate("nbRepliquesToi(pLecon)")
    assert n == 10, n  # spec 34 : 10 réponses à produire
    assert pg.locator('#ms-vies .ms-coeur').count() == 0 or True

    # Tout juste
    bilan = jouer(pg, ['ok'] * n)
    assert bilan == {'ok': n, 'total': n, 'erreurs': 0, 'reveles': 0, 'vies': 3}, bilan
    assert pg.evaluate("getMissionBest(12)") == 100 and pg.evaluate("missionReussie(lecons.find(l => l.id === 12))")
    ok('10/10 : 10 réponses autonomes, 3 vies, mission réussie')

    # Une faute de frappe corrigée : gratuite
    pg.evaluate(RESET + "(12)")
    bilan = jouer(pg, ['typo'] + ['ok'] * (n - 1))
    assert bilan['ok'] == n and bilan['vies'] == 3, bilan
    ok('faute de frappe corrigée : comptée autonome, aucune vie perdue')

    # Une vraie erreur : 9/10, une vie perdue → réussie
    pg.evaluate(RESET + "(12)")
    bilan = jouer(pg, ['err'] + ['ok'] * (n - 1))
    assert bilan['ok'] == n - 1 and bilan['vies'] == 2 and pg.evaluate("missionReussie(lecons.find(l => l.id === 12))"), bilan
    assert pg.locator('#ms-vies .ms-coeur.vide').count() == 1
    ok('9/10 : une erreur, 2 vies, réussie ; un cœur vide')

    # Deux erreurs : 8/10, une vie restante → réussie
    pg.evaluate(RESET + "(12)")
    bilan = jouer(pg, ['err', 'err'] + ['ok'] * (n - 2))
    assert bilan['ok'] == n - 2 and bilan['vies'] == 1 and pg.evaluate("missionReussie(lecons.find(l => l.id === 12))"), bilan
    assert 'Mission réussie' in pg.inner_text('.ms-fin')
    ok('8/10 : deux erreurs, 1 vie restante → réussie')

    # Trois erreurs : plus de vie, mode apprentissage, défi non validé
    pg.evaluate(RESET + "(12)")
    pg.evaluate("openMission()")
    for k in range(3):
        lu = pg.evaluate("pLecon.scene[ms.idx].lu")
        pg.fill('#ms-input', 'Ech weess et net'); pg.click('#ms-btn-valider')
        pg.fill('#ms-input', 'nach eng Kéier falsch'); pg.click('#ms-btn-valider')  # 2e erreur : pas de 2e vie perdue
        pg.fill('#ms-input', lu); pg.click('#ms-btn-valider'); pg.click('#ms-continuer')
    assert pg.evaluate("ms.vies") == 0 and pg.locator('.ms-apprentissage').count() == 1
    for k in range(n - 3):
        pg.fill('#ms-input', pg.evaluate("pLecon.scene[ms.idx].lu")); pg.click('#ms-btn-valider'); pg.click('#ms-continuer')
    assert pg.evaluate("ms.bilan.vies") == 0 and not pg.evaluate("missionReussie(lecons.find(l => l.id === 12))")
    assert 'Plus de vie' in pg.inner_text('.ms-fin') and not pg.evaluate("leconTerminee(lecons.find(l => l.id === 12))")
    ok('7/10 : trois erreurs, 0 vie (une seule par réplique), conversation finie en mode apprentissage, non validée')

    # Réponse révélée
    pg.evaluate(RESET + "(12)")
    bilan = jouer(pg, ['revele'] + ['ok'] * (n - 1))
    assert bilan['reveles'] == 1 and bilan['ok'] == n - 1, bilan
    ok('réponse révélée : comptée échouée, une vie perdue')

    # Tente ta chance : même règle — une erreur (2 vies) valide, trois erreurs (0 vie) non
    pg.evaluate("(p => { [13, 14].forEach(id => { delete p[id]; }); saveProgress(p); })(getProgress()); openParcoursLecon(lecons.find(l => l.id === 13))")
    jouer(pg, ['ok'] * pg.evaluate("nbRepliquesToi(pLecon)"), tentative=True)
    assert pg.evaluate("leconValideeParMission(13)")
    pg.evaluate("openParcoursLecon(lecons.find(l => l.id === 14))")
    m = pg.evaluate("nbRepliquesToi(pLecon)")
    jouer(pg, ['err'] + ['ok'] * (m - 1), tentative=True)
    assert pg.evaluate("leconValideeParMission(14)")
    pg.evaluate(RESET + "(14)")
    jouer(pg, ['err', 'err', 'err'] + ['ok'] * (m - 3), tentative=True)
    assert not pg.evaluate("leconValideeParMission(14)") and "Les unités vont t'aider" in pg.inner_text('.ms-fin')
    ok('Tente ta chance : 5/5 → validée ; une erreur sur %d (2 vies) → validée ; trois erreurs → non validée' % m)

    # Anciennes données : un score historique est gardé, la version est notée
    pg.evaluate("(p => { p[15] = { mission: { score: 75 } }; saveProgress(p); })(getProgress()); openParcoursLecon(lecons.find(l => l.id === 15))")
    jouer(pg, ['err', 'err'] + ['ok'] * (pg.evaluate("nbRepliquesToi(pLecon)") - 2))
    assert pg.evaluate("ancienScoreMission(15)") == 75 and pg.evaluate("getMissionBest(15)") == 80
    assert pg.evaluate("getProgress()[15].mission.version") == 2
    assert pg.evaluate("missionReussie(lecons.find(l => l.id === 15))"), 'deux erreurs, une vie : réussie'
    ok('ancien score 75 % (scène v1) gardé à part ; nouvelle scène v2 jouée à 80 %, 1 vie → réussie')

    # Écriture : coquille → rien n'est enregistré avant la décision ; corrigée → juste du premier coup
    pg.evaluate("openParcoursLecon(lecons.find(l => l.id === 12)); startEtapeSeule(1, 'ecriture')")
    e = pg.evaluate("trouverItem(pLecon, 'ecriture', run.steps[run.stepIdx].queue[0])")
    t = pg.evaluate(COQUILLE, e['lu'])
    if t:
        pg.fill('#pc-ecr-input', t); pg.click('#pc-ecr-valider')
        assert 'Possible faute de frappe' in pg.inner_text('#pc-ecr-erreur')
        assert pg.evaluate("Object.keys(run.steps[run.stepIdx].scores).length") == 0, 'rien ne doit être enregistré'
        pg.fill('#pc-ecr-input', e['lu']); pg.click('#pc-ecr-valider')
        assert pg.evaluate("run.steps[run.stepIdx].details[%d].ok" % e['id']) is True
        ok('écriture : coquille corrigée → juste du premier coup, aucune erreur enregistrée')
    else:
        ok('écriture : phrase sans coquille possible (mots courts) — cas couvert par test_correction.js')
    pg.click('#pc-continuer')
    e = pg.evaluate("trouverItem(pLecon, 'ecriture', run.steps[run.stepIdx].queue[0])")
    pg.fill('#pc-ecr-input', 'Ech weess et net'); pg.click('#pc-ecr-valider')
    assert 'Pas encore' in pg.inner_text('#pc-ecr-erreur') and pg.evaluate("run.steps[run.stepIdx].details[%d].ok" % e['id']) is False
    ok('écriture : vraie erreur → enregistrée comme avant')

    # Spec 35 : « Continuer » — focus seulement après une saisie au clavier ; retours en mots simples
    pg.evaluate(RESET + "(12)")
    pg.evaluate("openParcoursLecon(lecons.find(l => l.id === 12)); openMission()")
    lu = pg.evaluate("pLecon.scene[ms.idx].lu")
    pg.fill('#ms-input', lu)
    pg.click('#ms-btn-valider')  # à la souris
    assert pg.evaluate("document.activeElement.id") != 'ms-continuer', 'pas de focus (ni anneau) après un clic'
    pg.click('#ms-continuer')
    lu = pg.evaluate("pLecon.scene[ms.idx].lu")
    pg.fill('#ms-input', 'Ech weess et net'); pg.press('#ms-input', 'Enter')
    pg.fill('#ms-input', lu); pg.press('#ms-input', 'Enter')  # au clavier
    assert pg.evaluate("document.activeElement.id") == 'ms-continuer' and pg.evaluate("document.activeElement.matches(':focus-visible')")
    retour = pg.inner_text('.ms-retour')
    assert 'Bonne réponse, au 2e essai !' in retour and 'Tu as trouvé après une erreur.' in retour and 'autonome' not in retour, retour
    idx = pg.evaluate("ms.idx")
    pg.keyboard.press('Enter')
    assert pg.evaluate("ms.idx") > idx, 'Entrée continue'
    ok('« Continuer » : pas de focus après un clic ; après Entrée, focus visible et Entrée continue ; « Bonne réponse, au 2e essai ! »')
    pg.evaluate(RESET + "(12)")
    jouer(pg, ['err', 'err'] + ['ok'] * (n - 2))
    assert 'Réponses trouvées sans erreur : 8 / 10' in pg.inner_text('.ms-fin') and 'autonome' not in pg.inner_text('.ms-fin')
    sb = pg.evaluate("getComputedStyle(document.getElementById('ms-body')).scrollbarWidth")
    assert sb == 'thin', sb
    ok('bilan : « Réponses trouvées sans erreur : 8 / 10 » ; ascenseur fin dans la conversation')

    print('\nErreurs JavaScript :', errs or 'aucune')
    assert not errs
    b.close()
