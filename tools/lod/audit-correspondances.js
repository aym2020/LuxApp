// SPEC 73 — Phase A : audit des mots isolés sans son et des « faux absents » du LOD.
//
//   node tools/lod/audit-correspondances.js --articles new_lod-art.xml --tables new_lod-tab.xml [--recherche new_lod-search.xml] [--hors-ligne]
//
// Lit les exports officiels LOD (non versionnés) et écrit, sans rien modifier d'autre :
//   docs/audit-correspondances-lod.md    rapport lisible
//   docs/audit-correspondances-lod.json  inventaire complet (un objet par élément)
//
// Sources :
//   articles  : lemme, variante règle du n (nRuleForm), pluriels (inflection type="plural"),
//               participes passés (pastParticiple), locutions (secondaryHeadword), sens, exemples.
//   tables    : conjugaisons (verbConjugation) et déclinaisons (adjDeclension).
//   recherche : index de la recherche LOD (graphies suggest="true" = contrôlées) — optionnel ici.
// Aucune suppression d'accent : seules la casse et l'apostrophe typographique sont unifiées.
//
// Deux statuts séparés par élément :
//   correspondance : LEMME_EXACT | FORME_FLECHIE_VALIDEE | GRAPHIE_A_VERIFIER | SENS_AMBIGU | PAS_D_ENTREE
//   audio          : SON_EXACT_DISPONIBLE | ENTREE_SANS_AUDIO_EXACT | AUDIO_INDISPONIBLE | CONTEXTE_CANDIDAT | AUCUN
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { RACINE, motCarte, phraseCle, majuscule, lireIndex, tableDirecte, elementsLecon, lecons } = require('./commun');

const MIROIR = 'https://raw.githubusercontent.com/robertoentringer/lod-mp3-mirror/master/2020-12-18-lod-opendata/';
const SORTIE_MD = path.join(RACINE, 'docs/audit-correspondances-lod.md');
const SORTIE_JSON = path.join(RACINE, 'docs/audit-correspondances-lod.json');

function arg(nom) {
  const i = process.argv.indexOf('--' + nom);
  return i > 0 ? process.argv[i + 1] : null;
}
// NFC : même accent, même encodage (é composé ou décomposé) ; aucun accent n'est retiré.
const norm = t => String(t).normalize('NFC').toLowerCase().replace(/[’`]/g, "'").trim();
const sansS = m => m.replace(/(s|x)$/, '');

// ─── Sources officielles ────────────────────────────────────────────────────
function lireArticles(fichier) {
  const xml = fs.readFileSync(fichier, 'utf8');
  const entrees = {};
  for (const m of xml.split('<entry id="').slice(1)) {
    const id = m.slice(0, m.indexOf('"'));
    const lemme = (m.match(/<lemma[^>]*>([^<]*)<\/lemma>/) || [])[1];
    if (!lemme) continue;
    const pos = m.match(/<partOfSpeech([^>]*)>([^<]*)<\/partOfSpeech>/) || [];
    const fr = [];
    for (const b of m.match(/<targetLanguage lang="fr">[\s\S]*?<\/targetLanguage>/g) || []) {
      for (const t of b.match(/<translation>([^<]*)<\/translation>/g) || []) fr.push(t.replace(/<\/?translation>/g, ''));
    }
    const formes = [];
    const nRule = (m.match(/<lemma nRuleForm="([^"]*)"/) || [])[1];
    if (nRule) formes.push({ forme: nRule, type: 'variante règle du n' });
    for (const b of m.match(/<inflection type="plural">[\s\S]*?<\/inflection>/g) || []) {
      // <form nRuleForm="Grompere" rare="true">Gromperen</form> : attributs facultatifs.
      for (const f of b.match(/<form[^>]*>[^<]*<\/form>/g) || []) {
        formes.push({ forme: f.replace(/<[^>]*>/g, ''), type: 'pluriel' + (/rare="true"/.test(f) ? ' (rare)' : '') });
        const n = (f.match(/nRuleForm="([^"]*)"/) || [])[1];
        if (n) formes.push({ forme: n, type: 'pluriel, variante règle du n' });
      }
    }
    for (const p of m.match(/<pastParticiple[^>]*>[^<]*<\/pastParticiple>/g) || []) {
      formes.push({ forme: p.replace(/<[^>]*>/g, ''), type: 'participe passé' });
    }
    const locutions = (m.match(/<secondaryHeadword>([^<]*)<\/secondaryHeadword>/g) || []).map(s => s.replace(/<\/?secondaryHeadword>/g, ''));
    const exemples = [];
    for (const ex of m.match(/<example id="[^"]+"[^>]*>[\s\S]*?<\/example>/g) || []) {
      const formesEx = (ex.match(/<inflectedHeadword>([^<]*)<\/inflectedHeadword>/g) || []).map(h => h.replace(/<\/?inflectedHeadword>/g, ''));
      exemples.push({ id: ex.match(/<example id="([^"]+)"/)[1], formes: formesEx });
    }
    const cats = (m.match(/<category>([^<]*)<\/category>/g) || []).map(c => c.replace(/<\/?category>/g, ''));
    // Entrée « variante » sans traduction propre : <internalLink idRef="AWAR1" relation="Variant">Awar</internalLink>
    const variante = (m.match(/<internalLink idRef="([^"]+)" relation="Variant">/) || [])[1] || null;
    entrees[id] = { variante,
      id, lemme, nRule: nRule || null, categorie: pos[2] || '', genre: ((pos[1] || '').match(/gen="([^"]*)"/) || [])[1] || '',
      ipa: (m.match(/<ipa>([^<]*)<\/ipa>/) || [])[1] || '', fr, formes, locutions, exemples,
      niveau: cats.some(c => /(^| )A1$/.test(c)) ? 'A1' : cats.some(c => /(^| )A2$/.test(c)) ? 'A2' : '',
    };
  }
  // Le sens d'une variante est celui de l'entrée vers laquelle elle renvoie.
  for (const e of Object.values(entrees)) {
    if (!e.fr.length && e.variante && entrees[e.variante]) { e.fr = entrees[e.variante].fr; e.varianteDe = entrees[e.variante].lemme; }
  }
  return entrees;
}

// Distance d'édition (graphies proches pour les mots sans entrée).
function distance(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) {
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  }
  return d[a.length][b.length];
}

function lireTables(fichier) {
  const xml = fs.readFileSync(fichier, 'utf8');
  const formes = {}; // id → [{forme, type}]
  for (const b of xml.split('<inflection>').slice(1)) {
    const t = b.match(/<(verbConjugation|adjDeclension) id="([^"]+)"/);
    if (!t) continue;
    const type = t[1] === 'verbConjugation' ? 'forme verbale (table)' : 'forme adjectivale (table)';
    const liste = formes[t[2]] = formes[t[2]] || [];
    const vus = new Set();
    // Temps composés (auxiliaire + participe) et auxiliaire exclus : « si », « war »… ne sont pas des formes de ce verbe.
    const simple = b.replace(/<(presentPerfect|pastPerfect|auxiliaryVerb)>[\s\S]*?<\/\1>/g, '');
    for (const v of simple.match(/>([^<>]+)</g) || []) {
      // « gaangen / gaang » → gaangen, gaang ; une valeur de plusieurs mots (« ginn eraus ») est ignorée.
      // « méchs (dech) » : le pronom réfléchi entre parenthèses n'appartient pas à la forme.
      for (const alt of v.slice(1, -1).replace(/\(.*?\)/g, ' ').split('/')) {
        const mot = alt.trim();
        if (mot && !/\s/.test(mot) && !vus.has(mot)) { vus.add(mot); liste.push({ forme: mot, type }); }
      }
    }
  }
  return formes;
}

// Index de recherche LOD (si fourni) : graphies suggest="true" contrôlées, les autres générées.
// Lecture prudente : on ne retient que les attributs effectivement présents.
function lireRecherche(fichier) {
  if (!fichier) return null;
  const xml = fs.readFileSync(fichier, 'utf8');
  const graphies = {};
  for (const s of xml.match(/<spelling[^>]*>[^<]*<\/spelling>/g) || []) {
    const forme = norm(s.replace(/<[^>]*>/g, ''));
    const controlee = /suggest="true"/.test(s);
    graphies[forme] = graphies[forme] || controlee;
  }
  return graphies;
}

function indexFormes(entrees, tables) {
  const index = {};
  const ajouter = (forme, e, type, source) => {
    const k = norm(forme);
    (index[k] = index[k] || []).push({ id: e.id, lemme: e.lemme, type, source, graphie: forme });
  };
  for (const e of Object.values(entrees)) {
    ajouter(e.lemme, e, 'lemme', 'articles');
    for (const f of e.formes) ajouter(f.forme, e, f.type, 'articles');
    for (const f of tables[e.id] || []) if (norm(f.forme) !== norm(e.lemme)) ajouter(f.forme, e, f.type, 'tables');
  }
  return index;
}

// ─── Éléments isolés des leçons ─────────────────────────────────────────────
const COLONNES_FR = /fran[cç]ais|traduction|sens|explication|remarque|quand|pourquoi|retenir|idée|catégorie|^type|je cherche|^heure$|^nombre$|^genre$|^personne$|possesseur|^dizaine$|^salutation$/i;

function morceauxCellule(cellule) {
  return String(cellule).replace(/<[^>]*>/g, ' ').replace(/\(.*?\)/g, ' ')
    .split(/\s*(?:\/|·|;|,|→|↔|\bou\b)\s*/).map(s => s.trim()).filter(Boolean);
}

function elementsIsoles() {
  const items = new Map(); // lu → { lu, fr, lecons:Set, sections:Set }
  const noter = (lu, fr, lecon, section) => {
    if (!lu || motCarte(lu) === null) return; // expressions : analyse séparée
    if (/^[a-zäëéè]'$/i.test(String(lu).trim())) return; // « d' » seul : fragment d'article
    const it = items.get(lu) || { lu, fr: fr || '', lecons: new Set(), sections: new Set() };
    if (!it.fr && fr) it.fr = fr;
    it.lecons.add(lecon); it.sections.add(section);
    items.set(lu, it);
  };
  for (const L of lecons()) {
    const l = L.lecon;
    const nom = L.niveau + ' L' + L.id;
    for (const c of l.flashcards || []) noter(c.lu, c.fr, nom, 'cartes');
    for (const b of l.cours || []) {
      if (b.type === 'vocab' || b.type === 'exemple') (b.items || []).forEach(([lu, fr]) => noter(lu, fr, nom, 'cours'));
      if (b.type === 'tableau') {
        const colFr = (b.entetes || []).findIndex(h => /fran[cç]ais|traduction|^sens/i.test(h));
        (b.lignes || []).forEach(ligne => ligne.forEach((cel, i) => {
          if (COLONNES_FR.test((b.entetes || [])[i] || '')) return;
          for (const m of morceauxCellule(cel)) noter(m, colFr >= 0 ? String(ligne[colFr]).replace(/<[^>]*>/g, '') : '', nom, 'tableau');
        }));
      }
    }
  }
  return [...items.values()];
}

// ─── Audio ──────────────────────────────────────────────────────────────────
const cacheMiroir = {};
function miroir(id, horsLigne) {
  if (horsLigne) return 'non vérifié (hors ligne)';
  if (cacheMiroir[id]) return cacheMiroir[id];
  let code = '';
  try {
    code = execFileSync('curl', ['-sS', '-o', '/dev/null', '-I', '-w', '%{http_code}', '--max-time', '20', MIROIR + id + '.mp3'],
      { stdio: ['ignore', 'pipe', 'ignore'] }).toString();
  } catch (e) { code = 'réseau'; }
  return (cacheMiroir[id] = code === '200' ? 'disponible' : code === '404' ? 'absent du miroir (404)' : 'erreur réseau (' + code + ')');
}

// Le sens LOD correspond-il à la traduction LuxApp ? (pluriels français tolérés : chaises / chaise)
const VIDES_FR = new Set(['le', 'la', 'les', "l'", 'un', 'une', 'des', 'du', 'de', 'et', 'ou', 'a', 'au', 'aux', 'en', 'se', "s'", 'ce', 'sont', 'est']);
function motsFr(t) {
  // Côté français seulement : accents retirés pour comparer « allé » et « aller » (jamais côté luxembourgeois).
  return String(t).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\(.*?\)/g, ' ').replace(/’/g, "'").split(/[^a-zœ']+/)
    .map(m => m.replace(/^(l|d|s|qu|j|n|m|t)'/, '')).filter(m => m.length > 1 && !VIDES_FR.has(m)).map(sansS);
}
// Radical commun (excusez / excuser, mariée / marié) : même début sur 5 lettres au moins.
const radicalProche = (a, b) => a === b || (a.length >= 4 && b.length >= 4 && a.slice(0, 4) === b.slice(0, 4) && Math.abs(a.length - b.length) <= 3);
function sensCorrespond(frLuxApp, frLod, strict) {
  const carte = motsFr(frLuxApp);
  const egal = strict ? (x, y) => x === y : radicalProche;
  return frLod.some(tr => { const l = motsFr(tr); return l.length > 0 && l.every(m => carte.some(c => egal(c, m))); });
}

// ─── Audit ──────────────────────────────────────────────────────────────────
// Classe un mot isolé de LuxApp (it = { lu, fr, lecons, sections }) : correspondance, audio, contexte.
// ctx = { entrees, formes, recherche, textes, phrasesDispo, horsLigne }
function classer(it, ctx) {
  const { entrees, formes, recherche, textes, phrasesDispo } = ctx;
  const opts = { horsLigne: ctx.horsLigne };
  const mot = motCarte(it.lu);
  // Graphie affichée (sans article ni ponctuation), casse conservée : « Sproochen » (nom) ≠ « sproochen » (verbe).
  const affiche = it.lu.replace(/\(.*?\)/g, ' ').replace(/[!?.,;:«»"]/g, ' ').replace(/’/g, "'").trim().split(/\s+/).pop();
  let candidats = formes[norm(mot)] || [];
  const memeCasse = candidats.filter(c => c.graphie === affiche);
  if (memeCasse.length) candidats = memeCasse;
  // Variante règle du n non listée (« éischte » ← « éischten ») : candidate, graphie à vérifier.
  let derivee = false;
  if (!candidats.length && formes[norm(mot) + 'n']) {
    candidats = formes[norm(mot) + 'n'].map(c => ({ ...c, type: 'variante règle du n dérivée de « ' + c.graphie + ' »' }));
    derivee = true;
  }
  const r = {
    lu: it.lu, fr: it.fr, forme: mot, lecons: [...it.lecons], sections: [...it.sections],
    candidats: [], correspondance: 'PAS_D_ENTREE', audio: 'AUCUN', id: null, lemme: null, type: null,
    categorie: null, sens: null, source: null, graphie: null, son: null, contexte: [], decision: '', justification: '',
  };
  // Regrouper par entrée ; garder le type le plus direct (lemme d'abord).
  const parEntree = new Map();
  for (const c of candidats) {
    const e = entrees[c.id];
    const prec = parEntree.get(c.id);
    if (!prec || c.type === 'lemme') parEntree.set(c.id, { ...c, categorie: e.categorie, fr: e.fr, niveau: e.niveau, sens: sensCorrespond(it.fr, e.fr) });
  }
  r.candidats = [...parEntree.values()].slice(0, 8).map(c => ({ id: c.id, lemme: c.lemme, type: c.type, source: c.source, categorie: c.categorie,
    sens_lod: c.fr.slice(0, 4).join(', '), sens_correspond: c.sens }));
  // Cellule de tableau sans traduction : le sens ne peut pas départager ; une seule entrée candidate suffit.
  if (!it.fr && parEntree.size === 1) for (const c of parEntree.values()) c.sens = true;
  // Numéraux : « 2 (féminin) » ↔ « deux » ; la catégorie NB et un chiffre dans la traduction suffisent.
  for (const c of parEntree.values()) if (c.categorie === 'NB' && /\d/.test(it.fr)) c.sens = true;
  let bons = [...parEntree.values()].filter(c => c.sens);
  // Une seule entrée de rattachement possible (forme fléchie d'un seul lemme) : le sens vient de l'entrée.
  const lemmes = new Set([...parEntree.values()].map(c => norm(c.lemme) + '|' + c.categorie));
  const flechies = [...parEntree.values()].every(c => c.type !== 'lemme');
  if (!bons.length && flechies && lemmes.size === 1) bons = [...parEntree.values()];
  // Cellule de tableau sans traduction, homographes d'un même lemme et d'une même catégorie, même API :
  // le mot isolé se prononce de la même façon quel que soit le sens.
  if (!bons.length && !it.fr && lemmes.size === 1 && new Set([...parEntree.values()].map(c => entrees[c.id].ipa)).size === 1) bons = [[...parEntree.values()][0]];
  // Homographes d'un même lemme (deux entrées « sinn ») : même forme, même prononciation si l'API est identique.
  if (bons.length > 1 && new Set(bons.map(b => norm(b.lemme) + '|' + b.categorie)).size === 1) {
    const ipas = new Set(bons.map(b => entrees[b.id].ipa));
    if (bons.every(b => b.type !== 'lemme') || ipas.size === 1) {
      bons.sort((a, b) => (b.sens ? 1 : 0) - (a.sens ? 1 : 0));
      bons = [bons[0]];
    }
  }
  if (!candidats.length && mot.length >= 5) {
    // Graphie LOD proche (« aachtzeg » ↔ « achtzeg ») : candidate à vérifier, jamais validée d'office.
    // Seulement si le sens LOD correspond aussi (« Hallo » ≠ « Hall », « Kommod » ≠ « Komerod »).
    // Sens strict (« Française » ≠ « Français ») ; tolérance seulement participe ↔ infinitif (« fiancé » ≈ « fiancer »).
    const bonSens = c => { const e = entrees[c.id];
      return !it.fr || sensCorrespond(it.fr, e.fr, true) || (c.type === 'participe passé' && sensCorrespond(it.fr, e.fr)) || (e.categorie === 'NB' && /\d/.test(it.fr)); };
    const graphiesProches = Object.keys(formes).filter(f => Math.abs(f.length - mot.length) <= 2 && f[0] === norm(mot)[0] &&
      distance(f, norm(mot)) <= 2 && formes[f].some(bonSens)).sort((a, b) => distance(a, norm(mot)) - distance(b, norm(mot)));
    const proches = graphiesProches;
    if (proches.length) {
      const c = formes[proches[0]].find(bonSens);
      const e = entrees[c.id];
      Object.assign(r, { id: c.id, lemme: c.lemme, type: c.type, categorie: e.categorie, sens: e.fr.slice(0, 4).join(', '), source: c.source + ' LOD 2026-07-27' });
      r.correspondance = 'GRAPHIE_A_VERIFIER';
      r.graphie = 'LuxApp « ' + mot + ' » ; LOD : ' + proches.slice(0, 3).map(f => '« ' + formes[f][0].graphie + ' »').join(' ou ');
      r.audio = 'AUCUN';
      r.decision = 'Vérifier l\'orthographe : si « ' + c.graphie + ' » est la bonne graphie, corriger la leçon puis associer le son';
      r.justification = 'Pas d\'entrée « ' + mot + ' » ; graphie LOD proche : ' + proches.slice(0, 3).map(f => formes[f][0].graphie + ' (' + formes[f][0].id + ', ' + formes[f][0].type + ')').join(', ') +
        ' ; sens LOD : ' + (e.fr.slice(0, 3).join(', ') || '—') + '.';
      r.candidats = proches.slice(0, 3).map(f => ({ id: formes[f][0].id, lemme: formes[f][0].lemme, graphie: formes[f][0].graphie, type: formes[f][0].type }));
      return r;
    }
  }
  if (!candidats.length) {
    const voisines = Object.values(entrees).filter(e => e.lemme.length >= 5 && norm(mot).startsWith(norm(e.lemme)) && norm(e.lemme) !== norm(mot))
      .sort((a, b) => b.lemme.length - a.lemme.length).slice(0, 2);
    r.justification = 'Aucune forme identique dans les articles ni dans les tables' + (recherche ? ' ni dans l\'index de recherche' : ' (index de recherche non consulté)') + '.' +
      (voisines.length ? ' Entrée voisine : ' + voisines.map(e => e.lemme + ' (' + e.id + ')').join(', ') + '.' : '');
    r.decision = 'Pas de son ; vérifier la graphie' + (recherche ? '' : ' avec l\'index de recherche');
  } else if (bons.length !== 1) {
    r.correspondance = 'SENS_AMBIGU';
    r.justification = bons.length ? 'Plusieurs entrées correspondent : ' + bons.map(b => b.id).join(', ') + '.' :
      (it.fr ? 'Forme trouvée mais aucun sens LOD ne correspond à « ' + it.fr + ' ».' :
        'Pas de traduction dans le tableau pour départager ' + parEntree.size + ' entrées.');
    r.decision = 'Relecture humaine';
  } else {
    const c = bons.sort((a, b) => (a.type === 'lemme' ? 0 : 1) - (b.type === 'lemme' ? 0 : 1))[0];
    const e = entrees[c.id];
    Object.assign(r, { id: c.id, lemme: c.lemme, type: c.type, categorie: e.categorie, sens: e.fr.slice(0, 4).join(', '), source: c.source + ' LOD 2026-07-27' });
    r.correspondance = c.type === 'lemme' ? 'LEMME_EXACT' : 'FORME_FLECHIE_VALIDEE';
    r.graphie = recherche ? (recherche[norm(mot)] ? 'contrôlée (suggest)' : 'générée : à revoir') :
      derivee ? 'dérivée par la règle du n : à vérifier' : 'forme éditoriale du LOD (' + c.source + ')';
    if ((recherche && !recherche[norm(mot)] && c.type !== 'lemme') || derivee) r.correspondance = 'GRAPHIE_A_VERIFIER';
    if (c.type === 'lemme') {
      r.son = miroir(c.id, opts.horsLigne);
      r.audio = r.son === 'disponible' ? 'SON_EXACT_DISPONIBLE' : r.son.startsWith('absent') ? 'AUDIO_INDISPONIBLE' : 'AUDIO_INDISPONIBLE';
      r.decision = r.audio === 'SON_EXACT_DISPONIBLE' ? 'Associer ' + c.id + '.mp3 (après validation)' : 'Chercher une autre source (M4A officiel) ou un contexte';
      r.local = fs.existsSync(path.join(RACINE, 'public/audio/lod', c.id + '.mp3'));
      r.justification = 'Lemme identique' + (e.varianteDe ? ' (variante de « ' + e.varianteDe + ' »)' : '') + ', sens « ' + r.sens + ' »' +
        (r.son === 'disponible' ? '' : ' ; MP3 : ' + r.son) + (r.local ? ' ; fichier déjà dans le dépôt : seule la clé d\'affichage manque' : '') +
        (parEntree.size > 1 ? ' ; homographes : ' + [...parEntree.keys()].join(', ') : '') + '.';
    } else {
      r.audio = 'ENTREE_SANS_AUDIO_EXACT';
      r.decision = 'Pas de son direct (le MP3 de ' + c.id + ' prononce « ' + c.lemme + ' ») ; audio contextuel si un exemple prononce « ' + mot + ' »';
      r.justification = '« ' + mot + ' » = ' + c.type + ' de ' + c.lemme + ' (' + c.id + '), ' + c.source + '.';
    }
    // Exemples de la même entrée qui prononcent exactement cette forme.
    if (r.audio !== 'SON_EXACT_DISPONIBLE') {
      const exemples = e.exemples.filter(x => x.formes.some(f => norm(f) === norm(mot)) && textes[x.id])
        .map(x => textes[x.id]).sort((a, b) => ({ A1: 0, A2: 1, '': 2 }[a.niveau] - { A1: 0, A2: 1, '': 2 }[b.niveau]) || a.nbMots - b.nbMots);
      r.contexte = exemples.slice(0, 3).map(x => ({ id: x.id, phrase: majuscule(x.texte), mots: x.nbMots, niveau: x.niveau || '—',
        enregistrement: phrasesDispo.has(x.id) ? 'téléchargé' : 'à vérifier (Termux)' }));
      if (r.contexte.length && r.audio !== 'SON_EXACT_DISPONIBLE') r.audio_contexte = 'CONTEXTE_CANDIDAT';
    }
  }
  return r;
}

function auditer(opts) {
  const entrees = lireArticles(opts.articles);
  const tables = lireTables(opts.tables);
  const recherche = lireRecherche(opts.recherche);
  const formes = indexFormes(entrees, tables);
  const lodIndex = lireIndex();
  const sons = JSON.parse(fs.readFileSync(path.join(RACINE, 'public/audio/lod.json'), 'utf8'));
  const direct = tableDirecte(sons);
  const phrasesDispo = new Set(fs.existsSync(path.join(RACINE, 'public/audio/lod-phrases')) ?
    fs.readdirSync(path.join(RACINE, 'public/audio/lod-phrases')).map(f => f.replace('.m4a', '')) : []);
  const textes = {};
  for (const e of lodIndex.utilisables) textes[e.id] = e;

  const ctx = { entrees, formes, recherche, textes, phrasesDispo, horsLigne: opts.horsLigne };
  const inventaire = [];
  for (const it of elementsIsoles()) {
    if (direct(it.lu)) continue; // déjà un son validé
    inventaire.push(classer(it, ctx));
  }
  return { inventaire, nbEntrees: Object.keys(entrees).length, nbTables: Object.keys(tables).length, recherche: !!recherche };
}

// ─── Rapport ────────────────────────────────────────────────────────────────
function ecrire({ inventaire, nbEntrees, nbTables, recherche }, refusActuels) {
  const compte = f => inventaire.filter(f).length;
  const absentsActuels = new Set(refusActuels.absents);
  const faux = inventaire.filter(r => absentsActuels.has(r.lu) && r.correspondance !== 'PAS_D_ENTREE');
  const ligne = r => '| ' + r.lu + ' | ' + (r.fr || '—') + ' | ' + r.lecons.join(', ') + ' · ' + r.sections.join(', ') + ' | ' +
    (r.id ? r.lemme + ' (`' + r.id + '`, ' + r.categorie + ')' : r.candidats.map(c => c.lemme + ' `' + c.id + '`').join(', ') || '—') + ' | ' +
    (r.type || '—') + ' | ' + r.correspondance + ' | ' + r.audio + (r.audio_contexte ? ' + CONTEXTE_CANDIDAT' : '') + ' | ' + r.justification +
    (r.contexte.length ? ' Contexte : « ' + r.contexte[0].phrase + ' » (' + r.contexte[0].enregistrement + ').' : '') + ' |';
  const tableau = liste => '| Texte LuxApp | Traduction | Leçons · sections | Entrée LOD | Type | Correspondance | Audio | Justification |\n|---|---|---|---|---|---|---|---|\n' +
    liste.map(ligne).join('\n');
  const groupes = [
    ['Faux absents : lemme LOD identique', r => r.correspondance === 'LEMME_EXACT'],
    ['Faux absents : forme fléchie rattachée à une entrée', r => r.correspondance === 'FORME_FLECHIE_VALIDEE' || r.correspondance === 'GRAPHIE_A_VERIFIER'],
    ['Sens ambigu ou différent', r => r.correspondance === 'SENS_AMBIGU'],
    ['Aucune entrée trouvée', r => r.correspondance === 'PAS_D_ENTREE'],
  ];
  const parLecon = {};
  for (const r of inventaire) for (const l of r.lecons) {
    const p = parLecon[l] = parLecon[l] || { total: 0, son: 0, contexte: 0, forme: 0, absent: 0, ambigu: 0 };
    p.total++;
    if (r.audio === 'SON_EXACT_DISPONIBLE') p.son++;
    else if (r.audio_contexte) p.contexte++;
    if (r.correspondance === 'FORME_FLECHIE_VALIDEE') p.forme++;
    if (r.correspondance === 'PAS_D_ENTREE') p.absent++;
    if (r.correspondance === 'SENS_AMBIGU') p.ambigu++;
  }
  const nb = {
    total: inventaire.length,
    lemme: compte(r => r.correspondance === 'LEMME_EXACT'),
    flechie: compte(r => r.correspondance === 'FORME_FLECHIE_VALIDEE'),
    graphie: compte(r => r.correspondance === 'GRAPHIE_A_VERIFIER'),
    ambigu: compte(r => r.correspondance === 'SENS_AMBIGU'),
    absent: compte(r => r.correspondance === 'PAS_D_ENTREE'),
    sonDispo: compte(r => r.audio === 'SON_EXACT_DISPONIBLE'),
    sansSon: compte(r => r.audio === 'ENTREE_SANS_AUDIO_EXACT'),
    indispo: compte(r => r.audio === 'AUDIO_INDISPONIBLE'),
    contexte: compte(r => !!r.audio_contexte),
    contexteTelecharge: compte(r => r.contexte.some(c => c.enregistrement === 'téléchargé')),
  };
  const md = `# Audit des correspondances LOD — SPEC 73, phase A

Généré par \`node tools/lod/audit-correspondances.js\`. **Aucune leçon, association audio ni fichier son n'a été modifié.**
Inventaire complet : \`docs/audit-correspondances-lod.json\`.

## Sources

| Source | Version | Utilisée | Contenu exploité |
|---|---|---|---|
| Articles LOD (\`new_lod-art.xml\`) | export 2026-07-27 | oui (${nbEntrees} entrées) | lemmes, variantes règle du n, pluriels, participes passés, locutions, sens, exemples |
| Tables de flexion (\`260727-new-lod-tab.zip\`) | 2026-07-27 | oui (${nbTables} tables) | conjugaisons et déclinaisons (verbes et adjectifs) |
| Index de recherche (\`260727-new-lod-search.zip\`) | 2026-07-27 | **${recherche ? 'oui' : 'non — téléchargement refusé par le proxy de l\'environnement de Claude'}** | graphies contrôlées (\`suggest="true"\`) ou générées |
| Miroir MP3 (robertoentringer/lod-mp3-mirror) | 2020-12-18 | oui (requête HEAD par identifiant) | son du lemme |
| Phrases LOD téléchargées (SPEC 72) | 2026-10-20 | oui | enregistrements d'exemples disponibles |

${recherche ? '' : `Sans l'index de recherche, les formes retenues viennent uniquement des données éditoriales du LOD (articles et tables) : ce sont des graphies officielles,
mais les mots restés sans entrée sont marqués **provisoires** tant que l'index de recherche n'a pas été consulté.
`}
## Synthèse

${nb.total} mots isolés des leçons (cartes, vocabulaire et exemples du cours, cellules de tableaux luxembourgeoises) n'ont pas de son aujourd'hui.

| Correspondance | Nombre |
|---|---:|
| LEMME_EXACT — entrée identique (faux absent ou mot de cours jamais rapproché) | ${nb.lemme} |
| FORME_FLECHIE_VALIDEE — pluriel, participe, forme conjuguée ou déclinée rattachée à une entrée | ${nb.flechie} |
| GRAPHIE_A_VERIFIER | ${nb.graphie} |
| SENS_AMBIGU — forme trouvée, sens ou homographe à départager | ${nb.ambigu} |
| PAS_D_ENTREE${recherche ? '' : ' (provisoire)'} | ${nb.absent} |

| Audio (indépendant de la correspondance) | Nombre |
|---|---:|
| SON_EXACT_DISPONIBLE — MP3 du lemme identique présent sur le miroir : **sons directs récupérables** | ${nb.sonDispo} |
| AUDIO_INDISPONIBLE — lemme identique, mais MP3 absent du miroir | ${nb.indispo} |
| ENTREE_SANS_AUDIO_EXACT — forme attestée, le MP3 de l'entrée prononce le lemme, pas cette forme | ${nb.sansSon} |
| CONTEXTE_CANDIDAT — un exemple de la même entrée prononce exactement la forme (relecture requise) | ${nb.contexte} (dont ${nb.contexteTelecharge} déjà téléchargés) |

**Les ${refusActuels.absents.length} « mots absents du LOD » du rapport précédent** :
${['LEMME_EXACT', 'FORME_FLECHIE_VALIDEE', 'GRAPHIE_A_VERIFIER', 'SENS_AMBIGU', 'PAS_D_ENTREE'].map(st => {
    const l = refusActuels.absents.filter(a => { const r = inventaire.find(x => x.lu === a); return r && r.correspondance === st; });
    return '- ' + st + ' : ' + l.length + (l.length ? ' (' + l.join(', ') + ')' : ''); }).join('\n')}
${(() => { const hors = refusActuels.absents.filter(a => !inventaire.some(x => x.lu === a)); return hors.length ? '- déjà sonorisés autrement depuis : ' + hors.join(', ') : ''; })()}

**Les ${refusActuels.sens.length} refus « sens différent »** : ${refusActuels.sens.map(lu => { const k = lu.replace(/ \(.*$/, ''); const r = inventaire.find(x => x.lu === k);
    return '« ' + k + ' » → ' + (r ? r.correspondance + (r.id ? ' (' + r.lemme + ', ' + r.type + ')' : '') : 'non repris'); }).join(' ; ')}.

Le mot « absent » signifiait « lemme absent de notre index », pas « inexistant dans le LOD ».

### Gain de couverture audio estimé (mots isolés)

- Sons directs récupérables (MP3 du miroir, forme exacte) : **+${nb.sonDispo}** mots.
- Audio contextuel possible (forme exacte dans une phrase de la même entrée, après relecture) : **+${nb.contexte}** mots ;
  environ 1 enregistrement d'exemple sur 10 manquait sur lod.lu lors du passage SPEC 72, soit ≈ +${Math.round(nb.contexte * 0.9)} réellement disponibles.
- Les ${nb.sansSon} formes fléchies **n'ont pas de son direct** : le MP3 de l'entrée prononce le lemme (règle centrale de la SPEC 73).

### Par leçon

| Leçon | Mots isolés sans son | Son direct récupérable | Contexte candidat | Formes fléchies | Ambigus | Sans entrée |
|---|---:|---:|---:|---:|---:|---:|
${Object.entries(parLecon).sort((a, b) => a[0].localeCompare(b[0], 'fr', { numeric: true }))
    .map(([l, p]) => '| ' + l + ' | ' + p.total + ' | ' + p.son + ' | ' + p.contexte + ' | ' + p.forme + ' | ' + p.ambigu + ' | ' + p.absent + ' |').join('\n')}

## Catalogue existant

${refusActuels.catalogue}

## Expressions de plusieurs mots (analyse séparée)

${refusActuels.expressions}

## Détail

${groupes.map(([titre, f]) => { const l = inventaire.filter(f); return '### ' + titre + ' (' + l.length + ')\n\n' + (l.length ? tableau(l) : '—'); }).join('\n\n')}
`;
  fs.writeFileSync(SORTIE_MD, md);
  fs.writeFileSync(SORTIE_JSON, JSON.stringify({ genere: new Date().toISOString().slice(0, 10), sources: { articles: '2026-07-27', tables: '2026-07-27', recherche: recherche ? '2026-07-27' : null, miroir: '2020-12-18' }, chiffres: nb, inventaire }, null, 1) + '\n');
  return nb;
}

module.exports = { lireArticles, lireTables, lireRecherche, indexFormes, sensCorrespond, norm, classer, auditer, ecrire, elementsIsoles };

if (require.main === module) {
  const opts = { articles: arg('articles'), tables: arg('tables'), recherche: arg('recherche'), horsLigne: process.argv.includes('--hors-ligne') };
  if (!opts.articles || !opts.tables) {
    console.error('Usage : node tools/lod/audit-correspondances.js --articles new_lod-art.xml --tables new_lod-tab.xml [--recherche fichier] [--hors-ligne]');
    process.exit(1);
  }
  const resultat = auditer(opts);
  // Refus du rapprochement actuel (tools/audio-lod.js) et état du catalogue.
  const essai = execFileSync('node', [path.join(__dirname, '../audio-lod.js'), '--essai']).toString();
  const bloc = titre => { const i = essai.indexOf(titre); if (i < 0) return []; const fin = essai.indexOf('\n\n', i + titre.length + 5);
    return essai.slice(i, fin < 0 ? undefined : fin).split('\n').filter(x => x.startsWith('  - ')).map(x => x.slice(4)); };
  const sons = JSON.parse(fs.readFileSync(path.join(RACINE, 'public/audio/lod.json'), 'utf8'));
  const entrees = lireArticles(opts.articles);
  const incoherents = Object.entries(sons).filter(([lu, f]) => { const e = entrees[f.replace(/^lod\/|\.mp3$/g, '')]; return !e || norm(e.lemme) !== norm(motCarte(lu) || ''); });
  const nbPlusieurs = bloc('Mots — expression de plusieurs mots').length;
  const ctx = JSON.parse(fs.readFileSync(path.join(RACINE, 'public/audio/lod-contexte.json'), 'utf8'));
  const phr = JSON.parse(fs.readFileSync(path.join(RACINE, 'public/audio/lod-phrases.json'), 'utf8'));
  const exprCartes = bloc('Mots — expression de plusieurs mots');
  const exprAvec = exprCartes.filter(lu => ctx[lu] || phr[lu]).length;
  const nb = ecrire(resultat, {
    absents: bloc('Mots — mot absent de LOD'),
    sens: bloc('Mots — sens différent'),
    catalogue: `- **${Object.keys(sons).length} mots** avec son direct (\`public/audio/lod.json\`) : ${Object.keys(sons).length - incoherents.length} contrôlés, lemme LOD identique au mot affiché` +
      (incoherents.length ? ` ; **${incoherents.length} à revoir** : ${incoherents.map(([l, f]) => l + ' → ' + f).join(', ')}` : ' ; aucune incohérence') + '.\n' +
      `- Les ${Object.keys(sons).length} associations sont conservées telles quelles pendant cette phase.`,
    expressions: `${nbPlusieurs} cartes sont des expressions de plusieurs mots. Elles relèvent des phrases exactes ou contextuelles (SPEC 69–72),
pas des lemmes : ${exprAvec} ont déjà un son de phrase disponible, ${nbPlusieurs - exprAvec} n'en ont pas.
Les 4 refus « sens différent » du rapport précédent (${bloc('Mots — sens différent').join(' ; ')}) sont repris ci-dessous dans le détail des mots isolés.`,
  });
  console.log('Audit écrit : docs/audit-correspondances-lod.md et .json');
  console.log(JSON.stringify(nb));
}
