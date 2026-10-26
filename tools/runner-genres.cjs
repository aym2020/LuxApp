#!/usr/bin/env node
// SPEC 96 — Lux Runner : génère public/runner-mots.js (référentiel des genres).
//
// Usage : node tools/runner-genres.cjs          → réécrit public/runner-mots.js
//         node tools/runner-genres.cjs --check  → vérifie seulement (exit 1 si écart)
//
// Sources, dans cet ordre :
//   1. flashcards dont la note COMMENCE par « Masculin », « Féminin » ou « Neutre »
//      (genre écrit en toutes lettres par l'auteur de la leçon) ;
//   2. une petite liste MANUEL, relue à la main, pour les noms dont le genre est
//      donné ailleurs dans la carte (pluriels de la leçon 6, lieux des leçons 21-22).
// Le genre n'est JAMAIS déduit de l'article e/en (masculin ET neutre) ni du français.
// Le jeu ne lit que le fichier généré : aucune interprétation de texte libre en partie.
'use strict';
const fs = require('fs');
const path = require('path');

const RACINE = path.join(__dirname, '..');
const SORTIE = path.join(RACINE, 'public', 'runner-mots.js');
const GENRES = { Masculin: 'm', 'Féminin': 'f', Neutre: 'n' };

// Noms relus à la main : [niveau, leçon, flashcard, nom, traduction, genre].
// Le genre est celui écrit dans la note de la carte indiquée.
const MANUEL = [
  ['A1.1', 6, 2012, 'Posch', 'poche', 'f'],         // « Pluriel de eng Posch (féminin) »
  ['A1.1', 6, 2016, 'Mauer', 'mur', 'f'],           // « Pluriel de eng Mauer (féminin) »
  ['A1.1', 6, 2020, 'Drécker', 'imprimante', 'm'],  // « Pluriel de en Drécker (masculin) »
  ['A1.1', 6, 2023, 'Heft', 'cahier', 'n'],         // « Pluriel de en Heft (neutre) »
  ['A1.1', 6, 2025, 'Haus', 'maison', 'n'],         // « Pluriel de en Haus (neutre) »
  ['A1.1', 6, 2036, 'Ball', 'balle', 'm'],          // « Pluriel de e Ball (masculin) »
  ['A1.1', 6, 2037, 'Zuch', 'train', 'm'],          // « Pluriel de en Zuch (masculin) »
  ['A1.1', 2, 2702, 'Auto', 'voiture', 'm'],        // « masculin · A : n conservé »
  ['A1.1', 2, 2704, 'Dësch', 'table', 'm'],         // « masculin · D : n conservé »
  ['A1.1', 2, 2706, 'Telefon', 'téléphone', 'm'],   // « masculin · T : n conservé »
  ['A1.2', 21, 2002, 'Kichen', 'cuisine', 'f'],     // « d'Kichen : féminin »
  ['A1.2', 21, 2003, 'Stuff', 'salon', 'f'],        // « d'Stuff : féminin »
  ['A1.2', 21, 2004, 'Buedzëmmer', 'salle de bain', 'n'],
  ['A1.2', 21, 2005, 'Schlofzëmmer', 'chambre', 'n'],
  ['A1.2', 22, 2014, 'Cours', 'cours', 'm'],        // « de Cours = masculin »
  ['A1.2', 22, 2032, 'Schwämm', 'piscine', 'f'],    // « d'Schwämm = féminin »
  ['A1.2', 22, 2033, 'Bësch', 'forêt', 'm'],        // « de Bësch = masculin »
  ['A1.2', 22, 2034, 'Disco', 'boîte de nuit', 'f'] // « d'Disco = féminin »
];

// Article indéfini (règle de l'Eifel) : le -n reste devant une voyelle
// et devant n, d, t, z, h. Féminin : toujours « eng ».
function articleIndefini(nom, genre) {
  if (genre === 'f') return 'eng';
  const premiere = nom.charAt(0).toLowerCase();
  return 'aeiouäëéöüyndtzh'.includes(premiere) ? 'en' : 'e';
}

// « un sac / cartable » → « sac / cartable » : pas d'article français, pas d'indice.
// Chaque partie d'une double traduction (« image / un tableau ») est nettoyée.
function sansArticle(fr) {
  return fr.split(' / ').map(partie =>
    partie.trim().replace(/^(un|une|le|la|les|des)\s+/i, '').replace(/^l['’]\s*/i, '')
  ).join(' / ');
}

function chargerLecons() {
  const lecons = [];
  const base = path.join(RACINE, 'data', 'lecons');
  for (const niveau of fs.readdirSync(base).sort()) {
    for (const fichier of fs.readdirSync(path.join(base, niveau)).sort()) {
      if (!/^lecon-\d+\.json$/.test(fichier)) continue;
      const lecon = JSON.parse(fs.readFileSync(path.join(base, niveau, fichier), 'utf8'));
      lecon.niveau = niveau;
      lecons.push(lecon);
    }
  }
  return lecons;
}

function construire() {
  const lecons = chargerLecons();
  const mots = [];
  const vus = new Set(); // niveau + nom : pas de doublon dans un niveau

  function ajouter(niveau, leconId, carteId, nom, fr, genre) {
    const cle = niveau + '|' + nom.toLowerCase();
    if (vus.has(cle)) return;
    vus.add(cle);
    const prefixe = niveau === 'A1.1' ? 'a11' : 'a12';
    mots.push({
      id: prefixe + '-l' + String(leconId).padStart(2, '0') + '-fc' + carteId,
      sourceLessonId: leconId,
      sourceFlashcardId: carteId,
      level: niveau,
      lemma: nom,
      translation: fr,
      gender: genre,
      articleForm: articleIndefini(nom, genre) + ' ' + nom
    });
  }

  for (const lecon of lecons) {
    for (const carte of lecon.flashcards || []) {
      const m = /^\s*(Masculin|Féminin|Neutre)\b/.exec(carte.note || '');
      // Un nom seul, avec majuscule : pas d'expression (« en Trëppeltour maachen »).
      if (!m || !/^\p{Lu}[\p{L}]*$/u.test(carte.lu || '')) continue;
      ajouter(lecon.niveau, lecon.id, carte.id, carte.lu, sansArticle(carte.fr), GENRES[m[1]]);
    }
  }
  for (const [niveau, leconId, carteId, nom, fr, genre] of MANUEL) {
    ajouter(niveau, leconId, carteId, nom, fr, genre);
  }
  mots.sort((a, b) => a.level.localeCompare(b.level) || a.sourceLessonId - b.sourceLessonId ||
    a.sourceFlashcardId - b.sourceFlashcardId);
  return mots;
}

function fichier(mots) {
  return '/* SPEC 96 — Lux Runner : référentiel des genres. FICHIER GÉNÉRÉ par\n' +
    '   tools/runner-genres.cjs : ne pas modifier à la main, corriger la leçon ou la\n' +
    '   liste MANUEL puis relancer le script. Genres autorisés : m, f, n. */\n' +
    "'use strict';\n" +
    'const RUNNER_MOTS = ' + JSON.stringify(mots, null, 1) + ';\n';
}

if (require.main === module) {
  const contenu = fichier(construire());
  if (process.argv.includes('--check')) {
    const actuel = fs.existsSync(SORTIE) ? fs.readFileSync(SORTIE, 'utf8') : '';
    if (actuel !== contenu) {
      console.error('public/runner-mots.js n’est pas à jour : relancer node tools/runner-genres.cjs');
      process.exit(1);
    }
    console.log('runner-mots.js à jour');
  } else {
    fs.writeFileSync(SORTIE, contenu);
    console.log('public/runner-mots.js écrit');
  }
}

module.exports = { construire, articleIndefini, sansArticle, MANUEL };
