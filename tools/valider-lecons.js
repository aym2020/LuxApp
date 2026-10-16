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

// Tailles conseillées par unité (min, max).
const TAILLES = { flashcards: [6, 12], quiz: [6, 10], trous: [6, 10], ecriture: [5, 8] };

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
  });

  TYPES.forEach(type => {
    const items = l[type] || [];
    const ids = items.map(x => x.id);
    if (ids.some(id => typeof id !== 'number')) erreur(f, type + ' : un item n\'a pas d\'id numérique');
    if (new Set(ids).size !== ids.length) erreur(f, type + ' : ids en double');
    if (ids.some(id => id < 1000)) attention(f, type + ' : id < 1000 (risque de mélange avec l\'historique v1)');

    items.forEach(x => {
      if (!idsUnites.includes(x.unite)) erreur(f, type + ' id ' + x.id + ' : unité « ' + x.unite + ' » inconnue');
    });

    // Taille de chaque unité.
    l.unites.forEach(u => {
      const n = items.filter(x => x.unite === u.id).length;
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

  // Chaque mot caché doit se retrouver dans le cours.
  const cours = (l.cours || []).map(texteDuBloc).join(' ');
  (l.flashcards || []).forEach(c => {
    if (!cours.includes(c.lu.toLowerCase())) attention(f, 'mot « ' + c.lu + ' » absent du cours');
  });
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
  if (Array.isArray(l.unites)) verifierV2(nom, l);
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
process.exit(nbErreurs ? 1 : 0);
