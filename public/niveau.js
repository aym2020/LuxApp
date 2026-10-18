// ─── NIVEAU CHOISI ET PROGRESSION DU NIVEAU (S13) ──────────────────────────
// Le niveau appartient à l'utilisateur : il le choisit, l'app ne le change
// jamais seule. L'app calcule la progression DANS ce niveau.
//
// Le choix est rangé à part de la progression (clé luxChoix), avec sa date :
//   luxChoix = { niveau: { valeur: "A1.2", maj: 1792180107000 } }
// À la synchronisation, le choix le plus RÉCENT gagne (pas le maximum :
// repasser de A1.2 à A1.1 doit être possible). Voir mergeDernier dans cloud.js.

const CHOIX_KEY = 'luxChoix';

function getChoix() {
  try { return JSON.parse(localStorage.getItem(storageKey(CHOIX_KEY))) || {}; } catch (e) { return {}; }
}

function saveChoix(choix) {
  try { localStorage.setItem(storageKey(CHOIX_KEY), JSON.stringify(choix)); } catch (e) { /* ignore */ }
}

// Niveau choisi par l'utilisateur, ou null s'il n'a jamais choisi.
function niveauChoisi() {
  const c = getChoix();
  return c.niveau && c.niveau.valeur ? c.niveau.valeur : null;
}

// Enregistre le choix (avec sa date) et l'applique tout de suite.
function choisirNiveau(niveau) {
  const choix = getChoix();
  choix.niveau = { valeur: niveau, maj: Date.now() };
  saveChoix(choix);
  niveauActif = niveau;
  try { localStorage.setItem('luxNiveau', niveau); } catch (e) { /* ignore */ }
  if (typeof debounceCloudSave === 'function') debounceCloudSave();
}

// Applique le niveau choisi (au démarrage, après une synchronisation).
// Un niveau qui n'existe plus est remplacé par le premier disponible.
function appliquerNiveauChoisi() {
  const niveaux = niveauxDisponibles();
  const choisi = niveauChoisi() || niveauActif;
  niveauActif = niveaux.includes(choisi) ? choisi : (niveaux[0] || 'A1.1');
}

// Seuls les niveaux qui ont au moins une leçon.
function niveauxDisponibles() {
  return listeNiveaux();
}

// Numéro affiché d'une leçon (« Leçon 20 ») : « numero » s'il existe, sinon l'id.
// L'id reste la clé de la progression ; seul l'affichage suit l'ordre du parcours (spec 42).
function numLecon(l) {
  if (typeof l !== 'object') l = typeof lecons !== 'undefined' ? lecons.find(x => x.id === l) : null;
  return l ? (l.numero || l.id) : '';
}

function leconsDuNiveau(niveau) {
  return lecons.filter(l => (l.niveau || 'A1.1') === niveau);
}

// Niveau suivant (pour la proposition de fin de niveau), ou null.
function niveauSuivant(niveau) {
  const niveaux = niveauxDisponibles();
  return niveaux[niveaux.indexOf(niveau) + 1] || null;
}

// ─── ÉTAPES D'UNE LEÇON ─────────────────────────────────────────────────────
// Ce qui compte pour la progression : les vraies étapes de chaque leçon.
//   - leçon en unités (v2) : ses unités du fil + sa mission (si elle en a une) ;
//   - leçon classique (v1) : une seule étape, faite au statut « bien ».
// Le bilan est facultatif : il ne compte jamais.
function etapesLecon(l) {
  if (!isParcoursLecon(l)) return 1;
  return unitesCoeur(l).length + (l.mission && l.scene ? 1 : 0);
}

function etapesFaites(l) {
  if (!isParcoursLecon(l)) return leconV1Faite(l) ? 1 : 0;
  if (acquisV1(l)) return etapesLecon(l); // faite dans l'ancienne version : reste terminée
  // Étapes réellement faites : unités terminées + mission RÉUSSIE (jouée ne suffit pas,
  // spec 32). Une leçon validée par la mission garde son vrai nombre d'unités faites.
  let faites = unitesCoeur(l).filter(u => getUnitBest(l.id, u.id) != null).length;
  if (l.mission && l.scene && missionReussie(l)) faites++;
  return faites;
}

// Leçon terminée (acquise pour le parcours) : toutes ses étapes faites, ou
// mission réussie (raccourci, spec 32), ou terminée avant la spec 32.
function leconTerminee(l) {
  if (isParcoursLecon(l) && l.mission && l.scene && (leconAcquiseParMission(l) || leconTermineeAvantSpec32(l))) return true;
  return etapesFaites(l) >= etapesLecon(l);
}

// Progression d'un niveau : étapes faites / total, et leçons terminées.
function progressionNiveau(niveau) {
  let faites = 0, total = 0, terminees = 0;
  const liste = leconsDuNiveau(niveau);
  liste.forEach(l => {
    faites += leconTerminee(l) ? etapesLecon(l) : etapesFaites(l); // leçon acquise = toutes ses étapes pour le parcours
    total += etapesLecon(l);
    if (leconTerminee(l)) terminees++;
  });
  return { faites, total, terminees, nbLecons: liste.length, pourcent: total ? Math.round(faites / total * 100) : 0 };
}

// Leçon en cours = celle du prochain pas conseillé (partie en cours comprise).
function leconEnCours() {
  const pas = prochainPas();
  return pas && pas.lecon ? pas.lecon : null;
}

// 'terminee', 'encours' ou 'avenir'.
function statutLecon(l) {
  if (leconTerminee(l)) return 'terminee';
  const enCours = leconEnCours();
  if (enCours && enCours.id === l.id) return 'encours';
  return 'avenir';
}

// Titre court d'une leçon : le français avant le tiret (« Identifier des objets »).
function titreCourt(l) {
  return (l.titre_fr || l.titre).split(' – ')[0];
}
