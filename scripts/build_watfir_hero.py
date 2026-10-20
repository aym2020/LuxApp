"""Watfir hero asset verification.

The approved hero is original illustrated art, NOT a recoloured photograph.
The old photo-posterization pipeline has been removed deliberately: it produced
an unacceptable mockup and must never overwrite the checked-in artwork.

The name of this script is retained for backwards compatibility with docs.
Run: python scripts/build_watfir_hero.py
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = {
    "public/art/watfir-hero-background-fhd.webp": ((1920, 1080), 250_000),
    "public/art/watfir-hero-background-mobile.webp": ((960, 540), 100_000),
    "docs/brand/watfir-hero-reference-fhd.webp": ((1920, 1080), 300_000),
}

for name, (expected_size, max_bytes) in ASSETS.items():
    file = ROOT / name
    if not file.is_file():
        raise SystemExit(f"Missing Watfir asset: {name}")
    if file.stat().st_size > max_bytes:
        raise SystemExit(f"Watfir asset exceeds size limit: {name}")
    with Image.open(file) as img:
        if img.format != "WEBP" or img.size != expected_size:
            raise SystemExit(f"Invalid Watfir asset: {name} ({img.size}; {img.format})")
    print(f"OK {name}: {file.stat().st_size} bytes")

print("Illustrated assets validated. No files changed.")
