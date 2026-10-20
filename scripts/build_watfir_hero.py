"""Watfir pop-editorial hero: produce binary assets from existing text-free photo.
Run: python scripts/build_watfir_hero.py
The flattened FHD image is a reference only; the web app overlays accessible HTML.
"""
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "public/art/hero-luxapp-fhd.webp"
ART = ROOT / "public/art"
DOCS = ROOT / "docs/brand"
INK = np.array([16, 17, 16], dtype=np.uint8)
TEAL = np.array([8, 217, 189], dtype=np.uint8)
DEEP = np.array([0, 77, 69], dtype=np.uint8)
ORANGE = np.array([255, 105, 36], dtype=np.uint8)
ART.mkdir(parents=True, exist_ok=True)
DOCS.mkdir(parents=True, exist_ok=True)
if not SOURCE.is_file():
    raise SystemExit(f"Source image missing: {SOURCE}")

w, h = 1920, 1080
photo = Image.open(SOURCE).convert("RGB").resize((w, h), Image.Resampling.LANCZOS)
a = np.asarray(photo, dtype=np.float32)
r, g, b = a[:, :, 0], a[:, :, 1], a[:, :, 2]
luma = .23 * r + .68 * g + .09 * b
yy = np.arange(h, dtype=np.float32)[:, None]
visible = luma >= 57
mid = luma >= 98
warm = (r > g * 1.11) & (r > b * 1.20) & (r > 64)
out = np.empty_like(a, dtype=np.uint8)
out[:] = INK
out[visible & ~mid] = DEEP
out[mid] = TEAL
out[warm & (yy > h * .31) & visible] = ORANGE
image = Image.fromarray(out, "RGB")

# Teal sky defines a clean region for oversized lettering; the city remains
# visible on the right/bottom, without compositing text into the production image.
teal_layer = Image.new("RGB", (w, h), tuple(TEAL))
mask = Image.new("L", (w, h), 0)
ImageDraw.Draw(mask).polygon([
    (0, 0), (w, 0), (w, 120), (1500, 350),
    (1230, 540), (860, 705), (0, 830)
], fill=255)
mask = mask.filter(ImageFilter.GaussianBlur(13))
image.paste(teal_layer, (0, 0), mask)
fhd = ART / "watfir-hero-background-fhd.webp"
mobile = ART / "watfir-hero-background-mobile.webp"
reference = DOCS / "watfir-hero-reference-fhd.webp"
image.save(fhd, "WEBP", quality=85, method=6)
image.resize((960, 540), Image.Resampling.LANCZOS).save(
    mobile, "WEBP", quality=78, method=6
)

# Accurate French in reference poster, rasterized for visual comparison only.
poster = image.copy()
d = ImageDraw.Draw(poster)
fontpath = "/usr/share/fonts/truetype/dejavu/DejaVuSansCondensed-Bold.ttf"
if not Path(fontpath).is_file():
    fontpath = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
font_big = ImageFont.truetype(fontpath, 345)
font_small = ImageFont.truetype(fontpath, 77)
word = "MOIEN"
bounds = d.textbbox((0, 0), word, font=font_big)
txt = Image.new("RGBA", (bounds[2]-bounds[0]+30, bounds[3]-bounds[1]+30))
ImageDraw.Draw(txt).text(
    (15-bounds[0], 15-bounds[1]), word, fill=(16,17,16,255), font=font_big
)
txt = txt.resize((1410, txt.height), Image.Resampling.LANCZOS)
poster.paste(txt, (66, 168), txt)
d = ImageDraw.Draw(poster)
d.text((75, 475), "Le luxembourgeois", fill=(16,17,16), font=font_small)
d.text((75, 565), "autrement.", fill=(16,17,16), font=font_small)
d.text((75, 44), "watfir", fill=(16,17,16), font=font_small)
d.ellipse((310, 102, 331, 123), fill=tuple(ORANGE))
poster.save(reference, "WEBP", quality=86, method=6)

for f in (fhd, mobile, reference):
    print(f"{f.relative_to(ROOT)}: {f.stat().st_size} bytes")
