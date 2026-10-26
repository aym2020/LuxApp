/* SPEC 88 — Jeux / Survie. Nouveau moteur indépendant des leçons et examens.
   SPEC 92 étape 1 : événements envoyés au gestionnaire d'effets survie-vfx.js. */
'use strict';
let surviePartie = null;
const SURVIE_DUREE = 30;
const SURVIE_BONUS = 3;
const SURVIE_PENALITE = 3;
const SURVIE_MAX = 30;
const SURVIE_MIN_MOTS = 4;
const SURVIE_FIN_DUREE = 2200; // 0–250 ms extinction puis ~1,5 s pour lire TEMPS ÉCOULÉ

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
      // Survie ne teste pas les majuscules : I et l se ressemblent sur mobile.
      // Ignorer seulement la ponctuation finale : Moien! -> moien, Äddi! -> äddi.
      // Les phrases et signes internes restent interdits ; les flashcards sont inchangées.
      const mot=c.lu.normalize('NFC').trim().replace(/[.!?]+$/u,'').trim().toLocaleLowerCase('lb').normalize('NFC');
      const fr=c.fr.trim().replace(/[.!?]+$/,'').trim();
      const lettres=survieLettres(mot);
      // Mots isolés uniquement : pas de phrases, d'articles à reconstruire,
      // de flexions inconnues ou de caractères impossibles à saisir sur les tuiles.
      if(lettres.length<3 || lettres.length>12 ||
         !/^\p{L}+$/u.test(mot) ||
         !/^[\p{L}]+(?:[ '-][\p{L}]+){0,2}$/u.test(fr)) continue;
      const k=mot; // déjà normalisé en minuscules
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
  if(typeof runnerArreter==='function')runnerArreter(); // SPEC 96
  renderJeuxHub();
  showView('view-jeux');
}
function renderJeuxHub() {
  const box=document.getElementById('jeux-hub');
  if(!box)return;
  const nombre=surviePool().length,record=survieRecord();
  const verrouille=nombre<SURVIE_MIN_MOTS;
  const manquants=Math.max(0,SURVIE_MIN_MOTS-nombre);
  const explication=nombre===0
    ? 'Commence une leçon pour débloquer tes premiers mots. Il en faut 4 pour jouer.'
    : 'Encore '+manquants+' mot'+(manquants>1?'s':'')+' pour jouer. Ouvre une autre leçon pour compléter ta réserve.';
  box.innerHTML=
    '<button class="jeux-retour" type="button" onclick="retour()">← Accueil</button>'+
    '<header class="jeux-entete"><span class="jeux-kicker">LUXAPP · MINI-JEUX</span>'+
      '<h1>Jeux<span>.</span></h1>'+
      '<p>Révise autrement, avec les mots que tu as déjà rencontrés.</p></header>'+
    '<section class="jeux-carte'+(verrouille?' jeux-carte-verrouillee':'')+'" aria-labelledby="jeux-survie-titre">'+
      '<div class="jeux-lettres" aria-hidden="true"><span>S</span><span>U</span><span>R</span></div>'+
      '<div class="jeux-carte-titre"><h2 id="jeux-survie-titre">Survie</h2>'+
        (verrouille?'<span class="jeux-etat">À DÉBLOQUER</span>':'')+'</div>'+
      '<p>Recompose les mots avant la fin du chrono. Jusqu’où iras-tu ?</p>'+
      '<div class="jeux-meta"><span><strong>'+nombre+'</strong> mot'+(nombre===1?'':'s')+' disponible'+(nombre===1?'':'s')+'</span><span>Record <b>'+record+'</b></span></div>'+
      (verrouille?
        '<div class="jeux-deblocage" role="group" aria-label="Déblocage de Survie">'+
          '<div class="jeux-deblocage-texte"><strong>'+nombre+' / '+SURVIE_MIN_MOTS+' mots</strong>'+
            '<span>'+manquants+' restant'+(manquants>1?'s':'')+'</span></div>'+
          '<div class="jeux-deblocage-barre" role="progressbar" aria-label="Mots disponibles pour jouer" aria-valuemin="0" aria-valuemax="'+SURVIE_MIN_MOTS+'" aria-valuenow="'+nombre+'">'+
            '<i style="width:'+(100*nombre/SURVIE_MIN_MOTS)+'%"></i></div></div>'+
        '<p class="jeux-verrou">'+explication+'</p>'+
        '<button class="jeux-jouer" type="button" onclick="goLessons()">'+(nombre===0?'Commencer une leçon':'Voir mes leçons')+' <span aria-hidden="true">→</span></button>':
        '<button class="jeux-jouer" type="button" onclick="demarrerSurvie()">Jouer <span aria-hidden="true">→</span></button>')+
    '</section>'+
    (typeof runnerCarteHub==='function'?runnerCarteHub():''); // SPEC 96 : Lux Runner
}
function survieChoisirMot(partie) {
  // On ne remet jamais la réserve à zéro au cours d'une partie.
  // 'vus' ne contient que les mots correctement reconstruits ou passés.
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
  if(partie.vus.size>=partie.pool.length){survieTerminerReserve();return;}
  partie.mot=survieChoisirMot(partie);
  partie.precedent=partie.mot.mot;
  partie.tuiles=survieMelanger(survieLettres(partie.mot.mot));
  partie.selection=[];
  partie.verrou=false;
  survieRendre();
}
function partieMotsParcourus(p) { return p.vus.size; }
function survieHud() {
  const p=surviePartie;
  if(!p)return;
  const timer=document.getElementById('survie-secondes');
  const jauge=document.getElementById('survie-jauge');
  const serie=document.getElementById('survie-serie');
  const vus=document.getElementById('survie-vus');
  if(vus)vus.textContent=partieMotsParcourus(p)+' / '+p.pool.length;
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
    '<div class="survie-record"><span id="survie-vus">0 / '+p.pool.length+'</span> mots parcourus · Record personnel : <span id="survie-record-chiffre">'+survieRecord()+'</span> mots</div>'+
    '<div class="survie-fin-rideau" role="status" aria-live="polite">'+
      '<div class="survie-fin-rideau-contenu"><span class="survie-fin-symbol" aria-hidden="true">✦</span>'+
        '<strong>TEMPS ÉCOULÉ</strong><span>La série est terminée</span></div>'+
      '<button class="survie-fin-passer" type="button" onclick="survieFinPasser()">Passer l’animation →</button></div>';
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
  p.passes++;
  p.vus.add(p.mot.mot.toLocaleLowerCase('lb'));
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
    p.vus.add(p.mot.mot.toLocaleLowerCase('lb'));
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
    p.erreurs++;
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
  if(pool.length<SURVIE_MIN_MOTS){renderJeuxHub();return;}
  survieArreter();
  surviePartie={pool,vus:new Set(),passes:0,erreurs:0,precedent:null,tuiles:[],selection:[],serie:0,maxSerie:0,total:0,
    restant:SURVIE_DUREE,dernier:null,actif:true,verrou:false,timer:null,mot:null,ecranPret:false,gainTexte:'',
    recordDepart:survieRecord(),finTimer:null,finEnCours:false,resultatsVisibles:false,scoreRaf:null};
  survieNouvelleQuestion();
  showView('view-survie');
  const p=surviePartie;
  // SPEC 101 : « 3, 2, 1, Partez ! » ; lettres bloquées et chrono arrêté jusqu'au départ.
  const box=document.getElementById('survie-jeu');
  if(typeof jeuDecompte==='function' && box){
    p.verrou=true;
    p.annulerDecompte=jeuDecompte({
      conteneur:box, theme:'survie',
      son:typeof SurvieFx==='undefined' || SurvieFx.sonActif(),
      estActif:()=>{
        const vue=document.getElementById('view-survie');
        return surviePartie===p && p.actif && !!vue && vue.classList.contains('active');
      }
    },()=>{
      if(surviePartie!==p || !p.actif)return;
      p.verrou=false;
      p.dernier=performance.now();
      p.timer=setInterval(survieTick,100);
    });
    return;
  }
  p.dernier=performance.now();
  p.timer=setInterval(survieTick,100);
}
function survieArreter() {
  if(!surviePartie)return;
  surviePartie.actif=false;
  const p=surviePartie;
  if(p.annulerDecompte){p.annulerDecompte();p.annulerDecompte=null;}
  if(p.timer)clearInterval(p.timer);
  p.timer=null;
  if(p.finTimer!==null && typeof clearTimeout==='function')clearTimeout(p.finTimer);
  p.finTimer=null;
  p.finEnCours=false;
  p.resultatsVisibles=false;
  if(p.scoreRaf!==null && typeof window!=='undefined' && window.cancelAnimationFrame)
    window.cancelAnimationFrame(p.scoreRaf);
  p.scoreRaf=null;
  survieFx('arreter');
}
function quitterSurvie() {
  survieArreter();
  retour();
}
// Réserve épuisée : fin distincte du chrono, sans répétition ni changement des scores.
function survieTerminerReserve() {
  const p=surviePartie;
  if(!p||!p.actif||p.finEnCours||p.vus.size<p.pool.length)return;
  p.raisonFin='reserve';
  p.actif=false;
  p.verrou=true;
  p.finEnCours=true;
  if(p.timer)clearInterval(p.timer);
  p.timer=null;
  p.dernier=null;
  survieAfficherResultat(p,true);
}
// Une seule fin, avec scores figés dès l'instant où le temps atteint zéro.
// Le HUD et son Canvas persistent pendant le rideau ; aucun mot ne repart.
function survieTerminer() {
  const p=surviePartie;
  if(!p||!p.actif||p.finEnCours)return;
  p.raisonFin='temps';
  p.restant=0;
  p.actif=false;
  p.verrou=true;
  p.finEnCours=true;
  if(p.timer)clearInterval(p.timer);
  p.timer=null;
  p.dernier=null;
  const box=document.getElementById('survie-jeu');
  if(!box){survieArreter();return;}
  survieHud(); // chrono et jauge à zéro AVANT l'extinction
  survieFx('fin');
  box.className='survie-jeu survie-jeu-fin';
  const reduit=typeof window!=='undefined' && typeof window.matchMedia==='function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduit){survieAfficherResultat(p);return;}
  p.finTimer=setTimeout(()=>survieAfficherResultat(p),SURVIE_FIN_DUREE);
}
// Fin anticipée à la demande de l'utilisateur, sans toucher aux statistiques.
function survieFinPasser() {
  const p=surviePartie;
  if(p && p.finEnCours)survieAfficherResultat(p,true);
}
// Résultat LuxApp 2.1 : trois états, un seul rendu conforme à la maquette validée.
function survieAfficherResultat(p,sansAnimation=false) {
  if(surviePartie!==p||!p.finEnCours)return;
  p.finEnCours=false;
  p.resultatsVisibles=true;
  if(p.finTimer!==null&&typeof clearTimeout==='function')clearTimeout(p.finTimer);
  p.finTimer=null;
  survieFx('arreter');
  const box=document.getElementById('survie-jeu');
  if(!box)return;
  const record=survieRecord(),nouveau=p.maxSerie>p.recordDepart;
  const n=p.pool.length,correct=p.total,passes=p.passes||0,erreurs=p.erreurs||0;
  const reserve=p.raisonFin==='reserve';
  const parfait=reserve&&correct===n&&passes===0&&erreurs===0;
  const restants=Math.max(0,n-p.vus.size);
  const statut=parfait?'SANS-FAUTE':reserve?'RÉSERVE TERMINÉE':'TEMPS ÉCOULÉ';
  const titre=parfait?'Tous tes mots réussis':reserve?'Tu as fait le tour':'Le temps est écoulé';
  const intro=parfait?'Tu as réussi toute ta réserve. Bien joué !':
    reserve?'Tous les mots ont été parcourus. Certains restent à réussir.':
    'Le chrono a terminé la partie avant toi.';
  const detail=parfait?'Aucun mot passé':reserve?
    ([passes?passes+' mot'+(passes>1?'s':'')+' passé'+(passes>1?'s':''):null,
      erreurs?erreurs+' erreur'+(erreurs>1?'s':'')+' avant correction':null]
      .filter(Boolean).join(' · ')||'Tous les mots reconstruits'):
    restants+' mot'+(restants>1?'s':'')+' non parcouru'+(restants>1?'s':'');
  const conseil=parfait?'Pour battre ton record, découvre de nouveaux mots dans les prochaines leçons.':
    reserve?'Rejoue pour réussir les mots passés et améliorer ta série.':
    'Essaie à nouveau de parcourir davantage de mots avant la fin du chrono.';
  const action=parfait?'Continuer mon chemin':'Rejouer Survie';
  const secondaire=reserve&&!parfait?'Continuer mon chemin':'Retour aux Jeux';
  const func1=parfait?'goLessons()':'demarrerSurvie()';
  const func2=reserve&&!parfait?'goLessons()':'quitterSurvie()';
  const fraction=n?Math.max(0,Math.min(1,correct/n)):0;
  const cercle=(383.3*(1-fraction)).toFixed(2);
  const icone=parfait?'<path d="m11 24 9 9 18-19"/>':
    reserve?'<path d="M24 12c-7-4-13-4-19-2v27c7-2 13-2 19 2 6-4 12-4 19-2V10c-6-2-12-2-19 2Zm0 0v27"/>':
    '<circle cx="24" cy="24" r="17"/><path d="M24 14v11l8 5"/>';
  const fleche='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h16m-7-7 7 7-7 7"/></svg>';
  const retour='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m14 5-7 7 7 7M7 12h13"/></svg>';
  box.className='survie-jeu survie-jeu-resultats '+(parfait?'survie-resultat-parfait':reserve?'survie-resultat-partiel':'survie-resultat-temps');
  box.innerHTML='<div class="survie-resultat-entete">'+
    '<button type="button" class="survie-resultat-retour" onclick="quitterSurvie()">'+retour+' Jeux</button><span>MODE SURVIE</span></div>'+
    '<div class="survie-resultat-scroll" tabindex="0" aria-label="Détails du résultat">'+
    '<main class="survie-fin">'+
      '<div class="survie-fin-embleme" aria-hidden="true"><svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.7" stroke-linecap="round" stroke-linejoin="round">'+icone+'</svg></div>'+
      '<span class="survie-fin-etat">'+statut+'</span>'+
      '<h1>'+titre+'<span>.</span></h1>'+
      '<p class="survie-fin-intro">'+intro+'</p>'+
      '<div class="survie-fin-score-zone"><div class="survie-fin-anneau" role="img" aria-label="'+correct+' mots réussis sur '+n+'">'+
        '<svg viewBox="0 0 150 150" aria-hidden="true"><circle cx="75" cy="75" r="61" class="survie-fin-cercle-fond"/>'+
        '<circle cx="75" cy="75" r="61" class="survie-fin-cercle-progres" style="stroke-dasharray:383.3;stroke-dashoffset:'+cercle+'"/></svg>'+
        '<div class="survie-fin-anneau-chiffre"><strong id="survie-fin-score"'+(String(correct).length>3?' class="survie-score-long"':'')+'>'+correct+'</strong><span>SUR '+n+'</span></div></div>'+
        '<span class="survie-fin-score-libelle">MOTS RÉUSSIS</span><p class="survie-fin-bilan">'+detail+'</p></div>'+
      (nouveau?'<p class="survie-fin-record"><span aria-hidden="true">✦</span> Nouveau record !</p>':'')+
      '<div class="survie-fin-stats"><div><span>Meilleure série</span><strong>'+p.maxSerie+'</strong></div>'+
        '<div><span>Record personnel</span><strong>'+record+'</strong></div></div>'+
      '<p class="survie-fin-suite">'+conseil+'</p>'+
    '</main></div>'+
    '<div class="survie-resultat-actions"><button type="button" class="jeux-jouer" onclick="'+func1+'">'+action+' '+fleche+'</button>'+
      '<button type="button" class="survie-fin-retour" onclick="'+func2+'">'+secondaire+'</button></div>';
}

// Sur ordinateur, Entrée active l'action principale du hub ou du résultat.
// Pendant une question, la réponse est déjà vérifiée dès la dernière tuile.
// Ne pas détourner Entrée des boutons et champs natifs (ni du clavier Android).
function survieRaccourciEntree(e) {
  if(e.key!=='Enter'||e.repeat||e.isComposing||e.altKey||e.ctrlKey||e.metaKey||e.shiftKey)return;
  const cible=e.target;
  if(cible && (cible.isContentEditable ||
      (typeof cible.closest==='function' &&
       cible.closest('button, a, input, textarea, select, [role="button"], [contenteditable="true"]'))))return;
  const hub=document.getElementById('view-jeux');
  const jeu=document.getElementById('view-survie');
  let action=null;
  if(hub && hub.classList.contains('active')){
    action=document.querySelector('#jeux-hub .jeux-jouer');
  } else if(jeu && jeu.classList.contains('active')){
    const p=surviePartie;
    if(p && p.finEnCours){
      e.preventDefault();
      e.stopPropagation();
      survieFinPasser();
      return;
    }
    if(p && p.resultatsVisibles)action=document.querySelector('#survie-jeu .jeux-jouer');
  }
  if(!action)return;
  e.preventDefault();
  e.stopPropagation();
  action.click();
}
if(typeof document!=='undefined' && typeof document.addEventListener==='function')
  document.addEventListener('keydown',survieRaccourciEntree,true);
