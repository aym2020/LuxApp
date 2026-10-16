// ─── ANIMATIONS (catalogue S12) ─────────────────────────────────────────────
// Presque tout est en CSS (classes .entre, .remplit, .vient-de-finir… dans
// style.css). Ici, trois aides seulement : un score qui compte, des étoiles
// qui apparaissent une par une, des confettis.
// Règles : on n'anime que transform et opacity, une animation ne bloque
// jamais un appui, et tout est coupé si le téléphone demande moins d'animations.

function animationsReduites() {
  return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
}

// Fait compter un nombre de 0 à « cible » (ex. le score de fin d'unité).
// suffixe : texte ajouté après le nombre (ex. ' %').
function compterJusqua(el, cible, duree, suffixe) {
  suffixe = suffixe || '';
  if (!el) return;
  if (animationsReduites()) { el.textContent = cible + suffixe; return; }
  const debut = performance.now();
  function etape(maintenant) {
    const avance = Math.min(1, (maintenant - debut) / duree);
    const adouci = 1 - Math.pow(1 - avance, 3); // ralentit à la fin
    el.textContent = Math.round(cible * adouci) + suffixe;
    if (avance < 1) requestAnimationFrame(etape);
  }
  requestAnimationFrame(etape);
}

// Fait apparaître les étoiles pleines (.pc-star.on) l'une après l'autre.
function etoilesUneParUne(conteneur, delai) {
  if (!conteneur || animationsReduites()) return;
  const pleines = conteneur.querySelector('.pc-star.on');
  if (!pleines || !pleines.textContent) return;
  // Les étoiles pleines sont un seul texte « ★★★ » : on les sépare en spans.
  const nb = pleines.textContent.length;
  pleines.innerHTML = '';
  for (let i = 0; i < nb; i++) {
    const s = document.createElement('span');
    s.className = 'etoile-pop';
    s.textContent = '★';
    s.style.animationDelay = (delai + i * 180) + 'ms';
    pleines.appendChild(s);
  }
}

// Confettis dorés légers (une vingtaine de petits carrés), pour les grands moments.
function confettis() {
  if (animationsReduites()) return;
  const couleurs = ['#f5cf4d', '#ffaf5e', '#54e0ad', '#4fd1c5', '#7db4f5', '#f6f1e9'];
  const box = document.createElement('div');
  box.className = 'confettis';
  box.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < 28; i++) {
    const c = document.createElement('i');
    c.style.left = Math.random() * 100 + '%';
    c.style.background = couleurs[i % couleurs.length];
    c.style.setProperty('--dx', (Math.random() * 120 - 60) + 'px');
    c.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg');
    c.style.animationDelay = (Math.random() * 0.25) + 's';
    box.appendChild(c);
  }
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 1700);
}

// Fin d'unité : score qui compte, étoiles une par une, confettis si sans faute.
function animerFin(sansFaute) {
  const score = document.querySelector('#pf-content .pf-score');
  if (score) {
    const cible = parseInt(score.textContent, 10) || 0;
    compterJusqua(score, cible, 700, ' %');
  }
  etoilesUneParUne(document.querySelector('#pf-content .pf-stars'), 500);
  if (sansFaute) setTimeout(confettis, 800);
}
