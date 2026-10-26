/* SPEC 96 — Lux Runner : rendu Canvas 2D pseudo-3D (V1.1).
   Ce fichier ne contient AUCUNE règle du jeu : il dessine l'état de la partie
   (runner.js) à chaque image. Les décors coûteux (ciel, ville) sont dessinés
   une seule fois par taille d'écran, puis recopiés avec un décalage (parallaxe).

   Repères :
   - profondeur d : 1 = horizon, 0 = ligne du coureur, < 0 = derrière la caméra ;
   - un trio de portails apparaît à la profondeur RUNNER_PROFONDEUR et avance
     à vitesse constante jusqu'à 0 pendant son temps d'approche ;
   - les trios suivants sont dessinés derrière, espacés de RUNNER_PROFONDEUR :
     on voit toujours une succession d'obstacles, jamais un vide. */
'use strict';

const RUNNER_PERSPECTIVE = 3;
const RUNNER_PENTE_SOUS = 4;     // prolonge la perspective sous la ligne du coureur
const RUNNER_PASSAGE = 0.3;      // durée (s) du trio franchi qui passe sous la caméra

// ─── Perspective ────────────────────────────────────────────────────────────

// s = 1 sur la ligne du coureur, 0 à l'horizon.
function runnerEchelle(d) {
  const brut = 1 / (1 + d * RUNNER_PERSPECTIVE);
  const loin = 1 / (1 + RUNNER_PERSPECTIVE);
  return (brut - loin) / (1 - loin);
}

function runnerGeometrie(a) {
  const W = a.largeur, H = a.hauteur;
  return {
    W: W, H: H, cx: W / 2,
    horizon: H * 0.24,
    ligne: H * 0.82,                       // ligne des portails = position du coureur
    demiLoin: W * 0.03,
    demiPres: Math.min(W * 0.5, H * 0.6)
  };
}
function runnerPointDepuisEchelle(geo, s) {
  return {
    s: s,
    y: geo.horizon + (geo.ligne - geo.horizon) * s,
    demi: geo.demiLoin + (geo.demiPres - geo.demiLoin) * s
  };
}
function runnerPointZ(geo, d) {
  if (d >= 0) return runnerPointDepuisEchelle(geo, runnerEchelle(Math.min(1, d)));
  return runnerPointDepuisEchelle(geo, 1 - d * RUNNER_PENTE_SOUS);
}
// Profondeur (négative) qui correspond au bas de l'écran.
function runnerProfondeurBas(geo) {
  const s = (geo.H - geo.horizon) / (geo.ligne - geo.horizon);
  return (1 - s) / RUNNER_PENTE_SOUS;
}
function runnerVoieX(geo, pt, voie) {
  return geo.cx + (voie - 1) * (2 / 3) * pt.demi;
}

// ─── Préparation (une fois par taille d'écran) ──────────────────────────────

function runnerRedimensionner() {
  const p = runnerPartie;
  if (!p || !p.affichage.canvas) return;
  const a = p.affichage;
  const rect = a.canvas.getBoundingClientRect();
  a.ratio = Math.min(2, window.devicePixelRatio || 1);
  a.largeur = Math.max(1, rect.width);
  a.hauteur = Math.max(1, rect.height);
  a.canvas.width = Math.round(a.largeur * a.ratio);
  a.canvas.height = Math.round(a.hauteur * a.ratio);
  const geo = runnerGeometrie(a);
  a.fond = runnerDessinerFond(geo, a.ratio);
  a.villeProche = runnerDessinerVille(geo.W * 1.25, geo.horizon * 0.62, a.ratio, 31, ['#100e0b', '#14120e'], 0.12);
  a.degradeRoute = null; // recréé au prochain dessin (dépend de la taille)
}

function runnerCanvasHorsEcran(largeur, hauteur, ratio) {
  if (typeof document === 'undefined' || !document.createElement) return null;
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(largeur * ratio));
  c.height = Math.max(1, Math.round(hauteur * ratio));
  const g = c.getContext('2d');
  if (!g) return null;
  g.scale(ratio, ratio);
  return { c: c, g: g };
}

// Ciel, étoiles et ville lointaine : un seul dessin, recopié à chaque image.
function runnerDessinerFond(geo, ratio) {
  const largeur = geo.W * 1.2;
  const hc = runnerCanvasHorsEcran(largeur, geo.horizon + 2, ratio);
  if (!hc) return null;
  const g = hc.g;
  const ciel = g.createLinearGradient(0, 0, 0, geo.horizon);
  ciel.addColorStop(0, '#0c0b0f'); ciel.addColorStop(0.65, '#17131a'); ciel.addColorStop(1, '#2b2116');
  g.fillStyle = ciel; g.fillRect(0, 0, largeur, geo.horizon + 2);
  let graine = 3;
  const hasard = () => { graine = (graine * 9301 + 49297) % 233280; return graine / 233280; };
  for (let i = 0; i < 40; i++) {
    g.fillStyle = 'rgba(246,241,233,' + (0.15 + hasard() * 0.45).toFixed(2) + ')';
    g.fillRect(hasard() * largeur, hasard() * geo.horizon * 0.6, 1.2, 1.2);
  }
  const halo = g.createRadialGradient(largeur / 2, geo.horizon, 0, largeur / 2, geo.horizon, largeur * 0.55);
  halo.addColorStop(0, 'rgba(245,207,77,0.22)'); halo.addColorStop(1, 'rgba(245,207,77,0)');
  g.fillStyle = halo; g.fillRect(0, 0, largeur, geo.horizon + 2);
  const ville = runnerDessinerVille(largeur, geo.horizon * 0.45, ratio, 7, ['#1d1914', '#221d17'], 0.24);
  if (ville) g.drawImage(ville, 0, geo.horizon - geo.horizon * 0.45 + 1, largeur, geo.horizon * 0.45);
  return hc.c;
}

// Silhouettes de ville (tours, flèches d'église, fenêtres chaudes).
function runnerDessinerVille(largeur, hauteur, ratio, graineDepart, teintes, densiteFenetres) {
  const hc = runnerCanvasHorsEcran(largeur, hauteur, ratio);
  if (!hc) return null;
  const g = hc.g;
  let graine = graineDepart;
  const hasard = () => { graine = (graine * 9301 + 49297) % 233280; return graine / 233280; };
  let x = 0;
  while (x < largeur) {
    const l = 16 + hasard() * 34;
    const h = hauteur * (0.3 + hasard() * 0.62);
    g.fillStyle = teintes[hasard() < 0.5 ? 0 : 1];
    g.fillRect(x, hauteur - h, l, h);
    if (hasard() < 0.16) {
      g.beginPath();
      g.moveTo(x + l / 2 - 5, hauteur - h);
      g.lineTo(x + l / 2, hauteur - h - 14 - hasard() * 14);
      g.lineTo(x + l / 2 + 5, hauteur - h);
      g.fill();
    }
    for (let fy = hauteur - h + 5; fy < hauteur - 4; fy += 7) {
      for (let fx = x + 3; fx < x + l - 4; fx += 6) {
        if (hasard() < densiteFenetres) {
          g.fillStyle = 'rgba(245,207,77,' + (0.25 + hasard() * 0.5).toFixed(2) + ')';
          g.fillRect(fx, fy, 2, 3);
        }
      }
    }
    x += l + hasard() * 4;
  }
  return hc.c;
}

// ─── Effets (particules, éclats, secousse) ──────────────────────────────────

function runnerEffetCollision(r) {
  const p = runnerPartie;
  if (!p) return;
  const a = p.affichage;
  const reduit = runnerMouvementReduit();
  const voieBonne = RUNNER_VOIES.indexOf(r.mot.gender);
  const couleur = RUNNER_GENRES[r.mot.gender].couleur;
  a.passe = { debut: r.temps, duree: r.duree, bonne: voieBonne, ok: r.statut === 'correct' };
  if (r.statut === 'correct') {
    const geo = runnerGeometrie(a);
    const pt = runnerPointZ(geo, 0);
    const x = runnerVoieX(geo, pt, voieBonne);
    const combo = r.serie >= 3;
    const nombre = reduit ? 6 : (combo ? 34 : 22);
    for (let i = 0; i < nombre; i++) {
      const angle = Math.random() * Math.PI * 2;
      const vitesse = 70 + Math.random() * (combo ? 200 : 140);
      a.particules.push({ x: x, y: geo.ligne - pt.demi * 0.55, vx: Math.cos(angle) * vitesse,
        vy: Math.sin(angle) * vitesse - 70, vie: 0.65, age: 0,
        couleur: combo && i % 3 === 0 ? '#f5cf4d' : couleur, taille: 2 + Math.random() * 2.5 });
    }
    a.eclat = { voie: voieBonne, age: 0, couleur: couleur };
    a.onde = reduit ? null : { x: x, y: geo.ligne - pt.demi * 0.45, age: 0, couleur: couleur };
  } else {
    if (!reduit) a.secousse = 0.45;
    // Le bon portail est indiqué : sa voie s'éclaire brièvement.
    a.eclat = { voie: voieBonne, age: 0, couleur: couleur, correction: true };
  }
}

function runnerMettreAJourEffets(p, dt) {
  const a = p.affichage;
  a.horloge += dt;
  // Le coureur glisse vers sa voie ; il ne revient JAMAIS seul au centre.
  const cible = p.voie ? RUNNER_VOIES.indexOf(p.voie) : 1;
  const avant = a.voieX;
  a.voieX += (cible - a.voieX) * (runnerMouvementReduit() ? 1 : Math.min(1, dt * 12));
  // Inclinaison dans le sens du déplacement, amortie.
  const deplacement = dt > 0 ? (a.voieX - avant) / dt : 0;
  a.inclinaison += (Math.max(-0.35, Math.min(0.35, deplacement * 0.06)) - a.inclinaison) * Math.min(1, dt * 10);
  if (a.secousse > 0) a.secousse = Math.max(0, a.secousse - dt);
  if (a.eclat) { a.eclat.age += dt; if (a.eclat.age > 0.7) a.eclat = null; }
  if (a.onde) { a.onde.age += dt; if (a.onde.age > 0.45) a.onde = null; }
  a.particules = a.particules.filter(q => {
    q.age += dt;
    q.x += q.vx * dt; q.y += q.vy * dt; q.vy += 280 * dt;
    return q.age < q.vie;
  });
  // Traînées de vitesse sur les côtés : plus nombreuses quand la course accélère.
  if (!runnerMouvementReduit() && p.etat === 'course' && p.portail && dt > 0) {
    const vitesse = RUNNER_PROFONDEUR / p.portail.duree; // profondeur par seconde
    a.creerTrainee += dt * vitesse * 40;
    while (a.creerTrainee >= 1 && a.trainees.length < 14) {
      a.creerTrainee -= 1;
      a.trainees.push({ cote: Math.random() < 0.5 ? -1 : 1, d: 0.5 + Math.random() * 0.4, ecart: 1.05 + Math.random() * 0.5 });
    }
    a.creerTrainee = Math.min(a.creerTrainee, 1);
  }
  const avance = p.portail && p.etat === 'course' ? dt * RUNNER_PROFONDEUR / p.portail.duree : 0;
  a.trainees = a.trainees.filter(t => { t.d -= avance * 1.6; return t.d > -0.15; });
}

// ─── Dessin d'une image ─────────────────────────────────────────────────────

function runnerDessiner(p) {
  const a = p.affichage;
  const g = a.ctx;
  if (!g || !a.largeur) return;
  const geo = runnerGeometrie(a);
  g.setTransform(a.ratio, 0, 0, a.ratio, 0, 0);
  g.globalAlpha = 1;

  // 1. Ciel et ville lointaine (parallaxe faible), ville proche (parallaxe forte).
  if (a.fond) {
    const l = a.fond.width / a.ratio, h = a.fond.height / a.ratio;
    g.drawImage(a.fond, -geo.W * 0.1 - (a.voieX - 1) * geo.W * 0.015, 0, l, h);
  } else {
    g.fillStyle = '#14110f'; g.fillRect(0, 0, geo.W, geo.horizon);
  }
  if (a.villeProche) {
    const l = a.villeProche.width / a.ratio, h = a.villeProche.height / a.ratio;
    g.drawImage(a.villeProche, -geo.W * 0.125 - (a.voieX - 1) * geo.W * 0.045, geo.horizon - h + 1, l, h);
  }

  // 2. Sol et route.
  g.fillStyle = '#0a0907'; g.fillRect(0, geo.horizon, geo.W, geo.H - geo.horizon);
  const haut = runnerPointZ(geo, 1);
  const dBas = runnerProfondeurBas(geo);
  const bas = runnerPointZ(geo, dBas);
  if (!a.degradeRoute) {
    a.degradeRoute = g.createLinearGradient(0, geo.horizon, 0, geo.H);
    a.degradeRoute.addColorStop(0, '#15130f'); a.degradeRoute.addColorStop(1, '#2a2620');
  }
  g.fillStyle = a.degradeRoute;
  g.beginPath();
  g.moveTo(geo.cx - haut.demi, haut.y); g.lineTo(geo.cx + haut.demi, haut.y);
  g.lineTo(geo.cx + bas.demi, bas.y); g.lineTo(geo.cx - bas.demi, bas.y); g.closePath(); g.fill();
  // Voie occupée et éclat (bonne voie après une collision).
  if (p.voie) runnerDessinerVoie(g, geo, RUNNER_VOIES.indexOf(p.voie), RUNNER_GENRES[p.voie].couleur, 0.12);
  if (a.eclat) runnerDessinerVoie(g, geo, a.eclat.voie, a.eclat.couleur, (a.eclat.correction ? 0.34 : 0.24) * (1 - a.eclat.age / 0.7));
  // Bords lumineux (double trait : halo + ligne).
  for (const [largeur, couleur] of [[6, 'rgba(245,207,77,0.12)'], [2, 'rgba(245,207,77,0.55)']]) {
    g.strokeStyle = couleur; g.lineWidth = largeur;
    g.beginPath(); g.moveTo(geo.cx - haut.demi, haut.y); g.lineTo(geo.cx - bas.demi, bas.y);
    g.moveTo(geo.cx + haut.demi, haut.y); g.lineTo(geo.cx + bas.demi, bas.y); g.stroke();
  }
  runnerDessinerMarquages(g, geo, p.distance, dBas);
  runnerDessinerLampadaires(g, geo, p.distance, dBas);
  runnerDessinerTrainees(g, geo, a);

  // 3. Portails, du plus lointain au plus proche (le plus proche recouvre).
  runnerDessinerPortails(g, geo, p);

  // 4. Coureur, onde de traversée et particules.
  runnerDessinerCoureur(g, geo, p);
  if (a.onde) {
    const t = a.onde.age / 0.45;
    g.globalAlpha = 0.7 * (1 - t);
    g.strokeStyle = a.onde.couleur; g.lineWidth = 3;
    g.beginPath(); g.ellipse(a.onde.x, a.onde.y, 20 + t * 70, 10 + t * 32, 0, 0, Math.PI * 2); g.stroke();
  }
  a.particules.forEach(q => {
    g.globalAlpha = Math.max(0, 1 - q.age / q.vie);
    g.fillStyle = q.couleur;
    g.fillRect(q.x - q.taille / 2, q.y - q.taille / 2, q.taille, q.taille);
  });
  g.globalAlpha = 1;
}

function runnerDessinerVoie(g, geo, voie, couleur, alpha) {
  if (alpha <= 0) return;
  const haut = runnerPointZ(geo, 1), bas = runnerPointZ(geo, runnerProfondeurBas(geo));
  const bord = (pt, cote) => geo.cx + ((voie - 1) * 2 / 3 + cote / 3) * pt.demi;
  g.globalAlpha = alpha;
  g.fillStyle = couleur;
  g.beginPath();
  g.moveTo(bord(haut, -1), haut.y); g.lineTo(bord(haut, 1), haut.y);
  g.lineTo(bord(bas, 1), bas.y); g.lineTo(bord(bas, -1), bas.y); g.closePath(); g.fill();
  g.globalAlpha = 1;
}

// Pointillés entre les voies, au rythme exact de l'approche des portails.
function runnerDessinerMarquages(g, geo, distance, dBas) {
  const pas = 0.08, longueur = 0.04;
  const decalage = ((distance % pas) + pas) % pas;
  g.fillStyle = 'rgba(246,241,233,0.38)';
  for (let z = 1 + pas - decalage; z > dBas - pas; z -= pas) {
    const z1 = Math.min(1, z), z2 = Math.max(dBas, z - longueur);
    if (z2 >= z1) continue;
    const loin = runnerPointZ(geo, z1), pres = runnerPointZ(geo, z2);
    for (const cote of [-1, 1]) {
      const x1 = geo.cx + cote / 3 * loin.demi, x2 = geo.cx + cote / 3 * pres.demi;
      const e1 = Math.max(0.4, 2.4 * loin.s), e2 = Math.max(0.4, 2.4 * pres.s);
      g.beginPath();
      g.moveTo(x1 - e1, loin.y); g.lineTo(x1 + e1, loin.y);
      g.lineTo(x2 + e2, pres.y); g.lineTo(x2 - e2, pres.y); g.closePath(); g.fill();
    }
  }
}

// Lampadaires de chaque côté : ils défilent et donnent la sensation de vitesse.
function runnerDessinerLampadaires(g, geo, distance, dBas) {
  const pas = 0.2;
  const decalage = ((distance % pas) + pas) % pas;
  for (let z = 1 - decalage; z > dBas; z -= pas) {
    const pt = runnerPointZ(geo, z);
    const alpha = Math.min(1, (1 - z) * 3);
    if (alpha <= 0) continue;
    const hauteur = pt.demi * 0.9;
    for (const cote of [-1, 1]) {
      const x = geo.cx + cote * pt.demi * 1.12;
      g.globalAlpha = alpha;
      g.strokeStyle = '#3a342b'; g.lineWidth = Math.max(1, 2.5 * pt.s);
      g.beginPath(); g.moveTo(x, pt.y); g.lineTo(x, pt.y - hauteur);
      g.lineTo(x - cote * pt.demi * 0.12, pt.y - hauteur); g.stroke();
      // Lumière chaude et reflet au sol.
      g.fillStyle = 'rgba(245,207,77,0.9)';
      g.beginPath(); g.arc(x - cote * pt.demi * 0.12, pt.y - hauteur, Math.max(1.2, 3.5 * pt.s), 0, Math.PI * 2); g.fill();
      g.globalAlpha = alpha * 0.1;
      g.beginPath(); g.ellipse(x - cote * pt.demi * 0.18, pt.y, pt.demi * 0.25, pt.demi * 0.05, 0, 0, Math.PI * 2); g.fill();
    }
  }
  g.globalAlpha = 1;
}

function runnerDessinerTrainees(g, geo, a) {
  if (!a.trainees.length) return;
  g.strokeStyle = 'rgba(246,241,233,0.16)';
  g.lineWidth = 1.2;
  g.beginPath();
  a.trainees.forEach(t => {
    const p1 = runnerPointZ(geo, t.d), p2 = runnerPointZ(geo, t.d - 0.07);
    g.moveTo(geo.cx + t.cote * p1.demi * t.ecart, p1.y - p1.demi * 0.3);
    g.lineTo(geo.cx + t.cote * p2.demi * t.ecart, p2.y - p2.demi * 0.3);
  });
  g.stroke();
}

// Le trio en cours, les trios suivants (derrière) et le trio franchi.
function runnerDessinerPortails(g, geo, p) {
  const a = p.affichage;
  const portail = p.portail;
  if (portail) {
    const progres = Math.min(1, Math.max(0, (p.temps - portail.debut) / portail.duree));
    const d = RUNNER_PROFONDEUR * (1 - progres);
    // Suivants : mêmes règles de lancement que le jeu (arche d'arrivée comprise).
    const suivants = runnerPortailsSuivants(p, portail);
    for (let k = suivants.length; k >= 1; k--) {
      const dk = d + k * RUNNER_PROFONDEUR;
      if (dk > 1) continue;
      const alpha = Math.min(1, (1 - dk) / 0.18) * 0.85;
      if (suivants[k - 1] === 'arrivee') runnerDessinerArrivee(g, geo, dk, alpha);
      else runnerDessinerTrio(g, geo, dk, alpha, null);
    }
    if (portail.arrivee) runnerDessinerArrivee(g, geo, d, 1);
    else runnerDessinerTrio(g, geo, d, 1, null);
  }
  if (a.passe) {
    const age = p.temps - a.passe.debut;
    if (age >= 0 && age < RUNNER_PASSAGE) {
      runnerDessinerTrio(g, geo, -age * RUNNER_PROFONDEUR / a.passe.duree, 1 - age / RUNNER_PASSAGE, a.passe);
    } else if (age >= RUNNER_PASSAGE) a.passe = null;
  }
}

// Ce qui suit le portail en cours : 'trio' ou 'arrivee' (2 au maximum).
function runnerPortailsSuivants(p, portail) {
  const liste = [];
  if (portail.arrivee) return liste;
  if (p.mode === 'tuto' && p.rencontres + 1 >= RUNNER_TUTO_MOTS) return liste;
  let debut = portail.debut + portail.duree;
  for (let k = 0; k < 2; k++) {
    const duree = runnerApproche(p.mode, debut);
    if (p.mode === 'sprint' && debut + duree > RUNNER_DUREE_SPRINT) {
      if (debut < RUNNER_DUREE_SPRINT) liste.push('arrivee');
      break;
    }
    liste.push('trio');
    debut += duree;
  }
  return liste;
}

// Trois arches à la profondeur d. passe = trio franchi (bonne voie en évidence).
function runnerDessinerTrio(g, geo, d, opacite, passe) {
  const pt = runnerPointZ(geo, d);
  const arriere = runnerPointZ(geo, d + 0.025); // épaisseur des arches
  const largeurVoie = (2 / 3) * pt.demi;
  RUNNER_VOIES.forEach((genre, voie) => {
    const info = RUNNER_GENRES[genre];
    let alpha = opacite;
    if (passe) alpha *= voie === passe.bonne ? 1 : 0.3;
    if (alpha <= 0.01) return;
    const x = runnerVoieX(geo, pt, voie);
    const l = largeurVoie * 0.86, h = largeurVoie * 1.3;
    const pilier = Math.max(2, l * 0.11);
    const base = pt.y, sommet = base - h;
    const bandeau = Math.max(6, h * 0.28);
    // Flaque de lumière sur la route.
    g.globalAlpha = alpha * 0.22;
    g.fillStyle = info.couleur;
    g.beginPath(); g.ellipse(x, base, l * 0.62, Math.max(2, l * 0.13), 0, 0, Math.PI * 2); g.fill();
    // Face arrière, plus sombre : donne l'épaisseur.
    const xa = runnerVoieX(geo, arriere, voie);
    const la = (2 / 3) * arriere.demi * 0.86, ha = (2 / 3) * arriere.demi * 1.3;
    g.globalAlpha = alpha * 0.55;
    g.fillStyle = '#0f0e0c';
    g.fillRect(xa - la / 2, arriere.y - ha, la, Math.max(4, ha * 0.28));
    g.fillRect(xa - la / 2, arriere.y - ha, Math.max(2, la * 0.11), ha);
    g.fillRect(xa + la / 2 - Math.max(2, la * 0.11), arriere.y - ha, Math.max(2, la * 0.11), ha);
    // Voile lumineux dans l'arche.
    g.globalAlpha = alpha * (passe ? 0.08 : 0.16);
    g.fillStyle = info.couleur;
    g.fillRect(x - l / 2, sommet, l, h);
    // Halo (trait large et transparent) puis arche pleine.
    g.globalAlpha = alpha * 0.28;
    g.strokeStyle = info.couleur; g.lineWidth = Math.max(2, pilier * 0.9);
    g.strokeRect(x - l / 2, sommet, l, h);
    g.globalAlpha = alpha;
    g.fillStyle = info.couleur;
    g.fillRect(x - l / 2, sommet, pilier, h);
    g.fillRect(x + l / 2 - pilier, sommet, pilier, h);
    g.fillRect(x - l / 2, sommet, l, bandeau);
    // Reflet clair sur l'arête intérieure.
    g.globalAlpha = alpha * 0.45;
    g.fillStyle = '#ffffff';
    g.fillRect(x - l / 2 + pilier - Math.max(1, pilier * 0.2), sommet + bandeau, Math.max(1, pilier * 0.2), h - bandeau);
    // Lettre (toujours) et nom (si la place le permet) : jamais la couleur seule.
    g.globalAlpha = alpha;
    g.fillStyle = '#0f0e0c';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    const taille = Math.max(7, Math.round(bandeau * 0.72));
    g.font = '800 ' + taille + 'px Inter, system-ui, sans-serif';
    const texte = l > taille * 5 ? info.lettre + ' · ' + info.nom.toUpperCase() : info.lettre;
    g.fillText(texte, x, sommet + bandeau / 2 + 1);
    if (passe && voie === passe.bonne && !passe.ok) { // correction : contour blanc
      g.strokeStyle = '#f6f1e9'; g.lineWidth = 2;
      g.strokeRect(x - l / 2 - 3, sommet - 3, l + 6, h + 6);
    }
  });
  g.globalAlpha = 1;
}

function runnerDessinerArrivee(g, geo, d, opacite) {
  const pt = runnerPointZ(geo, d);
  const l = pt.demi * 2 * 0.98, h = pt.demi * 0.95;
  const x = geo.cx - l / 2, sommet = pt.y - h;
  const pilier = Math.max(2, l * 0.03);
  g.globalAlpha = opacite;
  g.fillStyle = '#f5cf4d';
  g.fillRect(x, sommet, pilier, h);
  g.fillRect(x + l - pilier, sommet, pilier, h);
  const bandeau = Math.max(4, h * 0.2);
  const cases = 16, c = l / cases;
  for (let i = 0; i < cases; i++) { // damier d'arrivée
    g.fillStyle = i % 2 ? '#f5cf4d' : '#0f0e0c';
    g.fillRect(x + i * c, sommet, c, bandeau / 2);
    g.fillStyle = i % 2 ? '#0f0e0c' : '#f5cf4d';
    g.fillRect(x + i * c, sommet + bandeau / 2, c, bandeau / 2);
  }
  if (bandeau > 10) {
    g.fillStyle = '#f5cf4d';
    g.textAlign = 'center'; g.textBaseline = 'bottom';
    g.font = '800 ' + Math.round(bandeau * 0.8) + 'px Inter, system-ui, sans-serif';
    g.fillText('ARRIVÉE', geo.cx, sommet - 4);
  }
  g.globalAlpha = 1;
}

// ─── Coureur ────────────────────────────────────────────────────────────────

// Segment arrondi (membre) entre deux points.
function runnerMembre(g, x1, y1, x2, y2, epaisseur, couleur) {
  g.strokeStyle = couleur; g.lineWidth = epaisseur; g.lineCap = 'round';
  g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
}

// Coureur vu de dos : cycle de course (genoux, coudes), inclinaison latérale,
// recul sur un choc, bras levés à l'arrivée.
function runnerDessinerCoureur(g, geo, p) {
  const a = p.affichage;
  const pt = runnerPointZ(geo, 0);
  const t = Math.min(78, geo.H * 0.17);
  let x = geo.cx + (a.voieX - 1) * (2 / 3) * pt.demi;
  const victoire = p.etat === 'fin' && p.victoire && p.mode === 'sprint';
  const choc = a.secousse > 0 ? a.secousse / 0.45 : 0;
  const phase = p.temps * 14;
  const court = p.etat !== 'pause' && !victoire;
  const rebond = victoire ? t * 0.16 * Math.abs(Math.sin(a.horloge * 6)) : (court ? Math.abs(Math.sin(phase)) * t * 0.05 : 0);
  if (choc) x += Math.sin(choc * 40) * 6 * choc;
  const pied = geo.ligne + t * 0.06;

  // Ombre.
  g.fillStyle = 'rgba(0,0,0,0.5)';
  g.beginPath(); g.ellipse(x, pied, t * 0.26, t * 0.06, 0, 0, Math.PI * 2); g.fill();

  g.save();
  g.translate(x, pied - rebond);
  g.rotate(a.inclinaison + (choc ? -0.22 * choc * (a.voieX >= 1 ? 1 : -1) : 0));

  const peau = '#e3c9a8', maillot = '#f6f1e9', short = '#2d2740', chaussure = '#f5cf4d';
  // Jambes : la jambe levée se plie (genou plus haut, pied remonté).
  for (const cote of [-1, 1]) {
    const leve = court ? Math.max(0, Math.sin(phase + (cote > 0 ? Math.PI : 0))) : 0;
    const hanche = { x: cote * t * 0.07, y: -t * 0.42 };
    const genou = { x: cote * t * 0.09, y: -t * 0.22 - leve * t * 0.1 };
    const piedY = -t * 0.02 - leve * t * 0.16;
    runnerMembre(g, hanche.x, hanche.y, genou.x, genou.y, t * 0.1, peau);
    runnerMembre(g, genou.x, genou.y, cote * t * 0.08, piedY, t * 0.085, peau);
    g.fillStyle = chaussure;
    g.beginPath(); g.ellipse(cote * t * 0.08, piedY + t * 0.01, t * 0.05, t * 0.035, 0, 0, Math.PI * 2); g.fill();
  }
  // Short.
  g.fillStyle = short;
  g.beginPath();
  g.moveTo(-t * 0.14, -t * 0.52); g.lineTo(t * 0.14, -t * 0.52);
  g.lineTo(t * 0.15, -t * 0.38); g.lineTo(-t * 0.15, -t * 0.38); g.closePath(); g.fill();
  // Bras : balancier (coudes pliés), ouverts sur un choc, levés à l'arrivée.
  for (const cote of [-1, 1]) {
    const balance = court ? Math.sin(phase + (cote > 0 ? 0 : Math.PI)) : 0;
    const epaule = { x: cote * t * 0.15, y: -t * 0.74 };
    let coude, main;
    if (victoire) {
      coude = { x: cote * t * 0.24, y: -t * 0.92 };
      main = { x: cote * t * 0.22, y: -t * 1.1 };
    } else if (choc) {
      coude = { x: cote * t * 0.3, y: -t * 0.7 };
      main = { x: cote * t * 0.4, y: -t * 0.8 };
    } else {
      coude = { x: cote * t * 0.22, y: -t * 0.6 - balance * t * 0.06 };
      main = { x: cote * t * 0.17, y: -t * 0.5 - balance * t * 0.12 };
    }
    runnerMembre(g, epaule.x, epaule.y, coude.x, coude.y, t * 0.075, maillot);
    runnerMembre(g, coude.x, coude.y, main.x, main.y, t * 0.065, peau);
  }
  // Torse (maillot) avec bande or et numéro discret.
  g.fillStyle = maillot;
  g.beginPath();
  g.moveTo(-t * 0.16, -t * 0.78); g.lineTo(t * 0.16, -t * 0.78);
  g.lineTo(t * 0.14, -t * 0.5); g.lineTo(-t * 0.14, -t * 0.5); g.closePath(); g.fill();
  g.fillStyle = '#f5cf4d';
  g.fillRect(-t * 0.155, -t * 0.66, t * 0.31, t * 0.05);
  // Cou, oreilles et tête vue de dos (cheveux).
  runnerMembre(g, 0, -t * 0.78, 0, -t * 0.83, t * 0.07, peau);
  g.fillStyle = peau;
  g.beginPath(); g.arc(-t * 0.085, -t * 0.87, t * 0.022, 0, Math.PI * 2); g.arc(t * 0.085, -t * 0.87, t * 0.022, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#2a1d14';
  g.beginPath(); g.arc(0, -t * 0.885, t * 0.088, 0, Math.PI * 2); g.fill();
  g.restore();
}
