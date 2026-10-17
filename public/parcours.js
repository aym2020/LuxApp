// ─── PARCOURS EN UNITÉS (leçons v2) ─────────────────────────────────────────
// Une leçon "v2" possède un tableau "unites". Chaque exercice porte "unite": n.
// Une leçon SANS "unites" garde l'ancien affichage en onglets (rien ne change).
//
// Une unité se joue en 4 étapes, toujours dans cet ordre :
//   Mot caché -> Quiz -> Trous -> Écriture
//
// Règle commune à toutes les étapes :
//   - une erreur ne bloque pas : l'item revient à la fin de l'étape ;
//   - on avance seulement quand c'est juste ;
//   - le score ne compte que le PREMIER passage de chaque item.
//
// Une leçon a un FIL : une mission (une scène de la vie réelle). Chaque unité
// apprend UNE phrase de cette scène ; la mission finale rejoue la scène.
//
// Le « + » : des mots en plus, marqués "plus": true, qui réutilisent la phrase
// de leur unité (même phrase, plus de mots). Jamais de nouvelle règle.
//   - « Commencer » une unité  -> seulement le cœur (unité courte) ;
//   - « Élargir » / chip « + » -> seulement le « + » de l'unité ;
//   - « Leçon complète »       -> tout : cœur, « + » et unités bonus.
// Une unité "bonus": true contient une notion à part (ex. les pluriels) :
// facultative pour terminer la leçon, comptée pour « Complète ».
//
// Rien n'est verrouillé : toutes les unités, toutes les étapes, le « + », la
// mission et le bilan sont ouverts dès le départ. Le bouton jaune indique
// seulement la suite conseillée.
//
// La partie en cours est sauvegardée après chaque réponse (clé luxParcours),
// pour reprendre exactement là où on s'est arrêté.

const ETAPES = [
  { type: 'flashcards', stat: 'motcache', label: 'Mot caché' },
  { type: 'quiz',       stat: 'quiz',     label: 'Quiz' },
  { type: 'trous',      stat: 'trous',    label: 'Trous' },
  { type: 'ecriture',   stat: 'ecriture', label: 'Écriture' }
];
const RUN_KEY = 'luxParcours';
const TOUTE_LA_LECON = 'all';   // "uniteId" utilisé pour jouer la leçon entière
const ESSAIS_AVANT_REPONSE = 3; // "Voir la réponse" apparaît après 3 essais ratés

let pLecon = null;      // leçon v2 affichée
let run = null;         // partie en cours
let mc = null;          // état du mot affiché dans l'étape Mot caché
let pAttente = false;   // true quand un message attend le bouton "Continuer"
let pSuite = null;      // fonction lancée par "Continuer"
let pTimer = null;      // passage automatique à l'item suivant
let pCoursUnite = null; // unité affichée dans le panneau Cours (null = toute la leçon)
let pResultat = null;   // résultat de la dernière partie terminée
let dernierFini = null; // { leconId, uniteId } : étape tout juste finie, animée une fois sur le chemin

// ─── OUTILS ─────────────────────────────────────────────────────────────────
function isParcoursLecon(l) {
  return !!(l && Array.isArray(l.unites) && l.unites.length > 0);
}

function etapeInfo(type) {
  return ETAPES.find(e => e.type === type);
}

// Items d'une unité pour un type d'exercice ('all' = toute la leçon).
// quoi : 'coeur' (sans le « + »), 'plus' (seulement le « + ») ou 'tout' (défaut).
function itemsUnite(lecon, type, uniteId, quoi) {
  let items = lecon[type] || [];
  if (uniteId !== TOUTE_LA_LECON) items = items.filter(x => x.unite === uniteId);
  if (quoi === 'coeur') items = items.filter(x => !x.plus);
  if (quoi === 'plus') items = items.filter(x => x.plus);
  return items;
}

// Nombre d'items (tous types) d'une unité, pour une partie donnée.
function nbItems(lecon, uniteId, quoi) {
  let nb = 0;
  ETAPES.forEach(e => { nb += itemsUnite(lecon, e.type, uniteId, quoi).length; });
  return nb;
}

// Durée estimée en minutes (~12 s par item).
function minutesPour(nb) {
  return Math.max(1, Math.round(nb * 12 / 60));
}

// Unités du fil (sans les unités bonus) : elles seules comptent pour
// « Terminée », les étoiles et « Sans faute ».
function unitesCoeur(l) {
  return l.unites.filter(u => !u.bonus);
}

function trouverItem(lecon, type, id) {
  return (lecon[type] || []).find(x => x.id === id);
}

function trouverUnite(lecon, uniteId) {
  return lecon.unites.find(u => u.id === uniteId);
}

// Nom affiché d'une partie : « unité 2 », « + de l'unité 2 » ou « leçon complète ».
function nomPartie(uniteId, mode) {
  if (uniteId === TOUTE_LA_LECON) return mode === 'plus' ? 'tous les « + »' : 'leçon complète';
  return mode === 'plus' ? '« + » de l\'unité ' + uniteId : 'unité ' + uniteId;
}

function melanger(tableau) {
  return tableau.slice().sort(() => Math.random() - 0.5);
}

function etoiles(percent) {
  if (percent >= 90) return 3;
  if (percent >= 70) return 2;
  if (percent >= 50) return 1;
  return 0;
}

// HTML des 3 étoiles : pleines en or, vides en gris.
function etoilesHtml(nb) {
  return '<span class="pc-star on">' + '★'.repeat(nb) + '</span>' +
         '<span class="pc-star">' + '★'.repeat(3 - nb) + '</span>';
}

// ─── ARTICLE À ÉCRIRE (S5) ──────────────────────────────────────────────────
// Dans une unité dont la notion est l'article ("articleAEcrire": true), le mot
// caché ne montre pas l'article : on écrit l'article ET le mot (« eng Mapp »).
// Ailleurs, l'article reste affiché devant les cases (rien ne change).
function articleAEcrire(lecon, card) {
  if (!card || !card.article || !lecon || !Array.isArray(lecon.unites)) return false;
  const u = lecon.unites.find(x => x.id === card.unite);
  return !!(u && u.articleAEcrire);
}

// Ce qu'on doit taper dans le mot caché.
function motATaper(lecon, card) {
  return articleAEcrire(lecon, card) ? card.article + ' ' + card.lu : card.lu;
}

// La carte telle qu'on la corrige : réponse complète, sans article à part
// (sert au diagnostic « Bon mot, mauvais article » et au masquage de l'aide).
function carteACorriger(lecon, card) {
  if (!articleAEcrire(lecon, card)) return card;
  return Object.assign({}, card, { lu: motATaper(lecon, card), article: null });
}

// Texte luxembourgeois d'un mot caché, avec son article s'il en a un.
function motComplet(card) {
  return (card.article ? card.article + ' ' : '') + card.lu;
}

// Leçon « Sans faute » = toutes les unités du fil réussies sans faute au moins une fois.
function leconSansFaute(l) {
  return isParcoursLecon(l) && unitesCoeur(l).every(u => getSansFaute(l.id, u.id));
}

// Le « + » d'une unité existe-t-il ? (unité bonus : pas de « + », elle est déjà en plus)
function aDuPlus(l, uniteId) {
  return nbItems(l, uniteId, 'plus') > 0;
}

// « 9 mots », « 1 mot », ou « 6 questions » si le « + » n'a pas de mot nouveau.
function textePlus(l, uniteId) {
  const nbMots = itemsUnite(l, 'flashcards', uniteId, 'plus').length;
  if (nbMots) return nbMots + (nbMots > 1 ? ' mots' : ' mot');
  const nb = nbItems(l, uniteId, 'plus');
  return nb + (nb > 1 ? ' questions' : ' question');
}

// Leçon « Complète » = fil terminé + tous les « + » + toutes les unités bonus.
function leconComplete(l) {
  if (!isParcoursLecon(l)) return false;
  return l.unites.every(u => {
    if (getUnitBest(l.id, u.id) == null) return false;
    return !aDuPlus(l, u.id) || getPlusFait(l.id, u.id);
  });
}

// ─── SAUVEGARDE DE LA PARTIE EN COURS ───────────────────────────────────────
// La partie porte sa date de mise à jour (maj) : sur deux appareils, la plus
// récente gagne à la synchronisation (S8).
function saveRun() {
  run.maj = Date.now();
  try { localStorage.setItem(storageKey(RUN_KEY), JSON.stringify(run)); } catch (e) { /* ignore */ }
  if (typeof debounceCloudSave === 'function') debounceCloudSave();
}

// Partie en cours, ou null (aucune, ou finie).
function loadRun() {
  let data = null;
  try { data = JSON.parse(localStorage.getItem(storageKey(RUN_KEY))); } catch (e) { data = null; }
  if (!data || data.fini || !data.steps) return null;
  return data;
}

// Partie finie : marque « finie » datée, comme pour la séance du jour.
function clearRun() {
  try { localStorage.setItem(storageKey(RUN_KEY), JSON.stringify({ fini: true, maj: Date.now() })); } catch (e) { /* ignore */ }
  if (typeof debounceCloudSave === 'function') debounceCloudSave();
}

// ─── RÉSUMÉ D'UNE LEÇON (liste des leçons) ──────────────────────────────────
// Étoiles de la leçon = moyenne des meilleurs scores (unité non faite = 0).
function resumeLecon(l) {
  const unites = unitesCoeur(l);
  let done = 0, somme = 0;
  unites.forEach(u => {
    const best = getUnitBest(l.id, u.id);
    if (best != null) { done++; somme += best; }
  });
  const percent = Math.round(somme / unites.length);
  return { done, total: unites.length, stars: etoiles(percent) };
}

// Pastilles d'une leçon v2 dans la liste : uniquement ce qui est ACQUIS (en or).
// La fraîcheur (« À rafraîchir ») est ajoutée à part, par la liste.
function carteLeconV2Html(l) {
  const r = resumeLecon(l);
  let html = '<span class="lecon-pill">' + r.done + ' / ' + r.total + ' unités</span>';
  // Étoiles de la leçon : seulement quand toutes les unités sont terminées
  // (sinon des étoiles grises donneraient l'impression d'avoir perdu quelque chose).
  if (r.done === r.total) html += '<span class="lecon-pill pc-pill-stars">' + etoilesHtml(r.stars) + '</span>';
  if (leconSansFaute(l)) html += '<span class="lecon-pill pc-pill-sansfaute">Sans faute</span>';
  if (missionReussie(l)) html += '<span class="lecon-pill pc-pill-acquis">Mission ✓</span>';
  if (leconComplete(l)) html += '<span class="lecon-pill pc-pill-acquis">Complète</span>';
  return html;
}

// ─── ÉCRAN DE LA LEÇON (liste des unités) ───────────────────────────────────
// cible (facultatif) : la carte sur laquelle revenir, quand on quitte un
// exercice, une introduction ou la mission. Numéro d'unité, 'all' (toute la
// leçon) ou 'mission'. Sans cible, on arrive en haut de la leçon.
let pRetourScroll = null; // une seule restauration de position à la fois

function openParcoursLecon(l, cible) {
  pLecon = l;
  currentLecon = l;
  marquerLeconVue(l.id); // la 1re visite passe par cet écran (S2)
  fermerClavier();
  // 1re découverte d'une leçon avec mission : l'introduction, jusqu'à confirmation.
  if (cible == null && introMissionAVoir(l)) {
    renderIntroMission();
    showView('view-msintro');
    return;
  }
  renderParcoursLecon();
  showView('view-plecon');
  if (cible != null) allerALaCarte(cible);
}

// Id de la carte d'une unité, de « Toute la leçon » ou de la mission.
function idCarte(cible) {
  if (cible === 'mission') return 'pl-mission';
  if (cible === TOUTE_LA_LECON) return 'pl-toute';
  return 'pl-unite-' + cible;
}

// Texte à mettre dans un onclick : 'all' ou 'mission' entre guillemets, un numéro tel quel.
function cibleJs(cible) {
  return typeof cible === 'number' ? String(cible) : '\'' + cible + '\'';
}

// Fait défiler la page jusqu'à la carte, une fois l'écran dessiné.
function allerALaCarte(cible) {
  if (pRetourScroll) cancelAnimationFrame(pRetourScroll);
  pRetourScroll = requestAnimationFrame(() => {
    pRetourScroll = null;
    const carte = document.getElementById(idCarte(cible));
    if (!carte) return;
    const haut = carte.getBoundingClientRect().top + window.scrollY - 12;
    window.scrollTo(0, Math.max(0, haut));
  });
}

// Partie jouée par « une étape seule » : le cœur pour une unité, tout pour la leçon.
function quoiEtape(uniteId) {
  return uniteId === TOUTE_LA_LECON ? 'tout' : 'coeur';
}

// Boutons d'étape (Mot caché, Quiz…) pour une unité ou pour toute la leçon,
// puis le chip « + » de l'unité (doré et coché quand il est fait).
function chipsEtapes(uniteId) {
  const param = uniteId === TOUTE_LA_LECON ? '\'' + TOUTE_LA_LECON + '\'' : uniteId;
  let html = ETAPES.filter(e => itemsUnite(pLecon, e.type, uniteId, quoiEtape(uniteId)).length).map(e =>
    '<button class="pc-chip" onclick="startEtapeSeule(' + param + ', \'' + e.type + '\')">' + e.label + '</button>'
  ).join('');
  if (uniteId !== TOUTE_LA_LECON && aDuPlus(pLecon, uniteId)) {
    const fait = getPlusFait(pLecon.id, uniteId);
    html += '<button class="pc-chip plus' + (fait ? ' fait' : '') + '" onclick="startUnite(' + uniteId + ', \'plus\')">' +
      (fait ? '✓ ' : '') + '+' + textePlus(pLecon, uniteId) + ' · S\'entraîner</button>';
  }
  return html;
}

function renderParcoursLecon() {
  const l = pLecon;
  const saved = loadRun();
  const runIci = saved && saved.leconId === l.id ? saved : null;
  const revision = resumeRevision([l]).parLecon[l.id];

  document.getElementById('pl-num').textContent = 'LEÇON ' + l.id;
  document.getElementById('pl-titre').textContent = l.titre;
  document.getElementById('pl-sous').textContent =
    l.titre_fr + ' · ' + unitesCoeur(l).length + ' unités';
  document.getElementById('view-plecon').style.setProperty('--lc', l.couleur);

  // Seule la prochaine unité du fil à faire a le bouton principal (jaune).
  const prochaine = runIci ? null : unitesCoeur(l).find(u => getUnitBest(l.id, u.id) == null);

  // ── La mission : la scène qui se remplit au fil des unités ──
  let html = missionHtml(l, !runIci && !prochaine);

  // ── Une carte par unité (fil d'abord, bonus ensuite) ──
  l.unites.forEach(u => {
    html += carteUniteHtml(l, u, runIci, prochaine, revision);
  });

  // ── Toute la leçon : tout le contenu d'un coup, une étape, révision ──
  const nbTout = nbItems(l, TOUTE_LA_LECON, 'tout');
  html += '<div class="pl-unit pl-toute" id="pl-toute">';
  html += '<div class="pl-unit-top"><div>' +
    '<div class="pc-mini-label">TOUTE LA LEÇON' +
      (leconComplete(l) ? ' · <span class="pc-gold">COMPLÈTE</span>' : '') + '</div>' +
    '<div class="pl-unit-titre">Tout le contenu d\'un coup</div></div></div>' +
    '<div class="pl-unit-mots">Le fil et tous les « + »' + (l.unites.some(u => u.bonus) ? ', bonus compris' : '') + ' · ' + nbTout +
      ' questions · environ ' + minutesPour(nbTout) + ' min</div>';
  if (runIci && runIci.uniteId === TOUTE_LA_LECON) {
    html += '<div class="pc-steps">' + segmentsHtml(runIci) + '</div>' +
      '<button class="pc-btn primary wide" onclick="reprendreRun()">Continuer la leçon complète</button>';
  } else {
    html += '<button class="pc-btn wide" onclick="startUnite(\'' + TOUTE_LA_LECON + '\', \'lecon\')">Leçon complète</button>';
  }
  html += '<div class="pl-unit-actions">' + chipsEtapes(TOUTE_LA_LECON) +
    '<button class="pc-chip" onclick="toutRevoir()">Tout revoir</button>' +
    (revision.dus ? '<button class="pc-chip fraicheur" onclick="rafraichirLecon()">Rafraîchir · ' + revision.dus + '</button>' : '') +
    '</div></div>';

  // Bilan : toujours ouvert.
  html += '<div class="pl-unit pl-bilan">' +
    '<div class="pl-unit-titre">Bilan de la leçon</div>' +
    '<div class="pl-unit-mots">10 questions mélangées sur le fil de la leçon</div>' +
    '<button class="pc-btn wide" onclick="lancerBilan()">Lancer le bilan</button></div>';

  document.getElementById('pl-units').innerHTML = html;
}

// Carte d'une unité dans l'écran de la leçon.
function carteUniteHtml(l, u, runIci, prochaine, revision) {
  const best = getUnitBest(l.id, u.id);
  const sansFaute = getSansFaute(l.id, u.id);
  const enCours = runIci && runIci.uniteId === u.id;
  const nbDus = revision.dusParUnite[u.id] || 0;

  let etat = '';
  if (enCours) etat = ' · EN COURS';
  else if (sansFaute) etat = ' · <span class="pc-gold">SANS FAUTE</span>';
  else if (best != null) etat = ' · TERMINÉE';
  else if (!u.bonus && leconValideeParMission(l.id)) etat = ' · <span class="pl-validee">✓ VALIDÉE PAR LA MISSION</span>'; // S10 : gris, pas doré

  const mots = itemsUnite(l, 'flashcards', u.id, 'coeur');
  let apercu = mots.slice(0, 4).map(c => escHtml(c.lu)).join(' · ');
  if (mots.length > 4) apercu += ' · +' + (mots.length - 4);

  const label = u.bonus ? 'BONUS' : 'UNITÉ ' + u.id;
  let html = '<div class="pl-unit' + (enCours ? ' en-cours' : '') + (u.bonus ? ' bonus' : '') + '" id="pl-unite-' + u.id + '">';
  html += '<div class="pl-unit-top"><div>' +
    '<div class="pc-mini-label">' + label + etat + '</div>' +
    '<div class="pl-unit-titre">' + escHtml(u.titre) + '</div></div>' +
    (best != null ? '<div class="pl-unit-stars">' + etoilesHtml(etoiles(best)) + '</div>' : '') +
    '</div>';
  if (u.phrase) html += '<div class="pl-unit-phrase">' + escHtml(u.phrase[0]) + '</div>';
  html += '<div class="pl-unit-mots">' + apercu + '</div>';
  if (nbDus) html += '<div class="pl-fraicheur">À rafraîchir · ' + nbDus + '</div>';

  if (enCours) {
    html += '<div class="pc-steps">' + segmentsHtml(runIci) + '</div>';
    html += '<button class="pc-btn primary wide" onclick="reprendreRun()">Continuer</button>';
  } else {
    const classe = prochaine && prochaine.id === u.id ? 'pc-btn primary wide' : 'pc-btn wide';
    html += '<button class="' + classe + '" onclick="openIntro(' + u.id + ')">' +
      (best == null ? 'Commencer' : 'Refaire l\'unité') + '</button>';
  }
  // Les étapes seules et le « + » sont toujours disponibles.
  html += '<div class="pl-unit-actions">' + chipsEtapes(u.id) + '</div>';
  html += '</div>';
  return html;
}

// "Tout revoir" : l'écran Réviser, avec seulement cette leçon cochée.
function toutRevoir() {
  openReviewSetup(pLecon.id);
}

// Retour à l'écran de la leçon depuis une session (bilan, rafraîchir).
function retourLecon() {
  return [{ label: 'Retour à la leçon', primary: true, fn: () => openParcoursLecon(pLecon) }];
}

function lancerBilan() {
  const pool = itemsRevision(pLecon).filter(i =>
    i.type !== 'motcache' && !i.q.plus && !trouverUnite(pLecon, i.q.unite).bonus);
  demarrerSession('review', 'BILAN · LEÇON ' + pLecon.id, melanger(pool).slice(0, 10), { actions: retourLecon() });
}

// Révise tout ce qui est dû dans cette leçon (la fraîcheur remonte).
function rafraichirLecon() {
  const dus = resumeRevision([pLecon]).dus;
  demarrerSession('review', 'RAFRAÎCHIR · LEÇON ' + pLecon.id, dus, { actions: retourLecon() });
}

// ─── ÉCRAN "AVANT DE COMMENCER" ─────────────────────────────────────────────
// Ordre : la phrase de l'unité, la règle, les pièges, les mots du cœur,
// puis le « + » replié (même phrase, plus de mots).
let pIntroUnite = null; // unité de l'écran « Avant de commencer » (pour la croix)

function openIntro(uniteId) {
  pIntroUnite = uniteId;
  fermerClavier();
  const u = trouverUnite(pLecon, uniteId);
  const mots = itemsUnite(pLecon, 'flashcards', uniteId, 'coeur');
  const motsPlus = itemsUnite(pLecon, 'flashcards', uniteId, 'plus');
  const minutes = minutesPour(nbItems(pLecon, uniteId, 'coeur'));

  let html = '<div class="pc-mini-label pc-accent">' + (u.bonus ? 'BONUS' : 'UNITÉ ' + u.id) +
    ' · CE QUE TU VAS APPRENDRE</div>' +
    '<h1 class="pi-titre">' + escHtml(u.titre) + '</h1>';

  // La phrase de l'unité : c'est elle qu'on saura dire à la fin.
  if (u.phrase) {
    html += '<div class="pi-phrase"><div class="pc-mini-label">LA PHRASE DE L\'UNITÉ</div>' +
      '<div class="pi-phrase-lu">' + escHtml(u.phrase[0]) + '</div>' +
      '<div class="pi-phrase-fr">' + escHtml(u.phrase[1]) + '</div></div>';
  }

  if (u.regle) {
    html += '<div class="pi-regle"><div class="pc-mini-label pc-gold">LA RÈGLE</div>' +
      '<div class="pi-regle-txt">' + u.regle + '</div>' +
      (u.exemple ? '<div class="pi-regle-ex">' + u.exemple + '</div>' : '') + '</div>';
  }

  // Points d'attention de l'unité (les pièges les plus fréquents).
  if (u.pieges && u.pieges.length) {
    html += '<div class="pi-piege"><div class="pc-mini-label pc-orange">ATTENTION</div>' +
      u.pieges.map(p => '<div class="pi-piege-txt">' + p + '</div>').join('') + '</div>';
  }

  if (mots.length) {
    html += '<div class="pc-mini-label">LES MOTS</div><div class="pi-mots">' + motsHtml(mots) + '</div>';
  }

  // Le « + » : replié, à lire si on veut. Il se joue après l'unité (« Élargir »).
  if (motsPlus.length) {
    html += '<details class="pi-plus"><summary>Voir les ' + motsPlus.length + ' mots supplémentaires</summary>' +
      '<div class="pi-mots">' + motsHtml(motsPlus) + '</div>' +
      '<div class="pi-plus-note">Même phrase, d\'autres mots. Tu pourras t\'entraîner avec eux après l\'unité.</div></details>';
  }

  if (u.phrases && u.phrases.length) {
    html += '<div class="pc-mini-label">EXEMPLES</div><div class="pi-phrases">' +
      u.phrases.map(p => '<div><b>' + escHtml(p[0]) + '</b> <span>· ' + escHtml(p[1]) + '</span></div>').join('') +
      '</div>';
  }

  html += '<div class="pi-bas"><div class="pi-duree">4 étapes · environ ' + minutes + ' min</div>' +
    '<button class="pc-btn primary wide big" onclick="startUnite(' + u.id + ')">Commencer</button></div>';

  document.getElementById('pi-content').innerHTML = html;
  showView('view-pintro');
}

// Retour depuis « Avant de commencer » : l'écran d'où on est parti, sur cette unité.
function fermerIntro() {
  retour();
}

function motsHtml(mots) {
  return mots.map(c => '<div class="pi-mot"><b>' + escHtml(motComplet(c)) + '</b><span>' +
    escHtml(c.fr) + '</span></div>').join('');
}

// ─── DÉMARRER / REPRENDRE UNE PARTIE ────────────────────────────────────────
// uniteId : numéro d'unité, ou 'all' pour toute la leçon
// mode    : 'unite'   (le cœur de l'unité : étoiles + sans faute)
//           'plus'    (le « + » de l'unité, ou de toute la leçon avec 'all')
//           'lecon'   (tout le contenu d'un coup : étoiles, sans faute et « + » de chaque unité)
//           'erreurs' (refaire ses erreurs) · 'etape' (une seule étape)
// filtre  : liste de clés "type:id" à garder (null = tout)
function startUnite(uniteId, mode, filtre) {
  mode = mode || 'unite';
  let quoi = 'tout';
  if (mode === 'unite') quoi = 'coeur';
  if (mode === 'plus') quoi = 'plus';
  const steps = [];
  ETAPES.forEach(e => {
    let items = itemsUnite(pLecon, e.type, uniteId, quoi);
    if (filtre) items = items.filter(x => filtre.includes(e.type + ':' + x.id));
    if (!items.length) return;
    steps.push({
      type: e.type,
      queue: melanger(items).map(x => x.id), // ids restants, le 1er est affiché
      total: items.length,
      scores: {},  // id -> score du premier passage (0 à 1)
      details: {}  // id -> { ok, indices, essais, revele }
    });
  });
  if (!steps.length) return;

  run = { leconId: pLecon.id, uniteId, mode, steps, stepIdx: 0 };
  saveRun();
  showView('view-parcours');
  renderItem();
}

function startEtapeSeule(uniteId, type) {
  const cles = itemsUnite(pLecon, type, uniteId, quoiEtape(uniteId)).map(x => type + ':' + x.id);
  startUnite(uniteId, 'etape', cles);
}

function reprendreRun() {
  const saved = loadRun();
  if (!saved) return;
  const l = lecons.find(x => x.id === saved.leconId);
  if (!isParcoursLecon(l)) { clearRun(); return; }
  pLecon = l;
  currentLecon = l;
  run = saved;
  showView('view-parcours');
  renderItem();
}

// Flèche Retour (ou bouton Retour du téléphone) : la partie reste sauvegardée,
// on revient à l'écran d'où on est parti (chemin ou leçon), sur cette unité.
function quitterParcours() {
  clearTimeout(pTimer);
  pAttente = false;
  retour();
}

// ─── AFFICHAGE D'UN ITEM ────────────────────────────────────────────────────
// HTML des segments de progression (un par étape).
function segmentsHtml(r) {
  return r.steps.map((s, i) => {
    let largeur = 0;
    if (i < r.stepIdx) largeur = 100;
    else if (i === r.stepIdx) largeur = Math.round((s.total - s.queue.length) / s.total * 100);
    const fini = i < r.stepIdx ? ' fini' : '';
    return '<div class="pc-seg' + fini + '"><div style="width:' + largeur + '%"></div></div>';
  }).join('');
}

// Met à jour la barre de progression de la partie. Si les segments existent
// déjà, on change seulement leur largeur : la barre avance en douceur (S12).
function majSegments(r) {
  const box = document.getElementById('pc-steps');
  if (box.children.length !== r.steps.length) {
    box.innerHTML = segmentsHtml(r);
    return;
  }
  r.steps.forEach((s, i) => {
    let largeur = 0;
    if (i < r.stepIdx) largeur = 100;
    else if (i === r.stepIdx) largeur = Math.round((s.total - s.queue.length) / s.total * 100);
    box.children[i].className = 'pc-seg' + (i < r.stepIdx ? ' fini' : '');
    box.children[i].firstChild.style.width = largeur + '%';
  });
}

function etapeCourante() {
  return run.steps[run.stepIdx];
}

function renderItem() {
  clearTimeout(pTimer);
  pAttente = false;
  pSuite = null;

  const step = etapeCourante();
  if (!step) { finirRun(); return; }

  // Étape terminée -> étape suivante.
  if (!step.queue.length) {
    run.stepIdx++;
    saveRun();
    renderItem();
    return;
  }

  // Item supprimé du fichier depuis la sauvegarde -> on le saute.
  const item = trouverItem(pLecon, step.type, step.queue[0]);
  if (!item) {
    step.queue.shift();
    saveRun();
    renderItem();
    return;
  }

  // En-tête : segments, nom de l'étape, compteur.
  majSegments(run);
  const resolus = step.total - step.queue.length;
  const aRefaire = step.queue.filter(id => step.scores[id] !== undefined).length;
  document.getElementById('pc-etape').textContent =
    'Étape ' + (run.stepIdx + 1) + ' · ' + etapeInfo(step.type).label;
  document.getElementById('pc-compteur').innerHTML =
    Math.min(resolus + 1, step.total) + ' / ' + step.total +
    (aRefaire ? ' <span class="pc-refaire">· +' + aRefaire + ' à refaire</span>' : '');

  document.getElementById('pc-feedback').className = 'pc-feedback hidden';

  if (step.type === 'flashcards') renderMotCache(item);
  else if (step.type === 'quiz') renderQuizP(item);
  else if (step.type === 'trous') renderTrouP(item);
  else renderEcriturePc(item);
  // L'item arrive en glissant (S12) : on relance l'animation à chaque item.
  const corps = document.getElementById('pc-body');
  corps.classList.remove('glisse');
  void corps.offsetWidth;
  corps.classList.add('glisse');
  window.scrollTo(0, 0);
}

// ─── RÉPONSES : ENREGISTRER, RÉUSSIR, ÉCHOUER ───────────────────────────────
// Enregistre le score du PREMIER passage seulement.
// ok = réussi du premier coup, sans aide (alimente niveaux et stats).
function enregistrer(item, score, ok, details) {
  const step = etapeCourante();
  if (step.scores[item.id] !== undefined) return; // déjà noté (item qui revient)
  step.scores[item.id] = score;
  step.details[item.id] = Object.assign({ ok }, details || {});
  updateQuestionProgress(run.leconId, etapeInfo(step.type).stat, item.id, ok);
  saveRun();
}

// Juste : l'item sort de la file.
function reussir() {
  etapeCourante().queue.shift();
  saveRun();
  renderItem();
}

// Faux : l'item repart à la fin de la file.
function echouer() {
  const step = etapeCourante();
  step.queue.push(step.queue.shift());
  saveRun();
  renderItem();
}

// Point d'attention d'un item : champ "attention", sinon la note d'un trou.
function attentionItem(item, type) {
  if (item.attention) return item.attention;
  if (type === 'trous' && item.note) return item.note;
  return '';
}

// Bloc « Attention : … » ajouté aux messages d'erreur.
function attentionHtml(texte) {
  return texte ? '<div class="pc-attention">Attention : ' + texte + '</div>' : '';
}

// Bandeau du bas : "Juste !" ou "Pas encore", avec un bouton Continuer.
function showFeedback(ok, titre, texteHtml, suite) {
  fermerClavier(); // la correction doit être visible, pas cachée par le clavier
  pAttente = true;
  pSuite = suite;
  const fb = document.getElementById('pc-feedback');
  fb.className = 'pc-feedback ' + (ok ? 'ok' : 'ko');
  const coche = ok ? '<svg class="coche-anim" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>' : '';
  fb.innerHTML =
    '<div class="pc-fb-titre">' + coche + titre + '</div>' +
    (texteHtml ? '<div class="pc-fb-txt">' + texteHtml + '</div>' : '') +
    '<button class="pc-btn wide ' + (ok ? 'ok' : 'ko') + '" id="pc-continuer" onclick="continuerParcours()">Continuer</button>';
  document.getElementById('pc-continuer').focus({ preventScroll: true });
}

function continuerParcours() {
  if (!pAttente || !pSuite) return;
  const suite = pSuite;
  pAttente = false;
  pSuite = null;
  suite();
}

// ─── ÉTAPE 1 : MOT CACHÉ ────────────────────────────────────────────────────
function estLettre(ch) {
  return /[a-z0-9]/.test(normalize(ch));
}

// Étape 1 : découvrir le mot, puis le reconstruire avec des lettres mélangées.
//   1. Mot jamais vu : on le montre d'abord (français + luxembourgeois), aussi
//      longtemps qu'on veut. Le but est d'introduire le vocabulaire, pas de
//      faire deviner un mot inconnu au hasard.
//   2. « À toi de reconstruire » : le mot est caché, on le recompose en
//      touchant des lettres mélangées (celles du mot + 2 ou 3 intruses).
//      Pas de clavier du téléphone. Avec un vrai clavier (ordinateur), on peut
//      aussi taper les lettres.
// Un mot déjà vu passe directement à la reconstruction.
function renderMotCache(card) {
  // Une case par caractère. Espaces, apostrophes et tirets sont déjà affichés.
  mc = {
    card,
    cases: motATaper(pLecon, card).split('').map(ch => ({ ch, lettre: estLettre(ch), etat: '' })),
    tuiles: [],   // lettres proposées : [{ ch }]
    indices: 0,   // lettres révélées avec le bouton Indice (coûtent des points)
    essais: 0,    // essais ratés
    revele: false // "Voir la réponse" utilisé
  };
  if (motDejaVu(card)) renderReconstruction();
  else renderDecouverte();
}

// A-t-on déjà travaillé ce mot (dans une partie précédente, ou plus tôt dans celle-ci) ?
function motDejaVu(card) {
  const parLecon = getStatsStore()[pLecon.id];
  const stat = parLecon && parLecon.motcache && parLecon.motcache[card.id];
  return !!(stat && stat.attempts);
}

function renderDecouverte() {
  const card = mc.card;
  document.getElementById('pc-body').innerHTML =
    '<div class="mc-top">' +
      '<div class="pc-mini-label pc-gold">NOUVEAU MOT</div>' +
      '<div class="mc-fr">' + escHtml(card.fr) + '</div>' +
    '</div>' +
    '<div class="mc-decouverte">' +
      '<div class="mc-decouverte-lu">' + escHtml(motComplet(card)) + '</div>' +
      (card.note ? '<div class="mc-decouverte-note">' + escHtml(card.note) + '</div>' : '') +
    '</div>' +
    '<div class="mc-saisie">' +
      '<div class="mc-info">Regarde bien le mot : tu vas le reconstruire.</div>' +
      '<button class="pc-btn primary wide" id="mc-btn-reconstruire" onclick="renderReconstruction()">À toi de reconstruire →</button>' +
    '</div>';
  document.getElementById('mc-btn-reconstruire').focus({ preventScroll: true }); // Entrée = continuer (ordinateur)
}

function renderReconstruction() {
  const card = mc.card;
  const nbLettres = mc.cases.filter(c => c.lettre).length;
  mc.tuiles = nouvellesTuiles();

  // Une zone de saisie invisible est posée sur les cases. inputmode="none" :
  // le clavier du téléphone ne s'ouvre pas, on touche les lettres proposées.
  // C'est un <textarea> : Chrome et Brave n'y affichent pas leur barre
  // d'autoremplissage (mots de passe, carte, adresse).
  document.getElementById('pc-body').innerHTML =
    '<div class="mc-top">' +
      '<div class="pc-mini-label">RECONSTRUIS LE MOT</div>' +
      '<div class="mc-fr">' + escHtml(card.fr) + '</div>' +
      (card.indice ? '<div class="mc-indice">' + escHtml(card.indice) + '</div>' : '') +
    '</div>' +
    '<div class="mc-milieu">' +
    '<div class="mc-mot" id="mc-mot">' +
      (card.article && !articleAEcrire(pLecon, card) ? '<span class="mc-article">' + escHtml(card.article) + '</span>' : '') +
      '<div class="mc-cases" id="mc-cases"></div>' +
      '<textarea id="mc-input" class="mc-input" rows="1" inputmode="none" aria-label="Ta réponse en luxembourgeois"' +
        ' enterkeyhint="done" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false"></textarea>' +
    '</div>' +
    '<div class="mc-legende hidden" id="mc-legende">' +
      '<span><i class="mc-dot vert"></i>bien placée · gratuit</span>' +
      '<span><i class="mc-dot indice"></i>indice · coûte des points</span>' +
    '</div>' +
    '<div class="mc-lettres" id="mc-lettres"></div>' +
    '<div class="mc-info" id="mc-info">' + nbLettres + ' lettres</div>' +
    '<div class="mc-erreur hidden" id="mc-erreur"></div>' +
    '</div>' +
    '<div class="mc-saisie">' +
    '<div class="mc-score">Score du mot : <b id="mc-score">100 %</b></div>' +
    '<div class="pc-actions mc-actions">' +
      '<button class="pc-btn mc-effacer" id="mc-btn-effacer" aria-label="Effacer la dernière lettre" onclick="mcEffacer()">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 5H8l-6 7 6 7h13a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1z"/><path d="m16 9-5 6M11 9l5 6"/></svg></button>' +
      '<button class="pc-btn" id="mc-btn-indice" onclick="mcIndice()">Indice</button>' +
      '<button class="pc-btn primary" id="mc-btn-valider" onclick="mcValider()">Valider</button>' +
    '</div>' +
    '<button class="pc-btn ghost wide hidden" id="mc-btn-voir" onclick="mcVoirReponse()">Voir la réponse</button>' +
    '</div>';

  const input = document.getElementById('mc-input');
  input.addEventListener('keydown', e => {
    if (e.key === 'Backspace' && !input.value) { e.preventDefault(); return; }
    if (e.key !== 'Enter') return;
    e.preventDefault();
    e.stopPropagation(); // évite que le listener global relance "Continuer"
    if (pAttente) continuerParcours();
    else mcValider();
  });
  input.addEventListener('input', mcSaisie);
  input.addEventListener('focus', mcMajFocus);
  input.addEventListener('blur', mcMajFocus);
  renderCases();
  focusSiClavierPhysique(input); // ordinateur : on peut taper les lettres
  mcMajFocus();
}

// Lettres proposées : celles des cases encore à remplir, plus 2 intruses
// (3 pour un mot de 6 lettres ou plus), dans le désordre.
const LETTRES_INTRUSES = 'aeinrstuldghm';
function nouvellesTuiles() {
  const tuiles = mcCasesLettres().libres.map(i => ({ ch: mc.cases[i].ch }));
  const nbIntruses = tuiles.length >= 6 ? 3 : 2;
  for (let k = 0; k < nbIntruses && tuiles.length; k++) {
    tuiles.push({ ch: LETTRES_INTRUSES[Math.floor(Math.random() * LETTRES_INTRUSES.length)] });
  }
  return melanger(tuiles);
}

// Quelles lettres proposées sont déjà posées dans les cases ?
// Chaque lettre tapée « utilise » la première lettre proposée identique.
function tuilesUtilisees() {
  const utilisees = mc.tuiles.map(() => false);
  mcLettresTapees().forEach(lettre => {
    const k = mc.tuiles.findIndex((t, i) => !utilisees[i] && normalize(t.ch) === normalize(lettre));
    if (k !== -1) utilisees[k] = true;
  });
  return utilisees;
}

function renderTuiles() {
  const box = document.getElementById('mc-lettres');
  if (!box) return;
  const input = document.getElementById('mc-input');
  const fini = !input || input.disabled;
  const utilisees = tuilesUtilisees();
  box.innerHTML = fini ? '' : mc.tuiles.map((t, i) =>
    '<button class="mc-tuile' + (utilisees[i] ? ' utilisee' : '') + '"' + (utilisees[i] ? ' disabled' : '') +
      ' onclick="mcPoserLettre(' + i + ')">' + escHtml(t.ch) + '</button>').join('');
}

// Toucher une lettre : elle va dans la première case vide.
function mcPoserLettre(i) {
  if (pAttente) return;
  const input = document.getElementById('mc-input');
  if (!input || input.disabled || tuilesUtilisees()[i]) return;
  input.value = mcLettresTapees().join('') + mc.tuiles[i].ch;
  mcSaisie();
}

// ⌫ : retire la dernière lettre posée.
function mcEffacer() {
  const input = document.getElementById('mc-input');
  if (!input || input.disabled) return;
  input.value = mcLettresTapees().slice(0, -1).join('');
  renderCases();
}

// Les lettres tapées (espaces et ponctuation retirés : ils sont déjà affichés).
function mcLettresTapees() {
  return document.getElementById('mc-input').value.split('').filter(estLettre);
}

// Index des cases-lettres, et de celles encore à remplir (ni vertes, ni indices).
function mcCasesLettres() {
  const toutes = [], libres = [];
  mc.cases.forEach((c, i) => {
    if (!c.lettre) return;
    toutes.push(i);
    if (c.etat === '') libres.push(i);
  });
  return { toutes, libres };
}

// Lettre tapée pour chaque case : { indexCase: lettre }.
// Normalement on remplit seulement les cases libres. Si la personne a tapé
// (ou collé) le mot entier, on le répartit sur toutes les cases.
function mcLettresParCase() {
  const lettres = mcLettresTapees();
  const { toutes, libres } = mcCasesLettres();
  const cible = lettres.length > libres.length ? toutes : libres;
  const parCase = {};
  cible.forEach((i, k) => { if (k < lettres.length) parCase[i] = lettres[k]; });
  return parCase;
}

// À chaque frappe : on nettoie le champ et on redessine les cases.
function mcSaisie() {
  const input = document.getElementById('mc-input');
  // Entrée tapée sur certains claviers Android : on valide.
  if (input.value.indexOf('\n') !== -1) {
    input.value = input.value.replace(/\n/g, '');
    if (pAttente) continuerParcours();
    else mcValider();
    return;
  }
  const max = mcCasesLettres().toutes.length;
  const propre = mcLettresTapees().slice(0, max).join('');
  // On ne réécrit le champ que si besoin (sinon le clavier perd sa saisie en cours).
  if (input.value !== propre) input.value = propre;
  renderCases();
}

function mcMajFocus() {
  const input = document.getElementById('mc-input');
  const mot = document.getElementById('mc-mot');
  if (!input || !mot) return;
  const actif = document.activeElement === input && !input.disabled;
  mot.classList.toggle('focus', actif);
  const nb = mcCasesLettres().toutes.length;
  document.getElementById('mc-info').textContent = nb + ' lettres' + (input.disabled ? '' : ' · touche les lettres dans l\'ordre');
  renderCases();
}

function renderCases() {
  const nbLettres = mc.cases.filter(c => c.lettre).length;
  const taille = nbLettres > 12 ? ' xs' : nbLettres > 9 ? ' sm' : '';
  const input = document.getElementById('mc-input');
  const parCase = input ? mcLettresParCase() : {};
  // Curseur : la première case libre encore vide (seulement si on peut écrire).
  let curseur = -1;
  if (input && !input.disabled && document.activeElement === input) {
    curseur = mcCasesLettres().libres.find(i => parCase[i] === undefined);
    if (curseur === undefined) curseur = -1;
  }
  // Les cases d'un même mot restent groupées : on ne passe à la ligne
  // qu'entre deux mots (jamais au milieu, ex. « Owen / d! »).
  let html = '<span class="mc-groupe">';
  mc.cases.forEach((c, i) => {
    if (!c.lettre) {
      html += c.ch === ' ' ? '</span><span class="mc-espace"></span><span class="mc-groupe">'
                           : '<span class="mc-sep">' + escHtml(c.ch) + '</span>';
      return;
    }
    let texte = '';
    let classe = 'mc-case ' + c.etat + taille;
    if (parCase[i] !== undefined) { texte = parCase[i]; classe += ' tapee'; }
    else if (c.etat !== '') texte = c.ch;
    if (i === curseur) classe += ' curseur';
    html += '<span class="' + classe + '">' + escHtml(texte) + '</span>';
  });
  document.getElementById('mc-cases').innerHTML = html + '</span>';
  renderTuiles();
}

// Score du mot = lettres non révélées par indice / nombre de lettres.
// Les lettres vertes (trouvées en tapant) restent gratuites.
function mcScore() {
  if (mc.revele) return 0;
  const nb = mc.cases.filter(c => c.lettre).length;
  return (nb - mc.indices) / nb;
}

function mcMajScore() {
  document.getElementById('mc-score').textContent = Math.round(mcScore() * 100) + ' %';
}

function mcIndice() {
  if (pAttente) return;
  const input = document.getElementById('mc-input');
  const { toutes, libres } = mcCasesLettres();
  if (!libres.length) return;

  const i = libres[Math.floor(Math.random() * libres.length)];
  // Si une lettre était déjà tapée dans cette case, on la retire du champ :
  // les autres lettres tapées restent dans leur case.
  const lettres = mcLettresTapees();
  if (lettres.length <= libres.length) {
    const position = libres.indexOf(i);
    if (position < lettres.length) lettres.splice(position, 1);
    input.value = lettres.join('');
  }
  mc.cases[i].etat = 'indice';
  mc.indices++;
  mc.tuiles = nouvellesTuiles();
  renderCases();
  mcMajScore();
  document.getElementById('mc-legende').classList.remove('hidden');
  if (libres.length === 1) document.getElementById('mc-btn-indice').disabled = true;
  focusSiClavierPhysique(input);
}

function mcValider() {
  if (pAttente) return;
  const input = document.getElementById('mc-input');
  if (!mcLettresTapees().length) { input.focus(); return; }
  const card = mc.card;

  // Le mot proposé = cases remplies (vertes, indices et lettres tapées).
  const parCase = mcLettresParCase();
  let val = '', essaiAffiche = '';
  mc.cases.forEach((c, i) => {
    if (!c.lettre) { val += c.ch; essaiAffiche += c.ch; return; }
    const lettre = parCase[i] !== undefined ? parCase[i] : (c.etat !== '' ? c.ch : '');
    val += lettre;
    essaiAffiche += lettre || '_';
  });

  // Juste (même comparaison que l'écriture : accents et ponctuation ignorés).
  if (normalize(val) === normalize(motATaper(pLecon, card))) {
    mc.cases.forEach(c => { if (c.lettre) c.etat = 'vert'; });
    input.value = '';
    input.disabled = true;
    renderCases();
    mcMajFocus();
    document.getElementById('mc-cases').classList.add('juste');
    const ok = !mc.revele && mc.indices === 0 && mc.essais === 0;
    enregistrer(card, mcScore(), ok, { indices: mc.indices, essais: mc.essais, revele: mc.revele });
    // Juste : le point d'attention complet, pour retenir le piège (S6).
    showFeedback(true, 'Bien joué !', '<b>' + escHtml(motComplet(card)) + '</b> = ' + escHtml(card.fr) +
      (card.note ? '<br>' + escHtml(card.note) : '') + attentionHtml(attentionItem(card, 'flashcards')), reussir);
    return;
  }

  // Faux : les lettres bien placées passent en vert, gratuitement.
  mc.essais++;
  mc.cases.forEach((c, i) => {
    if (c.lettre && c.etat === '' && parCase[i] !== undefined && normalize(parCase[i]) === normalize(c.ch)) {
      c.etat = 'vert';
    }
  });
  input.value = '';
  mc.tuiles = nouvellesTuiles();
  renderCases();
  document.getElementById('mc-legende').classList.remove('hidden');

  // Message d'erreur : au 1er essai, diagnostic + point d'attention SANS la
  // réponse ; ensuite, le point d'attention complet (S6).
  const err = document.getElementById('mc-erreur');
  err.classList.remove('hidden');
  err.innerHTML = '<b>Pas encore</b> · Ton essai : ' + escHtml(essaiAffiche) + ' · essai ' + mc.essais +
    aideErreurHtml(val, carteACorriger(pLecon, card), attentionItem(card, 'flashcards'), mc.essais);

  if (mc.essais >= ESSAIS_AVANT_REPONSE) {
    document.getElementById('mc-btn-voir').classList.remove('hidden');
  }

  // Petite secousse pour signaler l'erreur.
  const cases = document.getElementById('mc-cases');
  cases.classList.remove('shake');
  void cases.offsetWidth;
  cases.classList.add('shake');

  // Le clavier se ferme pour laisser voir l'aide ; on touche les cases pour réessayer.
  fermerClavier();
  focusSiClavierPhysique(input);
  mcMajFocus();
}

function mcVoirReponse() {
  if (pAttente) return;
  mc.revele = true;
  mc.cases.forEach(c => { if (c.lettre && c.etat === '') c.etat = 'indice'; });
  const input = document.getElementById('mc-input');
  input.value = '';
  input.disabled = true;
  renderCases();
  mcMajFocus();
  mcMajScore();
  enregistrer(mc.card, 0, false, { indices: mc.indices, essais: mc.essais, revele: true });
  showFeedback(false, 'La réponse : ' + escHtml(motComplet(mc.card)),
    attentionHtml(attentionItem(mc.card, 'flashcards')) + 'Ce mot reviendra à la fin de l\'étape.', echouer);
}

// ─── ÉTAPES 2 ET 3 : QUIZ ET TROUS (choix multiples) ────────────────────────
function renderQuizP(q) {
  // Si un distracteur est identique à la réponse, on le remplace (comme le quiz v1).
  const choix = melanger(q.distracteurs.map(d => d === q.reponse ? '—' : d).concat([q.reponse]));
  document.getElementById('pc-body').innerHTML =
    '<div class="pc-question">' +
      '<div class="pc-mini-label">' + escHtml(q.label || 'CHOISIS') + '</div>' +
      '<div class="pc-question-mot">' + escHtml(q.question) + '</div>' +
    '</div>' +
    '<div class="choices" id="pc-choix"></div>';
  construireChoix(choix, q.reponse, q, 'quiz');
}

function renderTrouP(t) {
  const avant = t.avant ? escHtml(t.avant) + ' ' : '';
  const apres = t.apres ? ' ' + escHtml(t.apres) : '';
  document.getElementById('pc-body').innerHTML =
    '<div class="pc-question">' +
      '<div class="pc-mini-label">COMPLÈTE</div>' +
      '<div class="pc-trou-fr">' + escHtml(t.fr) + '</div>' +
      '<div class="pc-trou-phrase">' + avant + '<span class="trou-blank" id="pc-blank">___</span>' + apres + '</div>' +
    '</div>' +
    '<div class="choices pc-choix-grille" id="pc-choix"></div>';
  construireChoix(melanger(t.choix), t.trou, t, 'trous');
}

function construireChoix(choix, bonne, item, type) {
  const box = document.getElementById('pc-choix');
  choix.forEach(texte => {
    const btn = document.createElement('button');
    btn.className = 'choice';
    btn.textContent = texte;
    btn.addEventListener('click', () => choisirP(btn, texte === bonne, bonne, item, type));
    box.appendChild(btn);
  });
}

function choisirP(btn, ok, bonne, item, type) {
  if (pAttente) return;
  pAttente = true;
  document.querySelectorAll('#pc-choix .choice').forEach(b => {
    b.disabled = true;
    if (b.textContent === bonne) b.classList.add('correct');
  });
  if (!ok) btn.classList.add('wrong');

  const blank = document.getElementById('pc-blank');
  if (blank) {
    blank.textContent = bonne;
    blank.style.color = ok ? 'var(--correct)' : 'var(--wrong)';
  }

  enregistrer(item, ok ? 1 : 0, ok);

  if (ok) {
    // Juste : la note du trou s'affiche discrètement, puis on passe à la suite.
    const note = type === 'trous' ? item.note : '';
    pTimer = setTimeout(reussir, note ? 1500 : 900);
    if (note) {
      const fb = document.getElementById('pc-feedback');
      fb.className = 'pc-feedback ok discret';
      fb.innerHTML = '<div class="pc-fb-txt">' + escHtml(note) + '</div>';
    }
  } else {
    showFeedback(false, 'Pas encore',
      'La bonne réponse : <b>' + escHtml(bonne) + '</b>' +
      attentionHtml(attentionItem(item, type)) +
      'Cette question reviendra à la fin de l\'étape.', echouer);
  }
}

// ─── ÉTAPE 4 : ÉCRITURE ─────────────────────────────────────────────────────
let ecrEssais = 0; // essais ratés sur la phrase en cours

function renderEcriturePc(e) {
  ecrEssais = 0;
  document.getElementById('pc-body').innerHTML =
    '<div class="pc-question">' +
      '<div class="pc-mini-label">ÉCRIS EN LUXEMBOURGEOIS</div>' +
      '<div class="pc-question-mot">' + escHtml(e.fr) + '</div>' +
    '</div>' +
    '<div class="mc-erreur hidden" id="pc-ecr-erreur"></div>' +
    '<label class="pc-input-label" for="pc-ecr-input">Ta réponse</label>' +
    '<textarea id="pc-ecr-input" class="ecr-input" rows="2" placeholder="Tape ta réponse…"' +
      ' autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false"></textarea>' +
    '<div class="pc-actions"><button class="pc-btn primary wide" onclick="ecrValiderPc()">Valider</button></div>';

  const input = document.getElementById('pc-ecr-input');
  input.addEventListener('keydown', ev => {
    if (ev.key !== 'Enter' || ev.shiftKey) return;
    ev.preventDefault();
    ev.stopPropagation();
    if (pAttente) continuerParcours();
    else ecrValiderPc();
  });
  focusSiClavierPhysique(input); // sur téléphone, on touche le champ pour écrire
}

// Écriture : deux essais (S6).
//   1er essai raté : l'erreur est comptée, on aide sans donner la réponse, on réessaie.
//   2e essai : juste → la phrase reviendra quand même à la fin de l'étape ;
//              faux → la réponse et le point d'attention complet.
function ecrValiderPc() {
  if (pAttente) return;
  const input = document.getElementById('pc-ecr-input');
  const val = input.value.trim();
  if (!val) return;

  const e = trouverItem(pLecon, 'ecriture', etapeCourante().queue[0]);
  const attention = attentionItem(e, 'ecriture');
  const ok = normalize(val) === normalize(e.lu);

  if (ok && ecrEssais === 0) {
    enregistrer(e, 1, true);
    input.disabled = true;
    input.className = 'ecr-input correct';
    showFeedback(true, 'Juste !', '<b>' + escHtml(e.lu) + '</b>' + attentionHtml(attention), reussir);
    return;
  }
  if (ok) {
    input.disabled = true;
    input.className = 'ecr-input correct';
    showFeedback(true, 'Juste, au 2e essai', '<b>' + escHtml(e.lu) + '</b>' + attentionHtml(attention) +
      'Cette phrase reviendra à la fin de l\'étape.', echouer);
    return;
  }

  ecrEssais++;
  if (ecrEssais === 1) {
    enregistrer(e, 0, false); // l'erreur compte dès le 1er essai
    const err = document.getElementById('pc-ecr-erreur');
    err.classList.remove('hidden');
    err.innerHTML = '<b>Pas encore</b> · Ton essai : ' + escHtml(val) + ' · corrige ta réponse' +
      aideErreurHtml(val, e, attention, 1);
    // La réponse reste dans le champ pour la corriger ; le clavier se ferme
    // pour laisser lire l'aide.
    fermerClavier();
    focusSiClavierPhysique(input);
    return;
  }

  input.disabled = true;
  input.className = 'ecr-input wrong';
  document.getElementById('pc-ecr-erreur').classList.add('hidden');
  showFeedback(false, 'Pas encore',
    'Réponse attendue : <b>' + escHtml(e.lu) + '</b>' + attentionHtml(attention) +
    'Cette phrase reviendra à la fin de l\'étape.', echouer);
}

// ─── FIN DE PARTIE ──────────────────────────────────────────────────────────
// Texte affiché pour un item dans la liste "À retravailler".
function ligneErreur(type, item, d) {
  let lu, fr, raison;
  if (type === 'flashcards') { lu = motComplet(item); fr = item.fr; }
  else if (type === 'quiz') { lu = item.question; fr = item.reponse; }
  else if (type === 'trous') { lu = [item.avant, item.trou, item.apres].filter(Boolean).join(' '); fr = item.fr; }
  else { lu = item.lu; fr = item.fr; }

  if (d.revele) raison = 'réponse vue';
  else if (d.indices) raison = d.indices + (d.indices > 1 ? ' indices' : ' indice');
  else if (d.essais) raison = (d.essais + 1) + ' essais';
  else raison = etapeInfo(type).label + ' · raté';
  return { lu, fr, raison, attention: attentionItem(item, type) };
}

// Score (0-100) et « sans faute » d'une unité, à partir des étapes jouées.
// uniteId = null -> tous les items de la partie.
// Le « + » ne compte jamais pour les étoiles ni le « sans faute ».
function bilanUnite(steps, uniteId) {
  const pourcents = [];
  let sansFaute = true;
  steps.forEach(s => {
    const ids = Object.keys(s.scores).filter(id => {
      const item = trouverItem(pLecon, s.type, Number(id));
      if (!item || item.plus) return false;
      return uniteId == null || item.unite === uniteId;
    });
    if (!ids.length) return;
    const somme = ids.reduce((a, id) => a + s.scores[id], 0);
    pourcents.push(Math.round(somme / ids.length * 100));
    ids.forEach(id => { if (!s.details[id].ok) sansFaute = false; });
  });
  const percent = pourcents.length ? Math.round(pourcents.reduce((a, b) => a + b, 0) / pourcents.length) : 100;
  return { percent, sansFaute };
}

function finirRun() {
  const etapes = run.steps.map(s => {
    const vals = Object.values(s.scores);
    const somme = vals.reduce((a, b) => a + b, 0);
    return { label: etapeInfo(s.type).label, percent: vals.length ? Math.round(somme / vals.length * 100) : 100 };
  });
  const total = Math.round(etapes.reduce((a, e) => a + e.percent, 0) / etapes.length);
  const global = bilanUnite(run.steps, null);
  const etaitComplete = leconComplete(pLecon);

  // Étoiles et « Sans faute » : seulement pour une unité complète ou la leçon complète.
  // Le « Sans faute » se gagne une fois et ne se perd jamais.
  let nouveauSansFaute = false;
  if (run.mode === 'unite' || run.mode === 'lecon') {
    const unites = run.mode === 'unite' ? [trouverUnite(pLecon, run.uniteId)] : pLecon.unites;
    unites.forEach(u => {
      const b = run.mode === 'unite' ? { percent: total, sansFaute: global.sansFaute } : bilanUnite(run.steps, u.id);
      saveUnitBest(run.leconId, u.id, b.percent);
      if (b.sansFaute && !getSansFaute(run.leconId, u.id)) {
        saveSansFaute(run.leconId, u.id);
        nouveauSansFaute = true;
      }
    });
  }
  // Le « + » est fait dès qu'on l'a joué en entier (les erreurs reviennent en révision).
  if (run.mode === 'plus' || run.mode === 'lecon') {
    const unites = run.uniteId === TOUTE_LA_LECON ? pLecon.unites : [trouverUnite(pLecon, run.uniteId)];
    unites.forEach(u => { if (aDuPlus(pLecon, u.id)) savePlusFait(run.leconId, u.id); });
  }
  if (run.mode === 'unite' || run.mode === 'lecon' || run.mode === 'plus') {
    marquerUniteFaite(); // une partie complète finie : objectif « unité » du jour (S7)
    dernierFini = { leconId: run.leconId, uniteId: run.uniteId }; // animé sur le chemin
  }

  const erreurs = [];  // clés "type:id" pour "Refaire mes erreurs"
  const lignes = [];
  run.steps.forEach(s => {
    Object.keys(s.details).forEach(id => {
      const d = s.details[id];
      if (d.ok) return;
      const item = trouverItem(pLecon, s.type, Number(id));
      if (!item) return;
      erreurs.push(s.type + ':' + item.id);
      lignes.push(ligneErreur(s.type, item, d));
    });
  });

  pResultat = {
    leconId: run.leconId, uniteId: run.uniteId, mode: run.mode, total, etapes, erreurs, lignes,
    sansFaute: global.sansFaute && (run.mode === 'unite' || run.mode === 'lecon'),
    nouveauSansFaute,
    nouvelleComplete: !etaitComplete && leconComplete(pLecon)
  };
  run = null;
  clearRun();
  renderFin();
  showView('view-pfin');
  animerFin(pResultat.sansFaute); // score qui compte, étoiles, confettis (S12)
}

function renderFin() {
  const r = pResultat;
  const complete = r.mode === 'unite' || r.mode === 'lecon';
  const u = r.uniteId === TOUTE_LA_LECON ? null : trouverUnite(pLecon, r.uniteId);
  let titre;
  if (r.mode === 'unite') titre = (u.bonus ? 'BONUS' : 'UNITÉ ' + r.uniteId) + ' TERMINÉE';
  else if (r.mode === 'lecon') titre = 'LEÇON ' + r.leconId + ' TERMINÉE';
  else if (r.mode === 'plus') titre = '« + » TERMINÉ';
  else if (r.mode === 'erreurs') titre = 'ERREURS REFAITES';
  else titre = 'ÉTAPE TERMINÉE';

  let html = '<div class="pf-haut">' +
    '<div class="pc-mini-label pc-accent">' + titre + '</div>' +
    (complete ? '<div class="pf-stars">' + etoilesHtml(etoiles(r.total)) + '</div>' : '') +
    '<div class="pf-score">' + r.total + ' %</div>' +
    (complete ? '<div class="pf-sous">3 étoiles à partir de 90 %</div>'
              : r.mode === 'plus' ? '<div class="pf-sous">Les nouveaux mots rejoignent tes révisions</div>'
              : '<div class="pf-sous">Ce passage ne change pas les étoiles</div>') +
    '</div>';

  // Moments acquis pour toujours : « sans faute », leçon « complète ».
  if (r.sansFaute) {
    html += '<div class="pf-sansfaute">' +
      (r.nouveauSansFaute ? 'Première fois sans faute !' : 'Sans faute, encore une fois !') +
      '<span>Tout juste du premier coup, sans indice.</span></div>';
  }
  if (r.nouvelleComplete) {
    html += '<div class="pf-sansfaute">Leçon complète !<span>Le fil, tous les « + » et les bonus sont faits.</span></div>';
  }

  // La scène avance : les répliques que cette unité permet de dire.
  if (r.mode === 'unite' && u && !u.bonus) html += repliquesDebloqueesHtml(pLecon, u.id);

  if (r.etapes.length > 1) {
    html += '<div class="pf-etapes">' + r.etapes.map(e =>
      '<div class="pf-etape"><span>' + e.label + '</span>' +
      '<div class="pf-bar"><div style="width:' + e.percent + '%"></div></div>' +
      '<b>' + e.percent + ' %</b></div>').join('') + '</div>';
  }

  if (r.lignes.length) {
    html += '<div class="pf-titre-liste"><span class="pc-mini-label">À RETRAVAILLER</span>' +
      '<span class="pf-note">reviendront dans tes révisions</span></div><div class="pf-liste">' +
      r.lignes.map(l => '<div class="pf-ligne"><div><b>' + escHtml(l.lu) + '</b><span>' + escHtml(l.fr) + '</span>' +
        (l.attention ? '<span class="pf-attention">' + l.attention + '</span>' : '') +
        '</div><em>' + escHtml(l.raison) + '</em></div>').join('') + '</div>';
  } else if (!r.sansFaute) {
    html += '<div class="pf-parfait">Aucune erreur, tout était juste du premier coup.</div>';
  }

  html += '<div class="pf-boutons">' + boutonsFinHtml(r, u) + '</div>';
  document.getElementById('pf-content').innerHTML = html;
}

// Boutons de fin de partie, dans l'ordre : erreurs, suite conseillée (jaune),
// « Élargir » (le « + » de l'unité), retour.
function boutonsFinHtml(r, u) {
  let html = '';
  if (r.erreurs.length) {
    html += '<button class="pc-btn wide" onclick="refaireErreurs()">Refaire mes erreurs</button>';
  }

  // Suite conseillée : unité suivante du fil, sinon la mission.
  let suite = '';
  if (r.mode === 'unite' && u && !u.bonus) {
    const fil = unitesCoeur(pLecon);
    const suivante = fil[fil.findIndex(x => x.id === u.id) + 1];
    if (suivante) suite = '<button class="pc-btn primary wide big" onclick="openIntro(' + suivante.id + ')">Unité suivante →</button>';
    else if (pLecon.scene) suite = '<button class="pc-btn primary wide big" onclick="openMission()">Jouer la mission</button>';
  } else if (r.mode === 'plus' && pLecon.scene && getMissionBest(pLecon.id) == null) {
    suite = '<button class="pc-btn primary wide big" onclick="openMission()">Jouer la mission</button>';
  }
  html += suite;

  // « Élargir » : proposé juste après le cœur, quand la phrase vient d'être acquise.
  if (r.mode === 'unite' && u && aDuPlus(pLecon, u.id)) {
    const nb = nbItems(pLecon, u.id, 'plus');
    html += '<button class="pc-btn plus wide" onclick="startUnite(' + u.id + ', \'plus\')">' +
      (getPlusFait(pLecon.id, u.id) ? '✓ ' : '') + 'Élargir : ' + textePlus(pLecon, u.id) + ' de plus · ' + minutesPour(nb) + ' min</button>';
  }

  // Retour à la leçon : sur la prochaine unité du fil, sinon sur celle qu'on vient de jouer.
  const fil = unitesCoeur(pLecon);
  const prochaine = fil.find(x => getUnitBest(pLecon.id, x.id) == null);
  const cible = r.mode === 'unite' && prochaine ? prochaine.id : r.uniteId;
  html += '<button class="pc-btn ' + (suite ? 'ghost' : 'primary big') + ' wide" onclick="openParcoursLecon(pLecon, ' + cibleJs(cible) + ')">Retour à la leçon</button>';
  html += '<button class="pc-btn ghost wide" onclick="goDashboard()">Accueil</button>'; // toujours en dernier (S9)
  return html;
}

function refaireErreurs() {
  startUnite(pResultat.uniteId, 'erreurs', pResultat.erreurs);
}

// ─── PANNEAU COURS ──────────────────────────────────────────────────────────
// uniteId = null -> toute la leçon. Pendant un exercice, on ouvre sur l'unité.
function ouvrirCours(uniteId) {
  pCoursUnite = uniteId == null ? null : uniteId;
  renderCoursPanel();
  document.getElementById('cours-panel').classList.remove('hidden');
  document.body.classList.add('no-scroll');
  programmerGarde(); // le bouton Retour du téléphone fermera le cours
}

// Unité de la partie en cours (null si leçon complète ou aucune partie).
function uniteDeLExercice() {
  if (!run || run.uniteId === TOUTE_LA_LECON) return null;
  return run.uniteId;
}

function ouvrirCoursExercice() {
  ouvrirCours(uniteDeLExercice());
}

function fermerCours() {
  document.getElementById('cours-panel').classList.add('hidden');
  document.body.classList.remove('no-scroll');
  programmerGarde();
  // L'exercice reprend au même endroit ; sur téléphone, le clavier reste fermé.
  const input = document.querySelector('#view-parcours.active #mc-input, #view-parcours.active #pc-ecr-input');
  focusSiClavierPhysique(input);
}

function coursChoisir(uniteId) {
  pCoursUnite = uniteId;
  renderCoursPanel();
}

function renderCoursPanel() {
  const l = pLecon;
  document.getElementById('cp-titre').textContent = l.titre;

  // Onglets : l'unité de l'exercice (s'il y en a un) + toute la leçon.
  const uniteExo = uniteDeLExercice();
  let onglets = '';
  if (uniteExo != null) {
    onglets += '<button class="pc-chip' + (pCoursUnite === uniteExo ? ' active' : '') +
      '" onclick="coursChoisir(' + uniteExo + ')">Unité ' + uniteExo + '</button>';
  }
  onglets += '<button class="pc-chip' + (pCoursUnite == null ? ' active' : '') +
    '" onclick="coursChoisir(null)">Toute la leçon</button>';
  document.getElementById('cp-onglets').innerHTML = onglets;

  // Un bloc sans "unite" est général : il apparaît partout.
  // "unite": 0 = seulement dans « Toute la leçon ».
  const blocs = (l.cours || []).filter(b => pCoursUnite == null || b.unite == null || b.unite === pCoursUnite);
  // Les blocs « + » sont repliés en bas, sous « Voir + ».
  const coeur = blocs.filter(b => !b.plus);
  const plus = blocs.filter(b => b.plus);
  let html = coursBlocsHtml(coeur, l.couleur);
  if (plus.length) {
    html += '<details class="cp-plus"><summary>Voir + · les mots en plus</summary>' +
      coursBlocsHtml(plus, l.couleur) + '</details>';
  }
  document.getElementById('cp-content').innerHTML = html;
  document.getElementById('cp-content').scrollTop = 0;
}

// ─── CLAVIER ────────────────────────────────────────────────────────────────
// Entrée = Continuer quand un message est affiché (hors champs de saisie,
// qui gèrent eux-mêmes Entrée).
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !document.getElementById('cours-panel').classList.contains('hidden')) {
    fermerCours();
    return;
  }
  if (e.key !== 'Enter' || !pAttente) return;
  if (!document.getElementById('view-parcours').classList.contains('active')) return;
  if (e.target && e.target.id === 'pc-continuer') return; // le bouton se clique tout seul
  e.preventDefault();
  continuerParcours();
});
