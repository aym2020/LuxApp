"""SPEC112 : swipe et sélection des AFFAIRES Lux Démasqué, mobile et sauvegarde inchangée."""
from pathlib import Path
from playwright.sync_api import sync_playwright
from helpers import URL,ok
ART=Path('artifacts/lux-demasque-selection');ART.mkdir(parents=True,exist_ok=True)
with sync_playwright() as p:
 b=p.chromium.launch()
 for w,h in ((320,600),(360,740),(393,852),(430,932)):
  ctx=b.new_context(viewport={'width':w,'height':h},is_mobile=True,has_touch=True)
  page=ctx.new_page();errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.route('**/fonts.googleapis.com/**',lambda r:r.abort())
  page.goto(URL);page.wait_for_selector('#today')
  page.evaluate('ouvrirJeux()')
  page.locator('.ld-carte-hub .ld-jouer-hub').click()
  page.wait_for_selector('#ld-selection-carte',timeout=40000)
  mesures=page.evaluate("""() => ({
   partie:ld.partie===null,etat:document.querySelector('#ld-jeu').dataset.ecran,
   total:ld.selection.items.length,first:ld.selection.items[0].id,
   overflow:document.documentElement.scrollWidth-innerWidth,
   buttons:[...document.querySelectorAll('.ld-selection button')].map(x=>{
     const r=x.getBoundingClientRect();return [r.width,r.height] }),
   bottom:document.querySelector('.ld-selection-actions .ld-btn-or').getBoundingClientRect().bottom
  })""")
  assert mesures['partie'] and mesures['etat']=='selection',mesures
  assert mesures['total']==4 and mesures['first']=='MILO_001',mesures
  assert mesures['overflow']<=1,mesures
  assert all(min(x)>=44 for x in mesures['buttons']),mesures
  if w==360:page.screenshot(path=str(ART/'selection-360x740.png'),full_page=True)
  if w==393:page.screenshot(path=str(ART/'selection-393x852.png'),full_page=True)
  page.get_by_role('button',name='Affaire suivante').click()
  assert page.evaluate('ld.selection.items[ld.selection.index].id')=='NOAH_001'
  assert page.evaluate('ld.partie') is None
  page.get_by_role('button',name='Affaire précédente').click()
  assert page.evaluate('ld.selection.index')==0
  # Tactile natif : déplacement vers la gauche => prochain dossier, pas une ouverture.
  bb=page.locator('#ld-selection-carte').bounding_box()
  y=bb['y']+bb['height']/2;x=bb['x']+bb['width']/2
  cdp=page.context.new_cdp_session(page)
  cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':x+50,'y':y}]})
  for i in range(1,7):
   cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':x+50-i*24,'y':y+2}]})
   page.wait_for_timeout(16)
  cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
  page.wait_for_function('ld.selection && ld.selection.index===1')
  assert page.evaluate('ld.partie') is None
  page.get_by_role('button',name='Ouvrir ce dossier').click()
  page.wait_for_selector('.ld-rencontre',timeout=40000)
  assert page.evaluate('ld.partie.dossier.id')=='NOAH_001'
  assert page.evaluate('ld.partie.phase')=='rencontre'
  assert not errors,errors
  ok(f'{w}x{h} : swipe affaire, sélection et rencontre Noah')
  ctx.close()
 ctx=b.new_context(viewport={'width':360,'height':740},is_mobile=True,has_touch=True)
 page=ctx.new_page()
 page.goto(URL);page.wait_for_selector('#today')
 page.evaluate("ldEcrire('luxDemasqueResolus',['MILO_001']);ldOuvrirSelection()")
 page.wait_for_selector('#ld-selection-carte')
 assert page.evaluate('ld.selection.items[ld.selection.index].id')=='NOAH_001'
 page.evaluate('ldSelectionChanger(2)')
 assert page.locator('.ld-selection-etat').inner_text()=='AFFAIRE MYSTÈRE'
 assert page.evaluate('ld.partie') is None
 page.get_by_role('button',name='Découvrir cette affaire').click()
 page.wait_for_selector('.ld-rencontre',timeout=40000)
 assert page.evaluate('ld.partie.dossier.genere') is True
 ok('affaire générée, résolus conservés et non dévoilés')
 ctx.close();b.close()
