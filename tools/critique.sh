#!/usr/bin/env bash
# Suite critique (PLAYBOOK) : à lancer une fois avant chaque push.
#   bash tools/critique.sh            → tout
#   bash tools/critique.sh rapide     → syntaxe + contenu + tests Node (~10 s)
# Les tests navigateur tournent 2 par 2 (les plus longs d'abord) ; chacun a
# son propre navigateur, donc son propre localStorage : aucun conflit.
# Sortie : une ligne par test (durée, OK / ECHEC) et le détail des échecs.
cd "$(dirname "$0")/.." || exit 1
PORT_TEST=3456
JOBS=${JOBS:-2}
LOGS=$(mktemp -d)
echec=0

# Serveur de test (démarré s'il ne tourne pas déjà)
if ! curl -s "localhost:$PORT_TEST" >/dev/null; then
  LUX_TESTS=1 PORT=$PORT_TEST node server.js >"$LOGS/serveur.log" 2>&1 &
  SERVEUR=$!
  for _ in $(seq 1 40); do curl -s "localhost:$PORT_TEST" >/dev/null && break; sleep 0.25; done
fi

# Le serveur doit tourner avec LUX_TESTS=1 (sinon le portail d'entrée bloque les tests)
if ! curl -s "localhost:$PORT_TEST/config.js" | grep -q "APP_CONFIG.TESTS = true"; then
  echo "ECHEC   serveur $PORT_TEST lancé sans LUX_TESTS=1 : l'arrêter, puis relancer ce script"
  exit 1
fi

# test_cloud lit la branche main (leçons v1) : la récupérer si le clone est partiel
git rev-parse -q --verify main >/dev/null || git fetch -q --depth 1 origin main:main 2>/dev/null

# 1. Syntaxe, contenu, tests Node : rapides, en série
for f in public/*.js; do node --check "$f" || echec=1; done
for t in "tools/valider-lecons.js" "tests/test_cloud.js" "tests/test_sync.js" "tests/test_correction.js" "tests/test_audio_lod.js" "tests/test_audit_correspondances.js"; do
  if node "$t" >"$LOGS/node.log" 2>&1; then echo "OK      $t"; else echo "ECHEC   $t"; tail -8 "$LOGS/node.log"; echec=1; fi
done

if [ "$1" != "rapide" ]; then
  # 2. Tests navigateur, du plus long au plus court
  TESTS="test_retours test_retour_intro test_parcours test_rappels test_prerequis test_recette_visuelle test_acces_recette test_actualisation test_acquis_v1 test_chemin_cartes test_missions_10 test_mission_vies test_navigation
         test_lot2 test_lot3 test_motcache test_decouverte test_chemin_lignes test_seance
         test_mission_validation test_lot1 test_libre test_examens test_contexte_audio test_retour_android test_spec87_session_mobile test_spec94_verdict test_spec94_feedback"
  lancer() {
    debut=$(date +%s)
    if timeout 300 python3 "tests/$1.py" >"$2/$1.log" 2>&1; then r=OK; else r=ECHEC; fi
    printf '%-7s %-26s %3ss\n' "$r" "$1" "$(( $(date +%s) - debut ))"
  }
  export -f lancer
  printf '%s\n' $TESTS | xargs -P "$JOBS" -I{} bash -c 'lancer {} '"$LOGS" | tee "$LOGS/resume.txt"
  for t in $(grep '^ECHEC' "$LOGS/resume.txt" | awk '{print $2}'); do
    echo "── $t ──"; tail -15 "$LOGS/$t.log"; echec=1
  done
fi

[ -n "$SERVEUR" ] && kill "$SERVEUR" 2>/dev/null
rm -rf "$LOGS"
if [ $echec -eq 0 ]; then echo "SUITE CRITIQUE : VERTE"; else echo "SUITE CRITIQUE : ÉCHEC — ne pas pousser"; fi
exit $echec
