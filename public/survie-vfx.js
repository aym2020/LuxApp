/* SPEC 92 étape 1 — Effets visuels et sonores du jeu Survie.
 *
 * Gestionnaire d'effets UNIQUE : le moteur (jeux-v21.js) envoie des événements
 * (attacher, etat, lettre, reussite, erreur, arreter) ; ce fichier dessine le feu
 * de la barre chrono dans un <canvas> et joue des sons synthétisés.
 * Il ne modifie jamais les règles du jeu. Sans ce fichier, le jeu fonctionne.
 */
'use strict';

const SurvieFx = (function () {
  const MAX_PARTICULES = 140;
  const ESPACE_SOUS_BARRE = 12; // px du canvas sous la barre (morceaux qui tombent)
  const MARGE = 12;             // px du canvas de chaque côté de la barre (lueur non coupée)
  // Particules créées par seconde selon le palier de combo (0 à 3).
  const FLAMMES_PAR_SECONDE = [0, 40, 70, 105];
  const BRAISES_PAR_SECONDE = [5, 7, 10, 14];
  // Gamme pentatonique (en demi-tons) : chaque lettre monte d'une note.
  const GAMME = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24, 26];

  let canvas = null;
  let ctx = null;
  let largeur = 0;
  let hauteur = 0;
  let dpr = 1;
  let sprites = null;
  let particules = [];
  let boucle = null;
  let dernierTemps = null;
  let aCreerFlammes = 0;
  let aCreerBraises = 0;
  let eclat = 0;
  let etat = { ratio: 1, palier: 0, urgence: false, secondes: 30 };
  let ratioAffiche = 1;
  let derniereSeconde = null;
  let audio = null;
  let extinction = false;

  /* ---------- Outils ---------- */

  function hasard(min, max) {
    return min + Math.random() * (max - min);
  }

  function mouvementReduit() {
    return typeof window !== 'undefined' && typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function cleSon() {
    return typeof storageKey === 'function' ? storageKey('luxSurvieSon') : 'luxSurvieSon';
  }

  // Petite image ronde et floue, dessinée une seule fois puis réutilisée :
  // beaucoup plus rapide qu'un dégradé recalculé pour chaque particule.
  function creerSprite(couleur) {
    const image = document.createElement('canvas');
    image.width = 32;
    image.height = 32;
    const c = image.getContext('2d');
    const degrade = c.createRadialGradient(16, 16, 0, 16, 16, 16);
    degrade.addColorStop(0, 'rgba(' + couleur + ',1)');
    degrade.addColorStop(0.35, 'rgba(' + couleur + ',.55)');
    degrade.addColorStop(1, 'rgba(' + couleur + ',0)');
    c.fillStyle = degrade;
    c.fillRect(0, 0, 32, 32);
    return image;
  }

  function preparerSprites() {
    if (sprites) return;
    sprites = {
      blanc: creerSprite('255,244,214'),
      jaune: creerSprite('255,200,86'),
      orange: creerSprite('255,122,34'),
      rouge: creerSprite('200,48,18'),
      fumee: creerSprite('120,110,100')
    };
  }

  function mesurer() {
    if (!canvas) return;
    dpr = Math.min(2, (typeof window !== 'undefined' && window.devicePixelRatio) || 1);
    largeur = canvas.clientWidth || 0;
    hauteur = canvas.clientHeight || 0;
    canvas.width = Math.round(largeur * dpr);
    canvas.height = Math.round(hauteur * dpr);
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // Position verticale du milieu de la barre chrono dans le canvas.
  function barreY() {
    return hauteur - ESPACE_SOUS_BARRE - 3;
  }

  function longueurBarre() {
    return Math.max(0, largeur - 2 * MARGE);
  }

  function teteX() {
    return MARGE + longueurBarre() * ratioAffiche;
  }

  function ajouter(particule) {
    if (particules.length < MAX_PARTICULES) particules.push(particule);
  }

  /* ---------- Création des particules ---------- */

  function creerFlamme() {
    const rempli = longueurBarre() * ratioAffiche;
    if (rempli < 4) return;
    // Plus de flammes près de la tête de la barre que vers le début.
    const x = teteX() - Math.pow(Math.random(), 2.2) * rempli;
    const palier = etat.palier;
    const vie = hasard(0.3, 0.6);
    ajouter({
      type: 'flamme', x: x, y: barreY() - 1,
      vx: -hasard(4, 12), vy: -(10 + palier * 5 + hasard(0, 8)),
      vie: vie, vieMax: vie, taille: hasard(2, 3.4) + palier * 0.5,
      phase: hasard(0, 6.28), frequence: hasard(6, 14), age: 0
    });
  }

  function creerBraise() {
    const rempli = longueurBarre() * ratioAffiche;
    if (rempli < 4) return;
    const x = teteX() - Math.pow(Math.random(), 3) * Math.min(rempli, 60);
    const vie = hasard(0.7, 1.4);
    ajouter({
      type: 'braise', x: x, y: barreY(),
      vx: -hasard(2, 10), vy: -hasard(8, 18),
      vie: vie, vieMax: vie, taille: hasard(0.8, 1.5),
      phase: hasard(0, 6.28), frequence: hasard(3, 7), age: 0
    });
  }

  function creerEtincelle(force) {
    const angle = hasard(-2.6, -0.5); // vers le haut, un peu vers la gauche
    const vitesse = hasard(40, 90) * force;
    const vie = hasard(0.35, 0.7);
    ajouter({
      type: 'etincelle', x: teteX(), y: barreY(),
      vx: Math.cos(angle) * vitesse, vy: Math.sin(angle) * vitesse,
      vie: vie, vieMax: vie, taille: hasard(1, 1.8), phase: 0, frequence: 0, age: 0
    });
  }

  function creerFumee(x) {
    const vie = hasard(0.6, 1.1);
    ajouter({
      type: 'fumee', x: x, y: barreY() - 2,
      vx: -hasard(2, 8), vy: -hasard(10, 20),
      vie: vie, vieMax: vie, taille: hasard(4, 7),
      phase: hasard(0, 6.28), frequence: hasard(2, 4), age: 0
    });
  }

  /* ---------- Boucle d'animation ---------- */

  function mettreAJour(dt) {
    // La tête du feu suit la barre CSS (qui a une transition de 120 ms).
    ratioAffiche += (etat.ratio - ratioAffiche) * Math.min(1, dt * 18);
    eclat = Math.max(0, eclat - dt * 2.2);

    if(!extinction){
      aCreerFlammes += FLAMMES_PAR_SECONDE[etat.palier] * dt;
      aCreerBraises += BRAISES_PAR_SECONDE[etat.palier] * dt;
    }
    while (aCreerFlammes >= 1) { creerFlamme(); aCreerFlammes -= 1; }
    while (aCreerBraises >= 1) { creerBraise(); aCreerBraises -= 1; }

    for (let i = particules.length - 1; i >= 0; i--) {
      const p = particules[i];
      p.vie -= dt;
      p.age += dt;
      if (p.vie <= 0) { particules.splice(i, 1); continue; }
      if (p.type === 'etincelle' || p.type === 'morceau') p.vy += 160 * dt; // gravité
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      // Ondulation propre à chaque particule : mouvement organique, jamais géométrique.
      if (p.frequence) p.x += Math.sin(p.phase + p.age * p.frequence) * 10 * dt;
      if (p.type === 'morceau') p.rotation += p.vitesseRotation * dt;
    }
  }

  function dessinerSprite(image, x, y, rayon, opacite) {
    if (opacite <= 0.01 || rayon <= 0) return;
    ctx.globalAlpha = Math.min(1, opacite);
    ctx.drawImage(image, x - rayon, y - rayon, rayon * 2, rayon * 2);
  }

  // Langue de flamme : la même image ronde, étirée vers le haut.
  function dessinerFlamme(image, x, y, rayon, opacite) {
    if (opacite <= 0.01 || rayon <= 0) return;
    ctx.globalAlpha = Math.min(1, opacite);
    ctx.drawImage(image, x - rayon * 0.75, y - rayon * 1.9, rayon * 1.5, rayon * 2.6);
  }

  function dessiner() {
    ctx.clearRect(0, 0, largeur, hauteur);
    if (largeur <= 0) return;

    // Fumée et morceaux de barre : couleurs normales.
    ctx.globalCompositeOperation = 'source-over';
    for (const p of particules) {
      const t = p.vie / p.vieMax;
      if (p.type === 'fumee') {
        dessinerSprite(sprites.fumee, p.x, p.y, p.taille * (2.2 - t), t * 0.35);
      } else if (p.type === 'morceau') {
        ctx.globalAlpha = t;
        ctx.save();
        ctx.translate(p.x + p.largeurMorceau / 2, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = '#e5533d';
        ctx.fillRect(-p.largeurMorceau / 2, -3, p.largeurMorceau, 6);
        ctx.restore();
      }
    }

    // Feu : couleurs additionnées, ce qui crée la lueur sans filtre.
    ctx.globalCompositeOperation = 'lighter';
    const palier = etat.palier;
    for (const p of particules) {
      const t = p.vie / p.vieMax;
      if (p.type === 'flamme') {
        // Cœur clair à la naissance, puis orange et rouge en s'élevant.
        let image = sprites.rouge;
        if (t > 0.88 && palier >= 3) image = sprites.blanc;
        else if (t > 0.72) image = sprites.jaune;
        else if (t > 0.42) image = sprites.orange;
        dessinerFlamme(image, p.x, p.y, p.taille * (0.6 + 0.6 * t), t * (0.42 + palier * 0.07));
      } else if (p.type === 'braise' || p.type === 'etincelle') {
        const clignote = p.type === 'braise' ? 0.6 + 0.4 * Math.sin(p.age * 18 + p.phase) : 1;
        dessinerSprite(sprites.jaune, p.x, p.y, p.taille * 2.2, t * clignote);
      }
    }

    // Tête de la barre : petite lueur orange au repos, pic blanc-or seulement après une réussite.
    if (ratioAffiche > 0.005) {
      const image = etat.urgence ? sprites.rouge : sprites.orange;
      dessinerSprite(image, teteX(), barreY(), 5 + palier * 1.5, 0.2 + palier * 0.07);
      if (eclat > 0) dessinerSprite(sprites.blanc, teteX(), barreY(), 6 + eclat * 10, eclat * 0.55);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }

  function image(temps) {
    boucle = null;
    if (!canvas || !ctx) return;
    // La vue peut être encore masquée lors du premier rendu : mesurer dès qu'elle s'affiche.
    if (largeur === 0) mesurer();
    const dt = dernierTemps === null ? 0.016 : Math.min(0.05, (temps - dernierTemps) / 1000);
    dernierTemps = temps;
    mettreAJour(dt);
    dessiner();
    boucle = window.requestAnimationFrame(image);
  }

  /* ---------- Sons (Web Audio, aucun fichier) ---------- */

  function sonActif() {
    try { return localStorage.getItem(cleSon()) !== '0'; } catch (_) { return true; }
  }

  function basculerSon() {
    const actif = !sonActif();
    try { localStorage.setItem(cleSon(), actif ? '1' : '0'); } catch (_) { /* facultatif */ }
    return actif;
  }

  function contexteAudio() {
    if (!sonActif() || typeof window === 'undefined') return null;
    if (!audio) {
      const Contexte = window.AudioContext || window.webkitAudioContext;
      if (!Contexte) return null;
      try { audio = new Contexte(); } catch (_) { return null; }
    }
    if (audio.state === 'suspended' && audio.resume) audio.resume();
    return audio;
  }

  // Une note courte : montée rapide puis extinction douce.
  function note(frequence, decalage, duree, volume, forme, frequenceFin) {
    const a = contexteAudio();
    if (!a) return;
    const debut = a.currentTime + decalage;
    const oscillateur = a.createOscillator();
    const gain = a.createGain();
    oscillateur.type = forme;
    oscillateur.frequency.setValueAtTime(frequence, debut);
    if (frequenceFin) oscillateur.frequency.exponentialRampToValueAtTime(frequenceFin, debut + duree);
    gain.gain.setValueAtTime(0.0001, debut);
    gain.gain.exponentialRampToValueAtTime(volume, debut + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, debut + duree);
    oscillateur.connect(gain);
    gain.connect(a.destination);
    oscillateur.start(debut);
    oscillateur.stop(debut + duree + 0.02);
  }

  function demiTons(base, n) {
    return base * Math.pow(2, n / 12);
  }

  /* ---------- Événements envoyés par le moteur ---------- */

  function attacher(element) {
    arreter();
    extinction = false;
    if (!element || typeof element.getContext !== 'function' || mouvementReduit()) return;
    canvas = element;
    ctx = canvas.getContext('2d');
    if (!ctx) { canvas = null; return; }
    preparerSprites();
    mesurer();
    ratioAffiche = etat.ratio;
    boucle = window.requestAnimationFrame(image);
  }

  function changerEtat(nouvelEtat) {
    etat = nouvelEtat;
    // Battement de cœur à chaque seconde quand le chrono est critique.
    if (etat.urgence && etat.secondes !== derniereSeconde) note(70, 0, 0.14, 0.14, 'sine');
    derniereSeconde = etat.urgence ? etat.secondes : null;
  }

  function lettre(position) {
    const n = GAMME[Math.min(position, GAMME.length - 1)];
    note(demiTons(523.25, n), 0, 0.07, 0.045, 'triangle');
  }

  function reussite(info) {
    const palier = info && info.palier ? info.palier : 0;
    const nouveauPalier = !!(info && info.nouveauPalier);
    eclat = nouveauPalier ? 1.6 : 1;
    const nombre = (nouveauPalier ? 26 : 12) + palier * 4;
    if (canvas) for (let i = 0; i < nombre; i++) creerEtincelle(nouveauPalier ? 1.3 : 1);
    // Arpège montant, transposé selon le palier.
    const base = demiTons(659.25, palier * 2);
    note(base, 0, 0.14, 0.05, 'sine');
    note(demiTons(base, 4), 0.06, 0.14, 0.05, 'sine');
    note(demiTons(base, 7), 0.12, 0.2, 0.05, 'sine');
    if (nouveauPalier) note(demiTons(base, 12), 0.2, 0.32, 0.045, 'triangle');
  }

  function erreur(info) {
    const avant = info && typeof info.ancienRatio === 'number' ? info.ancienRatio : ratioAffiche;
    const apres = info && typeof info.nouveauRatio === 'number' ? info.nouveauRatio : etat.ratio;
    eclat = 0;
    if (canvas) {
      // Les flammes s'éteignent en fumée.
      const tete = MARGE + longueurBarre() * apres;
      particules = particules.filter(p => p.type !== 'flamme' && p.type !== 'etincelle');
      for (let i = 0; i < 8; i++) creerFumee(Math.max(0, tete - hasard(0, 50)));
      // Le morceau de barre perdu se détache et tombe.
      const largeurMorceau = longueurBarre() * Math.max(0, avant - apres);
      if (largeurMorceau > 1) {
        ajouter({
          type: 'morceau', x: tete, y: barreY(), vx: hasard(10, 30), vy: -20,
          vie: 0.6, vieMax: 0.6, largeurMorceau: largeurMorceau,
          rotation: 0, vitesseRotation: hasard(0.6, 1.4), phase: 0, frequence: 0, age: 0
        });
      }
      ratioAffiche = apres;
    }
    note(160, 0, 0.24, 0.05, 'square', 70);
  }

  // SPEC 94 : sons des corrections d'exercice. Trois événements distincts :
  //   success      : trois notes douces qui montent ;
  //   retry        : deux notes qui descendent (on peut encore réessayer) ;
  //   finalFailure : trois notes plus graves qui descendent (correction montrée).
  // Léger renforcement des seuls sons de verdict (+18 % en amplitude, ≈ +1,4 dB).
  // Ne change ni les sons du mode Survie ni la prononciation LOD.
  const GAIN_VERDICT_EXERCICE = 1.18;
  function noteVerdict(frequence, decalage, duree, volume) {
    note(frequence, decalage, duree, volume * GAIN_VERDICT_EXERCICE, 'sine');
  }

  function feedback(evenement) {
    if (evenement === 'success') {
      noteVerdict(587.33, 0, 0.1, 0.045);
      noteVerdict(739.99, 0.08, 0.1, 0.045);
      noteVerdict(880, 0.16, 0.14, 0.04);
    } else if (evenement === 'retry') {
      noteVerdict(493.88, 0, 0.09, 0.04);
      noteVerdict(415.3, 0.09, 0.12, 0.04);
    } else if (evenement === 'finalFailure') {
      noteVerdict(329.63, 0, 0.11, 0.045);
      noteVerdict(277.18, 0.1, 0.11, 0.045);
      noteVerdict(220, 0.2, 0.15, 0.045);
    }
  }

  // Ancien nom (lot 1) : juste → success, faux → finalFailure.
  function verdict(ok) {
    feedback(ok ? 'success' : 'finalFailure');
  }

  // Extinction unique : plus de flammes générées, les dernières braises meurent
  // naturellement et une très courte nappe de fumée reste visible sous le rideau.
  function fin() {
    if(extinction)return;
    extinction=true;
    aCreerFlammes=0;
    aCreerBraises=0;
    eclat=0;
    if(canvas && !mouvementReduit()){
      for(let i=0;i<10;i++)creerFumee(MARGE+hasard(0,longueurBarre()));
    }
    note(196,0,0.22,0.038,'sine',98);
  }

  function arreter() {
    extinction=false;
    if (boucle !== null && typeof window !== 'undefined') window.cancelAnimationFrame(boucle);
    boucle = null;
    dernierTemps = null;
    particules = [];
    aCreerFlammes = 0;
    aCreerBraises = 0;
    eclat = 0;
    derniereSeconde = null;
    if (ctx && largeur) ctx.clearRect(0, 0, largeur, hauteur);
    canvas = null;
    ctx = null;
  }

  if (typeof window !== 'undefined' && window.addEventListener) {
    window.addEventListener('resize', mesurer);
  }

  return {
    attacher: attacher,
    etat: changerEtat,
    lettre: lettre,
    reussite: reussite,
    erreur: erreur,
    verdict: verdict,
    feedback: feedback,
    fin: fin,
    arreter: arreter,
    sonActif: sonActif,
    basculerSon: basculerSon,
    nombreParticules: function () { return particules.length; },
    enCours: function () { return boucle !== null; }
  };
})();
