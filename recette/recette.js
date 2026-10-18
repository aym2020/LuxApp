// ─── OUTILS DE TEST : RECETTE VISUELLE (spec 43) ───────────────────────────
// Chargé UNIQUEMENT par une instance lancée avec RECETTE=1 (server.js) :
// cette instance a sa propre origine (stockage local séparé de l'app réelle),
// un mot de passe serveur et aucun accès à Firebase.
//
// Principe : on vide la progression fictive, puis on joue la leçon avec les
// VRAIES fonctions de l'app (mêmes clics qu'un utilisateur, en accéléré) pour
// arriver sur le vrai écran de résultat. Aucun écran n'est recopié ou maquetté.

const REC_CHOIX = 'recette:choix'; // dernier choix du panneau (gardé au nettoyage)

// Les écrans proposés, et leurs scénarios.
// erreurs : numéros (à partir de 0) des réponses ratées une fois, puis justes.
const REC_ECRANS = {
  mission: {
    titre: 'Fin de mission',
    besoin: l => !!(l.mission && l.scene),
    scenarios: {
      'sans-faute': { titre: 'Sans faute (3 vies)', erreurs: [] },
      'une-vie': { titre: 'Réussie avec 2 erreurs (1 vie)', erreurs: [1, 4] },
      'perdue': { titre: 'Perdue (0 vie)', erreurs: [0, 1, 2] },
      'tente-ok': { titre: 'Tente ta chance · réussie', erreurs: [], tentative: true },
      'tente-ko': { titre: 'Tente ta chance · perdue', erreurs: [0, 1, 2], tentative: true },
      'derniere': { titre: 'Juste avant la dernière réponse', erreurs: [], arret: true }
    }
  },
  etape: {
    titre: 'Fin d\'étape (écriture, unité 1)',
    besoin: l => isParcoursLecon(l),
    scenarios: {
      'sans-faute': { titre: 'Sans faute', erreurs: [] },
      'deuxieme-essai': { titre: '1re réponse juste au 2e essai', deuxiemeEssai: true, erreurs: [] }
    }
  },
  unite: {
    titre: 'Fin d\'unité (unité 1)',
    besoin: l => isParcoursLecon(l),
    scenarios: {
      'sans-faute': { titre: 'Sans faute', erreurs: [] },
      'erreurs': { titre: 'Avec 3 erreurs (« Refaire mes erreurs »)', erreurs: [0, 1, 2] }
    }
  },
  rattrapage: {
    titre: 'Rattrapage des erreurs → Chemin',
    besoin: l => isParcoursLecon(l),
    scenarios: {
      'termine': { titre: 'Erreurs refaites, résultat du rattrapage', erreurs: [0] }
    }
  }
};

function recLireChoix() {
  try { return JSON.parse(localStorage.getItem(REC_CHOIX)) || {}; } catch (e) { return {}; }
}

function recEcrireChoix(choix) {
  try { localStorage.setItem(REC_CHOIX, JSON.stringify(choix)); } catch (e) { /* stockage indisponible */ }
}

// ─── PANNEAU « OUTILS DE TEST » ─────────────────────────────────────────────
function ouvrirRecette() {
  const choix = recLireChoix();
  const liste = lecons.filter(l => isParcoursLecon(l));
  const leconId = liste.some(l => l.id === choix.lecon) ? choix.lecon : (liste[0] && liste[0].id);
  const options = liste.map(l => '<option value="' + l.id + '"' + (l.id === leconId ? ' selected' : '') + '>' +
    (l.niveau || 'A1.1') + ' · Leçon ' + numLecon(l) + ' · ' + escHtml(l.titre_fr) + '</option>').join('');
  ouvrirPanneau('<div class="poignee"></div>' +
    '<div class="recette-panneau">' +
      '<h2>Outils de test</h2>' +
      '<p class="recette-avertissement">MODE TEST — progression fictive. Rien n\'est enregistré dans ton compte ni dans le cloud.</p>' +
      (recScenarioActif ? '<p class="recette-actif">En cours : Leçon ' + numLecon(recScenarioActif.lecon) + ' · ' +
        escHtml(REC_ECRANS[recScenarioActif.ecran].titre) + ' · ' + escHtml(recScenarioActif.titre) + '</p>' : '') +
      '<label>Leçon<select id="rec-lecon" onchange="recMajEcrans()">' + options + '</select></label>' +
      '<label>Écran à tester<select id="rec-ecran" onchange="recMajScenarios()"></select></label>' +
      '<p class="recette-note hidden" id="rec-indispo"></p>' +
      '<label>Scénario<select id="rec-scenario"></select></label>' +
      '<button class="pc-btn primary wide big" id="rec-voir" onclick="recVoir()">Voir cet écran →</button>' +
      '<button class="pc-btn ghost wide" onclick="recQuitter()">Quitter le test</button>' +
      '<p class="recette-note" id="rec-duree"></p>' +
    '</div>', 'Outils de test');
  recMajEcrans(choix.ecran, choix.scenario);
}

function recLeconChoisie() {
  return lecons.find(l => l.id === Number(document.getElementById('rec-lecon').value));
}

function recMajEcrans(ecran, scenario) {
  const l = recLeconChoisie();
  const select = document.getElementById('rec-ecran');
  select.innerHTML = Object.keys(REC_ECRANS).map(cle => {
    const ok = REC_ECRANS[cle].besoin(l);
    return '<option value="' + cle + '"' + (ok ? '' : ' disabled') + (cle === ecran && ok ? ' selected' : '') + '>' +
      REC_ECRANS[cle].titre + (ok ? '' : ' (pas de mission)') + '</option>';
  }).join('');
  if (select.selectedOptions[0] && select.selectedOptions[0].disabled) {
    const premier = Array.from(select.options).find(o => !o.disabled);
    if (premier) select.value = premier.value;
  }
  recMajScenarios(scenario);
}

function recMajScenarios(scenario) {
  const ecran = REC_ECRANS[document.getElementById('rec-ecran').value];
  const select = document.getElementById('rec-scenario');
  select.innerHTML = Object.keys(ecran.scenarios).map(cle =>
    '<option value="' + cle + '"' + (cle === scenario ? ' selected' : '') + '>' + ecran.scenarios[cle].titre + '</option>').join('');
}

// ─── LANCER UN SCÉNARIO ─────────────────────────────────────────────────────
async function recVoir() {
  const l = recLeconChoisie();
  const ecran = document.getElementById('rec-ecran').value;
  const scenario = document.getElementById('rec-scenario').value;
  const choix = { lecon: l.id, ecran, scenario };
  recEcrireChoix(choix);
  fermerPanneau();
  recDerniereDuree = null;
  const debut = Date.now();
  await recLancer(choix);
  recDerniereDuree = Date.now() - debut;
  recMajBadge();
}

let recDerniereDuree = null;
let recScenarioActif = null;

// Lancement par le code (utilisé aussi par les tests automatiques).
async function recLancer(choix) {
  const l = lecons.find(x => x.id === choix.lecon);
  const def = REC_ECRANS[choix.ecran].scenarios[choix.scenario];
  recScenarioActif = { lecon: l, ecran: choix.ecran, titre: def.titre };
  await recRepartirDeZero(l);
  if (choix.ecran === 'mission') await recJouerMission(l, def);
  else if (choix.ecran === 'etape') await recJouerEtape(l, def);
  else if (choix.ecran === 'unite') await recJouerUnite(l, def);
  else if (choix.ecran === 'rattrapage') await recJouerRattrapage(l, def);
}

// Progression fictive vierge, sauf le choix du panneau. Les règles des vies et
// les introductions de mission sont marquées vues pour aller droit au but.
async function recRepartirDeZero(l) {
  const choix = recLireChoix();
  try { localStorage.clear(); } catch (e) { /* stockage indisponible */ }
  recEcrireChoix(choix);
  run = null;
  pResultat = null;
  dernierFini = null;
  cheminLeconOuverte = undefined;
  pileNav = [];
  const p = getProgress();
  p.guide = { viesMasquees: 1 };
  saveProgress(p);
  choisirNiveau(l.niveau || 'A1.1');
  lecons.forEach(x => marquerIntroMissionVue(x.id));
  goDashboard();
  await recPause();
  goLessons();
  await recPause();
}

// Laisse l'app finir l'appui en cours (historique, rendu) avant le suivant.
function recPause(ms) {
  return new Promise(r => setTimeout(r, ms || 0));
}

async function recAttendre(trouver, maxMs) {
  const fin = Date.now() + (maxMs || 2000);
  while (Date.now() < fin) {
    const x = trouver();
    if (x) return x;
    await recPause(10);
  }
  return null;
}

function recCliquer(id) {
  const b = document.getElementById(id);
  if (b) b.click();
  return !!b;
}

// ─── MISSION ────────────────────────────────────────────────────────────────
async function recJouerMission(l, def) {
  openParcoursLecon(l);
  await recPause();
  openMission(!!def.tentative);
  const nbToi = l.scene.filter(x => x.qui === 'toi').length;
  let reponse = 0;
  while (reponse < nbToi) {
    const input = await recAttendre(() => document.getElementById('ms-input'));
    if (!input) return;
    if (def.arret && reponse === nbToi - 1) return; // on s'arrête sur la dernière réplique à écrire
    const ligne = pLecon.scene[ms.idx];
    if (def.erreurs.includes(reponse)) {
      recSaisirMission('Ech weess et net'); // une vraie erreur : une vie de moins
    }
    recSaisirMission(ligne.lu);
    await recAttendre(() => document.getElementById('ms-continuer'));
    recCliquer('ms-continuer');
    reponse++;
    await recPause();
  }
}

function recSaisirMission(texte) {
  const input = document.getElementById('ms-input');
  if (!input) return;
  input.value = texte;
  missionValider();
}

// ─── PARCOURS (mot caché, quiz, trous, écriture) ────────────────────────────
function recItemCourant() {
  const s = run.steps[run.stepIdx];
  return { type: s.type, item: trouverItem(pLecon, s.type, s.queue[0]) };
}

function recContinuerSiBesoin() {
  if (pAttente && pSuite !== null) recCliquer('pc-continuer');
}

// Répond à l'item affiché : juste, ou faux une fois (quiz, trous, écriture).
function recRepondre(juste) {
  const { type, item } = recItemCourant();
  if (type === 'flashcards') {
    recCliquer('mc-btn-reconstruire');
    const input = document.getElementById('mc-input');
    input.value = motATaper(pLecon, item);
    input.dispatchEvent(new Event('input'));
    mcValider();
    recContinuerSiBesoin();
  } else if (type === 'quiz' || type === 'trous') {
    const bonne = type === 'quiz' ? item.reponse : item.trou;
    const bouton = Array.from(document.querySelectorAll('#pc-choix .choice'))
      .find(b => (b.textContent === bonne) === juste);
    if (bouton) bouton.click();
    if (juste && pAttente && pSuite === null) { clearTimeout(pTimer); reussir(); } // sans le délai d'affichage
    else recContinuerSiBesoin();
  } else {
    recEcrire(juste ? item.lu : 'zzz faux');
    if (!juste) recEcrire('zzz encore faux'); // 2e essai faux : la correction s'affiche
    recContinuerSiBesoin();
  }
}

function recEcrire(texte) {
  const input = document.getElementById('pc-ecr-input');
  if (!input) return;
  input.value = texte;
  ecrValiderPc();
}

// Joue la partie affichée jusqu'au résultat. erreurs : numéros (à partir de 0)
// des quiz / trous / écritures ratés une fois.
async function recFinirPartie(erreurs, deuxiemeEssai) {
  let n = 0, choix = 0;
  while (document.getElementById('view-parcours').classList.contains('active') && n < 500) {
    n++;
    const { type, item } = recItemCourant();
    if (deuxiemeEssai && n === 1 && type === 'ecriture') {
      recEcrire('zzz faux');
      recEcrire(item.lu); // « Juste, au 2e essai » : la phrase reviendra
      recContinuerSiBesoin();
      continue;
    }
    const compte = type !== 'flashcards';
    const rater = compte && erreurs.includes(choix);
    if (compte) choix++;
    recRepondre(!rater);
    if (n % 20 === 0) await recPause();
  }
  await recPause();
}

async function recJouerEtape(l, def) {
  openParcoursLecon(l);
  await recPause();
  startEtapeSeule(unitesCoeur(l)[0].id, 'ecriture');
  await recFinirPartie(def.erreurs, def.deuxiemeEssai);
}

async function recJouerUnite(l, def) {
  ouvrirUniteDepuisChemin(l.id, unitesCoeur(l)[0].id);
  await recPause();
  recCliquer('pi-commencer');
  await recFinirPartie(def.erreurs);
}

async function recJouerRattrapage(l, def) {
  await recJouerUnite(l, def);
  if (!pResultat || !pResultat.erreurs.length) return;
  refaireErreurs();
  await recFinirPartie([]);
}

// ─── SORTIE ─────────────────────────────────────────────────────────────────
function recQuitter() {
  fermerPanneau();
  const choix = recLireChoix();
  try { localStorage.clear(); } catch (e) { /* stockage indisponible */ }
  recEcrireChoix(choix);
  run = null;
  pResultat = null;
  pileNav = [];
  recScenarioActif = null;
  recDerniereDuree = null;
  goDashboard();
  recMajBadge();
}

// ─── BADGE « MODE TEST » (toujours visible, sans masquer les boutons) ───────
function recMajBadge() {
  let badge = document.getElementById('recette-badge');
  if (!badge) {
    badge = document.createElement('button');
    badge.id = 'recette-badge';
    badge.className = 'recette-badge';
    badge.onclick = ouvrirRecette;
    document.body.appendChild(badge);
  }
  badge.textContent = 'MODE TEST';
  badge.setAttribute('aria-label', 'Mode test, progression fictive : ouvrir les outils de test');
  const d = document.getElementById('rec-duree');
  if (d && recDerniereDuree != null) d.textContent = 'Dernier scénario prêt en ' + (recDerniereDuree / 1000).toFixed(1) + ' s.';
}

// « Plus » : une ligne de plus, « Outils de test ».
const recOuvrirPlusApp = ouvrirPlus;
ouvrirPlus = function () {
  recOuvrirPlusApp();
  const panneau = document.getElementById('panneau');
  if (!panneau) return;
  const ligne = document.createElement('button');
  ligne.className = 'plus-ligne recette-ligne';
  ligne.onclick = () => { fermerPanneau(); ouvrirRecette(); };
  ligne.innerHTML = ICONES.reglages + '<span><b>Outils de test</b><small>Voir une fin de mission ou un résultat en quelques secondes</small></span>';
  panneau.appendChild(ligne);
};

document.title = 'TEST · ' + document.title;
document.body.classList.add('mode-recette');
recMajBadge();
