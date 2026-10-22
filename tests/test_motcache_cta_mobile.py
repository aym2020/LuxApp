"""Valider entièrement visible avant/après trois erreurs Mot caché sur Android."""
import os
from playwright.sync_api import sync_playwright
URL=os.getenv('LUX_URL','http://127.0.0.1:3456/')
SIZES=((320,700),(360,740),(390,844),(430,932))
INIT="""() => {
  choisirNiveau('A1.1'); marquerIntroMissionVue(2);
  openParcoursLecon(lecons.find(l=>l.id===2));startUnite(1,'unite');
  renderMotCache({id:990070,fr:'Bonsoir !',lu:'Gudden Owend!',unite:1,
    attention:'Le soir : Gudden Owend, avec n devant la voyelle O.'});
  if(document.querySelector('#mc-btn-reconstruire'))renderReconstruction();
}"""
BAD="""() => {
 const free=mcCasesLettres().libres, picked=[];
 for (let k=0;k<free.length;k++){
  const wanted=normalize(mc.cases[free[k]].ch);
  let i=mc.tuiles.findIndex((t,j)=>!picked.includes(j)&&!t.retiree&&normalize(t.ch)!==wanted);
  if(i<0)i=mc.tuiles.findIndex((t,j)=>!picked.includes(j)&&!t.retiree);
  if(i<0)throw Error('Aucune tuile');
  picked.push(i);
 }
 mc.choix=picked;mcSynchroniserChamp();renderCases();mcValider();
 return mc.essais;
}"""
RECT="""() => {
 const b=document.querySelector('#mc-btn-valider').getBoundingClientRect();
 const m=document.querySelector('.mc-milieu'),f=document.querySelector('.mc-saisie').getBoundingClientRect();
 const v=visualViewport;
 return {top:b.top,bottom:b.bottom,h:b.height,fb:f.bottom,limit:v?v.offsetTop+v.height:innerHeight,
         overflow:getComputedStyle(m).overflowY,middle:m.getBoundingClientRect().height};
}"""
def check(page,size,label):
 x=page.evaluate(RECT)
 assert x['top']>=-1 and x['bottom']<=x['limit']-1,(size,label,x)
 assert x['fb']<=x['limit']+1 and x['h']>=48,(size,label,x)
 assert x['overflow']=='auto' and x['middle']>0,(size,label,x)
with sync_playwright() as p:
 browser=p.chromium.launch()
 try:
  for w,h in SIZES:
   ctx=browser.new_context(viewport={'width':w,'height':h},device_scale_factor=2,is_mobile=True,has_touch=True)
   page=ctx.new_page()
   errors=[]
   page.on('pageerror',lambda e:errors.append(str(e)))
   page.route('**/www.gstatic.com/**',lambda r:r.abort())
   page.route('**/fonts.googleapis.com/**',lambda r:r.abort())
   page.goto(URL,wait_until='domcontentloaded')
   page.locator('#today').wait_for(timeout=15000)
   page.evaluate(INIT);check(page,(w,h),'0 erreur')
   for n in (1,2,3):
    assert page.evaluate(BAD)==n,(w,h,n)
    check(page,(w,h),str(n)+' erreurs')
    page.locator('.mc-milieu').evaluate('el=>el.scrollTop=el.scrollHeight')
    check(page,(w,h),str(n)+' erreurs après scroll')
   assert not errors,(w,h,errors)
   print('OK :',w,h,'0/1/2/3 erreurs et scroll du milieu',flush=True)
   ctx.close()
 finally:browser.close()
