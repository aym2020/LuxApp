"""Lux Démasqué — contrat LD-034 : « Nouveau dossier » après une fin partielle.

Test d'acceptation volontairement séparé de la suite normale tant que LD-034
n'est pas corrigé : sur la version initiale, il doit échouer (Milo réouvert).
Après correctif, ajouter ce test à la suite « complet » et à tools/critique.sh.
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
    assert suivant != depart, (
        f'LD-034 NON CONFORME : « Nouveau dossier » a rouvert {depart} '
        'après une enquête 1/3 ; il doit ouvrir un dossier différent.'
    )
    assert not erreurs, erreurs
    ok(f'LD-034 : nouveau dossier {suivant} différent de {depart}, Milo toujours non résolu')
    b.close()
