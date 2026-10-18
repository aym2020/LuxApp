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
//   - Score = réponses autonomes (justes du premier coup, ou après une faute de
//     frappe corrigée), 3 vies (spec 23). Meilleur score gardé (acquis).

const ESSAIS_MISSION = 2; // « Voir la réponse » apparaît après 2 essais ratés
const VIES_MISSION = 3;   // spec 23 : une vraie erreur coûte une vie (une seule par réplique)
// Réussite (spec 23), adaptée au nombre de répliques de la scène :
//   mission : au moins 80 % de réponses autonomes (8 sur 10) et au moins une vie ;
//   « Tente ta chance » : au moins 90 % (9 sur 10), aucune réponse révélée, au moins une vie.
// Réponse autonome = juste du premier coup, ou juste après une faute de frappe corrigée.

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
// Quatre états, à ne pas confondre (spec 18) :
//   découverte    : on a ouvert l'introduction, les unités ou la mission
//                   (getLeconVue) — n'engage à rien ;
//   confirmation  : « J'ai compris » (getIntroMissionVue) ;
//   apprentissage : une activité vraiment commencée (leconCommencee) ;
//   progression   : réponses, unités terminées, scores.
// « Voir les unités » et « Tente ta chance » sont de l'exploration : ils ne
// confirment rien. Tant que rien n'est commencé, le chemin propose « Découvrir ».
function leconCommencee(l) {
  if (l.unites.some(u => getUnitBest(l.id, u.id) != null || getPlusFait(l.id, u.id))) return true;
  if (getMissionBest(l.id) != null || leconValideeParMission(l.id) || acquisV1(l)) return true;
  // Au moins une réponse enregistrée dans cette leçon (v2 : ids ≥ 2001).
  const stats = getStatsStore()[l.id] || {};
  if (Object.keys(stats).some(type => Object.keys(stats[type] || {}).some(id => Number(id) >= 1000))) return true;
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

// Ouvre l'introduction de la mission (« Découvrir » sur le chemin).
function ouvrirIntroMission(l) {
  pLecon = l;
  currentLecon = l;
  marquerLeconVue(l.id);
  fermerClavier();
  renderIntroMission();
  showView('view-msintro');
}

// « Tente ta chance » depuis l'introduction : exploration, rien n'est confirmé.
// Retour → l'introduction.
function tenterDepuisIntro() {
  openMission(true);
}

// « Voir les unités » (ou « Passer ») : exploration, rien n'est confirmé.
// On affiche la liste des unités par-dessus l'introduction (Retour → l'introduction).
function voirUnitesDepuisIntro() {
  renderParcoursLecon();
  showView('view-plecon');
}

// Fin d'unité : les répliques que cette unité permet maintenant de dire.
function repliquesDebloqueesHtml(l, uniteId) {
  if (!l.scene) return '';
  const lignes = l.scene.filter(x => x.unite === uniteId);
  if (!lignes.length) return '';
  // Mêmes bulles que la mission (messagerie) ; un appui affiche la traduction.
  return '<div class="ms-debloque"><div class="pc-mini-label pc-gold">TA MISSION AVANCE</div>' +
    lignes.map(x => '<div class="ms-bulle' + (x.qui === 'toi' ? ' toi' : '') + '" onclick="this.classList.toggle(\'traduite\')">' +
      '<b>' + (x.qui === 'toi' ? 'Toi ' + ICONES.coche : escHtml(x.qui)) + '</b>' + escHtml(x.lu) + '<em>' + escHtml(x.fr) + '</em></div>').join('') +
    '</div>';
}

// ─── TENTER SA CHANCE (S10) ─────────────────────────────────────────────────
// Proposé tant qu'aucune unité du fil n'est terminée (et pas déjà validée).
function peutTenterSaChance(l) {
  if (leconValideeParMission(l.id)) return false;
  return unitesCoeur(l).every(u => getUnitBest(l.id, u.id) == null);
}

// ─── JOUER LA MISSION : UNE CONVERSATION FAÇON MESSAGERIE ───────────────────
// Écran en trois zones : l'en-tête (interlocuteur, progression), la
// conversation qui défile seule, et la zone de réponse en bas (la phrase à
// traduire, le champ, le bouton d'envoi). Le clavier ne s'ouvre jamais tout
// seul ; quand il s'ouvre, l'écran prend la hauteur visible (ui.js) et la zone
// de réponse reste juste au-dessus du clavier.
// Après chaque réponse, la correction reste affichée jusqu'à « Continuer ».
// tentative = true : « Tente ta chance », avant les unités (S10).
function openMission(tentative) {
  ms = { idx: 0, essais: 0, dernierEssai: '', resultats: [], tentative: !!tentative && peutTenterSaChance(pLecon), vues: 0, enBas: true,
    vies: VIES_MISSION, coquille: false };
  renderEnteteMission();
  majVies(false);
  fermerClavier();
  showView('view-mission');
  ecouterConversation();
  renderMission();
}

// Retour depuis la mission : l'écran d'où on est parti (chemin ou leçon).
function quitterMission() {
  retour();
}

// Les personnages de la scène (hors « toi »).
function interlocuteurs(l) {
  return [...new Set(l.scene.filter(x => x.qui !== 'toi').map(x => x.qui))];
}

function initiales(nom) {
  return nom.split(/\s+/).map(m => m.charAt(0)).join('').slice(0, 2).toUpperCase();
}

// Un seul interlocuteur : son nom et son avatar en en-tête, plus aucun nom sur les bulles.
// Plusieurs : le titre de la mission en en-tête, un petit avatar quand la personne change.
function renderEnteteMission() {
  const noms = interlocuteurs(pLecon);
  const seul = noms.length === 1;
  document.getElementById('ms-titre').textContent = seul ? noms[0] : pLecon.mission.titre;
  document.getElementById('ms-sous-titre').textContent = seul ? 'Mission · ' + pLecon.mission.titre : noms.join(', ');
  const avatar = document.getElementById('ms-avatar');
  avatar.textContent = seul ? initiales(noms[0]) : '';
  avatar.classList.toggle('hidden', !seul);
}

function majProgressionMission() {
  const total = nbRepliquesToi(pLecon);
  const fait = pLecon.scene.slice(0, ms.idx).filter(x => x.qui === 'toi').length;
  const enCours = Math.min(fait + 1, total);
  document.getElementById('ms-compteur').textContent = ms.idx >= pLecon.scene.length ? total + ' / ' + total : enCours + ' / ' + total;
  document.getElementById('ms-piste').style.width = Math.round(fait / total * 100) + '%';
}

// Les trois cœurs de l'en-tête. perdue = true : le dernier cœur perdu s'anime.
function majVies(perdue) {
  const coeur = plein => '<svg class="ms-coeur' + (plein ? '' : ' vide') + '" viewBox="0 0 24 24" aria-hidden="true">' +
    '<path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2.1 0 3.6 1.1 5.3 3 1.7-1.9 3.2-3 5.3-3 3.7 0 5.8 3.9 4.3 7.3C19.5 16.4 12 21 12 21z"/></svg>';
  let html = '';
  for (let i = 0; i < VIES_MISSION; i++) html += coeur(i < ms.vies);
  const zone = document.getElementById('ms-vies');
  zone.innerHTML = html;
  zone.setAttribute('aria-label', ms.vies + ' vie' + (ms.vies > 1 ? 's' : '') + ' sur ' + VIES_MISSION);
  if (perdue) {
    const c = zone.querySelectorAll('.ms-coeur')[ms.vies];
    if (c) c.classList.add('perdu');
  }
}

// Une vraie erreur sur cette réplique : une vie de moins (une seule par réplique).
function perdreVie() {
  if (ms.vies <= 0) return;
  ms.vies--;
  majVies(true);
}

// Position de la réplique « toi » en cours : 1re, 2e… sur le total à dire.
function numeroReplique(idx) {
  return pLecon.scene.slice(0, idx + 1).filter(x => x.qui === 'toi').length;
}

// Une bulle : à gauche pour les personnages, à droite pour toi.
// La traduction est cachée : un appui sur la bulle l'affiche.
// traduite = true : traduction visible d'emblée (bilan de fin).
function bulleJeuHtml(x, i, traduite) {
  const toi = x.qui === 'toi';
  let classe = 'ms-bulle' + (toi ? ' toi' : '') + (traduite ? ' traduite' : '');
  if (toi && ms.resultats[i] === 'revele') classe += ' revele';
  else if (toi && ms.resultats[i]) classe += ' valide';
  // Plusieurs personnages : petit avatar quand la personne qui parle change
  // (tes propres répliques ne comptent pas).
  let avatar = '';
  const avant = pLecon.scene.slice(0, i).filter(y => y.qui !== 'toi');
  const precedent = avant[avant.length - 1];
  if (!toi && interlocuteurs(pLecon).length > 1 && (!precedent || precedent.qui !== x.qui)) {
    avatar = '<span class="ms-qui"><i>' + escHtml(initiales(x.qui)) + '</i>' + escHtml(x.qui) + '</span>';
  }
  // Les nouvelles répliques arrivent une par une (S12).
  let delai = '';
  if (i >= ms.vues) {
    classe += ' bulle-in';
    delai = ' style="animation-delay:' + ((i - ms.vues) * 150) + 'ms"';
  }
  const coche = toi && ms.resultats[i] && ms.resultats[i] !== 'revele' ? '<span class="ms-etat-envoi">' + ICONES.coche + '</span>' : '';
  return avatar + '<div class="' + classe + '"' + delai + ' onclick="this.classList.toggle(\'traduite\')">' +
    escHtml(x.lu) + coche + '<em>' + escHtml(x.fr) + '</em></div>';
}

// La conversation reste collée en bas, sauf si on remonte lire d'anciens messages.
function ecouterConversation() {
  const body = document.getElementById('ms-body');
  if (body.dataset.ecoute) return;
  body.dataset.ecoute = '1';
  body.addEventListener('scroll', () => {
    if (ms) ms.enBas = body.scrollHeight - body.scrollTop - body.clientHeight < 48;
  });
  // Clavier ouvert ou fermé : la zone change de hauteur ; on garde le bas en vue.
  if (window.ResizeObserver) {
    new ResizeObserver(() => { if (ms && ms.enBas) allerEnBasConversation(); }).observe(body);
  }
}

function allerEnBasConversation() {
  const body = document.getElementById('ms-body');
  body.scrollTop = body.scrollHeight;
}

function renderMission() {
  const scene = pLecon.scene;
  // Les répliques des autres passent toutes seules.
  while (ms.idx < scene.length && scene[ms.idx].qui !== 'toi') ms.idx++;
  majProgressionMission();

  if (ms.idx >= scene.length) {
    finirMission();
    return;
  }

  // Toute la conversation jusqu'ici ; la zone de réponse en bas.
  let html = '';
  for (let i = 0; i < ms.idx; i++) html += bulleJeuHtml(scene[i], i);
  if (numeroReplique(ms.idx) === 1) html += '<div class="ms-astuce">Touche une bulle pour voir sa traduction.</div>';
  ms.vues = ms.idx;
  const body = document.getElementById('ms-body');
  body.innerHTML = html;
  ms.enBas = true;
  allerEnBasConversation();

  const ligne = scene[ms.idx];
  const zone = document.getElementById('ms-reponse');
  zone.classList.remove('hidden');
  zone.innerHTML =
    (ms.vies === 0 ? '<div class="ms-apprentissage">Plus de vie : termine la conversation pour t\'entraîner. Le défi ne sera pas validé cette fois.</div>' : '') +
    '<div class="mc-erreur hidden" id="ms-erreur"></div>' +
    '<div class="ms-a-traduire"><span>À traduire en luxembourgeois</span><div class="ms-consigne">' + escHtml(ligne.fr) + '</div></div>' +
    '<div class="ms-champ">' +
      '<textarea id="ms-input" rows="1" placeholder="Écris ta réponse…" enterkeyhint="send" aria-label="Ta réponse en luxembourgeois"' +
        ' autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false"></textarea>' +
      '<button class="ms-envoyer" id="ms-btn-valider" aria-label="Envoyer" onclick="missionValider()">' + ICONES.fleche + '</button>' +
    '</div>' +
    '<button class="ms-lien hidden" id="ms-btn-voir" onclick="missionVoirReponse()">Voir la réponse</button>';

  const input = document.getElementById('ms-input');
  input.addEventListener('keydown', e => {
    if (e.key !== 'Enter' || e.shiftKey) return;
    e.preventDefault();
    e.stopPropagation();
    missionValider();
  });
  input.addEventListener('input', () => {
    document.getElementById('ms-btn-valider').setAttribute('aria-label', 'Envoyer');
    agrandirChamp(input);
  });
  focusSiClavierPhysique(input); // sur téléphone, on touche le champ pour écrire
}

// Réponse longue : le champ grandit (jusqu'à 4 lignes), sans saut à chaque frappe.
function agrandirChamp(input) {
  input.style.height = 'auto';
  input.style.height = Math.min(input.scrollHeight, 120) + 'px';
}

// Contexte de la mission, à relire à tout moment (panneau).
function voirContexte() {
  const l = pLecon;
  ouvrirPanneau('<div class="poignee"></div>' +
    '<div class="pc-mini-label pc-gold">MISSION · LEÇON ' + l.id + '</div>' +
    '<h2 class="ms-titre">' + escHtml(l.mission.titre) + '</h2>' +
    '<div class="ms-contexte">' + escHtml(l.mission.contexte) + '</div>' +
    '<div class="ms-objectif"><span>À la fin, tu sauras :</span> ' + escHtml(l.mission.objectif) + '</div>' +
    '<div class="ms-panneau-bas"><button class="pc-btn primary wide" onclick="fermerPanneau()">Continuer la mission</button></div>',
    'Contexte de la mission');
}

// Bouton d'envoi : valider, ou (après une erreur, sans changement) remettre le curseur.
function missionValider() {
  const input = document.getElementById('ms-input');
  if (!input || input.disabled) return;
  const val = input.value.trim();
  if (!val || (ms.essais > 0 && val === ms.dernierEssai)) {
    input.focus();
    return;
  }
  const ligne = pLecon.scene[ms.idx];

  // Juste : la réplique part dans la conversation, la correction s'affiche en bas.
  // Résultat : 'ok' (direct), 'coquille' (après une faute de frappe corrigée),
  // 'essais' (après une vraie erreur), 'revele' (réponse montrée).
  if (normalize(val) === normalize(ligne.lu)) {
    ms.resultats[ms.idx] = ms.essais > 0 ? 'essais' : (ms.coquille ? 'coquille' : 'ok');
    const titre = ms.essais === 0 ? 'Bonne réponse !' : 'Juste, au ' + (ms.essais + 1) + 'e essai';
    let sous = 'Réplique ' + numeroReplique(ms.idx) + ' sur ' + nbRepliquesToi(pLecon) + ' validée.';
    if (ms.resultats[ms.idx] === 'coquille') sous = 'Faute de frappe corrigée : aucune vie perdue.';
    if (ms.essais > 0) sous = 'Elle ne compte pas comme réponse autonome.';
    retourMission('ok', titre, sous);
    return;
  }

  // Spec 24 : une coquille probable se corrige gratuitement, une fois par réplique.
  const err = document.getElementById('ms-erreur');
  if (ms.essais === 0 && !ms.coquille) {
    const analyse = analyserReponse(val, ligne.lu);
    if (analyse.correctionGratuiteAutorisee) {
      ms.coquille = true;
      ms.dernierEssai = '';
      afficherCoquille(err, analyse);
      document.getElementById('ms-btn-valider').setAttribute('aria-label', 'Corriger ma saisie');
      fermerClavier();
      return;
    }
  }

  // Faux : on réessaie (jamais bloqué). 1er essai : diagnostic + aide sans la réponse (S6).
  // La 1re vraie erreur de la réplique coûte une vie.
  // La réponse reste dans le champ pour la corriger ; le clavier se ferme pour laisser lire l'aide.
  ms.essais++;
  ms.dernierEssai = val;
  if (ms.essais === 1) perdreVie();
  err.classList.remove('hidden', 'coquille');
  err.innerHTML = '<b>Pas encore</b> · Essai ' + ms.essais +
    aideErreurHtml(val, ligne, ligne.aide || '', ms.essais);
  document.getElementById('ms-btn-valider').setAttribute('aria-label', 'Réessayer');
  if (ms.essais >= ESSAIS_MISSION) document.getElementById('ms-btn-voir').classList.remove('hidden');
  fermerClavier();
}

function missionVoirReponse() {
  const ligne = pLecon.scene[ms.idx];
  ms.resultats[ms.idx] = 'revele';
  retourMission('revele', 'La réponse', (ligne.aide ? ligne.aide + ' · ' : '') + 'Elle ne compte pas comme juste du premier coup.');
}

// La réplique dite s'ajoute à la conversation (à droite) ; la zone de réponse
// affiche la correction et « Continuer » jusqu'au clic.
function retourMission(etat, titre, sous) {
  fermerClavier();
  const body = document.getElementById('ms-body');
  body.insertAdjacentHTML('beforeend', bulleJeuHtml(pLecon.scene[ms.idx], ms.idx));
  ms.vues = ms.idx + 1;
  allerEnBasConversation();
  document.getElementById('ms-reponse').innerHTML =
    '<div class="ms-retour ' + etat + '">' +
      '<div class="ms-retour-titre">' + (etat === 'ok' ? ICONES.coche : '') + escHtml(titre) + '</div>' +
      '<div class="ms-retour-sous">' + sous + '</div>' +
    '</div>' +
    // Vert après une réussite, couleur d'erreur quand la réponse a été montrée.
    '<button class="pc-btn ' + (etat === 'ok' ? 'ok' : 'ko') + ' wide ms-continuer" id="ms-continuer" onclick="suiteMission()">Continuer →</button>';
  document.getElementById('ms-continuer').focus({ preventScroll: true }); // Entrée = Continuer (ordinateur)
}

function suiteMission() {
  ms.idx++;
  ms.essais = 0;
  ms.coquille = false;
  ms.dernierEssai = '';
  renderMission();
}

// Score = réponses autonomes / répliques à dire.
function finirMission() {
  const total = nbRepliquesToi(pLecon);
  let ok = 0, reveles = 0;
  pLecon.scene.forEach((x, i) => {
    if (x.qui !== 'toi') return;
    if (ms.resultats[i] === 'ok' || ms.resultats[i] === 'coquille') ok++; // réponses autonomes
    if (ms.resultats[i] === 'revele') reveles++;
  });
  let percent = Math.round(ok / total * 100);
  // Plus de vie : le défi n'est pas validé cette fois (le score reste sous le seuil).
  if (ms.vies === 0) percent = Math.min(percent, SEUIL_MISSION - 1);
  ms.bilan = { ok, total, erreurs: total - ok, reveles, vies: ms.vies };
  const premiere = getMissionBest(pLecon.id) == null;
  saveMissionBest(pLecon.id, percent, missionVersion(pLecon));
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
    '<div class="pf-sansfaute ms-bandeau">' + titre + '<span>' + bilanMissionTexte() + '</span></div>' +
    '<div class="pf-boutons">' +
      '<button class="pc-btn primary wide big" onclick="suivreProchainPas()">Continuer le parcours</button>' +
      '<button class="pc-btn ghost wide" onclick="openMission()">Rejouer la mission</button>' +
      '<button class="pc-btn ghost wide" onclick="quitterMission()">Retour · ' + escHtml(nomEcran(ecranPrecedent())) + '</button>' +
    '</div>';
  afficherBilanMission(fin);
  if (percent >= SEUIL_MISSION) confettis(); // mission réussie : célébration (S12)
}

// « 8 / 10 réponses autonomes · 2 erreurs · 1 vie restante »
function bilanMissionTexte() {
  const b = ms.bilan;
  return b.ok + ' / ' + b.total + ' réponses autonomes · ' + b.erreurs + ' erreur' + (b.erreurs > 1 ? 's' : '') +
    ' · ' + b.vies + ' vie' + (b.vies > 1 ? 's' : '') + ' restante' + (b.vies > 1 ? 's' : '');
}

// Version de la scène (champ « version » de la mission, 1 par défaut) : pour
// distinguer plus tard les anciens résultats des épreuves à 10 répliques.
function missionVersion(l) {
  return (l.mission && l.mission.version) || 1;
}

// Bilan en haut de la conversation, la scène complète (traduite) en dessous.
// La zone de réponse disparaît.
function afficherBilanMission(fin) {
  fermerClavier();
  majProgressionMission();
  document.getElementById('ms-reponse').classList.add('hidden');
  const body = document.getElementById('ms-body');
  body.innerHTML = '<div class="pc-mini-label">TA SCÈNE</div>' +
    pLecon.scene.map((x, i) => bulleJeuHtml(x, i, true)).join('');
  body.prepend(fin);
  body.scrollTop = 0;
}

// Résultat de « Tente ta chance » (S10).
//   100 % du premier coup -> la leçon est validée par la mission, on passe à la suite ;
//   sinon -> rien n'est perdu, les unités vont aider.
function finirTentative(percent, ok, total) {
  const fin = document.createElement('div');
  fin.className = 'ms-fin';
  const premiere = unitesCoeur(pLecon)[0];
  // Spec 23 : 90 % de réponses autonomes (9 sur 10), aucune réponse révélée, au moins une vie.
  if (ok >= Math.ceil(total * 0.9) && ms.bilan.reveles === 0 && ms.vies > 0) {
    saveValideeMission(pLecon.id);
    fin.innerHTML =
      '<div class="pf-sansfaute ms-bandeau">Tu connais déjà cette leçon<span>' + ok + ' / ' + total +
        ' réponses autonomes. Les unités sont validées par la mission.</span></div>' +
      '<div class="pf-boutons">' +
        '<button class="pc-btn primary wide big" onclick="suivreProchainPas()">Leçon suivante</button>' +
        '<button class="pc-btn ghost wide" onclick="openIntro(' + premiere.id + ')">Faire quand même les unités</button>' +
        '<button class="pc-btn ghost wide" onclick="goDashboard()">Accueil</button>' +
      '</div>';
    confettis();
  } else {
    const justes = pLecon.scene.filter((x, i) => x.qui === 'toi' && (ms.resultats[i] === 'ok' || ms.resultats[i] === 'coquille'));
    fin.innerHTML =
      '<div class="ms-aide-unites"><b>Les unités vont t\'aider</b><span>' + ok + ' / ' + total +
        ' réponses autonomes · ' + ms.bilan.vies + ' vie' + (ms.bilan.vies > 1 ? 's' : '') + ' restante' + (ms.bilan.vies > 1 ? 's' : '') + '. Rien n\'est perdu : ton meilleur score est gardé.</span></div>' +
      (justes.length ? '<div class="pc-mini-label">TU SAIS DÉJÀ DIRE</div><div class="ms-scene">' +
        justes.map(x => '<div class="ms-bulle toi"><b>Toi</b>' + escHtml(x.lu) + '<em>' + escHtml(x.fr) + '</em></div>').join('') + '</div>' : '') +
      '<div class="pf-boutons">' +
        '<button class="pc-btn primary wide big" onclick="openIntro(' + premiere.id + ')">Commencer l\'unité ' + premiere.id + '</button>' +
        '<button class="pc-btn ghost wide" onclick="goDashboard()">Accueil</button>' +
      '</div>';
  }
  afficherBilanMission(fin);
}
