#!/usr/bin/env bash
# SPEC 72 — Récupérer les audios de phrases LOD depuis le téléphone (Termux) et les pousser
# sur la branche « audio-phrases », sans toucher à v2. Claude vérifie puis fusionne dans v2.
#
# Première fois seulement (dans Termux) :
#   pkg install -y git nodejs gh && gh auth login
#
# Ensuite, à chaque fois, une seule commande :
#   curl -sSfL https://raw.githubusercontent.com/aym2020/LuxApp/v2/tools/termux-audio-lod.sh | bash
# (gh sert à l'envoi : « gh auth login » enregistre ton accès GitHub une fois pour toutes.)
#
# Ce que fait le script :
#   1. dossier ~/LuxApp : clone le dépôt la première fois, sinon récupère la dernière version de v2 ;
#   2. met de côté toute modification locale (git stash), sauf les sons déjà téléchargés ; rien n'est perdu ;
#   3. repart de v2 sur la branche audio-phrases ;
#   4. node tools/audio-lod.js : télécharge seulement les sons manquants, contrôle chaque fichier (MP3 / M4A valides) ;
#   5. node tests/test_audio_lod.js : vérifie les tables et tous les fichiers ;
#   6. node tools/lod/audit-audio.js : met à jour le rapport de couverture ;
#   7. pousse public/audio et le rapport sur audio-phrases (jamais sur v2 ni main).
set -euo pipefail

DEPOT="aym2020/LuxApp"
DOSSIER="$HOME/LuxApp"
BRANCHE="audio-phrases"
# Termux n'a pas de /tmp : le journal va dans son dossier temporaire ($TMPDIR).
JOURNAL="${TMPDIR:-${PREFIX:-}/tmp}/audio-lod.log"
mkdir -p "$(dirname "$JOURNAL")"

etape() { printf '\n\033[1;33m▶ %s\033[0m\n' "$1"; }
stop() { printf '\n\033[1;31m✖ %s\033[0m\n' "$1"; exit 1; }

etape "Outils"
for outil in git node curl; do
  command -v "$outil" >/dev/null || { echo "Installation : $outil"; pkg install -y "$( [ "$outil" = node ] && echo nodejs || echo "$outil")"; }
done

etape "Dépôt"
if [ ! -d "$DOSSIER/.git" ]; then
  if command -v gh >/dev/null; then gh repo clone "$DEPOT" "$DOSSIER" -- --branch v2
  else git clone --branch v2 "https://github.com/$DEPOT.git" "$DOSSIER"; fi
fi
cd "$DOSSIER"
git fetch origin v2
# Les sons déjà téléchargés (public/audio) restent en place : pas besoin de les reprendre.
if [ -n "$(git status --porcelain -- . ':(exclude)public/audio' ':(exclude)docs/audit-audio-lod.md')" ]; then
  git stash push -u -m "avant audio-phrases $(date +%F-%H%M)" -- . ':(exclude)public/audio' ':(exclude)docs/audit-audio-lod.md' >/dev/null
  echo "Modifications locales mises de côté (git stash list pour les retrouver)."
fi
git checkout -B "$BRANCHE" origin/v2
echo "Base : $(git log --oneline -1)"

etape "Téléchargement des sons manquants (mots, phrases exactes, phrases en contexte)"
node tools/audio-lod.js | tee "$JOURNAL"

etape "Vérification des fichiers"
node tests/test_audio_lod.js || stop "Vérification en échec : rien n'est envoyé. Copie le message ci-dessus à Claude."

etape "Rapport de couverture"
node tools/lod/audit-audio.js

etape "Envoi sur la branche $BRANCHE"
git add public/audio docs/audit-audio-lod.md
if git diff --cached --quiet; then
  echo "Aucun nouveau son : rien à envoyer."
  exit 0
fi
PHRASES=$(ls public/audio/lod-phrases/*.m4a 2>/dev/null | wc -l)
git -c user.name="${GIT_AUTHOR_NAME:-Clayton (Termux)}" -c user.email="${GIT_AUTHOR_EMAIL:-termux@luxapp.local}" \
  commit -q -m "audio: phrases LOD téléchargées depuis Termux ($PHRASES fichiers M4A)"
git push --force -u origin "$BRANCHE"

printf '\n\033[1;32m✔ Terminé : %s fichiers de phrases sur la branche %s.\033[0m\n' "$PHRASES" "$BRANCHE"
echo "Dis à Claude : « audio-phrases est poussée ». Il vérifie et fusionne dans v2."
grep -E '^(MOTS|PHRASES|CONTEXTE)' "$JOURNAL" || true
