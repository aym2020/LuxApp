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

// SPEC 75 — valider le classement explicite des blocs de cours pilotes.
function validerRubriques(f, l) {
  const valides = new Set(['regles', 'lexique', 'phrases']);
  const applicable = /^A1\.[12]\/lecon-\d+\.json$/.test(f) && Array.isArray(l.unites);
  (l.cours || []).forEach((b,i) => {
    if (!applicable && b.rubrique === undefined) return;
    if (!valides.has(b.rubrique)) erreur(f, 'cours bloc ' + i + ' : rubrique inconnue');
    if (b.unite !== undefined && b.unite !== 0 && !(l.unites || []).some(u => u.id === b.unite))
      erreur(f, 'cours bloc ' + i + ' : unité inconnue');
    if (b.type === 'vocab' && b.rubrique !== 'lexique')
      erreur(f, 'cours bloc ' + i + ' : vocabulaire hors Lexique');
    if (b.type === 'dialogue' && b.rubrique !== 'phrases')
      erreur(f, 'cours bloc ' + i + ' : dialogue hors Phrases');
    if (['callout','regle','texte'].includes(b.type) && b.rubrique !== 'regles')
      erreur(f, 'cours bloc ' + i + ' : explication hors Règles');
    if (b.type === 'phrases' && (b.rubrique !== 'phrases' || !Array.isArray(b.items) ||
      !b.items.length || b.items.some(p => !Array.isArray(p) || p.length !== 2 ||
        p.some(t => typeof t !== 'string' || !t.trim()))))
      erreur(f, 'cours bloc ' + i + ' : phrases invalides');
  });
  if (applicable) {
    for (const u of l.unites) {
      if (!l.cours.some(b => b.unite === u.id && b.rubrique === 'regles'))
        erreur(f, 'unité ' + u.id + ' : aucune règle nommée');
      if (!l.cours.some(b => b.unite === u.id && b.rubrique === 'phrases'))
        erreur(f, 'unité ' + u.id + ' : aucune phrase source');
      if (!l.cours.some(b => b.unite === u.id && b.rubrique === 'lexique') &&
          !l.cours.some(b => b.unite === 0 && b.rubrique === 'lexique'))
        attention(f, 'unité ' + u.id + ' : lexique disponible seulement dans Toute la leçon');
    }
  }
}

// Texte brut d'un bloc de cours (sans les balises HTML), pour chercher un mot.
function texteDuBloc(bloc) {
  return JSON.stringify(bloc).replace(/<[^>]+>/g, '').toLowerCase();
}

// SPEC 50 : variantes exactes autorisées pour une réponse écrite contextualisée.
function verifierAlternatives(f, item, emplacement) {
  if (item.alternatives === undefined) return;
  const alt = item.alternatives;
  if (!Array.isArray(alt) || alt.length === 0) {
    erreur(f, emplacement + ' : alternatives doit être un tableau non vide');
    return;
  }
  // Même normalisation que public/app.js (casse, accents, ponctuation, espaces).
  const norm = t => sansAccents(t).replace(/[.!?,;:]+/g, '').replace(/\s+/g, ' ').trim();
  const dejaVues = new Set([norm(item.lu)]);
  alt.forEach((v, i) => {
    if (typeof v !== 'string' || !v.trim()) {
      erreur(f, emplacement + ' : alternative ' + (i + 1) + ' vide ou invalide');
      return;
    }
    const n = norm(v);
    if (dejaVues.has(n)) erreur(f, emplacement + ' : alternative identique ou répétée : ' + v);
    dejaVues.add(n);
  });
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

  (l.ecriture || []).forEach(x =>
    verifierAlternatives(f, x, 'écriture id ' + x.id));
  (l.scene || []).forEach((x, i) => {
    if (x.alternatives !== undefined && x.qui !== 'toi') {
      erreur(f, 'réplique ' + (i + 1) + ' : alternatives réservé aux réponses « toi »');
    }
    verifierAlternatives(f, x, 'réplique ' + (i + 1));
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
      if (l.id === 0 && u.activiteUnique) return; // parcours délibérément mono-activité (SPEC 82)
      if (n === 0) attention(f, 'unité ' + u.id + ' : aucun item ' + type);
      else if (n < min || n > max) attention(f, 'unité ' + u.id + ' : ' + n + ' ' + type + ' (conseillé ' + min + ' à ' + max + ')');
    });
  });

  // Article à écrire (S5) : dans ces unités, un nom seul doit avoir son article.
  l.unites.filter(u => u.articleAEcrire).forEach(u => {
    (l.flashcards || []).filter(c => c.unite === u.id && !c.plus).forEach(c => {
      const nomSeul = c.lu && !/[\s?!.]/.test(c.lu) && /^[A-ZÄËÉÖÜ]/.test(c.lu);
      if (nomSeul && !c.article) attention(f, 'unité ' + u.id + ' (article à écrire) : « ' + c.lu + ' » sans article');
    });
  });

  // SPEC 82 : les deux unités sont des activités uniques, jamais du vocabulaire à écrire.
  if (l.id === 0) {
    const u1 = t => (l[t] || []).filter(x => x.unite === 1).length;
    const u2 = t => (l[t] || []).filter(x => x.unite === 2).length;
    if (u1('quiz') !== 20 || u1('flashcards') || u1('trous') || u1('ecriture'))
      erreur(f, 'leçon 0 unité 1 : uniquement 20 quiz audio');
    if (u2('trous') !== 15 || u2('flashcards') || u2('quiz') || u2('ecriture'))
      erreur(f, 'leçon 0 unité 2 : uniquement 15 choix de N');
  }

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
  // Spec 42 : aide vocabulaire — des groupes de mots de la réponse, jamais la réponse entière.
  (l.ecriture || []).concat(l.scene || []).forEach(x => {
    if (x.aide_vocab === undefined) return;
    const ou = x.id ? 'écriture id ' + x.id : 'réplique « ' + x.lu + ' »';
    if (!Array.isArray(x.aide_vocab) || !x.aide_vocab.length) { erreur(f, ou + ' : aide_vocab doit être une liste non vide'); return; }
    const reponse = sansAccents(x.lu).replace(/[.!?,]/g, '');
    x.aide_vocab.forEach(a => {
      if (!a || !a.fr || !a.lu) { erreur(f, ou + ' : aide_vocab sans fr ou lu'); return; }
      const aide = sansAccents(a.lu).replace(/[.!?,]/g, '');
      if (aide === reponse) erreur(f, ou + ' : aide_vocab donne la réponse entière');
      else if (!reponse.includes(aide)) attention(f, ou + ' : aide « ' + a.lu + ' » absente de la réponse');
    });
  });

  // Blocs de cours : unité connue, ou 0 (= seulement « Toute la leçon »).
  (l.cours || []).forEach((b, i) => {
    if (b.unite != null && b.unite !== 0 && !idsUnites.includes(b.unite)) {
      erreur(f, 'bloc de cours n°' + (i + 1) + ' : unité « ' + b.unite + ' » inconnue');
    }
    // Spec 26 : un tableau de traduction se lit luxembourgeois à gauche, français à droite.
    if (b.type === 'tableau' && b.entetes) {
      const iFr = b.entetes.indexOf('Français'), iLu = b.entetes.indexOf('Luxembourgeois');
      if (iFr !== -1 && iLu !== -1 && iFr < iLu) {
        erreur(f, 'tableau « ' + b.titre + ' » : la colonne Luxembourgeois doit être avant Français');
      }
      if (b.lignes && b.lignes.some(r => r.length !== b.entetes.length)) {
        erreur(f, 'tableau « ' + b.titre + ' » : une ligne n\'a pas autant de cellules que d\'en-têtes');
      }
    }
    if (b.type === 'callout' && b.lignes && b.lignes.length > 3) {
      attention(f, 'bloc « ' + b.titre + ' » : ' + b.lignes.length + ' lignes (3 max conseillé)');
    }
  });

  // SPEC 82 : mission audio/interactions de la leçon 0 (aucune traduction).
  // Son format diffère volontairement du dialogue traditionnel à dix répliques.
  if (l.mission && l.mission.type === 'studio-radio') {
    if (l.id !== 0) erreur(f, 'mission studio radio réservée à la leçon 0');
    if (!Array.isArray(l.scene) || l.scene.length) erreur(f, 'studio radio : scène héritée attendue vide');
    if (l.mission.version < 2) erreur(f, 'studio radio : version minimum 2');
    const defis = l.mission.defis || [];
    if (defis.length !== 8) erreur(f, 'studio radio : huit défis attendus');
    const compte = type => defis.filter(d => d.type === type).length;
    if (compte('audio') !== 3 || compte('verification') !== 3 || compte('completer') !== 2)
      erreur(f, 'studio radio : 3 sons, 3 vérifications et 2 choix de forme attendus');
    const ids = defis.map(d => d.id);
    if (new Set(ids).size !== ids.length) erreur(f, 'studio radio : IDs dupliqués');
    defis.forEach(d => {
      if (!Array.isArray(d.choix) || !d.choix.includes(d.reponse))
        erreur(f, 'studio radio : réponse absente des choix, défi ' + d.id);
      if (new Set(d.choix || []).size !== (d.choix || []).length)
        erreur(f, 'studio radio : choix répétés, défi ' + d.id);
      if (d.type === 'audio' && !d.audioMot) erreur(f, 'studio radio : audioMot manquant');
      if (d.type !== 'audio' && !d.script) erreur(f, 'studio radio : script manquant');
      if (![1,2].includes(d.unite)) erreur(f, 'studio radio : unité invalide');
    });
  } else if (!l.mission || !l.scene) {
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
    // Spec 34 : exactement 10 réponses à produire, scène en version 2 ou plus.
    const nbToi = l.scene.filter(x => x.qui === 'toi').length;
    if (nbToi !== 10) erreur(f, 'la mission a ' + nbToi + ' réponses à produire (10 attendues)');
    if (!(l.mission.version >= 2)) erreur(f, 'mission.version doit valoir au moins 2 (scène à 10 réponses)');
    fil.forEach(id => {
      if (!l.scene.some(x => x.unite === id && x.qui === 'toi')) erreur(f, 'unité ' + id + ' : aucune réponse à produire dans la mission');
    });
    fil.forEach(id => {
      if (!l.scene.some(x => x.unite === id)) attention(f, 'unité ' + id + ' : aucune réplique dans la scène');
    });
  }
  l.unites.forEach(u => {
    if (l.id !== 0 && !u.bonus && !u.phrase) attention(f, 'unité ' + u.id + ' sans « phrase » (la phrase de la scène qu\'elle apprend)');
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
  validerRubriques(nom, l);
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
