"""Relevé reproductible SPEC 114 : 24 vues réelles + panneaux/états de jeu."""
import json
import os
import subprocess
from pathlib import Path
from playwright.sync_api import sync_playwright
from helpers import URL
from layout114_scenarios import VUES, AUTRES, preparer, ouvrir, mesurer

phase = os.environ.get('LUX_CAPTURE_PHASE', 'apres')
sortie = Path('artifacts/spec-114')/phase
sortie.mkdir(parents=True, exist_ok=True)
mesures = []
noms = os.environ.get("LUX_CAPTURE_VIEWS", "").split(",") if os.environ.get("LUX_CAPTURE_VIEWS") else list(VUES)+list(AUTRES)
commit = subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip()
styles_modifies = bool(subprocess.check_output(['git','diff','--name-only','HEAD','--','public'],text=True).strip())


def enregistrer():
    # Toujours conserver une preuve exploitable, même si une capture échoue.
    contenu = {'commit':commit, 'styles_non_committes':styles_modifies,
               'vues':len(VUES), 'etats_attendus':len(noms)*3, 'mesures':mesures}
    temporaire = sortie/'mesures.tmp.json'
    temporaire.write_text(json.dumps(contenu,ensure_ascii=False,indent=2)+'\n')
    temporaire.replace(sortie/'mesures.json')


with sync_playwright() as p:
    b = p.chromium.launch(args=['--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    for w,h in [(390,844),(720,900),(1440,900)]:
        ctx=b.new_context(viewport={'width':w,'height':h},reduced_motion='reduce')
        pg=ctx.new_page()
        preparer(pg,URL)
        for nom in noms:
            ouvrir(pg,nom,nom in AUTRES)
            mesures.append(mesurer(pg,nom))
            pg.screenshot(path=str(sortie/f'{nom}-{w}.png'),full_page=True)
            enregistrer()
        ctx.close()
        print(f'{phase} {w} : {len(noms)} états mesurés et capturés',flush=True)
    b.close()
assert len(mesures) == len(noms)*3
enregistrer()
