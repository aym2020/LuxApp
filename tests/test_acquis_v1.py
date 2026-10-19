"""Spec 46 : acquis historiques après la migration v1 → v2. Trois états :
acquise historiquement (v1), unités réellement terminées, leçon complète en v2.
Trois comptes : v1 acquis sans unité v2, partiellement avancé, tout terminé.
Aucune écriture de progression : les acquis restent intacts."""
from playwright.sync_api import sync_playwright
from helpers import ok, ouvrir, masquer_regles_vies

L = 20  # « Les prépositions de lieu », affichée Leçon 21 (cas réel)

ACQUIS_V1 = """id => { const l = lecons.find(x => x.id === id); const p = getProgress();
    p[id] = Object.assign(p[id] || {}, { quiz: {}, trous: {}, ecriture: {} });
    ['quiz', 'trous', 'ecriture'].forEach(t => { for (let i = 1; i <= (l.v1[t] || 0); i++) p[id][t][i] = 3; });
    saveProgress(p); }"""


def compte(pg, etat):
    pg.evaluate("localStorage.clear()")
    masquer_regles_vies(pg)
    pg.evaluate(ACQUIS_V1, L)
    if etat in ('partiel', 'complet'):
        pg.evaluate("id => saveUnitBest(id, unitesCoeur(lecons.find(l => l.id === id))[0].id, 100)", L)
    if etat == 'complet':
        pg.evaluate("""id => { const l = lecons.find(x => x.id === id);
            unitesCoeur(l).forEach(u => saveUnitBest(id, u.id, 100));
            saveMissionBest(id, 100, missionVersion(l)); marquerMissionReussie(id, missionVersion(l)); }""", L)
    pg.evaluate("lecons.forEach(l => marquerIntroMissionVue(l.id)); choisirNiveau('A1.2')")


def etat_chemin(pg):
    pg.evaluate("id => { ouvrirLeconDansChemin(id); goLessons(); }", L)
    return pg.evaluate("""id => {
        const carte = document.getElementById('chemin-lecon-' + id);
        const l = lecons.find(x => x.id === id);
        return {
            statut: carte.querySelector('.st').textContent,
            bouton: carte.querySelector('.btn-jaune').textContent.trim(),
            entete: document.querySelector('.chemin-tete .resume').innerText.replace(/\\n/g, ' '),
            unitesFaites: unitesCoeur(l).filter(u => getUnitBest(id, u.id) != null).length,
            acquise: leconTerminee(l), ancienne: acquiseAncienneVersion(l), complete: leconCompleteV2(l),
            v1: acquisV1(l), etapes: [etapesFaites(l), etapesLecon(l)],
            prog: progressionNiveau('A1.2'), unitesTotal: compterUnitesTerminees(),
            suivante: prochainPas() ? prochainPas().lecon.id : null
        }; }""", L)


with sync_playwright() as p:
    b, pg, erreurs = ouvrir(p, mobile=True)

    # ── 1. Compte v1 acquis, aucune unité v2 (cas réel) ──
    compte(pg, 'v1')
    avant = pg.evaluate("JSON.stringify(getProgress()[%d])" % L)
    s = etat_chemin(pg)
    assert s['v1'] and s['acquise'] and s['ancienne'] and not s['complete'], s
    assert s['statut'] == 'Acquise précédemment' and s['bouton'] == 'Faire les nouvelles unités', s
    assert s['unitesFaites'] == 0 and s['etapes'][0] == 0, 'aucune unité ni étoile inventée'
    assert pg.locator('#chemin-lecon-%d .pastille-ok, #chemin-lecon-%d .etoiles' % (L, L)).count() == 0
    assert '1 acquise précédemment' in s['entete'] and 'terminée' not in s['entete'], s['entete']
    assert s['prog']['anciennes'] == 1 and s['prog']['terminees'] == 0 and s['prog']['pourcent'] == 0, s['prog']
    assert s['unitesTotal'] == 0, 'unités terminées : seulement les vraies'
    assert s['suivante'] != L, 'la leçon reste acquise : le parcours continue sans la refaire'
    pg.evaluate("id => basculerLeconChemin(id)", L)  # repliée
    assert 'Acquise précédemment' in pg.inner_text('#chemin-lecon-%d' % L) and 'v1' not in pg.inner_text('#lecon-list')
    assert pg.evaluate("JSON.stringify(getProgress()[%d])" % L) == avant, 'acquis v1 intacts'
    chiffres = pg.evaluate("chiffresHtml()")
    # Accueil compact : « +1 acquise » à l'écran, détail complet dans aria-label et title.
    assert '+1 acquise<' in chiffres and '1 acquises précédemment' in chiffres and '<b>0 %</b>' in chiffres and '<b>0 / 8</b>' in chiffres, chiffres
    pg.evaluate("ouvrirPlus()")
    tuiles = pg.locator('.plus-acquis span').all_inner_texts()
    assert 'leçons acquises précédemment' in tuiles, tuiles
    pg.evaluate("fermerPanneau(); openParcoursLecon(lecons.find(l => l.id === %d))" % L)
    assert 'LEÇON ACQUISE PRÉCÉDEMMENT' in pg.inner_text('#view-plecon')
    ok('v1 acquise sans unité : « Acquise précédemment », « Faire les nouvelles unités », 0 unité / 0 %, '
       'pastille et tuile dédiées, leçon toujours acquise (parcours ouvert), données intactes')

    # Le bouton ouvre bien la 1re nouvelle unité
    pg.evaluate("id => { ouvrirLeconDansChemin(id); goLessons(); lancerActionLecon(id); }", L)
    assert pg.evaluate("document.querySelector('.view.active').id") == 'view-pintro' and pg.evaluate("pIntroUnite") == 1
    ok('« Faire les nouvelles unités » → introduction de l\'unité 1')

    # ── 2. Compte partiellement avancé (1 unité v2 faite) ──
    compte(pg, 'partiel')
    s = etat_chemin(pg)
    assert s['ancienne'] and s['unitesFaites'] == 1 and s['etapes'] == [1, 3], s
    assert s['statut'] == 'Acquise précédemment' and s['bouton'] == 'Faire les nouvelles unités', s
    assert s['prog']['pourcent'] == round(1 / s['prog']['total'] * 100) and s['unitesTotal'] == 1, s
    assert pg.locator('#chemin-u-%d-1 .ok, #chemin-u-%d-1.ok' % (L, L)).count() + pg.locator('#chemin-u-%d-2.ok' % L).count() <= 1
    pg.evaluate("id => basculerLeconChemin(id)", L)
    assert 'Acquise précédemment · 1/3 étapes' in pg.inner_text('#chemin-lecon-%d' % L)
    ok('partiellement avancé : toujours « Acquise précédemment », 1/3 réel affiché, 1 unité comptée, pas 100 %')

    # ── 3. Compte ayant tout terminé en v2 ──
    compte(pg, 'complet')
    s = etat_chemin(pg)
    assert s['complete'] and not s['ancienne'] and s['acquise'], s
    assert s['statut'] == 'Terminée' and s['bouton'] == 'Revoir', s
    assert s['prog']['terminees'] == 1 and s['prog']['anciennes'] == 0 and s['unitesTotal'] == 2, s
    assert '1 terminée' in s['entete'] and 'ancienne' not in s['entete'], s['entete']
    ok('tout terminé en v2 : « Terminée », « Revoir », comptée comme leçon terminée (plus « v1 »)')

    # ── Distinctions existantes conservées : validée par la mission ──
    compte(pg, 'v1')
    pg.evaluate("id => { const l = lecons.find(x => x.id === id); saveMissionBest(id, 90, missionVersion(l)); marquerMissionReussie(id, missionVersion(l)); validerLeconParMission(id); }", L)
    s = etat_chemin(pg)
    assert not s['ancienne'] and s['statut'] == 'Validée par la mission', s
    ok('v1 acquise + mission réussie : reste « Validée par la mission » (distinction spec 32 conservée)')

    b.close()

print()
print('Erreurs JavaScript :', erreurs or 'aucune')
if erreurs:
    raise SystemExit(1)
