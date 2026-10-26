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
import { mergeGeometries } from './vendor/three/BufferGeometryUtils.js';
import { EffectComposer } from './vendor/three/EffectComposer.js';
import { RenderPass } from './vendor/three/RenderPass.js';
import { UnrealBloomPass } from './vendor/three/UnrealBloomPass.js';
import { OutputPass } from './vendor/three/OutputPass.js';

const DISTANCE = 18;          // distance (unités 3D) d'apparition d'un trio
const VOIE = 1.05;            // écart entre deux voies
const LARGEUR_ROUTE = 3.6;
const BOUCLE = 84;            // longueur de décor recyclé (bâtiments, lampadaires)
// V2.2 : bleu / rouge / vert saturés ; une forme par genre (carré, rond, octogone).
const COULEURS = { m: 0x2f8cff, f: 0xff3d5a, n: 0x22e06b };
const FORMES = { m: 'carre', f: 'rond', n: 'octo' };
const TEMPS_PORTAILS = { value: 0 }; // horloge partagée des membranes animées
const ORDRE = ['m', 'f', 'n'];
const NOMS = { m: 'MASCULIN', f: 'FÉMININ', n: 'NEUTRE' };

let modelesPromesse = null;   // chargés une seule fois pour toutes les parties

function chargerModeles() {
  if (!modelesPromesse) {
    const loader = new GLTFLoader();
    modelesPromesse = Promise.all([
      loader.loadAsync('runner3d/coureur.glb?v=2'),
      loader.loadAsync('runner3d/ville.glb?v=3')
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
    g.fillStyle = '#0f0e0c'; g.beginPath(); g.arc(128, 96, 86, 0, Math.PI * 2); g.fill();
    g.fillStyle = c; g.beginPath(); g.arc(128, 96, 76, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(255,255,255,0.85)'; g.lineWidth = 5; g.beginPath(); g.arc(128, 96, 80, 0, Math.PI * 2); g.stroke();
    g.fillStyle = '#0f0e0c'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = '800 112px Inter, system-ui, sans-serif'; g.fillText(genre.toUpperCase(), 128, 104);
    // Le nom du genre n'est plus écrit sur le portail : illisible de loin, déjà sur les boutons.
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

// Contour d'un portail (ouvert en bas), selon la forme du genre.
function contourPortail(forme, l, h) {
  const r = l / 2, pts = [];
  const ligne = (x1, y1, x2, y2, n) => { for (let i = 0; i <= n; i++) pts.push([x1 + (x2 - x1) * i / n, y1 + (y2 - y1) * i / n]); };
  const arc = (cx, cy, rayon, a1, a2, n) => { for (let i = 1; i < n; i++) { const a = a1 + (a2 - a1) * i / n; pts.push([cx + Math.cos(a) * rayon, cy + Math.sin(a) * rayon]); } };
  if (forme === 'rond') {
    ligne(-r, 0, -r, h - r, 6); arc(0, h - r, r, Math.PI, 0, 18); ligne(r, h - r, r, 0, 6);
  } else if (forme === 'carre') {
    const c = 0.1;
    ligne(-r, 0, -r, h - c, 6); arc(-r + c, h - c, c, Math.PI, Math.PI / 2, 5);
    ligne(-r + c, h, r - c, h, 6); arc(r - c, h - c, c, Math.PI / 2, 0, 5); ligne(r, h - c, r, 0, 6);
  } else { // octogone : montants droits, deux pans coupés, sommet plat
    const c = l * 0.3;
    ligne(-r, 0, -r, h - c, 6); ligne(-r, h - c, -r + c, h, 3); ligne(-r + c, h, r - c, h, 4);
    ligne(r - c, h, r, h - c, 3); ligne(r, h - c, r, 0, 6);
  }
  return pts;
}

// Dimensions communes des portails (unités 3D).
const PORTAIL = { l: 0.8, h: 1.75, cadre: 0.065, marge: 0.36 }; // V2.4 : plus fins, la route se voit entre eux

// Intérieur : léger dégradé coloré avec un scintillement doux qui monte.
function materiauMembrane(couleur, hauteur) {
  return new THREE.ShaderMaterial({
    uniforms: { uCouleur: { value: new THREE.Color(couleur) }, uTemps: TEMPS_PORTAILS, uOpacite: { value: 1 }, uHauteur: { value: hauteur } },
    vertexShader: 'varying float vY; void main(){ vY = position.y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: 'uniform vec3 uCouleur; uniform float uTemps; uniform float uOpacite; uniform float uHauteur; varying float vY;' +
      'void main(){ float v = clamp(vY / uHauteur, 0.0, 1.0);' +
      'float scintille = 0.88 + 0.12 * sin(v * 5.0 - uTemps * 2.2);' +
      'float a = (0.05 + 0.2 * (1.0 - v) * (1.0 - v)) * scintille; gl_FragColor = vec4(uCouleur, a * uOpacite); }',
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false
  });
}

// Halo néon pré-dessiné (flou véritable, sans facettes) : une texture par genre,
// plaquée sur un plan face à la caméra, derrière le liseré du cadre.
function textureHalo(genre) {
  const { l, h, marge } = PORTAIL;
  const largeur = l + 2 * marge, hauteur = h + marge + 0.1;
  const k = 220 / largeur;
  const tex = textureCanvas(Math.round(largeur * k), Math.round(hauteur * k), (g, w, ht) => {
    const pts = contourPortail(FORMES[genre], l, h);
    const c = '#' + COULEURS[genre].toString(16).padStart(6, '0');
    const tracer = () => {
      g.beginPath();
      pts.forEach((p, i) => {
        const x = (p[0] + largeur / 2) * k, y = ht - (p[1] + 0.1) * k;
        if (i) g.lineTo(x, y); else g.moveTo(x, y);
      });
      g.stroke();
    };
    g.lineJoin = 'round'; g.lineCap = 'round';
    g.strokeStyle = c; g.shadowColor = c;
    for (const [epaisseur, flou, alpha] of [[0.16, 0.34, 0.5], [0.09, 0.18, 0.7], [0.05, 0.08, 0.9]]) {
      g.globalAlpha = alpha; g.lineWidth = epaisseur * k; g.shadowBlur = flou * k; tracer();
    }
  });
  tex.userData = { largeur, hauteur };
  return tex;
}

// Cadre solide en relief : forme en U (contour extérieur, puis intérieur à l'envers).
function geometrieCadre(forme) {
  const { l, h, cadre } = PORTAIL;
  const exterieur = contourPortail(forme, l + 2 * cadre, h + cadre);
  const interieur = contourPortail(forme, l, h).reverse();
  const contour = new THREE.Shape();
  exterieur.concat(interieur).forEach((p, i) => (i ? contour.lineTo(p[0], p[1]) : contour.moveTo(p[0], p[1])));
  contour.closePath();
  const geo = new THREE.ExtrudeGeometry(contour, { depth: 0.1, bevelEnabled: true, bevelThickness: 0.018, bevelSize: 0.014, bevelSegments: 2, curveSegments: 4 });
  geo.translate(0, 0, -0.05);
  return geo;
}

function creerArche(genre, lueur, halos) {
  const couleur = COULEURS[genre];
  const { l, h } = PORTAIL;
  const groupe = new THREE.Group();
  const pts = contourPortail(FORMES[genre], l, h);
  // Cadre : métal sombre légèrement teinté de la couleur du genre.
  const cadre = new THREE.Mesh(geometrieCadre(FORMES[genre]), new THREE.MeshLambertMaterial({
    color: new THREE.Color(0x1c1924).lerp(new THREE.Color(couleur), 0.18),
    emissive: new THREE.Color(couleur), emissiveIntensity: 0.08
  }));
  // Liseré néon fin sur le bord intérieur, en couleur pure (toneMapped: false).
  const chemin = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(p[0], p[1], 0.1)), false, 'centripetal');
  const lisere = new THREE.Mesh(new THREE.TubeGeometry(chemin, 80, 0.026, 6, false),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(couleur).lerp(new THREE.Color(0xffffff), 0.35), toneMapped: false }));
  // Halo flou dessiné à l'avance.
  const tex = halos[genre];
  const halo = new THREE.Mesh(new THREE.PlaneGeometry(tex.userData.largeur, tex.userData.hauteur),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
  halo.position.set(0, tex.userData.hauteur / 2 - 0.1, 0.09);
  // Intérieur discret.
  const forme = new THREE.Shape();
  pts.forEach((p, i) => (i ? forme.lineTo(p[0], p[1]) : forme.moveTo(p[0], p[1])));
  forme.lineTo(pts[0][0], pts[0][1]);
  const membrane = new THREE.Mesh(new THREE.ShapeGeometry(forme), materiauMembrane(couleur, h));
  // Lumière au sol.
  const sol = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 1.1),
    new THREE.MeshBasicMaterial({ map: lueur, color: couleur, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
  sol.rotation.x = -Math.PI / 2; sol.position.y = 0.015;
  groupe.add(sol, membrane, cadre, halo, lisere);
  groupe.userData = {
    materiaux: [cadre.material, lisere.material, halo.material, membrane.material, sol.material],
    opacites: [1, 1, 1, 1, 0.8]
  };
  return groupe;
}

function creerTrio(lueur, etiquettes, halos) {
  const trio = new THREE.Group();
  ORDRE.forEach((genre, i) => {
    const arche = creerArche(genre, lueur, halos);
    arche.position.x = (i - 1) * VOIE;
    const pastille = new THREE.Mesh(new THREE.PlaneGeometry(0.66, 0.66),
      new THREE.MeshBasicMaterial({ map: etiquettes[genre], transparent: true, depthWrite: false, toneMapped: false }));
    pastille.position.set(0, 1.32, 0.11);
    arche.add(pastille);
    arche.userData.materiaux.push(pastille.material); arche.userData.opacites.push(1);
    trio.add(arche);
  });
  return trio;
}
function opaciteTrio(trio, alpha, bonne) {
  trio.children.forEach((arche, i) => {
    const a = bonne == null ? alpha : alpha * (i === bonne ? 1 : 0.3);
    arche.userData.materiaux.forEach((m, k) => {
      const op = arche.userData.opacites[k] * a;
      if (m.uniforms) m.uniforms.uOpacite.value = op; // membrane (shader)
      else { m.transparent = true; m.opacity = op; }
    });
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
  // Tonalité « Neutral » : garde la saturation des néons (ACES les délavait).
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x170f22, 12, 46); // brouillard plus marqué : profondeur
  const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 140);
  camera.position.set(0, 2.55, 4.4);
  camera.lookAt(0, 0.35, -8);

  // Lumières : ciel violet, sol sombre, lune froide de côté, lumière chaude
  // venant de la caméra pour éclairer le dos du coureur.
  scene.add(new THREE.HemisphereLight(0x9b8cff, 0x241a2a, 1.25));
  const lune = new THREE.DirectionalLight(0xb9c4ff, 0.9); lune.position.set(-6, 9, -4); scene.add(lune);
  const face = new THREE.DirectionalLight(0xffd9a0, 1.3); face.position.set(1.5, 4, 6); scene.add(face);
  // Lumière de contour dorée, venant de devant le coureur : il se détache du décor.
  const contour = new THREE.DirectionalLight(0xffc860, 1.6); contour.position.set(0, 2.5, -6); scene.add(contour);

  const lueur = textureLueur();
  const etiquettes = { m: textureEtiquette('m'), f: textureEtiquette('f'), n: textureEtiquette('n') };
  const halos = { m: textureHalo('m'), f: textureHalo('f'), n: textureHalo('n') };

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
  const texBande = textureCanvas(64, 64, (g, w, h) => {
    const d = g.createLinearGradient(0, 0, w, 0);
    d.addColorStop(0, 'rgba(255,255,255,1)'); d.addColorStop(0.1, 'rgba(255,255,255,0.75)');
    d.addColorStop(0.5, 'rgba(255,255,255,0.55)'); d.addColorStop(0.9, 'rgba(255,255,255,0.75)'); d.addColorStop(1, 'rgba(255,255,255,1)');
    g.fillStyle = d; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(0, 0, w, h * 0.32); // bande claire qui défile
  });
  texBande.wrapT = THREE.RepeatWrapping;
  texBande.repeat.set(1, 30);
  const bandes = ORDRE.map((genre, i) => {
    const b = new THREE.Mesh(new THREE.PlaneGeometry(VOIE * 0.92, 90),
      new THREE.MeshBasicMaterial({ map: texBande, color: COULEURS[genre], transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
    b.rotation.x = -Math.PI / 2; b.position.set((i - 1) * VOIE, 0.01, -40);
    scene.add(b);
    return b;
  });

  // Portails : trio en cours, deux suivants, trio franchi, arche d'arrivée.
  const trios = [creerTrio(lueur, etiquettes, halos), creerTrio(lueur, etiquettes, halos), creerTrio(lueur, etiquettes, halos)];
  const trioPasse = creerTrio(lueur, etiquettes, halos);
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
    passe: null, finJouee: false, largeur: 0, hauteur: 0,
    fovBase: 58, zoom: 0, secousseCam: 0, vitesseCombo: 0, serie: 0
  };
  // Traînées de vitesse (à partir d'un combo de 3) : segments fins sur les côtés.
  const NB_TRAINEES = 26;
  const traineesPos = new Float32Array(NB_TRAINEES * 6);
  const traineesGeo = new THREE.BufferGeometry();
  traineesGeo.setAttribute('position', new THREE.BufferAttribute(traineesPos, 3));
  const trainees = new THREE.LineSegments(traineesGeo, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
  trainees.frustumCulled = false; scene.add(trainees);
  const traineesZ = new Float32Array(NB_TRAINEES);
  for (let i = 0; i < NB_TRAINEES; i++) {
    const cote = i % 2 ? 1 : -1;
    traineesPos[i * 6] = traineesPos[i * 6 + 3] = cote * (1.9 + Math.random() * 2.2);
    traineesPos[i * 6 + 1] = traineesPos[i * 6 + 4] = 0.3 + Math.random() * 2.6;
    traineesZ[i] = -Math.random() * 30;
  }

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

  // Arbres et maisons low-poly, dans le style des kits Kenney.
  const materiauxDecor = {
    pelouse: new THREE.MeshLambertMaterial({ color: 0x1d2a22 }),
    tronc: new THREE.MeshLambertMaterial({ color: 0x5a4030 }),
    feuillage: [0x2f6b45, 0x3d7a4a, 0x2a5c49, 0x4b7d3c].map(c => new THREE.MeshLambertMaterial({ color: c, flatShading: true, emissive: c, emissiveIntensity: 0.12 })),
    murs: [0xd8c7b0, 0xc9b2d6, 0xb7c9d8, 0xe0c9a6, 0xc2d3bf].map(c => new THREE.MeshLambertMaterial({ color: c, emissive: c, emissiveIntensity: 0.08 })),
    toits: [0x7a3b34, 0x4a4060, 0x5b4636].map(c => new THREE.MeshLambertMaterial({ color: c, flatShading: true })),
    fenetre: new THREE.MeshBasicMaterial({ color: 0xffd27a, side: THREE.DoubleSide }),
    fenetreFroide: new THREE.MeshBasicMaterial({ color: 0xa8c4ff, side: THREE.DoubleSide }),
    porte: new THREE.MeshLambertMaterial({ color: 0x3b2a22 })
  };
  const geoDecor = {
    tronc: new THREE.CylinderGeometry(0.07, 0.1, 0.7, 6),
    rond: new THREE.IcosahedronGeometry(0.55, 0),
    sapin: new THREE.ConeGeometry(0.5, 1.3, 7),
    corps: new THREE.BoxGeometry(1.6, 1.2, 1.4),
    toit: new THREE.ConeGeometry(1.25, 0.8, 4),
    fenetre: new THREE.PlaneGeometry(0.28, 0.32),
    porte: new THREE.PlaneGeometry(0.3, 0.55)
  };
  function creerArbre(hasard) {
    const arbre = new THREE.Group();
    const tronc = new THREE.Mesh(geoDecor.tronc, materiauxDecor.tronc);
    tronc.position.y = 0.35;
    const sapin = hasard() < 0.4;
    const feuilles = new THREE.Mesh(sapin ? geoDecor.sapin : geoDecor.rond,
      materiauxDecor.feuillage[Math.floor(hasard() * materiauxDecor.feuillage.length)]);
    feuilles.position.y = sapin ? 1.25 : 1.05;
    feuilles.rotation.y = hasard() * Math.PI;
    arbre.add(tronc, feuilles);
    arbre.scale.setScalar(0.9 + hasard() * 0.7);
    return arbre;
  }
  function creerBosquet(hasard, nombre) {
    const groupe = new THREE.Group();
    for (let i = 0; i < nombre; i++) {
      const a = creerArbre(hasard);
      a.position.set((hasard() - 0.5) * 1.4, 0, (hasard() - 0.5) * 1.6);
      groupe.add(a);
    }
    return groupe;
  }
  // Maison : murs, toit en pyramide, fenêtres éclairées et porte face à la route.
  function creerMaison(hasard, cote) {
    const maison = new THREE.Group();
    const corps = new THREE.Mesh(geoDecor.corps, materiauxDecor.murs[Math.floor(hasard() * materiauxDecor.murs.length)]);
    corps.position.y = 0.6;
    const toit = new THREE.Mesh(geoDecor.toit, materiauxDecor.toits[Math.floor(hasard() * materiauxDecor.toits.length)]);
    toit.position.y = 1.6; toit.rotation.y = Math.PI / 4; toit.scale.set(1, 1, 0.9);
    maison.add(corps, toit);
    const face = -cote * 0.81; // façade tournée vers la route
    const ajouter = (geo, mat, z, y) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(face, y, z); m.rotation.y = cote > 0 ? -Math.PI / 2 : Math.PI / 2;
      maison.add(m);
    };
    ajouter(geoDecor.porte, materiauxDecor.porte, 0, 0.28);
    if (hasard() < 0.75) ajouter(geoDecor.fenetre, materiauxDecor.fenetre, -0.45, 0.75);
    if (hasard() < 0.75) ajouter(geoDecor.fenetre, materiauxDecor.fenetre, 0.45, 0.75);
    maison.scale.setScalar(0.95 + hasard() * 0.35);
    return maison;
  }

  function construireDecor(pieces) {
    const batiments = Object.keys(pieces).filter(n => n.indexOf('building') >= 0);
    let graine = 11;
    const hasard = () => { graine = (graine * 9301 + 49297) % 233280; return graine / 233280; };
    for (const cote of [-1, 1]) {
      // Kenney City Kit Suburban (maisons, arbres) ; formes maison en secours.
      const maisons = Object.keys(pieces).filter(n => n.indexOf('building-type') === 0);
      const arbres = ['tree-large', 'tree-small'].filter(n => pieces[n]);
      const maison = () => {
        if (!maisons.length) return creerMaison(hasard, cote);
        const m = rendreMat(pieces[maisons[Math.floor(hasard() * maisons.length)]].clone(), 0.05, 0x7a72a0); // teinte de nuit
        m.scale.setScalar(2.2 + hasard() * 0.4);
        m.rotation.y = cote > 0 ? -Math.PI / 2 : Math.PI / 2; // façade vers la route
        return m;
      };
      const bosquet = (nombre) => {
        if (!arbres.length) return creerBosquet(hasard, nombre);
        const groupe = new THREE.Group();
        for (let i = 0; i < nombre; i++) {
          const a = rendreMat(pieces[arbres[Math.floor(hasard() * arbres.length)]].clone(), 0.03, 0x5d6690); // teinte de nuit
          a.scale.setScalar(2.6 + hasard() * 1.2);
          a.rotation.y = hasard() * Math.PI * 2;
          a.position.set((hasard() - 0.5) * 1.6, 0, (hasard() - 0.5) * 1.8);
          groupe.add(a);
        }
        return groupe;
      };
      // Fenêtres éclairées sur la façade tournée vers la route (une seule géométrie par immeuble).
      const avecFenetres = (batiment, cote, nombre) => {
        const groupe = new THREE.Group();
        groupe.position.x = batiment.position.x; batiment.position.x = 0;
        groupe.add(batiment);
        batiment.updateMatrixWorld(true);
        const boite = new THREE.Box3().setFromObject(batiment);
        const faceX = cote > 0 ? boite.min.x - 0.02 : boite.max.x + 0.02;
        const carres = [];
        for (let i = 0; i < nombre; i++) {
          const q = new THREE.PlaneGeometry(0.16, 0.2);
          q.rotateY(cote > 0 ? -Math.PI / 2 : Math.PI / 2);
          q.translate(faceX, boite.min.y + 0.4 + hasard() * (boite.max.y - boite.min.y - 0.6),
            boite.min.z + 0.15 + hasard() * Math.max(0.1, boite.max.z - boite.min.z - 0.3));
          carres.push(q);
        }
        const fenetres = new THREE.Mesh(mergeGeometries(carres), hasard() < 0.25 ? materiauxDecor.fenetreFroide : materiauxDecor.fenetre);
        carres.forEach(q => q.dispose());
        groupe.add(fenetres);
        return groupe;
      };
      // Bande de pelouse le long du trottoir (rend le décor plus aéré).
      const pelouse = new THREE.Mesh(new THREE.PlaneGeometry(9, 160), materiauxDecor.pelouse);
      pelouse.rotation.x = -Math.PI / 2;
      pelouse.position.set(cote * (LARGEUR_ROUTE / 2 + 0.6 + 4.5), 0.005, -60);
      scene.add(pelouse);
      // Première rangée variée : arbres, maisons, petits immeubles, vides.
      for (let z = 0; z < BOUCLE; z += 3.2) {
        const tirage = hasard();
        const x = cote * (LARGEUR_ROUTE / 2 + 2.6 + hasard() * 1.2);
        let objet = null;
        if (tirage < 0.38) objet = bosquet(1 + Math.floor(hasard() * 3));
        else if (tirage < 0.72) objet = maison();
        else if (tirage < 0.88) {
          const petits = batiments.filter(n => n.indexOf('low-detail') >= 0);
          objet = rendreMat(pieces[petits[Math.floor(hasard() * petits.length)]].clone(), 0.03, 0x5c5480);
          objet.scale.setScalar(3.2 + hasard() * 0.8);
          objet.rotation.y = cote > 0 ? -Math.PI / 2 : Math.PI / 2;
        }
        if (!objet) continue; // espace vide : on voit la pelouse et le ciel
        objet.position.x = x;
        if (tirage >= 0.72) objet = avecFenetres(objet, cote, 10);
        scene.add(objet); etat.decor.push({ objet, z: -z - hasard() * 0.8 });
      }
      // Arrière-plan : quelques tours seulement, loin de la route.
      for (let z = 2; z < BOUCLE; z += 12) {
        const tours = batiments.filter(n => n.indexOf('skyscraper') >= 0);
        const t = rendreMat(pieces[tours[Math.floor(hasard() * tours.length)]].clone(), 0.02, 0x4c4570);
        t.scale.setScalar(3 + hasard() * 1.4);
        t.position.set(cote * (LARGEUR_ROUTE / 2 + 11 + hasard() * 5), 0, 0);
        const tour = avecFenetres(t, cote, 22);
        scene.add(tour); etat.decor.push({ objet: tour, z: -z });
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
        const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: lueur, color: 0xffd27a, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false }));
        halo.scale.set(0.9, 0.9, 1); halo.position.set(tete, taille.y - 0.12, 0);
        groupe.add(halo);
        const flaque = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.2),
          new THREE.MeshBasicMaterial({ map: lueur, color: 0xffc860, transparent: true, opacity: 0.13, blending: THREE.AdditiveBlending, depthWrite: false }));
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
    if (composer) {
      composer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
      composer.setSize(l, h);
      bloom.resolution.set(Math.round(l / 2), Math.round(h / 2)); // bloom à demi-résolution
    }
    camera.aspect = l / h;
    // Écran étroit : un peu plus de champ pour voir les trois voies.
    etat.fovBase = l / h < 0.75 ? 62 : 55;
    camera.fov = etat.fovBase;
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
      if (!reduit) { etat.zoom = 1; jouer('Jump', { une: true, fondu: 0.06 }); } // petit saut + zoom
      onde.material.color.set(couleur); onde.material.opacity = reduit ? 0 : 0.9; onde.scale.setScalar(1);
      onde.position.x = (voie - 1) * VOIE;
    } else {
      etat.auraCouleur.set(0xef7a73); aura.material.opacity = 0.8;
      if (!reduit) { etat.choc = 0.45; etat.secousseCam = 0.35; }
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
      const ponctuelle = etat.actionCourante === etat.actions.RecieveHit || etat.actionCourante === etat.actions.Jump;
      if (ponctuelle && !etat.actionCourante.isRunning() && avance) jouer('Run', { fondu: 0.15 });
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
    texBande.offset.y = parcouru / 3 % 1; // bandes de la voie qui défilent vers le coureur
    TEMPS_PORTAILS.value = etat.horloge;
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
      const cible = ORDRE[i] === p.voie ? 0.9 : 0; // seule la voie choisie est colorée
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
      const elements = [portail.arrivee ? 'arrivee' : 'trio'].concat(suivants.slice(0, 1)); // un seul suivant : moins de surcharge
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

    // Caméra : zoom bref sur un bon portail, secousse sur une erreur, champ plus large en combo.
    const enCombo = p.serie >= 3 && avance;
    etat.vitesseCombo += ((enCombo ? 1 : 0) - etat.vitesseCombo) * Math.min(1, dt * 3);
    etat.zoom = Math.max(0, etat.zoom - dt * 3);
    etat.secousseCam = Math.max(0, etat.secousseCam - dt);
    const fov = etat.fovBase - etat.zoom * 3 + etat.vitesseCombo * 4;
    if (Math.abs(camera.fov - fov) > 0.01) { camera.fov = fov; camera.updateProjectionMatrix(); }
    const s = etat.secousseCam;
    camera.position.set(s ? (Math.random() - 0.5) * 0.12 * s / 0.35 : 0, 2.55 + (s ? (Math.random() - 0.5) * 0.08 * s / 0.35 : 0), 4.4);
    // Traînées de vitesse.
    trainees.material.opacity = 0.35 * etat.vitesseCombo;
    if (etat.vitesseCombo > 0.02) {
      const v = (p.portail ? DISTANCE / p.portail.duree : 6) * 2.2 * dt;
      for (let i = 0; i < NB_TRAINEES; i++) {
        traineesZ[i] += v;
        if (traineesZ[i] > 4) traineesZ[i] -= 34;
        traineesPos[i * 6 + 2] = traineesZ[i]; traineesPos[i * 6 + 5] = traineesZ[i] - 1.6;
      }
      traineesGeo.attributes.position.needsUpdate = true;
    }
    rendreImage(dt);
  }

  // ── 5. Bloom (halo lumineux réel) : actif seulement si le téléphone suit.
  // Mesure des 90 premières images : au-dessus de ~22 ms en moyenne, on le coupe.
  let composer = null, bloom = null;
  const mesure = { images: 0, total: 0 };
  try {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.42, 0.28, 0.5); // force, rayon, seuil
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
  } catch (_) { composer = null; }
  function rendreImage(dt) {
    if (composer && mesure.images < 90 && dt > 0) {
      mesure.images++; mesure.total += dt;
      if (mesure.images === 90 && mesure.total / 90 > 0.022) {
        composer.dispose(); composer = null; // trop lent : rendu sans bloom
      }
    }
    if (composer) composer.render(); else renderer.render(scene, camera);
  }

  // Libère la carte graphique (aucune fuite entre deux parties).
  function detacher() {
    scene.traverse(o => {
      if (o.geometry && !o.userData.partage) o.geometry.dispose();
      if (o.material) [].concat(o.material).forEach(m => { if (m.map && m.map.isCanvasTexture) m.map.dispose(); m.dispose(); });
    });
    if (composer) composer.dispose();
    renderer.dispose();
    if (renderer.forceContextLoss) renderer.forceContextLoss();
    canvas.remove();
  }

  return pret.then(() => { redimensionner(); return { image, collision, redimensionner, detacher }; })
    .catch(e => { detacher(); throw e; });
}

window.Runner3D = { creer, precharger: chargerModeles };
