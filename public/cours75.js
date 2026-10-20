// SPEC 75 — Cours pilotes A1.1 (leçons 1–3). Composant commun Cours / panneau.
const cours75Etats = { principal: null, panneau: null };

function cours75Actif(l) {
  return !!l && [1, 2, 3].includes(Number(l.id)) && Array.isArray(l.cours) &&
    l.cours.every(b => ['regles', 'lexique', 'phrases'].includes(b.rubrique));
}
function cours75Lecon(surface) { return surface === 'panneau' ? pLecon : currentLecon; }
function cours75Initialiser(l, surface, unite, exercice) {
  const avant = cours75Etats[surface];
  if (surface === 'principal' && avant && avant.leconId === l.id) return avant;
  const e = { leconId:l.id, unite:unite == null ? null : Number(unite), rubrique:'regles',
    exercice:!!exercice };
  cours75Etats[surface] = e;
  return e;
}
function cours75Html(l, surface, unite, exercice) {
  cours75Initialiser(l, surface, unite, exercice);
  return '<section class="cours75" id="cours75-' + surface + '">' +
    cours75Navigation(l, surface) + '<div class="cours75-resultats" id="cours75-resultats-' +
    surface + '">' + cours75Contenu(l, surface) + '</div></section>';
}
function cours75Navigation(l, surface) {
  const e = cours75Etats[surface];
  // Toutes les unités et « Tout » sont accessibles en un geste, y compris pendant un exercice.
  const unites = l.unites || [];
  const choix = unites.map(u =>
    '<button type="button" class="cours75-chip' + (e.unite === u.id ? ' active' : '') +
    '" aria-pressed="' + (e.unite === u.id) + '" aria-label="Unité ' + u.id +
    '" onclick="cours75Choisir(\'' + surface + '\',\'unite\',' + u.id + ')">' +
    u.id + '</button>').join('') +
    '<button type="button" class="cours75-chip cours75-chip-tout' +
    (e.unite == null ? ' active' : '') + '" aria-pressed="' + (e.unite == null) +
    '" aria-label="Toute la leçon" onclick="cours75Choisir(\'' + surface +
    '\',\'unite\',null)">Tout</button>';
  const onglets = [['regles','Règles'],['lexique','Lexique'],['phrases','Phrases']].map(([k, label]) =>
    '<button type="button" class="cours75-onglet' + (e.rubrique === k ? ' active' : '') +
    '" role="tab" aria-selected="' + (e.rubrique === k) + '" onclick="cours75Choisir(\'' +
    surface + '\',\'rubrique\',\'' + k + '\')">' + label + '</button>').join('');
  return '<div class="cours75-navigation">' +
    '<div class="cours75-portee" role="group" aria-label="Unités du cours" style="--cours75-colonnes:' +
    (unites.length + 1) + '">' + choix + '</div>' +
    '<div class="cours75-onglets" role="tablist" aria-label="Rubriques du cours">' +
    onglets + '</div></div>';
}
function cours75Choisir(surface, champ, valeur) {
  const e = cours75Etats[surface], l = cours75Lecon(surface);
  if (!e || !l) return;
  if (typeof fermerBulleContexte === 'function') fermerBulleContexte();
  if (champ === 'unite') {
    if (e.unite === valeur) return;
    e.unite = valeur;
    if (surface === 'panneau') pCoursUnite = valeur;
  } else if (champ === 'rubrique') {
    if (!['regles','lexique','phrases'].includes(valeur) || e.rubrique === valeur) return;
    e.rubrique = valeur;
  } else return;
  const root = document.getElementById('cours75-' + surface);
  if (!root) return;
  root.innerHTML = cours75Navigation(l, surface) +
    '<div class="cours75-resultats" id="cours75-resultats-' + surface + '">' +
    cours75Contenu(l, surface) + '</div>';
  if (surface === 'panneau') document.getElementById('cp-content').scrollTop = 0;
}
function cours75VersPhrases(surface) { cours75Choisir(surface, 'rubrique', 'phrases'); }
function cours75Filtrer(blocs, rubrique) {
  return blocs.filter(b => b.rubrique === rubrique);
}
function cours75Contenu(l, surface) {
  const e = cours75Etats[surface];
  const afficher = blocs => cours75Groupe(cours75Filtrer(blocs, e.rubrique), l, surface);
  let html = '';
  if (e.unite != null) html = afficher(l.cours.filter(b => b.unite === e.unite || b.unite == null));
  else {
    for (const u of l.unites || []) {
      const content = afficher(l.cours.filter(b => b.unite === u.id));
      if (content) html += '<h3 class="cours75-unite">Unité ' + u.id + ' · ' + escHtml(u.titre) + '</h3>' + content;
    }
    const general = afficher(l.cours.filter(b => b.unite === 0 || b.unite == null));
    if (general) html += '<h3 class="cours75-unite">Pour toute la leçon</h3>' + general;
  }
  if (!html) return '<p class="cours75-vide">Aucun résultat dans cette sélection.</p>';
  if (e.rubrique === 'lexique')
    html += '<button type="button" class="cours75-voir-phrases" onclick="cours75VersPhrases(\'' +
      surface + '\')">Voir les phrases de cette ' + (e.unite == null ? 'leçon' : 'unité') + ' →</button>';
  return html;
}
function cours75Groupe(blocs, l, surface) {
  if (!blocs.length) return '';
  const lexique = cours75Etats[surface].rubrique === 'lexique';
  const bonus = lexique ? blocs.filter(b => b.plus) : [];
  let html = blocs.filter(b => !lexique || !b.plus).map(b => cours75Bloc(b, l)).join('');
  if (bonus.length) {
    const n = bonus.reduce((acc,b) => acc + ((b.items || b.lignes || []).length || 1), 0);
    html += '<details class="cours75-plus"' +
      '><summary>Voir les mots supplémentaires (' + n + ')</summary>' +
      bonus.map(b => cours75Bloc(b, l)).join('') + '</details>';
  }
  return html;
}
// Une seule structure pour une entrée du lexique, une phrase ou une réplique.
// La ligne luxembourgeoise a la même hauteur avec ou sans bouton audio LOD.
function cours75EntreeHtml(row) {
  const [lu, fr, ...notes] = row;
  return '<div class="cours75-entree">' +
    '<div class="cours75-entree-tete" lang="lb">' +
      '<span class="cours75-entree-lu">' + lu + '</span>' +
      boutonEcouterHtml(lu, true) +
    '</div>' +
    '<div class="cours75-entree-fr">' + fr + '</div>' +
    (notes.length ? '<div class="cours75-entree-note">' + notes.join(' · ') + '</div>' : '') +
  '</div>';
}

function cours75Bloc(b, l) {
  if (b.rubrique === 'lexique' && (b.type === 'vocab' || b.type === 'tableau')) {
    const items = b.type === 'vocab' ? b.items : b.lignes;
    return cours75ListeHtml(b, l, items);
  }
  if (b.type === 'phrases' || b.type === 'dialogue') {
    return cours75ListeHtml(b, l, b.type === 'phrases' ? b.items : b.echanges);
  }
  return coursBlocsHtml([b], l.couleur);
}

// Même titre, même ligne et même espacement quel que soit le type de contenu.
function cours75ListeHtml(b, l, items) {
  return '<div class="cours-bloc cours75-bloc" style="border-left:3px solid ' + l.couleur + '">' +
    '<div class="cours-bloc-titre">' + b.titre + '</div>' +
    '<div class="cours75-entrees">' + items.map(cours75EntreeHtml).join('') + '</div>' +
  '</div>';
}
