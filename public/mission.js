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

// Nombre de répliques visibles avant « Voir toute la scène ».
const REPLIQUES_APERCU = 3;

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
// conseillee = true quand le fil est fini : le bouton passe en jaune (si jamais jouée).
function missionHtml(l, conseillee) {
  if (!l.mission || !l.scene) return '';
  const best = getMissionBest(l.id);
  const statut = statutMission(l);
  const apprises = l.scene.filter(x => repliqueApprise(l, x)).length;
  const apercu = l.scene.slice(0, REPLIQUES_APERCU);
  const suite = l.scene.slice(REPLIQUES_APERCU);

  let html = '<div class="ms-carte">' +
    '<div class="pc-mini-label pc-gold' + (statut === 'jouee' ? ' ms-jouee' : '') + '">' + etiquetteMission(l) + '</div>' +
    '<div class="ms-titre">' + escHtml(l.mission.titre) + '</div>' +
    '<div class="ms-contexte">' + escHtml(l.mission.contexte) + '</div>' +
    '<div class="ms-objectif"><span>À la fin, tu sauras :</span> ' + escHtml(l.mission.objectif) + '</div>';

  // La scène : les premières répliques en clair, le reste derrière « Voir toute la scène ».
  html += '<div class="ms-scene">' + apercu.map(x => bulleSceneHtml(l, x)).join('') + '</div>';
  if (suite.length) {
    html += '<details class="ms-suite"><summary>Voir toute la scène · ' + l.scene.length + ' répliques</summary>' +
      '<div class="ms-scene">' + suite.map(x => bulleSceneHtml(l, x)).join('') + '</div></details>';
  }

  html += '<div class="ms-bas">Tu sais dire ' + apprises + ' réplique' + (apprises > 1 ? 's' : '') +
      ' sur ' + l.scene.length + '</div>' +
    '<button class="pc-btn ' + (conseillee && best == null ? 'primary' : '') + ' wide" onclick="openMission()">' +
      (best != null ? 'Rejouer la mission' : 'Jouer la mission') + ' · ' + nbRepliquesToi(l) + ' répliques à dire</button>' +
    '</div>';
  return html;
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

// ─── JOUER LA MISSION ───────────────────────────────────────────────────────
function openMission() {
  ms = { idx: 0, essais: 0, revele: false, resultats: [] };
  document.getElementById('ms-titre').textContent = pLecon.mission.titre;
  showView('view-mission');
  renderMission();
}

// Affiche toutes les répliques jusqu'à la prochaine réplique « toi » à écrire.
function renderMission() {
  const scene = pLecon.scene;
  // Les répliques des autres passent toutes seules.
  while (ms.idx < scene.length && scene[ms.idx].qui !== 'toi') ms.idx++;

  let html = '<div class="ms-contexte">' + escHtml(pLecon.mission.contexte) + '</div><div class="ms-scene">';
  for (let i = 0; i < Math.min(ms.idx, scene.length); i++) {
    const x = scene[i];
    const toi = x.qui === 'toi';
    const res = ms.resultats[i];
    let classe = 'ms-bulle' + (toi ? ' toi' : '');
    if (toi && res === 'revele') classe += ' revele';
    html += '<div class="' + classe + '"><b>' + (toi ? 'Toi' : escHtml(x.qui)) + '</b>' +
      escHtml(x.lu) + '<em>' + escHtml(x.fr) + '</em></div>';
  }
  html += '</div>';

  if (ms.idx >= scene.length) {
    document.getElementById('ms-body').innerHTML = html;
    finirMission();
    return;
  }

  // Réplique à écrire : on donne le français, l'utilisateur écrit le luxembourgeois.
  const ligne = scene[ms.idx];
  html += '<div class="ms-atoi">' +
    '<div class="pc-mini-label">À TOI · ÉCRIS EN LUXEMBOURGEOIS</div>' +
    '<div class="ms-atoi-fr">' + escHtml(ligne.fr) + '</div>' +
    '<div class="mc-erreur hidden" id="ms-erreur"></div>' +
    '<textarea id="ms-input" class="ecr-input" rows="2" placeholder="Ta réplique…"' +
      ' autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false"></textarea>' +
    '<div class="pc-actions"><button class="pc-btn primary wide" onclick="missionValider()">Valider</button></div>' +
    '<button class="pc-btn ghost wide hidden" id="ms-btn-voir" onclick="missionVoirReponse()">Voir la réponse</button>' +
    '</div>';
  document.getElementById('ms-body').innerHTML = html;

  const input = document.getElementById('ms-input');
  input.addEventListener('keydown', e => {
    if (e.key !== 'Enter' || e.shiftKey) return;
    e.preventDefault();
    missionValider();
  });
  input.focus();
  const atoi = document.querySelector('#ms-body .ms-atoi');
  if (atoi && atoi.scrollIntoView) atoi.scrollIntoView({ block: 'end' });
}

function missionValider() {
  const input = document.getElementById('ms-input');
  const val = input.value.trim();
  if (!val) return;
  const ligne = pLecon.scene[ms.idx];

  // Juste : la réplique s'ajoute à la scène, on passe à la suite.
  if (normalize(val) === normalize(ligne.lu)) {
    ms.resultats[ms.idx] = ms.essais === 0 ? 'ok' : 'essais';
    suiteMission();
    return;
  }

  // Faux : on réessaie (jamais bloqué). 1er essai : diagnostic + aide sans la réponse (S6).
  ms.essais++;
  const err = document.getElementById('ms-erreur');
  err.classList.remove('hidden');
  err.innerHTML = '<b>Pas encore</b> · Ton essai : ' + escHtml(val) + ' · essai ' + ms.essais +
    aideErreurHtml(val, ligne, ligne.aide || '', ms.essais);
  if (ms.essais >= ESSAIS_MISSION) document.getElementById('ms-btn-voir').classList.remove('hidden');
  input.value = '';
  input.focus();
}

function missionVoirReponse() {
  ms.resultats[ms.idx] = 'revele';
  suiteMission();
}

function suiteMission() {
  ms.idx++;
  ms.essais = 0;
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
  marquerJour(2); // mission jouée = objectif du jour atteint

  let titre = 'Mission réussie !';
  if (percent === 100) titre = premiere ? 'Mission réussie, sans faute !' : 'Sans faute, encore une fois !';

  const fin = document.createElement('div');
  fin.className = 'ms-fin';
  fin.innerHTML =
    '<div class="pf-sansfaute">' + titre + '<span>' + ok + ' / ' + total +
      ' répliques justes du premier coup · ' + percent + ' %</span></div>' +
    '<div class="pf-boutons">' +
      '<button class="pc-btn primary wide big" onclick="openParcoursLecon(pLecon)">Retour à la leçon</button>' +
      '<button class="pc-btn ghost wide" onclick="openMission()">Rejouer la mission</button>' +
    '</div>';
  document.getElementById('ms-body').appendChild(fin);
  if (fin.scrollIntoView) fin.scrollIntoView({ block: 'end' });
}
