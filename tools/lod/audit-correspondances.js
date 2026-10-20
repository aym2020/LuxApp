// SPEC 73 — Phase A : audit des mots isolés sans son et des « faux absents » du LOD.
//
//   node tools/lod/audit-correspondances.js                       → index compact versionné (tools/lod/lod-formes.json.gz)
//   node tools/lod/audit-correspondances.js --articles new_lod-art.xml --tables new_lod-tab.xml --recherche new_lod-search.xml
//   option --hors-ligne : aucune requête vers le miroir MP3 (sons « non vérifiés »)
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
// Le rapport ne contient pas de date : deux exécutions sur les mêmes sources donnent les mêmes fichiers.
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
  // Temps et modes simples seulement : les temps composés (auxiliaire + participe) ne sont pas des formes de ce verbe.
  const SECTIONS = [['infinitive', 'infinitif'], ['pastParticiple', 'participe passé'], ['present', 'présent'], ['pastSimple', 'prétérit'],
    ['presentSimple', 'conditionnel'], ['basicForms', 'forme de base'], ['declension', 'forme déclinée']];
  for (const b of xml.split('<inflection>').slice(1)) {
    const t = b.match(/<(verbConjugation|adjDeclension) id="([^"]+)"/);
    if (!t) continue;
    const liste = formes[t[2]] = formes[t[2]] || [];
    const vus = new Set();
    let simple = b.replace(/<(presentPerfect|pastPerfect|auxiliaryVerb)>[\s\S]*?<\/\1>/g, '');
    // L'impératif contient son propre <present> : le traiter d'abord, puis le retirer.
    const imperatif = (simple.match(/<imperative>[\s\S]*?<\/imperative>/) || [''])[0];
    simple = simple.replace(imperatif, '');
    for (const [balise, nom] of [['imperative', 'impératif'], ...SECTIONS]) {
      for (const bloc of (balise === 'imperative' ? [imperatif].filter(Boolean) : simple.match(new RegExp('<' + balise + '>[\\s\\S]*?</' + balise + '>', 'g')) || [])) {
        for (const v of bloc.match(/>([^<>]+)</g) || []) {
          // « gaangen / gaang » → deux formes ; « méchs (dech) » → « méchs » ; « entschëllegt (iech)! » → « entschëllegt » ;
          // « ginn eraus » (plusieurs mots) ignoré.
          for (const alt of v.slice(1, -1).replace(/\(.*?\)/g, ' ').replace(/!/g, ' ').split('/')) {
            const mot = alt.trim();
            const cle = mot + '|' + nom;
            if (mot && !/\s/.test(mot) && !vus.has(cle)) { vus.add(cle); liste.push({ forme: mot, type: nom + ' (table)' }); }
          }
        }
      }
    }
  }
  return formes;
}

// Index de recherche LOD (new_lod-search.xml). Documentation data.public.lu : les graphies suggest="true"
// sont contrôlées, ainsi que les formes de la règle du n (reason="n-rule") ; toutes les autres sont générées.
// reason="erroneous-spelling" : graphie fautive rattachée à l'entrée standard.
function statutGraphie(attrs) {
  if (/suggest="true"/.test(attrs)) return 'contrôlée';
  const raison = (attrs.match(/reason="([^"]*)"/) || [])[1] || '';
  if (raison === 'n-rule') return 'contrôlée (règle du n)';
  if (raison === 'erroneous-spelling') return 'fautive';
  return 'générée' + (raison ? ' (' + raison + ')' : '');
}
function lireRecherche(fichier) {
  if (!fichier) return null;
  const xml = fs.readFileSync(fichier, 'utf8');
  const graphies = {}; // forme normalisée → [{ id, graphie, statut }]
  const entrees = {};
  for (const m of xml.split('<entry id="').slice(1)) {
    const id = m.slice(0, m.indexOf('"'));
    const tete = m.slice(0, m.indexOf('>'));
    entrees[id] = { audio: (tete.match(/audio="([^"]*)"/) || [])[1] || null };
    const bloc = (m.match(/<spellings>[\s\S]*?<\/spellings>/) || [''])[0];
    for (const sp of bloc.match(/<spelling([^>]*)>([^<]*)<\/spelling>/g) || []) {
      const [, attrs, forme] = sp.match(/<spelling([^>]*)>([^<]*)<\/spelling>/);
      (graphies[norm(forme)] = graphies[norm(forme)] || []).push({ id, graphie: forme, statut: statutGraphie(attrs) });
    }
  }
  return { graphies, entrees };
}

// Index compact versionné (tools/lod/construire-formes.js) : mêmes structures que la lecture des exports XML.
const FORMES = path.join(__dirname, 'lod-formes.json.gz');
function chargerFormes(fichier) {
  const d = JSON.parse(require('zlib').gunzipSync(fs.readFileSync(fichier || FORMES)));
  const entrees = {};
  for (const [id, lemme, categorie, ipa, fr, formes, varianteDe, niveau, exemples] of d.entrees) {
    entrees[id] = { id, lemme, categorie, ipa, fr, formes: formes.map(([forme, type]) => ({ forme, type })), varianteDe: varianteDe || undefined,
      niveau, locutions: [], exemples: exemples.map(([xid, f]) => ({ id: xid, formes: f })) };
  }
  const tables = {};
  for (const [id, l] of Object.entries(d.tables)) tables[id] = l.map(([forme, type]) => ({ forme, type }));
  const graphies = {};
  for (const [graphie, id, statut] of d.graphies) (graphies[norm(graphie)] = graphies[norm(graphie)] || []).push({ id, graphie, statut });
  return { entrees, tables, recherche: { graphies, entrees: {} }, source: d.source };
}

function indexFormes(entrees, tables, recherche) {
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
  // Graphies de l'index de recherche absentes des articles et des tables : index séparé, consulté seulement
  // quand les articles et les tables ne donnent rien (il contient aussi les morceaux des verbes composés).
  const secours = {};
  if (recherche) {
    for (const liste of Object.values(recherche.graphies)) for (const g of liste) {
      const e = entrees[g.id];
      if (!e || /\s/.test(g.graphie)) continue;
      if ((index[norm(g.graphie)] || []).some(c => c.id === g.id)) continue;
      (secours[norm(g.graphie)] = secours[norm(g.graphie)] || []).push({ id: e.id, lemme: e.lemme, type: 'graphie de l\'index de recherche (' + g.statut + ')',
        source: 'recherche', graphie: g.graphie });
    }
  }
  Object.defineProperty(index, 'secours', { value: secours, enumerable: false });
  return index;
}
// Statut orthographique d'une graphie pour une entrée donnée (null si l'index de recherche n'est pas fourni).
function statutDans(recherche, graphie, id) {
  if (!recherche) return null;
  const l = (recherche.graphies[norm(graphie)] || []).filter(g => g.id === id);
  const exacte = l.find(g => g.graphie === graphie) || l[0];
  return exacte ? exacte.statut : 'absente de l\'index';
}

// ─── Éléments isolés des leçons ─────────────────────────────────────────────
const COLONNES_FR = /fran[cç]ais|traduction|sens|explication|remarque|quand|pourquoi|retenir|idée|catégorie|^type|je cherche|^heure$|^nombre$|^genre$|^personne$|possesseur|^dizaine$|^salutation$/i;

function morceauxCellule(cellule) {
  return String(cellule).replace(/<[^>]*>/g, ' ').replace(/\(.*?\)/g, ' ')
    .split(/\s*(?:\/|·|;|,|→|↔|\bou\b)\s*/).map(s => s.trim()).filter(Boolean);
}

// Phrases des leçons où un mot apparaît (pour juger une graphie dans son contexte, ex. Kirchberg).
function contextesLuxApp(mot) {
  const re = new RegExp('(^|[^\\p{L}])' + mot.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '([^\\p{L}]|$)', 'u');
  const vus = [];
  for (const L of lecons()) for (const e of elementsLecon(L.lecon)) {
    if (e.lu.split(/\s+/).length >= 2 && re.test(e.lu) && vus.length < 4) vus.push(L.niveau + ' L' + L.id + ' : « ' + e.lu + ' »');
  }
  return vus;
}

function elementsIsoles() {
  // Traductions sûres : cartes et vocabulaire du cours (un mot, une traduction).
  const lexique = {};
  for (const L of lecons()) {
    // Un mot seul, éventuellement avec un article (« Dat sinn » = démonstratif + verbe : exclu).
    const sur = lu => motCarte(lu) && !/^(dat|déi)\s/i.test(String(lu).trim());
    for (const c of L.lecon.flashcards || []) if (sur(c.lu)) lexique[motCarte(c.lu)] = lexique[motCarte(c.lu)] || c.fr;
    for (const b of L.lecon.cours || []) if (b.type === 'vocab') (b.items || []).forEach(([lu, fr]) => {
      if (sur(lu)) lexique[motCarte(lu)] = lexique[motCarte(lu)] || String(fr).replace(/<[^>]*>/g, '');
    });
  }
  const items = new Map(); // lu → { lu, fr, origineFr, lecons:Set, sections:Set }
  const noter = (lu, fr, origineFr, lecon, section) => {
    if (!lu || motCarte(lu) === null) return; // expressions : analyse séparée
    if (/^[a-zäëéè]'$/i.test(String(lu).trim())) return; // « d' » seul : fragment d'article
    const it = items.get(lu) || { lu, fr: '', origineFr: 'aucune', lecons: new Set(), sections: new Set() };
    if (!it.fr && fr) { it.fr = fr; it.origineFr = origineFr; }
    it.lecons.add(lecon); it.sections.add(section);
    items.set(lu, it);
  };
  for (const L of lecons()) {
    const l = L.lecon;
    const nom = L.niveau + ' L' + L.id;
    for (const c of l.flashcards || []) noter(c.lu, c.fr, 'carte', nom, 'cartes');
    for (const b of l.cours || []) {
      if (b.type === 'vocab' || b.type === 'exemple') (b.items || []).forEach(([lu, fr]) => noter(lu, fr, 'cours', nom, 'cours'));
      if (b.type === 'tableau') {
        const entetes = b.entetes || [];
        const colFr = entetes.findIndex(h => /fran[cç]ais|traduction|^sens/i.test(h));
        // La colonne française ne traduit la cellule que si le tableau n'a qu'une colonne luxembourgeoise
        // (« Un | Plusieurs | Français » : « deux murs » traduit la colonne « Plusieurs », pas « eng Mauer »).
        const colonnesLu = entetes.filter(h => !COLONNES_FR.test(h)).length;
        (b.lignes || []).forEach(ligne => ligne.forEach((cel, i) => {
          if (COLONNES_FR.test(entetes[i] || '')) return;
          for (const m of morceauxCellule(cel)) {
            const k = motCarte(m);
            if (k && lexique[k]) noter(m, lexique[k], 'lexique des cartes', nom, 'tableau');
            else if (colFr >= 0 && colonnesLu === 1) noter(m, String(ligne[colFr]).replace(/<[^>]*>/g, ''), 'colonne du tableau', nom, 'tableau');
            else noter(m, '', 'aucune', nom, 'tableau');
          }
        }));
      }
    }
  }
  return [...items.values()];
}

// ─── Audio ──────────────────────────────────────────────────────────────────
const cacheMiroir = {};
function miroirMp3(id, horsLigne) {
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
  const miroir = ctx.verifierSon || miroirMp3; // remplaçable dans les tests
  const mot = motCarte(it.lu);
  // Graphie affichée (sans article ni ponctuation), casse conservée : « Sproochen » (nom) ≠ « sproochen » (verbe).
  const affiche = it.lu.replace(/\(.*?\)/g, ' ').replace(/[!?.,;:«»"]/g, ' ').replace(/’/g, "'").trim().split(/\s+/).pop();
  let candidats = formes[norm(mot)] || [];
  if (!candidats.length && formes.secours) candidats = formes.secours[norm(mot)] || [];
  const memeCasse = candidats.filter(c => c.graphie === affiche);
  if (memeCasse.length) candidats = memeCasse;
  // Variante règle du n non listée (« éischte » ← « éischten ») : candidate, graphie à vérifier.
  let derivee = false;
  if (!candidats.length && !recherche && formes[norm(mot) + 'n']) {
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
      distance(f, norm(mot)) <= 2 && formes[f].some(bonSens)).sort((a, b) => {
        // Graphie contrôlée d'abord (« Komoud » avant « Kommoud », graphie fautive), puis la plus proche.
        const ok = f => { const st = statutDans(recherche, formes[f][0].graphie, formes[f][0].id); return !st || st.startsWith('contrôlée') ? 0 : 1; };
        return ok(a) - ok(b) || distance(a, norm(mot)) - distance(b, norm(mot)); });
    const proches = graphiesProches;
    if (proches.length) {
      const c = formes[proches[0]].find(bonSens);
      const e = entrees[c.id];
      Object.assign(r, { id: c.id, lemme: c.lemme, type: c.type, categorie: e.categorie, sens: e.fr.slice(0, 4).join(', '), source: c.source + ' LOD 2026-07-27' });
      r.correspondance = 'GRAPHIE_A_VERIFIER';
      r.graphie = 'LuxApp « ' + mot + ' » ; LOD : ' + proches.slice(0, 3).map(f => '« ' + formes[f][0].graphie + ' »').join(' ou ');
      r.audio = 'AUCUN';
      r.decision = 'Vérifier l\'orthographe : si « ' + c.graphie + ' » est retenu, corriger la leçon ; son exact alors disponible (' + c.id + '.mp3, ' + miroir(c.id, opts.horsLigne) + ')';
      r.justification = 'Pas d\'entrée « ' + mot + ' » ; graphie LOD proche : ' + proches.slice(0, 3).map(f => formes[f][0].graphie + ' (' + formes[f][0].id + ', ' + formes[f][0].type + ')').join(', ') +
        ' ; sens LOD : ' + (e.fr.slice(0, 3).join(', ') || '—') + '.';
      r.candidats = proches.slice(0, 3).map(f => ({ id: formes[f][0].id, lemme: formes[f][0].lemme, graphie: formes[f][0].graphie, type: formes[f][0].type,
        statut_graphie: statutDans(recherche, formes[f][0].graphie, formes[f][0].id) }));
      r.statut_graphie = recherche ? 'absente du LOD' : null;
      r.statut_propose = statutDans(recherche, c.graphie, c.id);
      r.contextes_luxapp = contextesLuxApp(affiche);
      // Forme fléchie proposée (« verloobt ») : le MP3 de l'entrée prononce le lemme (« verloben »), pas cette forme.
      if (c.type !== 'lemme') {
        r.decision = 'Vérifier l\'orthographe : si « ' + c.graphie + ' » est retenu, corriger la leçon ; ' + c.type + ' de « ' + c.lemme +
          ' » : pas de son direct (le MP3 prononce « ' + c.lemme + ' »), audio contextuel possible';
      }
      // Nom propre employé tel quel en français (« Kirchberg ») : ne jamais remplacer sans examiner le contexte.
      if (/^\p{Lu}/u.test(affiche) && norm(it.fr) === norm(affiche)) {
        r.decision = 'Nom propre : « ' + affiche + ' » est aussi la forme officielle (français / allemand) ; la forme luxembourgeoise est « ' + c.graphie +
          ' ». Examiner chaque contexte avant de remplacer';
      }
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
    // Toutes les analyses de cette forme pour cette entrée (« entschëllegt » : participe passé et impératif).
    const analyses = [...new Set(candidats.filter(x => x.id === c.id).map(x => x.type))];
    const imperatif = analyses.find(t => t.startsWith('impératif'));
    // Usage dans LuxApp : une formule exclamative (« Entschëllegt! ») est un impératif, pas un participe.
    const PRIORITE = ['lemme', 'pluriel', 'variante règle du n', 'participe passé', 'présent', 'prétérit', 'conditionnel', 'forme', 'graphie', 'impératif'];
    const rang = t => { const i = PRIORITE.findIndex(p => t.startsWith(p)); return i < 0 ? PRIORITE.length : i; };
    const typeRetenu = /!\s*$/.test(it.lu) && imperatif ? 'impératif (formule de politesse)' : [...analyses].sort((x, y) => rang(x) - rang(y))[0];
    Object.assign(r, { id: c.id, lemme: c.lemme, type: typeRetenu, analyses, categorie: e.categorie, sens: e.fr.slice(0, 4).join(', '),
      source: c.source + ' LOD 2026-07-27' });
    r.correspondance = c.type === 'lemme' ? 'LEMME_EXACT' : 'FORME_FLECHIE_VALIDEE';
    // Statut orthographique : index de recherche (contrôlée / règle du n / fautive / générée).
    const statut = statutDans(recherche, c.graphie, c.id);
    r.statut_graphie = statut;
    if (statut === 'fautive') {
      r.correspondance = 'GRAPHIE_A_VERIFIER';
      r.graphie = 'graphie fautive selon le LOD ; standard : « ' + c.lemme + ' »';
      r.statut_propose = statutDans(recherche, c.lemme, c.id);
      r.audio = 'AUCUN';
      r.decision = 'Corriger en « ' + c.lemme + ' » si validé ; son exact alors disponible (' + c.id + '.mp3, ' + miroir(c.id, opts.horsLigne) + ')';
      r.justification = '« ' + affiche + ' » est listé comme graphie fautive de « ' + c.lemme + ' » (' + c.id + ') dans l\'index de recherche.';
      r.contextes_luxapp = contextesLuxApp(affiche);
      return r;
    } else if (statut && statut.startsWith('générée')) {
      r.correspondance = 'GRAPHIE_A_VERIFIER';
      r.graphie = 'graphie ' + statut + ' dans l\'index de recherche : à revoir';
    } else if (statut) {
      r.graphie = statut + ' (index de recherche)';
    } else {
      r.graphie = derivee ? 'dérivée par la règle du n : à vérifier' : 'forme éditoriale du LOD (' + c.source + ')';
      if (derivee) r.correspondance = 'GRAPHIE_A_VERIFIER';
    }
    const homographes = Object.values(entrees).filter(x => norm(x.lemme) === norm(c.lemme) && x.id !== c.id).map(x => x.id);
    if (c.type === 'lemme' && r.correspondance === 'LEMME_EXACT') {
      r.son = miroir(c.id, opts.horsLigne);
      // audio="true" figure sur toutes les entrées de l'index de recherche : ce n'est pas une preuve de fichier.
      r.audio = r.son === 'disponible' ? 'SON_EXACT_DISPONIBLE' : 'AUDIO_INDISPONIBLE';
      r.local = fs.existsSync(path.join(RACINE, 'public/audio/lod', c.id + '.mp3'));
      // Confiance : « sûr » seulement si rien n'est à interpréter.
      const raisons = [];
      if (!it.fr) raisons.push('sens non vérifiable (cellule de tableau sans traduction)');
      else if (!sensCorrespond(it.fr, e.fr)) raisons.push('sens déduit (forme fléchie ou numéral), pas lu dans la traduction');
      if (homographes.length) raisons.push('homographes : ' + homographes.join(', '));
      if (e.varianteDe) raisons.push('variante de « ' + e.varianteDe + ' »');
      if (statut && !statut.startsWith('contrôlée')) raisons.push('graphie ' + statut);
      if (it.origineFr === 'colonne du tableau') raisons.push('traduction lue dans un tableau');
      r.confiance = r.audio === 'SON_EXACT_DISPONIBLE' ? (raisons.length ? 'à valider' : 'sûr') : opts.horsLigne ? 'non vérifié (hors ligne)' : 'sans fichier';
      r.raisons = raisons;
      r.decision = r.confiance === 'sûr' ? 'Associer ' + c.id + '.mp3' : r.confiance === 'à valider' ? 'Relire puis associer ' + c.id + '.mp3' :
        'Chercher le fichier officiel (lod.lu, via Termux) ou un contexte';
      r.justification = 'Lemme identique' + (e.varianteDe ? ' (variante de « ' + e.varianteDe + ' »)' : '') + ', sens « ' + r.sens + ' »' +
        (r.son === 'disponible' ? '' : ' ; MP3 : ' + r.son) + (r.local ? ' ; fichier déjà dans le dépôt : seule la clé d\'affichage manque' : '') +
        (raisons.length ? ' ; à valider : ' + raisons.join(' ; ') : '') + '.';
    } else {
      r.audio = 'ENTREE_SANS_AUDIO_EXACT';
      r.decision = 'Pas de son direct (le MP3 de ' + c.id + ' prononce « ' + c.lemme + ' ») ; audio contextuel si un exemple prononce « ' + mot + ' »';
      r.justification = '« ' + mot + ' » = ' + typeRetenu + ' de ' + c.lemme + ' (' + c.id + ')' +
        (analyses.length > 1 ? ' ; analyses possibles : ' + analyses.join(', ') : '') + '.';
      if (r.correspondance === 'GRAPHIE_A_VERIFIER') r.contextes_luxapp = contextesLuxApp(affiche);
    }
    // Exemples de la même entrée qui prononcent exactement cette forme.
    if (r.audio !== 'SON_EXACT_DISPONIBLE') {
      const exemples = e.exemples.filter(x => x.formes.some(f => norm(f) === norm(mot)) && textes[x.id])
        .map(x => textes[x.id]).sort((a, b) => ({ A1: 0, A2: 1, '': 2 }[a.niveau] - { A1: 0, A2: 1, '': 2 }[b.niveau]) || a.nbMots - b.nbMots);
      r.contexte = exemples.slice(0, 3).map(x => ({ id: x.id, phrase: majuscule(x.texte), mots: x.nbMots, niveau: x.niveau || '—',
        enregistrement: phrasesDispo.has(x.id) ? 'téléchargé' : 'à vérifier (Termux)' }));
      if (r.contexte.length) r.audio_contexte = 'CONTEXTE_CANDIDAT';
    }
    // Relecture déjà faite (tools/lod/contextes.json) : phrase retenue ou proposition refusée.
    const choix = ctx.contextes || {};
    if (choix[it.lu] && !it.lu.startsWith('_')) r.contexte_relu = { decision: 'retenue', id: choix[it.lu].id, phrase: choix[it.lu].lod };
    else if ((choix['_refusés'] || {})[it.lu]) r.contexte_relu = { decision: 'refusée', raison: choix['_refusés'][it.lu] };
    else if (!r.sections.some(x => x !== 'tableau')) r.contexte_relu = { decision: 'tableau seul (pas de bouton)' };
  }
  return r;
}

function auditer(opts) {
  // Exports XML si fournis, sinon l'index compact versionné (aucun fichier externe nécessaire).
  const compact = opts.articles ? null : chargerFormes(opts.formes);
  const entrees = compact ? compact.entrees : lireArticles(opts.articles);
  const tables = compact ? compact.tables : lireTables(opts.tables);
  const recherche = compact ? compact.recherche : lireRecherche(opts.recherche);
  const formes = indexFormes(entrees, tables, recherche);
  const lodIndex = lireIndex();
  const sons = JSON.parse(fs.readFileSync(path.join(RACINE, 'public/audio/lod.json'), 'utf8'));
  const direct = tableDirecte(sons);
  const phrasesDispo = new Set(fs.existsSync(path.join(RACINE, 'public/audio/lod-phrases')) ?
    fs.readdirSync(path.join(RACINE, 'public/audio/lod-phrases')).map(f => f.replace('.m4a', '')) : []);
  const textes = {};
  for (const e of lodIndex.utilisables) textes[e.id] = e;

  const contextes = JSON.parse(fs.readFileSync(path.join(__dirname, 'contextes.json'), 'utf8'));
  const ctx = { entrees, formes, recherche, textes, phrasesDispo, horsLigne: opts.horsLigne, contextes };
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
  const lecSec = r => r.lecons.join(', ') + ' · ' + r.sections.join(', ');
  const entree = r => r.id ? r.lemme + ' (`' + r.id + '`, ' + (r.categorie || '—') + ')' : r.candidats.map(c => c.lemme + ' `' + c.id + '`').join(', ') || '—';
  const table = (titres, lignes) => '| ' + titres.join(' | ') + ' |\n|' + titres.map(() => '---').join('|') + '|\n' + lignes.map(l => '| ' + l.join(' | ') + ' |').join('\n');
  const sur = inventaire.filter(r => r.confiance === 'sûr');
  const aValider = inventaire.filter(r => r.confiance === 'à valider');
  const sansFichier = inventaire.filter(r => r.confiance === 'sans fichier');
  const flechies = inventaire.filter(r => r.correspondance === 'FORME_FLECHIE_VALIDEE');
  const contexte = inventaire.filter(r => r.audio_contexte);
  const graphies = inventaire.filter(r => r.correspondance === 'GRAPHIE_A_VERIFIER');
  const ambigus = inventaire.filter(r => r.correspondance === 'SENS_AMBIGU');
  const absents = inventaire.filter(r => r.correspondance === 'PAS_D_ENTREE');
  const nb = {
    total: inventaire.length,
    lemme: compte(r => r.correspondance === 'LEMME_EXACT'), flechie: flechies.length, graphie: graphies.length,
    ambigu: ambigus.length, absent: absents.length,
    sonSur: sur.length, sonAValider: aValider.length, sonSansFichier: sansFichier.length,
    sansSon: compte(r => r.audio === 'ENTREE_SANS_AUDIO_EXACT'), contexte: contexte.length,
    contexteTelecharge: compte(r => r.contexte.some(c => c.enregistrement === 'téléchargé')),
    contexteRetenu: compte(r => r.contexte_relu && r.contexte_relu.decision === 'retenue'),
    contexteRefuse: compte(r => r.contexte_relu && r.contexte_relu.decision === 'refusée'),
    contexteTableau: compte(r => r.audio_contexte && r.contexte_relu && r.contexte_relu.decision.startsWith('tableau')),
  };
  const parLecon = {};
  for (const r of inventaire) for (const l of r.lecons) {
    const p = parLecon[l] = parLecon[l] || { total: 0, sur: 0, valider: 0, contexte: 0, graphie: 0, sans: 0 };
    p.total++;
    if (r.confiance === 'sûr') p.sur++;
    else if (r.confiance === 'à valider') p.valider++;
    else if (r.audio_contexte) p.contexte++;
    else if (r.correspondance === 'GRAPHIE_A_VERIFIER') p.graphie++;
    else p.sans++;
  }
  const statutsAbsents = ['LEMME_EXACT', 'FORME_FLECHIE_VALIDEE', 'GRAPHIE_A_VERIFIER', 'SENS_AMBIGU', 'PAS_D_ENTREE'].map(st => {
    const l = refusActuels.absents.filter(x => { const r = inventaire.find(y => y.lu === x); return r && r.correspondance === st; });
    return '- ' + st + ' : ' + l.length + (l.length ? ' (' + l.join(', ') + ')' : '');
  }).join('\n');
  const md = `# Audit des correspondances LOD — SPEC 73, phase A (révision 2)

Généré par \`node tools/lod/audit-correspondances.js\`. **Aucune leçon, association audio ni fichier son n'a été modifié.**
Inventaire complet : \`docs/audit-correspondances-lod.json\`.

## Sources

| Source | Version | Utilisée | Contenu exploité |
|---|---|---|---|
| Articles LOD (\`new_lod-art.xml\`) | export 2026-07-27 | oui (${nbEntrees} entrées) | lemmes, règle du n, pluriels, participes, variantes (renvois), sens, exemples |
| Tables de flexion (\`260727-new-lod-tab.zip\`) | 2026-07-27 | oui (${nbTables} tables) | présent, prétérit, impératif, conditionnel, participes ; déclinaisons |
| Index de recherche (\`260727-new-lod-search.zip\`) | 2026-07-27 | **${recherche ? 'oui' : 'non'}** | statut de chaque graphie : contrôlée (\`suggest="true"\`), règle du n (\`reason="n-rule"\`, contrôlée selon data.public.lu), fautive (\`erroneous-spelling\`), générée (autres raisons) |
| Miroir MP3 (robertoentringer/lod-mp3-mirror) | 2020-12-18 | oui (requête HEAD par identifiant) | son du lemme |
| Phrases LOD téléchargées (SPEC 72) | 2026-10-20 | oui | enregistrements d'exemples disponibles |

Note : l'attribut \`audio="true"\` figure sur les 33 941 entrées de l'index de recherche ; il ne prouve donc pas qu'un fichier est disponible.
Seuls les fichiers réellement présents (miroir ou téléchargés) comptent comme sons disponibles.

## Synthèse

${nb.total} mots isolés des leçons (cartes, vocabulaire et exemples du cours, cellules luxembourgeoises des tableaux) n'ont pas de son aujourd'hui.

### Sons exacts (la forme affichée elle-même)

| | Nombre |
|---|---:|
| **Sûrs** : lemme identique, graphie contrôlée, sens lu dans la traduction LuxApp, aucun homographe, MP3 présent | **${nb.sonSur}** |
| **À valider** : MP3 présent, mais homographe, variante, sens non vérifiable (tableau) ou déduit | ${nb.sonAValider} |
| Lemme identique sans fichier disponible | ${nb.sonSansFichier} |

### Sans son exact

| | Nombre |
|---|---:|
| Formes fléchies validées (pluriel, participe, impératif, forme conjuguée ou déclinée) : le MP3 de l'entrée prononce le lemme, **pas de son direct** | ${nb.flechie} |
| … dont **audio contextuel candidat** (un exemple de la même entrée prononce exactement la forme ; relecture humaine requise) | ${nb.contexte} (${nb.contexteTelecharge} déjà téléchargés) |
| Relecture (\`tools/lod/contextes.json\`) : phrase retenue / refusée / tableau seul, sans bouton | ${nb.contexteRetenu} / ${nb.contexteRefuse} / ${nb.contexteTableau} |
| Graphies à vérifier (fautive selon le LOD, générée, ou graphie LOD proche) | ${nb.graphie} |
| Sens ambigu | ${nb.ambigu} |
| Pas d'entrée dans les trois sources | ${nb.absent} |

### Les ${refusActuels.absents.length} « mots absents du LOD » du rapport initial

${statutsAbsents}

**Les ${refusActuels.sens.length} refus « sens différent »** : ${refusActuels.sens.map(x => { const k = x.replace(/ \(.*$/, ''); const r = inventaire.find(y => y.lu === k);
    return '« ' + k + ' » → ' + (r ? r.correspondance + (r.id ? ' (' + r.lemme + ', ' + r.type + ')' : '') : 'non repris'); }).join(' ; ')}.

### Gain estimé

- Sons exacts : **+${nb.sonSur} sûrs**, jusqu'à +${nb.sonSur + nb.sonAValider} après relecture des ${nb.sonAValider} cas à valider.
- Audio contextuel : jusqu'à +${nb.contexte} après relecture (≈ +${Math.round(nb.contexte * 0.9)} si 1 enregistrement d'exemple sur 10 manque, comme lors de la SPEC 72).
- Graphies : les corrections validées donneraient un son exact supplémentaire par mot corrigé (voir la section dédiée).

### Par leçon

${table(['Leçon', 'Sans son', 'Son exact sûr', 'Son exact à valider', 'Contexte candidat', 'Graphie à vérifier', 'Autre (fléchi sans contexte, ambigu, absent)'],
    Object.entries(parLecon).sort((x, y) => x[0].localeCompare(y[0], 'fr', { numeric: true }))
      .map(([l, p]) => [l, p.total, p.sur, p.valider, p.contexte, p.graphie, p.sans]))}

## Catalogue existant

${refusActuels.catalogue}

## Expressions de plusieurs mots (analyse séparée)

${refusActuels.expressions}

---

## 1. Sons exacts sûrs (${sur.length})

${table(['Texte LuxApp', 'Traduction', 'Leçons · sections', 'Entrée LOD', 'Graphie', 'Fichier'],
    sur.map(r => [r.lu, r.fr || '—', lecSec(r), entree(r), r.statut_graphie || '—', r.id + '.mp3' + (r.local ? ' (déjà dans le dépôt)' : '')]))}

## 2. Sons exacts à valider (${aValider.length})

${table(['Texte LuxApp', 'Traduction', 'Leçons · sections', 'Entrée LOD', 'Pourquoi relire'],
    aValider.map(r => [r.lu, r.fr || '—', lecSec(r), entree(r), r.raisons.join(' ; ')]))}

${sansFichier.length ? '### Lemme identique sans fichier disponible\n\n' + table(['Texte LuxApp', 'Entrée LOD', 'Fichier'], sansFichier.map(r => [r.lu, entree(r), r.son])) : ''}

## 3. Formes fléchies : pas de son exact, audio contextuel possible (${flechies.length})

Le MP3 d'une entrée prononce son lemme (« Kand »), jamais le pluriel ou le participe affiché (« Kanner »). Ces formes n'auront pas de son direct.
Une phrase de la même entrée qui prononce exactement la forme est proposée quand elle existe ; **chaque proposition doit être relue** (sens, idiomatisme, niveau).

${table(['Texte LuxApp', 'Traduction', 'Leçons · sections', 'Entrée LOD', 'Analyse retenue (autres)', 'Graphie', 'Phrase candidate', 'Relecture'],
    flechies.map(r => [r.lu, r.fr || '—', lecSec(r), entree(r), r.type + (r.analyses && r.analyses.length > 1 ? ' (' + r.analyses.filter(t => t !== r.type).join(', ') + ')' : ''),
      r.statut_graphie || '—', r.contexte.length ? '« ' + r.contexte[0].phrase + ' » (' + r.contexte[0].niveau + ', ' + r.contexte[0].enregistrement + ')' : '—',
      !r.contexte_relu ? 'à relire' : r.contexte_relu.decision === 'retenue' ? '**retenue** : « ' + r.contexte_relu.phrase + ' »' :
        r.contexte_relu.decision === 'refusée' ? 'refusée : ' + r.contexte_relu.raison : r.contexte_relu.decision]))}

## 4. Graphies à vérifier (${graphies.length}) — aucun remplacement automatique

${table(['Texte LuxApp', 'Traduction', 'Constat', 'Graphie LOD proposée', 'Décision proposée', 'Emplois dans LuxApp'],
    graphies.map(r => [r.lu, r.fr || '—', r.graphie || '—', entree(r) + (r.statut_propose ? ' — ' + r.statut_propose : ''), r.decision || '—',
      (r.contextes_luxapp || []).join('<br>') || '—']))}

## 5. Sens ambigu (${ambigus.length})

${table(['Texte LuxApp', 'Traduction', 'Leçons · sections', 'Candidats', 'Pourquoi'],
    ambigus.map(r => [r.lu, r.fr || '—', lecSec(r), r.candidats.slice(0, 4).map(c => c.lemme + ' `' + c.id + '` ' + (c.categorie || '')).join(', '), r.justification]))}

## 6. Pas d'entrée dans les trois sources (${absents.length})

${table(['Texte LuxApp', 'Traduction', 'Leçons · sections', 'Constat'], absents.map(r => [r.lu, r.fr || '—', lecSec(r), r.justification]))}
`;
  fs.writeFileSync(SORTIE_MD, md);
  fs.writeFileSync(SORTIE_JSON, JSON.stringify({ sources: { articles: '2026-07-27', tables: '2026-07-27', recherche: recherche ? '2026-07-27' : null, miroir: '2020-12-18' },
    chiffres: nb, inventaire }, null, 1) + '\n');
  return nb;
}

module.exports = { chargerFormes, lireArticles, lireTables, lireRecherche, statutGraphie, indexFormes, elementsIsoles, sensCorrespond, norm, classer, auditer, ecrire };

if (require.main === module) {
  const opts = { articles: arg('articles'), tables: arg('tables'), recherche: arg('recherche'), horsLigne: process.argv.includes('--hors-ligne') };
  if (opts.articles && !opts.tables) {
    console.error('Usage : node tools/lod/audit-correspondances.js [--articles new_lod-art.xml --tables new_lod-tab.xml --recherche new_lod-search.xml] [--hors-ligne]');
    process.exit(1);
  }
  const resultat = auditer(opts);
  // Refus du rapprochement actuel (tools/audio-lod.js) et état du catalogue.
  const essai = execFileSync('node', [path.join(__dirname, '../audio-lod.js'), '--essai']).toString();
  const bloc = titre => { const i = essai.indexOf(titre); if (i < 0) return []; const fin = essai.indexOf('\n\n', i + titre.length + 5);
    return essai.slice(i, fin < 0 ? undefined : fin).split('\n').filter(x => x.startsWith('  - ')).map(x => x.slice(4)); };
  const sons = JSON.parse(fs.readFileSync(path.join(RACINE, 'public/audio/lod.json'), 'utf8'));
  const entrees = opts.articles ? lireArticles(opts.articles) : chargerFormes().entrees;
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
