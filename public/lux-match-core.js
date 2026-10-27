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
  const SUSPICION_SUJET_FORT = 6;   // bluff sur le sujet qu'elle connaît bien
  const SUSPICION_TROP_BEAU = 5;    // 3e bluff actif : histoire peu crédible (+3 par bluff suivant)

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
      genresBlague: {},
      emotions: [],               // signes manga affichés (type:intensité), pour le bilan et les tests
      // Journal append-only de ce qui s'est réellement dit (SPEC §18.2) :
      // claim, contradiction, aveu, blague_assumee, maintenu. Le bilan en est dérivé.
      journal: [],
      avoues: {},                 // attributs dont le bluff a été avoué EXPLICITEMENT
      blaguesAssumees: {},        // bluffs rattrapés par « c'était une blague » (pas un aveu)
      derniereContradiction: [],  // attributs de la dernière contradiction (cible de B25)
      choixFaits: [],             // identifiants de tous les choix du rendez-vous
      evenements: [],             // événements joués ou programmés
      contradictions: 0,
      aveux: 0,
      etapes: {},                 // rappel, « à demain ? » et clôture déjà placés
      ambianceFin: null,          // bonne, calme, tendue ou froide, fixée avant l'au revoir
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

  // ─── Générateur semi-procédural (SPEC §13) ───────────────────────────────
  // Compose UNE FOIS, au match, un scénario cohérent à partir de scènes écrites de la bible.
  // Il ne fait que choisir et ordonner : aucun texte n'est fabriqué.
  // Même graine = même scénario (hasard dédié, indépendant des tirages d'affichage).

  const SCHEMA_SCENARIO = 1;
  const POIDS = { exAlex: 0.10, agePreference: 0.35, variante: 0.6, age: 0.85, rappel: 0.75, adieuFlott: 0.3, quatreThemes: 0.5 };
  const AGES_PREF = ['indifferent', 'prefers_similar', 'prefers_older', 'prefers_younger'];
  const PREF_POST = { indifferent: 'PREF_AGE_INDIFFERENT', prefers_similar: 'PREF_AGE_SIMILAR', prefers_older: 'PREF_AGE_OLDER', prefers_younger: 'PREF_AGE_YOUNGER' };
  // Thèmes de l'acte 2 ouverts à toutes ; les scènes propres à une partenaire viennent de profil.beats.
  const THEMES_COMMUNS = ['B05_ORIGIN', 'B06_CITY', 'B07_LANGUAGE', 'B08_PROFESSION', 'B09_WORKPLACE', 'B11_COFFEE', 'B12_COFFEE_OFFER', 'B13_NATIONALITY', 'B21_ASK_HER'];
  const CAFE = ['B11_COFFEE', 'B12_COFFEE_OFFER', 'EV_EMMA_COFFEE'];   // un seul sujet « café » par rendez-vous
  // Questions « d'état civil » (SPEC §18.4) : jamais deux à la suite quand une autre scène peut
  // s'intercaler, et une seule parmi origine / nationalité. Le reste (passions, café, routine,
  // question à elle) fait la conversation. Emma n'est pas une agente KYC.
  const ETAT_CIVIL = ['B03_NAME', 'B04_AGE', 'B05_ORIGIN', 'B06_CITY', 'B13_NATIONALITY'];
  const IDENTITE = ['B05_ORIGIN', 'B13_NATIONALITY'];
  const estEtatCivil = id => ETAT_CIVIL.indexOf(id) >= 0;
  // Réordonne sans rien retirer : après une question d'état civil, on prend d'abord une autre scène.
  function espacer(ordre, precedentEtatCivil) {
    const reste = ordre.slice(), resultat = [];
    let avant = precedentEtatCivil;
    while (reste.length) {
      // La question d'Alex à elle (B21) n'ouvre jamais l'acte 2 : on commence par un vrai sujet.
      let i = avant ? reste.findIndex(id => !estEtatCivil(id) && !(resultat.length === 0 && id === 'B21_ASK_HER')) : 0;
      if (i < 0) i = 0;
      if (reste[i] === 'B09_WORKPLACE' && reste.indexOf('B08_PROFESSION') >= 0) i = reste.indexOf('B08_PROFESSION');
      const id = reste.splice(i, 1)[0];
      resultat.push(id);
      // Le lieu de travail suit toujours le métier.
      if (id === 'B08_PROFESSION' && reste.indexOf('B09_WORKPLACE') >= 0) resultat.push(reste.splice(reste.indexOf('B09_WORKPLACE'), 1)[0]);
      avant = estEtatCivil(resultat[resultat.length - 1]);
    }
    return resultat;
  }

  function tirerPondere(liste, poids, hasard) {
    const total = liste.reduce((t, x) => t + poids(x), 0);
    let r = hasard() * total;
    for (const x of liste) { r -= poids(x); if (r < 0) return x; }
    return liste[liste.length - 1];
  }

  // 1. Traits de la partenaire : humour, une variante de post, au plus UN levier social fort.
  function tirerTraits(c, profil, hasard) {
    // L'humour est propre à chaque personnage (annoncé par sa bio et un post Amis) : jamais tiré au hasard.
    const traits = { phoneTolerance: profil.phoneTolerance, agePreference: null, dislikedFirstName: null, agePrefPositive30: false };
    const variante = profil.variantes.length && hasard() < POIDS.variante ? choisirUn(profil.variantes, hasard) : null;
    const levierDejaPris = profil.phoneTolerance === 'anti_phone';  // Emma : le téléphone suffit
    const r = hasard();
    if (!levierDejaPris && profil.exAlexPossible && r < POIDS.exAlex) traits.dislikedFirstName = c.persona.name;
    else if (profil.agePrefPossible && r < POIDS.exAlex + POIDS.agePreference) {
      traits.agePreference = choisirUn(levierDejaPris ? ['indifferent'] : AGES_PREF, hasard);
      // EV_AGE_PREF (« Du bass drësseg? ») seulement si 30 ans lui plaît vraiment.
      traits.agePrefPositive30 = traits.agePreference === 'prefers_older' ||
        (traits.agePreference === 'prefers_similar' && Math.abs(30 - profil.age) < Math.abs(28 - profil.age));
    }
    return { traits, variante };
  }

  // 2. Posts du scénario : variante + préférence publiée (toujours sur Amis, jamais privé).
  function postsDuScenario(c, variante, traits) {
    const posts = [];
    if (variante) posts.push(Object.assign({ id: variante, reveals: c.variantes[variante].trait }, c.variantes[variante]));
    if (traits.agePreference) posts.push(Object.assign({ id: PREF_POST[traits.agePreference], reveals: 'age' }, c.preferences[PREF_POST[traits.agePreference]]));
    if (traits.dislikedFirstName) posts.push(Object.assign({ id: 'PREF_EX_ALEX', reveals: 'prenom' }, c.preferences.PREF_EX_ALEX));
    return posts;
  }

  // 3. Scènes de l'acte 2 : l'accroche de la partenaire + 2 ou 3 thèmes variés.
  function themePossible(c, profil, id, variante, choisis) {
    const b = c.beats[id];
    if (!b || choisis.indexOf(id) >= 0) return false;
    if (b.profil && b.profil !== profil.id) return false;
    if (b.requiresVariant && b.requiresVariant !== variante) return false;
    if (CAFE.indexOf(id) >= 0 && choisis.some(x => CAFE.indexOf(x) >= 0)) return false;
    if (id === 'B09_WORKPLACE' && choisis.indexOf('B08_PROFESSION') < 0) return false;  // le lieu de travail suit le métier
    if (IDENTITE.indexOf(id) >= 0 && choisis.some(x => IDENTITE.indexOf(x) >= 0)) return false;  // origine OU nationalité
    return true;
  }
  function tirerActe2(c, profil, variante, hasard) {
    const propres = profil.beats.filter(id => !c.evenements[id]);
    const accroche = choisirUn(profil.beatsForts, hasard);
    const choisis = [accroche];
    const nombre = hasard() < POIDS.quatreThemes ? 4 : 3;
    // Les scènes de la partenaire pèsent 3 fois plus que les thèmes communs.
    const candidats = propres.concat(THEMES_COMMUNS.filter(id => propres.indexOf(id) < 0));
    let essais = 0;
    while (choisis.length < nombre && essais++ < 30) {
      const possibles = candidats.filter(id => themePossible(c, profil, id, variante, choisis));
      if (!possibles.length) break;
      // Ses scènes pèsent 3 fois plus ; l'état civil commun ne pèse que moitié.
      choisis.push(tirerPondere(possibles, id => propres.indexOf(id) >= 0 ? 3 : estEtatCivil(id) ? 0.5 : 1, hasard));
    }
    // Ordre : mélangé et espacé (l'acte 1 finit par le prénom ou l'âge), puis B09 après B08
    // et la question d'Alex jamais en premier.
    let ordre = espacer(melanger(choisis, hasard), true);
    if (ordre.indexOf('B09_WORKPLACE') >= 0 && ordre.indexOf('B09_WORKPLACE') < ordre.indexOf('B08_PROFESSION')) {
      ordre = ordre.filter(id => id !== 'B09_WORKPLACE');
      ordre.splice(ordre.indexOf('B08_PROFESSION') + 1, 0, 'B09_WORKPLACE');
    }
    if (ordre[0] === 'B21_ASK_HER' && ordre.length > 1) {
      ordre.shift();
      // Elle s'intercale après la première scène, ou plus loin pour séparer deux questions d'état civil.
      let i = ordre.findIndex((id, k) => k >= 1 && estEtatCivil(id) && estEtatCivil(ordre[k - 1]));
      ordre.splice(i < 0 ? 1 : i, 0, 'B21_ASK_HER');
    }
    return ordre;
  }

  // 4. Validation (contraintes fortes de la bible §12.2 et de la SPEC §13.4).
  function validerScenario(c, profil, plan) {
    const erreurs = [];
    const principaux = plan.scenes.length + (plan.rappel ? 1 : 0) + 1;
    if (principaux < 6 || principaux > 8) erreurs.push('tours:' + principaux);
    if (new Set(plan.scenes).size !== plan.scenes.length) erreurs.push('doublon');
    if (plan.scenes.indexOf('B01_SALUT') >= 0 && plan.scenes.indexOf('B02_SALUT_SOIR') >= 0) erreurs.push('deux_salutations');
    if (plan.scenes.filter(id => CAFE.indexOf(id) >= 0).length > 1) erreurs.push('deux_cafes');
    plan.scenes.forEach(id => { if (!c.beats[id]) erreurs.push('scene_inconnue:' + id); });
    // Chaque critère à fort effet a un indice public AVANT le date.
    const posts = profil.amis.posts.concat(plan.posts);
    const indice = reveals => posts.some(p => p.reveals === reveals);
    if (!indice('style')) erreurs.push('indice_look');
    if (profil.phoneTolerance === 'anti_phone' && !indice('anti_phone')) erreurs.push('indice_telephone');
    if (plan.traits.agePreference && !indice('age')) erreurs.push('indice_age');
    if (plan.traits.dislikedFirstName && !indice('prenom')) erreurs.push('indice_prenom');
    if (plan.traits.dislikedFirstName && plan.scenes.indexOf('B03_NAME') < 0) erreurs.push('prenom_jamais_demande');
    // L'accroche de la partenaire est bien jouée (son événement reste atteignable).
    if (!profil.beatsForts.some(id => plan.scenes.indexOf(id) >= 0)) erreurs.push('accroche');
    // Si une plaisanterie peut lui déplaire, son humour est annoncé publiquement.
    if (Object.keys(profil.humour).some(k => profil.humour[k].gout === 'n_aime_pas') && !indice('humour')) erreurs.push('indice_humour');
    return erreurs;
  }

  // Repli : un parcours pilote de la bible (§10), âge ajouté après le prénom.
  function scenarioPilote(c, profil, hasard, planId) {
    const plans = c.plans.filter(p => p.profil === profil.id && p.valide !== false);
    const pilote = plans.find(p => p.id === planId) || choisirUn(plans, hasard);
    const scenes = pilote.sequence.filter(id => !c.evenements[id] && !c.rappels[id] && !c.clotures[id]);
    if (scenes.indexOf('B04_AGE') < 0) scenes.splice(scenes.indexOf('B03_NAME') + 1, 0, 'B04_AGE');
    return {
      id: pilote.id, scenes, rappel: pilote.sequence.some(id => c.rappels[id]),
      cloture: pilote.sequence.find(id => c.clotures[id]) || 'B18_END',
      variante: pilote.variante || null, traits: { phoneTolerance: profil.phoneTolerance, agePreference: null, dislikedFirstName: null, agePrefPositive30: false }
    };
  }

  // Renvoie un plan gelé : { schemaVersion, contentVersion, graine, profil, scenes, rappel,
  // cloture, variante, traits, posts, indices, diagnostics }.
  // planId (facultatif, tests) : impose un parcours pilote de la bible.
  function composerScenario(c, profil, graine, planId) {
    const hasard = creerHasard((graine ^ 0x5bd1e995) >>> 0);
    let plan = null;
    const diagnostics = [];
    if (!planId) {
      for (let essai = 0; essai < 3 && !plan; essai++) {
        const { traits, variante } = tirerTraits(c, profil, hasard);
        const acte1 = [hasard() < 0.5 ? 'B01_SALUT' : 'B02_SALUT_SOIR', 'B03_NAME'];
        if (traits.agePreference || hasard() < POIDS.age) acte1.push('B04_AGE');
        const candidat = {
          id: 'G' + essai, scenes: acte1.concat(tirerActe2(c, profil, variante, hasard)),
          rappel: hasard() < POIDS.rappel, cloture: hasard() < POIDS.adieuFlott ? 'B26_DATE_FAREWELL' : 'B18_END',
          variante, traits
        };
        // Trop long : on retire un thème de l'acte 2 (jamais l'accroche).
        while (candidat.scenes.length + (candidat.rappel ? 1 : 0) + 1 > 8) {
          const retirable = candidat.scenes.slice().reverse().find(id => acte1.indexOf(id) < 0 && profil.beatsForts.indexOf(id) < 0);
          candidat.scenes.splice(candidat.scenes.lastIndexOf(retirable), 1);
        }
        candidat.posts = postsDuScenario(c, variante, traits);
        const erreurs = validerScenario(c, profil, candidat);
        if (erreurs.length) diagnostics.push('essai ' + essai + ' : ' + erreurs.join(', '));
        else plan = candidat;
      }
    }
    if (!plan) {
      plan = scenarioPilote(c, profil, hasard, planId);
      plan.posts = postsDuScenario(c, plan.variante, plan.traits);
      if (!planId) diagnostics.push('repli : parcours pilote ' + plan.id);
    }
    plan.schemaVersion = SCHEMA_SCENARIO;
    plan.contentVersion = c.contentVersion;
    plan.graine = graine;
    plan.profil = profil.id;
    plan.indices = profil.amis.posts.concat(plan.posts).filter(p => p.reveals).map(p => ({ id: p.id, app: 'amis', reveals: p.reveals }));
    plan.diagnostics = diagnostics;
    return plan;
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
    if (id === REPARATION) return echangeReparation(etat, c.evenements[id]);
    if (c.evenements[id]) return { type: 'evenement', id, prompt: c.evenements[id].npc, choix: c.evenements[id].choices.slice(), source: c.evenements[id] };
    if (c.rappels[id]) return { type: 'rappel', id, prompt: c.rappels[id].prompt, choix: melanger(c.rappels[id].choices, etat.hasard), source: c.rappels[id] };
    const source = scene(etat, id);
    return { type: source.type === 'demande' ? 'demande' : 'question', id, prompt: source.prompt, choix: preparerChoix(etat, source), source };
  }

  function commencerDate(etat) {
    if (etat.phase !== 'look') return;
    etat.file = etat.plan.scenes.slice();
    // Scènes-événements écrites pour une partenaire (EV_LENA_MORNING, EV_EMMA_COFFEE) :
    // réservées dès le départ dans le budget de 2 événements.
    etat.file.forEach(id => { if (/^EV_/.test(id)) etat.evenements.push(id); });
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
        // « Et war flott! » seulement si l'ambiance est bonne ; sinon un au revoir sobre, amené.
        const humeur = ambiance(etat);
        etat.ambianceFin = humeur;
        etat.file.push(humeur !== 'bonne' && etat.plan.cloture === 'B26_DATE_FAREWELL' ? 'B18_END' : etat.plan.cloture);
      } else { terminer(etat); return; }
      if (!etat.file.length) { suivant(etat); return; }
    }
    etat.courant = echange(etat, etat.file.shift());
    if (contenus(etat).clotures[etat.courant.id] && etat.ambianceFin && etat.ambianceFin !== 'bonne' && etat.ambianceFin !== 'calme') {
      const t = (contenus(etat).transitionsCloture || {})[etat.ambianceFin];
      if (t) etat.courant.transition = { fr: t };
    }
  }
  // Ambiance avant l'au revoir : bonne, calme, tendue (contradiction non avouée, doute fort) ou froide.
  function ambiance(etat) {
    const derniere = etat.journal.map(j => j.type).lastIndexOf('contradiction');
    const avoueDepuis = derniere >= 0 && etat.journal.slice(derniere).some(j => j.type === 'aveu');
    if ((derniere >= 0 && !avoueDepuis) || etat.suspicion >= 40) return 'tendue';
    if (etat.affinity < 35) return 'froide';
    if (etat.affinity >= SEUIL_SUCCES.affinity && etat.suspicion < SEUIL_SUCCES.suspicion) return 'bonne';
    return 'calme';
  }

  // Un seul rappel, sur un propos réellement tenu, jamais sur un attribut qui vient d'avoir
  // son événement, ni sur ce qui vient d'être dit aux deux derniers tours (SPEC §18.4).
  // Elle ne lit pas le dossier d'Alex : un bluff est un peu plus souvent rappelé (il a surpris),
  // pas systématiquement.
  function choisirRappel(etat) {
    if (!etat.plan.rappel) return null;
    const rappels = contenus(etat).rappels;
    const dejaTraites = {};
    etat.evenements.forEach(id => { if (estEvenement(etat, id)) Object.keys(clesDeclencheur(contenus(etat).evenements[id])).forEach(k => { dejaTraites[k] = true; }); });
    const possibles = Object.keys(rappels).filter(id => etat.claims[rappels[id].attribut] !== undefined && !dejaTraites[rappels[id].attribut]);
    if (!possibles.length) return null;
    const recents = etat.historique.slice(-2).map(h => h.id);
    const ditRecemment = id => etat.journal.some(j => j.type === 'claim' && j.attribut === rappels[id].attribut && recents.indexOf(j.scene) >= 0);
    const espaces = possibles.filter(id => !ditRecemment(id));
    const liste = espaces.length ? espaces : possibles;
    return tirerPondere(liste, id => etat.mensonges[rappels[id].attribut] ? 2 : 1, etat.hasard);
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
    if (d.blague) return !!etat.genresBlague[d.blague];
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
  // Une affirmation redevenue vraie n'est PAS un aveu : seul le mensonge « actif » cesse.
  function affirmer(etat, cle, valeur, choix) {
    const avant = etat.claims[cle];
    const vrai = valeur === valeurPersona(etat.persona, cle);
    etat.claims[cle] = valeur;
    if (!vrai) { etat.mensonges[cle] = true; etat.dejaMenti[cle] = true; } else delete etat.mensonges[cle];
    etat.journal.push({ type: 'claim', attribut: cle, valeur, vrai, scene: etat.courant ? etat.courant.id : null,
      lu: choix && choix.lu || null, fr: choix && choix.fr || null });
    return avant !== undefined && avant !== valeur;
  }
  // Aveu explicite : le bluff sur ces attributs est reconnu, elle connaît la vérité.
  function avouer(etat, cles) {
    const avoues = cles.filter(cle => etat.dejaMenti[cle]);
    avoues.forEach(cle => {
      etat.avoues[cle] = true;
      etat.claims[cle] = valeurPersona(etat.persona, cle);
      delete etat.mensonges[cle];
    });
    etat.journal.push({ type: 'aveu', attributs: avoues, scene: etat.courant ? etat.courant.id : null });
  }
  // « C'était une blague » : le bluff est retiré, mais ce n'est pas un aveu.
  function assumerBlague(etat, cles) {
    const concernes = cles.filter(cle => etat.dejaMenti[cle]);
    concernes.forEach(cle => {
      etat.blaguesAssumees[cle] = true;
      if (etat.mensonges[cle]) { delete etat.mensonges[cle]; delete etat.claims[cle]; }
    });
    etat.journal.push({ type: 'blague_assumee', attributs: concernes, scene: etat.courant ? etat.courant.id : null });
  }
  // Deux affirmations différentes qui ne vont pas ensemble (bible B09, B13).
  const METIER_LIEU = { Banker: 'Bank', Dokter: 'Spidol' };
  const ORIGINE_NATIONALITE = { 'Frankräich': 'Fransous', Portugal: 'Portugis' };
  function incoherent(etat, cle) {
    const c = etat.claims;
    if ((cle === 'job' || cle === 'workplace') && c.job && c.workplace && METIER_LIEU[c.job] && METIER_LIEU[c.job] !== c.workplace) return ['job', 'workplace'];
    if ((cle === 'origin' || cle === 'nationality') && c.origin && c.nationality && ORIGINE_NATIONALITE[c.origin] &&
      c.nationality !== 'Lëtzebuerger' && ORIGINE_NATIONALITE[c.origin] !== c.nationality) return ['origin', 'nationality'];
    return null;
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
  // Humour de la partenaire (SPEC §14) : chaque genre de blague lui plaît, la laisse
  // indifférente ou l'agace. Petit effet social, jamais de suspicion ni de faute de langue.
  const EFFET_GOUT = { aime: 4, neutre: 0, n_aime_pas: -3 };
  function goutBlague(etat, genre) {
    const h = etat.profil.humour && etat.profil.humour[genre];
    return h ? h.gout : 'neutre';
  }
  function reactionBlague(etat, choix, genre) {
    const propre = etat.profil.reactionsChoix && etat.profil.reactionsChoix[choix.id];
    const h = etat.profil.humour && etat.profil.humour[genre];
    return { cle: 'HUMOUR', genre, gout: goutBlague(etat, genre), fr: propre || (h && h.fr) || '' };
  }
  function reaction(etat, cle) { return etat.profil.reactions[cle] ? { cle, fr: etat.profil.reactions[cle] } : null; }

  // Ce qu'elle a entendu sur un attribut : les deux dernières valeurs différentes.
  function deuxVersions(etat, cle) {
    const dits = etat.journal.filter(j => j.type === 'claim' && j.attribut === cle);
    const apres = dits[dits.length - 1];
    const avant = dits.slice(0, -1).reverse().find(j => j.valeur !== apres.valeur);
    return avant ? { avant, apres } : null;
  }
  // Réaction FR précise : elle cite la contradiction qu'elle vient d'entendre (SPEC §18.4).
  function phraseContradiction(etat, cles) {
    const fait = (cle, v) => FAITS[cle] ? FAITS[cle](v) : String(v);
    const v = cles.length === 1 ? deuxVersions(etat, cles[0]) : null;
    if (v) return 'Elle fronce les sourcils : d’abord ' + fait(cles[0], v.avant.valeur) + ', et maintenant ' + fait(cles[0], v.apres.valeur) + ' ?';
    if (cles.length === 2 && cles.every(c => etat.claims[c] !== undefined)) return 'Elle fronce les sourcils : ' + fait(cles[0], etat.claims[cles[0]]) + ' et ' + fait(cles[1], etat.claims[cles[1]]) + ' ?';
    return 'Elle fronce les sourcils : ce n’est pas ce que tu as dit tout à l’heure…';
  }
  // B25 contextualisée : « Portugal oder Frankräich? » ; « maintenir » répète la phrase qu'il vient de dire.
  function echangeReparation(etat, ev) {
    const ech = { type: 'evenement', id: REPARATION, prompt: ev.npc, choix: ev.choices.slice(), source: ev };
    const cles = etat.derniereContradiction;
    const conf = ev.confrontation;
    const v = cles.length === 1 ? deuxVersions(etat, cles[0]) : null;
    const mots = conf && v && conf.valeurs[cles[0]];
    const a = mots && mots[String(v.avant.valeur)], b = mots && mots[String(v.apres.valeur)];
    const majuscule = t => t.charAt(0).toUpperCase() + t.slice(1);
    if (a && b) ech.prompt = { lu: majuscule(conf.modele.lu.replace('{a}', a[0]).replace('{b}', b[0])), fr: majuscule(conf.modele.fr.replace('{a}', a[1]).replace('{b}', b[1])), review: conf.modele.review };
    const dernier = etat.journal.slice().reverse().find(j => j.type === 'claim' && cles.indexOf(j.attribut) >= 0 && j.lu);
    if (dernier) ech.choix = ech.choix.map(c => c.explication === 'maintien' ? Object.assign({}, c, { lu: dernier.lu, fr: dernier.fr || c.fr, maintient: dernier.attribut }) : c);
    return ech;
  }

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
    const contredits = [];
    const contredire = cles => cles.forEach(cle => { if (contredits.indexOf(cle) < 0) contredits.push(cle); });
    const affirmerChoix = () => Object.keys(choix.claims || {}).forEach(cle => {
      if (affirmer(etat, cle, choix.claims[cle], choix) && !choix.remplace) { r.contradiction = true; contredire([cle]); }
      const paire = incoherent(etat, cle);
      if (paire) { r.contradiction = true; contredire(paire); }
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
        // Elle ne connaît pas le vrai Alex (SPEC §18.4) : un bluff plausible ne se voit pas.
        // Le doute vient de ce qu'elle PEUT percevoir : son sujet favori (elle s'y connaît)
        // ou un portrait qui devient trop beau pour être vrai (3e bluff encore actif).
        // Le vrai risque reste la mémoire : rappels, contradictions et pièges.
        const dejaActifs = Object.keys(etat.mensonges).filter(k => !(choix.claims && k in choix.claims)).length;
        const tropBeau = dejaActifs >= 2;
        ajouter(social.affinity !== undefined ? social.affinity : 2, (fort ? SUSPICION_SUJET_FORT : 0) + (tropBeau ? SUSPICION_TROP_BEAU + 3 * (dejaActifs - 2) : 0));
        r.bluff = true;
        r.visuel = 'sourire';
        if (fort) { r.reaction = reaction(etat, 'BLUFF'); r.visuel = 'sourcil'; }
        else if (tropBeau) { r.reaction = { cle: 'TROP_BEAU', fr: 'Elle te regarde un peu plus attentivement.' }; r.visuel = 'sourcil'; }
      } else if (choix.truth === 'joke') {
        const genre = choix.jokeKind || 'absurde';
        etat.genresBlague[genre] = true;
        r.reaction = reactionBlague(etat, choix, genre);
        ajouter(EFFET_GOUT[r.reaction.gout]);
        r.visuel = r.reaction.gout === 'aime' ? 'rire' : r.reaction.gout === 'neutre' ? 'hoche' : genre === 'vantardise' ? 'sourcil' : 'gene';
      } else if (choix.truth === 'decale') {
        // Réponse correcte mais décalée (« Kaffi! ») : c'est elle qui réagit, pas un professeur.
        const d = etat.profil.decale || { gout: 'n_aime_pas', fr: '' };
        r.reaction = { cle: 'DECALE', gout: d.gout, fr: d.fr };
        ajouter(d.gout === 'n_aime_pas' ? -2 : 0);
        r.visuel = d.gout === 'n_aime_pas' ? 'gene' : 'rire';
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
      if (choix.jokeKind) { etat.genresBlague[choix.jokeKind] = true; r.reaction.genre = choix.jokeKind; }
      affirmerChoix();
      // Attributs visés : ceux de la contradiction (B25) ou ceux qui ont déclenché l'événement.
      const cibles = ech.id === REPARATION ? etat.derniereContradiction.slice() : Object.keys(clesDeclencheur(ech.source));
      if (choix.aveu) {
        r.aveu = true; etat.aveux++;
        avouer(etat, cibles.length ? cibles : Object.keys(etat.mensonges));
        if (ech.id !== REPARATION && etat.profil.reactions.AVEU) r.reaction = { cle: 'AVEU', fr: choix.reactionFr + ' « ' + etat.profil.reactions.AVEU + ' »' };
      } else if (choix.explication === 'blague') {
        r.blagueAssumee = true;
        assumerBlague(etat, cibles);
      } else if (choix.explication === 'maintien') {
        etat.journal.push({ type: 'maintenu', attributs: cibles, scene: ech.id });
      }
    } else if (ech.type === 'rappel') {
      const attribut = ech.source.attribut;
      if (choix.valeur === 'blague') {
        // « Dat war e Witz! » ou un nouveau « James Bond » : pas de contradiction.
        ajouter(etat.blagues.joke_age_120 && attribut === 'age' ? 3 : 0);
        r.visuel = goutBlague(etat, 'absurde') === 'aime' ? 'rire' : 'hoche';
      } else if (choix.valeur === etat.claims[attribut]) {
        ajouter(etat.mensonges[attribut] ? 2 : 4);
        r.visuel = 'hoche';
        r.reaction = { cle: 'RAPPEL', fr: 'Elle hoche la tête : « Ah oui, c’est ça. »' };
      } else {
        affirmer(etat, attribut, choix.valeur, choix);
        r.contradiction = true;
        contredire([attribut]);
      }
    }
    if (r.contradiction) {
      etat.contradictions++;
      etat.derniereContradiction = contredits.slice();
      etat.journal.push({ type: 'contradiction', attributs: contredits.slice(), scene: ech.id });
      r.attributsContredits = contredits.slice();
      ajouter(CONTRADICTION.affinity, CONTRADICTION.suspicion);
      r.visuel = 'sourcil';
      r.reaction = { cle: 'CONTRADICTION', fr: phraseContradiction(etat, contredits) };
      // Une seule chance de s'expliquer (« Ass dat wouer? »).
      if (evenementEligible(etat, REPARATION)) { etat.enAttente.unshift(REPARATION); etat.evenements.push(REPARATION); }
    }

    r.emotion = emotionDe(etat, ech, choix, r);

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

  // ─── Émotion lisible (SPEC §15) ───────────────────────────────────────────
  // Déduite de la MÊME décision sociale que la réaction : jamais du score total, jamais
  // d'une faute de langue. null le plus souvent (pas d'effet après chaque réponse).
  // Renvoie { type: awkward | annoyed | doubt | delighted | charmed | stunned, intensite, delai }.
  const EMOTION_VISUEL = { rire: 'delighted', joie: 'delighted', sourcil: 'doubt', froid: 'annoyed', scratch: 'stunned', zoom: 'stunned' };
  function emotionDe(etat, ech, choix, r) {
    let e = null;
    if (r.contradiction) e = { type: 'stunned', intensite: 'medium' };
    else if (r.reaction && r.reaction.cle === 'DECALE') e = r.reaction.gout === 'n_aime_pas' ? { type: 'awkward', intensite: 'medium', delai: 300 } : { type: 'delighted', intensite: 'subtle' };
    else if (r.reaction && r.reaction.cle === 'HUMOUR') e = r.reaction.gout === 'aime' ? { type: 'delighted', intensite: 'subtle' } : r.reaction.gout === 'n_aime_pas' ? { type: 'doubt', intensite: 'subtle' } : null;
    else if (r.reaction && (r.reaction.cle === 'BLUFF' || r.reaction.cle === 'TROP_BEAU')) e = { type: 'doubt', intensite: 'subtle' };
    else if (ech.type === 'evenement') {
      const type = EMOTION_VISUEL[choix.visuel];
      if (type) e = { type, intensite: type === 'stunned' ? 'big' : type === 'annoyed' ? 'medium' : 'subtle' };
    } else if (ech.type === 'question' && choix.truth === 'honest' && r.affinity >= 7) e = { type: 'charmed', intensite: 'subtle' }; // rare : un vrai point commun
    // Un seul gros effet par rendez-vous : les suivants restent moyens.
    if (e && e.intensite === 'big') { if (etat.grosEffetFait) e.intensite = 'medium'; etat.grosEffetFait = true; }
    if (e) etat.emotions.push(e.type + ':' + e.intensite);
    return e;
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
    prenom: v => 'tu t’appelles ' + v, age: v => 'tu as ' + v + ' ans', origin: v => 'tu viens ' + ({ 'Frankräich': 'de France', Portugal: 'du Portugal', 'Däitschland': 'd’Allemagne' }[v] || 'de ' + v),
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
  // Premier mensonge prononcé sur un attribut, d'après le journal.
  function premierMensonge(etat, cle) {
    const e = etat.journal.find(j => j.type === 'claim' && j.attribut === cle && !j.vrai);
    return e ? e.valeur : etat.claims[cle];
  }
  function resumer(etat) {
    const lignes = [];
    const fait = (cle, v) => FAITS[cle] ? FAITS[cle](v) : cle;
    Object.keys(etat.dejaMenti).forEach(cle => {
      const bluff = fait(cle, premierMensonge(etat, cle));
      if (etat.avoues[cle]) lignes.push({ type: 'aveu', fr: 'Bluff avoué (' + bluff + ') : elle connaît maintenant la vérité.' });
      else if (etat.blaguesAssumees[cle]) lignes.push({ type: 'blague', fr: 'Bluff (' + bluff + ') rattrapé en « c’était une blague » : ce n’est pas un aveu.' });
      else if (etat.mensonges[cle]) lignes.push({ type: 'mensonge', fr: 'Bluff jamais avoué : ' + fait(cle, etat.claims[cle]) + '.' });
      // L'affirmation est redevenue vraie sans aveu : un changement de version, rien de plus.
      else lignes.push({ type: 'mensonge', fr: 'Changement de version sans aveu : d’abord ' + bluff + ', puis ' + fait(cle, etat.claims[cle]) + '.' });
    });
    if (etat.blagues.joke_age_120) lignes.push({ type: 'blague', fr: 'Tu as prétendu avoir 120 ans.' });
    if (etat.contradictions) lignes.push({ type: 'contradiction', fr: (etat.contradictions > 1 ? etat.contradictions + ' contradictions' : 'Une contradiction') + ' : elle l’a remarqué.' });
    if (etat.journal.some(j => j.type === 'maintenu')) lignes.push({ type: 'contradiction', fr: 'Face à ses doutes, tu as maintenu ta version.' });
    const joues = etat.historique.map(h => h.id);
    etat.evenements.forEach(id => { if (id !== REPARATION && joues.indexOf(id) >= 0) lignes.push({ type: 'evenement', fr: 'Imprévu : ' + titreEvenement(etat, id) + '.' }); });
    if (etat.ouverturesDate) lignes.push({ type: 'telephone', fr: 'Téléphone consulté ' + etat.ouverturesDate + ' fois pendant le rendez-vous' + (etat.batterieVide ? ', jusqu’à la batterie à plat.' : '.') });
    else lignes.push({ type: 'telephone', fr: 'Téléphone resté dans ta poche.' });
    if (!Object.keys(etat.dejaMenti).length && !etat.blagues.joke_age_120) lignes.unshift({ type: 'sincere', fr: 'Tu as dit la vérité du début à la fin.' });
    return lignes;
  }

  // Bilan, deux listes distinctes (SPEC §18.3) :
  // 1. ce que le joueur a VRAIMENT répondu, dans l'ordre ;
  // 2. les phrases modèles de référence (réponse honnête de la leçon), pour réviser.
  function reponsesJouees(etat) {
    return etat.historique.filter(h => h.choix.lu && h.prompt && h.prompt.lu).map(h => {
      return {
        question: h.prompt,
        reponse: { lu: h.choix.lu, fr: h.choix.fr },
        truth: h.choix.truth,
        faute: h.langue === false,
        // Réponse vraie et correcte d'une question notée : c'est déjà une phrase modèle.
        modele: h.type === 'question' && h.choix.truth === 'honest' && h.langue === true
      };
    });
  }
  function phrasesModeles(etat) {
    const liste = [];
    etat.historique.forEach(h => {
      if (h.type !== 'question') return;
      const source = scene(etat, h.id);
      if (!source || source.pedagogicalScoring === false) return;
      const vraie = source.choices.find(c => c.truth === 'honest');
      if (!vraie || !vraie.lu) return;
      liste.push({ question: source.prompt, reponse: { lu: vraie.lu, fr: vraie.fr }, dejaJouee: h.choix.truth === 'honest' && h.langue === true });
    });
    return liste;
  }

  return {
    nouvellePartie, commencerSwipes, carteCourante, swiper, apresMatch, noterApp,
    effetLook, choisirLook, commencerDate, repondre, continuer,
    ouvrirTelephone, fermerTelephone, avancerTemps, reponsesJouees, phrasesModeles,
    profilParId, creerHasard, composerScenario, validerScenario, gardeOk
  };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = LuxMatchCore;
