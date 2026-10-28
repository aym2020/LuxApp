"""Lux Démasqué V1.1 — contrat LD-034 : « Nouveau dossier » et rejeu.

Vérifie Milo partiel → Noah, Noah partiel → Tom, Tom → dossier généré,
nouveau dossier généré ≠ précédent, rejeu à graine identique et dossier
incomplet non inscrit comme résolu. Exécuté dans la suite complète.
"""
from playwright.sync_api import sync_playwright
from helpers import ok, ouvrir

with sync_playwright() as p:
    b, pg, erreurs = ouvrir(p, mobile=True)
    # Le stockage du contexte navigateur Playwright est isolé des comptes réels.
    pg.evaluate("ouvrirLuxDemasque()")
    pg.wait_for_selector('.ld-rencontre')
    depart = pg.evaluate('ld.partie.dossier.id')
    assert depart == 'MILO_001', depart
    pg.click('.ld-rencontre .ld-btn-or')
    pg.wait_for_selector('#ld-declaration')

    # Préparer les prérequis de l'objection avec le vrai moteur pour isoler
    # ici le contrat de navigation ; le parcours des réseaux est déjà testé ailleurs.
    pg.evaluate("""() => {
      const e = ld.partie;
      e.dossier.declarations.forEach((d, i) => LuxDemasqueCore.allerA(e, i));
      LuxDemasqueCore.consulter(e, 'AMIS_SAMI');
      LuxDemasqueCore.allerA(e, 1);
      ldMajDeposition();
    }""")
    pg.click('#ld-objecter')
    pg.locator("#ld-objection .ld-carnet-el:has-text('Profil de Sami')").click()
    pg.wait_for_selector('#ld-verdict')
    assert 'Disquette démasquée' in pg.inner_text('#ld-verdict')
    pg.click('#ld-verdict .ld-btn')
    pg.click('.ld-top [aria-label="Menu"]')
    pg.click("#ld-menu .ld-btn:has-text('Conclure le dossier')")
    pg.wait_for_selector('#ld-conclure')
    pg.click("#ld-conclure .ld-btn:has-text('Conclure le dossier')")
    pg.wait_for_selector('.ld-bilan')
    assert pg.evaluate("ld.partie.fin.trouvees") == 1
    assert pg.locator(".ld-bilan .ld-btn:has-text('Rejouer ce dossier')").count() == 1
    assert pg.evaluate("ldLire('luxDemasqueResolus', [])") == []

    pg.click(".ld-bilan .ld-btn:has-text('Nouveau dossier')")
    pg.wait_for_selector('.ld-rencontre')
    suivant = pg.evaluate('ld.partie.dossier.id')
    assert suivant == 'NOAH_001', (depart, suivant)
    assert pg.evaluate("ldLire('luxDemasqueResolus', [])") == []
    ok('LD-034 : Milo 1/3 → Noah, Milo reste non résolu')

    # « Nouveau dossier » avance dans les dossiers rédigés sans boucler sur
    # un dossier non résolu déjà rencontré pendant cette session.
    pg.click('.ld-rencontre .ld-btn-or')
    pg.wait_for_selector('#ld-declaration')
    pg.evaluate("ldConclure(true)")      # 0/3 ; la confirmation est couverte ailleurs.
    pg.wait_for_selector('.ld-bilan')
    pg.click(".ld-bilan .ld-btn:has-text('Nouveau dossier')")
    pg.wait_for_selector('.ld-rencontre')
    assert pg.evaluate('ld.partie.dossier.id') == 'TOM_001'
    ok('LD-034 : Noah incomplet → Tom, sans rejouer Milo')

    pg.click('.ld-rencontre .ld-btn-or')
    pg.wait_for_selector('#ld-declaration')
    pg.evaluate("ldConclure(true)")
    pg.wait_for_selector('.ld-bilan')
    pg.click(".ld-bilan .ld-btn:has-text('Nouveau dossier')")
    pg.wait_for_selector('.ld-rencontre')
    premier_genere = pg.evaluate("({ id: ld.partie.dossier.id, graine: ld.partie.dossier.graine, genere: ld.partie.dossier.genere })")
    assert premier_genere['genere'] and isinstance(premier_genere['graine'], int), premier_genere
    ok('LD-034 : après Tom, nouveau dossier généré au lieu de recycler Milo')

    # « Rejouer » conserve l'identité ET la graine ; « Nouveau » en change.
    pg.click('.ld-rencontre .ld-btn-or')
    pg.wait_for_selector('#ld-declaration')
    pg.evaluate("ldConclure(true)")
    pg.wait_for_selector('.ld-bilan')
    pg.click(".ld-bilan .ld-btn:has-text('Rejouer ce dossier')")
    pg.wait_for_selector('.ld-rencontre')
    rejoue = pg.evaluate("({ id: ld.partie.dossier.id, graine: ld.partie.dossier.graine })")
    assert rejoue == {'id': premier_genere['id'], 'graine': premier_genere['graine']}, rejoue
    pg.click('.ld-rencontre .ld-btn-or')
    pg.wait_for_selector('#ld-declaration')
    pg.evaluate("ldConclure(true)")
    pg.wait_for_selector('.ld-bilan')
    pg.click(".ld-bilan .ld-btn:has-text('Nouveau dossier')")
    pg.wait_for_selector('.ld-rencontre')
    nouveau = pg.evaluate("({ id: ld.partie.dossier.id, graine: ld.partie.dossier.graine })")
    assert nouveau['graine'] != premier_genere['graine'] and nouveau['id'] != premier_genere['id'], nouveau
    ok('LD-034 : Rejouer = même graine ; Nouveau dossier généré = graine différente')

    # Depuis le hub, le premier dossier rédigé non résolu reste accessible.
    pg.evaluate("ldQuitter()")
    pg.wait_for_function("document.getElementById('view-jeux').classList.contains('active')")
    pg.evaluate("ouvrirLuxDemasque()")
    pg.wait_for_function("ld.partie && ld.partie.dossier.id === 'MILO_001'")
    assert pg.evaluate("ldLire('luxDemasqueResolus', [])") == []
    assert not erreurs, erreurs
    ok('LD-034 : entrée par le hub → Milo incomplet toujours accessible')
    b.close()
