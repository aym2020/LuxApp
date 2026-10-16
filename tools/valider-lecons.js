// Vérifie toutes les leçons avant une livraison.
// Lancer : node tools/valider-lecons.js
//
// ERREUR    = à corriger (le script s'arrête avec le code 1)
// ATTENTION = à regarder, mais ne bloque pas
//
// Leçons sans "unites" (ancien format) : seulement le JSON et les champs de base.
// Leçons avec "unites" (v2) : contrôles complets.

const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..', 'data', 'lecons');
const TYPES = ['flashcards', 'quiz', 'trous', 'ecriture'];

// Tailles conseillées pour le CŒUR d'une unité (min, max). Le « + » n'a pas de limite.
const TAILLES = { flashcards: [5, 10], quiz: [6, 10], trous: [6, 10], ecriture: [5, 8] };

let nbErreurs = 0;
let nbAttentions = 0;

function erreur(fichier, msg) { nbErreurs++; console.log('  ERREUR    ' + fichier + ' : ' + msg); }
function attention(fichier, msg) { nbAttentions++; console.log('  ATTENTION ' + fichier + ' : ' + msg); }

// Texte brut d'un bloc de cours (sans les balises HTML), pour chercher un mot.
function texteDuBloc(bloc) {
  return JSON.stringify(bloc).replace(/<[^>]+>/g, '').toLowerCase();
}

function verifierV2(f, l) {
  const idsUnites = l.unites.map(u => u.id);
  if (new Set(idsUnites).size !== idsUnites.length) erreur(f, 'deux unités ont le même id');
  l.unites.forEach(u => {
    if (!u.titre) erreur(f, 'unité ' + u.id + ' sans titre');
    if (!u.regle) attention(f, 'unité ' + u.id + ' sans règle (écran « Avant de commencer »)');
    if (!u.pieges || !u.pieges.length) attention(f, 'unité ' + u.id + ' sans point d\'attention (« pieges »)');
    else if (u.pieges.length > 2) attention(f, 'unité ' + u.id + ' : ' + u.pieges.length + ' pièges (2 max conseillé)');
  });

  TYPES.forEach(type => {
    const items = l[type] || [];
    const ids = items.map(x => x.id);
    if (ids.some(id => typeof id !== 'number')) erreur(f, type + ' : un item n\'a pas d\'id numérique');
    if (new Set(ids).size !== ids.length) erreur(f, type + ' : ids en double');
    if (ids.some(id => id < 1000)) attention(f, type + ' : id < 1000 (risque de mélange avec l\'historique v1)');

    items.forEach(x => {
      if (!idsUnites.includes(x.unite)) erreur(f, type + ' id ' + x.id + ' : unité « ' + x.unite + ' » inconnue');
      if (x.attention !== undefined && !x.attention) erreur(f, type + ' id ' + x.id + ' : « attention » vide');
      if (x.plus !== undefined && x.plus !== true) erreur(f, type + ' id ' + x.id + ' : « plus » doit valoir true');
      const u = l.unites.find(v => v.id === x.unite);
      if (x.plus && u && u.bonus) attention(f, type + ' id ' + x.id + ' : « plus » dans une unité bonus (déjà facultative)');
    });

    // Taille du cœur de chaque unité (sans le « + »).
    l.unites.forEach(u => {
      const n = items.filter(x => x.unite === u.id && !x.plus).length;
      const [min, max] = TAILLES[type];
      if (n === 0) attention(f, 'unité ' + u.id + ' : aucun item ' + type);
      else if (n < min || n > max) attention(f, 'unité ' + u.id + ' : ' + n + ' ' + type + ' (conseillé ' + min + ' à ' + max + ')');
    });
  });

  // Contenu de chaque type.
  (l.flashcards || []).forEach(c => {
    if (!c.fr || !c.lu) erreur(f, 'mot caché id ' + c.id + ' : fr ou lu manquant');
    if (c.lu && c.lu.includes('/')) erreur(f, 'mot caché id ' + c.id + ' : « / » dans lu, une carte = un mot');
    if (c.lu && c.lu.length > 24) attention(f, 'mot caché id ' + c.id + ' : « ' + c.lu + ' » est long pour des cases');
  });
  (l.quiz || []).forEach(q => {
    if (q.distracteurs.includes(q.reponse)) erreur(f, 'quiz id ' + q.id + ' : la réponse est aussi un distracteur');
    if (new Set(q.distracteurs).size !== q.distracteurs.length) erreur(f, 'quiz id ' + q.id + ' : distracteurs en double');
  });
  (l.trous || []).forEach(t => {
    if (!t.choix.includes(t.trou)) erreur(f, 'trou id ' + t.id + ' : la réponse n\'est pas dans les choix');
    if (new Set(t.choix).size !== t.choix.length) erreur(f, 'trou id ' + t.id + ' : choix en double');
  });
  (l.ecriture || []).forEach(e => {
    if (!e.fr || !e.lu) erreur(f, 'écriture id ' + e.id + ' : fr ou lu manquant');
  });

  // Blocs de cours : unité connue, ou 0 (= seulement « Toute la leçon »).
  (l.cours || []).forEach((b, i) => {
    if (b.unite != null && b.unite !== 0 && !idsUnites.includes(b.unite)) {
      erreur(f, 'bloc de cours n°' + (i + 1) + ' : unité « ' + b.unite + ' » inconnue');
    }
    if (b.type === 'callout' && b.lignes && b.lignes.length > 3) {
      attention(f, 'bloc « ' + b.titre + ' » : ' + b.lignes.length + ' lignes (3 max conseillé)');
    }
  });

  // Mission : un fil par leçon (scène finale).
  if (!l.mission || !l.scene) {
    attention(f, 'pas de mission (« mission » + « scene ») : la leçon n\'a pas de fil');
  } else {
    ['titre', 'contexte', 'objectif'].forEach(k => { if (!l.mission[k]) erreur(f, 'mission sans « ' + k + ' »'); });
    const fil = l.unites.filter(u => !u.bonus).map(u => u.id);
    let derniere = 0;
    l.scene.forEach((x, i) => {
      if (!x.qui || !x.lu || !x.fr) erreur(f, 'réplique n°' + (i + 1) + ' : qui, lu ou fr manquant');
      if (!fil.includes(x.unite)) erreur(f, 'réplique n°' + (i + 1) + ' : unité « ' + x.unite + ' » hors du fil');
      if (x.unite < derniere) attention(f, 'réplique n°' + (i + 1) + ' : unité plus petite que la précédente (la scène se remplit dans le désordre)');
      derniere = Math.max(derniere, x.unite);
    });
    if (!l.scene.some(x => x.qui === 'toi')) erreur(f, 'la scène n\'a aucune réplique « toi » à écrire');
    fil.forEach(id => {
      if (!l.scene.some(x => x.unite === id)) attention(f, 'unité ' + id + ' : aucune réplique dans la scène');
    });
  }
  l.unites.forEach(u => {
    if (!u.bonus && !u.phrase) attention(f, 'unité ' + u.id + ' sans « phrase » (la phrase de la scène qu\'elle apprend)');
  });

  // Chaque mot caché doit se retrouver dans le cours.
  const cours = (l.cours || []).map(texteDuBloc).join(' ');
  (l.flashcards || []).forEach(c => {
    if (!cours.includes(c.lu.toLowerCase())) attention(f, 'mot « ' + c.lu + ' » absent du cours');
  });
}

// Notes « attention » qui contiennent la réponse (S6) : elles sont masquées
// automatiquement au 1er essai. On les compte pour pouvoir les relire.
let nbNotesAvecReponse = 0;
const MONTRER_NOTES = process.argv.includes('--notes');

function sansAccents(t) {
  return String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function compterNotesAvecReponse(f, l) {
  ['flashcards', 'ecriture'].forEach(type => (l[type] || []).forEach(x => {
    if (!x.attention || !x.lu) return;
    const texte = sansAccents(x.attention.replace(/<[^>]+>/g, ''));
    if (texte.includes(sansAccents(x.lu))) {
      nbNotesAvecReponse++;
      if (MONTRER_NOTES) console.log('  NOTE      ' + f + ' : ' + type + ' « ' + x.lu + ' »');
    }
  }));
}

function verifierFichier(fichier) {
  const nom = path.relative(BASE, fichier);
  let l;
  try {
    l = JSON.parse(fs.readFileSync(fichier, 'utf8'));
  } catch (e) {
    erreur(nom, 'JSON invalide : ' + e.message);
    return null;
  }
  ['id', 'titre', 'titre_fr', 'couleur'].forEach(k => { if (l[k] == null) erreur(nom, 'champ « ' + k + ' » manquant'); });
  if (Array.isArray(l.unites)) {
    verifierV2(nom, l);
    compterNotesAvecReponse(nom, l);
  }
  return l;
}

console.log('Vérification des leçons…');
const ids = [];
fs.readdirSync(BASE).sort().forEach(niveau => {
  const dossier = path.join(BASE, niveau);
  if (!fs.statSync(dossier).isDirectory()) return;
  fs.readdirSync(dossier).filter(f => f.endsWith('.json')).sort().forEach(f => {
    const l = verifierFichier(path.join(dossier, f));
    if (!l) return;
    if (ids.includes(l.id)) erreur(niveau + '/' + f, 'id de leçon ' + l.id + ' déjà utilisé');
    ids.push(l.id);
    console.log('  ok        ' + niveau + '/' + f + (Array.isArray(l.unites) ? '  (v2, ' + l.unites.length + ' unités)' : ''));
  });
});

console.log('\n' + nbErreurs + ' erreur(s), ' + nbAttentions + ' attention(s).');
if (nbNotesAvecReponse) {
  console.log('Info : ' + nbNotesAvecReponse + ' notes « attention » contiennent la réponse ; elles sont masquées' +
    ' au 1er essai. Liste : node tools/valider-lecons.js --notes');
}
process.exit(nbErreurs ? 1 : 0);
