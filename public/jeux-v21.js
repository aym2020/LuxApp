/* SPEC 88 — Jeux / Survie. Nouveau moteur indépendant des leçons et examens. */
'use strict';
let surviePartie = null;
const SURVIE_DUREE = 30;
const SURVIE_BONUS = 3;
const SURVIE_PENALITE = 3;
const SURVIE_MAX = 30;
const SURVIE_GEL_DUREE = 3; // pouvoir expérimental VFX, SPEC 90 à venir
const SURVIE_GEL_RECHARGE = 5; // réussites, jamais secondes
function survieChaleur(s){return s>=20?4:s>=15?3:s>=10?2:s>=5?1:0;}
function survieChaleurNom(s){return ['CHARGE','IGNITION','BRASIER','SURCHAUFFE','INFERNO'][survieChaleur(s)];}

function survieComboPalier(s) { return s>=10?3:s>=5?2:s>=3?1:0; }
function survieComboMessage(s) {
  return s>=10?'LÉGENDAIRE ×'+s:s>=5?'EN FEU ×'+s:s>=3?'COMBO ×'+s:s===2?'DOUBLE !':'BIEN JOUÉ !';
}
function survieGainLabel(reel) {
  const n=Math.round(Math.max(0,reel)*10)/10;
  return n ? '+'+String(n).replace('.',',')+' s' : 'CHRONO PLEIN';
}
// Une seule impulsion par réponse, sur un HUD qui n'est jamais recréé
// entre les questions. Aucun reflow forcé (ancien offsetWidth).
function survieCelebrate(p) {
  const combo=document.getElementById('survie-combo');
  const cri=document.getElementById('survie-combo-cri');
  const chrono=document.getElementById('survie-chrono');
  const gain=document.getElementById('survie-gain');
  if(cri)cri.textContent=survieComboMessage(p.serie);
  if(gain)gain.textContent=p.gainTexte;
  if(combo){
    // Ne pas couper une animation déjà en cours : une impulsion, pas deux.
    if(!combo.className.includes('survie-combo-hit'))combo.className='survie-combo survie-combo-hit';
  }
  if(chrono && !chrono.className.includes('survie-time-hit'))
    chrono.className='survie-hud-time survie-time-hit';
  // Nettoyage après la plus longue animation (620ms), sans DOM recréé.
  setTimeout(()=>{
    if(surviePartie!==p || !p.actif)return;
    if(combo && combo.className.includes('survie-combo-hit'))combo.className='survie-combo';
    if(chrono && chrono.className.includes('survie-time-hit'))chrono.className='survie-hud-time';
  },650);
}
function survieResetEffects(){
  const combo=document.getElementById('survie-combo'),chrono=document.getElementById('survie-chrono');
  if(combo)combo.className='survie-combo';
  if(chrono)chrono.className='survie-hud-time';
}

function jeuEscape(texte) {
  return String(texte).replace(/[&<>"']/g, c =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
}
function survieLettres(mot) {
  return Array.from(String(mot || '').normalize('NFC'));
}
function survieMelanger(arr) {
  const resultat = arr.slice();
  for (let i=resultat.length-1;i>0;i--) {
    const j=Math.floor(Math.random()*(i+1));
    [resultat[i],resultat[j]]=[resultat[j],resultat[i]];
  }
  if (resultat.length>1 && resultat.join('')===arr.join('')) {
    [resultat[0],resultat[1]]=[resultat[1],resultat[0]];
  }
  return resultat;
}
// Critère : leçon déjà ouverte, terminée, ou question réellement étudiée.
// Une leçon simplement disponible dans A1.1/A1.2 ne débloque aucun mot.
function survieLeconEtudiee(lecon, progress) {
  if (!lecon || lecon.id == null) return false;
  const etat=progress && progress[lecon.id];
  if (typeof getLeconVue === 'function' && getLeconVue(lecon.id)) return true;
  if (!etat || typeof etat!=='object') return false;
  return ['vue','unites','flashcards','quiz','trous','ecriture','sansfaute','mission','plus']
    .some(cle=>etat[cle] && Object.keys(etat[cle]).length>0);
}
function survieMotsDisponibles(liste, progress) {
  const pool=[],vocab=new Set(),definitions=new Set();
  for(const lecon of liste||[]) {
    if(!survieLeconEtudiee(lecon,progress)) continue;
    for(const c of lecon.flashcards||[]) {
      if(!c || c.plus || typeof c.lu!=='string' || typeof c.fr!=='string') continue;
      const mot=c.lu.normalize('NFC').trim();
      const fr=c.fr.trim().replace(/[.!?]+$/,'').trim();
      const lettres=survieLettres(mot);
      // Mots isolés uniquement : pas de phrases, d'articles à reconstruire,
      // de flexions inconnues ou de caractères impossibles à saisir sur les tuiles.
      if(lettres.length<3 || lettres.length>12 ||
         !/^\p{L}+$/u.test(mot) ||
         !/^[\p{L}]+(?:[ '-][\p{L}]+){0,2}$/u.test(fr)) continue;
      const k=mot.toLocaleLowerCase('lb');
      const f=fr.toLocaleLowerCase('fr');
      if(k===f || vocab.has(k) || definitions.has(f)) continue;
      vocab.add(k);definitions.add(f);
      pool.push({mot,fr,longueur:lettres.length,leconId:lecon.id});
    }
  }
  return pool;
}
function surviePool() {
  const prog=typeof getProgress==='function'?getProgress():{};
  return survieMotsDisponibles(typeof lecons==='undefined'?[]:lecons,prog);
}
function survieRecord() {
  try {
    const key=typeof storageKey==='function'?storageKey('luxSurvieBest'):'luxSurvieBest';
    const value=JSON.parse(localStorage.getItem(key));
    return value && Number.isInteger(value.record) && value.record>0 ? value.record:0;
  } catch (_) {return 0;}
}
function survieEnregistrer(record) {
  if(record<=survieRecord())return;
  try {
    const key=typeof storageKey==='function'?storageKey('luxSurvieBest'):'luxSurvieBest';
    localStorage.setItem(key,JSON.stringify({record,maj:Date.now()}));
  } catch (_) { /* stockage facultatif */ }
}
function ouvrirJeux() {
  survieArreter();
  renderJeuxHub();
  showView('view-jeux');
}
function renderJeuxHub() {
  const box=document.getElementById('jeux-hub');
  if(!box)return;
  const nombre=surviePool().length,record=survieRecord();
  box.innerHTML=
    '<button class="jeux-retour" type="button" onclick="retour()">← Accueil</button>'+
    '<header class="jeux-entete"><span class="jeux-kicker">LUXAPP · MINI-JEUX</span>'+
      '<h1>Jeux<span>.</span></h1>'+
      '<p>Révise autrement, avec les mots que tu as déjà rencontrés.</p></header>'+
    '<section class="jeux-carte" aria-labelledby="jeux-survie-titre">'+
      '<div class="jeux-lettres" aria-hidden="true"><span>S</span><span>U</span><span>R</span></div>'+
      '<h2 id="jeux-survie-titre">Survie</h2>'+
      '<p>Des lettres mélangées, un chrono et des mots de plus en plus longs. Jusqu’où iras-tu ?</p>'+
      '<div class="jeux-meta"><span>'+nombre+' mots disponibles</span><span>Record : <b>'+record+'</b></span></div>'+
      (nombre>=4?'<button class="jeux-jouer" type="button" onclick="demarrerSurvie()">Jouer <span aria-hidden="true">→</span></button>':
      '<p class="jeux-verrou">Découvre quelques mots dans tes leçons pour débloquer Survie (minimum 4).</p>'+
      '<button class="jeux-jouer" type="button" onclick="goLessons()">Voir mon chemin →</button>')+
    '</section>';
}
function survieChoisirMot(partie) {
  const disponibles=partie.pool.filter(m=>!partie.vus.has(m.mot.toLocaleLowerCase('lb')));
  if(!disponibles.length)partie.vus.clear();
  const candidats=partie.pool.filter(m=>!partie.vus.has(m.mot.toLocaleLowerCase('lb')) &&
    (partie.pool.length===1||!partie.precedent||m.mot!==partie.precedent));
  const base=candidats.length?candidats:partie.pool;
  // Tous les 3 mots on monte d'un cran, sans choisir un mot encore plus long
  // que les acquis disponibles. Pas de blocage si le pool contient des mots courts.
  const cible=Math.min(12,4+Math.floor(partie.total/3));
  const longueurs=base.map(m=>m.longueur);
  const diff=Math.min(...longueurs.map(n=>Math.abs(n-cible)));
  const proches=base.filter(m=>Math.abs(m.longueur-cible)===diff);
  return proches[Math.floor(Math.random()*proches.length)];
}
function survieNouvelleQuestion() {
  const partie=surviePartie;
  if(!partie || !partie.actif)return;
  partie.mot=survieChoisirMot(partie);
  partie.precedent=partie.mot.mot;
  partie.vus.add(partie.mot.mot.toLocaleLowerCase('lb'));
  partie.tuiles=survieMelanger(survieLettres(partie.mot.mot));
  partie.selection=[];
  partie.verrou=false;
  survieRendre();
}
function survieHud() {
  const p=surviePartie;
  if(!p)return;
  const timer=document.getElementById('survie-secondes');
  const jauge=document.getElementById('survie-jauge');
  const serie=document.getElementById('survie-serie');
  const sec=Math.ceil(p.restant),label=sec+' s';
  if(timer && timer.textContent!==label)timer.textContent=label;
  if(jauge)jauge.style.transform='scaleX('+Math.max(0,Math.min(1,p.restant/SURVIE_MAX))+')';
  if(serie && serie.textContent!==String(p.serie))serie.textContent=p.serie;
  const combo=document.getElementById('survie-combo');
  const tier=survieComboPalier(p.serie);
  if(combo && p.hudTier!==tier){
    combo.setAttribute('data-tier',String(tier));
    p.hudTier=tier;
  }
  const chaleur=survieChaleur(p.serie);
  const meter=document.getElementById('survie-combo-meter');
  const fill=document.getElementById('survie-combo-fill');
  const labelCombo=document.getElementById('survie-combo-phase');
  if(meter && p.hudChaleur!==chaleur){
    meter.setAttribute('data-heat',String(chaleur));
    p.hudChaleur=chaleur;
  }
  if(fill)fill.style.transform='scaleX('+Math.min(1,p.serie/20)+')';
  if(labelCombo){
    const label=survieChaleurNom(p.serie);
    if(labelCombo.textContent!==label)labelCombo.textContent=label;
  }
  const shell=document.getElementById('survie-jeu');
  const frozen=p.gelRestant>0;
  if(shell && p.hudGele!==frozen){
    shell.className=frozen?'survie-jeu survie-is-frozen':'survie-jeu';
    p.hudGele=frozen;
  }
  const pouvoir=document.getElementById('survie-gel-bouton');
  const etat=document.getElementById('survie-gel-etat');
  const indicateur=document.getElementById('survie-freeze-indicator');
  const gelTexte=frozen?'GEL ACTIF · '+Math.ceil(p.gelRestant)+' s':
    p.gelRecharge>0?'RECHARGE · '+p.gelRecharge+' MOTS':'PRÊT · 3 s';
  if(etat && etat.textContent!==gelTexte)etat.textContent=gelTexte;
  if(pouvoir){
    const unavailable=frozen||p.gelRecharge>0;
    if(pouvoir.disabled!==unavailable)pouvoir.disabled=unavailable;
    const accessible='Gel temporel. '+gelTexte;
    if(p.gelAria!==accessible){pouvoir.setAttribute('aria-label',accessible);p.gelAria=accessible;}
  }
  if(indicateur)indicateur.textContent=frozen?'TEMPS GELÉ':'';
}
// Seule la consommation du chronomètre s'arrête, pas le jeu ni les réponses.
// Le stock gelé est mesuré en temps actif (document caché = aucune consommation).
function survieActiverGel(){
  const p=surviePartie;
  if(!p||!p.actif||p.verrou||p.gelRestant>0||p.gelRecharge>0||
      document.visibilityState==='hidden')return;
  survieTick(); // solder les millisecondes écoulées avant l'appui
  if(!p.actif)return;
  p.gelRestant=SURVIE_GEL_DUREE;
  p.gelRecharge=SURVIE_GEL_RECHARGE;
  survieHud();
}
// Le HUD est un élément stable de la partie. Modifier uniquement cette zone
// est essentiel : sinon les keyframes redémarrent après chaque mot (+280ms).
function survieQuestionHtml(p) {
  return '<div class="survie-mot"><span>RECONSTRUIS LE MOT</span><h1>'+jeuEscape(p.mot.fr)+'</h1>'+
      '<p>'+p.mot.longueur+' lettres</p></div>'+
    '<div id="survie-cases" class="survie-cases" aria-label="Mot à reconstruire">'+
      survieLettres(p.mot.mot).map((_,i)=>'<span class="survie-case" data-case="'+i+'"></span>').join('')+'</div>'+
    '<div id="survie-tuiles" class="survie-tuiles" aria-label="Lettres mélangées">'+
      p.tuiles.map((l,i)=>'<button type="button" class="survie-tuile" data-index="'+i+
        '" onclick="survieLettre('+i+')" aria-label="Lettre '+jeuEscape(l)+', position '+(i+1)+'">'+jeuEscape(l)+'</button>').join('')+'</div>'+
    '<div class="survie-actions"><button type="button" onclick="survieEffacer()" aria-label="Effacer la dernière lettre">⌫ Effacer</button>'+
      '<button type="button" class="survie-skip" onclick="surviePasser()" aria-label="Passer ce mot : perdre 3 secondes et la série">Passer <small>−3 s</small></button>'+
      '<span id="survie-info" role="status" aria-live="polite">Choisis les lettres dans l’ordre</span></div>';
}
function survieRendre() {
  const box=document.getElementById('survie-jeu'),p=surviePartie;
  if(!box||!p||!p.mot)return;
  if(p.ecranPret){
    const question=document.getElementById('survie-question');
    if(question){
      question.innerHTML=survieQuestionHtml(p);
      survieHud();
      return;
    }
    p.ecranPret=false; // vue détruite ailleurs, restauration complète une fois
  }
  box.innerHTML=
    '<div class="survie-top"><button type="button" onclick="quitterSurvie()">← Jeux</button>'+
      '<span>MODE SURVIE</span></div>'+
    '<div class="survie-hud">'+
      '<div id="survie-combo" class="survie-combo" data-tier="'+survieComboPalier(p.serie)+'">'+
        '<span class="survie-hud-label">SÉRIE</span><div class="survie-combo-valeur">'+
        '<span class="survie-flamme" aria-hidden="true"><img src="assets/survie-flamme-v1.svg" width="44" height="58" alt=""></span>'+
        '<strong id="survie-serie">'+p.serie+'</strong>'+
        '<span class="survie-etincelles" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></span>'+
        '<span id="survie-combo-cri" class="survie-combo-cri" aria-hidden="true">'+jeuEscape(survieComboMessage(p.serie))+'</span>'+
        '</div></div>'+
      '<div id="survie-chrono" class="survie-hud-time">'+
        '<span class="survie-hud-label">CHRONO</span>'+
        '<strong id="survie-secondes">'+Math.ceil(p.restant)+' s</strong>'+
        '<span id="survie-freeze-indicator" class="survie-freeze-indicator"></span>'+
        '<span id="survie-gain" class="survie-gain" aria-hidden="true"></span></div></div>'+
    '<div class="survie-meter-stack">'+
      '<div class="survie-meter-top"><span>ÉNERGIE COMBO</span>'+
        '<strong id="survie-combo-phase">'+survieChaleurNom(p.serie)+'</strong></div>'+
      '<div id="survie-combo-meter" class="survie-combo-meter" data-heat="'+survieChaleur(p.serie)+'" aria-label="Énergie combo">'+
        '<i id="survie-combo-fill" style="transform:scaleX('+Math.min(1,p.serie/20)+')"></i>'+
        '<span class="survie-meter-fire" aria-hidden="true"></span></div>'+
      '<div class="survie-meter-time">'+
        '<div class="survie-piste" role="progressbar" aria-label="Temps restant" aria-valuemin="0" aria-valuemax="30" aria-valuenow="'+Math.ceil(p.restant)+'">'+
          '<i id="survie-jauge" style="transform:scaleX('+(p.restant/30)+')"></i></div>'+
        '<span class="survie-ice-sheen" aria-hidden="true"></span></div>'+
    '</div>'+
    '<div class="survie-pouvoirs">'+
      '<button type="button" id="survie-gel-bouton" class="survie-gel-bouton" onclick="survieActiverGel()" aria-label="Gel temporel. Prêt, 3 secondes">'+
        '<span class="survie-ice-icon" aria-hidden="true"><svg viewBox="0 0 48 48" fill="none">'+
          '<path d="M24 5v38M5 24h38M10 10l28 28M38 10L10 38" stroke="currentColor" stroke-width="2.7" stroke-linecap="round"/>'+
          '<path d="m19 10 5 5 5-5m-10 28 5-5 5 5M10 19l5 5-5 5m28 0-5 5 5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'+
        '</svg></span>'+
        '<span class="survie-gel-copy"><strong>GEL TEMPOREL</strong><small id="survie-gel-etat">PRÊT · 3 s</small></span>'+
      '</button>'+
      '<span class="survie-pouvoir-note">Temps figé · recharge après 5 mots</span>'+
    '</div>'+
    '<div id="survie-question">'+survieQuestionHtml(p)+'</div>'+
    '<div class="survie-record">Record personnel : <span id="survie-record-chiffre">'+survieRecord()+'</span> mots</div>';
  p.ecranPret=true;
  survieHud();
}

// Même pénalité que sur une réponse fausse, sans altérer score ni record.
function surviePenaliser(p) {
  p.serie=0;
  p.gainTexte='';
  p.restant=Math.max(0,p.restant-SURVIE_PENALITE);
  survieResetEffects();
  survieHud();
}
// Passer est un abandon volontaire du mot : -3s, série perdue, mot suivant.
function surviePasser() {
  const p=surviePartie;
  if(!p || !p.actif || p.verrou || !p.mot)return;
  p.verrou=true; // protège du double tap et des touches pendant la transition
  surviePenaliser(p);
  const info=document.getElementById('survie-info');
  if(info){info.className='survie-ko';info.textContent='Mot passé · −3 s · série perdue';}
  if(p.restant<=0){survieTerminer();return;}
  const current=p;
  setTimeout(()=>{
    if(surviePartie!==current || !p.actif)return;
    if(p.restant<=0){survieTerminer();return;}
    survieNouvelleQuestion();
  },260);
}
function survieLettre(index) {
  const p=surviePartie;
  if(!p||!p.actif||p.verrou||p.selection.some(i=>i===index)||index<0||index>=p.tuiles.length)return;
  p.selection.push(index);
  const bouton=document.querySelector('#survie-tuiles [data-index="'+index+'"]');
  if(bouton)bouton.disabled=true;
  const slot=document.querySelector('#survie-cases [data-case="'+(p.selection.length-1)+'"]');
  if(slot)slot.textContent=p.tuiles[index];
  if(p.selection.length!==p.tuiles.length)return;
  p.verrou=true;
  const candidat=p.selection.map(i=>p.tuiles[i]).join('');
  const correct=candidat.toLocaleLowerCase('lb')===p.mot.mot.toLocaleLowerCase('lb');
  const info=document.getElementById('survie-info');
  if(correct) {
    p.total++;
    p.serie++;
    if(p.gelRecharge>0)p.gelRecharge--; // recharge en mots corrects, y compris pendant gel
    p.maxSerie=Math.max(p.maxSerie,p.serie);
    const avant=p.restant;
    p.restant=Math.min(SURVIE_MAX,p.restant+SURVIE_BONUS);
    p.gainTexte=survieGainLabel(p.restant-avant);
    survieEnregistrer(p.maxSerie);
    const record=document.getElementById('survie-record-chiffre');
    if(record)record.textContent=survieRecord();
    if(info){info.className='survie-ok';info.textContent='Juste ! · '+p.gainTexte;}
  } else {
    surviePenaliser(p);
    if(info){info.className='survie-ko';info.textContent='Pas encore · −3 secondes';}
  }
  survieHud();
  if(correct)survieCelebrate(p);
  const courant=p;
  setTimeout(()=>{
    if(surviePartie!==courant||!p.actif)return;
    if(p.restant<=0){survieTerminer();return;}
    if(correct)survieNouvelleQuestion();
    else {
      p.selection=[];
      p.verrou=false;
      document.querySelectorAll('#survie-cases .survie-case').forEach(s=>s.textContent='');
      document.querySelectorAll('#survie-tuiles .survie-tuile').forEach(b=>b.disabled=false);
      if(info){info.className='';info.textContent='Réessaie, la série repart à zéro';}
    }
  },correct?280:520);
}
function survieEffacer() {
  const p=surviePartie;
  if(!p || !p.actif || p.verrou || !p.selection.length)return;
  const slot=document.querySelector('#survie-cases [data-case="'+(p.selection.length-1)+'"]');
  if(slot)slot.textContent='';
  const idx=p.selection.pop();
  const button=document.querySelector('#survie-tuiles [data-index="'+idx+'"]');
  if(button)button.disabled=false;
}
function survieTick() {
  const p=surviePartie;
  if(!p||!p.actif)return;
  const view=document.getElementById('view-survie');
  if(!view || !view.classList.contains('active')){survieArreter();return;}
  if(document.visibilityState==='hidden'){p.dernier=null;return;}
  const maintenant=performance.now();
  if(p.dernier!==null){
    const duree=Math.max(0,(maintenant-p.dernier)/1000);
    const gelee=Math.min(duree,p.gelRestant);
    p.gelRestant=Math.max(0,p.gelRestant-gelee);
    p.restant=Math.max(0,p.restant-(duree-gelee));
  }
  p.dernier=maintenant;
  survieHud();
  const progress=document.querySelector('.survie-piste');
  const remaining=Math.ceil(p.restant);
  if(progress && p.accessibleSec!==remaining){
    progress.setAttribute('aria-valuenow',String(remaining));
    p.accessibleSec=remaining;
  }
  if(p.restant<=0)survieTerminer();
}
function demarrerSurvie() {
  const pool=surviePool();
  if(pool.length<4){renderJeuxHub();return;}
  survieArreter();
  surviePartie={pool,vus:new Set(),precedent:null,tuiles:[],selection:[],serie:0,maxSerie:0,total:0,
    restant:SURVIE_DUREE,dernier:null,actif:true,verrou:false,timer:null,mot:null,ecranPret:false,gainTexte:'',
    gelRestant:0,gelRecharge:0,hudTier:null,hudChaleur:null,hudGele:null,gelAria:null};
  survieNouvelleQuestion();
  showView('view-survie');
  surviePartie.dernier=performance.now();
  surviePartie.timer=setInterval(survieTick,100);
}
function survieArreter() {
  if(!surviePartie)return;
  surviePartie.actif=false;
  if(surviePartie.timer)clearInterval(surviePartie.timer);
  surviePartie.timer=null;
  surviePartie.gelRestant=0;
}
function quitterSurvie() {
  survieArreter();
  retour();
}
function survieTerminer() {
  const p=surviePartie;
  if(!p||!p.actif)return;
  survieArreter();
  const box=document.getElementById('survie-jeu');
  if(!box)return;
  const record=survieRecord();
  box.innerHTML='<div class="survie-fin">'+
    '<span class="jeux-kicker">FIN DE PARTIE</span><h1>Bien joué<span> !</span></h1>'+
    '<div class="survie-fin-score">'+p.maxSerie+'</div>'+
    '<p>Meilleure série de cette partie</p><p>'+p.total+' mots reconstruits · Record : '+record+'</p>'+
    '<button type="button" class="jeux-jouer" onclick="demarrerSurvie()">Rejouer →</button>'+
    '<button type="button" class="survie-fin-retour" onclick="quitterSurvie()">Retour aux Jeux</button></div>';
}
