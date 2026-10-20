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
const RUN_KEY = 'luxParcours';             // partie PRINCIPALE (ce qu'il reste à apprendre)
const RUN_LIBRE_KEY = 'luxParcoursLibre';  // entraînement LIBRE (refaire, + , étape seule…) — spec 22
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

// ─── SPEC 58 : RATTRAPAGE PÉDAGOGIQUE DES ÉTOILES ─────────────────────────────
// Le détail d'un meilleur passage est enregistré uniquement s'il correspond
// à une partie complète et aux questions du cœur actuelles. Les anciens
// utilisateurs passent un petit défi, jamais un faux recalcul rétroactif.
function signatureRattrapage(l, uniteId) {
  return ETAPES.map(e => e.type + ':' + itemsUnite(l, e.type, uniteId, 'coeur')
    .map(x => x.id).sort((a, b) => a - b).join(',')).join('|');
}

function scoreDetailRattrapage(steps) {
  const valeurs = steps.filter(s => Object.keys(s.scores).length).map(s => {
    const scores = Object.values(s.scores);
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 100);
  });
  return valeurs.length ? Math.round(valeurs.reduce((a, b) => a + b, 0) / valeurs.length) : 0;
}

function capturerDetailRattrapage(l, uniteId, steps) {
  const detail = [];
  for (const e of ETAPES) {
    const ids = itemsUnite(l, e.type, uniteId, 'coeur').map(x => String(x.id));
    if (!ids.length) continue;
    const etape = steps.find(s => s.type === e.type);
    if (!etape || ids.some(id => !Object.prototype.hasOwnProperty.call(etape.scores, id))) return null;
    const scores = {};
    ids.forEach(id => { scores[id] = etape.scores[id]; });
    detail.push({ type: e.type, scores });
  }
  return detail.length ? { signature: signatureRattrapage(l, uniteId),
    basePercent: scoreDetailRattrapage(detail), steps: detail } : null;
}

function detailRattrapageValide(l, uniteId) {
  const snapshot = getRattrapageSnapshot(l.id, uniteId);
  const best = getUnitBest(l.id, uniteId);
  if (!snapshot || snapshot.basePercent !== best ||
      snapshot.signature !== signatureRattrapage(l, uniteId) ||
      !Array.isArray(snapshot.steps)) return null;
  const reference = capturerDetailRattrapage(l, uniteId, snapshot.steps);
  return reference && reference.basePercent === snapshot.basePercent ? snapshot : null;
}

function questionsPerduesRattrapage(snapshot) {
  const keys = [];
  snapshot.steps.forEach(s => Object.entries(s.scores).forEach(([id, score]) => {
    if (score < 1) keys.push(s.type + ':' + id);
  }));
  return keys;
}

// Défi de l'ancien catalogue : privilégie les difficultés effectivement
// observées, complète avec plusieurs types d'exercices, sans reproduire
// artificiellement une partie passée dont nous ignorons le score détaillé.
function questionsDefiHistorique(l, uniteId) {
  const candidats = [];
  ETAPES.forEach(e => itemsUnite(l, e.type, uniteId, 'coeur').forEach(q => {
    const st = getQuestionStats(l.id, e.stat, q.id);
    candidats.push({ cle: e.type + ':' + q.id,
      poids: (st.wrongTotal || 0) * 3 + getWrongCount(l.id, e.stat, q.id),
      type: e.type });
  }));
  if (candidats.length < 5) return [];
  const groupes = {};
  candidats.forEach(x => { (groupes[x.type] ||= []).push(x); });
  const retenus = [];
  // D'abord une question par type pour conserver un défi transversal.
  ETAPES.forEach(e => {
    const liste = groupes[e.type] || [];
    liste.sort((a, b) => b.poids - a.poids);
    if (liste.length) retenus.push(liste.shift());
  });
  const deja = new Set(retenus.map(x => x.cle));
  candidats.sort((a, b) => b.poids - a.poids);
  for (const x of candidats) {
    if (retenus.length >= 8) break;
    if (!deja.has(x.cle)) { retenus.push(x); deja.add(x.cle); }
  }
  return retenus.map(x => x.cle);
}

function peutRattraperEtoile(l, u) {
  const score = getUnitBest(l.id, u.id);
  if (score == null || score < 70 || score >= 90) return false;
  const detail = detailRattrapageValide(l, u.id);
  return detail ? questionsPerduesRattrapage(detail).length > 0
                : questionsDefiHistorique(l, u.id).length >= 5;
}

function lancerRattrapageEtoile(uniteId) {
  const u = trouverUnite(pLecon, uniteId);
  if (!u || !peutRattraperEtoile(pLecon, u)) return;
  const detail = detailRattrapageValide(pLecon, uniteId);
  const cles = detail ? questionsPerduesRattrapage(detail) : questionsDefiHistorique(pLecon, uniteId);
  if (!cles.length) return;
  const meta = { source: detail ? 'detail' : 'historique', referenceMaj: detail ? detail.maj : null };
  startUnite(uniteId, 'rattrapage', cles, meta);
}

// SPEC 60 : révision après 3 étoiles, distincte du rattrapage noté.
function questionsRevisionErreursUnite(l, uniteId) {
  const u = l && trouverUnite(l, uniteId);
  const best = l && getUnitBest(l.id, uniteId);
  if (!u || u.bonus || best == null || best < 90 || getSansFaute(l.id, uniteId)) return [];
  const detail = detailRattrapageValide(l, uniteId);
  if (detail) return questionsPerduesRattrapage(detail);
  const candidats = [];
  ETAPES.forEach(e => itemsUnite(l, e.type, uniteId, 'coeur').forEach(q => {
    const s = getQuestionStats(l.id, e.stat, q.id);
    const n = getWrongCount(l.id, e.stat, q.id);
    if (n > 0 || (s.wrongTotal || 0) > 0)
      candidats.push({ cle: e.type + ':' + q.id, poids: n * 5 + (s.wrongTotal || 0) });
  }));
  candidats.sort((a, b) => b.poids - a.poids);
  return candidats.slice(0, 8).map(x => x.cle);
}
function peutRevoirErreursUnite(l, u) {
  return !!(l && u && questionsRevisionErreursUnite(l, u.id).length);
}
function lancerRevisionErreursUnite(uniteId) {
  const cles = questionsRevisionErreursUnite(pLecon, uniteId);
  if (cles.length) startUnite(uniteId, 'erreurs', cles);
}

function appliquerResultatRattrapage(r) {
  const avant = getUnitBest(r.leconId, r.uniteId);
  const meta = r.rattrapage || {};
  let apres = avant;
  if (meta.source === 'detail') {
    const snap = detailRattrapageValide(pLecon, r.uniteId);
    if (snap && snap.maj === meta.referenceMaj) {
      const nouvelles = snap.steps.map(s => ({ type: s.type, scores: Object.assign({}, s.scores) }));
      r.steps.forEach(s => Object.entries(s.scores).forEach(([id, score]) => {
        const cible = nouvelles.find(t => t.type === s.type);
        if (cible && Object.prototype.hasOwnProperty.call(cible.scores, id)) {
          cible.scores[id] = Math.max(cible.scores[id], score);
        }
      }));
      apres = Math.max(avant, scoreDetailRattrapage(nouvelles));
      if (apres > avant) {
        saveUnitBest(r.leconId, r.uniteId, apres);
        saveRattrapageSnapshot(r.leconId, r.uniteId, {
          signature: snap.signature, basePercent: apres, steps: nouvelles
        });
      }
    }
  } else if (meta.source === 'historique') {
    // Le défi remplace la preuve manquante, pas le score d'origine.
    // Au moins 5 items et 90 % de réussite ; 90 attribué, jamais 100.
    const nb = r.steps.reduce((n, s) => n + Object.keys(s.scores).length, 0);
    const total = Math.round(r.steps.reduce((n, s) => n +
      (Object.keys(s.scores).length ? Object.values(s.scores).reduce((a, b) => a + b, 0) /
       Object.keys(s.scores).length : 0), 0) /
      r.steps.filter(s => Object.keys(s.scores).length).length * 100);
    if (nb >= 5 && total >= 90) {
      apres = Math.max(avant, 90);
      if (apres > avant) saveUnitBest(r.leconId, r.uniteId, apres);
    }
  }
  return { source: meta.source, avant, apres, ameliore: apres > avant };
}

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
  return articleAEcrire(lecon, card) ? card.article + (card.article.endsWith("'") ? '' : ' ') + card.lu : card.lu;
}

// La carte telle qu'on la corrige : réponse complète, sans article à part
// (sert au diagnostic « Bon mot, mauvais article » et au masquage de l'aide).
function carteACorriger(lecon, card) {
  if (!articleAEcrire(lecon, card)) return card;
  return Object.assign({}, card, { lu: motATaper(lecon, card), article: null });
}

// Texte luxembourgeois d'un mot caché, avec son article s'il en a un.
function motComplet(card) {
  return (card.article ? card.article + (card.article.endsWith("'") ? '' : ' ') : '') + card.lu;
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
//
// Deux emplacements indépendants (spec 22) :
//   principal (luxParcours)     : une unité jamais terminée, commencée ou reprise.
//                                 C'est elle que l'accueil et le chemin proposent.
//   libre (luxParcoursLibre)    : refaire une unité terminée, ses erreurs, le « + »,
//                                 une étape seule, la leçon complète, une unité bonus.
//                                 Reprenable, mais ne change jamais la prochaine étape.
// Le type est fixé au lancement (run.libre) et ne change plus.
function cleRun(libre) {
  return storageKey(libre ? RUN_LIBRE_KEY : RUN_KEY);
}

function saveRun() {
  run.maj = Date.now();
  try { localStorage.setItem(cleRun(run.libre), JSON.stringify(run)); } catch (e) { /* ignore */ }
  if (typeof debounceCloudSave === 'function') debounceCloudSave();
}

// Partie en cours, ou null (aucune, ou finie). libre = true : l'entraînement libre.
function loadRun(libre) {
  let data = null;
  try { data = JSON.parse(localStorage.getItem(cleRun(libre))); } catch (e) { data = null; }
  if (!data || data.fini || !data.steps) return null;
  // SPEC 79 : une session déjà commencée sur l'ancienne unité 2 contient
  // des IDs qui n'existent plus. Ne jamais afficher un exercice introuvable.
  // Archiver la session historique avant de libérer la place ; scores conservés.
  if ((Number(data.leconId) === 2 || Number(data.leconId) === 0) && typeof lecons !== 'undefined') {
    const l = lecons.find(x => x.id === Number(data.leconId));
    const obsolete = l && data.steps.some(etape => {
      const presents = new Set((l[etape.type] || []).map(x => Number(x.id)));
      return (etape.queue || []).concat(Object.keys(etape.scores || {}))
        .some(id => !presents.has(Number(id)));
    });
    if (obsolete) {
      try {
        localStorage.setItem(cleRun(libre) + (Number(data.leconId) === 0 ? ':archive82' : ':archive79'), JSON.stringify(data));
        localStorage.setItem(cleRun(libre), JSON.stringify({ fini:true, maj:Date.now() }));
      } catch (e) { /* session obsolète ignorée, sans supprimer les résultats */ }
      return null;
    }
  }
  return data;
}

// Partie finie : marque « finie » datée, comme pour la séance du jour.
// Seul l'emplacement de cette partie est touché.
function clearRun(libre) {
  try { localStorage.setItem(cleRun(libre), JSON.stringify({ fini: true, maj: Date.now() })); } catch (e) { /* ignore */ }
  if (typeof debounceCloudSave === 'function') debounceCloudSave();
}

// Une partie est-elle de l'entraînement libre ? Principale seulement pour une
// unité du fil jamais terminée, dans une leçon pas déjà acquise.
function partieLibre(leconId, uniteId, mode) {
  if (mode !== 'unite') return true;
  const l = lecons.find(x => x.id === leconId);
  const u = l && trouverUnite(l, uniteId);
  if (!u || u.bonus) return true;
  if (acquisV1(l) || leconAcquiseParMission(l)) return true; // leçon déjà acquise : unité facultative
  return getUnitBest(leconId, uniteId) != null;
}

// Migration : une ancienne partie (sans « libre ») qui est en fait une
// répétition passe dans l'emplacement libre, sans perdre ses réponses.
function migrerParties() {
  let data = null;
  try { data = JSON.parse(localStorage.getItem(cleRun(false))); } catch (e) { data = null; }
  if (!data || data.fini || !data.steps || data.libre !== undefined) return;
  data.libre = partieLibre(data.leconId, data.uniteId, data.mode);
  try {
    if (data.libre) {
      const libre = loadRun(true);
      if (!libre || (libre.maj || 0) < (data.maj || 0)) localStorage.setItem(cleRun(true), JSON.stringify(data));
      localStorage.setItem(cleRun(false), JSON.stringify({ fini: true, maj: data.maj || 0 }));
    } else {
      localStorage.setItem(cleRun(false), JSON.stringify(data));
    }
  } catch (e) { /* ignore */ }
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
// afficherUnitesDirectement : lien « Voir toute la leçon » du Chemin seulement.
// Ne confirme pas l'introduction de mission et ne modifie pas la progression.
function openParcoursLecon(l, cible, afficherUnitesDirectement = false) {
  pLecon = l;
  currentLecon = l;
  marquerLeconVue(l.id); // la 1re visite passe par cet écran (S2)
  fermerClavier();
  // 1re découverte d'une leçon avec mission : l'introduction, jusqu'à confirmation.
  if (!afficherUnitesDirectement && cible == null && introMissionAVoir(l)) {
    ouvrirIntroMission(l); // Découvrir : aucune unité présélectionnée
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

// Place le haut de la carte juste sous l'en-tête fixe, avec une petite marge
// (spec 25). Fait tout de suite, en un seul scroll : rien ne reste en attente
// qui pourrait défiler plus tard, sur un autre écran.
function allerALaCarte(cible) {
  const carte = document.getElementById(idCarte(cible));
  if (!carte) return;
  const entete = document.querySelector('#view-plecon > .pc-topbar');
  const marge = (entete ? entete.offsetHeight : 0) + 12;
  const haut = carte.getBoundingClientRect().top + window.scrollY - marge;
  window.scrollTo(0, Math.max(0, haut));
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
  const libre = loadRun(true);
  pLibreIci = libre && libre.leconId === l.id ? libre : null;
  const revision = resumeRevision([l]).parLecon[l.id];

  document.getElementById('pl-num').textContent = 'LEÇON ' + numLecon(l);
  document.getElementById('pl-titre').textContent = l.titre;
  document.getElementById('pl-sous').textContent =
    l.titre_fr + ' · ' + unitesCoeur(l).length + ' unités';

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
      (leconComplete(l) ? ' · <span class="pc-vert">COMPLÈTE</span>' : '') + '</div>' +
    '<div class="pl-unit-titre">Tout le contenu d\'un coup</div></div></div>' +
    '<div class="pl-unit-mots">Le fil et tous les « + »' + (l.unites.some(u => u.bonus) ? ', bonus compris' : '') + ' · ' + nbTout +
      ' questions · environ ' + minutesPour(nbTout) + ' min</div>';
  // La leçon complète est de l'entraînement libre : reprenable, jamais l'action principale.
  if (pLibreIci && pLibreIci.uniteId === TOUTE_LA_LECON) {
    html += '<div class="pc-steps">' + segmentsHtml(pLibreIci) + '</div>' +
      '<button class="pc-btn wide" onclick="reprendreRun(true)">Continuer la leçon complète</button>';
  } else {
    html += '<button class="pc-btn wide" onclick="startUnite(\'' + TOUTE_LA_LECON + '\', \'lecon\')">Leçon complète</button>';
  }
  html += '<div class="pl-unit-actions">' + chipsEtapes(TOUTE_LA_LECON) +
    '<button class="pc-chip" onclick="toutRevoir()">Tout revoir</button>' +
    (revision.dus ? '<button class="pc-chip fraicheur" onclick="rafraichirLecon()">Réviser · ' + revision.dus + '</button>' : '') +
    '</div></div>';

  // Bilan : toujours ouvert.
  html += '<div class="pl-unit pl-bilan">' +
    '<div class="pl-unit-titre">Bilan de la leçon</div>' +
    '<div class="pl-unit-mots">10 questions mélangées sur le fil de la leçon</div>' +
    '<button class="pc-btn wide" onclick="lancerBilan()">Lancer le bilan</button></div>';

  document.getElementById('pl-units').innerHTML = html;
}

// Carte d'une unité dans l'écran de la leçon.
let pLibreIci = null; // entraînement libre interrompu dans la leçon affichée

function carteUniteHtml(l, u, runIci, prochaine, revision) {
  const best = getUnitBest(l.id, u.id);
  const sansFaute = getSansFaute(l.id, u.id);
  const enCours = runIci && runIci.uniteId === u.id;
  const nbDus = revision.dusParUnite[u.id] || 0;

  let etat = '';
  if (enCours) etat = ' · <span class="pc-gold">EN COURS</span>';
  else if (sansFaute) etat = ' · <span class="pc-vert">SANS FAUTE</span>';
  else if (best != null) etat = ' · <span class="pc-vert">TERMINÉE</span>';
  else if (!u.bonus && leconAcquiseParMission(l)) etat = ' · <span class="pl-validee">FACULTATIVE · LEÇON VALIDÉE PAR LA MISSION</span>'; // spec 32 : pas faite, pas de coche
  else if (!u.bonus && acquiseAncienneVersion(l)) etat = ' · <span class="pl-acquis">NOUVELLE · LEÇON ACQUISE PRÉCÉDEMMENT</span>'; // specs 46 et 48 : à découvrir, pas de coche

  const mots = itemsUnite(l, 'flashcards', u.id, 'coeur');
  let apercu = mots.slice(0, 4).map(c => escHtml(c.lu)).join(' · ');
  if (mots.length > 4) apercu += ' · +' + (mots.length - 4);

  const label = u.bonus ? 'BONUS' : 'UNITÉ ' + u.id;
  const estProchaine = !!(prochaine && prochaine.id === u.id);
  let html = '<div class="pl-unit' + (enCours ? ' en-cours' : '') + (estProchaine ? ' prochaine' : '') + (u.bonus ? ' bonus' : '') + '" id="pl-unite-' + u.id + '">';
  html += '<div class="pl-unit-top"><div>' +
    '<div class="pc-mini-label">' + label + etat + '</div>' +
    '<div class="pl-unit-titre">' + escHtml(u.titre) + '</div></div>' +
    (best != null ? '<div class="pl-unit-stars">' + etoilesHtml(etoiles(best)) + '</div>' : '') +
    '</div>';
  if (u.phrase) html += '<div class="pl-unit-phrase">' + escHtml(u.phrase[0]) + '</div>';
  html += '<div class="pl-unit-mots">' + apercu + '</div>';
  if (nbDus) html += '<div class="pl-fraicheur">' + texteAReviser(nbDus) + '</div>'; // spec 48

  if (enCours) {
    html += '<div class="pc-steps">' + segmentsHtml(runIci) + '</div>';
    html += '<button class="pc-btn primary wide" onclick="reprendreRun()">Continuer</button>';
  } else {
    const classe = prochaine && prochaine.id === u.id ? 'pc-btn primary wide' : 'pc-btn wide';
    html += '<button class="' + classe + '" onclick="openIntro(' + u.id + ')">' +
      (best == null ? 'Commencer' : 'Refaire l\'unité') + '</button>';
  }
  // SPEC 58 : rattrapage permanent pour une unité à 2 étoiles.
  // L'unité complète reste disponible, le mini-défi est facultatif.
  if (peutRattraperEtoile(l, u)) {
    const detail = detailRattrapageValide(l, u.id);
    html += '<button class="pc-btn wide pl-rattrapage" onclick="lancerRattrapageEtoile(' + u.id + ')">' +
      '★ Rattraper ma 3e étoile <small>' + best + ' % → 90 % · ' +
      (detail ? 'questions à retravailler' : 'défi ciblé') + '</small></button>';
  }
  // SPEC 60 : l'unité à 3 étoiles conserve un accès direct à ses fautes.
  if (peutRevoirErreursUnite(l, u)) {
    const detail = detailRattrapageValide(l, u.id);
    html += '<button class="pc-btn wide pl-rattrapage pl-revoir-erreurs" onclick="lancerRevisionErreursUnite(' + u.id + ')">' +
      '↻ Revoir mes erreurs <small>' +
      (detail ? 'Questions à retravailler' : 'Difficultés déjà rencontrées') +
      ' · sans changement des étoiles</small></button>';
  }
  // Révision libre interrompue sur cette unité : reprenable, sans être la prochaine étape.
  if (pLibreIci && pLibreIci.uniteId === u.id) {
    html += '<button class="pc-btn ghost wide pl-reprendre-revision" onclick="reprendreRun(true)">Reprendre la révision · ' +
      escHtml(nomPartie(pLibreIci.uniteId, pLibreIci.mode)) + '</button>';
  }
  // Les étapes seules et le « + » sont toujours disponibles.
  html += '<div class="pl-unit-actions">' + chipsEtapes(u.id) + '</div>';
  html += '</div>';
  return html;
}

// "Tout revoir" : l'écran Réviser, avec seulement cette leçon cochée.
function toutRevoir() {
  if (introMissionAVoir(pLecon)) {
    ouvrirIntroMission(pLecon, { type: 'revoir' });
    return;
  }
  openReviewSetup(pLecon.id);
}

// Retour à l'écran de la leçon depuis une session (bilan, rafraîchir).
function retourLecon() {
  return [{ label: 'Retour à la leçon', primary: true, fn: () => openParcoursLecon(pLecon) }];
}

function lancerBilan() {
  if (introMissionAVoir(pLecon)) {
    ouvrirIntroMission(pLecon, { type: 'bilan' });
    return;
  }
  const pool = itemsRevision(pLecon).filter(i =>
    i.type !== 'motcache' && !i.q.plus && !trouverUnite(pLecon, i.q.unite).bonus);
  demarrerSession('review', 'BILAN · LEÇON ' + numLecon(pLecon), melanger(pool).slice(0, 10), { actions: retourLecon() });
}

// Révise tout ce qui est dû dans cette leçon (la fraîcheur remonte).
function rafraichirLecon() {
  if (introMissionAVoir(pLecon)) {
    ouvrirIntroMission(pLecon, { type: 'rafraichir' });
    return;
  }
  const dus = resumeRevision([pLecon]).dus;
  demarrerSession('review', 'RAFRAÎCHIR · LEÇON ' + numLecon(pLecon), dus, { actions: retourLecon() });
}

// ─── ÉCRAN "AVANT DE COMMENCER" ─────────────────────────────────────────────
// Ordre : la phrase de l'unité, la règle, les pièges, les mots du cœur,
// puis le « + » replié (même phrase, plus de mots).
let pIntroUnite = null; // unité de l'écran « Avant de commencer » (pour la croix)

function openIntro(uniteId) {
  // SPEC 55 : consulter la liste est libre, commencer une unité ne saute
  // jamais la première introduction immersive, bonus compris.
  if (introMissionAVoir(pLecon)) {
    ouvrirIntroMission(pLecon, { type: 'unite', uniteId });
    return;
  }
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

  const activiteUnique = studioActif(pLecon) && u.activiteUnique;
  html += '<div class="pi-bas"><div class="pi-duree">' +
    (activiteUnique ? '1 activité · ' + nbItems(pLecon, uniteId, 'coeur') + ' défis' : '4 étapes') +
    ' · environ ' + minutes + ' min</div></div>';

  document.getElementById('pi-content').innerHTML = html;
  // L'action principale, toujours visible en bas (spec 21).
  document.getElementById('pi-cta').innerHTML =
    '<button class="pc-btn primary wide big" id="pi-commencer" onclick="startUnite(' + u.id + ')">Commencer →</button>';
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
function startUnite(uniteId, mode, filtre, metaRattrapage) {
  mode = mode || 'unite';
  // SPEC 55 : protège aussi les raccourcis Quiz/Trous/Écriture et « Leçon
  // complète », accessibles depuis l'aperçu. Aucune progression avant accord.
  if (introMissionAVoir(pLecon)) {
    ouvrirIntroMission(pLecon, { type: 'demarrer', uniteId, mode, filtre, metaRattrapage });
    return;
  }
  let quoi = 'tout';
  if (mode === 'unite' || mode === 'rattrapage') quoi = 'coeur';
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

  run = { leconId: pLecon.id, uniteId, mode, steps, stepIdx: 0,
    libre: partieLibre(pLecon.id, uniteId, mode) };
  if (mode === 'rattrapage') run.rattrapage = metaRattrapage;
  saveRun();
  showView('view-parcours');
  renderItem();
}

function startEtapeSeule(uniteId, type) {
  const cles = itemsUnite(pLecon, type, uniteId, quoiEtape(uniteId)).map(x => type + ':' + x.id);
  startUnite(uniteId, 'etape', cles);
}

// libre = true : reprend l'entraînement libre (sinon la partie principale).
function reprendreRun(libre) {
  const saved = loadRun(libre);
  if (!saved) return;
  const l = lecons.find(x => x.id === saved.leconId);
  if (!isParcoursLecon(l)) { clearRun(libre); return; }
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
    (studioActif(pLecon) && run.steps.length === 1 ? 'Activité · ' : 'Étape ' + (run.stepIdx + 1) + ' · ') +
    (studioActif(pLecon) && step.type === 'quiz' ? 'Écoute LOD' :
      studioActif(pLecon) && step.type === 'trous' ? 'Avec ou sans N' : etapeInfo(step.type).label);
  document.getElementById('pc-compteur').innerHTML =
    Math.min(resolus + 1, step.total) + ' / ' + step.total +
    (aRefaire ? ' <span class="pc-refaire">· +' + aRefaire + ' à refaire</span>' : '');

  document.getElementById('pc-feedback').className = 'pc-feedback hidden';
  etatExercice('saisie'); // nouvel item : on repart de la saisie
  document.getElementById('view-parcours').dataset.type = step.type; // police propre au mot caché

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

// Faux : l'item repart à la fin de la file, au plus RAPPELS_MAX fois (spec 40).
// Au-delà, il sort de la partie : il reste une erreur (résultats, « Refaire
// mes erreurs », révisions), mais l'étape ne devient pas interminable.
const RAPPELS_MAX = 2;

function vaRevenir() {
  const step = etapeCourante();
  const id = step.queue[0];
  return ((step.rappels || {})[id] || 0) < RAPPELS_MAX;
}

function echouer() {
  const step = etapeCourante();
  const revient = vaRevenir();
  const id = step.queue.shift();
  if (revient) {
    if (!step.rappels) step.rappels = {}; // absent des parties sauvegardées avant la spec 40
    step.rappels[id] = (step.rappels[id] || 0) + 1;
    step.queue.push(id);
  }
  saveRun();
  renderItem();
}

// Phrase sous la correction (spec 40) : toujours dans son propre bloc, pour ne
// jamais se coller à la réponse. revient : l'item reviendra dans l'étape ;
// plusTard : dernier rappel atteint, il part en révision.
function rappelHtml(revient, plusTard) {
  return '<div class="pc-fb-rappel">' + (vaRevenir() ? revient : plusTard) + '</div>';
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

// ─── ÉTAT DE L'EXERCICE (commun à tous les types) ───────────────────────────
//   'saisie'  : on répond (lettres, Effacer, Indice, Valider…)
//   'corrige' : la correction est affichée ; les commandes de saisie
//               disparaissent (CSS), il ne reste que « Continuer ».
// Une seule action principale visible à la fois.
function etatExercice(etat) {
  document.getElementById('view-parcours').dataset.etat = etat;
}

// Bandeau du bas : "Juste !" ou "Pas encore", avec un bouton Continuer.
function showFeedback(ok, titre, texteHtml, suite) {
  fermerClavier(); // la correction doit être visible, pas cachée par le clavier
  etatExercice('corrige'); // plus de Valider / Indice / Effacer : une seule action
  pAttente = true;
  pSuite = suite;
  const fb = document.getElementById('pc-feedback');
  fb.className = 'pc-feedback ' + (ok ? 'ok' : 'ko');
  const coche = ok ? '<svg class="coche-anim" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>' : '';
  fb.innerHTML =
    '<div class="pc-fb-titre">' + coche + titre + '</div>' +
    (texteHtml ? '<div class="pc-fb-txt">' + texteHtml + '</div>' : '') +
    '<button class="pc-btn wide ' + (ok ? 'ok' : 'ko') + '" id="pc-continuer" onclick="continuerParcours()">Continuer</button>';
  focusApresClavier(document.getElementById('pc-continuer')); // focus seulement après une saisie au clavier (spec 35)
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
      boutonEcouterHtml(card.lu) + // prononciation LOD, seulement sur demande
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
  mc.choix = [];

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
    (mc.cases.some(c => c.lettre && mcSansAccent(c.ch) !== c.ch)
      ? '<div class="mc-info">Les accents apparaissent après validation</div>' : '') +
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

// SPEC 51 : les tuiles n'ont pas d'accent ; le mot les récupère
// uniquement après validation (ou lors de l'utilisation d'un indice payant).
// Les lettres posées ne trahissent donc jamais leur bonne position.
function mcSansAccent(ch) {
  return ch.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}
// SPEC 61 : tuiles en minuscules, majuscule automatique à la position attendue.
function mcLettreTuile(ch) { return mcSansAccent(ch).toLowerCase(); }
function mcLettreDansCase(ch, attendu) {
  const base = mcLettreTuile(ch);
  return attendu !== attendu.toLowerCase() ? base.toUpperCase() : base;
}

// Lettres proposées : celles des cases encore à remplir, plus 2 intruses
// (3 pour un mot de 6 lettres ou plus), dans le désordre.
const LETTRES_INTRUSES = 'aeinrstuldghm';
function nouvellesTuiles() {
  const tuiles = mcCasesLettres().libres.map(i => ({ ch: mcLettreTuile(mc.cases[i].ch) }));
  const nbIntruses = tuiles.length >= 6 ? 3 : 2;
  for (let k = 0; k < nbIntruses && tuiles.length; k++) {
    tuiles.push({ ch: LETTRES_INTRUSES[Math.floor(Math.random() * LETTRES_INTRUSES.length)] });
  }
  return melanger(tuiles);
}

// ─── TUILES : CHAQUE TUILE A SON IDENTITÉ (spec 21) ──────────────────────────
// mc.choix = les numéros des tuiles touchées, dans l'ordre. Toucher une tuile
// utilise exactement CETTE tuile (deux « t » restent deux tuiles distinctes ;
// leur casse d'affichage est toujours minuscule). ⌫ libère la dernière tuile.
// mc.tuiles[k].retiree = true : tuile retirée par un indice (plus affichée).
function tuilesUtilisees() {
  const utilisees = mc.tuiles.map(t => !!t.retiree);
  mc.choix.forEach(k => { utilisees[k] = true; });
  return utilisees;
}

// Le champ invisible reflète les lettres posées (pour un clavier physique).
function mcSynchroniserChamp() {
  const input = document.getElementById('mc-input');
  const valeur = mcLettresTapees().join('');
  if (input && input.value !== valeur) input.value = valeur;
}

// Clavier physique : une lettre tapée prend une tuile libre de la même lettre
// (exactement la même d'abord, sinon sans tenir compte de la casse et des accents).
function tuilePourLettre(lettre) {
  const libres = tuilesUtilisees();
  let k = mc.tuiles.findIndex((t, i) => !libres[i] && t.ch === lettre);
  if (k === -1) k = mc.tuiles.findIndex((t, i) => !libres[i] && normalize(t.ch) === normalize(lettre));
  return k;
}

function renderTuiles() {
  const box = document.getElementById('mc-lettres');
  if (!box) return;
  const input = document.getElementById('mc-input');
  const fini = !input || input.disabled;
  const utilisees = tuilesUtilisees();
  box.innerHTML = fini ? '' : mc.tuiles.map((t, i) =>
    t.retiree ? '' :
    '<button class="mc-tuile' + (utilisees[i] ? ' utilisee' : '') + '" data-tuile="' + i + '"' + (utilisees[i] ? ' disabled' : '') +
      ' onclick="mcPoserLettre(' + i + ')">' + escHtml(mcLettreTuile(t.ch)) + '</button>').join('');
}

// Toucher une tuile : cette tuile-là va dans la première case vide.
function mcPoserLettre(i) {
  if (pAttente) return;
  const input = document.getElementById('mc-input');
  if (!input || input.disabled || tuilesUtilisees()[i]) return;
  if (mc.choix.length >= mcCasesLettres().libres.length) return; // toutes les cases sont remplies
  mc.choix.push(i);
  mcSynchroniserChamp();
  renderCases();
}

// ⌫ : libère la dernière tuile touchée.
function mcEffacer() {
  const input = document.getElementById('mc-input');
  if (!input || input.disabled) return;
  mc.choix.pop();
  mcSynchroniserChamp();
  renderCases();
}

// Les lettres posées, dans l'ordre (casse conservée, accents absents des tuiles).
function mcLettresTapees() {
  return (mc.choix || []).map(k => mc.tuiles[k].ch);
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
  // Clavier physique : lettres effacées → tuiles libérées ; lettres ajoutées →
  // une tuile libre correspondante chacune (sinon la lettre est ignorée).
  let tapees = input.value.split('').filter(estLettre);
  // Mot entier tapé ou collé (ordinateur) alors que des cases sont déjà vertes :
  // on garde seulement les lettres des cases encore vides.
  const { toutes, libres } = mcCasesLettres();
  if (tapees.length === toutes.length && toutes.length > libres.length) {
    tapees = libres.map(i => tapees[toutes.indexOf(i)]);
  }
  const avant = mcLettresTapees();
  let commun = 0;
  while (commun < tapees.length && commun < avant.length && tapees[commun] === avant[commun]) commun++;
  mc.choix = mc.choix.slice(0, commun);
  const max = libres.length;
  tapees.slice(commun).forEach(lettre => {
    if (mc.choix.length >= max) return;
    const k = tuilePourLettre(lettre);
    if (k !== -1) mc.choix.push(k);
  });
  mcSynchroniserChamp();
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
  // Spec 31 : seulement les cases (le curseur dépend du focus). Ne pas
  // redessiner les tuiles : sur PC, cliquer une tuile retire le focus du champ
  // AVANT la fin du clic ; recréer les boutons à ce moment-là perdait le 1er clic.
  renderCases(false);
}

// avecTuiles = false : seulement les cases (les tuiles restent les mêmes boutons).
function renderCases(avecTuiles = true) {
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
    if (parCase[i] !== undefined) {
      // Avant validation, ne pas révéler les positions correctes via un accent.
      texte = mcLettreDansCase(parCase[i], c.ch);
      classe += ' tapee';
    }
    else if (c.etat !== '') texte = c.ch;
    if (i === curseur) classe += ' curseur';
    html += '<span class="' + classe + '">' + escHtml(texte) + '</span>';
  });
  document.getElementById('mc-cases').innerHTML = html + '</span>';
  if (avecTuiles) renderTuiles();
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
  // La tuile posée dans cette case (s'il y en a une) est libérée ; les autres
  // lettres posées restent dans leur case.
  const position = libres.indexOf(i);
  if (position < mc.choix.length) mc.choix.splice(position, 1);
  mc.cases[i].etat = 'indice';
  mc.indices++;
  // La lettre révélée n'est plus à poser : une tuile libre de cette lettre disparaît.
  const utilisees = tuilesUtilisees();
  let k = mc.tuiles.findIndex((t, j) => !utilisees[j] && t.ch === mc.cases[i].ch);
  if (k === -1) k = mc.tuiles.findIndex((t, j) => !utilisees[j] && normalize(t.ch) === normalize(mc.cases[i].ch));
  if (k !== -1) mc.tuiles[k].retiree = true;
  mcSynchroniserChamp();
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
    // Le rappel de l'essai reflète la saisie, sans révélation d'accents.
    essaiAffiche += lettre ? mcLettreDansCase(lettre, c.ch) : '_';
  });

  // SPEC 51 : seules les lettres de base et leur ordre sont évalués.
  // Les accents corrects apparaissent déjà dans les cases, sans être notés.
  if (normalize(val) === normalize(motATaper(pLecon, card))) {
    mc.cases.forEach(c => { if (c.lettre) c.etat = 'vert'; });
    input.value = '';
    mc.choix = []; // les lettres sont maintenant dans les cases vertes
    input.disabled = true;
    renderCases();
    mcMajFocus();
    document.getElementById('mc-cases').classList.add('juste');
    const ok = !mc.revele && mc.indices === 0 && mc.essais === 0;
    enregistrer(card, mcScore(), ok, { indices: mc.indices, essais: mc.essais, revele: mc.revele });
    // Juste : le point d'attention complet, pour retenir le piège (S6).
    showFeedback(true, 'Bien joué !', '<b>' + escHtml(motComplet(card)) + '</b> = ' + escHtml(card.fr) +
      boutonEcouterHtml(card.lu) + // SPEC 68 : aussi pour un mot déjà étudié
      '<div class="pc-fb-score">Score du mot : <b>' + Math.round(mcScore() * 100) + ' %</b></div>' +
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
  mc.choix = [];
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
  mc.choix = [];
  input.disabled = true;
  renderCases();
  mcMajFocus();
  mcMajScore();
  enregistrer(mc.card, 0, false, { indices: mc.indices, essais: mc.essais, revele: true });
  showFeedback(false, 'La réponse : ' + escHtml(motComplet(mc.card)),
    boutonEcouterHtml(mc.card.lu) + attentionHtml(attentionItem(mc.card, 'flashcards')) +
    rappelHtml('Ce mot reviendra à la fin de l\'étape.', 'Tu le retrouveras dans « Refaire mes erreurs » et dans tes révisions.'), echouer);
}

// ─── ÉTAPES 2 ET 3 : QUIZ ET TROUS (choix multiples) ────────────────────────
function renderQuizP(q) {
  // SPEC 79 : quiz d'écoute pour la leçon 0. Audio LOD déjà présent : jamais de
  // synthèse, ni de fallback silencieux. Son libellé accessible ne dévoile pas
  // le mot attendu avant que l'apprenant ait répondu.
  // SPEC 82 : les 20 audios de la leçon 0 ont un chemin LOD vérifié dans le JSON :
  // le bouton apparaît immédiatement, même si l'index général se charge encore.
  const audioDirect = q.audioFichier && /^lod\/[A-Za-z0-9_-]+\.mp3$/.test(q.audioFichier)
    ? '<button type="button" class="bouton-ecouter compact" ' +
      'onclick="event.stopPropagation();jouerAudio(\'' + q.audioFichier + '\',this)" ' +
      'aria-label="Écouter le mot à reconnaître">' + ICONE_ECOUTER + '</button>'
    : '';
  const audioEcoute = audioDirect || (q.audioMot
    ? boutonEcouterHtml(q.audioMot, true).replace(/aria-label="[^"]*"/, 'aria-label="Écouter le mot à reconnaître"')
    : '');
  // Si un distracteur est identique à la réponse, on le remplace (comme le quiz v1).
  const choix = melanger(q.distracteurs.map(d => d === q.reponse ? '—' : d).concat([q.reponse]));
  document.getElementById('pc-body').innerHTML =
    '<div class="pc-question">' +
      '<div class="pc-mini-label">' + escHtml(q.label || 'CHOISIS') + '</div>' +
      '<div class="pc-question-mot">' + escHtml(q.question) + '</div>' +
      (audioEcoute ? '<div class="pc-quiz-audio">' + audioEcoute + '</div>' : '') +
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
      rappelHtml('Cette question reviendra à la fin de l\'étape.', 'Tu la retrouveras dans « Refaire mes erreurs » et dans tes révisions.'), echouer);
  }
}

// ─── ÉTAPE 4 : ÉCRITURE ─────────────────────────────────────────────────────
let ecrEssais = 0;      // essais ratés sur la phrase en cours
let ecrCoquille = false; // correction gratuite déjà utilisée sur cette phrase (spec 24)

// Aide vocabulaire (spec 42) : les mots nouveaux qui ne sont pas l'objet de
// l'exercice, déclarés dans la leçon (« aide_vocab »). Fermée par défaut,
// ouverte d'un appui, sans aucune pénalité. Jamais la réponse entière.
function aideVocabHtml(item) {
  const aides = item && item.aide_vocab;
  if (!aides || !aides.length) return '';
  return '<details class="aide-vocab"><summary>Aide vocabulaire</summary><ul>' +
    aides.map(a => '<li><span>' + escHtml(a.fr) + '</span> → <b lang="lb">' + escHtml(a.lu) + '</b>' +
      (a.precision ? '<em>' + escHtml(a.precision) + '</em>' : '') + '</li>').join('') +
    '</ul></details>';
}

function renderEcriturePc(e) {
  ecrEssais = 0;
  ecrCoquille = false;
  document.getElementById('pc-body').innerHTML =
    '<div class="pc-question">' +
      '<div class="pc-mini-label">ÉCRIS EN LUXEMBOURGEOIS</div>' +
      '<div class="pc-question-mot">' + escHtml(e.fr) + '</div>' +
    '</div>' + aideVocabHtml(e) +
    '<div class="mc-erreur hidden" id="pc-ecr-erreur"></div>' +
    '<label class="pc-input-label" for="pc-ecr-input">Ta réponse</label>' +
    '<textarea id="pc-ecr-input" class="ecr-input" rows="2" placeholder="Tape ta réponse…"' +
      ' autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false"></textarea>' +
    '<div class="pc-actions"><button class="pc-btn primary wide" id="pc-ecr-valider" onclick="ecrValiderPc()">Valider</button></div>';

  const input = document.getElementById('pc-ecr-input');
  input.addEventListener('keydown', ev => {
    if (ev.key !== 'Enter' || ev.shiftKey) return;
    ev.preventDefault();
    ev.stopPropagation();
    if (pAttente) continuerParcours();
    else ecrValiderPc();
  });
  input.addEventListener('input', () => { document.getElementById('pc-ecr-valider').textContent = 'Valider'; });
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
  const reconnue = reponseReconnue(val, e); // SPEC 50 : réponse principale ou variante déclarée
  const ok = !!reconnue;
  const autres = autresReponsesAcceptees(e, reconnue);
  const variantesHtml = autres.length
    ? '<div class="pc-fb-variante">Autre formulation correcte : <b>' +
      autres.map(escHtml).join('</b> · <b>') + '</b></div>'
    : '';

  if (ok && ecrEssais === 0) {
    enregistrer(e, 1, true);
    input.disabled = true;
    input.className = 'ecr-input correct';
    showFeedback(true, 'Juste !', '<b>' + escHtml(reconnue) + '</b>' + boutonEcouterHtml(e.lu) +
      variantesHtml + attentionHtml(attention), reussir);
    return;
  }
  if (ok) {
    input.disabled = true;
    input.className = 'ecr-input correct';
    showFeedback(true, 'Juste, au 2e essai', '<b>' + escHtml(reconnue) + '</b>' + boutonEcouterHtml(e.lu) +
      variantesHtml + attentionHtml(attention) +
      rappelHtml('Pour la valider, trouve-la du premier coup : elle reviendra à la fin de l\'étape.',
        'Elle est notée à revoir : tu la retrouveras dans tes révisions.'), echouer);
    return;
  }

  // Spec 24 : une coquille probable se corrige gratuitement, une fois par phrase.
  // Rien n'est enregistré tant que la décision n'est pas prise.
  if (ecrEssais === 0 && !ecrCoquille) {
    const analyse = analyserReponse(val, e.lu);
    if (analyse.correctionGratuiteAutorisee) {
      ecrCoquille = true;
      afficherCoquille(document.getElementById('pc-ecr-erreur'), analyse);
      document.getElementById('pc-ecr-valider').textContent = 'Corriger ma saisie';
      fermerClavier();
      focusSiClavierPhysique(input);
      return;
    }
  }

  ecrEssais++;
  if (ecrEssais === 1) {
    enregistrer(e, 0, false); // une vraie erreur compte dès le 1er essai
    const err = document.getElementById('pc-ecr-erreur');
    err.classList.remove('hidden', 'coquille');
    err.innerHTML = '<b>Pas encore</b> · Ton essai : ' + escHtml(val) + ' · corrige ta réponse' +
      aideErreurHtml(val, e, attention, 1);
    // La réponse reste dans le champ pour la corriger ; le clavier se ferme
    // pour laisser lire l'aide. Une seule action : « Réessayer ».
    document.getElementById('pc-ecr-valider').textContent = 'Réessayer';
    fermerClavier();
    focusSiClavierPhysique(input);
    return;
  }

  input.disabled = true;
  input.className = 'ecr-input wrong';
  document.getElementById('pc-ecr-erreur').classList.add('hidden');
  showFeedback(false, 'Pas encore',
    'Réponse attendue : <b>' + escHtml(e.lu) + '</b>' + boutonEcouterHtml(e.lu) + attentionHtml(attention) +
    rappelHtml('Cette phrase reviendra à la fin de l\'étape.', 'Tu la retrouveras dans « Refaire mes erreurs » et dans tes révisions.'), echouer);
}

// « Possible faute de frappe » : sans révéler la réponse, on montre le mot à vérifier.
function afficherCoquille(zone, analyse) {
  zone.classList.remove('hidden');
  zone.classList.add('coquille');
  zone.innerHTML = '<b>Possible faute de frappe</b> · Tu peux corriger ta saisie sans pénalité.' +
    (analyse.mot && analyse.mot.saisi ? '<div class="pc-attention">Vérifie « ' + escHtml(analyse.mot.saisi) + ' ».</div>' : '');
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
  // 1re fois que cette unité est terminée : animation complète sur le chemin (spec 27).
  const premiereReussite = run.mode === 'unite' && getUnitBest(run.leconId, run.uniteId) == null;

  // Étoiles et « Sans faute » : seulement pour une unité complète ou la leçon complète.
  // Le « Sans faute » se gagne une fois et ne se perd jamais.
  let nouveauSansFaute = false;
  if (run.mode === 'unite' || run.mode === 'lecon') {
    const unites = run.mode === 'unite' ? [trouverUnite(pLecon, run.uniteId)] : pLecon.unites;
    unites.forEach(u => {
      const b = run.mode === 'unite' ? { percent: total, sansFaute: global.sansFaute } : bilanUnite(run.steps, u.id);
      const ancien = getUnitBest(run.leconId, u.id);
      // Le détail accompagne uniquement le meilleur score réellement obtenu.
      // Les items « + » sont exclus même depuis une leçon complète.
      if (b.percent < 90 && (ancien == null || b.percent >= ancien)) {
        const snapshot = capturerDetailRattrapage(pLecon, u.id, run.steps);
        if (snapshot && snapshot.basePercent === b.percent)
          saveRattrapageSnapshot(run.leconId, u.id, snapshot);
      }
      saveUnitBest(run.leconId, u.id, b.percent);
      if (b.sansFaute && !getSansFaute(run.leconId, u.id)) {
        saveSansFaute(run.leconId, u.id);
        nouveauSansFaute = true;
      }
    });
  }
  // Le rattrapage n'est jamais une unité complète : ni badge « Sans faute »,
  // ni progression de mission, même en cas de réussite parfaite.
  const resultatRattrapage = run.mode === 'rattrapage' ? appliquerResultatRattrapage(run) : null;
  // Le « + » est fait dès qu'on l'a joué en entier (les erreurs reviennent en révision).
  if (run.mode === 'plus' || run.mode === 'lecon') {
    const unites = run.uniteId === TOUTE_LA_LECON ? pLecon.unites : [trouverUnite(pLecon, run.uniteId)];
    unites.forEach(u => { if (aDuPlus(pLecon, u.id)) savePlusFait(run.leconId, u.id); });
  }
  if (run.mode === 'unite' || run.mode === 'lecon' || run.mode === 'plus') {
    marquerUniteFaite(); // une partie complète finie : objectif « unité » du jour (S7)
    dernierFini = { leconId: run.leconId, uniteId: run.uniteId, premiere: premiereReussite }; // animé sur le chemin
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

  // Nombre de questions de la partie (pour « 6 / 7 réponses justes »).
  const nbQuestions = run.steps.reduce((n, s) => n + Object.keys(s.details).length, 0);

  pResultat = {
    leconId: run.leconId, uniteId: run.uniteId, mode: run.mode, total, etapes, erreurs, lignes, nbQuestions,
    typeEtape: run.mode === 'etape' && run.steps.length === 1 ? run.steps[0].type : null,
    sansFaute: global.sansFaute && (run.mode === 'unite' || run.mode === 'lecon'),
    nouveauSansFaute,
    nouvelleComplete: !etaitComplete && leconComplete(pLecon),
    rattrapage: resultatRattrapage
  };
  const etaitLibre = !!run.libre;
  run = null;
  clearRun(etaitLibre); // l'autre emplacement reste intact
  renderFin();
  showView('view-pfin');
  animerFin(pResultat.sansFaute); // score qui compte, étoiles, confettis (S12)
}

// Message de félicitations selon le score (spec 28). Purement visuel :
// aucun seuil pédagogique n'en dépend.
function messageResultat(percent) {
  if (percent >= 100) return 'Parfait !';
  if (percent >= 90) return 'Excellent !';
  if (percent >= 75) return 'Bien joué !';
  if (percent >= 50) return 'Tu progresses !';
  return 'Continue à t\'entraîner';
}

// « Une réponse à retravailler. », « 3 réponses à retravailler. »
function texteARetravailler(n) {
  if (!n) return '';
  return (n === 1 ? 'Une réponse' : n + ' réponses') + ' à retravailler.';
}

function renderFin() {
  const r = pResultat;
  const complete = r.mode === 'unite' || r.mode === 'lecon';
  const u = r.uniteId === TOUTE_LA_LECON ? null : trouverUnite(pLecon, r.uniteId);
  let titre;
  if (r.mode === 'unite') titre = (u.bonus ? 'BONUS' : 'UNITÉ ' + r.uniteId) + ' TERMINÉE';
  else if (r.mode === 'lecon') titre = 'LEÇON ' + numLecon(r.leconId) + ' TERMINÉE';
  else if (r.mode === 'plus') titre = '« + » TERMINÉ';
  else if (r.mode === 'erreurs') titre = 'ERREURS REFAITES';
  else if (r.mode === 'rattrapage') titre = 'DÉFI DE RATTRAPAGE';
  else if (r.typeEtape) titre = 'ÉTAPE ' + etapeInfo(r.typeEtape).label.toUpperCase() + ' TERMINÉE';
  else titre = 'ÉTAPE TERMINÉE';

  // Le message d'abord, puis le score ; les réponses justes mises en avant.
  // Les étoiles restent réservées à une unité (ou une leçon) complète.
  const justes = Math.max(0, (r.nbQuestions || 0) - r.erreurs.length);
  const encourageant = r.total >= 75;
  let html = '<div class="pf-haut">' +
    '<div class="pc-mini-label pc-accent">' + titre + '</div>' +
    (complete ? '<div class="pf-stars">' + etoilesHtml(etoiles(r.total)) + '</div>' : '') +
    '<div class="pf-bravo">' + messageResultat(r.total) + '</div>' +
    '<div class="pf-score' + (encourageant ? ' encourageant' : '') + '">' + r.total + ' %</div>' +
    (r.nbQuestions ? '<div class="pf-justes"><b>' + justes + '</b> / ' + r.nbQuestions + ' réponses justes du premier coup</div>' : '') +
    (r.erreurs.length ? '<div class="pf-sous">' + texteARetravailler(r.erreurs.length) + '</div>' : '') +
    (complete ? '<div class="pf-sous">3 étoiles à partir de 90 %</div>'
              : r.mode === 'plus' ? '<div class="pf-sous">Les nouveaux mots rejoignent tes révisions</div>' : '') +
    '</div>';

  if (r.rattrapage) {
    const rr = r.rattrapage;
    html += '<div class="pf-rattrapage"><b>' +
      (rr.ameliore ? 'Étoile récupérée !' : 'Continue à t’entraîner !') + '</b>' +
      '<span>Meilleur score de l’unité : ' + rr.avant + ' % → ' + rr.apres + ' %.</span>' +
      (rr.source === 'historique' ?
        '<small>Défi ciblé sur une ancienne partie · 90 % requis, sans badge « Sans faute ».</small>' :
        '<small>Score recalculé à partir de tes questions retravaillées.</small>') +
      '</div>';
  }
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

  // À retravailler : repliable, ouvert d'office s'il y a peu de lignes.
  if (r.lignes.length) {
    html += '<details class="pf-details"' + (r.lignes.length <= 3 ? ' open' : '') + '>' +
      '<summary class="pf-titre-liste"><span class="pc-mini-label">À RETRAVAILLER · ' + r.lignes.length + '</span>' +
      '<span class="pf-note">reviendront dans tes révisions</span></summary><div class="pf-liste">' +
      r.lignes.map(l => '<div class="pf-ligne"><div><b>' + escHtml(l.lu) + '</b><span>' + escHtml(l.fr) + '</span>' +
        (l.attention ? '<span class="pf-attention">' + l.attention + '</span>' : '') +
        '</div><em>' + escHtml(l.raison) + '</em></div>').join('') + '</div></details>';
  } else if (!r.sansFaute) {
    html += '<div class="pf-parfait">Aucune erreur, tout était juste du premier coup.</div>';
  }

  // Actions secondaires dans le contenu ; l'action principale, fixe en bas.
  const suite = suiteFin(r, u);
  html += '<div class="pf-boutons">' + boutonsFinHtml(r, u, suite) + '</div>';
  document.getElementById('pf-content').innerHTML = html;
  document.getElementById('pf-cta').innerHTML =
    '<button class="pc-btn primary wide big" id="pf-suite" onclick="' + suite.onclick + '">' + escHtml(suite.libelle) + ' →</button>';
}

// L'action principale de fin de partie (spec 20) — même logique qu'avant :
//   unité terminée et suivante disponible → Unité suivante ;
//   dernière unité du fil, ou « + » avec une mission jamais jouée → Jouer la mission ;
//   sinon → Mon chemin (spec 45 : chemin principal, leçon dépliée et cadrée).
function suiteFin(r, u) {
  if (r.mode === 'unite' && u && !u.bonus) {
    const fil = unitesCoeur(pLecon);
    const suivante = fil[fil.findIndex(x => x.id === u.id) + 1];
    if (suivante) return { libelle: 'Unité suivante', onclick: 'openIntro(' + suivante.id + ')', retour: false };
    if (pLecon.scene) return { libelle: 'Jouer la mission', onclick: 'openMission()', retour: false };
  } else if (r.mode === 'plus' && pLecon.scene && !missionReussie(pLecon)) {
    return { libelle: 'Jouer la mission', onclick: 'openMission()', retour: false };
  }
  // Tout retour depuis un résultat mène au chemin principal, la leçon dépliée
  // et cadrée — jamais à la liste des unités (spec 45, étend la spec 44).
  return { libelle: 'Mon chemin', onclick: 'cheminSurLecon(pLecon.id)', retour: true };
}

// Actions secondaires de fin de partie (le bouton principal est fixe en bas) :
// refaire ses erreurs, « Élargir », retour à la leçon (s'il n'est pas déjà
// l'action principale), accueil.
function boutonsFinHtml(r, u, suite) {
  let html = '';
  if (r.erreurs.length) {
    html += '<button class="pc-btn wide" onclick="refaireErreurs()">Refaire mes erreurs</button>';
  }
  // « Élargir » : proposé juste après le cœur, quand la phrase vient d'être acquise.
  if (r.mode === 'unite' && u && aDuPlus(pLecon, u.id)) {
    const nb = nbItems(pLecon, u.id, 'plus');
    html += '<button class="pc-btn plus wide" onclick="startUnite(' + u.id + ', \'plus\')">' +
      (getPlusFait(pLecon.id, u.id) ? '✓ ' : '') + 'Élargir : ' + textePlus(pLecon, u.id) + ' de plus · ' + minutesPour(nb) + ' min</button>';
  }
  if (!suite.retour) {
    html += '<button class="pc-btn ghost wide" onclick="cheminSurLecon(pLecon.id)">Mon chemin</button>'; // spec 45
  }
  html += '<button class="pc-btn ghost wide" onclick="goDashboard()">Accueil</button>'; // toujours en dernier (S9)
  return html;
}

function refaireErreurs() {
  // Si l'on vient de terminer une unité à 2 étoiles avec détail disponible,
  // ce lien ne doit plus faire rater la possibilité de gagner la 3e étoile.
  const u = trouverUnite(pLecon, pResultat.uniteId);
  if (pResultat.mode === 'unite' && u && detailRattrapageValide(pLecon, u.id) &&
      peutRattraperEtoile(pLecon, u)) {
    lancerRattrapageEtoile(u.id);
    return;
  }
  startUnite(pResultat.uniteId, 'erreurs', pResultat.erreurs);
}

// ─── PANNEAU COURS ──────────────────────────────────────────────────────────
// uniteId = null -> toute la leçon. Pendant un exercice, on ouvre sur l'unité.
function ouvrirCours(uniteId) {
  pCoursUnite = uniteId == null ? null : uniteId;
  if (cours75Actif(pLecon)) cours75Etats.panneau = null;
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

  if (cours75Actif(l)) {
    document.getElementById('cp-onglets').innerHTML = '';
    const uniteExo = uniteDeLExercice();
    const limite = uniteExo != null && pCoursUnite === uniteExo;
    document.getElementById('cp-content').innerHTML = cours75Html(l, 'panneau', pCoursUnite, limite);
    document.getElementById('cp-content').scrollTop = 0;
    return;
  }

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
