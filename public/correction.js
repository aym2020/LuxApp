// ─── CORRECTION : DISTINGUER UNE COQUILLE D'UNE ERREUR (spec 24) ────────────
// 100 % local et déterministe : aucune IA, aucun appel réseau, mêmes entrées
// = même résultat.
//
//   analyserReponse(saisie, attendu, contexte) → {
//     statut : 'correct' | 'coquille_probable' | 'erreur',
//     typeErreur : null | 'inversion' | 'omission' | 'ajout' | 'substitution'
//                  | 'doublon' | 'mot_manquant' | 'mot_en_trop' | 'ordre_des_mots'
//                  | 'grammaire' | 'autre_mot' | 'mot_court' | 'plusieurs_erreurs' | 'trop_different',
//     confiance : 0 à 1 (règles explicites ci-dessous),
//     correctionGratuiteAutorisee : true seulement pour une coquille probable,
//     mot : { attendu, saisi } du mot en cause (pour le diagnostic)
//   }
//
// Décision prise avec Clayton : les ACCENTS et les MAJUSCULES restent ignorés
// (comme avant), ainsi que la ponctuation. L'algorithme juge les lettres et les mots.
//
// Étapes :
//   A. normalisation (accents, casse, ponctuation, espaces) ;
//   B. alignement mot à mot (un mot oublié ne décale pas toute la phrase) ;
//   C. distance de Damerau-Levenshtein sur le seul mot modifié ;
//   D. proximité des touches (AZERTY et QWERTY), doublons, inversions : renforcent la confiance ;
//   E. formes protégées : un mot court, un article, un pronom, une négation, une
//      autre forme connue (ex. heescht au lieu de heesche) n'est jamais une coquille.
// En cas de doute : erreur.

// ── A. Normalisation ────────────────────────────────────────────────────────
function normaliserMot(mot) {
  return mot
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // accents (ë, é, ä… → e, e, a)
    .toLowerCase()
    .replace(/[’`´]/g, "'")
    .replace(/[^a-z0-9']/g, '');                      // ponctuation, guillemets…
}

function motsDe(phrase) {
  return String(phrase || '')
    .replace(/[’`´]/g, "'")
    .split(/[\s.!?,;:()«»"–—-]+/)
    .map(normaliserMot)
    .filter(Boolean);
}

// ── E. Formes protégées (jamais pardonnées comme une coquille) ──────────────
// Articles, pronoms, négations, possessifs, verbes très fréquents.
const FORMES_PROTEGEES = new Set([
  'e', 'en', 'eng', 'den', 'dem', 'der', 'de', 'dei', 'dat', 'd', "d'", 'di',
  'ech', 'du', 'hien', 'hatt', 'si', 'se', 'mir', 'mer', 'dir', 'der', 'iech', 'mech', 'dech', 'him', 'hir', 'hinnen', 'eis',
  'net', 'keen', 'keng', 'kee', 'kéng', 'naischt', 'ni', 'nach',
  'mäin', 'main', 'meng', 'mai', 'dain', 'deng', 'sain', 'seng', 'aren', 'are', 'ären', 'äre',
  'sinn', 'bass', 'ass', 'sidd', 'hunn', 'hues', 'huet', 'hutt', 'ginn', 'gëss', 'gess', 'gëtt', 'gett', 'gitt'
].map(normaliserMot));

// ── C. Distance de Damerau-Levenshtein (variante « inversion de voisines ») ─
function distanceEdition(a, b) {
  const d = [];
  for (let i = 0; i <= a.length; i++) { d[i] = [i]; }
  for (let j = 0; j <= b.length; j++) { d[0][j] = j; }
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cout = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cout);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1); // inversion de deux lettres
      }
    }
  }
  return d[a.length][b.length];
}

// Tolérance selon la longueur du mot attendu.
function toleranceMot(longueur) {
  if (longueur < 5) return 0;  // mots très courts : jamais de coquille
  if (longueur <= 8) return 1;
  return 2;
}

// ── D. Claviers : touches voisines ──────────────────────────────────────────
const CLAVIERS = [
  ['azertyuiop', 'qsdfghjklm', 'wxcvbn'],
  ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'],
  ['qwertzuiop', 'asdfghjkl', 'yxcvbnm'] // QWERTZ (claviers luxembourgeois et allemands)
];

function touchesVoisines(x, y) {
  return CLAVIERS.some(lignes => {
    let px = null, py = null;
    lignes.forEach((ligne, r) => {
      if (ligne.indexOf(x) !== -1) px = [r, ligne.indexOf(x)];
      if (ligne.indexOf(y) !== -1) py = [r, ligne.indexOf(y)];
    });
    return px && py && Math.abs(px[0] - py[0]) <= 1 && Math.abs(px[1] - py[1]) <= 1;
  });
}

// Nature de l'écart entre deux mots (pour le diagnostic et la confiance).
function natureEcart(attendu, saisi) {
  if (attendu.length === saisi.length) {
    const diff = [];
    for (let i = 0; i < attendu.length; i++) if (attendu[i] !== saisi[i]) diff.push(i);
    if (diff.length === 2 && diff[1] === diff[0] + 1 &&
        attendu[diff[0]] === saisi[diff[1]] && attendu[diff[1]] === saisi[diff[0]]) return { type: 'inversion', bonus: 0.15 };
    if (diff.length === 1) {
      return { type: 'substitution', bonus: touchesVoisines(attendu[diff[0]], saisi[diff[0]]) ? 0.15 : 0 };
    }
    return { type: 'substitution', bonus: 0 };
  }
  if (saisi.length === attendu.length + 1) {
    // Lettre en plus : doublée par accident (heesche → heessche) ?
    for (let i = 0; i < saisi.length; i++) {
      if (saisi.slice(0, i) + saisi.slice(i + 1) === attendu) {
        const doublon = (i > 0 && saisi[i] === saisi[i - 1]) || saisi[i] === saisi[i + 1];
        const voisine = (i > 0 && touchesVoisines(saisi[i], saisi[i - 1])) || (i + 1 < saisi.length && touchesVoisines(saisi[i], saisi[i + 1]));
        return { type: doublon ? 'doublon' : 'ajout', bonus: doublon || voisine ? 0.15 : 0 };
      }
    }
    return { type: 'ajout', bonus: 0 };
  }
  if (saisi.length === attendu.length - 1) return { type: 'omission', bonus: 0.05 };
  return { type: 'substitution', bonus: 0 };
}

// ── B. Alignement mot à mot (programmation dynamique) ───────────────────────
// Renvoie la liste des opérations : 'egal', 'modif', 'manquant', 'en_trop'.
function alignerMots(attendus, saisis) {
  const n = attendus.length, m = saisis.length;
  const c = [];
  for (let i = 0; i <= n; i++) { c[i] = []; for (let j = 0; j <= m; j++) c[i][j] = 0; }
  for (let i = 0; i <= n; i++) c[i][0] = i;
  for (let j = 0; j <= m; j++) c[0][j] = j;
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      // Un mot proche coûte moins qu'un mot totalement différent (meilleur alignement).
      const proche = distanceEdition(attendus[i - 1], saisis[j - 1]) <= 2;
      const cout = attendus[i - 1] === saisis[j - 1] ? 0 : (proche ? 0.9 : 1.5);
      c[i][j] = Math.min(c[i - 1][j] + 1, c[i][j - 1] + 1, c[i - 1][j - 1] + cout);
    }
  }
  const ops = [];
  let i = n, j = m;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0) {
      const proche = distanceEdition(attendus[i - 1], saisis[j - 1]) <= 2;
      const cout = attendus[i - 1] === saisis[j - 1] ? 0 : (proche ? 0.9 : 1.5);
      if (Math.abs(c[i][j] - (c[i - 1][j - 1] + cout)) < 1e-9) {
        ops.unshift({ op: cout === 0 ? 'egal' : 'modif', attendu: attendus[i - 1], saisi: saisis[j - 1] });
        i--; j--; continue;
      }
    }
    if (i > 0 && Math.abs(c[i][j] - (c[i - 1][j] + 1)) < 1e-9) {
      ops.unshift({ op: 'manquant', attendu: attendus[i - 1] }); i--; continue;
    }
    ops.unshift({ op: 'en_trop', saisi: saisis[j - 1] }); j--;
  }
  return ops;
}

// ── Vocabulaire connu : tous les mots des leçons (pour « autre mot valide ») ─
let vocabulaireCache = null;
function vocabulaireConnu() {
  if (vocabulaireCache) return vocabulaireCache;
  const mots = new Set();
  const ajouter = texte => motsDe(texte).forEach(m => mots.add(m));
  (typeof lecons !== 'undefined' ? lecons : []).forEach(l => {
    ['flashcards', 'quiz', 'trous', 'ecriture'].forEach(type => (l[type] || []).forEach(q => {
      ajouter(q.lu); ajouter(q.trou); ajouter(q.reponse);
    }));
    (l.scene || []).forEach(x => ajouter(x.lu));
  });
  vocabulaireCache = mots;
  return mots;
}

// ── Décision ────────────────────────────────────────────────────────────────
function resultat(statut, typeErreur, confiance, mot) {
  return { statut, typeErreur, confiance, correctionGratuiteAutorisee: statut === 'coquille_probable', mot: mot || null };
}

// contexte (facultatif) : { motsConnus: Set, formesProtegees: [mots] }
function analyserReponse(saisie, attendu, contexte) {
  contexte = contexte || {};
  const attendus = motsDe(attendu);
  const saisis = motsDe(saisie);
  if (attendus.join(' ') === saisis.join(' ')) return resultat('correct', null, 1);
  if (!saisis.length) return resultat('erreur', 'trop_different', 1);

  // Deux mots inversés (« ass Dat » pour « Dat ass ») : erreur d'ordre.
  if (attendus.length === saisis.length) {
    const diff = attendus.map((m, i) => (m === saisis[i] ? -1 : i)).filter(i => i !== -1);
    if (diff.length === 2 && diff[1] === diff[0] + 1 &&
        attendus[diff[0]] === saisis[diff[1]] && attendus[diff[1]] === saisis[diff[0]]) {
      return resultat('erreur', 'ordre_des_mots', 0.9);
    }
  }

  const ops = alignerMots(attendus, saisis);
  const manquants = ops.filter(o => o.op === 'manquant');
  const enTrop = ops.filter(o => o.op === 'en_trop');
  const modifs = ops.filter(o => o.op === 'modif');

  if (manquants.length || enTrop.length) {
    const premier = manquants[0] || enTrop[0];
    const type = manquants.length ? 'mot_manquant' : 'mot_en_trop';
    return resultat('erreur', type, 0.9, { attendu: premier.attendu || '', saisi: premier.saisi || '' });
  }
  if (modifs.length > 1) return resultat('erreur', 'plusieurs_erreurs', 0.9);

  // Un seul mot modifié : coquille ou erreur ?
  const { attendu: a, saisi: s } = modifs[0];
  const mot = { attendu: a, saisi: s };
  const protegees = new Set(Array.from(FORMES_PROTEGEES).concat((contexte.formesProtegees || []).map(normaliserMot)));
  if (protegees.has(a) || protegees.has(s)) return resultat('erreur', 'grammaire', 0.9, mot);
  if (a.length < 5) return resultat('erreur', 'mot_court', 0.8, mot);
  const connus = contexte.motsConnus || vocabulaireConnu();
  if (connus.has(s)) return resultat('erreur', 'autre_mot', 0.9, mot); // un autre mot qui existe

  const distance = distanceEdition(a, s);
  const tolerance = toleranceMot(a.length);
  if (distance > tolerance) return resultat('erreur', 'trop_different', 0.8, mot);
  // Deux opérations sur un mot long : seulement si aucun autre mot connu n'est aussi proche.
  if (distance === 2) {
    const ambigu = Array.from(connus).some(c => c !== a && distanceEdition(c, s) <= 2);
    if (ambigu) return resultat('erreur', 'trop_different', 0.6, mot);
  }
  const nature = natureEcart(a, s);
  const confiance = Math.min(0.95, (distance === 1 ? 0.7 : 0.55) + nature.bonus);
  return resultat('coquille_probable', nature.type, confiance, mot);
}

// Node (tests) : export ; navigateur : fonctions globales.
if (typeof module !== 'undefined') module.exports = { analyserReponse, distanceEdition, alignerMots, normaliserMot, touchesVoisines };
