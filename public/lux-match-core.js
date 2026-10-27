/* SPEC 109 — Lux Match : moteur pur (aucun DOM, aucun rendu).
   Le même code tourne dans le navigateur (window.LuxMatchCore) et dans les tests Node.

   Une partie suit les phases :
     profil (vraie identité d'Alex) → swipe → match → (reseaux) → look → date → resultats
   Tous les textes viennent de data/jeux/lux-match/contenus-v02.json (bible A1.1) :
   le moteur choisit des scènes ENTIÈRES et leur ordre, il n'écrit jamais de luxembourgeois.

   Règles principales (SPEC 109 §6, §12, bible §6–§8) :
   - deux jauges sociales Affinité (départ 40) et Suspicion (départ 0), bornées 0–100 ;
   - la langue est notée à part : une réponse correcte (vraie, bluff ou blague) vaut 1 point ;
   - un mensonge est mémorisé (« claims ») : il peut déclencher un événement ou une
     contradiction plus tard ; un aveu le répare ;
   - au plus 2 événements par rendez-vous, dont 1 « gros » gag ;
   - le téléphone se décharge de 5 % par seconde ouverte pendant le rendez-vous ;
   - la conclusion ne cite que des faits réellement survenus (sinon texte générique). */
'use strict';

const LuxMatchCore = (function () {
  const DEPART = { affinity: 40, suspicion: 0, battery: 100 };
  const BATTERIE_PAR_SECONDE = 5;
  const BATTERIE_ACCESSIBLE = 2.5;
  const MAX_EVENEMENTS = 2;      // B25 (s'expliquer après une contradiction) n'est pas compté
  const CONTRADICTION = { affinity: -10, suspicion: 20 };
  const LOOK_BONUS_STYLE = 2;    // look : au plus ±4 au total (SPEC §2)
  const LOOK_BONUS_COULEUR = 2;
  const LOOK_MALUS_STYLE = -2;
  const FIN_ANTICIPEE = 80;      // suspicion : elle part tout de suite
  const SEUIL_FAIL = 60;
  const SEUIL_SUCCES = { affinity: 65, suspicion: 40 };
  const REPARATION = 'B25_TRUTH_REPAIR';

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
  function choisirUn(liste, hasard) { return liste[Math.floor(hasard() * liste.length)]; }
  function borne(valeur) { return Math.max(0, Math.min(100, Math.round(valeur))); }

  // ─── Création d'une partie ────────────────────────────────────────────────

  // donnees = { contenus: <contenus-v02.json> }
  // options = { graine, parties (nombre de parties déjà jouées), accessible }
  function nouvellePartie(donnees, options) {
    const opt = options || {};
    const graine = opt.graine == null ? Math.floor(Math.random() * 1e9) : opt.graine;
    const hasard = creerHasard(graine);
    const profils = donnees.contenus.profils;
    return {
      donnees, graine, hasard,
      parties: opt.parties || 0,
      accessible: !!opt.accessible,
      persona: donnees.contenus.persona,
      phase: 'profil',
      // Swipe : 4 à 6 cartes, match au 1er ou 2e « j'aime » (jamais de hasard frustrant).
      paquet: melanger(profils.map(p => p.id), hasard).slice(0, 4 + Math.floor(hasard() * 3)),
      indexCarte: 0,
      aimes: [],
      likesAvantMatch: 1 + Math.floor(hasard() * 2),
      profil: null,
      plan: null,                 // scénario du rendez-vous (scènes, traits), composé au match
      postsScenario: [],          // posts Amis ajoutés par le scénario
      enquete: false,
      appsVues: [],
      look: null,
      lookEffet: 0,
      impression: null,           // première impression au café (réaction FR de la bible)
      affinity: DEPART.affinity,
      suspicion: DEPART.suspicion,
      battery: DEPART.battery,
      telephoneOuvert: false,
      ouverturesDate: 0,
      batterieVide: false,
      scoreLangue: 0,
      totalLangue: 0,
      claims: {},                 // ce que le joueur a affirmé (valeur actuelle)
      mensonges: {},              // attributs dont l'affirmation actuelle est fausse
      dejaMenti: {},              // attributs sur lesquels il a menti au moins une fois
      blagues: {},                // plaisanteries (ex. 120 ans) : jamais des affirmations
      choixFaits: [],             // identifiants de tous les choix du rendez-vous
      evenements: [],             // événements joués ou programmés
      contradictions: 0,
      aveux: 0,
      etapes: {},                 // rappel, « à demain ? » et clôture déjà placés
      file: [],                   // scènes restantes
      enAttente: [],              // événements à jouer juste après la réponse en cours
      courant: null,              // échange affiché
      tour: 0,
      historique: [],             // réponses données (bilan de fin)
      fin: null
    };
  }

  function contenus(etat) { return etat.donnees.contenus; }
  function profilParId(etat, id) {
    return contenus(etat).profils.find(p => p.id === id) || null;
  }
  // Après l'écran « TON PROFIL » : les swipes commencent.
  function commencerSwipes(etat) {
    if (etat.phase === 'profil') etat.phase = 'swipe';
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
  // Le scénario est composé UNE FOIS, au match : réseaux, préférences et dialogue
  // partagent ensuite les mêmes informations.
  function matcher(etat, id) {
    etat.profil = profilParId(etat, id);
    etat.plan = composerScenario(contenus(etat), etat.profil, etat.graine);
    etat.postsScenario = etat.plan.posts;
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

  // ─── Scénario : un parcours pilote de la bible (§10) ─────────────────────

  // Renvoie { id, profil, scenes, rappel, cloture, variante, traits, posts }.
  // Les événements conditionnels ne sont pas placés : le moteur les déclenche.
  // planId (facultatif, tests) : impose un parcours.
  function composerScenario(c, profil, graine, planId) {
    const hasard = creerHasard((graine ^ 0x5bd1e995) >>> 0);
    const plans = c.plans.filter(p => p.profil === profil.id && p.valide !== false);
    const plan = plans.find(p => p.id === planId) || choisirUn(plans, hasard);
    const scenes = plan.sequence.filter(id => !c.evenements[id] && !c.rappels[id] && !c.clotures[id]);
    // L'âge (3 réponses correctes) est toujours demandé juste après le prénom.
    if (scenes.indexOf('B04_AGE') < 0) scenes.splice(scenes.indexOf('B03_NAME') + 1, 0, 'B04_AGE');
    return {
      id: plan.id, profil: profil.id, scenes,
      rappel: plan.sequence.some(id => c.rappels[id]),
      cloture: plan.sequence.find(id => c.clotures[id]) || 'B18_END',
      variante: plan.variante || null, traits: {},
      posts: plan.variante ? [Object.assign({ id: plan.variante }, c.variantes[plan.variante])] : []
    };
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
  // style et couleur peuvent être null (« garder cette tenue »).
  function choisirLook(etat, style, couleur) {
    if (etat.phase !== 'look') return 0;
    etat.look = style ? { style, couleur: couleur || null } : null;
    etat.lookEffet = effetLook(etat.profil, style, couleur);
    return etat.lookEffet;
  }

  // ─── Rendez-vous : préparation des échanges ──────────────────────────────

  function scene(etat, id) {
    const c = contenus(etat);
    return c.beats[id] || c.clotures[id] || null;
  }
  function estEvenement(etat, id) { return !!contenus(etat).evenements[id]; }
  function nbEvenements(etat) { return etat.evenements.filter(e => e !== REPARATION).length; }
  function tailleEvenement(etat, id) { const ev = contenus(etat).evenements[id] || contenus(etat).beats[id]; return ev && ev.taille; }

  // Lors des 2 premières parties, 2 réponses (la vraie + une autre) ;
  // l'âge garde toujours ses 3 réponses (SPEC §12.3). Ordre toujours mélangé.
  function preparerChoix(etat, source) {
    let choix = source.choices.slice();
    if (choix.length > 2 && etat.parties < 2 && !source.troisChoix && source.type !== 'demande') {
      const vraie = choix.find(c => c.truth === 'honest') || choix[0];
      const autres = choix.filter(c => c !== vraie);
      choix = [vraie, choisirUn(autres, etat.hasard)];
    }
    return melanger(choix, etat.hasard);
  }
  function echange(etat, id) {
    const c = contenus(etat);
    if (c.evenements[id]) return { type: 'evenement', id, prompt: c.evenements[id].npc, choix: c.evenements[id].choices.slice(), source: c.evenements[id] };
    if (c.rappels[id]) return { type: 'rappel', id, prompt: c.rappels[id].prompt, choix: melanger(c.rappels[id].choices, etat.hasard), source: c.rappels[id] };
    const source = scene(etat, id);
    // Scène-événement écrite pour une partenaire (EV_LENA_MORNING, EV_EMMA_COFFEE) : comptée dans le budget.
    if (/^EV_/.test(id) && etat.evenements.indexOf(id) < 0) etat.evenements.push(id);
    return { type: source.type === 'demande' ? 'demande' : 'question', id, prompt: source.prompt, choix: preparerChoix(etat, source), source };
  }

  function commencerDate(etat) {
    if (etat.phase !== 'look') return;
    etat.file = etat.plan.scenes.slice();
    etat.affinity = borne(etat.affinity + etat.lookEffet);
    etat.phase = 'date';
    etat.telephoneOuvert = false;
    // Première impression (réaction FR de la bible), seulement si un look a été choisi.
    if (etat.look) {
      const cle = etat.lookEffet > 0 ? 'LOOK_OK' : 'LOOK_DIFFERENT';
      etat.impression = { cle, fr: etat.profil.reactions[cle], positive: etat.lookEffet > 0 };
    }
    // Événement lié au look (Noémie et le rouge créatif) : juste après la salutation.
    Object.keys(contenus(etat).evenements).forEach(id => {
      const d = contenus(etat).evenements[id].declencheur || {};
      if (d.look && evenementEligible(etat, id)) { etat.file.splice(1, 0, id); etat.evenements.push(id); }
    });
    suivant(etat);
  }

  // Passe à l'échange suivant (ou termine).
  function suivant(etat) {
    // Événements déclenchés par la réponse précédente (ou par le téléphone).
    if (etat.enAttente.length) { etat.courant = echange(etat, etat.enAttente.shift()); return; }
    if (!etat.file.length) {
      // Acte 3 : rappel de mémoire, puis « Hues du muer Zäit? » si tout va bien, puis l'au revoir.
      if (!etat.etapes.rappel) {
        etat.etapes.rappel = true;
        const rappel = choisirRappel(etat);
        if (rappel) etat.file.push(rappel);
      } else if (!etat.etapes.demain) {
        etat.etapes.demain = true;
        if (etat.affinity >= SEUIL_SUCCES.affinity && etat.suspicion < SEUIL_SUCCES.suspicion) etat.file.push('B24_TOMORROW');
      } else if (!etat.etapes.cloture) {
        etat.etapes.cloture = true;
        etat.file.push(etat.plan.cloture);
      } else { terminer(etat); return; }
      if (!etat.file.length) { suivant(etat); return; }
    }
    etat.courant = echange(etat, etat.file.shift());
  }

  // Un seul rappel, sur un attribut réellement affirmé (mensonges en priorité),
  // jamais sur un attribut qui vient d'avoir son événement.
  function choisirRappel(etat) {
    if (!etat.plan.rappel) return null;
    const rappels = contenus(etat).rappels;
    const dejaTraites = {};
    etat.evenements.forEach(id => { if (estEvenement(etat, id)) Object.keys(clesDeclencheur(contenus(etat).evenements[id])).forEach(k => { dejaTraites[k] = true; }); });
    const possibles = Object.keys(rappels).filter(id => etat.claims[rappels[id].attribut] !== undefined && !dejaTraites[rappels[id].attribut]);
    if (!possibles.length) return null;
    const menteurs = possibles.filter(id => etat.mensonges[rappels[id].attribut]);
    return choisirUn(menteurs.length ? menteurs : possibles, etat.hasard);
  }

  // ─── Événements conditionnels ─────────────────────────────────────────────

  function clesDeclencheur(ev) {
    const d = ev.declencheur || {};
    return Object.assign({}, d.mensonge || {}, d.claim || {});
  }
  // Un événement est éligible si sa condition est remplie, dans la limite du budget.
  function evenementEligible(etat, id) {
    const ev = contenus(etat).evenements[id];
    if (!ev || etat.evenements.indexOf(id) >= 0) return false;
    if (ev.profil !== 'tous' && ev.profil !== etat.profil.id) return false;
    const d = ev.declencheur || {};
    if (d.contradiction) return id === REPARATION;  // placé par repondre() après une contradiction
    if (nbEvenements(etat) >= MAX_EVENEMENTS) return false;
    if (ev.taille === 'gros' && etat.evenements.some(e => tailleEvenement(etat, e) === 'gros')) return false;
    const traits = etat.plan.traits || {};
    if (d.trait === 'exAlex' && traits.dislikedFirstName !== etat.persona.name) return false;
    if (d.trait === 'agePrefPositive30' && !traits.agePrefPositive30) return false;
    if (d.telephone) return false;                  // placé par ouvrirTelephone()
    if (d.look) return !!etat.look && etat.look.style === d.look.style && etat.look.couleur === d.look.color;
    const vaut = (cle, valeur) => etat.claims[cle] === valeur;
    if (d.mensonge) {
      const cles = Object.keys(d.mensonge);
      const ok = cle => vaut(cle, d.mensonge[cle]) && etat.mensonges[cle];
      if (!(d.unSuffit ? cles.some(ok) : cles.every(ok))) return false;
    }
    if (d.claim && !Object.keys(d.claim).every(cle => vaut(cle, d.claim[cle]))) return false;
    return !!(d.mensonge || d.claim);
  }
  function verifierEvenements(etat) {
    Object.keys(contenus(etat).evenements).forEach(id => {
      if (id !== REPARATION && evenementEligible(etat, id)) { etat.enAttente.push(id); etat.evenements.push(id); }
    });
  }

  // ─── Réponses ─────────────────────────────────────────────────────────────

  function valeurPersona(persona, cle) {
    if (cle === 'prenom') return persona.name;
    if (cle === 'language') return persona.languages[0];
    if (cle === 'workplace') return 'Bank';
    return persona[cle];
  }
  // Enregistre une affirmation ; renvoie true si elle contredit la précédente.
  function affirmer(etat, cle, valeur) {
    const avant = etat.claims[cle];
    etat.claims[cle] = valeur;
    if (valeur !== valeurPersona(etat.persona, cle)) { etat.mensonges[cle] = true; etat.dejaMenti[cle] = true; } else delete etat.mensonges[cle];
    return avant !== undefined && avant !== valeur;
  }
  // Deux affirmations différentes qui ne vont pas ensemble (bible B09, B13).
  const METIER_LIEU = { Banker: 'Bank', Dokter: 'Spidol' };
  const ORIGINE_NATIONALITE = { 'Frankräich': 'Fransous', Portugal: 'Portugis' };
  function incoherent(etat, cle) {
    const c = etat.claims;
    if ((cle === 'job' || cle === 'workplace') && c.job && c.workplace && METIER_LIEU[c.job] && METIER_LIEU[c.job] !== c.workplace) return true;
    if ((cle === 'origin' || cle === 'nationality') && c.origin && c.nationality && ORIGINE_NATIONALITE[c.origin] &&
      c.nationality !== 'Lëtzebuerger' && ORIGINE_NATIONALITE[c.origin] !== c.nationality) return true;
    return false;
  }
  // Préférence d'âge publiée par le scénario : petit effet, jamais bloquant.
  function effetAge(etat, age) {
    const pref = (etat.plan.traits || {}).agePreference;
    if (!pref || pref === 'indifferent' || typeof age !== 'number') return 0;
    const sienne = etat.profil.age;
    if (pref === 'prefers_older') return age >= 30 ? 3 : 0;
    if (pref === 'prefers_younger') return age < 30 ? 2 : 0;
    if (pref === 'prefers_similar') return Math.abs(age - sienne) <= 2 ? 2 : 0;
    return 0;
  }
  // Humour de la partenaire : une blague plaît (humour absurde) ou tombe à plat.
  function aimeLAbsurde(etat) {
    const humour = (etat.plan.traits || {}).humour;
    return humour ? humour === 'absurde' : (etat.profil.humours || []).indexOf('absurde') >= 0;
  }
  function reaction(etat, cle) { return etat.profil.reactions[cle] ? { cle, fr: etat.profil.reactions[cle] } : null; }

  // Le joueur répond à l'échange courant. Renvoie un résumé pour l'interface.
  function repondre(etat, choixId) {
    if (etat.phase !== 'date' || !etat.courant) return null;
    const ech = etat.courant;
    const choix = ech.choix.find(c => c.id === choixId);
    if (!choix) return null;
    const r = { echange: ech, choix, affinity: 0, suspicion: 0, correction: null, contradiction: false, reaction: null, visuel: null, langue: null, reponseElle: null, aveu: false, bluff: false };
    const ajouter = (aff, sus) => { r.affinity += aff || 0; r.suspicion += sus || 0; };
    const social = choix.social || {};
    etat.choixFaits.push(choix.id);
    // Affirmations portées par le choix (un « remplace » est un nouveau bluff, pas une contradiction).
    const affirmerChoix = () => Object.keys(choix.claims || {}).forEach(cle => {
      if (affirmer(etat, cle, choix.claims[cle]) && !choix.remplace) r.contradiction = true;
      if (incoherent(etat, cle)) r.contradiction = true;
    });

    if (ech.type === 'question') {
      const source = ech.source;
      if (source.pedagogicalScoring !== false) {
        etat.totalLangue++;
        r.langue = choix.languageCorrect !== false;
        if (r.langue) etat.scoreLangue++;
      }
      if (choix.languageCorrect === false) r.correction = choix.correction || { fr: '' };
      affirmerChoix();
      (choix.flags || []).forEach(f => { etat.blagues[f] = true; });
      const fort = (etat.profil.beatsForts || []).indexOf(ech.id) >= 0;
      if (choix.truth === 'honest') {
        ajouter(social.affinity !== undefined ? social.affinity : 3);
        r.visuel = social.affinity > 3 ? 'sourire' : 'hoche';
        if (fort) r.reaction = reaction(etat, 'SINCERE');
        if (choix.reactionFr) r.reaction = { fr: choix.reactionFr };
      } else if (choix.truth === 'lie') {
        // Le bluff plaît… pour l'instant, mais il est mémorisé.
        ajouter(social.affinity !== undefined ? social.affinity : 2, 2);
        r.bluff = true;
        r.visuel = 'sourire';
        if (fort) { r.reaction = reaction(etat, 'BLUFF'); r.visuel = 'sourcil'; }
      } else if (choix.truth === 'joke') {
        const plait = aimeLAbsurde(etat);
        ajouter(plait ? 4 : -2);
        r.visuel = plait ? 'rire' : 'froid';
      } else {
        ajouter(social.affinity, social.suspicion);
        r.visuel = 'gene';
      }
      if (choix.claims && typeof choix.claims.age === 'number') ajouter(effetAge(etat, choix.claims.age));
    } else if (ech.type === 'demande') {
      // Alex pose une question : elle répond avec ses faits canoniques (jamais un choix du joueur).
      ajouter(social.affinity);
      r.reponseElle = etat.profil.repliques[choix.repond] || null;
      r.visuel = 'parle';
    } else if (ech.type === 'evenement') {
      ajouter(social.affinity, social.suspicion);
      r.reaction = { fr: choix.reactionFr };
      r.visuel = choix.visuel || null;
      affirmerChoix();
      if (choix.aveu) {
        // Avouer : les mensonges liés à CET événement sont réparés, sans pénalité.
        r.aveu = true; etat.aveux++;
        const cles = Object.keys(clesDeclencheur(ech.source));
        (cles.length ? cles : Object.keys(etat.mensonges)).forEach(cle => {
          if (!etat.mensonges[cle]) return;
          etat.claims[cle] = valeurPersona(etat.persona, cle);
          delete etat.mensonges[cle];
        });
        if (ech.id !== REPARATION && etat.profil.reactions.AVEU) r.reaction = { cle: 'AVEU', fr: choix.reactionFr + ' « ' + etat.profil.reactions.AVEU + ' »' };
      }
    } else if (ech.type === 'rappel') {
      const attribut = ech.source.attribut;
      if (choix.valeur === 'blague') {
        // « Dat war e Witz! » ou un nouveau « James Bond » : pas de contradiction.
        ajouter(etat.blagues.joke_age_120 && attribut === 'age' ? 3 : 0);
        r.visuel = aimeLAbsurde(etat) ? 'rire' : 'hoche';
      } else if (choix.valeur === etat.claims[attribut]) {
        ajouter(etat.mensonges[attribut] ? 2 : 4);
        r.visuel = 'hoche';
        r.reaction = { cle: 'RAPPEL', fr: 'Elle s’en souvient… et ta réponse colle.' };
      } else {
        affirmer(etat, attribut, choix.valeur);
        r.contradiction = true;
      }
    }
    if (r.contradiction) {
      etat.contradictions++;
      ajouter(CONTRADICTION.affinity, CONTRADICTION.suspicion);
      r.visuel = 'sourcil';
      r.reaction = { cle: 'CONTRADICTION', fr: 'Elle fronce les sourcils : ce n’est pas ce que tu as dit tout à l’heure…' };
      // Une seule chance de s'expliquer (« Ass dat wouer? »).
      if (evenementEligible(etat, REPARATION)) { etat.enAttente.unshift(REPARATION); etat.evenements.push(REPARATION); }
    }

    etat.affinity = borne(etat.affinity + r.affinity);
    etat.suspicion = borne(etat.suspicion + r.suspicion);
    etat.tour++;
    etat.historique.push({ type: ech.type, id: ech.id, prompt: ech.prompt, choix: { id: choix.id, lu: choix.lu || null, fr: choix.fr || '', truth: choix.truth || null },
      correction: r.correction, langue: r.langue, contradiction: r.contradiction, aveu: r.aveu });

    // Événement déclenché par cette réponse : joué juste après.
    if (ech.type !== 'demande') verifierEvenements(etat);
    // Suspicion trop forte : le rendez-vous s'arrête tout de suite.
    if (etat.suspicion >= FIN_ANTICIPEE) { terminer(etat); r.finAnticipee = true; return r; }
    etat.courant = null;
    return r;
  }

  // L'interface appelle continuer() après avoir montré la réaction.
  function continuer(etat) {
    if (etat.phase === 'date' && !etat.courant) suivant(etat);
  }

  // ─── Téléphone et batterie ────────────────────────────────────────────────

  // Renvoie : null, 'batterie_vide', 'piege_telephone' ou 'malus_telephone'.
  function ouvrirTelephone(etat) {
    if (etat.telephoneOuvert) return null;
    if (etat.phase === 'date' && etat.battery <= 0) return 'batterie_vide';
    etat.telephoneOuvert = true;
    if (etat.phase !== 'date') return null;
    etat.ouverturesDate++;
    if (etat.profil.phoneTolerance !== 'anti_phone') return null;
    if (etat.ouverturesDate === 1 && etat.evenements.indexOf('EV_EMMA_PHONE') < 0 && nbEvenements(etat) < MAX_EVENEMENTS) {
      // Annoncé dans son profil : joué après la réponse en cours (jamais au milieu).
      etat.enAttente.push('EV_EMMA_PHONE'); etat.evenements.push('EV_EMMA_PHONE');
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
    if (etat.battery <= 0) { etat.telephoneOuvert = false; etat.batterieVide = true; return 'batterie_vide'; }
    return null;
  }

  // ─── Fin ──────────────────────────────────────────────────────────────────

  // Garde d'une conclusion : le fait cité doit avoir eu lieu.
  function gardeOk(etat, garde) {
    if (!garde) return true;
    if (garde.choix && !garde.choix.some(id => etat.choixFaits.indexOf(id) >= 0)) return false;
    if (garde.aucunMensongeActif && Object.keys(etat.mensonges).length) return false;
    if (garde.mensonge && !etat.dejaMenti[garde.mensonge]) return false;
    if (garde.contradiction && !etat.contradictions) return false;
    if (garde.telephoneJamaisOuvert && etat.ouverturesDate) return false;
    if (garde.telephoneOuvert && !etat.ouverturesDate) return false;
    if (garde.batterieVide && !etat.batterieVide) return false;
    return true;
  }
  const ISSUES = { SUCCESS: 'nouveau_rdv', FUN: 'gene_drole', NEUTRAL: 'pas_colle', FAIL: 'malaise' };

  // Issue : FAIL (suspicion forte) > FUN (son gag a vraiment eu lieu) > SUCCESS > NEUTRAL.
  function terminer(etat) {
    etat.courant = null;
    etat.file = [];
    etat.enAttente = [];
    etat.phase = 'resultats';
    etat.telephoneOuvert = false;
    const fins = etat.profil.fins;
    let cle;
    if (etat.suspicion >= SEUIL_FAIL) cle = 'FAIL';
    else if (fins.FUN.garde && gardeOk(etat, fins.FUN.garde) && etat.affinity >= 40) cle = 'FUN';
    else if (etat.affinity >= SEUIL_SUCCES.affinity && etat.suspicion < SEUIL_SUCCES.suspicion) cle = 'SUCCESS';
    else cle = 'NEUTRAL';
    // Texte personnalisé seulement si son fait est réel ; sinon texte générique de l'issue.
    const fin = fins[cle];
    const texte = gardeOk(etat, fin.garde) ? { id: fin.id, fr: fin.fr } : null;
    const langue = etat.totalLangue ? etat.scoreLangue / etat.totalLangue : 0;
    // Score : surtout la langue et la cohérence ; l'affinité compte moins.
    const score = Math.round(langue * 600 + etat.affinity * 3 + (100 - etat.suspicion) * 2);
    etat.fin = { cle, issue: ISSUES[cle], texte, score, langue: Math.round(langue * 100), resume: resumer(etat) };
  }

  // « Ce qui s'est passé » : faits réels de la partie, en français (texte d'interface).
  const FAITS = {
    prenom: v => 'tu t’appelles ' + v, age: v => 'tu as ' + v + ' ans', origin: v => 'tu viens de ' + ({ 'Frankräich': 'France', Portugal: 'Portugal', 'Däitschland': 'Allemagne' }[v] || v),
    city: v => 'tu habites à ' + (v === 'Lëtzebuerg' ? 'Luxembourg' : v), language: v => 'tu parles ' + ({ 'Franséisch': 'français', Portugisesch: 'portugais', 'Däitsch': 'allemand' }[v] || v),
    job: v => 'tu es ' + ({ Banker: 'banquier', Dokter: 'médecin', Polizist: 'policier' }[v] || v), workplace: v => 'tu travailles ' + ({ Bank: 'dans une banque', Spidol: 'dans un hôpital' }[v] || v),
    football: v => v ? 'tu aimes le foot' : 'tu n’aimes pas le foot', drawing: v => v ? 'tu aimes dessiner' : 'tu n’aimes pas dessiner',
    gaming: v => v ? 'tu aimes les jeux vidéo' : 'tu n’aimes pas les jeux vidéo', running: v => v ? 'tu cours le matin' : 'tu ne cours pas le matin',
    morningCoffee: v => v ? 'tu bois du café le matin' : 'tu ne bois pas de café le matin',
    nationality: v => 'tu es ' + ({ Fransous: 'français', Portugis: 'portugais', 'Lëtzebuerger': 'luxembourgeois' }[v] || v)
  };
  function titreEvenement(etat, id) {
    const ev = contenus(etat).evenements[id] || contenus(etat).beats[id];
    return ev && ev.titreFr ? ev.titreFr : id;
  }
  function resumer(etat) {
    const lignes = [];
    const fait = (cle, v) => FAITS[cle] ? FAITS[cle](v) : cle;
    Object.keys(etat.dejaMenti).forEach(cle => {
      if (etat.mensonges[cle]) lignes.push({ type: 'mensonge', fr: 'Bluff jamais avoué : ' + fait(cle, etat.claims[cle]) + '.' });
      else lignes.push({ type: 'aveu', fr: 'Bluff réparé : maintenant elle sait que ' + fait(cle, valeurPersona(etat.persona, cle)) + '.' });
    });
    if (etat.blagues.joke_age_120) lignes.push({ type: 'blague', fr: 'Tu as prétendu avoir 120 ans.' });
    if (etat.contradictions) lignes.push({ type: 'contradiction', fr: (etat.contradictions > 1 ? etat.contradictions + ' contradictions' : 'Une contradiction') + ' : elle l’a remarqué.' });
    etat.evenements.forEach(id => { if (id !== REPARATION) lignes.push({ type: 'evenement', fr: 'Imprévu : ' + titreEvenement(etat, id) + '.' }); });
    if (etat.ouverturesDate) lignes.push({ type: 'telephone', fr: 'Téléphone consulté ' + etat.ouverturesDate + ' fois pendant le rendez-vous' + (etat.batterieVide ? ', jusqu’à la batterie à plat.' : '.') });
    else lignes.push({ type: 'telephone', fr: 'Téléphone resté dans ta poche.' });
    if (!Object.keys(etat.dejaMenti).length && !etat.blagues.joke_age_120) lignes.unshift({ type: 'sincere', fr: 'Tu as dit la vérité du début à la fin.' });
    return lignes;
  }

  // Expressions à retenir : chaque question posée et sa réponse vraie.
  function expressionsTravaillees(etat) {
    const liste = [];
    etat.historique.forEach(h => {
      if (h.type !== 'question') return;
      const source = scene(etat, h.id);
      if (!source || source.pedagogicalScoring === false) return;
      const vraie = source.choices.find(c => c.truth === 'honest');
      if (vraie && vraie.lu) liste.push({ question: source.prompt, reponse: { lu: vraie.lu, fr: vraie.fr }, faute: h.langue === false });
    });
    return liste;
  }

  return {
    nouvellePartie, commencerSwipes, carteCourante, swiper, apresMatch, noterApp,
    effetLook, choisirLook, commencerDate, repondre, continuer,
    ouvrirTelephone, fermerTelephone, avancerTemps, expressionsTravaillees,
    profilParId, creerHasard, composerScenario, gardeOk
  };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = LuxMatchCore;
