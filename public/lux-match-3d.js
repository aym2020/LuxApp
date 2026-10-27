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
     detacher()                    → arrête la boucle et retire le canvas. */
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
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: false });
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
  async function personnage(modele, teintes) {
    const gltf = await charger(modele);
    const racine = preparerPersonnage(gltf);
    teindre(racine, teintes);
    if (racine.parent) racine.parent.remove(racine);
    racine.position.set(0, 0, 0); racine.rotation.set(0, 0, 0);
    if (!racine.userData.anim) racine.userData.anim = animateur(racine, clips);
    return racine;
  }

  // Portrait : plan taille, pose figée, fond en dégradé.
  async function portrait(profil, pose, fond, largeur, hauteur) {
    const l = largeur || 240, h = hauteur || 300;
    const modele = profil === 'alex' ? STYLES.casual.modele : profil.apparence3d.modele;
    // Modèle affiché à l'écran (aperçu du look ou rendez-vous en cours) : jamais déplacé pour un portrait.
    const gltf = await charger(modele);
    if (rendu && gltf.scene.parent === rendu.scene) throw new Error('modele_occupe');
    const racine = await personnage(modele, profil === 'alex' ? teintesAlex(null) : teintesProfil(profil));
    const nomPose = typeof pose === 'string' ? pose : 'Idle';
    racine.userData.anim.poser(nomPose, nomPose === 'Idle' ? 0.4 : 0.55);
    scenePortrait.add(racine);
    racine.rotation.y = -0.25;
    scenePortrait.background = new THREE.Color(fond || '#3a2a55');
    camPortrait.aspect = l / h; camPortrait.updateProjectionMatrix();
    const plein = nomPose !== 'Idle';
    camPortrait.position.set(0.25, plein ? 1.05 : 1.32, plein ? 4.6 : 2.9);
    camPortrait.lookAt(0, plein ? 0.9 : 1.22, 0);
    const ancien = { l: canvas.width, h: canvas.height, ratio: renderer.getPixelRatio() };
    renderer.setPixelRatio(1); renderer.setSize(l, h, false);
    renderer.render(scenePortrait, camPortrait);
    const url = canvas.toDataURL('image/webp', 0.86);
    scenePortrait.remove(racine);
    renderer.setPixelRatio(ancien.ratio); renderer.setSize(ancien.l / ancien.ratio, ancien.h / ancien.ratio, false);
    if (rendu) redimensionner();
    return url;
  }

  // ── Écran LOOK : Alex tourne doucement sur un socle néon.
  const sceneApercu = new THREE.Scene();
  sceneApercu.background = new THREE.Color('#1a1426');
  sceneApercu.add(new THREE.HemisphereLight(0xd9c9ff, 0x2a2038, 2.0));
  const lumApercu = new THREE.DirectionalLight(0xffe0c0, 1.8); lumApercu.position.set(2, 3, 4); sceneApercu.add(lumApercu);
  const socle = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.8, 0.08, 24), new THREE.MeshLambertMaterial({ color: 0x3b2d55, emissive: 0x6b3fd1, emissiveIntensity: 0.35 }));
  socle.position.y = -0.04; sceneApercu.add(socle);
  const camApercu = new THREE.PerspectiveCamera(32, 1, 0.1, 30);
  camApercu.position.set(0, 1.15, 4.3); camApercu.lookAt(0, 0.85, 0);
  let alexApercu = null, demandeApercu = 0;
  async function apercu(cible, look) {
    // Plusieurs clics rapides : seule la dernière demande est affichée.
    const numero = ++demandeApercu;
    const nouveau = await personnage(STYLES[(look && look.style) || 'casual'].modele, teintesAlex(look));
    if (numero !== demandeApercu) return false;
    // Un seul Alex sur le socle : l'ancien modèle (autre style) est retiré.
    if (alexApercu && alexApercu !== nouveau && alexApercu.parent === sceneApercu) sceneApercu.remove(alexApercu);
    const angle = alexApercu ? alexApercu.rotation.y : 0;
    alexApercu = nouveau;
    alexApercu.rotation.y = angle;
    sceneApercu.add(alexApercu);
    alexApercu.userData.anim.jouer('Idle');
    if (!rendu || rendu.scene !== sceneApercu || conteneur !== cible) {
      attacher(cible, { scene: sceneApercu, camera: camApercu, avancer: dt => {
        if (!alexApercu) return;
        alexApercu.rotation.y += dt * 0.7;
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
  const VISEE = new THREE.Vector3(0.1, 1.0, -0.9);
  const POSE_CAM = new THREE.Vector3(-0.85, 1.95, 3.3);
  const etatDate = { partenaire: null, alex: null, temps: 0, zoom: 0, secousse: 0, fige: 0, parle: 0, tete: null };

  async function date(cible, profil, look) {
    const [partenaire, alex, cafe] = await Promise.all([
      personnage(profil.apparence3d.modele, teintesProfil(profil)),
      personnage(STYLES[(look && look.style) || 'casual'].modele, teintesAlex(look)),
      charger('cafe')
    ]);
    meublerCafe(cafe);
    // Partie précédente : ses personnages quittent le café (jamais deux partenaires à la fois).
    [etatDate.partenaire, etatDate.alex].forEach(ancien => {
      if (ancien && ancien !== partenaire && ancien !== alex && ancien.parent === sceneDate) sceneDate.remove(ancien);
    });
    partenaire.position.set(0.2, 0, -0.85); partenaire.rotation.y = -0.18;
    alex.position.set(-0.95, 0, 1.55); alex.rotation.y = Math.PI + 0.45;
    sceneDate.add(partenaire); sceneDate.add(alex);
    partenaire.userData.anim.jouer('Idle'); alex.userData.anim.jouer('Idle');
    etatDate.partenaire = partenaire; etatDate.alex = alex;
    etatDate.tete = null;
    partenaire.traverse(o => { if (o.isBone && /^Head$/i.test(o.name)) etatDate.tete = o; });
    attacher(cible, { scene: sceneDate, camera: camDate, avancer: avancerDate });
    return true;
  }
  function avancerDate(dt) {
    const e = etatDate;
    e.temps += dt;
    const ralenti = e.fige > 0 ? 0 : dt;
    e.fige = Math.max(0, e.fige - dt);
    if (e.partenaire) e.partenaire.userData.anim.avancer(ralenti);
    if (e.alex) e.alex.userData.anim.avancer(ralenti);
    // Elle « parle » : petits hochements de tête après chaque nouvelle réplique.
    if (e.tete && e.parle > 0) { e.parle -= dt; e.tete.rotation.x += Math.sin(e.temps * 14) * 0.012; }
    // Caméra : légère respiration, zoom dramatique et secousse sur les réactions.
    e.zoom = Math.max(0, e.zoom - dt * 0.6);
    e.secousse = Math.max(0, e.secousse - dt);
    const z = Math.min(1, e.zoom);
    camDate.position.lerpVectors(POSE_CAM, new THREE.Vector3(0.1, 1.45, 0.6), z * 0.85);
    camDate.position.x += Math.sin(e.temps * 0.5) * 0.03 + (e.secousse ? (Math.random() - 0.5) * 0.08 : 0);
    camDate.position.y += Math.sin(e.temps * 0.8) * 0.015;
    camDate.lookAt(VISEE);
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
  // type : parle, joie, deception, surprise, rire, zoom, scratch, froid, pas_mal
  function reagir(type) {
    const e = etatDate;
    if (!e.partenaire) return;
    const anim = e.partenaire.userData.anim;
    if (type === 'parle') { e.parle = 1.1; return; }
    if (type === 'joie') { anim.jouer('Victory', true); eclater('#ffd27a'); }
    else if (type === 'pas_mal') { anim.jouer('Jump', true); }
    else if (type === 'rire') { anim.jouer('Jump', true); eclater('#ffb3ff'); }
    else if (type === 'deception') { anim.jouer('Defeat', true); }
    else if (type === 'surprise') { anim.jouer('RecieveHit', true); e.secousse = 0.3; }
    else if (type === 'zoom') { e.zoom = 1.6; anim.jouer('RecieveHit', true); }
    else if (type === 'scratch') { e.fige = 1.1; e.zoom = 1.3; }
    else if (type === 'froid') { anim.jouer('Defeat', true); e.zoom = 0.6; }
  }

  return { portrait, apercu, saluerApercu, date, reagir, detacher };
}

// Préchargement sans créer de contexte WebGL (depuis le hub Jeux) : animations + modèles.
function precharger(noms) {
  return Promise.all(['anims'].concat(noms || []).map(n => charger(n).catch(() => null)));
}

window.LuxMatch3D = { creer, precharger };
