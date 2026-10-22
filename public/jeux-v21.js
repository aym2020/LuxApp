/* SPEC 88 — Jeux / Survie. Nouveau moteur indépendant des leçons et examens.
   SPEC 92 étape 1 : événements envoyés au gestionnaire d'effets survie-vfx.js. */
'use strict';
let surviePartie = null;
const SURVIE_DUREE = 30;
const SURVIE_BONUS = 3;
const SURVIE_PENALITE = 3;
const SURVIE_MAX = 30;
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
// SPEC 92 : les effets visuels et sonores (survie-vfx.js) sont facultatifs.
// Le moteur envoie seulement des événements ; sans ce fichier, rien ne change.
function survieFx(evenement, valeur) {
  if (typeof SurvieFx !== 'undefined' && typeof SurvieFx[evenement] === 'function') {
    return SurvieFx[evenement](valeur);
  }
  return undefined;
}
// Effets d'une pénalité (faute ou Passer) : combo brisé et temps perdu.
function survieMontrerPerte(p, serieAvant) {
  const combo=document.getElementById('survie-combo');
  const cri=document.getElementById('survie-combo-cri');
  const chrono=document.getElementById('survie-chrono');
  const gain=document.getElementById('survie-gain');
  if(serieAvant>=3 && combo){
    if(cri)cri.textContent='COMBO BRISÉ';
    combo.className='survie-combo survie-combo-ko';
  }
  if(gain)gain.textContent='−'+SURVIE_PENALITE+' s';
  if(chrono)chrono.className='survie-hud-time survie-time-ko';
  setTimeout(()=>{
    if(surviePartie!==p || !p.actif)return;
    if(combo && combo.className.includes('survie-combo-ko'))combo.className='survie-combo';
    if(chrono && chrono.className.includes('survie-time-ko'))chrono.className='survie-hud-time';
  },650);
}
// Bouton son : icône haut-parleur, avec ondes (actif) ou barré (coupé).
function survieIconeSon(actif) {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+
    '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/>'+
    (actif?'<path d="M15.5 9a4.2 4.2 0 0 1 0 6"/><path d="M18 6.5a7.8 7.8 0 0 1 0 11"/>':'<path d="M16 9.5l5 5"/><path d="M21 9.5l-5 5"/>')+
    '</svg>';
}
function survieBoutonSon() {
  if (typeof SurvieFx === 'undefined') return '';
  const actif=SurvieFx.sonActif();
  return '<button id="survie-son" class="survie-son" type="button" onclick="survieBasculerSon()" aria-pressed="'+actif+
    '" aria-label="'+(actif?'Couper le son':'Activer le son')+'">'+survieIconeSon(actif)+'</button>';
}
function survieBasculerSon() {
  const actif=survieFx('basculerSon');
  const bouton=document.getElementById('survie-son');
  if(!bouton)return;
  bouton.innerHTML=survieIconeSon(actif);
  bouton.setAttribute('aria-pressed',String(actif));
  bouton.setAttribute('aria-label',actif?'Couper le son':'Activer le son');
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
  const tete=document.getElementById('survie-tete');
  const tier=survieComboPalier(p.serie);
  if(combo && p.hudTier!==tier){
    combo.setAttribute('data-tier',String(tier));
    if(tete)tete.setAttribute('data-tier',String(tier));
    p.hudTier=tier;
  }
  // Moins de 5 secondes : la barre bat et les bords de l'écran pulsent.
  const urgence=p.restant>0 && p.restant<5;
  const box=document.getElementById('survie-jeu');
  if(box && p.hudUrgence!==urgence){
    box.className=urgence?'survie-jeu survie-urgence':'survie-jeu';
    p.hudUrgence=urgence;
  }
  survieFx('etat',{ratio:Math.max(0,Math.min(1,p.restant/SURVIE_MAX)),palier:tier,urgence,secondes:sec});
}
// Le HUD est un élément stable de la partie. Modifier uniquement cette zone
// est essentiel : sinon les keyframes redémarrent après chaque mot (+280ms).
function survieQuestionHtml(p) {
  return '<div class="survie-mot"><span>RECONSTRUIS LE MOT</span><h1>'+jeuEscape(p.mot.fr)+'</h1>'+
      '<p>'+p.mot.longueur+' lettres</p></div>'+
    '<div id="survie-cases" class="survie-cases" style="--pas:'+Math.round(110/p.mot.longueur)+'ms" aria-label="Mot à reconstruire">'+
      survieLettres(p.mot.mot).map((_,i)=>'<span class="survie-case" style="--i:'+i+'" data-case="'+i+'"></span>').join('')+'</div>'+
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
      '<div class="survie-top-droite"><span>MODE SURVIE</span>'+survieBoutonSon()+'</div></div>'+
    '<div id="survie-tete" class="survie-tete" data-tier="'+survieComboPalier(p.serie)+'">'+
    '<div class="survie-hud">'+
      '<div id="survie-combo" class="survie-combo" data-tier="'+survieComboPalier(p.serie)+'">'+
        '<span>SÉRIE</span><div class="survie-combo-valeur">'+
        '<span class="survie-flamme" aria-hidden="true"><svg viewBox="0 0 28 36"><path d="M14 1C16 8 23 10 23 19C23 29 19 34 14 34C6 34 2 28 2 21C2 15 6 10 8 7C9 15 13 15 14 1Z" fill="currentColor"/></svg></span>'+
        '<strong id="survie-serie">'+p.serie+'</strong>'+
        '<span class="survie-etincelles" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></span>'+
        '<span id="survie-combo-cri" class="survie-combo-cri" aria-hidden="true">'+jeuEscape(survieComboMessage(p.serie))+'</span>'+
        '</div></div>'+
      '<div id="survie-chrono" class="survie-hud-time"><span>CHRONO</span>'+
        '<strong id="survie-secondes">'+Math.ceil(p.restant)+' s</strong>'+
        '<span id="survie-gain" class="survie-gain" aria-hidden="true"></span></div></div>'+
    '<div class="survie-piste" role="progressbar" aria-label="Temps restant" aria-valuemin="0" aria-valuemax="30" aria-valuenow="'+Math.ceil(p.restant)+'"><i id="survie-jauge" style="transform:scaleX('+(p.restant/30)+')"></i></div>'+
    '<canvas id="survie-feu" class="survie-feu" aria-hidden="true"></canvas></div>'+
    '<div id="survie-question">'+survieQuestionHtml(p)+'</div>'+
    '<div class="survie-record">Record personnel : <span id="survie-record-chiffre">'+survieRecord()+'</span> mots</div>';
  p.ecranPret=true;
  box.className='survie-jeu';
  p.hudUrgence=false;
  survieFx('attacher',document.getElementById('survie-feu'));
  survieHud();
}

// Même pénalité que sur une réponse fausse, sans altérer score ni record.
function surviePenaliser(p) {
  const serieAvant=p.serie,ratioAvant=p.restant/SURVIE_MAX;
  p.serie=0;
  p.gainTexte='';
  p.restant=Math.max(0,p.restant-SURVIE_PENALITE);
  survieResetEffects();
  survieMontrerPerte(p,serieAvant);
  survieFx('erreur',{ancienRatio:ratioAvant,nouveauRatio:p.restant/SURVIE_MAX,serieAvant});
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
  if(slot){slot.textContent=p.tuiles[index];slot.className='survie-case survie-case-pleine';}
  survieFx('lettre',p.selection.length-1);
  if(p.selection.length!==p.tuiles.length)return;
  p.verrou=true;
  const candidat=p.selection.map(i=>p.tuiles[i]).join('');
  const correct=candidat.toLocaleLowerCase('lb')===p.mot.mot.toLocaleLowerCase('lb');
  const info=document.getElementById('survie-info');
  if(correct) {
    p.total++;
    p.serie++;
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
  // Balayage doré (juste) ou secousse rouge (faux) sur les cases.
  const cases=document.getElementById('survie-cases');
  if(cases)cases.className=correct?'survie-cases survie-cases-ok':'survie-cases survie-cases-ko';
  survieHud();
  if(correct){
    survieCelebrate(p);
    survieFx('reussite',{palier:survieComboPalier(p.serie),
      nouveauPalier:survieComboPalier(p.serie)>survieComboPalier(p.serie-1)});
  }
  const courant=p;
  setTimeout(()=>{
    if(surviePartie!==courant||!p.actif)return;
    if(p.restant<=0){survieTerminer();return;}
    if(correct)survieNouvelleQuestion();
    else {
      p.selection=[];
      p.verrou=false;
      if(cases)cases.className='survie-cases';
      document.querySelectorAll('#survie-cases .survie-case').forEach(s=>{s.textContent='';s.className='survie-case';});
      document.querySelectorAll('#survie-tuiles .survie-tuile').forEach(b=>b.disabled=false);
      if(info){info.className='';info.textContent='Réessaie, la série repart à zéro';}
    }
  },correct?280:520);
}
function survieEffacer() {
  const p=surviePartie;
  if(!p || !p.actif || p.verrou || !p.selection.length)return;
  const slot=document.querySelector('#survie-cases [data-case="'+(p.selection.length-1)+'"]');
  if(slot){slot.textContent='';slot.className='survie-case';}
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
  if(p.dernier!==null)p.restant=Math.max(0,p.restant-(maintenant-p.dernier)/1000);
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
    restant:SURVIE_DUREE,dernier:null,actif:true,verrou:false,timer:null,mot:null,ecranPret:false,gainTexte:''};
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
  survieFx('arreter');
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
  box.className='survie-jeu';
  box.innerHTML='<div class="survie-fin">'+
    '<span class="jeux-kicker">FIN DE PARTIE</span><h1>Bien joué<span> !</span></h1>'+
    '<div class="survie-fin-score">'+p.maxSerie+'</div>'+
    '<p>Meilleure série de cette partie</p><p>'+p.total+' mots reconstruits · Record : '+record+'</p>'+
    '<button type="button" class="jeux-jouer" onclick="demarrerSurvie()">Rejouer →</button>'+
    '<button type="button" class="survie-fin-retour" onclick="quitterSurvie()">Retour aux Jeux</button></div>';
}
