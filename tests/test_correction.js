// Spec 24 : algorithme local de détection des fautes de frappe (correction.js).
// Accents, majuscules et ponctuation sont ignorés (décision de Clayton).
const { analyserReponse, distanceEdition } = require('../public/correction.js');

const connus = new Set(['moien', 'gudde', 'ech', 'heesche', 'heescht', 'heeschen', 'paul', 'dat', 'ass', 'eng', 'mapp',
  'mir', 'geet', 'et', 'gutt', 'wei', 'dir', 'sinn', 'net', 'midd', 'schweier', 'liicht', 'schéin', 'schein',
  'frenn', 'frendin', 'franseisch', 'kafen', 'kaafen', 'dësch', 'desch', 'stull', 'luucht', 'wunnen', 'wunnt']);
const ctx = { motsConnus: connus };
const cas = [
  // [attendu, saisi, statut attendu, type attendu (facultatif), description]
  ['Gudde Moien!', 'Gudde Moien!', 'correct', null, 'identique'],
  ['Wéi heescht Dir?', 'wei heescht dir', 'correct', null, 'accents, majuscules, ponctuation ignorés'],
  ['Gudde Moien!', 'Gudde Mioen!', 'coquille_probable', 'inversion', 'inversion de deux lettres'],
  ['Ech heesche Paul.', 'Ech heesce Paul.', 'coquille_probable', 'omission', 'lettre manquante'],
  ['Ech heesche Paul.', 'Ech heessche Paul.', 'coquille_probable', 'doublon', 'lettre doublée par accident'],
  ['Ech heesche Paul.', 'Ech heeschr Paul.', 'coquille_probable', 'substitution', 'touche voisine (e/r)'],
  ['Mir wunnen hei.', 'Mir wunnwn hei.', 'coquille_probable', 'substitution', 'touche voisine (e/w)'],
  ['Dat ass schweier.', 'Dat ass schwieer.', 'coquille_probable', 'inversion', 'mot long, inversion'],
  ['Dat ass eng Mapp.', 'Dat ass en Mapp.', 'erreur', 'grammaire', 'article protégé'],
  ['Ech heesche Paul.', 'Ech heescht Paul.', 'erreur', null, 'conjugaison : une autre forme connue'],
  ['Mir geet et gutt.', 'Mir geet gutt.', 'erreur', 'mot_manquant', 'mot manquant (pronom et)'],
  ['Ech sinn net midd.', 'Ech sinn midd.', 'erreur', 'mot_manquant', 'négation manquante'],
  ['Ech sinn midd.', 'Ech sinn net midd.', 'erreur', 'mot_en_trop', 'mot en trop'],
  ['Dat ass e Stull.', 'Dat ass e Dësch.', 'erreur', null, 'mot valide mais différent'],
  ['Dat ass eng Mapp.', 'Dat ass eng Map.', 'erreur', 'mot_court', 'mot court (4 lettres) : pas de coquille'],
  ['Dat ass e Stull.', 'Dat ass e Stul.', 'coquille_probable', 'omission', 'mot de 5 lettres : une opération tolérée'],
  ['Mir geet et gutt.', 'Mir geet et gut.', 'erreur', 'mot_court', 'réponse très courte'],
  ['Ech sinn net midd.', 'Ech snni net mdid.', 'erreur', 'plusieurs_erreurs', 'plusieurs erreurs dans la phrase'],
  ['Dat ass e Stull.', 'Ass dat e Stull.', 'erreur', 'ordre_des_mots', 'mots inversés'],
  ['Dat ass schweier.', 'Dat ass liicht.', 'erreur', null, 'mot connu différent (contraire)'],
  ['Dat ass schweier.', 'Dat ass xyzqwer.', 'erreur', 'trop_different', 'mot inconnu trop différent'],
  ['Ech heesche Paul.', '', 'erreur', null, 'réponse vide'],
];

let rate = 0;
cas.forEach(([attendu, saisi, statut, type, nom]) => {
  const r = analyserReponse(saisi, attendu, ctx);
  const okStatut = r.statut === statut && (!type || r.typeErreur === type);
  const okGratuit = r.correctionGratuiteAutorisee === (statut === 'coquille_probable');
  const ok = okStatut && okGratuit;
  if (!ok) rate++;
  console.log((ok ? '  ok    ' : '  ÉCHEC ') + nom + ' : « ' + saisi + ' » → ' + r.statut + (r.typeErreur ? ' (' + r.typeErreur + ')' : '') +
    (ok ? '' : '   [attendu : ' + statut + (type ? ' / ' + type : '') + ']'));
});

// Déterminisme : même entrée, même sortie.
const a = JSON.stringify(analyserReponse('Gudde Mioen!', 'Gudde Moien!', ctx));
const b = JSON.stringify(analyserReponse('Gudde Mioen!', 'Gudde Moien!', ctx));
console.log((a === b ? '  ok    ' : '  ÉCHEC ') + 'déterministe'); if (a !== b) rate++;
// Damerau-Levenshtein
const d = [distanceEdition('moien', 'mioen'), distanceEdition('heesche', 'heesce'), distanceEdition('abc', 'abc')];
console.log((d.join() === '1,1,0' ? '  ok    ' : '  ÉCHEC ') + 'distance d\'édition ' + d.join()); if (d.join() !== '1,1,0') rate++;

console.log(rate ? rate + ' échec(s)' : 'tout est bon');
process.exit(rate ? 1 : 0);
