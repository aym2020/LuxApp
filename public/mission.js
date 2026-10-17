// ─── MISSION : LE FIL DE LA LEÇON ───────────────────────────────────────────
// Une leçon v2 peut avoir une mission : une scène de la vie réelle.
//
//   "mission": { "titre": "La fête des voisins",
//                "contexte": "Ta voisine Marie vient se présenter.",
//                "objectif": "Te présenter et dire ta nationalité." },
//   "scene": [ { "qui": "Marie", "lu": "...", "fr": "...", "unite": 1 },
//              { "qui": "toi",   "lu": "...", "fr": "...", "unite": 1, "aide": "..." } ]
//
// Chaque réplique appartient à l'unité qui apprend à la dire.
//   - Sur l'écran de la leçon, la scène se remplit : une réplique apparaît quand
//     son unité est terminée (les autres restent floutées, rien n'est bloqué).
//   - « Jouer la mission » rejoue la scène : l'utilisateur écrit les répliques
//     « toi », les autres s'affichent toutes seules.
//   - Score = répliques justes du premier coup. Meilleur score gardé (acquis).

const ESSAIS_MISSION = 2; // « Voir la réponse » apparaît après 2 essais ratés

let ms = null; // mission en cours : { idx, essais, revele, resultats: [] }

// Une réplique est « apprise » quand l'unité qui l'enseigne est terminée.
// (Toutes les répliques restent lisibles : la scène est le but de la leçon, S4.)
function repliqueApprise(l, ligne) {
  return getUnitBest(l.id, ligne.unite) != null;
}

function nbRepliquesToi(l) {
  return l.scene.filter(x => x.qui === 'toi').length;
}

// Statut de la mission : null (jamais jouée), jouee, reussie (≥ SEUIL_MISSION), sansfaute.
function statutMission(l) {
  const best = getMissionBest(l.id);
  if (best == null) return null;
  if (best === 100) return 'sansfaute';
  if (best >= SEUIL_MISSION) return 'reussie';
  return 'jouee';
}

function etiquetteMission(l) {
  const best = getMissionBest(l.id);
  const statut = statutMission(l);
  if (statut === 'sansfaute') return 'MISSION · SANS FAUTE';
  if (statut === 'reussie') return 'MISSION · RÉUSSIE ' + best + ' %';
  if (statut === 'jouee') return 'MISSION · JOUÉE ' + best + ' % · À REJOUER';
  return 'MISSION';
}

// Une bulle de la scène, avec la pastille de l'unité qui l'enseigne.
function bulleSceneHtml(l, x) {
  const toi = x.qui === 'toi';
  const apprise = repliqueApprise(l, x);
  return '<div class="ms-bulle' + (toi ? ' toi' : '') + '">' +
    '<div class="ms-bulle-tete"><b>' + (toi ? 'Toi' : escHtml(x.qui)) + '</b>' +
      '<span class="ms-pastille' + (apprise ? ' apprise' : '') + '">' + (apprise ? '✓ ' : '') + 'Unité ' + x.unite + '</span></div>' +
    escHtml(x.lu) + '<em>' + escHtml(x.fr) + '</em></div>';
}

// ─── CARTE MISSION (en haut de l'écran de la leçon) ─────────────────────────
// Carte compacte : le titre, l'état et deux actions. Le scénario complet
// s'ouvre à la demande (« Voir le scénario »), pour laisser les unités en vue.
// conseillee = true quand le fil est fini : le bouton passe en jaune (si jamais jouée).
function missionHtml(l, conseillee) {
  if (!l.mission || !l.scene) return '';
  const best = getMissionBest(l.id);
  const apprises = l.scene.filter(x => repliqueApprise(l, x)).length;

  let html = '<div class="ms-carte compacte" id="pl-mission">' +
    '<div class="ms-carte-haut">' +
      '<div class="pc-mini-label pc-gold' + (statutMission(l) === 'jouee' ? ' ms-jouee' : '') + '">' + etiquetteMission(l) + '</div>' +
      '<span class="ms-etat">' + escHtml(etatPreparationMission(l)) + '</span>' +
    '</div>' +
    '<div class="ms-titre">' + escHtml(l.mission.titre) + '</div>' +
    '<div class="ms-bas">Tu sais dire ' + apprises + ' réplique' + (apprises > 1 ? 's' : '') +
      ' sur ' + l.scene.length + '</div>' +
    '<div class="ms-actions">' +
      '<button class="pc-chip" onclick="voirScenario()">Voir le scénario</button>';
  // S10 : tant qu'aucune unité n'est terminée, on propose de tenter sa chance
  // (bouton secondaire : le chemin conseillé reste l'unité 1).
  if (peutTenterSaChance(l)) {
    html += '<button class="pc-chip ms-tenter" onclick="openMission(true)">Tente ta chance · ' + nbRepliquesToi(l) + ' répliques</button>';
  } else {
    html += '<button class="pc-chip ms-jouer' + (conseillee && best == null ? ' conseille' : '') + '" onclick="openMission()">' +
      (best != null ? 'Rejouer la mission' : 'Jouer la mission') + '</button>';
  }
  return html + '</div></div>';
}

// État de la mission, tiré de la progression : à découvrir, en préparation,
// prête à jouer (toutes les unités du fil faites), ou le résultat.
function etatPreparationMission(l) {
  if (getMissionBest(l.id) != null) return missionReussie(l) ? 'Réussie' : 'À rejouer';
  const fil = unitesCoeur(l);
  const faites = fil.filter(u => getUnitBest(l.id, u.id) != null).length;
  if (faites === 0) return 'À découvrir';
  if (faites < fil.length) return 'En préparation';
  return 'Prête à jouer';
}

// « Voir le scénario » : panneau par-dessus l'écran de la leçon. Le fermer
// laisse l'utilisateur exactement où il était.
function voirScenario() {
  const l = pLecon;
  const html = '<div class="poignee"></div>' +
    '<div class="pc-mini-label pc-gold">MISSION · LEÇON ' + l.id + '</div>' +
    '<h2 class="ms-titre">' + escHtml(l.mission.titre) + '</h2>' +
    '<div class="ms-contexte">' + escHtml(l.mission.contexte) + '</div>' +
    '<div class="ms-objectif"><span>À la fin, tu sauras :</span> ' + escHtml(l.mission.objectif) + '</div>' +
    '<div class="pc-mini-label">LA SCÈNE · ' + l.scene.length + ' RÉPLIQUES</div>' +
    '<div class="ms-scene">' + l.scene.map(x => bulleSceneHtml(l, x)).join('') + '</div>' +
    '<div class="ms-panneau-bas">' +
      '<button class="pc-btn primary wide" onclick="fermerPanneau(); openMission(peutTenterSaChance(pLecon))">' +
        (getMissionBest(l.id) != null ? 'Rejouer la mission' : 'Jouer la mission') + '</button>' +
      '<button class="pc-btn ghost wide" onclick="fermerPanneau()">Fermer</button>' +
    '</div>';
  ouvrirPanneau(html, 'Scénario de la mission');
}

// ─── INTRODUCTION DE LA MISSION (1re découverte de la leçon) ────────────────
// Montrée une seule fois, jusqu'à ce que l'utilisateur confirme.
// Un utilisateur qui a déjà commencé la leçon ne la voit pas (migration).
function leconCommencee(l) {
  if (l.unites.some(u => getUnitBest(l.id, u.id) != null || getPlusFait(l.id, u.id))) return true;
  if (getMissionBest(l.id) != null || leconValideeParMission(l.id) || acquisV1(l)) return true;
  const saved = loadRun();
  return !!(saved && saved.leconId === l.id);
}

function introMissionAVoir(l) {
  return !!(l && l.mission && l.scene && !getIntroMissionVue(l.id) && !leconCommencee(l));
}

function renderIntroMission() {
  const l = pLecon;
  document.getElementById('msi-content').innerHTML =
    '<div class="msi-haut">' +
      '<div class="pc-mini-label pc-gold msi-in">MISSION · LEÇON ' + l.id + '</div>' +
      '<h1 class="msi-titre msi-in">' + escHtml(l.mission.titre) + '</h1>' +
      '<p class="msi-contexte msi-in">' + escHtml(l.mission.contexte) + '</p>' +
    '</div>' +
    '<div class="msi-objectif msi-in">' +
      '<div class="msi-objectif-titre">À la fin, tu sauras :</div>' +
      '<div class="msi-objectif-txt">' + ICONES.coche + '<span>' + escHtml(l.mission.objectif) + '</span></div>' +
    '</div>' +
    '<div class="msi-bas msi-in">' +
      '<div class="msi-info">' + unitesCoeur(l).length + ' unités pour t\'y préparer, puis la scène à jouer · ' +
        nbRepliquesToi(l) + ' répliques à dire</div>' +
      '<button class="pc-btn primary wide big" onclick="confirmerIntroMission()">J\'ai compris · Commencer →</button>' +
      '<button class="pc-btn ghost wide" onclick="voirUnitesDepuisIntro()">Voir les unités</button>' +
      // S10 : on peut aussi tenter la scène tout de suite, sans passer par les unités.
      (peutTenterSaChance(l) ? '<button class="pc-btn ghost wide msi-tenter" onclick="tenterDepuisIntro()">Tu connais déjà ? Tente ta chance</button>' : '') +
    '</div>';
}

// « J'ai compris » : l'introduction est confirmée, on ouvre la 1re unité à faire.
function confirmerIntroMission() {
  marquerIntroMissionVue(pLecon.id);
  const fil = unitesCoeur(pLecon);
  const u = fil.find(x => getUnitBest(pLecon.id, x.id) == null) || fil[0];
  openIntro(u.id);
}

// « Tente ta chance » depuis l'introduction : confirmée, on joue la scène.
function tenterDepuisIntro() {
  marquerIntroMissionVue(pLecon.id);
  openMission(true);
}

// « Voir les unités » : confirmée aussi, mais sans lancer d'exercice.
function voirUnitesDepuisIntro() {
  marquerIntroMissionVue(pLecon.id);
  openParcoursLecon(pLecon);
}

// Fin d'unité : les répliques que cette unité permet maintenant de dire.
function repliquesDebloqueesHtml(l, uniteId) {
  if (!l.scene) return '';
  const lignes = l.scene.filter(x => x.unite === uniteId);
  if (!lignes.length) return '';
  return '<div class="ms-debloque"><div class="pc-mini-label pc-gold">TA MISSION AVANCE</div>' +
    '<div class="ms-sous">« ' + escHtml(l.mission.titre) + ' » : tu sais maintenant dire</div>' +
    lignes.map(x => '<div class="ms-bulle' + (x.qui === 'toi' ? ' toi' : '') + '"><b>' +
      (x.qui === 'toi' ? 'Toi' : escHtml(x.qui)) + '</b>' + escHtml(x.lu) + '<em>' + escHtml(x.fr) + '</em></div>').join('') +
    '</div>';
}

// ─── TENTER SA CHANCE (S10) ─────────────────────────────────────────────────
// Proposé tant qu'aucune unité du fil n'est terminée (et pas déjà validée).
function peutTenterSaChance(l) {
  if (leconValideeParMission(l.id)) return false;
  return unitesCoeur(l).every(u => getUnitBest(l.id, u.id) == null);
}

// ─── JOUER LA MISSION ───────────────────────────────────────────────────────
// Une réplique à la fois : la réplique d'avant, la phrase française à dire,
// le champ et Valider. Le clavier ne s'ouvre jamais tout seul.
// Après chaque réponse, la correction reste affichée jusqu'à « Continuer ».
// tentative = true : « Tente ta chance », avant les unités (S10).
function openMission(tentative) {
  ms = { idx: 0, essais: 0, dernierEssai: '', resultats: [], tentative: !!tentative && peutTenterSaChance(pLecon), vues: 0 };
  document.getElementById('ms-titre').textContent = pLecon.mission.titre;
  fermerClavier();
  showView('view-mission');
  renderMission();
}

// Croix de la mission : retour sur la carte de la mission.
function quitterMission() {
  openParcoursLecon(pLecon, 'mission');
}

// Position de la réplique « toi » en cours : 1re, 2e… sur le total à dire.
function numeroReplique(idx) {
  return pLecon.scene.slice(0, idx + 1).filter(x => x.qui === 'toi').length;
}

function bulleJeuHtml(x, i) {
  const toi = x.qui === 'toi';
  let classe = 'ms-bulle' + (toi ? ' toi' : '');
  if (toi && ms.resultats[i] === 'revele') classe += ' revele';
  // Les nouvelles répliques arrivent une par une (S12).
  let delai = '';
  if (i >= ms.vues) {
    classe += ' bulle-in';
    delai = ' style="animation-delay:' + ((i - ms.vues) * 150) + 'ms"';
  }
  return '<div class="' + classe + '"' + delai + '><b>' + (toi ? 'Toi' : escHtml(x.qui)) + '</b>' +
    escHtml(x.lu) + '<em>' + escHtml(x.fr) + '</em></div>';
}

function renderMission() {
  const scene = pLecon.scene;
  // Les répliques des autres passent toutes seules.
  while (ms.idx < scene.length && scene[ms.idx].qui !== 'toi') ms.idx++;

  if (ms.idx >= scene.length) {
    finirMission();
    return;
  }

  // On montre la réplique « toi » précédente et ce qui a été dit depuis.
  // Le début du dialogue reste disponible, replié.
  let debutRecent = 0;
  for (let i = ms.idx - 1; i >= 0; i--) {
    if (scene[i].qui === 'toi') { debutRecent = i; break; }
  }
  const avant = scene.slice(0, debutRecent);
  let html = '<div class="pc-mini-label pc-gold">RÉPLIQUE ' + numeroReplique(ms.idx) + ' / ' + nbRepliquesToi(pLecon) + '</div>';
  if (ms.idx === 0 || debutRecent === 0 && scene[0].qui !== 'toi') {
    html += '<div class="ms-contexte">' + escHtml(pLecon.mission.contexte) + '</div>';
  }
  if (avant.length) {
    html += '<details class="ms-histoire"><summary>Revoir le début du dialogue · ' + avant.length +
      ' réplique' + (avant.length > 1 ? 's' : '') + '</summary><div class="ms-scene">' +
      avant.map((x, i) => bulleJeuHtml(x, i)).join('') + '</div></details>';
  }
  html += '<div class="ms-scene">';
  for (let i = debutRecent; i < ms.idx; i++) html += bulleJeuHtml(scene[i], i);
  html += '</div>';
  ms.vues = ms.idx;

  // Réplique à écrire : on donne le français, l'utilisateur écrit le luxembourgeois.
  const ligne = scene[ms.idx];
  html += '<div class="ms-atoi" id="ms-atoi">' +
    '<div class="pc-mini-label">À TOI · ÉCRIS EN LUXEMBOURGEOIS</div>' +
    '<div class="ms-atoi-fr">' + escHtml(ligne.fr) + '</div>' +
    '<div class="mc-erreur hidden" id="ms-erreur"></div>' +
    '<textarea id="ms-input" class="ecr-input" rows="2" placeholder="Ta réplique…" enterkeyhint="done"' +
      ' autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false"></textarea>' +
    '<div class="pc-actions"><button class="pc-btn primary wide" id="ms-btn-valider" onclick="missionValider()">Valider</button></div>' +
    '<button class="pc-btn ghost wide hidden" id="ms-btn-voir" onclick="missionVoirReponse()">Voir la réponse</button>' +
    '</div>';
  document.getElementById('ms-body').innerHTML = html;
  window.scrollTo(0, 0);

  const input = document.getElementById('ms-input');
  input.addEventListener('keydown', e => {
    if (e.key !== 'Enter' || e.shiftKey) return;
    e.preventDefault();
    e.stopPropagation();
    missionValider();
  });
  // Dès qu'on corrige sa réponse, « Réessayer » redevient « Valider ».
  input.addEventListener('input', () => {
    document.getElementById('ms-btn-valider').textContent = 'Valider';
  });
  focusSiClavierPhysique(input); // sur téléphone, on touche le champ pour écrire
}

// Bouton principal : « Valider », ou « Réessayer » après une erreur.
// « Réessayer » sans rien changer remet simplement le curseur dans le champ.
function missionValider() {
  const input = document.getElementById('ms-input');
  if (!input || input.disabled) return;
  const val = input.value.trim();
  if (!val || (ms.essais > 0 && val === ms.dernierEssai)) {
    input.focus();
    return;
  }
  const ligne = pLecon.scene[ms.idx];

  // Juste : on enregistre, on ferme le clavier, on montre la correction.
  if (normalize(val) === normalize(ligne.lu)) {
    ms.resultats[ms.idx] = ms.essais === 0 ? 'ok' : 'essais';
    const titre = ms.essais === 0 ? 'Bonne réponse !' : 'Juste, au ' + (ms.essais + 1) + 'e essai';
    const sous = ms.essais === 0
      ? 'Réplique ' + numeroReplique(ms.idx) + ' sur ' + nbRepliquesToi(pLecon) + ' validée.'
      : 'Réplique validée. Elle ne compte pas comme juste du premier coup.';
    retourMission('ok', titre, ligne.lu, sous);
    return;
  }

  // Faux : on réessaie (jamais bloqué). 1er essai : diagnostic + aide sans la réponse (S6).
  // La réponse reste dans le champ pour la corriger ; le clavier se ferme pour laisser lire l'aide.
  ms.essais++;
  ms.dernierEssai = val;
  const err = document.getElementById('ms-erreur');
  err.classList.remove('hidden');
  err.innerHTML = '<b>Pas encore</b> · Essai ' + ms.essais +
    aideErreurHtml(val, ligne, ligne.aide || '', ms.essais);
  document.getElementById('ms-btn-valider').textContent = 'Réessayer';
  if (ms.essais >= ESSAIS_MISSION) document.getElementById('ms-btn-voir').classList.remove('hidden');
  fermerClavier();
  const atoi = document.getElementById('ms-atoi');
  if (atoi) window.scrollTo(0, Math.max(0, atoi.getBoundingClientRect().top + window.scrollY - 12));
}

function missionVoirReponse() {
  const ligne = pLecon.scene[ms.idx];
  ms.resultats[ms.idx] = 'revele';
  retourMission('revele', 'La réponse', ligne.lu,
    (ligne.aide ? ligne.aide + ' · ' : '') + 'Elle ne compte pas comme juste du premier coup.');
}

// Correction affichée à la place de la question, jusqu'au clic sur « Continuer ».
function retourMission(etat, titre, lu, sous) {
  fermerClavier();
  const atoi = document.getElementById('ms-atoi');
  atoi.className = 'ms-retour ' + etat;
  atoi.removeAttribute('id');
  atoi.innerHTML =
    '<div class="ms-retour-titre">' + (etat === 'ok' ? ICONES.coche : '') + escHtml(titre) + '</div>' +
    '<div class="ms-retour-lu">' + escHtml(lu) + '</div>' +
    '<div class="ms-retour-sous">' + sous + '</div>';
  const bouton = document.createElement('button');
  bouton.className = 'pc-btn primary wide';
  bouton.id = 'ms-continuer';
  bouton.textContent = 'Continuer →';
  bouton.onclick = suiteMission;
  atoi.after(bouton);
  bouton.focus({ preventScroll: true }); // Entrée = Continuer (ordinateur)
  if (atoi.getBoundingClientRect().top < 0) atoi.scrollIntoView({ block: 'start' });
}

function suiteMission() {
  ms.idx++;
  ms.essais = 0;
  ms.dernierEssai = '';
  renderMission();
}

// Score = répliques justes du premier coup / répliques à dire.
function finirMission() {
  const total = nbRepliquesToi(pLecon);
  let ok = 0;
  pLecon.scene.forEach((x, i) => { if (x.qui === 'toi' && ms.resultats[i] === 'ok') ok++; });
  const percent = Math.round(ok / total * 100);
  const premiere = getMissionBest(pLecon.id) == null;
  saveMissionBest(pLecon.id, percent);
  marquerUniteFaite(); // mission jouée : objectif « unité » du jour (S7)
  dernierFini = { leconId: pLecon.id, uniteId: 'mission' }; // animé sur le chemin

  // « Tente ta chance » (S10) : écran de résultat dédié.
  if (ms.tentative) {
    finirTentative(percent, ok, total);
    return;
  }

  let titre = percent >= SEUIL_MISSION ? 'Mission réussie !' : 'Mission jouée · à rejouer';
  if (percent === 100) titre = premiere ? 'Mission réussie, sans faute !' : 'Sans faute, encore une fois !';

  const fin = document.createElement('div');
  fin.className = 'ms-fin';
  fin.innerHTML =
    '<div class="pf-sansfaute ms-bandeau">' + titre + '<span>' + ok + ' / ' + total +
      ' répliques justes du premier coup · ' + percent + ' %</span></div>' +
    '<div class="pf-boutons">' +
      '<button class="pc-btn primary wide big" onclick="suivreProchainPas()">Continuer le parcours</button>' +
      '<button class="pc-btn ghost wide" onclick="openMission()">Rejouer la mission</button>' +
      '<button class="pc-btn ghost wide" onclick="quitterMission()">Retour à la leçon</button>' +
    '</div>';
  afficherBilanMission(fin);
  if (percent >= SEUIL_MISSION) confettis(); // mission réussie : célébration (S12)
}

// Bilan en haut de l'écran, la scène complète jouée en dessous.
function afficherBilanMission(fin) {
  fermerClavier();
  const body = document.getElementById('ms-body');
  body.innerHTML = '<div class="pc-mini-label">TA SCÈNE</div><div class="ms-scene">' +
    pLecon.scene.map((x, i) => bulleJeuHtml(x, i)).join('') + '</div>';
  body.prepend(fin);
  window.scrollTo(0, 0);
}

// Résultat de « Tente ta chance » (S10).
//   100 % du premier coup -> la leçon est validée par la mission, on passe à la suite ;
//   sinon -> rien n'est perdu, les unités vont aider.
function finirTentative(percent, ok, total) {
  const fin = document.createElement('div');
  fin.className = 'ms-fin';
  const premiere = unitesCoeur(pLecon)[0];
  if (percent === 100) {
    saveValideeMission(pLecon.id);
    fin.innerHTML =
      '<div class="pf-sansfaute ms-bandeau">Tu connais déjà cette leçon<span>' + ok + ' / ' + total +
        ' répliques justes du premier coup. Les unités sont validées par la mission.</span></div>' +
      '<div class="pf-boutons">' +
        '<button class="pc-btn primary wide big" onclick="suivreProchainPas()">Leçon suivante</button>' +
        '<button class="pc-btn ghost wide" onclick="openIntro(' + premiere.id + ')">Faire quand même les unités</button>' +
        '<button class="pc-btn ghost wide" onclick="goDashboard()">Accueil</button>' +
      '</div>';
    confettis();
  } else {
    const justes = pLecon.scene.filter((x, i) => x.qui === 'toi' && ms.resultats[i] === 'ok');
    fin.innerHTML =
      '<div class="ms-aide-unites"><b>Les unités vont t\'aider</b><span>' + ok + ' / ' + total +
        ' répliques justes du premier coup. Rien n\'est perdu : ton meilleur score est gardé.</span></div>' +
      (justes.length ? '<div class="pc-mini-label">TU SAIS DÉJÀ DIRE</div><div class="ms-scene">' +
        justes.map(x => '<div class="ms-bulle toi"><b>Toi</b>' + escHtml(x.lu) + '<em>' + escHtml(x.fr) + '</em></div>').join('') + '</div>' : '') +
      '<div class="pf-boutons">' +
        '<button class="pc-btn primary wide big" onclick="openIntro(' + premiere.id + ')">Commencer l\'unité ' + premiere.id + '</button>' +
        '<button class="pc-btn ghost wide" onclick="goDashboard()">Accueil</button>' +
      '</div>';
  }
  afficherBilanMission(fin);
}
