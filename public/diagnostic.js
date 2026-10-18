// ─── AIDE À L'ERREUR EN DEUX TEMPS (S6) ─────────────────────────────────────
// Au 1er essai raté, on aide SANS donner la réponse :
//   1. un diagnostic automatique (« Bon mot, mauvais article », etc.) ;
//   2. le point d'attention, avec la réponse masquée par « … ».
// Au 2e essai raté (ou « Voir la réponse »), le point d'attention complet.
// Rien n'est annoté dans les leçons : tout se déduit de la réponse attendue.

// Articles reconnus pour le diagnostic « mauvais article » (après normalize).
const ARTICLES = ['e', 'en', 'eng', 'den', 'de', 'dat', 'dei', 'di', "d'"];

// ─── 1. DIAGNOSTIC ──────────────────────────────────────────────────────────
// Compare la réponse donnée à la réponse attendue, mot à mot.
// Renvoie un message court, ou '' si l'erreur ne correspond à aucun cas connu.
function diagnostic(reponse, attendu) {
  const donne = motsDe(reponse);
  const bon = motsDe(attendu);
  if (!donne.length || donne.join(' ') === bon.join(' ')) return '';

  // Même nombre de mots : on regarde les positions qui diffèrent.
  if (donne.length === bon.length) {
    const differences = [];
    for (let i = 0; i < bon.length; i++) {
      if (donne[i] !== bon[i]) differences.push(i);
    }
    if (differences.length === 1) {
      const i = differences[0];
      if (ARTICLES.includes(donne[i]) && ARTICLES.includes(bon[i])) {
        return 'Bon mot, mauvais article. Le genre ne suit pas le français.';
      }
      if (distance(donne[i], bon[i]) === 1) {
        return 'Presque : une lettre à corriger.';
      }
    }
    // Mêmes mots, dans un autre ordre.
    if (donne.slice().sort().join(' ') === bon.slice().sort().join(' ')) {
      return 'Tous les mots sont là, mais pas dans le bon ordre.';
    }
    return '';
  }

  // Un mot de moins : la réponse attendue, avec un mot retiré ?
  if (donne.length === bon.length - 1 && unMotRetire(bon, donne)) {
    return 'Il manque un mot.';
  }
  // Un mot de plus : la réponse donnée, avec un mot retiré, redonne l'attendu ?
  if (donne.length === bon.length + 1 && unMotRetire(donne, bon)) {
    return 'Il y a un mot en trop.';
  }
  return '';
}

// Découpe en mots, après normalize (accents, majuscules, ponctuation ignorés).
// « d'Mamm » est découpé en « d' » + « mamm » pour reconnaître l'article.
function motsDe(texte) {
  const propre = normalize(texte || '').replace(/[’']/g, "' ").replace(/\s+/g, ' ').trim();
  return propre ? propre.split(' ') : [];
}

// Vrai si « court » = « long » avec exactement un mot en moins.
function unMotRetire(long, court) {
  for (let i = 0; i < long.length; i++) {
    const sans = long.slice(0, i).concat(long.slice(i + 1));
    if (sans.join(' ') === court.join(' ')) return true;
  }
  return false;
}

// Nombre de lettres à changer, ajouter ou retirer pour passer de a à b.
function distance(a, b) {
  const ligne = [];
  for (let j = 0; j <= b.length; j++) ligne.push(j);
  for (let i = 1; i <= a.length; i++) {
    let precedent = ligne[0];
    ligne[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const garde = ligne[j];
      const cout = a[i - 1] === b[j - 1] ? 0 : 1;
      ligne[j] = Math.min(ligne[j] + 1, ligne[j - 1] + 1, precedent + cout);
      precedent = garde;
    }
  }
  return ligne[b.length];
}

// ─── 1 bis. UNE LETTRE DE TRAVERS, LOCALISÉE (spec 41) ──────────────────────
// Une seule lettre de différence sur un seul mot, et le mot tapé n'existe
// pas : c'est une faute de frappe, on montre le mot et la nature de l'écart.
// Reste une vraie erreur (pas de correction gratuite) : on réessaie.
// Pas d'indication si le mot tapé est un autre mot réel (« an » pour « am »),
// une forme protégée (article, pronom, verbe fréquent) ou si l'écart est plus grand.
const ECART_LETTRE = {
  doublon: 'Une lettre en trop dans',
  ajout: 'Une lettre en trop dans',
  omission: 'Il manque une lettre dans',
  substitution: 'Une lettre à changer dans',
  inversion: 'Deux lettres inversées dans'
};

function diagnosticLettre(reponse, attendu) {
  if (typeof analyserReponse !== 'function') return '';
  const a = analyserReponse(reponse, attendu);
  if (a.statut !== 'erreur' || !a.mot || !['mot_court', 'trop_different'].includes(a.typeErreur)) return '';
  const { attendu: bon, saisi } = a.mot;
  if (!saisi || distanceEdition(bon, saisi) !== 1) return '';
  if (FORMES_PROTEGEES.has(saisi) || vocabulaireConnu().has(saisi)) return '';
  const debut = ECART_LETTRE[natureEcart(bon, saisi).type];
  if (!debut) return '';
  // Le mot tel que l'utilisateur l'a tapé (majuscules et accents compris).
  const tape = String(reponse).replace(/[’`´]/g, "'").split(/[\s.!?,;:()«»"–—-]+/)
    .find(m => normaliserMot(m) === saisi) || saisi;
  return 'Presque ! ' + debut + ' « ' + tape + ' ».';
}

// ─── 1 ter. LE MOT EN ERREUR ET LES CONFUSIONS CONNUES (spec 42) ────────────
// Le seul mot faux de la réponse (les autres sont justes), ou null.
function motEnErreur(reponse, attendu) {
  if (typeof analyserReponse !== 'function') return null;
  const a = analyserReponse(reponse, attendu);
  if (a.statut !== 'erreur' || !a.mot || !a.mot.saisi || !a.mot.attendu) return null;
  if (!['grammaire', 'mot_court', 'autre_mot', 'trop_different'].includes(a.typeErreur)) return null;
  const tape = String(reponse).replace(/[’`´]/g, "'").split(/[\s.!?,;:()«»"–—-]+/)
    .find(m => normaliserMot(m) === a.mot.saisi) || a.mot.saisi;
  return { attendu: a.mot.attendu, saisi: a.mot.saisi, tape };
}

// La note de la leçon parle-t-elle du mot en erreur (attendu ou tapé) ?
function noteParleDe(note, cible) {
  if (!note) return false;
  const mots = String(note).replace(/<[^>]+>/g, ' ').replace(/…/g, ' ').split(/[\s.!?,;:()«»"/=+→–—-]+/).map(normaliserMot);
  return mots.includes(cible.attendu) || mots.includes(cible.saisi);
}

// Confusions fréquentes : une explication dédiée, sans donner toute la réponse.
const FORMES_SINN = ['sinn', 'si', 'bass', 'ass', 'sidd'];
const FORMES_HUNN = ['hunn', 'hu', 'hues', 'huet', 'hutt'];

function confusionConnue(cible) {
  const { attendu, saisi } = cible;
  if (saisi === 'hien' && attendu === 'en') {
    return 'Pour reprendre un objet masculin, utilise « en » ; « hien » s\'utilise pour une personne.';
  }
  const familleA = FORMES_SINN.includes(attendu) ? 'sinn' : FORMES_HUNN.includes(attendu) ? 'hunn' : null;
  const familleS = FORMES_SINN.includes(saisi) ? 'sinn' : FORMES_HUNN.includes(saisi) ? 'hunn' : null;
  if (familleA && familleS && familleA === familleS) {
    return 'Bon verbe (« ' + familleA + ' »), mais « ' + cible.tape + ' » ne va pas avec ce sujet : vérifie la conjugaison.';
  }
  if (familleA && familleS) return 'Vérifie l\'auxiliaire : « sinn » ou « hunn » ? Relis la règle de l\'unité.';
  return '';
}

// ─── 2. POINT D'ATTENTION MASQUÉ ────────────────────────────────────────────
// Les mots qui donneraient la réponse : la réponse entière, le mot avec son
// article, et chaque mot de 4 lettres ou plus de la réponse.
function motsReponse(item) {
  const liste = [item.lu];
  if (item.article) liste.push(item.article + ' ' + item.lu);
  (item.lu || '').split(/\s+/).forEach(m => {
    const mot = m.replace(/[.!?,;:]/g, '');
    if (mot.length >= 4) liste.push(mot);
  });
  // Les plus longs d'abord, pour masquer « eng Mapp » avant « Mapp ».
  return liste.filter(Boolean).sort((a, b) => b.length - a.length);
}

// Remplace dans le texte (HTML simple) les mots de la réponse par « … ».
// Renvoie '' s'il ne reste presque rien d'utile (moins de 3 mots).
function masquerReponse(texte, item) {
  if (!texte) return '';
  let resultat = texte;
  motsReponse(item).forEach(mot => {
    // Mot entier seulement (pas au milieu d'un autre mot), sans tenir compte des majuscules.
    const motif = new RegExp('(^|[^\\p{L}])' + echapperRegex(mot) + '(?![\\p{L}])', 'giu');
    resultat = resultat.replace(motif, '$1…');
  });
  // L'article juste avant un mot masqué le trahirait aussi : « <b>eng</b> … » → « … ».
  const articles = '(e|en|eng|den|dat|déi|d\')';
  resultat = resultat.replace(new RegExp('(<b>)?' + articles + '(<\\/b>)?\\s+…', 'gi'), '…');

  const motsUtiles = resultat.replace(/<[^>]+>/g, ' ').replace(/…/g, ' ').split(/\s+/).filter(m => /\p{L}/u.test(m));
  return motsUtiles.length >= 3 ? resultat : '';
}

function echapperRegex(texte) {
  return texte.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ─── 3. CE QU'ON AFFICHE APRÈS UNE ERREUR ───────────────────────────────────
// essai = numéro de l'essai raté (1 = premier).
// Renvoie { diagnostic, attention } : à chaque écran de les afficher à sa façon.
function aideErreur(val, item, attention, essai) {
  if (essai <= 1) {
    // Une lettre de travers dans un mot qui n'existe pas : on dit où, et la
    // règle de grammaire (hors sujet) n'est pas affichée (spec 41).
    const lettre = diagnosticLettre(val, item.lu);
    if (lettre) return { diagnostic: lettre, attention: '' };
    // Un seul mot faux : la note n'est montrée que si elle parle de ce mot (spec 42).
    const cible = motEnErreur(val, item.lu);
    if (cible) {
      const noteUtile = noteParleDe(attention, cible);
      const message = confusionConnue(cible) ||
        (noteUtile ? diagnostic(val, item.lu) : 'Un mot ne va pas : « ' + cible.tape + ' ». Vérifie-le.');
      return { diagnostic: message, attention: noteUtile ? masquerReponse(attention, item) : '' };
    }
    return { diagnostic: diagnostic(val, item.lu), attention: masquerReponse(attention, item) };
  }
  return { diagnostic: '', attention: attention || '' };
}

// Version HTML commune aux écrans du parcours et de la mission.
function aideErreurHtml(val, item, attention, essai) {
  const aide = aideErreur(val, item, attention, essai);
  return (aide.diagnostic ? '<div class="pc-diagnostic">' + escHtml(aide.diagnostic) + '</div>' : '') +
    attentionHtml(aide.attention);
}
