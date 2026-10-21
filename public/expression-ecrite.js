// Examens d'expression écrite A1.2 : parcours séquentiel, 1 point par phrase modèle.
// Cette extension ne change pas les annales, les scores historiques ni le moteur des leçons.
let expressionEtat = null;
function expressionEstSujet(sujet) { return !!(sujet && sujet.format === 'expression_ecrite'); }
function expressionTotal(sujet) { return sujet && Array.isArray(sujet.phrases) ? sujet.phrases.length : 0; }
function expressionReconnue(saisie, phrase) {
  const possibilites = [phrase.lu].concat(Array.isArray(phrase.alternatives) ? phrase.alternatives : []);
  return possibilites.some(p => typeof p === 'string' && normalize(String(saisie || '')) === normalize(p));
}
function expressionScore(reponses) { return reponses.filter(r => r && r.ok).length; }
function expressionStart(sujet) {
  if (!expressionEstSujet(sujet) || !expressionTotal(sujet)) return;
  exam = sujet;
  expressionEtat = { index:0, corrige:false, reponses:sujet.phrases.map(()=>null), brouillon:'', erreursSeulement:false };
  document.getElementById('ex-num').textContent = sujet.titre.toUpperCase();
  document.getElementById('ex-prev').disabled = true;
  document.getElementById('ex-tray').classList.add('hidden');
  showView('view-examen');
  expressionRender();
}
function expressionRender() {
  if (!exam || !expressionEstSujet(exam) || !expressionEtat) return;
  const s = expressionEtat, i = s.index, total = exam.phrases.length, p = exam.phrases[i], rep=s.reponses[i];
  document.getElementById('ex-titre').textContent = 'Phrase ' + (i+1) + ' / ' + total;
  document.getElementById('ex-prev').disabled = true;
  document.getElementById('ex-tray').classList.add('hidden');
  const done=i+(s.corrige?1:0);
  document.getElementById('ex-steps').innerHTML = '<div class="xee-track" role="progressbar" aria-label="Phrases validées" aria-valuemin="0" aria-valuemax="' + total + '" aria-valuenow="' + done + '"><span style="width:' + (done/total*100) + '%"></span></div>';
  let h = '<div class="xee-question"><div class="xee-kicker">ÉCRIS EN LUXEMBOURGEOIS</div>' +
    '<h2 class="xee-prompt">' + escHtml(p.fr) + '</h2>' +
    '<div class="xee-counter">Phrase ' + (i+1) + ' sur ' + total + '</div></div>';
  if (!s.corrige) {
    h += '<div class="xee-write"><label for="xee-input">Ta réponse</label>' +
      '<textarea id="xee-input" rows="3" autocomplete="off" autocorrect="off" spellcheck="false" autocapitalize="none" ' +
      'placeholder="Tape la phrase complète…" oninput="expressionEdit(this)">' + escHtml(s.brouillon) + '</textarea>' +
      '<p id="xee-warning" class="xee-warning hidden" role="alert">Écris une réponse, ou affiche la solution.</p>' +
      '<button type="button" class="xee-reveal" onclick="expressionReveal()">Voir la réponse (0 point)</button></div>';
    document.getElementById('ex-next').textContent = 'Valider';
  } else {
    h += '<div class="xee-feedback ' + (rep.ok?'ok':'ko') + '" aria-live="polite">' +
      '<strong class="xee-status">' + (rep.ok?'Juste !':'À retenir') + '</strong>' +
      (!rep.ok?'<p class="xee-user">Ta réponse : ' + escHtml(rep.texte || 'Non répondu') + '</p>':'') +
      '<div class="xee-solution-label">Phrase du texte modèle</div><p class="xee-solution" lang="lb">' + escHtml(p.lu) + '</p>' +
      '<p class="xee-note">' + escHtml(p.note) + '</p>' +
      '</div>';
    document.getElementById('ex-next').textContent = i===total-1 ? 'Voir le score' : 'Phrase suivante';
  }
  document.getElementById('ex-body').innerHTML=h;
  examRemonter();
}
function expressionEdit(el) { if (expressionEtat && !expressionEtat.corrige) expressionEtat.brouillon=el.value; }
function expressionValidate(reveal) {
  if (!expressionEtat || expressionEtat.corrige) return;
  const el=document.getElementById('xee-input');
  if (!el) return;
  const value=el.value.trim();
  if (!value && !reveal) { document.getElementById('xee-warning').classList.remove('hidden'); el.focus();return; }
  expressionEtat.reponses[expressionEtat.index]={texte:value,ok:!!value && expressionReconnue(value,exam.phrases[expressionEtat.index])};
  expressionEtat.corrige=true;
  expressionEtat.brouillon='';
  el.blur();
  expressionRender();
}
function expressionReveal() { expressionValidate(true); }
function expressionNext() {
  if (!expressionEtat) return;
  if (!expressionEtat.corrige) { expressionValidate(false); return; }
  if (expressionEtat.index<exam.phrases.length-1) {
    expressionEtat.index++;
    expressionEtat.corrige=false;
    expressionRender();
  } else expressionFinish();
}
function expressionPrev() { /* Une phrase corrigée ne peut pas être rejouée dans le même examen. */ }
function expressionFinish() {
  if (!expressionEtat || !exam || !expressionEstSujet(exam)) return;
  saveExamScore(exam.id,expressionScore(expressionEtat.reponses),exam.phrases.length);
  expressionEtat.erreursSeulement=false;
  document.getElementById('exr-titre').textContent=exam.titre_fr;
  expressionRenderResult();
  showView('view-examen-result');
}
function expressionFiltrer(erreursSeulement) {
  if (!expressionEtat) return;
  expressionEtat.erreursSeulement=erreursSeulement;
  expressionRenderResult();
}
function expressionRenderResult() {
  if (!expressionEtat || !exam || !expressionEstSujet(exam)) return;
  const n=exam.phrases.length, score=expressionScore(expressionEtat.reponses);
  const pct=Math.round(score/n*100), erreurs=n-score, filtrer=expressionEtat.erreursSeulement;
  const cls=examClasse(pct);
  const mention=pct>=80?'Très bien':pct>=60?'Réussi':'À retravailler';
  let h='<div class="exr-hero"><div class="exr-ring ' + cls + '" style="--pct:' + pct +
    '"><div class="exr-ring-in"><b>' + score + '</b><span>sur ' + n + '</span></div></div>' +
    '<div class="exr-mention ' + cls + '">' + mention + ' · ' + pct + ' %</div>' +
    '<div class="exr-sub">Expression écrite · 1 point par phrase du texte modèle</div></div>' +
    '<section class="xee-full"><h2>Le texte complet</h2><p lang="lb">' +
    exam.phrases.map(p=>escHtml(p.lu)).join(' ') + '</p></section>';
  if (exam.variante && Array.isArray(exam.variante.changements)) {
    h+='<details class="xee-variant"><summary>' + escHtml(exam.variante.titre) + '</summary>' +
      '<p>Pour parler de tes vacances, remplace seulement ces deux phrases :</p>';
    exam.variante.changements.forEach(c => {
      const initiale=exam.phrases[c.index];
      if (!initiale) return;
      h+='<p class="xee-variant-old" lang="lb">' + escHtml(initiale.lu) + '</p>' +
        '<p class="xee-variant-new" lang="lb">→ ' + escHtml(c.lu) + '</p>';
    });
    h+='</details>';
  }
  h += '<div class="exr-filter"><button class="' + (!filtrer?'active':'') +
    '" onclick="expressionFiltrer(false)">Toute la correction</button>' +
    '<button class="' + (filtrer?'active':'') + '" onclick="expressionFiltrer(true)">Mes erreurs (' + erreurs + ')</button></div>';
  if (filtrer && !erreurs) h += '<div class="ex-empty">Aucune erreur.</div>';
  exam.phrases.forEach((p,i)=>{
    const ans=expressionEtat.reponses[i],ok=ans&&ans.ok;
    if (filtrer && ok) return;
    h+='<section class="xee-result-row ' + (ok?'ok':'ko') + '">' +
      '<div class="xee-item-num">Phrase ' + (i+1) + ' · ' + (ok?'Juste':'À revoir') + '</div>' +
      (!ok?'<p class="xee-user">Ta réponse : ' + escHtml(ans&&ans.texte?ans.texte:'Non répondu') + '</p>':'') +
      '<p class="xee-solution" lang="lb">' + escHtml(p.lu) + '</p>' +
      '<p class="xee-note">' + escHtml(p.note) + '</p></section>';
  });
  h+='<div class="exr-actions"><button class="lien-or" onclick="startExamen(\'' + exam.id + '\')">Refaire ce texte</button></div>';
  document.getElementById('exr-body').innerHTML=h;
  document.getElementById('exr-cta').innerHTML='<button class="pc-btn primary wide big" onclick="retourSujets()">Terminer</button>';
}
