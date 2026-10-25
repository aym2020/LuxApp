// ─── ÉCRAN D'EXERCICE COMMUN (SPEC 94 + SPEC 95) ────────────────────────────
// Les deux écrans d'exercice ont trois zones stables (index.html) :
//   1. l'en-tête (retour, progression) ;
//   2. .exo-scroll : le contenu, SEULE zone qui défile (question, réponses, correction) ;
//   3. .exo-action-dock : le pied d'action, SEUL emplacement des boutons.
//
//   Leçon       : #pc-scroll       (#pc-body + #pc-feedback)      + #pc-action-dock
//   S'entraîner : #session-scroll  (.session-body, #session-feedback) + #session-action-dock
//
// Ce module ne note rien, n'enregistre rien et ne joue aucun son dans un rendu.
// Chaque moteur décide du résultat, puis appelle :
//   1. jouerFeedbackSon(evenement)        → une seule fois, au moment de la réponse ;
//   2. renderFeedbackCommun(host, o)      → la correction, dans le contenu ;
//   3. renderActionExercice(dock, config) → le bouton du pied (toujours au même endroit).
//
// Les quatre états de correction :
//   'success'      : réussite (aucun titre si la réponse verte suffit)
//   'retry'        : erreur provisoire, on peut réessayer (Écriture 1er essai)
//   'finalFailure' : erreur définitive, la correction est montrée
//   'reveal'       : réponse dévoilée à la demande (Mot caché)

// Correction légère, dans le contenu. AUCUN bouton ici (SPEC 95).
// o = {
//   etat      : 'success' | 'retry' | 'finalFailure' | 'reveal',
//   titre     : texte du titre visible, ou '' pour aucun titre,
//   annonce   : phrase lue par le lecteur d'écran (toujours fournie),
//   corpsHtml : explication, audio, score, rappel… déjà échappés par l'appelant
// }
function renderFeedbackCommun(host, o) {
  const succes = o.etat === 'success';
  const titre = o.titre || '';
  const corps = o.corpsHtml || '';

  // Les classes ok / ko / essai restent : d'autres écrans et tests s'en servent.
  host.classList.remove('hidden', 'ok', 'ko', 'essai', 'nu', 'reveal', 'avec-titre');
  host.classList.add('exo-feedback', succes ? 'ok' : 'ko');
  if (o.etat === 'retry') host.classList.add('essai');
  if (o.etat === 'reveal') host.classList.add('reveal');
  if (titre) host.classList.add('avec-titre');
  // Rien à montrer : la zone ne prend aucune place (l'annonce reste lue).
  if (!titre && !corps) host.classList.add('nu');

  host.innerHTML =
    '<span class="sr-only">' + escHtml(o.annonce || titre) + '</span>' +
    (titre || corps
      ? '<div class="fb-bloc">' +
          (titre ? '<div class="fb-titre" aria-hidden="true">' + escHtml(titre) + '</div>' : '') +
          (corps ? '<div class="fb-txt">' + corps + '</div>' : '') +
        '</div>'
      : '');
}

// Pied d'action : UN bouton primaire, toujours le même nœud, au même endroit.
// Seuls son libellé, son id et son action changent (Valider → Réessayer → Continuer).
// config = {
//   id, label, onClick,      // le bouton primaire (or)
//   disabled,                // facultatif
//   secondaires : [{ id, label, html, ariaLabel, classe, onClick }]  // Mot caché seulement
// }
// config = null : place réservée (même hauteur), sans bouton (Quiz/Trous avant le choix).
// Renvoie le bouton primaire (ou null).
function renderActionExercice(dock, config) {
  if (!dock) return null;
  let principal = dock.querySelector('.exo-cta');
  if (!principal) {
    principal = document.createElement('button');
    principal.type = 'button';
    principal.className = 'exo-cta';
    dock.appendChild(principal);
  }
  // Nouvelle action : le focus ne reste pas sur l'ancienne (comme lorsqu'un nouveau
  // bouton était créé). L'appelant redonne le focus si besoin (focusApresClavier).
  if (document.activeElement === principal) principal.blur();
  // Les boutons secondaires sont recréés à chaque appel : jamais deux fois le même id.
  dock.querySelectorAll('.exo-secondaire').forEach(b => b.remove());

  if (!config) {
    principal.hidden = true;
    principal.removeAttribute('id');
    principal.onclick = null;
    return null;
  }

  (config.secondaires || []).forEach(s => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'exo-secondaire' + (s.classe ? ' ' + s.classe : '');
    if (s.id) b.id = s.id;
    if (s.ariaLabel) b.setAttribute('aria-label', s.ariaLabel);
    if (s.html) b.innerHTML = s.html; else b.textContent = s.label;
    b.onclick = s.onClick;
    dock.insertBefore(b, principal);
  });

  principal.hidden = false;
  if (config.id) principal.id = config.id; else principal.removeAttribute('id');
  principal.textContent = config.label;
  principal.disabled = !!config.disabled;
  principal.classList.remove('focus-auto');
  // Double appui rapide : le 2e appui ne doit pas déclencher la NOUVELLE action
  // (ex. Valider puis, sans le vouloir, Continuer avant d'avoir lu la correction).
  // event.detail compte les clics rapides du navigateur : pas de minuterie maison.
  const version = (principal.versionAction || 0) + 1;
  principal.versionAction = version;
  principal.onclick = evenement => {
    const deuxiemeAppui = evenement && evenement.detail > 1;
    if (deuxiemeAppui && principal.versionCliquee !== version) return;
    principal.versionCliquee = version;
    config.onClick(evenement);
  };
  return principal;
}

// Rend la correction visible dans la zone qui défile, sans saut inutile :
// on garde la question en haut si tout tient, sinon on montre le début de la correction.
function cadrerFeedback(zone, element, question) {
  if (!zone || !element || element.offsetParent === null) return;
  const z = zone.getBoundingClientRect();
  const e = element.getBoundingClientRect();
  const marge = 12;
  if (e.bottom <= z.bottom - marge) return; // déjà entièrement visible
  let decalage = e.bottom - z.bottom + marge;
  // La question ne doit pas sortir par le haut si on peut l'éviter…
  const haut = question ? question.getBoundingClientRect().top : e.top;
  if (haut - decalage < z.top) decalage = Math.max(0, e.top - z.top - marge); // …sinon le début de la correction
  if (decalage > 1) zone.scrollTop += decalage;
}

// « À retenir » : même rendu en Leçon et en S'entraîner (note discrète, SPEC 95).
// texteHtml est déjà prêt à afficher (note des leçons, échappée par noteHtml).
function fbAttentionHtml(texteHtml) {
  return texteHtml
    ? '<div class="fb-attention"><div class="fb-attention-label">À retenir</div><p>' + texteHtml + '</p></div>'
    : '';
}

// Son de la correction. Il suit le réglage Son de l'app (le même que Survie).
// Facultatif : si le son est impossible, l'exercice continue normalement.
function jouerFeedbackSon(evenement) {
  if (typeof SurvieFx === 'undefined' || typeof SurvieFx.feedback !== 'function') return;
  try { SurvieFx.feedback(evenement); } catch (_) { /* le son est un bonus */ }
}
