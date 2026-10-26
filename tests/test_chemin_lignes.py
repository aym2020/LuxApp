"""Spec 29 : lignes compactes de « Mon chemin ». Le titre d'une unité n'est
jamais coupé ni recouvert, « Révision en cours » passe dessous, la mission
ont une structure compacte (statut discret à droite), rien
ne déborde de 320 à 430 px (et texte agrandi), noms accessibles complets."""
import os
from playwright.sync_api import sync_playwright
U = os.environ.get('LUX_URL', 'http://localhost:3456/')


def ok(m): print('  ok  ', m, flush=True)


PREPARER = """choisirNiveau('A1.1'); marquerJour(1); saveUnitBest(0, 1, 90); saveUnitBest(0, 2, 90); [1, 2].forEach(u => saveUnitBest(1, u, 95)); saveUnitBest(1, 3, 80);
  marquerIntroMissionVue(1); figerAcquisMission(lecons.find(l => l.id === 1)); saveMissionBest(1, 60, 1);
  localStorage.setItem(cleRun(true), JSON.stringify({ leconId: 1, uniteId: 1, mode: 'unite', libre: true, steps: [], stepIdx: 0 }));
  goLessons()"""

# Pour chaque ligne : le titre, le statut éventuel, les étoiles ou la pastille, le chevron.
MESURER = """() => [...document.querySelectorAll('#chemin-lecon-1 .unites li')].map(li => {
  const r = s => { const e = li.querySelector(s); return e ? e.getBoundingClientRect() : null; };
  const nom = r('.nom'), tag = r('.tag'), sous = r('.sous'), sur = r('.sur'), chev = r('.ic.droite'), li_ = li.getBoundingClientRect();
  const lignes = Math.round(nom.height / parseFloat(getComputedStyle(li.querySelector('.nom')).lineHeight));
  return { id: li.id || li.className, nom, tag, sous, sur, chev, li: li_, lignes, mots: li.querySelector('.nom').textContent,
    aria: li.querySelector('button').getAttribute('aria-label') };
})"""


def chevauche(a, b):
    return a and b and a['left'] < b['right'] - 1 and b['left'] < a['right'] - 1 and a['top'] < b['bottom'] - 1 and b['top'] < a['bottom'] - 1


with sync_playwright() as p:
    b = p.chromium.launch()
    errs = []
    for largeur, texte in ((320, 100), (360, 100), (393, 100), (430, 100), (360, 130)):
        ctx = b.new_context(viewport={'width': largeur, 'height': 900}, is_mobile=True, has_touch=True)
        pg = ctx.new_page()
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.route('**/*gstatic*/**', lambda r: r.abort())
        pg.route('**/fonts.googleapis.com/**', lambda r: r.abort())
        pg.goto(U)
        pg.wait_for_selector('#today')
        pg.evaluate("(p => { p.guide = { viesMasquees: 1 }; saveProgress(p); })(getProgress())")  # rappel des vies masqué (spec 36)
        if texte != 100:
            pg.add_style_tag(content='html { font-size: %d%% }' % texte)
        pg.evaluate(PREPARER)
        pg.wait_for_timeout(300)
        assert pg.evaluate('document.documentElement.scrollWidth') <= largeur, 'défilement horizontal'
        lignes = pg.evaluate(MESURER)
        for l in lignes:
            assert not chevauche(l['nom'], l['tag']) and not chevauche(l['nom'], l['chev']), l
            assert not chevauche(l['tag'], l['chev']) and not chevauche(l['sous'], l['tag']), l
            assert l['nom']['right'] <= l['li']['right'] + 1, l
            assert not chevauche(l['sur'], l['tag']) and not chevauche(l['nom'], l['sur']), l
            if l['sur']:
                assert l['sur']['right'] - l['sur']['left'] > 30, l  # « Mission » reste lisible
            assert l['li']['height'] >= 43.5, l  # zone tactile (44 px, arrondi au sous-pixel)
            assert l['aria'] and l['mots'].replace('\xa0', ' ').split(' · ')[-1] in l['aria'], l  # nom accessible = titre complet + état
        u1 = lignes[0]
        assert u1['sous'] and u1['sous']['top'] >= u1['nom']['bottom'] - 1, u1  # « Révision en cours » sous le titre
        assert u1['sous']['left'] == u1['nom']['left'], u1  # aligné sur le début du titre
        assert u1['lignes'] == 1, u1  # « 1 · Saluer » d'un bloc
        assert all(l['sous'] is None for l in lignes[1:]), 'pas de ligne de statut vide'
        mission = next(l for l in lignes if 'mission' in l['id'])
        assert mission['lignes'] <= 2 + (texte > 100), mission  # plus de colonne d'un mot par ligne
        # SPEC 107 : Bilan dans l'écran de leçon détaillé uniquement.
        assert pg.locator('#chemin-lecon-1 .unites li.bilan').count() == 0
        assert lignes[-1]['id'].endswith('mission'), lignes[-1]
        # Spec 48 : pas de compteur « n/20 » ; un résultat seulement après une partie jouée
        assert '/' not in pg.inner_text('#chemin-u-1-mission'), pg.inner_text('#chemin-u-1-mission')
        if mission['tag'] and largeur >= 393 and texte == 100:
            assert mission['tag']['left'] >= mission['nom']['right'] - 1, mission
        if largeur >= 393 and texte == 100:
            assert u1['tag']['left'] > u1['nom']['right'] and u1['tag']['top'] < u1['nom']['bottom'], 'étoiles à droite du titre'
        ok('%d px, texte %d %% : titres entiers, rien ne se recouvre, révision sous « 1 · Saluer », mission sur %d ligne(s)'
           % (largeur, texte, mission['lignes']))
        if largeur == 320:
            # Titres les plus longs : toutes les leçons A1.1 et A1.2 dépliées une à une
            for niveau in ('A1.1', 'A1.2'):
                pg.evaluate("n => { choisirNiveau(n); goLessons(); }", niveau)
                ids = pg.evaluate("n => lecons.filter(l => l.niveau === n && isParcoursLecon(l)).map(l => l.id)", niveau)
                for lid in ids:
                    pg.evaluate("id => { ouvrirLeconDansChemin(id); renderLessons(); }", lid)
                    for l in pg.evaluate(MESURER.replace('#chemin-lecon-1', '#chemin-lecon-' + str(lid))):
                        assert not chevauche(l['nom'], l['tag']) and not chevauche(l['nom'], l['chev']), (lid, l)
                    assert pg.evaluate('document.documentElement.scrollWidth') <= largeur, lid
                ok('320 px : %d leçons %s dépliées, aucun titre recouvert' % (len(ids), niveau))
            pg.evaluate(PREPARER)
        if largeur == 393:
            assert pg.locator('#chemin-u-1-4.actuelle').count() == 1
            assert 'Révision en cours' in pg.inner_text('#chemin-u-1-1')
            assert pg.locator('#chemin-u-1-1 button').count() == 1  # un seul bouton par ligne
            assert pg.get_attribute('#chemin-u-1-1 button', 'aria-label') == '1 · Saluer, terminée, 3 étoiles sur 3, révision en cours'
            assert pg.locator('#chemin-u-1-1 .sous svg[aria-hidden="true"]').count() == 1  # ↻ décoratif
            pg.click('#chemin-u-1-mission .nom')
            assert pg.evaluate("document.querySelector('.view.active').id") in ('view-mission', 'view-msintro', 'view-plecon')
            ok('unité 4 toujours recommandée ; toute la ligne de la mission s\'ouvre')
            # Spec 30 : en-tête de mission — titre de la mission en entier, vies et compteur dessous
            pg.evaluate("openParcoursLecon(lecons.find(l => l.id === 1)); openMission()")
            t = pg.evaluate("""() => { const e = document.getElementById('ms-titre'), v = document.getElementById('ms-vies').getBoundingClientRect();
                return { titre: e.textContent, tronque: e.scrollHeight > e.clientHeight + 1, bas: e.getBoundingClientRect().bottom, vies: v.top }; }""")
            assert t['titre'] == pg.evaluate('pLecon.mission.titre') and not t['tronque'] and t['vies'] >= t['bas'] - 1, t
            ok('en-tête de mission : « %s » en entier, vies et compteur dessous' % t['titre'])
        ctx.close()
    assert not errs, errs
    b.close()
print('test_chemin_lignes : tout est vert')
