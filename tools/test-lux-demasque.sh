#!/usr/bin/env bash
# Lux Démasqué — suite dédiée. Voir docs/LUX-DEMASQUE-TESTS.md.
#   bash tools/test-lux-demasque.sh rapide       # moteur, générateur, syntaxe
#   bash tools/test-lux-demasque.sh complet      # + 5 parcours Playwright
#   bash tools/test-lux-demasque.sh acceptation  # + contrat LD-034 (rouge tant que non corrigé)
set -u
cd "$(dirname "$0")/.." || exit 1

MODE="${1:-rapide}"
case "$MODE" in rapide|complet|acceptation) ;; *)
  echo "Usage : bash tools/test-lux-demasque.sh [rapide|complet|acceptation]"
  exit 2
esac

PORT_TEST="${PORT_TEST:-3456}"
export LUX_URL="${LUX_URL:-http://127.0.0.1:$PORT_TEST/}"
LOGS="$(mktemp -d "${TMPDIR:-/tmp}/lux-demasque-tests.XXXXXX")"
SERVEUR=""
ECHECS=0
COMPTE=0
TERMINE=0

nettoyer() {
  if [ -n "$SERVEUR" ]; then
    kill "$SERVEUR" 2>/dev/null || true
    wait "$SERVEUR" 2>/dev/null || true
  fi
  if [ "$TERMINE" -eq 1 ] && [ "$ECHECS" -eq 0 ]; then
    rm -rf "$LOGS"
  else
    echo "Journaux conservés : $LOGS"
  fi
}
trap nettoyer EXIT

exiger() {
  command -v "$1" >/dev/null 2>&1 || { echo "Dépendance absente : $1"; exit 2; }
}
exiger node
exiger python3

executer() {
  nom="$1"; shift
  COMPTE=$((COMPTE + 1))
  if "$@" >"$LOGS/$nom.log" 2>&1; then
    echo "OK      $nom"
  else
    echo "ECHEC   $nom"
    tail -45 "$LOGS/$nom.log"
    ECHECS=$((ECHECS + 1))
  fi
}

echo "Lux Démasqué — $MODE"
executer syntaxe-js sh -c 'node --check public/lux-demasque-core.js && node --check public/lux-demasque.js && node --check public/lux-demasque-audio.js'
executer syntaxe-python python3 -c 'import ast, pathlib; paths = [pathlib.Path("tests") / (name + ".py") for name in ("test_lux_demasque", "test_lux_demasque_3d", "test_lux_demasque_audio", "test_lux_demasque_parcours", "test_lux_demasque_mobile", "test_lux_demasque_acceptation")]; [ast.parse(p.read_text(encoding="utf-8"), filename=str(p)) for p in paths]'
executer moteur-et-generateur node --test test/lux-demasque.test.cjs test/lux-demasque-generateur.test.cjs

if [ "$MODE" != "rapide" ]; then
  exiger curl
  if ! python3 -c 'import playwright.sync_api' >/dev/null 2>&1; then
    echo "ECHEC   Playwright Python absent (installer la dépendance et Chromium)"
    ECHECS=$((ECHECS + 1))
  else
    # Réutiliser uniquement un serveur explicitement configuré pour les tests.
    if ! curl -fsS --max-time 2 "${LUX_URL}config.js" >/dev/null 2>&1; then
      # Démarrage local seulement : jamais démarrer un processus pour une URL distante.
      if [ "$LUX_URL" != "http://127.0.0.1:$PORT_TEST/" ] && [ "$LUX_URL" != "http://localhost:$PORT_TEST/" ]; then
        echo "ECHEC   LUX_URL inaccessible : $LUX_URL"
        ECHECS=$((ECHECS + 1))
      else
        LUX_TESTS=1 PORT="$PORT_TEST" node server.js >"$LOGS/serveur.log" 2>&1 &
        SERVEUR="$!"
        for _ in $(seq 1 50); do
          curl -fsS --max-time 2 "${LUX_URL}config.js" >/dev/null 2>&1 && break
          sleep 0.2
        done
      fi
    fi

    if ! curl -fsS --max-time 2 "${LUX_URL}config.js" | grep -q 'APP_CONFIG.TESTS = true'; then
      echo "ECHEC   serveur non disponible ou sans LUX_TESTS=1 : $LUX_URL"
      ECHECS=$((ECHECS + 1))
    else
      for nom in test_lux_demasque test_lux_demasque_3d test_lux_demasque_audio test_lux_demasque_parcours test_lux_demasque_mobile; do
        executer "$nom" python3 "tests/$nom.py"
      done
      if [ "$MODE" = "acceptation" ]; then
        executer contrat-LD-034 python3 tests/test_lux_demasque_acceptation.py
      fi
    fi
  fi
fi

TERMINE=1
echo "Lux Démasqué — $COMPTE blocs exécutés, $ECHECS échec(s)."
if [ "$ECHECS" -ne 0 ]; then
  echo "SUITE ROUGE — corriger les échecs avant validation ; voir $LOGS"
  exit 1
fi
echo "SUITE VERTE pour le périmètre exécuté ($MODE)."
if [ "$MODE" = "rapide" ]; then echo "Tests navigateur et Samsung NON exécutés."; fi
exit 0
