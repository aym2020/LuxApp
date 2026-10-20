// ─── SPEC 71 : PRONONCIATION EN CONTEXTE ET EXEMPLES ────────────────────────
// 1. Bulle : le bouton gris sable joue la phrase LOD et affiche, dans une bulle
//    flottante, la phrase entière (expression en doré) et sa traduction.
//    La bulle flotte au-dessus de la page : aucune ligne ne change de hauteur.
// 2. Exemples : un lien « N exemples en contexte » en bas d'un bloc de vocabulaire
//    ouvre un écran dédié avec les phrases LOD validées de ce bloc.
// Le bouton Retour du téléphone et Échap ferment la bulle, puis l'écran d'exemples.
// Données : sonsContexte et sonsPhrases (dialogue.js), seulement des sons validés et téléchargés.

// Phrase avec l'expression mise en valeur (texte échappé).
function phraseSurlignee(phrase, lu) {
  const cible = String(lu).replace(/<[^>]*>/g, '').replace(/[!?.,;:]+\s*$/, '').trim();
  const i = cible ? phrase.toLowerCase().replace(/’/g, "'").indexOf(cible.toLowerCase().replace(/’/g, "'")) : -1;
  if (i < 0) return escHtml(phrase);
  return escHtml(phrase.slice(0, i)) + '<strong>' + escHtml(phrase.slice(i, i + cible.length)) + '</strong>' +
    escHtml(phrase.slice(i + cible.length));
}

// ─── Bulle ──────────────────────────────────────────────────────────────────
let bulleContexte = null; // { el, voile, bouton }

function ecouterContexte(bouton) {
  const c = sonsContexte[bouton.dataset.cle];
  if (!c) return;
  const memeBouton = bulleContexte && bulleContexte.bouton === bouton;
  fermerBulleContexte();
  if (memeBouton) { arreterAudio(); return; } // second appui : on referme
  ouvrirBulleContexte(bouton, c);
  jouerAudio(c.son, bouton);
}

function ouvrirBulleContexte(bouton, c) {
  const voile = document.createElement('div');
  voile.className = 'bulle-voile';
  voile.onclick = fermerBulleContexte;
  const el = document.createElement('div');
  el.className = 'bulle-contexte';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-label', 'Prononciation en contexte');
  el.innerHTML =
    '<div class="bulle-titre">' + ICONE_ECOUTER + 'Prononciation en contexte</div>' +
    '<p class="bulle-lu" lang="lb">' + phraseSurlignee(c.phrase, bouton.dataset.lu || '') + '</p>' +
    '<p class="bulle-fr">' + escHtml(c.fr) + '</p>' +
    '<div class="bulle-pied"><small>La phrase entière est prononcée</small>' +
    '<button type="button" class="bulle-fermer">Fermer ×</button></div>';
  el.querySelector('.bulle-fermer').onclick = fermerBulleContexte;
  document.body.appendChild(voile);
  document.body.appendChild(el);
  bouton.setAttribute('aria-expanded', 'true');
  bulleContexte = { el, voile, bouton };
  placerBulle(el, bouton);
  if (typeof programmerGarde === 'function') programmerGarde();
}

// Sous le bouton, aligné à droite ; au-dessus s'il n'y a pas la place en bas.
function placerBulle(el, bouton) {
  const b = bouton.getBoundingClientRect();
  const largeur = el.offsetWidth;
  const hauteur = el.offsetHeight;
  const gauche = Math.max(12, Math.min(b.right - largeur + 26, window.innerWidth - largeur - 12));
  let haut = b.bottom + 6;
  el.classList.remove('dessus');
  if (haut + hauteur > window.innerHeight - 12) {
    haut = b.top - hauteur - 10;
    el.classList.add('dessus');
  }
  el.style.left = gauche + 'px';
  el.style.top = Math.max(12, haut) + 'px';
  el.style.setProperty('--fleche', Math.min(largeur - 24, Math.max(14, b.left + b.width / 2 - gauche - 5)) + 'px');
}

function bulleContexteOuverte() {
  return !!bulleContexte;
}

function fermerBulleContexte() {
  if (!bulleContexte) return false;
  const { el, voile, bouton } = bulleContexte;
  bulleContexte = null;
  el.remove();
  voile.remove();
  bouton.setAttribute('aria-expanded', 'false');
  if (typeof programmerGarde === 'function') programmerGarde();
  return true;
}

// La page bouge sous la bulle (défilement, barre d'adresse du téléphone) : la bulle suit son bouton,
// et se ferme si le bouton sort de l'écran.
function suivreBouton() {
  if (!bulleContexte) return;
  const b = bulleContexte.bouton.getBoundingClientRect();
  if (!bulleContexte.bouton.isConnected || b.bottom < 0 || b.top > window.innerHeight) { fermerBulleContexte(); return; }
  placerBulle(bulleContexte.el, bulleContexte.bouton);
}
window.addEventListener('resize', suivreBouton);
document.addEventListener('scroll', suivreBouton, { capture: true, passive: true });

// ─── Exemples d'un bloc de vocabulaire ──────────────────────────────────────
let exemplesBlocs = [];   // listes d'exemples des liens affichés (indice = data du lien)
let ecranExemples = null;

// Phrases LOD validées pour les mots d'un bloc : phrase où l'expression est dite, ou phrase exacte.
function exemplesDuBloc(items) {
  const liste = [];
  const vus = new Set();
  for (const [lu, fr] of items) {
    const c = sonsContexte[cleePhrase(lu)];
    const exacte = sonsPhrases[cleePhrase(lu)];
    let ex = null;
    if (c && FICHIER_SON.test(c.son)) ex = { lu, phrase: c.phrase, fr: c.fr, son: c.son, contexte: true };
    else if (exacte && FICHIER_SON.test(exacte)) ex = { lu, phrase: String(lu).replace(/<[^>]*>/g, ''), fr, son: exacte, contexte: false };
    if (ex && !vus.has(ex.son)) { vus.add(ex.son); liste.push(ex); }
  }
  return liste;
}

// Lien en bas d'un bloc de vocabulaire, ou rien s'il n'a aucun exemple validé.
function lienExemplesHtml(titre, items) {
  const exemples = exemplesDuBloc(items || []);
  if (!exemples.length) return '';
  const lecon = typeof currentLecon !== 'undefined' && currentLecon ? currentLecon : null;
  exemplesBlocs.push({ titre, exemples, lecon: lecon ? { id: lecon.id, titre_fr: lecon.titre_fr } : null });
  if (exemplesBlocs.length > 200) exemplesBlocs = exemplesBlocs.slice(-100); // garde les blocs récents
  const n = exemples.length;
  return '<button type="button" class="lien-exemples" onclick="ouvrirExemples(' + (exemplesBlocs.length - 1) + ')">' +
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19V5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2"/><path d="M8 7h7M8 11h7"/></svg>' +
    '<span>' + n + ' exemple' + (n > 1 ? 's' : '') + ' en contexte<small>Écouter des phrases complètes du LOD</small></span>' +
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg></button>';
}

function ouvrirExemples(i) {
  const bloc = exemplesBlocs[i];
  if (!bloc) return;
  fermerExemples();
  const el = document.createElement('section');
  el.className = 'exv';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-modal', 'true');
  el.setAttribute('aria-labelledby', 'exv-titre');
  const tag = bloc.lecon ? 'Leçon ' + bloc.lecon.id + ' · Exemples' : 'Exemples';
  el.innerHTML =
    '<div class="exv-tete">' +
      '<button type="button" class="exv-retour" aria-label="Retour au cours">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18 9 12l6-6"/></svg></button>' +
      '<div><div class="exv-tag">' + escHtml(tag) + '</div>' +
      '<div class="exv-nom">' + escHtml(bloc.lecon ? bloc.lecon.titre_fr : bloc.titre) + '</div></div>' +
    '</div>' +
    '<div class="exv-corps">' +
      '<div class="exv-kicker">' + escHtml(bloc.titre) + '</div>' +
      '<h2 id="exv-titre">Les mots en situation</h2>' +
      '<p class="exv-intro">Des phrases authentiques du LOD, enregistrées par des locuteurs luxembourgeois.</p>' +
      bloc.exemples.map((e, n) =>
        '<article class="exv-carte">' +
          '<div class="exv-haut"><span class="exv-num">Exemple ' + String(n + 1).padStart(2, '0') + '</span>' +
          '<span class="exv-pastille' + (e.contexte ? '' : ' exacte') + '">' + (e.contexte ? 'Dans une phrase' : 'Phrase exacte') + '</span></div>' +
          '<p class="exv-lu" lang="lb">' + (e.contexte ? phraseSurlignee(e.phrase, e.lu) : escHtml(e.phrase)) + '</p>' +
          '<p class="exv-fr">' + escHtml(e.fr) + '</p>' +
          '<div class="exv-actions"><button type="button" class="exv-ecouter" data-n="' + n + '">' + ICONE_ECOUTER + 'Écouter la phrase</button></div>' +
        '</article>').join('') +
    '</div>';
  el.querySelector('.exv-retour').onclick = fermerExemples;
  el.querySelectorAll('.exv-ecouter').forEach(b => {
    b.onclick = () => jouerAudio(bloc.exemples[+b.dataset.n].son, b);
  });
  document.body.appendChild(el);
  ecranExemples = { el, focusAvant: document.activeElement };
  el.querySelector('.exv-retour').focus({ preventScroll: true });
  if (typeof programmerGarde === 'function') programmerGarde();
}

function exemplesOuverts() {
  return !!ecranExemples;
}

function fermerExemples() {
  if (!ecranExemples) return false;
  const { el, focusAvant } = ecranExemples;
  ecranExemples = null;
  arreterAudio();
  el.remove();
  if (focusAvant && focusAvant.focus) focusAvant.focus({ preventScroll: true });
  if (typeof programmerGarde === 'function') programmerGarde();
  return true;
}

// Échap : la bulle d'abord, puis l'écran d'exemples (avant le panneau Cours en dessous).
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (fermerBulleContexte() || fermerExemples()) { e.preventDefault(); e.stopImmediatePropagation(); }
}, true);
