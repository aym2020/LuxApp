// SPEC 83 — Leçon 0 : découverte libre avant chaque activité, sans note ni autoplay.
// Unité 1 : sons LOD ; unité 2 : United Zoha ; unité 3 : pronoms personnels.
// Les exercices et le score n'existent pas encore pendant cette découverte.
'use strict';

let decouverteActive = null; // { leconId, uniteId, index }

function decouvertePour(l, uniteId) {
  const unite = l && l.unites && l.unites.find(u => u.id === Number(uniteId));
  return l && l.id === 0 && unite && Array.isArray(unite.decouverte)
    ? unite.decouverte : [];
}

function demarrerDecouverte(uniteId, index) {
  if (!pLecon || pLecon.id !== 0) return;
  const items = decouvertePour(pLecon, uniteId);
  if (!items.length) return;
  arreterAudio();
  fermerClavier();
  decouverteActive = {
    leconId: pLecon.id,
    uniteId: Number(uniteId),
    index: Math.min(items.length - 1, Math.max(0, Number(index) || 0))
  };
  showView('view-decouverte');
  afficherDecouverte();
}

function afficherDecouverte() {
  if (!decouverteActive || !pLecon || pLecon.id !== decouverteActive.leconId) return;
  const uniteId = decouverteActive.uniteId;
  const items = decouvertePour(pLecon, uniteId);
  const i = decouverteActive.index;
  const ex = items[i];
  if (!ex) return;
  const sons = uniteId === 1;
  const pronoms = uniteId === 3;
  const titre = sons ? 'Découvre les sons' : pronoms ? 'Apprends les pronoms' : 'Observe la règle du N';
  const phrase = sons
    ? 'Écoute le son et son exemple. Aucun mot à mémoriser.'
    : pronoms ? 'Découvre ces petits mots avant de les retrouver dans les prochaines leçons.'
    : 'Compare les formes avec et sans N. Aucun mot à deviner.';
  document.getElementById('dc-titre').textContent = titre;
  document.getElementById('dc-soustitre').textContent = phrase;
  document.getElementById('dc-etape').textContent = (sons ? 'SON ' : pronoms ? 'PRONOM ' : 'EXEMPLE ') + (i + 1) + ' SUR ' + items.length;
  document.getElementById('dc-compteur').textContent = (i + 1) + ' / ' + items.length;
  document.getElementById('dc-progression').style.width = Math.round((i + 1) / items.length * 100) + '%';
  document.getElementById('dc-retour').disabled = i === 0;
  document.getElementById('dc-suite').textContent =
    i === items.length - 1 ? (sons ? 'Passer aux 20 écoutes →' : pronoms ? 'Passer aux 8 questions →' : 'Passer aux 15 exercices →') : 'Continuer →';

  let html;
  if (sons) {
    html = '<div class="dc-mini">LE SON À DÉCOUVRIR</div>' +
      '<div class="dc-son" lang="lb">' + escHtml(ex.son) + '</div>' +
      '<div class="dc-indice">' + escHtml(ex.indication) + '</div>' +
      '<div class="dc-mini">EXEMPLE LUXEMBOURGEOIS</div>' +
      '<div class="dc-mot" lang="lb">' + escHtml(ex.mot) + '</div>' +
      '<button type="button" class="dc-ecouter bouton-ecouter" onclick="ecouterDecouverte(this)" ' +
        'aria-label="Écouter la prononciation du mot ' + attrHtml(ex.mot) + '">' +
        ICONE_ECOUTER + '<span>Écouter le mot</span></button>' +
      '<p class="dc-note">Tu peux réécouter et continuer quand tu veux.</p>';
  } else if (pronoms) {
    html = '<div class="dc-mini">EN LUXEMBOURGEOIS</div>' +
      '<div class="dc-pronom-ligne"><div class="dc-pronom" lang="lb">' + escHtml(ex.pronom) + '</div>' +
      boutonEcouterHtml(ex.pronom, true) + '</div>' +
      '<div class="dc-traduction">' + escHtml(ex.fr) + '</div>' +
      '<div class="dc-mini">EXEMPLE</div>' +
      '<div class="dc-exemple" lang="lb">' + escHtml(ex.exemple) + '</div>' +
      '<p class="dc-explication">' + escHtml(ex.explication) + '</p>';
  } else {
    const espace = ex.forme.indexOf(' ');
    const prefixe = ex.forme.slice(0, espace);
    const reste = ex.forme.slice(espace + 1);
    const finaleN = prefixe.endsWith('n');
    const debut = finaleN
      ? escHtml(prefixe.slice(0, -1)) + '<span class="dc-n">n</span>'
      : escHtml(prefixe);
    const suivant = '<span class="dc-initiale">' + escHtml(reste.charAt(0)) + '</span>' +
      escHtml(reste.slice(1));
    html = '<div class="dc-mini">' + escHtml(ex.type) + '</div>' +
      '<div class="dc-formule" lang="lb">' + debut + ' ' + suivant + '</div>' +
      '<div class="dc-statut' + (ex.garderN ? ' garde' : '') + '">' +
        (ex.garderN ? '✓ N conservé' : '− N supprimé') + '</div>' +
      '<p class="dc-explication">' + escHtml(ex.explication) + '</p>' +
      '<div class="dc-rappel">UNITED ZOHA : voyelles + N · D · T · Z · H</div>';
  }
  document.getElementById('dc-contenu').innerHTML = html;
}

function ecouterDecouverte(bouton) {
  if (!decouverteActive || decouverteActive.uniteId !== 1) return;
  const item = decouvertePour(pLecon, 1)[decouverteActive.index];
  if (!item || !/^lod\/[A-Za-z0-9_-]+\.mp3$/.test(item.audioFichier)) return;
  jouerAudio(item.audioFichier, bouton); // MP3 LOD local réel, jamais d'autoplay/TTS
}

function precedentDecouverte() {
  if (!decouverteActive || decouverteActive.index === 0) return;
  arreterAudio();
  decouverteActive.index--;
  afficherDecouverte();
}

function suivantDecouverte() {
  if (!decouverteActive) return;
  arreterAudio();
  const { uniteId, index } = decouverteActive;
  const items = decouvertePour(pLecon, uniteId);
  if (index < items.length - 1) {
    decouverteActive.index++;
    afficherDecouverte();
    return;
  }
  // Dernière carte : seul un clic volontaire démarre la vraie activité notée.
  decouverteActive = null;
  startUnite(uniteId, 'unite', null, null, true);
}

function quitterDecouverte() {
  arreterAudio();
  decouverteActive = null;
  retour();
}
