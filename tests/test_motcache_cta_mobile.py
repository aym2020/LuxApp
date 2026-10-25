"""Mot caché sur Chromium tactile : fenêtre rouge et Valider visibles, aucun swipe initial.
SPEC 95 : Effacer / Indice / Valider sont dans le pied d'action ; seul .exo-scroll défile.
Les positions des cases et des tuiles sont mesurées dans le contenu (indépendantes du défilement)."""
import os
from pathlib import Path
from playwright.sync_api import sync_playwright
URL=os.getenv('LUX_URL','http://127.0.0.1:3456/')
SIZES=((320,700),(360,740),(390,844),(430,932))
OUT=Path('captures/mc-cta-mobile')
OUT.mkdir(parents=True,exist_ok=True)
INIT="""() => {
 choisirNiveau('A1.1');marquerIntroMissionVue(2);
 openParcoursLecon(lecons.find(l=>l.id===2));startUnite(1,'unite');
 renderMotCache({id:990070,fr:'Bonsoir !',lu:'Gudden Owend!',unite:1,
 attention:'Le soir : Gudden Owend, avec n devant la voyelle O.'});
 if(document.querySelector('#mc-btn-reconstruire'))renderReconstruction();
 window.scrollTo(0,0);
}"""
BAD="""() => {
 const free=mcCasesLettres().libres,picked=[];
 for(let k=0;k<free.length;k++){
   const want=normalize(mc.cases[free[k]].ch);
   let i=mc.tuiles.findIndex((t,j)=>!picked.includes(j)&&!t.retiree&&normalize(t.ch)!==want);
   if(i<0)i=mc.tuiles.findIndex((t,j)=>!picked.includes(j)&&!t.retiree);
   if(i<0)throw Error('Tuile absente');
   picked.push(i);
 }
 mc.choix=picked;mcSynchroniserChamp();renderCases();mcValider();
 return mc.essais;
}"""
METRICS="""() => {
 const r=e=>e.getBoundingClientRect(), b=document.querySelector('#mc-btn-valider');
 const e=document.querySelector('#mc-erreur'), zone=document.querySelector('#pc-scroll'),page=document.querySelector('#view-parcours');
 const vv=visualViewport,limit=vv?vv.offsetTop+vv.height:innerHeight;
 const z=r(zone), dans=el=>r(el).top-z.top+zone.scrollTop; // position dans le contenu
 const dock=r(document.querySelector('#pc-action-dock'));
 const er=r(e),btn=r(b), els=[document.documentElement,document.body,page,zone,document.querySelector('.pc-body')];
 return {bottom:btn.bottom,top:btn.top,height:btn.height,errorHidden:e.classList.contains('hidden'),
 errorTop:er.top,errorBottom:er.bottom,errorHeight:er.height,limit,zoneTop:z.top,dockTop:dock.top,
 overflowX:Math.max(...els.map(el=>el.scrollWidth-el.clientWidth)),
 debugX:els.map(el=>({node:el.tagName,cls:String(el.className).slice(0,60),dx:el.scrollWidth-el.clientWidth})),
 overflowY:zone.scrollHeight-zone.clientHeight,bodyScroll:scrollY,
 casesTop:dans(document.querySelector('#mc-cases')),tilesTop:dans(document.querySelector('#mc-lettres')),
 legendShown:getComputedStyle(document.querySelector('#mc-legende')).display!=='none',
 tileHeight:r(document.querySelector('#mc-lettres')).height,
 footerTop:dans(document.querySelector('.mc-saisie'))};
}"""
def check(page,size,scenario,after):
 x=page.evaluate(METRICS)
 assert x['overflowX']<=1,(size,scenario,'horizontal',x)
 assert abs(x['bodyScroll'])<=1,(size,scenario,'window scroll',x)
 assert x['top']>=-1 and x['bottom']<=x['limit']-1,(size,scenario,'Valider',x)
 assert x['height']>=48,(size,scenario,x)
 assert x['legendShown'],(size,scenario,'legend not visible',x)
 if after:
  assert not x['errorHidden'] and x['errorHeight']>=40,(size,scenario,'error hidden',x)
 return x

def check_visible(page,size,scenario):
 """Juste après une validation fausse : le diagnostic est visible entre l'en-tête et le pied."""
 x=page.evaluate(METRICS)
 assert x['errorTop']>=x['zoneTop']-1 and x['errorBottom']<=x['dockTop']+1,(size,scenario,'red clipped',x)
 return x

def check_initial(page,size,scenario):
 x=check(page,size,scenario,False)
 assert x['errorHidden'],(size,scenario,'error shown before attempt',x)
 return x
with sync_playwright() as p:
 browser=p.chromium.launch()
 try:
  for w,h in SIZES:
   ctx=browser.new_context(viewport={'width':w,'height':h},device_scale_factor=2,is_mobile=True,has_touch=True)
   page=ctx.new_page()
   errors=[]
   page.on('pageerror',lambda e:errors.append(str(e)))
   page.route('**/www.gstatic.com/**',lambda route:route.abort())
   page.route('**/fonts.googleapis.com/**',lambda route:route.abort())
   page.goto(URL,wait_until='domcontentloaded')
   page.locator('#today').wait_for(timeout=15000)
   page.evaluate(INIT);page.wait_for_timeout(240)
   baseline=check_initial(page,(w,h),'avant réponse')
   assert not page.locator('#mc-aide-dialog').evaluate('el=>el.open'),(w,h,'dialog visible initially')
   page.screenshot(path=str(OUT/f'{w}x{h}-depart.png'))
   for n in (1,2,3):
    assert page.evaluate(BAD)==n,(w,h,n)
    page.wait_for_timeout(80)
    current=check(page,(w,h),f'erreur {n}',True)
    check_visible(page,(w,h),f'erreur {n}')
    for key in ('casesTop','tilesTop','footerTop','tileHeight'):
     assert abs(current[key]-baseline[key])<=2,(w,h,n,key,baseline[key],current[key])
    assert page.locator('.mc-aide-ouvrir').is_visible(),(w,h,'help link')
    before=page.evaluate('mc.indices')
    page.locator('.mc-aide-ouvrir').click()
    assert page.locator('#mc-aide-dialog').evaluate('el=>el.open'),(w,h,'dialog not opened')
    assert page.locator('#mc-aide-detail').inner_text().strip(),(w,h,'missing detail')
    assert page.evaluate('mc.indices')==before,(w,h,'help has charged points')
    if n==2:page.screenshot(path=str(OUT/f'{w}x{h}-aide-ouverte.png'))
    if n==1:page.keyboard.press('Escape')
    else:page.locator('.mc-aide-fermer').click()
    assert not page.locator('#mc-aide-dialog').evaluate('el=>el.open'),(w,h,'dialog not closed')
    check(page,(w,h),f'erreur {n}, aide fermée',True)
    if n==2:page.screenshot(path=str(OUT/f'{w}x{h}-2-erreurs.png'))
    page.locator('#pc-scroll').evaluate('el=>el.scrollTop=el.scrollHeight')
    check(page,(w,h),f'erreur {n}, après scroll',True)
   assert page.locator('#mc-btn-voir').is_hidden(),(w,h,'révélation exposée hors du panneau')
   page.locator('.mc-aide-ouvrir').click()
   assert page.locator('#mc-btn-voir').is_visible(),(w,h,'option après 3 essais absente')
   page.locator('#mc-btn-voir').click()
   assert page.evaluate('pAttente'),(w,h,'révélation ne termine pas le mot')
   assert not page.locator('#mc-aide-dialog').evaluate('el=>el.open'),(w,h,'panneau non fermé')
   assert page.locator('#pc-continuer').is_visible(),(w,h,'Continuer manquant')
   assert not errors,(w,h,errors)
   print(f'OK {w}x{h}: legende visible, cases/tuiles fixes 0-3 erreurs et Valider accessible',flush=True)
   ctx.close()
 finally:browser.close()
