/* SPEC 109 — Lux Match : rendu 3D (Three.js r170 local), chargé À LA DEMANDE.
   Aucune règle du jeu ici : l'interface (lux-match.js) demande des images et des réactions.

   - Un seul WebGLRenderer, rendu en basse résolution agrandie (effet « PS1 »).
   - Personnages Quaternius (squelette commun) + animations partagées (anims.glb).
   - Café Kenney (cafe.glb) : comptoir, tabourets, plantes, lampes, table haute.
   Services :
     portrait(profil, pose, fond)  → image (dataURL) pour les cartes et les « photos » Pix ;
     apercu(conteneur, look)       → Alex qui tourne sur lui-même (écran LOOK) ;
     date(conteneur, profil, look) → scène du rendez-vous ;
     reagir(type)                  → animation de la partenaire (joie, déception, surprise…) ;
     detacher()                    → arrête la boucle et retire le canvas.
   Ajouts SPEC 110 (Lux Démasque), sans changer les services ci-dessus :
     interrogatoire(conteneur, profil) → le prétendant seul, face au joueur, dans le café ;
     photo(scene, personnes, l, h)     → « photo » de preuve dans un petit décor low-poly ;
     partage()                         → une seule instance (un seul WebGLRenderer) pour les deux jeux. */
import * as THREE from './vendor/three/three.module.min.js';
import { GLTFLoader } from './vendor/three/GLTFLoader.js';

const DOSSIER = 'lux-match/';
const ECHELLE_MEUBLES = 2.4;   // Kenney Furniture → mètres (comptoir ≈ 1 m)
const TAILLE_PERSO = 1.72;
const COULEURS = { schwaarz: '#1c1b20', 'wäiss': '#f2f0ea', blo: '#2f6fd6', 'gréng': '#2fa35a', rout: '#d8343c', beige: '#d9c3a0' };
const STYLES = {
  sportif: { modele: 'Casual3_Male' }, casual: { modele: 'Casual_Male' }, loose: { modele: 'Casual2_Male' },
  bcbg: { modele: 'Suit_Male' }, creatif: { modele: 'Casual_Male' }
};
const ALEX = { peau: '#e0a985', cheveux: '#4a3020' };

const chargeur = new GLTFLoader();
const modeles = {};           // promesses de GLB, chargés une seule fois
function charger(nom) {
  if (!modeles[nom]) {
    modeles[nom] = chargeur.loadAsync(DOSSIER + nom + '.glb?v=1');
    modeles[nom].catch(() => { delete modeles[nom]; });
  }
  return modeles[nom];
}

// ─── Personnages ────────────────────────────────────────────────────────────

// Matériaux mats (aspect low-poly) ; une copie par personnage pour recolorer librement.
function preparerPersonnage(gltf) {
  const racine = gltf.scene;
  if (!racine.userData.pret) {
    racine.traverse(o => {
      if (!o.isMesh) return;
      o.material = [].concat(o.material).map(m => {
        const n = new THREE.MeshLambertMaterial({ color: m.color.clone(), flatShading: true });
        n.name = m.name.replace(/\.\d+$/, '');
        n.userData.origine = m.color.clone();
        return n;
      });
      if (o.material.length === 1) o.material = o.material[0];
      o.frustumCulled = false;
    });
    racine.scale.set(1, 1, 1);
    const boite = new THREE.Box3().setFromObject(racine);
    racine.userData.echelle = TAILLE_PERSO / (boite.max.y - boite.min.y);
    racine.userData.pret = true;
  }
  racine.scale.setScalar(racine.userData.echelle);
  return racine;
}
// teintes = { Shirt: '#…', Pants: '#…', Hair: '#…', Skin: '#…', Black: '#…', Main: '#…' }
function teindre(racine, teintes) {
  racine.traverse(o => {
    if (!o.isMesh) return;
    [].concat(o.material).forEach(m => {
      m.color.copy(m.userData.origine);
      if (teintes[m.name]) m.color.set(teintes[m.name]); // couleur CSS (sRGB), convertie par Three.js
    });
  });
}
function teintesProfil(profil) {
  const a = profil.apparence3d || {};
  return { Skin: a.peau, Hair: a.cheveux, Shirt: a.haut, Pants: a.bas, Black: a.costume, Main: a.manteau };
}
function teintesAlex(look) {
  const style = look && look.style || 'casual';
  const c = COULEURS[look && look.couleur] || '#5b6b84';
  const t = { Skin: ALEX.peau, Hair: ALEX.cheveux };
  if (style === 'bcbg') { t.Black = c; t.Shirt = look && look.couleur === 'wäiss' ? '#1c1b20' : '#f2f0ea'; }
  else if (style === 'sportif') { t.Shirt = c; t.Pants = new THREE.Color(c).multiplyScalar(0.45).getStyle(); }
  else if (style === 'creatif') { t.Shirt = c; t.Pants = look && look.couleur === 'beige' ? '#7a3fc4' : '#f2c230'; }
  else if (style === 'loose') { t.Shirt = c; t.Pants = '#6d6458'; }
  else { t.Shirt = c; t.Pants = '#2c3550'; }
  return t;
}

// Joue une animation avec fondu ; « une » = une seule fois puis retour à Idle.
function animateur(racine, clips) {
  const mixer = new THREE.AnimationMixer(racine);
  const actions = {};
  clips.forEach(c => { actions[c.name] = mixer.clipAction(c); });
  let courante = null, retour = null;
  function jouer(nom, une) {
    const action = actions[nom];
    if (!action) return;
    action.reset();
    action.setLoop(une ? THREE.LoopOnce : THREE.LoopRepeat, une ? 1 : Infinity);
    action.clampWhenFinished = !!une;
    action.enabled = true;
    if (courante && courante !== action) action.crossFadeFrom(courante, 0.25, false);
    action.play();
    courante = action;
    retour = une ? action.getClip().duration * 0.92 : null;
  }
  function avancer(dt) {
    mixer.update(dt);
    if (retour !== null) { retour -= dt; if (retour <= 0) { retour = null; jouer('Idle'); } }
  }
  function poser(nom, temps) { // pose figée (portraits)
    mixer.stopAllAction();
    const action = actions[nom] || actions.Idle;
    action.reset(); action.play(); mixer.setTime(temps || 0);
    courante = action;
  }
  return { jouer, avancer, poser, mixer };
}

// ─── Textures ──────────────────────────────────────────────────────────────

function textureCanvas(l, h, dessiner) {
  const c = document.createElement('canvas'); c.width = l; c.height = h;
  dessiner(c.getContext('2d'), l, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function textureSol() {
  const t = textureCanvas(64, 64, (g, w) => {
    g.fillStyle = '#2a2038'; g.fillRect(0, 0, w, w);
    g.fillStyle = '#3b2d4f'; g.fillRect(0, 0, w / 2, w / 2); g.fillRect(w / 2, w / 2, w / 2, w / 2);
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(10, 10);
  t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter;
  return t;
}
function textureEnseigne() {
  return textureCanvas(512, 128, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.font = '800 70px Inter, system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.shadowColor = '#ff4fd8'; g.shadowBlur = 26; g.fillStyle = '#ffd1f4';
    g.fillText('LUX ♥ MATCH', w / 2, h / 2 + 4); g.fillText('LUX ♥ MATCH', w / 2, h / 2 + 4);
  });
}
function textureLueur(couleur) {
  return textureCanvas(64, 64, (g, w) => {
    const d = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    d.addColorStop(0, couleur); d.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = d; g.fillRect(0, 0, w, w);
  });
}

// ─── Moteur ────────────────────────────────────────────────────────────────

async function creer() {
  const canvas = document.createElement('canvas');
  canvas.className = 'lm-canvas-3d';
  canvas.setAttribute('aria-hidden', 'true');
  // alpha : l'aperçu du look se détache sur la cabine CSS (les autres scènes ont un fond opaque).
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, preserveDrawingBuffer: false });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  // Seules les animations sont nécessaires tout de suite (portraits) ; le café se charge au rendez-vous.
  const anims = await charger('anims');
  const clips = anims.animations;
  charger('cafe').catch(() => {});

  // Scène de portrait (fond uni, lumière douce).
  const scenePortrait = new THREE.Scene();
  scenePortrait.add(new THREE.HemisphereLight(0xffffff, 0x5a4a70, 2.2));
  const lumPortrait = new THREE.DirectionalLight(0xffffff, 1.6); lumPortrait.position.set(1, 2, 3); scenePortrait.add(lumPortrait);
  const camPortrait = new THREE.PerspectiveCamera(30, 0.8, 0.1, 20);

  let boucle = null, conteneur = null, dernier = 0, rendu = null;
  let demande = 0; // numéro de la dernière scène demandée (aperçu, date) ou de l'arrêt
  const observateur = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => redimensionner()) : null;

  function redimensionner() {
    if (!conteneur) return;
    const r = conteneur.getBoundingClientRect();
    const l = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height));
    // Basse résolution volontaire (style PS1), agrandie sans lissage par le CSS.
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2) * 0.5);
    renderer.setSize(l, h, false);
    if (rendu && rendu.camera) { rendu.camera.aspect = l / h; rendu.camera.updateProjectionMatrix(); }
  }
  function attacher(nouveau, scene) {
    detacher();
    conteneur = nouveau;
    conteneur.insertBefore(canvas, conteneur.firstChild);
    rendu = scene;
    if (observateur) observateur.observe(conteneur);
    redimensionner();
    dernier = performance.now();
    const image = maintenant => {
      boucle = requestAnimationFrame(image);
      if (document.hidden) { dernier = maintenant; return; }
      const dt = Math.min(0.05, Math.max(0, (maintenant - dernier) / 1000));
      dernier = maintenant;
      rendu.avancer(dt);
      renderer.render(rendu.scene, rendu.camera);
    };
    boucle = requestAnimationFrame(image);
  }
  function detacher() {
    if (boucle) cancelAnimationFrame(boucle);
    boucle = null;
    if (observateur && conteneur) observateur.unobserve(conteneur);
    if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    conteneur = null;
    rendu = null;
  }

  // Personnage prêt (modèle chargé, teinté, animé). Un modèle n'a qu'une instance :
  // il est retiré de son ancienne scène quand on le réutilise.
  // Préparation SYNCHRONE après le chargement : deux portraits lancés en même temps
  // (Noémie et Emma partagent un modèle) ne peuvent pas mélanger leurs couleurs.
  function instancier(gltf, teintes) {
    const racine = preparerPersonnage(gltf);
    teindre(racine, teintes);
    if (racine.parent) racine.parent.remove(racine);
    racine.position.set(0, 0, 0); racine.rotation.set(0, 0, 0);
    racine.userData.personnage = true;
    if (!racine.userData.anim) racine.userData.anim = animateur(racine, clips);
    return racine;
  }
  // ── Décors des « photos » Pix (bible §5 : la photo montre ce que dit la légende).
  // Petites scènes low-poly construites une fois, en primitives (aucun nouveau fichier).
  const mat = couleur => new THREE.MeshLambertMaterial({ color: couleur, flatShading: true });
  const lueur = couleur => new THREE.MeshBasicMaterial({ color: couleur, toneMapped: false });
  function boite(l, h, p, couleur, x, y, z) { const m = new THREE.Mesh(new THREE.BoxGeometry(l, h, p), couleur.isMaterial ? couleur : mat(couleur)); m.position.set(x, y, z); return m; }
  function cylindre(r, h, couleur, x, y, z, faces) { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, faces || 8), mat(couleur)); m.position.set(x, y, z); return m; }
  function plancher(couleur) { const m = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), mat(couleur)); m.rotation.x = -Math.PI / 2; return m; }
  function arbre(x, z, h) {
    const g = new THREE.Group();
    g.add(cylindre(0.08, h * 0.4, '#6b4a2a', 0, h * 0.2, 0, 6));
    const cone = new THREE.Mesh(new THREE.ConeGeometry(h * 0.28, h * 0.75, 7), mat('#3f8f4a')); cone.position.y = h * 0.72; g.add(cone);
    g.position.set(x, 0, z); return g;
  }
  function immeuble(x, z, l, h, couleur, fenetres) {
    const g = new THREE.Group();
    g.add(boite(l, h, 0.6, couleur, 0, h / 2, 0));
    for (let i = 0; i < 3; i++) for (let j = 0; j < Math.floor(h / 0.5); j++) {
      if ((i + j * 2) % 3 === 0) continue;
      g.add(boite(l * 0.18, 0.2, 0.02, fenetres.isMaterial ? fenetres : mat(fenetres), -l * 0.3 + i * l * 0.3, 0.35 + j * 0.5, 0.31));
    }
    g.position.set(x, 0, z); return g;
  }
  const FABRIQUES = {
    parc: g => { g.add(plancher('#4f8f4a'), boite(1.1, 0.01, 8, '#cdb98f', 0.2, 0.005, -2)); [[-1.6, -1.2, 2.2], [1.7, -1.6, 2.6], [-1.1, -3, 2.8], [1.2, -3.4, 2.4]].forEach(a => g.add(arbre(...a))); },
    foot: g => {
      g.add(plancher('#3f9a44'), boite(6, 0.01, 0.06, '#ffffff', 0, 0.01, -1.2));
      [-1.1, 1.1].forEach(x => g.add(cylindre(0.04, 1.2, '#ffffff', x, 0.6, -2.6)));
      g.add(boite(2.28, 0.08, 0.08, '#ffffff', 0, 1.2, -2.6));
      const ballon = new THREE.Mesh(new THREE.IcosahedronGeometry(0.17, 0), mat('#f4f4f4')); ballon.position.set(0.55, 0.17, 0.5); g.add(ballon);
    },
    reception: g => {
      g.add(plancher('#3a2a22'), boite(8, 3, 0.1, '#4a2e3a', 0, 1.5, -2.4));
      for (let i = 0; i < 9; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 4), lueur('#ffd27a')); b.position.set(-2 + i * 0.5, 2.1 - Math.sin(i / 8 * Math.PI) * 0.2, -2.3); g.add(b); }
      [[-1.2, -0.6], [1.3, -0.9]].forEach(([x, z]) => { g.add(cylindre(0.32, 0.04, '#e9e2d6', x, 1.05, z, 10), cylindre(0.04, 1.05, '#2a2433', x, 0.52, z)); g.add(cylindre(0.035, 0.16, '#f4f0ff', x + 0.1, 1.15, z)); });
    },
    ville_nuit: g => {
      const allume = lueur('#ffd36a');
      g.add(plancher('#1d2236'));
      [[-1.8, -2.6, 1.1, 3.2, '#2b3557'], [-0.5, -3.2, 1.2, 4.2, '#323c63'], [0.9, -2.8, 1, 2.8, '#283252'], [2.1, -3.1, 1.2, 3.8, '#2f3a5e']].forEach(([x, z, l, h, c]) => g.add(immeuble(x, z, l, h, c, allume)));
      const lune = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 6), lueur('#f4f0d8')); lune.position.set(-1.6, 3.2, -3.5); g.add(lune);
    },
    carnet: g => {
      g.add(plancher('#4a3428'), boite(2.2, 0.06, 0.9, '#7a5236', 0, 0.82, 0.55), cylindre(0.05, 0.8, '#3a2a20', 0, 0.4, 0.55));
      g.add(boite(0.42, 0.03, 0.3, '#f6f1e6', -0.25, 0.87, 0.6), boite(0.42, 0.031, 0.3, '#f6f1e6', 0.2, 0.87, 0.6));
      const stylo = cylindre(0.015, 0.28, '#d8343c', 0.45, 0.88, 0.55, 6); stylo.rotation.z = Math.PI / 2; stylo.rotation.y = 0.5; g.add(stylo);
    },
    atelier: g => {
      g.add(plancher('#5a4436'), boite(8, 3, 0.1, '#e8dccb', 0, 1.5, -2.2));
      const chevalet = new THREE.Group();
      [-0.35, 0.35].forEach(x => { const pied = boite(0.05, 1.7, 0.05, '#8a6a46', x, 0.85, 0); pied.rotation.z = x > 0 ? -0.12 : 0.12; chevalet.add(pied); });
      chevalet.add(boite(0.5, 0.65, 0.03, '#d8343c', -0.13, 1.25, 0.05), boite(0.26, 0.65, 0.031, '#2f6fd6', 0.25, 1.25, 0.05));
      chevalet.position.set(1.15, 0, -0.6); chevalet.rotation.y = -0.4; g.add(chevalet);
    },
    lisbonne: g => {
      g.add(plancher('#bfb3a0'));
      [[-1.9, -3, 1.3, 2.6, '#f2a7b5'], [-0.5, -3.3, 1.2, 3.1, '#f2d27a'], [0.9, -3, 1.2, 2.4, '#9fd2e8'], [2.2, -3.2, 1.2, 2.9, '#f6ede0']].forEach(([x, z, l, h, c]) => g.add(immeuble(x, z, l, h, c, '#4a6f8a')));
      const tram = new THREE.Group();
      tram.add(boite(2.1, 0.9, 0.9, '#f2c230', 0, 0.75, 0), boite(2.1, 0.12, 0.9, '#fdfdfd', 0, 1.25, 0), boite(1.8, 0.3, 0.92, '#3a4a5a', 0, 0.95, 0));
      tram.position.set(1.4, 0, -1.6); tram.rotation.y = -0.25; g.add(tram);
    },
    train: g => {
      g.add(plancher('#3a3442'), boite(8, 3, 0.1, '#6a6476', 0, 1.5, -1.4));
      const vitre = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.9), new THREE.MeshBasicMaterial({ map: textureCanvas(64, 24, (c, l, h) => {
        c.fillStyle = '#9fd0f0'; c.fillRect(0, 0, l, h); c.fillStyle = '#5aa05a';
        c.beginPath(); c.moveTo(0, h); for (let x = 0; x <= l; x += 8) c.lineTo(x, h * 0.55 + Math.sin(x / 9) * 3); c.lineTo(l, h); c.fill();
      }), toneMapped: false }));
      vitre.position.set(0, 1.55, -1.34); g.add(vitre);
      [-1.4, 1.4].forEach(x => g.add(boite(0.9, 1.3, 0.25, '#2f5f9a', x, 0.65, -0.6)));
    }
  };
  // SPEC 110 — décors des pièces de Lux Démasque (primitives, aucun fichier).
  const lanterne = () => { const g = new THREE.Group(); const corps = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), lueur('#ff4a3a')); corps.scale.y = 1.25; g.add(corps, cylindre(0.1, 0.04, '#2a1a10', 0, 0.21, 0, 6), cylindre(0.1, 0.04, '#2a1a10', 0, -0.21, 0, 6)); return g; };
  Object.assign(FABRIQUES, {
    kyoto: g => {
      g.add(plancher('#cbb79a'));
      const ciel = boite(10, 4, 0.1, lueur('#f7a76a'), 0, 2, -4.2); g.add(ciel);
      const temple = new THREE.Group();
      temple.add(boite(3.2, 1.4, 1.6, '#5a2a22', 0, 0.7, 0), boite(3.8, 0.14, 2.1, '#2a1c20', 0, 1.5, 0), boite(2.4, 0.9, 1.2, '#6a3026', 0, 2.0, 0), boite(3.0, 0.12, 1.6, '#2a1c20', 0, 2.5, 0), boite(1.4, 0.6, 0.8, '#6a3026', 0, 2.85, 0), boite(1.9, 0.1, 1.1, '#2a1c20', 0, 3.2, 0));
      temple.position.set(0.4, 0, -3.2); g.add(temple);
      const torii = new THREE.Group();
      [-0.9, 0.9].forEach(x => torii.add(cylindre(0.08, 2.1, '#d8343c', x, 1.05, 0)));
      torii.add(boite(2.4, 0.14, 0.2, '#d8343c', 0, 2.05, 0), boite(2.0, 0.1, 0.16, '#2a1c20', 0, 2.2, 0), boite(2.0, 0.08, 0.14, '#d8343c', 0, 1.7, 0));
      torii.position.set(-0.9, 0, -1.6); g.add(torii);
      // Lanternes identiques, alignées à intervalles parfaits (le « montage » se voit après coup).
      [-1.8, -1.0, -0.2, 0.6, 1.4, 2.2].forEach(x => { const l = lanterne(); l.position.set(x, 2.35, -2.3); g.add(l); });
    },
    canape: g => {
      g.add(plancher('#5a3a2c'), boite(8, 3, 0.1, '#2c3450', 0, 1.5, -2.6));
      const tele = boite(1.6, 0.95, 0.1, '#111', 0.2, 1.35, -2.45); g.add(tele);
      g.add(boite(1.45, 0.8, 0.02, lueur('#3fa34a'), 0.2, 1.35, -2.39), boite(0.06, 0.6, 0.021, lueur('#ffffff'), 0.2, 1.35, -2.385));
      g.add(boite(2.6, 0.45, 0.9, '#7a4a8a', 0, 0.35, 0.9), boite(2.6, 0.6, 0.25, '#6a3a7a', 0, 0.8, 1.3), boite(0.25, 0.6, 0.9, '#6a3a7a', -1.3, 0.6, 0.9), boite(0.25, 0.6, 0.9, '#6a3a7a', 1.3, 0.6, 0.9));
    },
    chat: g => {
      g.add(plancher('#c9b391'), boite(8, 3, 0.1, '#e6d6bb', 0, 1.5, -1.6));
      const coussin = cylindre(0.75, 0.22, '#7a3fc4', 0, 0.11, 0, 12); coussin.scale.z = 0.8; g.add(coussin);
      const chat = new THREE.Group(), roux = '#e0832f', clair = '#f2b46a';
      const corps = new THREE.Mesh(new THREE.SphereGeometry(0.42, 8, 6), mat(roux)); corps.scale.set(1.3, 0.62, 0.95); corps.position.y = 0.42; chat.add(corps);
      const tete = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 6), mat(roux)); tete.position.set(0.5, 0.42, 0.12); chat.add(tete);
      [[0.42, 0.66, 0.02], [0.6, 0.66, 0.18]].forEach(([x, y, z]) => { const o = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.16, 4), mat(roux)); o.position.set(x, y, z); chat.add(o); });
      const museau = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 4), mat(clair)); museau.position.set(0.66, 0.36, 0.22); chat.add(museau);
      [[0.56, 0.45, 0.3], [0.72, 0.45, 0.16]].forEach(([x, y, z]) => chat.add(boite(0.08, 0.015, 0.02, '#3a2010', x, y, z))); // yeux fermés
      const queue = cylindre(0.06, 0.8, roux, -0.45, 0.3, 0.42, 6); queue.rotation.z = Math.PI / 2; queue.rotation.y = 0.6; chat.add(queue);
      chat.position.set(-0.1, 0.12, 0); chat.rotation.y = -0.3; g.add(chat);
    },
    bureau: g => {
      g.add(plancher('#4a4f5a'), boite(8, 3, 0.1, '#e9e4da', 0, 1.5, -2.2));
      g.add(boite(1.4, 0.9, 0.04, '#2f6fd6', -1.2, 1.6, -2.14), boite(1.2, 0.2, 0.041, '#f2c230', -1.2, 1.35, -2.13)); // affiche de voyage
      g.add(boite(2.2, 0.08, 0.9, '#7a5236', 0.7, 0.78, -1.2), boite(0.08, 0.76, 0.8, '#3a2a20', -0.3, 0.38, -1.2), boite(0.08, 0.76, 0.8, '#3a2a20', 1.7, 0.38, -1.2));
      g.add(boite(0.6, 0.4, 0.05, '#1c1b20', 1.0, 1.05, -1.4), boite(0.56, 0.34, 0.051, lueur('#9fd0f0'), 1.0, 1.05, -1.37));
      const valise = boite(0.5, 0.6, 0.25, '#d8343c', -0.9, 0.3, -0.4); g.add(valise, boite(0.2, 0.06, 0.04, '#1c1b20', -0.9, 0.63, -0.4));
    },
    hopital: g => {
      g.add(plancher('#cfd8dc'), boite(8, 3, 0.1, '#e6eef0', 0, 1.5, -2.2), boite(8, 0.3, 0.11, '#4fa3a5', 0, 0.15, -2.15));
      [-1.6, 1.6].forEach(x => g.add(boite(0.9, 2.1, 0.06, '#9fc7c9', x, 1.05, -2.12), boite(0.5, 0.5, 0.061, lueur('#dff6ff'), x, 1.55, -2.1)));
      g.add(boite(0.5, 0.5, 0.05, lueur('#2fa35a'), 0, 2.35, -2.12), boite(0.12, 0.34, 0.051, lueur('#ffffff'), 0, 2.35, -2.1), boite(0.34, 0.12, 0.051, lueur('#ffffff'), 0, 2.35, -2.1));
      g.add(boite(2.0, 0.08, 0.8, '#f2f4f5', 1.2, 0.7, -0.9), boite(2.0, 0.5, 0.06, '#b0bec5', 1.2, 0.95, -1.28));
    },
    chien: g => {
      g.add(plancher('#4f8f4a'), boite(1.1, 0.01, 8, '#cdb98f', 0.2, 0.005, -2));
      [[-1.6, -1.2, 2.2], [1.7, -1.6, 2.6], [-1.1, -3, 2.8]].forEach(a => g.add(arbre(...a)));
      const chien = new THREE.Group(), brun = '#8a5a2c', fonce = '#4a2e16';
      const corps = boite(0.6, 0.3, 0.26, brun, 0, 0.42, 0); chien.add(corps);
      chien.add(boite(0.26, 0.24, 0.22, brun, 0.38, 0.62, 0), boite(0.14, 0.1, 0.14, fonce, 0.55, 0.58, 0));
      [[0.4, 0.74, 0.08], [0.4, 0.74, -0.08]].forEach(([x, y, z]) => chien.add(boite(0.06, 0.14, 0.05, fonce, x, y, z)));
      [[-0.22, 0.13], [-0.22, -0.13], [0.22, 0.13], [0.22, -0.13]].forEach(([x, z]) => chien.add(boite(0.08, 0.3, 0.08, brun, x, 0.15, z * 0.9)));
      const queue = boite(0.05, 0.05, 0.26, fonce, -0.34, 0.56, 0); queue.rotation.y = Math.PI / 2; queue.rotation.z = 0.6; chien.add(queue);
      chien.position.set(0.6, 0, 0.3); chien.rotation.y = -0.5; g.add(chien);
    },
    pesto: g => {
      g.add(plancher('#6a4a36'), boite(3.4, 0.08, 1.8, '#f1e6cf', 0, 0.8, 0), cylindre(0.08, 0.8, '#3a2a20', 0, 0.4, 0));
      [[-0.55, 0.1], [0.6, -0.1]].forEach(([x, z]) => { g.add(cylindre(0.38, 0.04, '#ffffff', x, 0.86, z, 14)); const pates = cylindre(0.27, 0.07, '#5aa04a', x, 0.91, z, 10); g.add(pates); });
      g.add(cylindre(0.07, 0.24, '#f4f0ff', 0.05, 0.96, 0.5, 8), cylindre(0.12, 0.3, '#2a6a3a', -0.1, 0.99, -0.55, 8));
    },
    soupe: g => {   // grande marmite de soupe de pommes de terre et deux bols
      g.add(plancher('#6a4a36'), boite(3.4, 0.08, 1.8, '#f1e6cf', 0, 0.8, 0), cylindre(0.08, 0.8, '#3a2a20', 0, 0.4, 0));
      g.add(cylindre(0.5, 0.55, '#5a5f68', 0, 1.12, -0.2, 16), cylindre(0.46, 0.02, '#e8c860', 0, 1.4, -0.2, 16));
      [[-0.9, 0.35], [0.9, 0.35]].forEach(([x, z]) => g.add(cylindre(0.26, 0.14, '#ffffff', x, 0.91, z, 12), cylindre(0.22, 0.02, '#e8c860', x, 0.98, z, 12)));
    }
  });
  // Photo de preuve : décor + jusqu'à deux personnes posées. Un modèle affiché à l'écran
  // (interrogatoire en cours) est prêté le temps de la photo puis remis à sa place.
  // personnes = [{ profil, pose, x, z, rotation }]
  async function photo(nomScene, personnes, largeur, hauteur) {
    const l = largeur || 320, h = hauteur || 240;
    const liste = personnes || [];
    const gltfs = await Promise.all(liste.map(p => charger(p.profil.apparence3d.modele)));
    const pretes = [];
    liste.forEach((p, i) => {
      const racine = gltfs[i].scene;
      const avant = racine.parent ? { parent: racine.parent, pos: racine.position.clone(), rot: racine.rotation.clone() } : null;
      instancier(gltfs[i], teintesProfil(p.profil));
      racine.userData.anim.poser(p.pose || 'Idle', p.pose && p.pose !== 'Idle' ? 0.55 : 0.4);
      racine.position.set(p.x || 0, 0, p.z || 0); racine.rotation.y = p.rotation || 0;
      scenePortrait.add(racine);
      pretes.push({ racine, avant });
    });
    scenePortrait.background = new THREE.Color('#3a2a55');
    const fondDecor = decor(nomScene);
    if (fondDecor) scenePortrait.add(fondDecor);
    camPortrait.aspect = l / h; camPortrait.updateProjectionMatrix();
    camPortrait.position.set(0.3, 1.45, 5.4); camPortrait.lookAt(0.1, 1.05, -0.6);
    const ancien = { l: canvas.width, h: canvas.height, ratio: renderer.getPixelRatio() };
    renderer.setPixelRatio(1); renderer.setSize(l, h, false);
    renderer.render(scenePortrait, camPortrait);
    const url = canvas.toDataURL('image/webp', 0.86);
    pretes.forEach(({ racine, avant }) => {
      scenePortrait.remove(racine);
      if (avant) { avant.parent.add(racine); racine.position.copy(avant.pos); racine.rotation.copy(avant.rot); racine.userData.anim.jouer('Idle'); }
    });
    if (fondDecor) scenePortrait.remove(fondDecor);
    renderer.setPixelRatio(ancien.ratio); renderer.setSize(ancien.l / ancien.ratio, ancien.h / ancien.ratio, false);
    if (rendu) redimensionner();
    return url;
  }
  const decors = {};
  function decor(nom) {
    if (!FABRIQUES[nom]) return null;
    if (!decors[nom]) { decors[nom] = new THREE.Group(); FABRIQUES[nom](decors[nom]); }
    return decors[nom];
  }

  // Portrait : plan taille, pose figée, fond uni ; avec scene, plan large dans son décor.
  async function portrait(profil, pose, fond, largeur, hauteur, nomScene) {
    const l = largeur || 240, h = hauteur || 300;
    const modele = profil === 'alex' ? STYLES.casual.modele : profil.apparence3d.modele;
    const gltf = await charger(modele);
    // Modèle affiché à l'écran (aperçu du look ou rendez-vous en cours) : jamais déplacé pour un portrait.
    if (rendu && gltf.scene.parent === rendu.scene) throw new Error('modele_occupe');
    const racine = instancier(gltf, profil === 'alex' ? teintesAlex(null) : teintesProfil(profil));
    const nomPose = typeof pose === 'string' ? pose : 'Idle';
    racine.userData.anim.poser(nomPose, nomPose === 'Idle' ? 0.4 : 0.55);
    scenePortrait.add(racine);
    racine.rotation.y = -0.25;
    scenePortrait.background = new THREE.Color(fond || '#3a2a55');
    const fondDecor = decor(nomScene);
    if (fondDecor) scenePortrait.add(fondDecor);
    camPortrait.aspect = l / h; camPortrait.updateProjectionMatrix();
    const plein = nomPose !== 'Idle' || !!fondDecor;
    if (fondDecor) { camPortrait.position.set(0.4, 1.35, 5.2); camPortrait.lookAt(0.15, 1.0, -0.6); }
    else { camPortrait.position.set(0.25, plein ? 1.05 : 1.32, plein ? 4.6 : 2.9); camPortrait.lookAt(0, plein ? 0.9 : 1.22, 0); }
    const ancien = { l: canvas.width, h: canvas.height, ratio: renderer.getPixelRatio() };
    renderer.setPixelRatio(1); renderer.setSize(l, h, false);
    renderer.render(scenePortrait, camPortrait);
    const url = canvas.toDataURL('image/webp', 0.86);
    scenePortrait.remove(racine);
    if (fondDecor) scenePortrait.remove(fondDecor);
    renderer.setPixelRatio(ancien.ratio); renderer.setSize(ancien.l / ancien.ratio, ancien.h / ancien.ratio, false);
    if (rendu) redimensionner();
    return url;
  }

  // ── Écran LOOK : Alex pivote lentement entre la face et le trois-quarts (jamais de dos),
  // sur fond transparent (la cabine du dressing est dessinée en CSS).
  const sceneApercu = new THREE.Scene();
  sceneApercu.add(new THREE.HemisphereLight(0xd9c9ff, 0x2a2038, 2.0));
  const lumApercu = new THREE.DirectionalLight(0xffe0c0, 1.8); lumApercu.position.set(2, 3, 4); sceneApercu.add(lumApercu);
  const socle = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.66, 0.06, 24), new THREE.MeshLambertMaterial({ color: 0x3b2d55, emissive: 0xff4fd8, emissiveIntensity: 0.25 }));
  socle.position.y = -0.04; sceneApercu.add(socle);
  const camApercu = new THREE.PerspectiveCamera(32, 1, 0.1, 30);
  camApercu.position.set(0, 1.12, 3.55); camApercu.lookAt(0, 0.93, 0);
  let alexApercu = null, tempsApercu = 0;
  async function apercu(cible, look) {
    // Plusieurs clics rapides : seule la dernière demande est affichée.
    const numero = ++demande;
    const gltf = await charger(STYLES[(look && look.style) || 'casual'].modele);
    if (numero !== demande) return false;
    const nouveau = instancier(gltf, teintesAlex(look));
    // Un seul Alex sur le socle : l'ancien modèle (autre style) est retiré.
    if (alexApercu && alexApercu !== nouveau && alexApercu.parent === sceneApercu) sceneApercu.remove(alexApercu);
    alexApercu = nouveau;
    sceneApercu.add(alexApercu);
    alexApercu.userData.anim.jouer('Idle');
    if (!rendu || rendu.scene !== sceneApercu || conteneur !== cible) {
      attacher(cible, { scene: sceneApercu, camera: camApercu, avancer: dt => {
        if (!alexApercu) return;
        tempsApercu += dt;
        alexApercu.rotation.y = Math.sin(tempsApercu * 0.6) * 0.6; // ±35° autour de la face
        alexApercu.userData.anim.avancer(dt);
      } });
    }
    return true;
  }
  // Petit saut de joie quand on change de look.
  function saluerApercu() { if (alexApercu) alexApercu.userData.anim.jouer('Jump', true); }

  // ── Écran DATE : café néon.
  const sceneDate = new THREE.Scene();
  sceneDate.background = new THREE.Color('#150f20');
  sceneDate.fog = new THREE.Fog(0x150f20, 6, 14);
  sceneDate.add(new THREE.HemisphereLight(0xb9a0ff, 0x241a2a, 1.25));
  const chaude = new THREE.PointLight(0xffb070, 7, 7, 1.6); chaude.position.set(0.2, 2.5, -0.2); sceneDate.add(chaude);
  const rose = new THREE.PointLight(0xff4fd8, 2, 5, 1.6); rose.position.set(1.6, 2.2, -3); sceneDate.add(rose);
  const face = new THREE.DirectionalLight(0xffe2c4, 1.1); face.position.set(-1, 3, 4); sceneDate.add(face);
  const sol = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.MeshLambertMaterial({ map: textureSol() }));
  sol.rotation.x = -Math.PI / 2; sceneDate.add(sol);
  const pieces = {};
  let cafeMeuble = false;
  // Meubles Kenney, posés au premier rendez-vous (chargés en arrière-plan).
  function meublerCafe(cafe) {
  if (cafeMeuble) return;
  cafeMeuble = true;
  // Matériaux mats, assombris pour l'ambiance de nuit.
  cafe.scene.traverse(o => {
    if (!o.isMesh) return;
    o.material = [].concat(o.material).map(m => new THREE.MeshLambertMaterial({ color: m.color.clone().multiplyScalar(0.55), flatShading: true }));
    if (o.material.length === 1) o.material = o.material[0];
  });
  cafe.scene.children.forEach(c => { pieces[c.name] = c; });
  const murs = new THREE.MeshLambertMaterial({ color: 0x2e2340, flatShading: true });
  function meuble(nom, x, z, rotation, echelle) {
    const source = pieces[nom];
    if (!source) return null;
    const m = source.clone();
    m.scale.setScalar(echelle || ECHELLE_MEUBLES);
    m.rotation.y = rotation || 0;
    m.position.set(x, 0, z);
    m.updateMatrixWorld(true);
    const b = new THREE.Box3().setFromObject(m);
    m.position.y -= b.min.y; // posé sur le sol
    if (nom.indexOf('wall') === 0) m.traverse(o => { if (o.isMesh) o.material = murs; });
    sceneDate.add(m);
    return m;
  }
  // Murs du fond avec fenêtres, comptoir à gauche, plantes et lampes.
  for (let i = -3; i <= 2; i++) meuble(i % 2 ? 'wallWindow' : 'wall', i * ECHELLE_MEUBLES, -3.6);
  for (let i = 0; i < 3; i++) meuble('kitchenBar', -3.4 + i * 1.03, -2.2);
  meuble('kitchenBarEnd', -0.3, -2.2);
  meuble('kitchenCoffeeMachine', -2.6, -2.55);
  meuble('kitchenBlender', -1.7, -2.5);
  for (let i = 0; i < 3; i++) meuble('stoolBar', -3.1 + i * 0.95, -1.35);
  meuble('pottedPlant', 2.3, -3.0); meuble('pottedPlant', -3.6, -0.6);
  meuble('lampRoundFloor', 2.9, -1.2);
  meuble('tableCloth', 2.2, -1.4, -0.4);
  meuble('chairCushion', 2.7, -0.6, Math.PI);
  meuble('rugRound', -0.85, 0.15);
  }
  // Table haute (mange-debout) entre les deux personnages, et deux tasses.
  const bois = new THREE.MeshLambertMaterial({ color: 0x5a3a2a, flatShading: true });
  const metal = new THREE.MeshLambertMaterial({ color: 0x2a2433, flatShading: true });
  const plateau = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.06, 10), bois); plateau.position.set(-0.3, 0.9, -0.15);
  const pied = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.88, 6), metal); pied.position.set(-0.3, 0.44, -0.15);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.32, 0.04, 10), metal); base.position.set(-0.3, 0.02, -0.15);
  sceneDate.add(plateau, pied, base);
  const tasse = new THREE.MeshLambertMaterial({ color: 0xf4efe6 });
  [[-0.42, -0.02], [-0.12, -0.3]].forEach(([x, z]) => {
    const t = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.1, 8), tasse);
    t.position.set(x, 0.98, z); sceneDate.add(t);
  });
  // Enseigne néon et halos.
  const enseigne = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.6), new THREE.MeshBasicMaterial({ map: textureEnseigne(), transparent: true, depthWrite: false, toneMapped: false }));
  enseigne.scale.setScalar(0.7); enseigne.position.set(0.55, 2.4, -3.5); sceneDate.add(enseigne);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: textureLueur('rgba(255,120,220,0.55)'), depthWrite: false, toneMapped: false }));
  halo.scale.set(2.4, 1.1, 1); halo.position.set(0.55, 2.4, -3.45); sceneDate.add(halo);
  // Guirlande d'ampoules chaudes le long du mur du fond.
  const ampoule = textureLueur('rgba(255,200,120,1)');
  const guirlande = [];
  for (let i = 0; i < 16; i++) {
    const x = -4.2 + i * 0.55, y = 2.05 - Math.sin(i / 15 * Math.PI) * 0.18 - (i % 2) * 0.04;
    const b = new THREE.Sprite(new THREE.SpriteMaterial({ map: ampoule, depthWrite: false, toneMapped: false, transparent: true }));
    b.scale.setScalar(0.22); b.position.set(x, y, -3.3); sceneDate.add(b); guirlande.push(b);
  }
  // Petits cœurs / étincelles de réaction.
  const etincelles = new THREE.Points(new THREE.BufferGeometry(), new THREE.PointsMaterial({ map: textureLueur('rgba(255,210,120,1)'), size: 0.14, transparent: true, depthWrite: false, toneMapped: false }));
  const NB = 24, posEtincelles = new Float32Array(NB * 3), vitEtincelles = new Float32Array(NB * 3);
  etincelles.geometry.setAttribute('position', new THREE.BufferAttribute(posEtincelles, 3));
  etincelles.frustumCulled = false; etincelles.visible = false; sceneDate.add(etincelles);
  let vieEtincelles = 0;

  const camDate = new THREE.PerspectiveCamera(44, 1, 0.1, 40);
  const VISEE = new THREE.Vector3(0.1, 0.62, -0.9);   // visée basse : son visage reste au-dessus des réponses
  const VISEE_ZOOM = new THREE.Vector3(0.2, 1.4, -0.85); // zoom dramatique : sur son visage
  const viseeCourante = new THREE.Vector3();
  const POSE_CAM = new THREE.Vector3(-0.55, 1.7, 3.7);
  // Cadrages : rendez-vous Lux Match (inchangé) et interrogatoire Lux Démasque (visage plus haut,
  // au-dessus de la carte de déposition et des deux boutons).
  const CADRAGE_DATE = { pose: POSE_CAM, visee: VISEE, viseeZoom: VISEE_ZOOM, poseZoom: new THREE.Vector3(0.1, 1.45, 0.6) };
  const CADRAGE_INTERROGATOIRE = { pose: new THREE.Vector3(0.25, 1.6, 2.8), visee: new THREE.Vector3(0.2, 1.0, -0.85),
    // Zoom : le visage reste dans le tiers haut (la feuille du verdict occupe le bas de l'écran).
    viseeZoom: new THREE.Vector3(0.2, 1.12, -0.85), poseZoom: new THREE.Vector3(0.22, 1.62, 1.5) };
  const etatDate = { partenaire: null, alex: null, temps: 0, zoom: 0, secousse: 0, fige: 0, parle: 0, tete: null, geste: null, decalage: [0, 0, 0], cadrage: CADRAGE_DATE };
  // Gestes sobres de la tête (SPEC §12.5) : ajoutés par-dessus l'animation Idle.
  // t va de 0 à 1 ; chaque geste renvoie [hocher (x), tourner (y), pencher (z)] en radians.
  const GESTES = {
    hoche: { duree: 0.9, forme: t => [Math.sin(t * Math.PI * 4) * 0.16 * (1 - t), 0, 0] },
    sourire: { duree: 1.1, forme: t => [-0.05 * Math.sin(t * Math.PI), 0, 0.14 * Math.sin(t * Math.PI)] },
    sourcil: { duree: 1.5, forme: t => { const m = Math.min(1, t * 4) * Math.min(1, (1 - t) * 3); return [-0.12 * m, 0.12 * m, -0.18 * m]; } },
    gene: { duree: 1.3, forme: t => { const m = Math.sin(t * Math.PI); return [0.28 * m, -0.1 * m, 0]; } },
    froid: { duree: 1.8, forme: t => { const m = Math.min(1, t * 3) * Math.min(1, (1 - t) * 2); return [0.05 * m, 0.38 * m, 0]; } },
    rire: { duree: 1.2, forme: t => [-0.2 * Math.sin(t * Math.PI) + Math.sin(t * Math.PI * 10) * 0.06 * (1 - t), 0, Math.sin(t * Math.PI * 5) * 0.05] }
  };

  async function date(cible, profil, look) {
    const numero = ++demande;
    const [gltfPartenaire, gltfAlex, cafe] = await Promise.all([
      charger(profil.apparence3d.modele), charger(STYLES[(look && look.style) || 'casual'].modele), charger('cafe')
    ]);
    // Partie quittée ou relancée pendant le chargement : on n'affiche rien.
    if (numero !== demande) return false;
    const partenaire = instancier(gltfPartenaire, teintesProfil(profil));
    const alex = instancier(gltfAlex, teintesAlex(look));
    meublerCafe(cafe);
    // Partie précédente : ses personnages quittent le café (jamais deux partenaires à la fois).
    [etatDate.partenaire, etatDate.alex].forEach(ancien => {
      if (ancien && ancien !== partenaire && ancien !== alex && ancien.parent === sceneDate) sceneDate.remove(ancien);
    });
    partenaire.position.set(0.2, 0, -0.85); partenaire.rotation.y = -0.18;
    alex.position.set(-1.2, 0, 1.45); alex.rotation.y = Math.PI + 0.55;
    sceneDate.add(partenaire); sceneDate.add(alex);
    partenaire.userData.anim.jouer('Idle'); alex.userData.anim.jouer('Idle');
    etatDate.partenaire = partenaire; etatDate.alex = alex;
    if (etatDate.tete) { etatDate.tete.rotation.x -= etatDate.decalage[0]; etatDate.tete.rotation.y -= etatDate.decalage[1]; etatDate.tete.rotation.z -= etatDate.decalage[2]; }
    etatDate.decalage = [0, 0, 0];
    etatDate.tete = null; etatDate.geste = null; etatDate.zoom = 0; etatDate.fige = 0;
    etatDate.cadrage = CADRAGE_DATE;
    enseigne.visible = halo.visible = true;
    partenaire.traverse(o => { if (o.isBone && /^Head$/i.test(o.name)) etatDate.tete = o; });
    attacher(cible, { scene: sceneDate, camera: camDate, avancer: avancerDate });
    return true;
  }
  // SPEC 110 : le prétendant seul au café, face au joueur (aucun avatar joueur).
  // Mêmes réactions que la partenaire de Lux Match (reagir, pointTete).
  async function interrogatoire(cible, profil) {
    const numero = ++demande;
    const [gltf, cafe] = await Promise.all([charger(profil.apparence3d.modele), charger('cafe')]);
    if (numero !== demande) return false;
    const suspect = instancier(gltf, teintesProfil(profil));
    meublerCafe(cafe);
    [etatDate.partenaire, etatDate.alex].forEach(ancien => {
      if (ancien && ancien !== suspect && ancien.parent === sceneDate) sceneDate.remove(ancien);
    });
    suspect.position.set(0.2, 0, -0.85); suspect.rotation.y = -0.1;
    sceneDate.add(suspect);
    suspect.userData.anim.jouer('Idle');
    if (etatDate.tete) { etatDate.tete.rotation.x -= etatDate.decalage[0]; etatDate.tete.rotation.y -= etatDate.decalage[1]; etatDate.tete.rotation.z -= etatDate.decalage[2]; }
    etatDate.decalage = [0, 0, 0];
    etatDate.partenaire = suspect; etatDate.alex = null;
    etatDate.tete = null; etatDate.geste = null; etatDate.zoom = 0; etatDate.fige = 0;
    etatDate.cadrage = CADRAGE_INTERROGATOIRE;
    enseigne.visible = halo.visible = false; // l'enseigne « LUX ♥ MATCH » appartient à l'autre jeu
    suspect.traverse(o => { if (o.isBone && /^Head$/i.test(o.name)) etatDate.tete = o; });
    attacher(cible, { scene: sceneDate, camera: camDate, avancer: avancerDate });
    return true;
  }
  function avancerDate(dt) {
    const e = etatDate;
    e.temps += dt;
    const ralenti = e.fige > 0 ? 0 : dt;
    e.fige = Math.max(0, e.fige - dt);
    // On retire d'abord le décalage de tête de l'image précédente (l'Idle n'anime pas
    // forcément la tête : sans cela, les gestes s'additionneraient d'image en image).
    if (e.tete) { e.tete.rotation.x -= e.decalage[0]; e.tete.rotation.y -= e.decalage[1]; e.tete.rotation.z -= e.decalage[2]; }
    if (e.partenaire) e.partenaire.userData.anim.avancer(ralenti);
    if (e.alex) e.alex.userData.anim.avancer(ralenti);
    // Nouveau décalage : elle « parle » (petits hochements) + geste en cours (sourcil, regard…).
    const d = [0, 0, 0];
    if (e.parle > 0) { e.parle -= dt; d[0] += Math.sin(e.temps * 14) * 0.05 * Math.min(1, e.parle); }
    if (e.geste) {
      e.geste.t += dt / e.geste.modele.duree;
      if (e.geste.t >= 1) e.geste = null;
      else { const f = e.geste.modele.forme(e.geste.t); d[0] += f[0]; d[1] += f[1]; d[2] += f[2]; }
    }
    if (e.tete) { e.tete.rotation.x += d[0]; e.tete.rotation.y += d[1]; e.tete.rotation.z += d[2]; }
    e.decalage = d;
    // Caméra : légère respiration, zoom dramatique et secousse sur les réactions.
    e.zoom = Math.max(0, e.zoom - dt * 0.6);
    e.secousse = Math.max(0, e.secousse - dt);
    const z = Math.min(1, e.zoom);
    camDate.position.lerpVectors(e.cadrage.pose, e.cadrage.poseZoom, z * 0.85);
    camDate.position.x += Math.sin(e.temps * 0.5) * 0.03 + (e.secousse ? (Math.random() - 0.5) * 0.08 : 0);
    camDate.position.y += Math.sin(e.temps * 0.8) * 0.015;
    camDate.lookAt(viseeCourante.lerpVectors(e.cadrage.visee, e.cadrage.viseeZoom, z));
    halo.material.opacity = 0.75 + Math.sin(e.temps * 3) * 0.15;
    guirlande.forEach((b, i) => { b.material.opacity = 0.75 + Math.sin(e.temps * 2 + i * 1.7) * 0.25; });
    if (vieEtincelles > 0) {
      vieEtincelles -= dt;
      for (let i = 0; i < NB; i++) {
        vitEtincelles[i * 3 + 1] -= 1.2 * dt;
        posEtincelles[i * 3] += vitEtincelles[i * 3] * dt; posEtincelles[i * 3 + 1] += vitEtincelles[i * 3 + 1] * dt; posEtincelles[i * 3 + 2] += vitEtincelles[i * 3 + 2] * dt;
      }
      etincelles.geometry.attributes.position.needsUpdate = true;
      etincelles.material.opacity = Math.min(1, vieEtincelles);
      etincelles.visible = vieEtincelles > 0;
    }
  }
  function eclater(couleur) {
    etincelles.material.color.set(couleur);
    for (let i = 0; i < NB; i++) {
      posEtincelles[i * 3] = 0.2 + (Math.random() - 0.5) * 0.3; posEtincelles[i * 3 + 1] = 1.55; posEtincelles[i * 3 + 2] = -0.8;
      vitEtincelles[i * 3] = (Math.random() - 0.5) * 1.4; vitEtincelles[i * 3 + 1] = 0.8 + Math.random() * 1.2; vitEtincelles[i * 3 + 2] = (Math.random() - 0.5) * 0.6;
    }
    vieEtincelles = 1.3; etincelles.visible = true;
  }
  // Réactions sobres (gestes de tête) : hoche, sourire, sourcil, gene, froid, rire.
  // Grands effets réservés aux moments rares : joie (fin heureuse), scratch, zoom, deception (fin ratée).
  function reagir(type) {
    const e = etatDate;
    if (!e.partenaire) return;
    const anim = e.partenaire.userData.anim;
    if (type === 'parle') { e.parle = 1.1; return; }
    if (GESTES[type]) {
      e.geste = { modele: GESTES[type], t: 0 };
      if (type === 'rire') eclater('#ffb3ff');
      if (type === 'froid') e.zoom = Math.max(e.zoom, 0.35);
      return;
    }
    if (type === 'joie') { anim.jouer('Victory', true); eclater('#ffd27a'); }
    else if (type === 'pas_mal') { anim.jouer('Jump', true); }
    else if (type === 'rire') { anim.jouer('Jump', true); eclater('#ffb3ff'); }
    else if (type === 'deception') { anim.jouer('Defeat', true); }
    else if (type === 'surprise') { anim.jouer('RecieveHit', true); e.secousse = 0.3; }
    else if (type === 'zoom') { e.zoom = 1.6; anim.jouer('RecieveHit', true); }
    else if (type === 'scratch') { e.fige = 1.1; e.zoom = 1.3; }
    else if (type === 'froid') { anim.jouer('Defeat', true); e.zoom = 0.6; }
  }

  // Position à l'écran (0–1) d'un point juste au-dessus de la tempe de la partenaire,
  // calculée à la demande avec la caméra du café (aucune boucle supplémentaire).
  const pointTemp = new THREE.Vector3();
  function pointTete() {
    if (!etatDate.tete || !rendu || rendu.scene !== sceneDate) return null;
    etatDate.tete.getWorldPosition(pointTemp);
    pointTemp.y += 0.22; pointTemp.x += 0.16;
    pointTemp.project(camDate);
    return { x: (pointTemp.x + 1) / 2, y: (1 - pointTemp.y) / 2 };
  }

  // Nombre de personnages par scène (tests : aucun doublon après plusieurs parties).
  function diagnostic() {
    const compter = scene => scene.children.filter(o => o.userData.personnage).length;
    return { apercu: compter(sceneApercu), date: compter(sceneDate), portrait: compter(scenePortrait), attache: rendu ? (rendu.scene === sceneDate ? 'date' : 'apercu') : null };
  }

  // Arrêt demandé par l'interface : annule aussi les scènes encore en chargement.
  function arreter() { demande++; detacher(); }

  return { portrait, apercu, saluerApercu, date, reagir, detacher: arreter, diagnostic, pointTete, interrogatoire, photo };
}
// Une seule instance pour toute l'appli (Lux Match et Lux Démasque) : un seul WebGLRenderer.
let instance = null;
function partage() {
  if (!instance) { instance = creer(); instance.catch(() => { instance = null; }); }
  return instance;
}

// Préchargement sans créer de contexte WebGL (depuis le hub Jeux) : animations + modèles.
function precharger(noms) {
  return Promise.all(['anims'].concat(noms || []).map(n => charger(n).catch(() => null)));
}

window.LuxMatch3D = { creer, precharger, partage };
