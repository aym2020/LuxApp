"""Mot caché sur Chromium tactile : fenêtre rouge et Valider visibles, aucun swipe initial."""
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
 const e=document.querySelector('#mc-erreur'), middle=document.querySelector('.mc-milieu'),page=document.querySelector('#view-parcours');
 const vv=visualViewport,limit=vv?vv.offsetTop+vv.height:innerHeight;
 const er=r(e),btn=r(b), els=[document.documentElement,document.body,page,document.querySelector('.pc-body'),middle];
 return {bottom:btn.bottom,top:btn.top,height:btn.height,errorHidden:e.classList.contains('hidden'),
 errorTop:er.top,errorBottom:er.bottom,errorHeight:er.height,limit,
 overflowX:Math.max(...els.map(el=>el.scrollWidth-el.clientWidth)),
 debugX:els.map(el=>({node:el.tagName,cls:String(el.className).slice(0,60),dx:el.scrollWidth-el.clientWidth})),
 overflowY:middle.scrollHeight-middle.clientHeight,bodyScroll:scrollY};
}"""
def check(page,size,scenario,after):
 x=page.evaluate(METRICS)
 assert x['overflowX']<=1,(size,scenario,'horizontal',x)
 assert abs(x['bodyScroll'])<=1,(size,scenario,'window scroll',x)
 assert x['top']>=-1 and x['bottom']<=x['limit']-1,(size,scenario,'Valider',x)
 assert x['height']>=48,(size,scenario,x)
 if after:
  assert not x['errorHidden'] and x['errorHeight']>=45,(size,scenario,'error hidden',x)
  assert x['errorTop']>=-1 and x['errorBottom']<=x['limit']-1,(size,scenario,'red clipped',x)
 else:
  assert x['errorHidden'],(size,scenario,'error shown before attempt',x)
  assert x['overflowY']<=1,(size,scenario,'initial vertical scroll',x)
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
   check(page,(w,h),'avant réponse',False)
   assert not page.locator('#mc-aide-dialog').evaluate('el=>el.open'),(w,h,'dialog visible initially')
   page.screenshot(path=str(OUT/f'{w}x{h}-depart.png'))
   for n in (1,2,3):
    assert page.evaluate(BAD)==n,(w,h,n)
    page.wait_for_timeout(80)
    check(page,(w,h),f'erreur {n}',True)
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
    page.locator('.mc-milieu').evaluate('el=>el.scrollTop=el.scrollHeight')
    check(page,(w,h),f'erreur {n}, après scroll',True)
   assert not errors,(w,h,errors)
   print(f'OK {w}x{h}: sans scroll initial, erreur visible et Valider après 3 erreurs',flush=True)
   ctx.close()
 finally:browser.close()
