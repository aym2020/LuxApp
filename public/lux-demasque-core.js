/* SPEC 110 — Lux Démasque : moteur pur (Node + navigateur), sans DOM.
   Un dossier = un prétendant, 4 à 6 déclarations (LU), des pièces (FR) et des règles
   d'objection. Tous les prétendants mentent, mais plusieurs déclarations sont vraies.

   Le joueur :
   - écoute les déclarations (navigation libre) ;
   - « fait préciser » une déclaration (une seule fois, réponse mémorisée) ;
   - consulte les réseaux : chaque pièce vue entre dans le carnet ;
   - objecte : déclaration ciblée + pièce du carnet. Seule une preuve prévue par le
     dossier démasque ; tout le reste est refusé avec une réplique propre, sans révéler.
   Aucune phrase n'est générée : toutes les répliques viennent du contenu édité.
   Même dossier + mêmes décisions = même partie (aucun hasard dans les règles). */
'use strict';
const LuxDemasqueCore = (function () {

  const POINTS_DISQUETTE = 300;
  const PENALITE_ERREUR = 50;
  const BONUS_SANS_FAUTE = 200;

  // Hasard reproductible (mulberry32), pour le choix des dossiers et le générateur (D4).
  function creerHasard(graine) {
    let a = graine >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Pièces connues : celles du contenu + celles d'un dossier assemblé (piecesDetail).
  function piecesParId(contenus, dossier) {
    const index = {};
    contenus.pieces.forEach(p => { index[p.id] = p; });
    if (dossier && dossier.piecesDetail) dossier.piecesDetail.forEach(p => { index[p.id] = p; });
    return index;
  }
  function reseauxDuDossier(contenus, dossier) {
    return (dossier && dossier.reseaux) || (contenus.personnages[dossier.npc] || {}).reseaux || {};
  }
  function trouverDossier(contenus, id) {
    const ecrit = contenus.dossiers.find(d => d.id === id);
    if (ecrit) return ecrit;
    const redige = (contenus.dossiersRediges || []).find(d => d.id === id);
    return redige ? assembler(contenus, redige.npc, redige.affaires, { id: redige.id, numero: redige.numero }) : null;
  }

  // ─── Validation d'un dossier (SPEC 110 §4.4) ────────────────────────────────
  // Renvoie la liste des erreurs ; un dossier invalide n'est jamais jouable.
  function validerDossier(contenus, dossier) {
    const erreurs = [];
    const pieces = piecesParId(contenus, dossier);
    const npc = contenus.personnages[dossier.npc];
    if (!npc) erreurs.push('personnage inconnu : ' + dossier.npc);
    const decls = dossier.declarations || [];
    if (decls.length < 4 || decls.length > 6) erreurs.push('nombre de déclarations : ' + decls.length);
    const ids = decls.map(d => d.id);
    if (new Set(ids).size !== ids.length) erreurs.push('déclaration en double');
    const mensonges = decls.filter(d => !d.vrai);
    if (mensonges.length < 2) erreurs.push('moins de deux mensonges');
    if (decls.length - mensonges.length < 2) erreurs.push('moins de deux vérités');
    const themes = decls.map(d => d.theme);
    if (new Set(themes).size !== themes.length) erreurs.push('deux déclarations sur le même thème');
    // Toutes les pièces du dossier existent et sont visibles dans un réseau du personnage.
    const visibles = {}, reseaux = reseauxDuDossier(contenus, dossier);
    Object.keys(reseaux).forEach(r => (reseaux[r].pieces || []).forEach(p => { visibles[p] = r; }));
    (dossier.pieces || []).forEach(p => {
      if (!pieces[p]) erreurs.push('pièce inconnue : ' + p);
      else if (!visibles[p]) erreurs.push('pièce inaccessible (absente des réseaux) : ' + p);
      else if (visibles[p] !== pieces[p].source) erreurs.push('pièce dans le mauvais réseau : ' + p);
    });
    const utilisees = {};
    decls.forEach(d => {
      const ou = d.id;
      ['base'].forEach(k => { if (!d[k] || !d[k].lu || !d[k].fr) erreurs.push(ou + ' : réplique ' + k + ' manquante'); });
      if (!d.press || !d.press.question || !d.press.reponse || !d.press.question.lu || !d.press.reponse.lu) erreurs.push(ou + ' : précision manquante');
      if (!d.refus || !d.refus.lu) erreurs.push(ou + ' : refus manquant');
      Object.keys(d.refusPieces || {}).forEach(p => { if ((dossier.pieces || []).indexOf(p) < 0) erreurs.push(ou + ' : refus sur une pièce absente ' + p); });
      if (d.vrai) {
        if (d.mensonge) erreurs.push(ou + ' : vraie déclaration avec une règle de mensonge');
        return;
      }
      const m = d.mensonge;
      if (!m || !m.preuves || !m.preuves.length) { erreurs.push(ou + ' : mensonge sans preuve'); return; }
      m.preuves.forEach(ensemble => ensemble.forEach(p => {
        if ((dossier.pieces || []).indexOf(p) < 0) erreurs.push(ou + ' : preuve hors dossier ' + p);
        utilisees[p] = (utilisees[p] || []).concat(ou);
      }));
      ['justification'].forEach(k => { if (!m[k] || !m[k].lu) erreurs.push(ou + ' : ' + k + ' manquante'); });
      if (!m.aveuFr || !m.motivationFr || !m.explicationFr) erreurs.push(ou + ' : aveu, motivation ou explication manquants');
      if (m.exigePrecision && (!m.refusSansPrecision || !m.refusSansPrecision.lu)) erreurs.push(ou + ' : refus sans précision manquant');
    });
    // Une même pièce ne prouve jamais deux mensonges (sinon une preuve en trahit une autre).
    Object.keys(utilisees).forEach(p => { if (utilisees[p].length > 1) erreurs.push('pièce ' + p + ' prouve plusieurs mensonges'); });
    if (!dossier.fin || !dossier.fin.complet || !dossier.fin.partiel) erreurs.push('fin manquante');
    // Statut de relecture publiable pour toutes les répliques LU.
    const publiables = contenus.publiables || [];
    (function verifier(x, chemin) {
      if (Array.isArray(x)) x.forEach((v, i) => verifier(v, chemin + '[' + i + ']'));
      else if (x && typeof x === 'object') {
        if (typeof x.lu === 'string' && publiables.indexOf(x.review) < 0) erreurs.push(chemin + ' : statut non publiable ' + x.review);
        Object.keys(x).forEach(k => verifier(x[k], chemin + '.' + k));
      }
    })(dossier, dossier.id);
    return erreurs;
  }

  // ─── Partie ────────────────────────────────────────────────────────────────
  function nouvellePartie(contenus, options) {
    const opt = options || {};
    const dossier = opt.dossier || trouverDossier(contenus, opt.dossierId || contenus.dossiers[0].id);
    if (!dossier) throw new Error('dossier introuvable');
    const erreurs = validerDossier(contenus, dossier);
    if (erreurs.length) throw new Error('dossier invalide : ' + erreurs.join(' ; '));
    return {
      contenus, dossier, npc: contenus.personnages[dossier.npc],
      pieces: piecesParId(contenus, dossier), reseaux: reseauxDuDossier(contenus, dossier),
      phase: 'rencontre',          // rencontre → deposition → bilan
      index: 0,                    // déclaration affichée
      entendues: [],               // déclarations écoutées (ordre réel)
      precisions: [],              // déclarations dont la précision a été obtenue
      consultees: [],              // pièces des réseaux réellement ouvertes
      demasquees: [],              // déclarations démasquées (ordre réel)
      objections: [],              // { declaration, piece, ok, raison }
      erreurs: 0,
      journal: [],                 // tout ce qui s'est passé, dans l'ordre
      fin: null
    };
  }
  function declaration(etat, id) { return etat.dossier.declarations.find(d => d.id === id) || null; }
  function courante(etat) { return etat.dossier.declarations[etat.index]; }
  function noter(etat, evenement) { etat.journal.push(evenement); }

  function commencer(etat) {
    if (etat.phase !== 'rencontre') return;
    etat.phase = 'deposition';
    allerA(etat, 0);
  }
  // Navigation libre entre les déclarations ; chacune est « entendue » quand elle s'affiche.
  function allerA(etat, index) {
    if (etat.phase !== 'deposition') return null;
    const n = etat.dossier.declarations.length;
    etat.index = Math.max(0, Math.min(n - 1, index));
    const d = courante(etat);
    if (etat.entendues.indexOf(d.id) < 0) { etat.entendues.push(d.id); noter(etat, { type: 'entendue', declaration: d.id }); }
    return d;
  }
  function suivante(etat) { return allerA(etat, etat.index + 1); }
  function precedente(etat) { return allerA(etat, etat.index - 1); }

  // « Faire préciser » : une seule fois par déclaration, réponse mémorisée et relisible.
  function preciser(etat, id) {
    if (etat.phase !== 'deposition') return null;
    const d = declaration(etat, id || courante(etat).id);
    if (!d || etat.entendues.indexOf(d.id) < 0) return null;
    const nouvelle = etat.precisions.indexOf(d.id) < 0;
    if (nouvelle) { etat.precisions.push(d.id); noter(etat, { type: 'precision', declaration: d.id }); }
    return { declaration: d.id, question: d.press.question, reponse: d.press.reponse, nouvelle };
  }

  // Consulter une pièce d'un réseau : elle entre dans le carnet.
  function consulter(etat, pieceId) {
    if (etat.dossier.pieces.indexOf(pieceId) < 0) return false;
    if (etat.consultees.indexOf(pieceId) < 0) { etat.consultees.push(pieceId); noter(etat, { type: 'piece', piece: pieceId }); return true; }
    return false;
  }

  // Carnet : seulement ce qui a vraiment été vu ou entendu, dans l'ordre de découverte.
  // Les extraits de déposition (DEP:…, PRE:…) peuvent aussi être présentés en objection.
  function carnet(etat) {
    const pieces = etat.pieces;
    const liste = [];
    etat.journal.forEach(e => {
      if (e.type === 'piece') liste.push({ id: e.piece, genre: 'piece', piece: pieces[e.piece] });
      else if (e.type === 'entendue') liste.push({ id: 'DEP:' + e.declaration, genre: 'declaration', declaration: e.declaration, texte: declaration(etat, e.declaration).base });
      else if (e.type === 'precision') liste.push({ id: 'PRE:' + e.declaration, genre: 'precision', declaration: e.declaration, texte: declaration(etat, e.declaration).press.reponse });
    });
    return liste;
  }
  function dansCarnet(etat, pieceId) { return carnet(etat).some(c => c.id === pieceId); }

  // ─── Objection ─────────────────────────────────────────────────────────────
  // Renvoie { resultat: 'demasque' | 'refus' | 'deja' | 'invalide', reponse: {lu, fr}, ... }.
  function objecter(etat, declarationId, pieceId) {
    if (etat.phase !== 'deposition') return { resultat: 'invalide' };
    const d = declaration(etat, declarationId);
    if (!d || etat.entendues.indexOf(d.id) < 0 || !dansCarnet(etat, pieceId)) return { resultat: 'invalide' };
    if (etat.demasquees.indexOf(d.id) >= 0) return { resultat: 'deja', declaration: d.id };
    let ok = false, raison = 'refus', reponse = (d.refusPieces && d.refusPieces[pieceId]) || d.refus;
    if (!d.vrai) {
      const m = d.mensonge;
      const prouve = m.preuves.some(ensemble => ensemble.every(p => p === pieceId || (ensemble.length > 1 && dansCarnet(etat, p))) && ensemble.indexOf(pieceId) >= 0);
      if (prouve && m.exigePrecision && etat.precisions.indexOf(d.id) < 0) { raison = 'precision_manquante'; reponse = m.refusSansPrecision; }
      else if (prouve) { ok = true; raison = 'preuve'; reponse = m.justification; }
    }
    etat.objections.push({ declaration: d.id, piece: pieceId, ok, raison });
    noter(etat, { type: 'objection', declaration: d.id, piece: pieceId, ok, raison });
    if (!ok) { etat.erreurs++; return { resultat: 'refus', declaration: d.id, piece: pieceId, raison, reponse }; }
    etat.demasquees.push(d.id);
    const resultat = { resultat: 'demasque', declaration: d.id, piece: pieceId, reponse, aveuFr: d.mensonge.aveuFr, revelation: d.mensonge.revelation || null,
      trouvees: etat.demasquees.length, total: totalMensonges(etat), complet: etat.demasquees.length === totalMensonges(etat) };
    return resultat;
  }
  function totalMensonges(etat) { return etat.dossier.declarations.filter(d => !d.vrai).length; }
  function estDemasquee(etat, id) { return etat.demasquees.indexOf(id) >= 0; }

  // ─── Fin et bilan ──────────────────────────────────────────────────────────
  // Dossier clos : quand tout est démasqué, ou quand le joueur décide de conclure.
  function conclure(etat) {
    if (etat.phase !== 'deposition') return etat.fin;
    const total = totalMensonges(etat), trouvees = etat.demasquees.length;
    const sansFaute = trouvees === total && etat.erreurs === 0;
    const score = Math.max(0, trouvees * POINTS_DISQUETTE - etat.erreurs * PENALITE_ERREUR) + (sansFaute ? BONUS_SANS_FAUTE : 0);
    etat.phase = 'bilan';
    etat.fin = { trouvees, total, erreurs: etat.erreurs, sansFaute, score, complet: trouvees === total,
      replique: trouvees === total ? etat.dossier.fin.complet : etat.dossier.fin.partiel };
    noter(etat, { type: 'fin', trouvees, total });
    return etat.fin;
  }
  // Bilan détaillé : révélé APRÈS la partie (motivations, preuves, phrases LU).
  function bilan(etat) {
    const pieces = etat.pieces;
    return etat.dossier.declarations.map(d => ({
      id: d.id, theme: d.theme, base: d.base, vrai: d.vrai,
      precisionObtenue: etat.precisions.indexOf(d.id) >= 0,
      demasquee: estDemasquee(etat, d.id),
      motivationFr: d.mensonge ? d.mensonge.motivationFr : null,
      explicationFr: d.mensonge ? d.mensonge.explicationFr : null,
      preuve: d.mensonge ? pieces[d.mensonge.preuves[0][0]] : null,
      preuveVue: d.mensonge ? d.mensonge.preuves[0].every(p => etat.consultees.indexOf(p) >= 0) : null
    }));
  }

  // ─── Générateur semi-procédural (lot D4, SPEC 110 §4) ─────────────────────
  // Assemble des affaires rédigées et validées. Rien n'est inventé : seul {npc} (prénom du
  // prétendant) est remplacé dans les textes FR des pièces. Aucune phrase LU n'a de variable.
  function remplacer(valeur, nom) {
    if (typeof valeur === 'string') return valeur.split('{npc}').join(nom);
    if (Array.isArray(valeur)) return valeur.map(v => remplacer(v, nom));
    if (valeur && typeof valeur === 'object') {
      const copie = {};
      Object.keys(valeur).forEach(k => { copie[k] = remplacer(valeur[k], nom); });
      return copie;
    }
    return valeur;
  }
  function affaireParId(contenus, id) { return (contenus.affaires || []).find(a => a.id === id) || null; }
  // Dossier complet (même forme qu'un dossier écrit) à partir d'une liste d'affaires.
  function assembler(contenus, npcId, ids, meta) {
    const npc = contenus.personnages[npcId], g = contenus.generateur || {};
    const affaires = ids.map(id => affaireParId(contenus, id));
    if (!npc || affaires.some(a => !a)) return null;
    const declarations = [], piecesDetail = [];
    const reseaux = {};
    Object.keys(npc.reseaux).forEach(r => { reseaux[r] = { pseudo: npc.reseaux[r].pseudo, bioFr: npc.reseaux[r].bioFr, pieces: [] }; });
    affaires.forEach(a => {
      const d = remplacer({ id: a.id, theme: a.theme, base: a.base, press: a.press, refus: a.refus, vrai: a.vrai }, npc.nom);
      if (a.refusPieces) d.refusPieces = remplacer(a.refusPieces, npc.nom);
      if (a.mensonge) d.mensonge = Object.assign({ id: a.id + '_LIE' }, remplacer(a.mensonge, npc.nom));
      declarations.push(d);
      a.pieces.forEach(p => {
        const piece = remplacer(p, npc.nom);
        if (piece.visuel && piece.visuel.personnes) piece.visuel.personnes = piece.visuel.personnes.map(x => Object.assign({}, x, { qui: x.qui === 'npc' ? npcId : x.qui }));
        piecesDetail.push(piece);
        (reseaux[piece.source] || (reseaux[piece.source] = { pseudo: npc.nom, bioFr: '', pieces: [] })).pieces.push(piece.id);
      });
    });
    return Object.assign({
      npc: npcId, dateFr: g.dateFr, lieuFr: g.lieuFr, fin: g.fin, declarations, piecesDetail, reseaux,
      pieces: piecesDetail.map(p => p.id), affaires: ids.slice(), reviewStatus: 'lu_audit_claude'
    }, meta || {});
  }
  function melanger(liste, hasard) {
    const copie = liste.slice();
    for (let i = copie.length - 1; i > 0; i--) { const j = Math.floor(hasard() * (i + 1)); const t = copie[i]; copie[i] = copie[j]; copie[j] = t; }
    return copie;
  }
  // Tirage contraint : thèmes tous différents, incompatibilités respectées, au moins un
  // mensonge qui exige une précision et au moins un mensonge démontré par recoupement de dates.
  // Même graine = même dossier.
  function composerDossier(contenus, options) {
    const opt = options || {}, g = contenus.generateur || {};
    const graine = (opt.graine >>> 0) || 1;
    const hasard = creerHasard(graine);
    const npcs = g.npcs || Object.keys(contenus.personnages);
    const npcId = opt.npcId || npcs[Math.floor(hasard() * npcs.length)];
    const mensonges = (contenus.affaires || []).filter(a => !a.vrai), verites = (contenus.affaires || []).filter(a => a.vrai);
    const nbM = (g.mensonges || [3, 3])[0] + Math.floor(hasard() * ((g.mensonges || [3, 3])[1] - (g.mensonges || [3, 3])[0] + 1));
    const nbV = (g.verites || [3, 3])[0] + Math.floor(hasard() * ((g.verites || [3, 3])[1] - (g.verites || [3, 3])[0] + 1));
    for (let essai = 0; essai < 50; essai++) {
      const choisis = [];
      const themes = {};
      const compatible = a => !themes[a.theme] && choisis.every(c => (c.incompatibles || []).indexOf(a.id) < 0 && (a.incompatibles || []).indexOf(c.id) < 0);
      melanger(mensonges, hasard).forEach(a => { if (choisis.length < nbM && compatible(a)) { choisis.push(a); themes[a.theme] = true; } });
      if (choisis.length < nbM) continue;
      if (g.auMoinsUnePrecision && !choisis.some(a => a.mensonge.exigePrecision)) continue;
      if (g.auMoinsUnCroise && !choisis.some(a => a.croise)) continue;
      const vraies = [];
      melanger(verites, hasard).forEach(a => { if (vraies.length < nbV && compatible(a)) { vraies.push(a); choisis.push(a); themes[a.theme] = true; } });
      if (vraies.length < nbV) continue;
      // Ordre de la déposition : mélangé, sans trois mensonges d'affilée en tête.
      let ordre = melanger(choisis, hasard);
      if (ordre.slice(0, 3).every(a => !a.vrai)) ordre = ordre.slice(1).concat(ordre[0]);
      const dossier = assembler(contenus, npcId, ordre.map(a => a.id), { id: 'GEN_' + npcId.toUpperCase() + '_' + graine, numero: String(100 + (graine % 900)), genere: true, graine });
      if (dossier && !validerDossier(contenus, dossier).length) return dossier;
    }
    return null;
  }
  // Contrôle du catalogue d'affaires : identifiants uniques, preuves internes à l'affaire.
  function validerAffaires(contenus) {
    const erreurs = [], vus = {}, piecesVues = {};
    (contenus.affaires || []).forEach(a => {
      if (vus[a.id]) erreurs.push('affaire en double : ' + a.id);
      vus[a.id] = true;
      const propres = a.pieces.map(p => p.id);
      propres.forEach(id => { if (piecesVues[id] || contenus.pieces.some(p => p.id === id)) erreurs.push('pièce partagée : ' + id); piecesVues[id] = true; });
      if (!a.vrai) {
        if (!a.mensonge || !a.mensonge.preuves.length) erreurs.push(a.id + ' : mensonge sans preuve');
        else a.mensonge.preuves.forEach(e => e.forEach(id => { if (propres.indexOf(id) < 0) erreurs.push(a.id + ' : preuve hors affaire ' + id); }));
        if (a.mensonge && a.mensonge.revelation && propres.indexOf(a.mensonge.revelation.piece) < 0) erreurs.push(a.id + ' : révélation hors affaire');
      }
      Object.keys(a.refusPieces || {}).forEach(id => { if (propres.indexOf(id) < 0) erreurs.push(a.id + ' : refus sur une pièce étrangère ' + id); });
      (a.incompatibles || []).forEach(id => {
        const autre = (contenus.affaires || []).find(x => x.id === id);
        if (!autre) erreurs.push(a.id + ' : incompatible inconnu ' + id);
        else if ((autre.incompatibles || []).indexOf(a.id) < 0) erreurs.push(a.id + ' ↔ ' + id + ' : incompatibilité non réciproque');
      });
      // Les textes LU ne contiennent jamais de variable.
      JSON.stringify([a.base, a.press, a.refus, a.refusPieces, a.mensonge && a.mensonge.justification, a.mensonge && a.mensonge.refusSansPrecision], (k, v) => {
        if (k === 'lu' && typeof v === 'string' && v.indexOf('{') >= 0) erreurs.push(a.id + ' : variable dans une phrase LU');
        return v;
      });
    });
    return erreurs;
  }
  function pieces(etat) { return etat.pieces; }
  function reseaux(etat) { return etat.reseaux; }

  return {
    composerDossier, assembler, validerAffaires, trouverDossier, pieces, reseaux,
    POINTS_DISQUETTE, PENALITE_ERREUR, BONUS_SANS_FAUTE,
    creerHasard, validerDossier, nouvellePartie, commencer, allerA, suivante, precedente, courante,
    preciser, consulter, carnet, objecter, totalMensonges, estDemasquee, conclure, bilan, piecesParId
  };
})();
if (typeof module !== 'undefined') module.exports = LuxDemasqueCore;
