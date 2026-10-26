/* SPEC 96 V2 (prototype) — Lux Runner : rendu 3D temps réel avec Three.js.
   Module ES chargé À LA DEMANDE par runner.js (import dynamique), seulement si
   le rendu 3D est activé. Sans lui, ou en cas d'échec, le rendu 2D reste actif.

   Ce fichier ne contient AUCUNE règle du jeu : il lit l'état de la partie
   (temps, portail en cours, voie, résultat) et le met en scène.
   - Monde : la caméra suit le coureur ; c'est la route qui défile vers lui.
   - Un trio de portails part de RUNNER3D_DISTANCE devant le coureur et arrive
     sur lui exactement à la fin de son temps d'approche (même horloge que le jeu).
   - Assets CC0 : personnage Quaternius, route/lampadaires/bâtiments Kenney
     (voir public/runner3d/CREDITS.md). */
import * as THREE from './vendor/three/three.module.min.js';
import { GLTFLoader } from './vendor/three/GLTFLoader.js';

const DISTANCE = 18;          // distance (unités 3D) d'apparition d'un trio
const VOIE = 1.05;            // écart entre deux voies
const LARGEUR_ROUTE = 3.6;
const BOUCLE = 84;            // longueur de décor recyclé (bâtiments, lampadaires)
const COULEURS = { m: 0x6fb0f2, f: 0xf18bbb, n: 0xb18cf0 };
const ORDRE = ['m', 'f', 'n'];
const NOMS = { m: 'MASCULIN', f: 'FÉMININ', n: 'NEUTRE' };

let modelesPromesse = null;   // chargés une seule fois pour toutes les parties

function chargerModeles() {
  if (!modelesPromesse) {
    const loader = new GLTFLoader();
    modelesPromesse = Promise.all([
      loader.loadAsync('runner3d/coureur.glb?v=2'),
      loader.loadAsync('runner3d/ville.glb?v=2')
    ]).then(([coureur, ville]) => {
      const pieces = {};
      ville.scene.children.forEach(c => { pieces[c.name.replace(/\d+$/, '')] = c; });
      // Géométries partagées entre les parties : ne jamais les libérer.
      [coureur.scene, ville.scene].forEach(s => s.traverse(o => { if (o.isMesh) o.userData.partage = true; }));
      return { coureur, pieces };
    });
    modelesPromesse.catch(() => { modelesPromesse = null; }); // nouvel essai possible
  }
  return modelesPromesse;
}

// Les modèles Kenney sont métalliques par défaut (rendu noir sans reflets) :
// matériau mat, léger auto-éclairage pour rester lisibles de nuit.
function materiauMat(m, eclairage, teinte) {
  const nouveau = new THREE.MeshLambertMaterial({ color: m.color ? m.color.clone() : 0xffffff, map: m.map || null });
  if (teinte) nouveau.color.multiply(new THREE.Color(teinte)); // façades assombries pour la nuit
  // Auto-éclairage dans la couleur propre du matériau (et non en blanc).
  if (eclairage) { nouveau.emissive = nouveau.color.clone(); nouveau.emissiveMap = m.map || null; nouveau.emissiveIntensity = eclairage; }
  return nouveau;
}
function rendreMat(objet, eclairage, teinte) {
  objet.traverse(o => {
    if (!o.isMesh) return;
    o.material = Array.isArray(o.material) ? o.material.map(m => materiauMat(m, eclairage, teinte)) : materiauMat(o.material, eclairage, teinte);
  });
  return objet;
}

// ─── Textures dessinées une fois (Canvas 2D) ─────────────────────────────────

function textureCanvas(largeur, hauteur, dessiner) {
  const c = document.createElement('canvas');
  c.width = largeur; c.height = hauteur;
  dessiner(c.getContext('2d'), largeur, hauteur);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function textureLueur() {
  return textureCanvas(128, 128, (g, w) => {
    const d = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    d.addColorStop(0, 'rgba(255,255,255,1)'); d.addColorStop(0.25, 'rgba(255,255,255,0.45)'); d.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = d; g.fillRect(0, 0, w, w);
  });
}
function textureCiel() {
  return textureCanvas(16, 512, (g, w, h) => {
    const d = g.createLinearGradient(0, 0, 0, h);
    d.addColorStop(0, '#07060c'); d.addColorStop(0.45, '#1b1430'); d.addColorStop(0.62, '#3a2540'); d.addColorStop(0.7, '#5a3a2e'); d.addColorStop(1, '#120e14');
    g.fillStyle = d; g.fillRect(0, 0, w, h);
  });
}
function textureRoute() {
  const t = textureCanvas(256, 512, (g, w, h) => {
    g.fillStyle = '#2b2830'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 1400; i++) { // grain de l'asphalte
      g.fillStyle = 'rgba(255,255,255,' + (Math.random() * 0.05).toFixed(3) + ')';
      g.fillRect(Math.random() * w, Math.random() * h, 2, 2);
    }
    g.fillStyle = 'rgba(246,241,233,0.85)'; // pointillés entre les voies
    for (const x of [w / 3, 2 * w / 3]) g.fillRect(x - 3, 0, 6, h * 0.5);
    g.fillStyle = '#f5cf4d';                  // bords dorés
    g.fillRect(0, 0, 7, h); g.fillRect(w - 7, 0, 7, h);
  });
  t.wrapS = THREE.ClampToEdgeWrapping; t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(1, 18);
  t.anisotropy = 4;
  return t;
}
// Pastille de la lettre (et nom) au sommet d'une arche.
function textureEtiquette(genre) {
  return textureCanvas(256, 256, (g) => {
    const c = '#' + COULEURS[genre].toString(16).padStart(6, '0');
    g.fillStyle = c; g.beginPath(); g.arc(128, 96, 80, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#0f0e0c'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = '800 104px Inter, system-ui, sans-serif'; g.fillText(genre.toUpperCase(), 128, 100);
    g.fillStyle = '#ffffff'; g.font = '800 34px Inter, system-ui, sans-serif';
    g.shadowColor = 'rgba(0,0,0,0.8)'; g.shadowBlur = 8;
    g.fillText(NOMS[genre], 128, 214);
  });
}
function textureArrivee() {
  return textureCanvas(512, 128, (g, w, h) => {
    const c = 32;
    for (let x = 0; x < w / c; x++) for (let y = 0; y < 2; y++) {
      g.fillStyle = (x + y) % 2 ? '#f5cf4d' : '#0f0e0c'; g.fillRect(x * c, h - (y + 1) * c, c, c);
    }
    g.fillStyle = '#f5cf4d'; g.textAlign = 'center'; g.font = '800 54px Inter, system-ui, sans-serif';
    g.fillText('ARRIVÉE', w / 2, 52);
  });
}

// ─── Construction de la scène ────────────────────────────────────────────────

function creerArche(couleur, lueur) {
  const groupe = new THREE.Group();
  const l = 0.94, h = 1.85, r = l / 2;
  // Tracé : montant gauche, demi-cercle, montant droit (points serrés).
  const points = [];
  for (let i = 0; i <= 6; i++) points.push(new THREE.Vector3(-r, (h - r) * i / 6, 0));
  for (let i = 1; i < 16; i++) {
    const a = Math.PI - Math.PI * i / 16;
    points.push(new THREE.Vector3(Math.cos(a) * r, h - r + Math.sin(a) * r, 0));
  }
  for (let i = 6; i >= 0; i--) points.push(new THREE.Vector3(r, (h - r) * i / 6, 0));
  const chemin = new THREE.CatmullRomCurve3(points);
  const coeur = new THREE.Mesh(new THREE.TubeGeometry(chemin, 48, 0.055, 8, false),
    new THREE.MeshBasicMaterial({ color: couleur }));
  const halo = new THREE.Mesh(new THREE.TubeGeometry(chemin, 48, 0.14, 8, false),
    new THREE.MeshBasicMaterial({ color: couleur, transparent: true, opacity: 0.28, blending: THREE.AdditiveBlending, depthWrite: false }));
  // Intérieur translucide : forme de l'arche.
  const forme = new THREE.Shape();
  forme.moveTo(-r, 0); forme.lineTo(-r, h - r); forme.absarc(0, h - r, r, Math.PI, 0, true); forme.lineTo(r, 0); forme.lineTo(-r, 0);
  const voile = new THREE.Mesh(new THREE.ShapeGeometry(forme, 16),
    new THREE.MeshBasicMaterial({ color: couleur, transparent: true, opacity: 0.14, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  // Flaque de lumière au sol.
  const sol = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.0),
    new THREE.MeshBasicMaterial({ map: lueur, color: couleur, transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending, depthWrite: false }));
  sol.rotation.x = -Math.PI / 2; sol.position.y = 0.015;
  groupe.add(sol, voile, halo, coeur);
  groupe.userData = { materiaux: [coeur.material, halo.material, voile.material, sol.material], opacites: [1, 0.28, 0.14, 0.75] };
  return groupe;
}

function creerTrio(lueur, etiquettes) {
  const trio = new THREE.Group();
  ORDRE.forEach((genre, i) => {
    const arche = creerArche(COULEURS[genre], lueur);
    arche.position.x = (i - 1) * VOIE;
    const pastille = new THREE.Mesh(new THREE.PlaneGeometry(0.78, 0.78),
      new THREE.MeshBasicMaterial({ map: etiquettes[genre], transparent: true, depthWrite: false }));
    pastille.position.set(0, 1.38, 0.02);
    arche.add(pastille);
    arche.userData.materiaux.push(pastille.material); arche.userData.opacites.push(1);
    trio.add(arche);
  });
  return trio;
}
function opaciteTrio(trio, alpha, bonne) {
  trio.children.forEach((arche, i) => {
    const a = bonne == null ? alpha : alpha * (i === bonne ? 1 : 0.3);
    arche.userData.materiaux.forEach((m, k) => { m.transparent = true; m.opacity = arche.userData.opacites[k] * a; });
    arche.visible = a > 0.01;
  });
}

function creerArrivee(texture) {
  const g = new THREE.Group();
  const or = new THREE.MeshBasicMaterial({ color: 0xf5cf4d });
  for (const x of [-LARGEUR_ROUTE / 2, LARGEUR_ROUTE / 2]) {
    const pilier = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.2, 0.1), or);
    pilier.position.set(x, 1.1, 0); g.add(pilier);
  }
  const banniere = new THREE.Mesh(new THREE.PlaneGeometry(LARGEUR_ROUTE + 0.1, 0.9),
    new THREE.MeshBasicMaterial({ map: texture, transparent: true }));
  banniere.position.set(0, 2.25, 0); g.add(banniere);
  return g;
}

// ─── Instance de rendu attachée à la scène HTML du jeu ───────────────────────

function creer(conteneur) {
  const canvas = document.createElement('canvas');
  canvas.className = 'runner-canvas-3d';
  canvas.setAttribute('aria-hidden', 'true');
  conteneur.insertBefore(canvas, conteneur.firstChild);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  } catch (e) {
    canvas.remove();
    return Promise.reject(e);
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x1d1528, 16, 52);
  const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 140);
  camera.position.set(0, 2.55, 4.4);
  camera.lookAt(0, 0.35, -8);

  // Lumières : ciel violet, sol sombre, lune froide de côté, lumière chaude
  // venant de la caméra pour éclairer le dos du coureur.
  scene.add(new THREE.HemisphereLight(0x9b8cff, 0x241a2a, 1.25));
  const lune = new THREE.DirectionalLight(0xb9c4ff, 0.9); lune.position.set(-6, 9, -4); scene.add(lune);
  const face = new THREE.DirectionalLight(0xffd9a0, 1.5); face.position.set(1.5, 4, 6); scene.add(face);

  const lueur = textureLueur();
  const etiquettes = { m: textureEtiquette('m'), f: textureEtiquette('f'), n: textureEtiquette('n') };

  // Ciel (grand cylindre dégradé) et étoiles.
  const ciel = new THREE.Mesh(new THREE.CylinderGeometry(100, 100, 120, 24, 1, true),
    new THREE.MeshBasicMaterial({ map: textureCiel(), side: THREE.BackSide, fog: false, depthWrite: false }));
  ciel.position.y = 30; scene.add(ciel);
  const etoilesGeo = new THREE.BufferGeometry();
  const pos = [];
  for (let i = 0; i < 260; i++) {
    const a = Math.random() * Math.PI - Math.PI, rayon = 90;
    pos.push(Math.cos(a) * rayon, 18 + Math.random() * 45, Math.sin(a) * rayon);
  }
  etoilesGeo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  scene.add(new THREE.Points(etoilesGeo, new THREE.PointsMaterial({ color: 0xe8ddff, size: 0.35, fog: false, transparent: true, opacity: 0.8 })));

  // Sol de la ville et route qui défile (texture répétée).
  const sol = new THREE.Mesh(new THREE.PlaneGeometry(80, 160), new THREE.MeshLambertMaterial({ color: 0x15121a }));
  sol.rotation.x = -Math.PI / 2; sol.position.set(0, -0.01, -60); scene.add(sol);
  const texRoute = textureRoute();
  const route = new THREE.Mesh(new THREE.PlaneGeometry(LARGEUR_ROUTE, 160),
    new THREE.MeshLambertMaterial({ map: texRoute, emissive: 0xffffff, emissiveMap: texRoute, emissiveIntensity: 0.12 }));
  route.rotation.x = -Math.PI / 2; route.position.set(0, 0, -60); scene.add(route);
  // Voie occupée : bande lumineuse de la couleur du genre.
  // Les trois voies portent leur couleur en permanence (bandes + liserés),
  // la voie occupée est nettement plus lumineuse.
  const texBande = textureCanvas(64, 4, (g, w) => {
    const d = g.createLinearGradient(0, 0, w, 0);
    d.addColorStop(0, 'rgba(255,255,255,0.9)'); d.addColorStop(0.12, 'rgba(255,255,255,0.35)');
    d.addColorStop(0.5, 'rgba(255,255,255,0.2)'); d.addColorStop(0.88, 'rgba(255,255,255,0.35)'); d.addColorStop(1, 'rgba(255,255,255,0.9)');
    g.fillStyle = d; g.fillRect(0, 0, w, 4);
  });
  const bandes = ORDRE.map((genre, i) => {
    const b = new THREE.Mesh(new THREE.PlaneGeometry(VOIE * 0.92, 90),
      new THREE.MeshBasicMaterial({ map: texBande, color: COULEURS[genre], transparent: true, opacity: 0.28, blending: THREE.AdditiveBlending, depthWrite: false }));
    b.rotation.x = -Math.PI / 2; b.position.set((i - 1) * VOIE, 0.01, -40);
    scene.add(b);
    return b;
  });

  // Portails : trio en cours, deux suivants, trio franchi, arche d'arrivée.
  const trios = [creerTrio(lueur, etiquettes), creerTrio(lueur, etiquettes), creerTrio(lueur, etiquettes)];
  const trioPasse = creerTrio(lueur, etiquettes);
  trios.concat([trioPasse]).forEach(t => { t.visible = false; scene.add(t); });
  const arrivee = creerArrivee(textureArrivee()); arrivee.visible = false; scene.add(arrivee);

  // Coureur : ombre ronde, aura de réussite / choc.
  const ombre = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9),
    new THREE.MeshBasicMaterial({ map: lueur, color: 0x000000, transparent: true, opacity: 0.55, depthWrite: false }));
  ombre.rotation.x = -Math.PI / 2; ombre.position.y = 0.012; scene.add(ombre);
  const aura = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.6),
    new THREE.MeshBasicMaterial({ map: lueur, color: 0xffffff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
  aura.position.set(0, 0.5, -0.1); scene.add(aura);
  const onde = new THREE.Mesh(new THREE.RingGeometry(0.42, 0.5, 40),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  onde.rotation.x = -Math.PI / 2; onde.position.y = 0.03; scene.add(onde);

  // Particules (réserve fixe, mises à jour sur le processeur).
  const NB = 70;
  const partPos = new Float32Array(NB * 3), partCol = new Float32Array(NB * 3);
  const partVie = new Float32Array(NB), partVit = new Float32Array(NB * 3);
  const partGeo = new THREE.BufferGeometry();
  partGeo.setAttribute('position', new THREE.BufferAttribute(partPos, 3));
  partGeo.setAttribute('color', new THREE.BufferAttribute(partCol, 3));
  const particules = new THREE.Points(partGeo, new THREE.PointsMaterial({ size: 0.09, vertexColors: true, map: lueur, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
  particules.frustumCulled = false; scene.add(particules);
  let partSuivante = 0;
  for (let i = 0; i < NB; i++) partPos[i * 3 + 1] = -50;

  const etat = {
    coureur: null, mixer: null, actions: {}, actionCourante: null,
    x: 0, distanceDecor: 0, decor: [], horloge: 0, choc: 0, auraCouleur: new THREE.Color(),
    passe: null, finJouee: false, largeur: 0, hauteur: 0
  };

  function jouer(nom, options) {
    const action = etat.actions[nom];
    if (!action || etat.actionCourante === action) return;
    const opt = options || {};
    action.reset();
    action.setLoop(opt.une ? THREE.LoopOnce : THREE.LoopRepeat, opt.une ? 1 : Infinity);
    action.clampWhenFinished = !!opt.une;
    action.enabled = true;
    if (etat.actionCourante) action.crossFadeFrom(etat.actionCourante, opt.fondu || 0.15, false);
    action.play();
    etat.actionCourante = action;
  }

  function construireDecor(pieces) {
    const batiments = Object.keys(pieces).filter(n => n.indexOf('building') >= 0);
    let graine = 11;
    const hasard = () => { graine = (graine * 9301 + 49297) % 233280; return graine / 233280; };
    for (const cote of [-1, 1]) {
      // Première rangée : bâtiments bas ; deuxième rangée : tours.
      for (let z = 0; z < BOUCLE; z += 2.6) {
        const nom = batiments.filter(n => n.indexOf('low-detail') >= 0)[Math.floor(hasard() * 16)] || batiments[0];
        const b = rendreMat(pieces[nom].clone(), 0.06, 0x8a7fa8);
        b.scale.setScalar(4.2 + hasard() * 1.2);
        b.position.set(cote * (LARGEUR_ROUTE / 2 + 2.9 + hasard() * 0.8), 0, 0);
        b.rotation.y = cote > 0 ? -Math.PI / 2 : Math.PI / 2;
        scene.add(b); etat.decor.push({ objet: b, z: -z });
      }
      for (let z = 1.3; z < BOUCLE; z += 5.5) {
        const tours = batiments.filter(n => n.indexOf('skyscraper') >= 0);
        const b = rendreMat(pieces[tours[Math.floor(hasard() * tours.length)]].clone(), 0.05, 0x7d72a0);
        b.scale.setScalar(3 + hasard() * 1.4);
        b.position.set(cote * (LARGEUR_ROUTE / 2 + 7 + hasard() * 4), 0, 0);
        scene.add(b); etat.decor.push({ objet: b, z: -z });
      }
      // Lampadaires tournés vers la route, avec halo chaud.
      for (let z = 0; z < BOUCLE; z += 6) {
        const lampe = rendreMat(pieces['light_curved'].clone(), 0);
        lampe.scale.setScalar(3.2);
        // Bras tourné vers la route (V2.1 : il pointait vers l'extérieur).
        lampe.rotation.y = cote > 0 ? -Math.PI / 2 : Math.PI / 2;
        // La pièce Kenney est décalée sur sa tuile : le pied (côté extérieur)
        // est placé à l'origine du groupe, la tête au-dessus de la route.
        const boite = new THREE.Box3().setFromObject(lampe);
        const centre = boite.getCenter(new THREE.Vector3());
        const taille = boite.getSize(new THREE.Vector3());
        lampe.position.set(-(cote > 0 ? boite.max.x : boite.min.x), 0, -centre.z);
        const groupe = new THREE.Group();
        groupe.add(lampe);
        const tete = -cote * Math.max(0.2, taille.x - 0.08);
        const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: lueur, color: 0xffd27a, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false }));
        halo.scale.set(0.9, 0.9, 1); halo.position.set(tete, taille.y - 0.12, 0);
        groupe.add(halo);
        const flaque = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.2),
          new THREE.MeshBasicMaterial({ map: lueur, color: 0xffc860, transparent: true, opacity: 0.28, blending: THREE.AdditiveBlending, depthWrite: false }));
        flaque.rotation.x = -Math.PI / 2; flaque.position.set(tete, 0.014, 0);
        groupe.add(flaque);
        groupe.position.x = cote * (LARGEUR_ROUTE / 2 + 0.35);
        scene.add(groupe); etat.decor.push({ objet: groupe, z: -z - 3 });
      }
    }
  }

  const pret = chargerModeles().then(({ coureur, pieces }) => {
    const modele = coureur.scene; // un seul coureur par partie : pas besoin de cloner le squelette
    // Le modèle est gardé en mémoire et réutilisé à chaque partie : on remet
    // l'échelle à 1 avant de mesurer (sinon « Rejouer » le rendait immense).
    modele.scale.set(1, 1, 1);
    modele.rotation.set(0, 0, 0);
    modele.position.set(0, 0, 0);
    modele.updateMatrixWorld(true);
    const boite = new THREE.Box3().setFromObject(modele);
    modele.scale.setScalar(1.12 / Math.max(0.01, boite.max.y - boite.min.y));
    modele.rotation.y = Math.PI; // de dos face à la caméra
    rendreMat(modele, 0.45); // léger auto-éclairage : le coureur reste lisible de dos
    etat.coureur = new THREE.Group();
    etat.coureur.add(modele);
    scene.add(etat.coureur);
    etat.mixer = new THREE.AnimationMixer(modele);
    coureur.animations.forEach(clip => { etat.actions[clip.name] = etat.mixer.clipAction(clip); });
    jouer('Run');
    construireDecor(pieces);
  });

  function redimensionner() {
    const r = conteneur.getBoundingClientRect();
    const l = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height));
    if (l === etat.largeur && h === etat.hauteur) return;
    etat.largeur = l; etat.hauteur = h;
    renderer.setSize(l, h, false);
    camera.aspect = l / h;
    // Écran étroit : un peu plus de champ pour voir les trois voies.
    camera.fov = l / h < 0.75 ? 62 : 55;
    camera.updateProjectionMatrix();
  }

  function eclater(x, couleur, nombre) {
    const c = new THREE.Color(couleur);
    for (let k = 0; k < nombre; k++) {
      const i = partSuivante; partSuivante = (partSuivante + 1) % NB;
      partPos[i * 3] = x; partPos[i * 3 + 1] = 0.7; partPos[i * 3 + 2] = -0.2;
      const a = Math.random() * Math.PI * 2, v = 1.2 + Math.random() * 2.2;
      partVit[i * 3] = Math.cos(a) * v; partVit[i * 3 + 1] = 1.2 + Math.random() * 2.5; partVit[i * 3 + 2] = Math.sin(a) * v * 0.5;
      partCol[i * 3] = c.r; partCol[i * 3 + 1] = c.g; partCol[i * 3 + 2] = c.b;
      partVie[i] = 0.7;
    }
  }

  // Appelée à chaque collision résolue par le jeu.
  function collision(r) {
    const voie = ORDRE.indexOf(r.mot.gender);
    etat.passe = { debut: r.temps, duree: r.duree, bonne: voie, ok: r.statut === 'correct' };
    const couleur = COULEURS[r.mot.gender];
    const reduit = typeof runnerMouvementReduit === 'function' && runnerMouvementReduit();
    if (r.statut === 'correct') {
      eclater((voie - 1) * VOIE, couleur, reduit ? 8 : (r.serie >= 3 ? 34 : 22));
      if (r.serie >= 3 && !reduit) eclater((voie - 1) * VOIE, 0xf5cf4d, 12);
      etat.auraCouleur.set(couleur); aura.material.opacity = 0.9;
      onde.material.color.set(couleur); onde.material.opacity = reduit ? 0 : 0.9; onde.scale.setScalar(1);
      onde.position.x = (voie - 1) * VOIE;
    } else {
      etat.auraCouleur.set(0xef7a73); aura.material.opacity = 0.8;
      if (!reduit) etat.choc = 0.45;
      jouer('RecieveHit', { une: true, fondu: 0.08 });
    }
    aura.material.color.copy(etat.auraCouleur);
  }

  // Une image : lit l'état de la partie, anime, dessine.
  function image(p, dt) {
    redimensionner();
    etat.horloge += dt;
    const avance = p.etat === 'course';
    if (etat.mixer) {
      // Retour à la course après un coup reçu.
      if (etat.actionCourante === etat.actions.RecieveHit && !etat.actions.RecieveHit.isRunning() && avance) jouer('Run', { fondu: 0.2 });
      if (p.etat === 'fin' && !etat.finJouee) {
        etat.finJouee = true;
        if (p.victoire && p.mode === 'sprint') jouer('Victory', { fondu: 0.25 });
        else if (p.mode === 'sprint') jouer('Death', { une: true, fondu: 0.2 });
        else jouer('Idle', { fondu: 0.3 });
      }
      const vitesse = p.portail ? DISTANCE / p.portail.duree : 6;
      if (etat.actions.Run) etat.actions.Run.timeScale = 0.85 + vitesse / 18;
      etat.mixer.update(p.etat === 'pause' ? 0 : dt);
    }
    // Défilement : la même distance que le jeu (profondeur → unités 3D).
    const parcouru = p.distance / RUNNER_PROFONDEUR * DISTANCE;
    texRoute.offset.y = parcouru / (160 / 18) % 1;
    etat.decor.forEach(d => {
      let z = d.z + (parcouru % BOUCLE);
      if (z > 6) z -= BOUCLE;
      d.objet.position.z = z;
    });

    // Coureur : glisse vers sa voie, s'incline, recule sur un choc.
    const cible = p.voie ? (ORDRE.indexOf(p.voie) - 1) * VOIE : 0;
    const avant = etat.x;
    const reduit = typeof runnerMouvementReduit === 'function' && runnerMouvementReduit();
    etat.x += (cible - etat.x) * (reduit ? 1 : Math.min(1, dt * 11));
    const vitesseX = dt > 0 ? (etat.x - avant) / dt : 0;
    if (etat.coureur) {
      etat.coureur.position.x = etat.x + (etat.choc > 0 ? Math.sin(etat.choc * 60) * 0.06 : 0);
      etat.coureur.rotation.z += (-vitesseX * 0.05 - etat.coureur.rotation.z) * Math.min(1, dt * 10);
      etat.coureur.rotation.y += (-vitesseX * 0.08 - etat.coureur.rotation.y) * Math.min(1, dt * 10);
    }
    etat.choc = Math.max(0, etat.choc - dt);
    ombre.position.x = etat.x;
    aura.position.x = etat.x;
    aura.material.opacity = Math.max(0, aura.material.opacity - dt * 2.2);
    if (onde.material.opacity > 0) { onde.scale.multiplyScalar(1 + dt * 5); onde.material.opacity = Math.max(0, onde.material.opacity - dt * 2.4); }
    bandes.forEach((b, i) => {
      const cible = ORDRE[i] === p.voie ? 0.75 : 0.28;
      b.material.opacity += (cible - b.material.opacity) * Math.min(1, dt * 10);
    });

    // Portails : en cours, puis suivants derrière, tous à la même vitesse.
    trios.forEach(t => { t.visible = false; });
    arrivee.visible = false;
    const portail = p.portail;
    if (portail) {
      const progres = Math.min(1, Math.max(0, (p.temps - portail.debut) / portail.duree));
      const z = -DISTANCE * (1 - progres);
      const suivants = typeof runnerPortailsSuivants === 'function' ? runnerPortailsSuivants(p, portail) : [];
      const elements = [portail.arrivee ? 'arrivee' : 'trio'].concat(suivants);
      let iTrio = 0;
      elements.forEach((type, k) => {
        const zk = z - k * DISTANCE;
        if (zk < -52) return;
        const alpha = Math.min(1, (52 + zk) / 10);
        if (type === 'arrivee') { arrivee.visible = true; arrivee.position.z = zk; return; }
        const t = trios[iTrio++]; if (!t) return;
        t.visible = true; t.position.z = zk; opaciteTrio(t, alpha, null);
      });
    }
    if (etat.passe) {
      const age = p.temps - etat.passe.debut;
      if (age >= 0 && age < 0.35) {
        trioPasse.visible = true;
        trioPasse.position.z = age * DISTANCE / etat.passe.duree;
        opaciteTrio(trioPasse, 1 - age / 0.35, etat.passe.bonne);
      } else { trioPasse.visible = false; if (age >= 0.35) etat.passe = null; }
    } else trioPasse.visible = false;

    // Particules.
    for (let i = 0; i < NB; i++) {
      if (partVie[i] <= 0) continue;
      partVie[i] -= dt;
      partVit[i * 3 + 1] -= 6 * dt;
      partPos[i * 3] += partVit[i * 3] * dt; partPos[i * 3 + 1] += partVit[i * 3 + 1] * dt; partPos[i * 3 + 2] += partVit[i * 3 + 2] * dt;
      if (partVie[i] <= 0) partPos[i * 3 + 1] = -50;
    }
    partGeo.attributes.position.needsUpdate = true;
    partGeo.attributes.color.needsUpdate = true;

    renderer.render(scene, camera);
  }

  // Libère la carte graphique (aucune fuite entre deux parties).
  function detacher() {
    scene.traverse(o => {
      if (o.geometry && !o.userData.partage) o.geometry.dispose();
      if (o.material) [].concat(o.material).forEach(m => { if (m.map && m.map.isCanvasTexture) m.map.dispose(); m.dispose(); });
    });
    renderer.dispose();
    if (renderer.forceContextLoss) renderer.forceContextLoss();
    canvas.remove();
  }

  return pret.then(() => { redimensionner(); return { image, collision, redimensionner, detacher }; })
    .catch(e => { detacher(); throw e; });
}

window.Runner3D = { creer, precharger: chargerModeles };
