"""Contrat réel SPEC 114 : shell, intérieurs, overlays, mobile et zoom PC."""
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright
from helpers import URL, ok
from layout114_scenarios import VUES, AUTRES, preparer, ouvrir, mesurer

BASE=json.loads((Path(__file__).parent/'fixtures/spec114-mobile.json').read_text())
MOBILE={(m['nom'],m['viewport'][0]):m for m in BASE['mesures']}
TAILLES=[int(w) for w in os.environ.get('LUX_LAYOUT_WIDTHS','320,360,390,430,600,640,720,768,1024,1440,1920').split(',')]
FAMILLES=os.environ.get('LUX_LAYOUT_VIEWS')
NOMS=FAMILLES.split(',') if FAMILLES else list(VUES)+list(AUTRES)
mesures=[]
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    for w in TAILLES:
        h=844 if w<600 else 900
        ctx=b.new_context(viewport={'width':w,'height':h},reduced_motion='reduce')
        pg=ctx.new_page();erreurs=[]
        pg.on('pageerror',lambda e:erreurs.append(str(e)))
        preparer(pg,URL)
        for nom in NOMS:
            ouvrir(pg,nom,nom in AUTRES)
            m=mesurer(pg,nom);mesures.append(m)
            assert m['overflow']<=1,(w,nom,'overflow',m['overflow'])
            s=m['shell']
            assert abs(s['x']+s['width']/2-w/2)<=1,(w,nom,'centrage',s)
            if w>=768:
                assert abs(s['width']-640)<=2,(w,nom,'shell',s)
                rails=['.nav-bas','.cta-fixe','.cp-feuille','.rs-v21-sheet','.panneau','.ld-jeu']
                for sel in rails:
                    for r in m['elements'].get(sel,[]):
                        # Le dock interne de Découverte garde la largeur de son parent.
                        assert r['width']<=642,(w,nom,sel,r)
                        assert abs(r['x']+r['width']/2-w/2)<=2,(w,nom,sel,'centrage',r)
                for sel in ['.nav-bas','.cp-feuille','.rs-v21-sheet','.ld-jeu','.ld-fenetre']:
                    for r in m['elements'].get(sel,[]):
                        assert abs(r['width']-640)<=2,(w,nom,'rail principal',sel,r)
                for sel in ['.accueil','.jeux-hub']:
                    for r in m['elements'].get(sel,[]):
                        assert abs(r['width']-640)<=2,(w,nom,'contenu resté étroit',sel,r)
                for sel in ['.pc-body','.session-body','.exo-action-dock','.runner-jeu','.lm-jeu']:
                    for r in m['elements'].get(sel,[]):
                        assert r['width']<=502,(w,nom,'focus',sel,r)
                for r in m['elements'].get('.ld-selection',[]):
                    assert r['width']<=422,(w,nom,'téléphone Cringr étiré',r)
            elif (nom,w) in MOBILE:
                avant=MOBILE[(nom,w)]
                assert abs(s['x']-avant['shell'][0])<=1 and abs(s['width']-avant['shell'][1])<=1,(w,nom,'mobile shell modifié')
                for sel,rects in avant['elements'].items():
                    actuels=m['elements'].get(sel,[])
                    assert len(actuels)==len(rects),(w,nom,'nombre de rails',sel)
                    for r,a in zip(actuels,rects):
                        assert abs(r['x']-a[0])<=1 and abs(r['width']-a[1])<=1,(w,nom,'mobile',sel,r,a)
                        assert r['padding']==a[2],(w,nom,'padding mobile',sel,r['padding'],a[2])
            for sel in ['.nav-bas','.cta-fixe','.exo-action-dock']:
                for r in m['elements'].get(sel,[]):
                    if r['position']=='fixed':assert r['bottom']<=h+1,(w,nom,'action hors écran',sel,r)
        assert not erreurs,erreurs
        ctx.close();ok(f'SPEC114 {w}px : {len(NOMS)} états, shell/intérieurs et conservation mobile')
    # Zoom navigateur simulé par viewport CSS réduit + densité physique, sans
    # appliquer zoom/transform à l'interface. Les docks restent visibles à 600px.
    if not FAMILLES:
        for facteur in [1.25,1.5]:
            w,h=round(1440/facteur),round(900/facteur)
            ctx=b.new_context(viewport={'width':w,'height':h},device_scale_factor=facteur,reduced_motion='reduce')
            pg=ctx.new_page();preparer(pg,URL)
            for nom in ['dashboard','parcours','mission','pfin','examen','examen-result','jeux','survie','runner','luxdemasque']:
                ouvrir(pg,nom);m=mesurer(pg,nom)
                assert m['overflow']<=1 and abs(m['shell']['width']-640)<=2,(facteur,nom,m['shell'])
            ctx.close();ok(f'SPEC114 zoom {int(facteur*100)} % : dix parcours')
    b.close()
sortie=Path('artifacts/spec-114');sortie.mkdir(parents=True,exist_ok=True)
nom_sortie='tests-geometrie-partiel.json' if FAMILLES else 'tests-geometrie.json'
(sortie/nom_sortie).write_text(json.dumps(mesures,ensure_ascii=False,indent=2)+'\n')
