/* SPEC 109 — Lux Match : moteur pur (aucun DOM, aucun rendu).
   Le même code tourne dans le navigateur (window.LuxMatchCore) et dans les tests Node.

   Une partie suit les phases :
     swipe → match → (reseaux) → look → date → resultats
   Le moteur ne fait que des calculs : l'interface lit l'état et appelle les fonctions
   (swiper, choisirLook, repondre, ouvrirTelephone, avancerTemps…).

   Règles principales (SPEC 109 §3 et §6) :
   - jauges Affinité (départ 40) et Suspicion (départ 0), toujours bornées entre 0 et 100 ;
   - un mensonge rapporte de l'affinité tout de suite, mais il est mémorisé (« claims »)
     et peut déclencher un piège ou une contradiction plus tard ;
   - une faute de luxembourgeois baisse le score de langue, jamais la suspicion ;
   - le téléphone se décharge de 5 % par seconde ouverte pendant le rendez-vous. */
'use strict';

const LuxMatchCore = (function () {
  const BATTERIE_PAR_SECONDE = 5;
  const BATTERIE_ACCESSIBLE = 2.5;
  const MAX_PIEGES = 2;          // relances conditionnelles par rendez-vous
  const CONTRADICTION = { affinity: -10, suspicion: 20 };
  const LOOK_BONUS_STYLE = 2;    // look : au plus ±4 au total (SPEC §2)
  const LOOK_BONUS_COULEUR = 2;
  const LOOK_MALUS_STYLE = -2;

  // Nombres pseudo-aléatoires reproductibles (même graine = même partie).
  function creerHasard(graine) {
    let a = graine >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function melanger(liste, hasard) {
    const copie = liste.slice();
    for (let i = copie.length - 1; i > 0; i--) {
      const j = Math.floor(hasard() * (i + 1));
      [copie[i], copie[j]] = [copie[j], copie[i]];
    }
    return copie;
  }
  function borne(valeur) { return Math.max(0, Math.min(100, Math.round(valeur))); }

  // ─── Création d'une partie ────────────────────────────────────────────────

  // donnees = { archetypes: <archetypes-v01.json>, dialogues: <dialogues-a11-v01.json> }
  // options = { graine, parties (nombre de parties déjà jouées), accessible }
  function nouvellePartie(donnees, options) {
    const opt = options || {};
    const graine = opt.graine == null ? Math.floor(Math.random() * 1e9) : opt.graine;
    const hasard = creerHasard(graine);
    const profils = donnees.archetypes.profiles;
    return {
      donnees, graine, hasard,
      parties: opt.parties || 0,
      accessible: !!opt.accessible,
      persona: donnees.dialogues.pilotPlayerPersona,
      phase: 'swipe',
      // Swipe : 4 à 6 cartes, match au 1er ou 2e « j'aime » (jamais de hasard frustrant).
      paquet: melanger(profils.map(p => p.id), hasard).slice(0, 4 + Math.floor(hasard() * 3)),
      indexCarte: 0,
      aimes: [],
      likesAvantMatch: 1 + Math.floor(hasard() * 2),
      profil: null,
      archetype: null,
      enquete: false,             // le joueur a-t-il ouvert les réseaux avant le date ?
      appsVues: [],
      look: null,
      lookEffet: 0,
      affinity: donnees.dialogues.openingState.affinity,
      suspicion: donnees.dialogues.openingState.suspicion,
      battery: donnees.dialogues.openingState.phoneBattery,
      telephoneOuvert: false,
      ouverturesDate: 0,
      scoreLangue: 0,
      totalLangue: 0,
      claims: {},
      mensonges: {},              // attributs pour lesquels le joueur a menti
      flags: [],
      piegesDeclenches: [],
      piegeTelephoneEnAttente: false,
      file: [],                   // échanges restants
      courant: null,              // échange affiché
      tour: 0,
      historique: [],             // réponses données (résumé de fin)
      fin: null
    };
  }

  function profilParId(etat, id) {
    return etat.donnees.archetypes.profiles.find(p => p.id === id) || null;
  }
  function carteCourante(etat) {
    return etat.phase === 'swipe' ? profilParId(etat, etat.paquet[etat.indexCarte]) : null;
  }

  // ─── Swipe et match ───────────────────────────────────────────────────────

  // aime = true (j'aime) ou false (je passe). Renvoie 'match', 'suivante' ou 'recommence'.
  function swiper(etat, aime) {
    if (etat.phase !== 'swipe') return null;
    const id = etat.paquet[etat.indexCarte];
    if (aime) {
      etat.aimes.push(id);
      if (etat.aimes.length >= etat.likesAvantMatch) return matcher(etat, id);
    }
    etat.indexCarte++;
    if (etat.indexCarte < etat.paquet.length) return 'suivante';
    // Fin du paquet : le dernier profil aimé devient le match ; sinon on recommence.
    if (etat.aimes.length) return matcher(etat, etat.aimes[etat.aimes.length - 1]);
    etat.paquet = melanger(etat.paquet, etat.hasard);
    etat.indexCarte = 0;
    return 'recommence';
  }
  function matcher(etat, id) {
    etat.profil = profilParId(etat, id);
    etat.archetype = etat.donnees.archetypes.archetypes.find(a => a.id === etat.profil.archetypeId);
    etat.phase = 'match';
    return 'match';
  }

  // Après le match : 'date' (direct, passe par le look) ou 'enqueter' (réseaux).
  function apresMatch(etat, choix) {
    if (etat.phase !== 'match' && etat.phase !== 'reseaux') return;
    if (choix === 'enqueter') { etat.phase = 'reseaux'; etat.enquete = true; }
    else etat.phase = 'look';
  }
  function noterApp(etat, app) {
    if (etat.appsVues.indexOf(app) < 0) etat.appsVues.push(app);
  }

  // ─── Look ─────────────────────────────────────────────────────────────────

  // Bonus selon la préférence PUBLIÉE du profil (outfitSignal explicite), jamais déduite.
  function effetLook(profil, style, couleur) {
    const signal = profil && profil.outfitSignal;
    if (!signal || !signal.explicit || !style) return 0;
    let effet = style === signal.style ? LOOK_BONUS_STYLE : LOOK_MALUS_STYLE;
    if (couleur && couleur === signal.color) effet += LOOK_BONUS_COULEUR;
    return effet;
  }
  // style et couleur peuvent être null (« passer » le look).
  function choisirLook(etat, style, couleur) {
    if (etat.phase !== 'look') return 0;
    etat.look = style ? { style, couleur: couleur || null } : null;
    etat.lookEffet = effetLook(etat.profil, style, couleur);
    return etat.lookEffet;
  }

  // ─── Rendez-vous ──────────────────────────────────────────────────────────

  function noeudParId(etat, id) {
    return etat.donnees.dialogues.sharedDialogueNodes.find(n => n.id === id) || null;
  }

  // Prépare un échange affichable : 2 réponses lors des 2 premières parties, 3 ensuite,
  // toujours dans un ordre mélangé (la bonne réponse n'est pas toujours en premier).
  function preparerEchange(etat, type, source) {
    let choix = source.choices.slice();
    if (type === 'noeud' && choix.length > 2 && etat.parties < 2) {
      const sincere = choix.find(c => c.learningCorrect && !c.lie) || choix[0];
      const autres = choix.filter(c => c !== sincere);
      choix = [sincere, autres[Math.floor(etat.hasard() * autres.length)]];
    }
    return {
      type, id: source.id,
      prompt: type === 'piege' ? { lu: source.npc.luDraft || '', fr: source.npc.fr } : source.prompt,
      choix: melanger(choix, etat.hasard),
      source
    };
  }

  function commencerDate(etat) {
    if (etat.phase !== 'look') return;
    const flux = etat.donnees.dialogues.archetypeFlows.find(f => f.id === etat.archetype.id);
    const ids = (flux ? flux.flow : ['salutation', 'prenom', 'au_revoir']).filter(id => noeudParId(etat, id));
    etat.file = ids.map(id => ({ type: 'noeud', id }));
    etat.affinity = borne(etat.affinity + etat.lookEffet);
    etat.phase = 'date';
    etat.telephoneOuvert = false;
    suivant(etat);
  }

  // Passe à l'échange suivant (ou termine).
  function suivant(etat) {
    // Le piège du téléphone (personnalité « anti-téléphone ») passe en priorité.
    if (etat.piegeTelephoneEnAttente) {
      etat.piegeTelephoneEnAttente = false;
      const piege = etat.donnees.dialogues.conditionalTrapEvents.find(t => t.id === 'trap_telephone');
      if (piege) { etat.piegesDeclenches.push(piege.id); etat.courant = preparerEchange(etat, 'piege', piege); return; }
    }
    // Rappel de mémoire juste avant l'au revoir.
    if (etat.file.length && etat.file[0].id === 'au_revoir' && !etat.rappelFait) {
      etat.rappelFait = true;
      const rappel = choisirRappel(etat);
      if (rappel) { etat.courant = { type: 'rappel', id: rappel.id, prompt: rappel.prompt, choix: melanger(rappel.choices, etat.hasard), source: rappel }; return; }
    }
    const prochain = etat.file.shift();
    if (!prochain) { terminer(etat); return; }
    if (prochain.type === 'piege') { etat.courant = preparerEchange(etat, 'piege', prochain.source); return; }
    etat.courant = preparerEchange(etat, 'noeud', noeudParId(etat, prochain.id));
  }

  // Un seul rappel, sur un attribut affirmé ; les mensonges en priorité.
  function choisirRappel(etat) {
    const rappels = etat.donnees.dialogues.recallNodes || [];
    const possibles = rappels.filter(r => etat.claims[r.attribute] !== undefined);
    if (!possibles.length) return null;
    const menteurs = possibles.filter(r => etat.mensonges[r.attribute]);
    const liste = menteurs.length ? menteurs : possibles;
    return liste[Math.floor(etat.hasard() * liste.length)];
  }

  // Valeur vraie d'un attribut pour le personnage du joueur (Alex).
  function valeurPersona(persona, cle) {
    if (cle === 'prenom') return persona.name;
    if (cle === 'language') return persona.languages[0];
    return persona[cle];
  }
  // Attributs concernés par un piège (pour la réparation par l'aveu).
  const CLE_PAR_FLAG = { said_football: 'football', said_portugal: 'origin', said_portuguese: 'language' };
  function clesDuPiege(piege) {
    const c = piege.condition || {};
    const cles = [];
    (c.anyClaim || []).forEach(paire => Object.keys(paire).forEach(k => cles.push(k)));
    Object.keys(c.claims || {}).forEach(k => cles.push(k));
    (c.flagsAll || []).forEach(f => { if (CLE_PAR_FLAG[f]) cles.push(CLE_PAR_FLAG[f]); });
    return cles;
  }

  // Vérifie si un piège de l'archétype devient possible après une réponse.
  function piegeEligible(etat) {
    if (etat.piegesDeclenches.length >= MAX_PIEGES) return null;
    const pieges = etat.donnees.dialogues.conditionalTrapEvents;
    return pieges.find(t => {
      if (t.archetypeId !== etat.archetype.id || t.id === 'trap_telephone') return false;
      if (etat.piegesDeclenches.indexOf(t.id) >= 0) return false;
      const c = t.condition || {};
      if (c.anyClaim && !c.anyClaim.some(paire => Object.keys(paire).every(k => etat.claims[k] === paire[k] && (!c.requiresLie || etat.mensonges[k])))) return false;
      if (c.claims && !Object.keys(c.claims).every(k => etat.claims[k] === c.claims[k] && (!c.requiresLie || etat.mensonges[k]))) return false;
      if (c.flagsAll && !c.flagsAll.every(f => etat.flags.indexOf(f) >= 0)) return false;
      return !!(c.anyClaim || c.claims || c.flagsAll);
    }) || null;
  }

  // Le joueur répond à l'échange courant. Renvoie un résumé pour l'interface.
  function repondre(etat, choixId) {
    if (etat.phase !== 'date' || !etat.courant) return null;
    const echange = etat.courant;
    const choix = echange.choix.find(c => c.id === choixId);
    if (!choix) return null;
    const resultat = { echange, choix, affinity: 0, suspicion: 0, correction: null, contradiction: false, reaction: null, visuel: null, langue: null };
    const ajouter = (aff, sus) => { resultat.affinity += aff || 0; resultat.suspicion += sus || 0; };

    if (echange.type === 'noeud') {
      const effets = choix.effects || {};
      ajouter(effets.affinity, effets.suspicion);
      // Score de langue (sauf nœuds bonus hors programme).
      if (choix.pedagogicalScoring !== false && echange.source.pedagogicalScoring !== false) {
        etat.totalLangue++;
        if (choix.learningCorrect) { etat.scoreLangue++; resultat.langue = true; } else resultat.langue = false;
      }
      if (!choix.learningCorrect) resultat.correction = { lu: choix.correctionLu || null, fr: choix.correctionFr || '' };
      // Affirmations : un attribut déjà affirmé autrement = contradiction.
      Object.keys(choix.claims || {}).forEach(cle => {
        const valeur = choix.claims[cle];
        if (etat.claims[cle] !== undefined && etat.claims[cle] !== valeur) {
          resultat.contradiction = true;
          ajouter(CONTRADICTION.affinity, CONTRADICTION.suspicion);
        }
        etat.claims[cle] = valeur;
        if (choix.lie) etat.mensonges[cle] = true;
      });
      (choix.flags || []).forEach(f => { if (etat.flags.indexOf(f) < 0) etat.flags.push(f); });
    } else if (echange.type === 'piege') {
      const effets = choix.effects || {};
      ajouter(effets.affinity, effets.suspicion);
      resultat.reaction = choix.reactionFr || null;
      resultat.visuel = choix.visual || null;
      // Avouer : les mensonges liés à CE piège sont réparés, sans pénalité de contradiction.
      if (choix.id === 'aveu' || choix.id === 'avouer') {
        etat.flags.push('aveu_' + echange.id);
        clesDuPiege(echange.source).forEach(cle => {
          if (!etat.mensonges[cle]) return;
          etat.claims[cle] = valeurPersona(etat.persona, cle);
          delete etat.mensonges[cle];
        });
      }
    } else if (echange.type === 'rappel') {
      const attendu = etat.claims[echange.source.attribute];
      if (choix.value === attendu) ajouter(4, 0);
      else {
        resultat.contradiction = true;
        ajouter(CONTRADICTION.affinity, CONTRADICTION.suspicion);
        etat.claims[echange.source.attribute] = choix.value;
      }
    }
    if (resultat.contradiction) resultat.reaction = etat.donnees.dialogues.contradictionReaction || null;

    etat.affinity = borne(etat.affinity + resultat.affinity);
    etat.suspicion = borne(etat.suspicion + resultat.suspicion);
    etat.tour++;
    etat.historique.push({ type: echange.type, id: echange.id, prompt: echange.prompt, choix: { id: choix.id, lu: choix.lu || choix.luDraft || null, fr: choix.fr || choix.text || '' },
      correction: resultat.correction, langue: resultat.langue, contradiction: resultat.contradiction });

    // Piège déclenché par cette réponse : inséré juste après.
    if (echange.type === 'noeud') {
      const piege = piegeEligible(etat);
      if (piege) { etat.piegesDeclenches.push(piege.id); etat.file.unshift({ type: 'piege', id: piege.id, source: piege }); }
    }
    // Suspicion trop forte : le rendez-vous s'arrête tout de suite.
    if (etat.suspicion >= 80) { terminer(etat); resultat.finAnticipee = true; return resultat; }
    etat.courant = null;
    return resultat;
  }

  // L'interface appelle continuer() après avoir montré la réaction.
  function continuer(etat) {
    if (etat.phase === 'date' && !etat.courant) suivant(etat);
  }

  // ─── Téléphone et batterie ────────────────────────────────────────────────

  // Renvoie un événement : null, 'piege_telephone' ou 'malus_telephone'.
  function ouvrirTelephone(etat) {
    if (etat.telephoneOuvert) return null;
    if (etat.phase === 'date' && etat.battery <= 0) return 'batterie_vide';
    etat.telephoneOuvert = true;
    if (etat.phase !== 'date') return null;
    etat.ouverturesDate++;
    const antiTelephone = etat.profil && etat.profil.phoneSignal && etat.profil.phoneSignal.trait === 'anti_phone';
    if (!antiTelephone) return null;
    if (etat.ouverturesDate === 1) {
      // Piège annoncé dans le profil : joué après la réponse en cours (jamais au milieu).
      if (etat.piegesDeclenches.length < MAX_PIEGES) etat.piegeTelephoneEnAttente = true;
      return 'piege_telephone';
    }
    etat.affinity = borne(etat.affinity - 5);
    return 'malus_telephone';
  }
  function fermerTelephone(etat) { etat.telephoneOuvert = false; }

  // dt en secondes de temps ACTIF (l'interface ne compte pas les pauses ni l'appli masquée).
  // Plafonné à 0,25 s par appel : une reprise après la veille ne vide pas tout d'un coup.
  function avancerTemps(etat, dt) {
    if (etat.phase !== 'date' || !etat.telephoneOuvert || !(dt > 0)) return null;
    const pas = Math.min(dt, 0.25);
    const vitesse = etat.accessible ? BATTERIE_ACCESSIBLE : BATTERIE_PAR_SECONDE;
    etat.battery = Math.max(0, etat.battery - vitesse * pas);
    if (etat.battery <= 0) { etat.telephoneOuvert = false; return 'batterie_vide'; }
    return null;
  }

  // ─── Fin ──────────────────────────────────────────────────────────────────

  function terminer(etat) {
    etat.courant = null;
    etat.file = [];
    etat.phase = 'resultats';
    etat.telephoneOuvert = false;
    let issue;
    if (etat.suspicion >= 80) issue = 'malaise';
    else if (etat.affinity >= 65 && etat.suspicion < 55) issue = 'nouveau_rdv';
    else if (etat.piegesDeclenches.length) issue = 'gene_drole';
    else issue = 'pas_colle';
    const langue = etat.totalLangue ? etat.scoreLangue / etat.totalLangue : 0;
    // Score : surtout la langue et la cohérence ; l'affinité compte moins.
    const score = Math.round(langue * 600 + etat.affinity * 3 + (100 - etat.suspicion) * 2);
    etat.fin = { issue, score, langue: Math.round(langue * 100) };
  }

  // Expressions à retenir : chaque question posée et sa bonne réponse (sincère).
  function expressionsTravaillees(etat) {
    const liste = [];
    etat.historique.forEach(h => {
      if (h.type !== 'noeud') return;
      const noeud = noeudParId(etat, h.id);
      if (!noeud || noeud.pedagogicalScoring === false) return;
      const bonne = noeud.choices.find(c => c.learningCorrect && !c.lie);
      if (bonne && bonne.lu) liste.push({ question: noeud.prompt, reponse: { lu: bonne.lu, fr: bonne.fr }, faute: h.langue === false });
    });
    return liste;
  }

  return {
    nouvellePartie, carteCourante, swiper, apresMatch, noterApp,
    effetLook, choisirLook, commencerDate, repondre, continuer,
    ouvrirTelephone, fermerTelephone, avancerTemps, expressionsTravaillees,
    profilParId, creerHasard
  };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = LuxMatchCore;
