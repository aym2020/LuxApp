"""SPEC 117 — produit public/art/jeux/redflag-presentation.webp (zone visuel de l'écran commun).

Source : l'illustration approuvée tools/red-flag/sources/redflag-hero-v7.webp (1254×1254),
recadrée en paysage 1254×1000 (y 150 → 1150) : visage, main, tasse, téléphone et lampe
restent dans le cadre. Aucun texte dans l'image (titres et étapes sont du HTML).
Usage : python3 tools/red-flag/recadrer-presentation.py
"""
from pathlib import Path
from PIL import Image

RACINE = Path(__file__).resolve().parents[2]
SOURCE = RACINE / 'tools/red-flag/sources/redflag-hero-v7.webp'
SORTIE = RACINE / 'public/art/jeux/redflag-presentation.webp'

image = Image.open(SOURCE).convert('RGB')
image.crop((0, 150, 1254, 1150)).save(SORTIE, 'WEBP', quality=84, method=6)
print('écrit', SORTIE, SORTIE.stat().st_size, 'octets')
