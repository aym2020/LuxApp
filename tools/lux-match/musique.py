# Lux Match — deux boucles musicales originales (SPEC 109 §16), composées et rendues ici.
#   « Love Circuit » (avant le rendez-vous) : electro-funk rétro FM/chiptune, 112 BPM, 16 mesures.
#   « Neon Café » (au café)               : lounge rétro, piano électrique FM, 84 BPM, 16 mesures.
# Motif commun de 4 notes (5-3-6-5 de la gamme) : vif dans Love Circuit, lent et doux au café.
#
# Tout est synthétisé (numpy) : aucun échantillon ni morceau existant. Le rendu est
# « circulaire » (deux tours, on garde le second) : la boucle se raccorde sans clic.
# Usage : python3 tools/lux-match/musique.py   → public/audio/lux-match/*.ogg et *.mp3
import os, subprocess, numpy as np

RACINE = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SORTIE = os.path.join(RACINE, 'public', 'audio', 'lux-match')
SR = 32000
rng = np.random.default_rng(1027)

NOTES = {'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11}
def hz(nom):  # 'A4' → 440
    lettre, octave = nom[:-1], int(nom[-1])
    return 440.0 * 2 ** ((NOTES[lettre] + 12 * (octave + 1) - 69) / 12)
def midi_hz(m): return 440.0 * 2 ** ((m - 69) / 12)

# ─── Instruments ────────────────────────────────────────────────────────────
def env_adsr(n, a, d, s, r, duree_note):
    t = np.arange(n) / SR
    e = np.where(t < a, t / max(a, 1e-4), s + (1 - s) * np.exp(-(t - a) / max(d, 1e-4)))
    rel = np.clip((t - duree_note) / max(r, 1e-4), 0, 1)
    return e * (1 - rel) * (t < duree_note + r)

def piano_fm(f, duree, vel=1.0, brillance=1.0):
    """Piano électrique FM (2 opérateurs + « tine » aigu), façon synthé 80s."""
    n = int((duree + 1.2) * SR); t = np.arange(n) / SR
    idx = brillance * (1.8 * np.exp(-t * 3.5) + 0.35)
    mod = np.sin(2 * np.pi * f * t) * idx
    corps = np.sin(2 * np.pi * f * t + mod)
    tine = np.sin(2 * np.pi * f * 14 * t + np.sin(2 * np.pi * f * t) * 0.8) * np.exp(-t * 28) * 0.18 * brillance
    e = env_adsr(n, 0.004, 0.9, 0.25, 0.35, duree)
    return (corps * 0.8 + tine) * e * vel

def basse_fm(f, duree, vel=1.0, rond=False):
    n = int((duree + 0.3) * SR); t = np.arange(n) / SR
    idx = (0.6 if rond else 1.6) * np.exp(-t * (6 if rond else 12)) + (0.15 if rond else 0.3)
    s = np.sin(2 * np.pi * f * t + np.sin(2 * np.pi * f * t) * idx)
    s += 0.35 * np.sin(2 * np.pi * f * 0.5 * t)  # sous-octave pour le corps
    e = env_adsr(n, 0.003, 0.25 if rond else 0.12, 0.55 if rond else 0.35, 0.06, duree)
    return np.tanh(s * 1.2) * e * vel

def pulse(f, duree, vel=1.0, rapport=0.25, vibrato=0.0):
    """Onde pulse « console » à harmoniques limitées (pas d'aliasing)."""
    n = int((duree + 0.08) * SR); t = np.arange(n) / SR
    phase = 2 * np.pi * f * t + vibrato * np.sin(2 * np.pi * 5.5 * t) * np.clip(t - 0.15, 0, None) * 6
    s = np.zeros(n); k = 1
    while k * f < SR / 2.6 and k < 40:
        s += (2 / (k * np.pi)) * np.sin(np.pi * k * rapport) * np.cos(k * phase); k += 1
    e = env_adsr(n, 0.004, 0.18, 0.7, 0.05, duree)
    return s * e * vel

def triangle(f, duree, vel=1.0):
    n = int((duree + 0.25) * SR); t = np.arange(n) / SR
    s = (2 / np.pi) * np.arcsin(np.sin(2 * np.pi * f * t))
    return s * env_adsr(n, 0.006, 0.4, 0.3, 0.2, duree) * vel

def nappe(freqs, duree, vel=1.0):
    n = int((duree + 1.5) * SR); t = np.arange(n) / SR
    s = np.zeros(n)
    for f in freqs:
        for det in (-0.12, 0.12):
            s += np.sin(2 * np.pi * f * (1 + det / 100) * t + 0.3 * np.sin(2 * np.pi * f * 2 * t))
    return s / (2 * len(freqs)) * env_adsr(n, 0.6, 1.0, 0.8, 1.2, duree) * vel

def grosse_caisse(vel=1.0, douce=False):
    n = int(0.35 * SR); t = np.arange(n) / SR
    f = 48 + (110 if douce else 140) * np.exp(-t * 32)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * (9 if douce else 11))
    s += 0.15 * np.exp(-t * 200) * rng.uniform(-1, 1, n)  # petit clic d'attaque
    return s * vel

def caisse_claire(vel=1.0):
    n = int(0.25 * SR); t = np.arange(n) / SR
    bruit = rng.uniform(-1, 1, n); bruit = bruit - np.concatenate([[0], bruit[:-1]]) * 0.6
    return (bruit * np.exp(-t * 18) * 0.7 + np.sin(2 * np.pi * 190 * t) * np.exp(-t * 25) * 0.5) * vel

def charleston(vel=1.0, ouvert=False):
    n = int((0.25 if ouvert else 0.06) * SR); t = np.arange(n) / SR
    b = rng.uniform(-1, 1, n); b = b - np.concatenate([[0], b[:-1]])  # passe-haut simple
    return b * np.exp(-t * (14 if ouvert else 70)) * vel * 0.5

def rimshot(vel=1.0):
    n = int(0.08 * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * 820 * t) * 0.6 + rng.uniform(-1, 1, n) * 0.3) * np.exp(-t * 60) * vel

def shaker(vel=1.0):
    n = int(0.09 * SR); t = np.arange(n) / SR
    b = rng.uniform(-1, 1, n); b = b - np.concatenate([[0], b[:-1]])
    env = np.minimum(t / 0.02, 1) * np.exp(-t * 35)
    return b * env * vel * 0.35

# ─── Piste circulaire ──────────────────────────────────────────────────────
class Piste:
    def __init__(self, bpm, mesures):
        self.bpm = bpm; self.temps = 60 / bpm
        self.longueur = int(round(mesures * 4 * self.temps * SR))
        self.canaux = {}
    def poser(self, canal, debut_temps, son, pan=0.0):
        """Ajoute un son à une position (en temps) ; ce qui dépasse revient au début."""
        buf = self.canaux.setdefault(canal, np.zeros((2, self.longueur)))
        i0 = int(round(debut_temps * self.temps * SR)) % self.longueur
        g, d = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        pos = 0
        while pos < len(son):
            debut = (i0 + pos) % self.longueur
            nb = min(len(son) - pos, self.longueur - debut)
            buf[0, debut:debut + nb] += son[pos:pos + nb] * g
            buf[1, debut:debut + nb] += son[pos:pos + nb] * d
            pos += nb

def echo_circulaire(x, temps_s, retour, mix):
    """Écho en boucle : on itère jusqu'à extinction en restant périodique."""
    d = int(temps_s * SR); y = x.copy(); couche = x.copy()
    for _ in range(8):
        couche = np.roll(couche, d, axis=1) * retour
        y += couche * mix
    return y

def reverb_circulaire(x, taille=1.0, mix=0.2):
    """Réverbération légère : 4 filtres en peigne + diffusion, calculés sur deux tours
    (on garde le second, en régime établi) pour que la boucle reste parfaitement raccordée."""
    deux = np.concatenate([x, x], axis=1)
    out = np.zeros_like(deux)
    for c in range(2):
        s = deux[c]; acc = np.zeros_like(s)
        for dl in (1557, 1617, 1491, 1422):
            dl = int(dl * taille * (1 + 0.023 * c)); g = 0.78
            buf = np.zeros(len(s))
            # peigne y[n] = x[n] + g·y[n−dl], vectorisé par blocs de longueur dl
            for i in range(0, len(s), dl):
                bloc = s[i:i + dl]
                buf[i:i + len(bloc)] = bloc + (g * buf[i - dl:i - dl + len(bloc)] if i >= dl else 0)
            acc += buf
        acc /= 4
        for dl in (225, 556):  # diffusion simple
            acc = acc + 0.45 * np.roll(acc, int(dl * taille))
        out[c] = acc / 1.6
    rev = out[:, x.shape[1]:]
    return x * (1 - mix) + rev * mix

# Gains réglés pour un haut-parleur de téléphone : basse contenue, mélodie bien présente.
def masteriser(canaux, gains, cible_rms=0.11):
    mix = sum(canaux[k] * g for k, g in gains.items() if k in canaux)
    mix = mix - mix.mean(axis=1, keepdims=True)
    rms = np.sqrt((mix ** 2).mean())
    mix = mix * (cible_rms / rms)
    return np.tanh(mix * 1.1) / 1.1 * 0.95   # limiteur doux : crête < -0,5 dBFS

def exporter(nom, stereo):
    os.makedirs(SORTIE, exist_ok=True)
    brut = os.path.join(SORTIE, nom + '.raw')
    (np.clip(stereo.T, -1, 1) * 32767).astype('<i2').tofile(brut)
    commun = ['ffmpeg', '-y', '-loglevel', 'error', '-f', 's16le', '-ar', str(SR), '-ac', '2', '-i', brut]
    subprocess.run(commun + ['-c:a', 'libvorbis', '-q:a', '3', os.path.join(SORTIE, nom + '.ogg')], check=True)
    subprocess.run(commun + ['-c:a', 'libmp3lame', '-b:a', '96k', os.path.join(SORTIE, nom + '.mp3')], check=True)
    os.remove(brut)

def accord(nom_basse, intervalles, octave=4):
    base = NOTES[nom_basse] + 12 * (octave + 1)
    return [midi_hz(base + i) for i in intervalles]
MAJ7, MIN7, DOM7, MAJ9, MIN9, SUS9, SIX = [0, 4, 7, 11], [0, 3, 7, 10], [0, 4, 7, 10], [0, 4, 7, 11, 14], [0, 3, 7, 10, 14], [0, 5, 7, 10, 14], [0, 4, 7, 9]

# ─── « Love Circuit » : 112 BPM, do majeur ─────────────────────────────────
def love_circuit():
    p = Piste(112, 16)
    grille = [('C', MAJ7), ('A', MIN7), ('F', MAJ7), ('G', SIX), ('C', MAJ7), ('A', MIN7), ('D', MIN7), ('G', DOM7),
              ('F', MAJ7), ('E', MIN7), ('D', MIN7), ('C', MAJ7), ('F', MAJ7), ('E', MIN7), ('D', MIN7), ('G', DOM7)]
    for m, (racine, type_) in enumerate(grille):
        t0 = m * 4
        notes = accord(racine, type_, 4)
        # Piano FM en « stabs » funk sur les contretemps
        for pos, dur, v in [(0.5, 0.35, 0.55), (1.5, 0.2, 0.45), (2.5, 0.35, 0.55), (3.25, 0.2, 0.4)]:
            for i, f in enumerate(notes):
                p.poser('piano', t0 + pos, piano_fm(f, dur * p.temps, v * 0.32, 1.1), pan=-0.35 + 0.23 * i)
        # Basse rebondissante (octaves, syncopes)
        r = midi_hz(NOTES[racine] + 12 * 2)
        for pos, f, dur in [(0, r, 0.4), (0.75, r * 2, 0.2), (1.5, r, 0.3), (2, r, 0.4), (2.75, r * 2, 0.2), (3.25, r * 1.5, 0.25), (3.5, r, 0.3)]:
            p.poser('basse', t0 + pos, basse_fm(f, dur * p.temps, 0.9))
        # Batterie : kick 1, 2&, 3 ; claire 2 et 4 ; charleston en croches avec léger swing
        for pos in (0, 1.5, 2):
            p.poser('kick', t0 + pos, grosse_caisse(1.0))
        if m % 4 == 3: p.poser('kick', t0 + 3.5, grosse_caisse(0.7))
        for pos in (1, 3):
            p.poser('claire', t0 + pos, caisse_claire(0.55), pan=0.05)
        for k in range(8):
            p.poser('hats', t0 + k * 0.5 + (0.06 if k % 2 else 0), charleston(0.5 if k % 2 else 0.3, ouvert=(k == 7 and m % 2 == 1)), pan=0.3)
    # Nappe douce sur la section B
    for m in range(8, 16):
        racine, type_ = grille[m]
        p.poser('nappe', m * 4, nappe(accord(racine, type_[:3], 4), 4 * p.temps, 0.16))
    # Mélodie chiptune : motif commun (sol-mi-la-sol) puis réponses
    motif = [('G5', 0, 0.5), ('E5', 0.5, 0.5), ('A5', 1, 1), ('G5', 2, 1.5)]
    phrases = {
        0: motif, 2: [('F5', 0, 0.5), ('E5', 0.5, 0.5), ('D5', 1, 0.5), ('E5', 1.5, 0.5), ('C5', 2, 1.5)],
        4: motif, 6: [('A5', 0, 0.5), ('C6', 0.5, 0.5), ('B5', 1, 0.5), ('A5', 1.5, 0.5), ('G5', 2, 1), ('D5', 3, 0.75)],
        8: [('A5', 0, 0.75), ('G5', 0.75, 0.25), ('F5', 1, 0.5), ('A5', 1.5, 1.5)],
        10: [('F5', 0, 0.5), ('E5', 0.5, 0.5), ('D5', 1, 0.5), ('C5', 1.5, 0.5), ('E5', 2, 1.5)],
        12: motif, 14: [('F5', 0, 0.5), ('A5', 0.5, 0.5), ('G5', 1, 0.5), ('F5', 1.5, 0.5), ('D5', 2, 1), ('B4', 3, 0.5), ('D5', 3.5, 0.5)],
    }
    for m, phrase in phrases.items():
        for note, pos, dur in phrase:
            p.poser('lead', m * 4 + pos, pulse(hz(note), dur * p.temps * 0.92, 0.32, 0.25, vibrato=0.004), pan=0.1)
    # Arpèges scintillants (pulse 12,5 %) sur les mesures sans mélodie
    for m in (1, 3, 5, 7, 9, 11, 13, 15):
        racine, type_ = grille[m]
        notes = accord(racine, type_, 5)
        for k in range(8):
            p.poser('arpege', m * 4 + k * 0.5, pulse(notes[k % len(notes)], 0.18 * p.temps, 0.12, 0.125), pan=-0.4 if k % 2 else 0.4)
    c = p.canaux
    c['lead'] = echo_circulaire(c['lead'], p.temps * 0.75, 0.35, 0.5)
    c['arpege'] = echo_circulaire(c['arpege'], p.temps * 0.5, 0.3, 0.4)
    c['piano'] = reverb_circulaire(c['piano'], 0.8, 0.18)
    return masteriser(c, {'piano': 1.25, 'basse': 0.55, 'kick': 0.75, 'claire': 0.6, 'hats': 0.3, 'nappe': 0.7, 'lead': 1.4, 'arpege': 0.7}, 0.11)

# ─── « Neon Café » : 84 BPM, fa majeur ─────────────────────────────────────
def neon_cafe():
    p = Piste(84, 16)
    grille = [('F', MAJ9), ('D', MIN9), ('G', MIN9), ('C', SUS9), ('F', MAJ9), ('A', MIN7), ('Bb', MAJ7), ('C', DOM7),
              ('Bb', MAJ7), ('A', MIN7), ('G', MIN7), ('F', MAJ7), ('Bb', MAJ7), ('A', DOM7), ('D', MIN7), ('C', DOM7)]
    for m, (racine, type_) in enumerate(grille):
        t0 = m * 4
        notes = accord(racine, type_, 3 if racine in ('A', 'Bb') else 4)
        # Piano électrique : accord tenu sur 1, rappel léger sur le 3&
        for i, f in enumerate(notes):
            p.poser('piano', t0 + 0.02 * i, piano_fm(f, 2.2 * p.temps, 0.24, 0.7), pan=-0.3 + 0.15 * i)
            p.poser('piano', t0 + 2.5 + 0.02 * i, piano_fm(f, 1.0 * p.temps, 0.15, 0.6), pan=-0.3 + 0.15 * i)
        # Basse ronde : fondamentale, quinte, approche
        r = midi_hz(NOTES[racine] + 12 * 2)
        suivante = midi_hz(NOTES[grille[(m + 1) % 16][0]] + 12 * 2)
        for pos, f, dur in [(0, r, 1.4), (1.5, r * 1.5, 0.45), (2, r, 1.0), (3.5, suivante * 2 ** (-1 / 12), 0.4)]:
            p.poser('basse', t0 + pos, basse_fm(f, dur * p.temps, 0.8, rond=True))
        # Batterie discrète : kick 1 et 3&, rim 2 et 4, shaker en croches
        p.poser('kick', t0, grosse_caisse(0.8, douce=True))
        p.poser('kick', t0 + 2.5, grosse_caisse(0.55, douce=True))
        for pos in (1, 3):
            p.poser('rim', t0 + pos, rimshot(0.45), pan=-0.1)
        for k in range(8):
            p.poser('shaker', t0 + k * 0.5 + (0.08 if k % 2 else 0), shaker(0.5 if k % 2 else 0.32), pan=0.35)
        # Nappe chaude
        p.poser('nappe', t0, nappe(accord(racine, type_[:4], 4), 4 * p.temps, 0.12))
    # Motif commun, lent et timide (do-la-ré-do), au piano FM aigu puis en écho 8-bit
    motif = [('C6', 0, 1), ('A5', 1, 1), ('D6', 2, 1.5), ('C6', 3.5, 2)]
    for m in (2, 10):
        for note, pos, dur in motif:
            p.poser('melodie', m * 4 + pos, piano_fm(hz(note), dur * p.temps, 0.22, 1.2), pan=0.15)
    reponses = {6: [('A5', 0, 1), ('G5', 1, 1), ('F5', 2, 2)], 14: [('D6', 0, 1), ('C6', 1, 0.5), ('A5', 1.5, 0.5), ('G5', 2, 2)]}
    for m, phrase in reponses.items():
        for note, pos, dur in phrase:
            p.poser('melodie', m * 4 + pos, piano_fm(hz(note), dur * p.temps, 0.2, 1.1), pan=0.15)
    for m in (3, 11):  # petites notes 8-bit qui répondent au motif
        for note, pos in [('C6', 0.5), ('A5', 1), ('D6', 1.5)]:
            p.poser('bips', m * 4 + pos, triangle(hz(note), 0.25 * p.temps, 0.14), pan=-0.4)
    c = p.canaux
    c['melodie'] = echo_circulaire(c['melodie'], p.temps * 0.75, 0.3, 0.35)
    c['bips'] = echo_circulaire(c['bips'], p.temps * 0.5, 0.4, 0.5)
    c['piano'] = reverb_circulaire(c['piano'], 1.2, 0.3)
    c['nappe'] = reverb_circulaire(c['nappe'], 1.4, 0.4)
    return masteriser(c, {'piano': 1.1, 'basse': 0.5, 'kick': 0.6, 'rim': 0.45, 'shaker': 0.3, 'nappe': 0.8, 'melodie': 1.6, 'bips': 0.9}, 0.085)

if __name__ == '__main__':
    for nom, fabrique in [('love-circuit', love_circuit), ('neon-cafe', neon_cafe)]:
        son = fabrique()
        exporter(nom, son)
        crete = 20 * np.log10(np.abs(son).max()); rms = 20 * np.log10(np.sqrt((son ** 2).mean()))
        raccord = np.abs(son[:, 0] - son[:, -1]).max()
        print(f'{nom}: {son.shape[1] / SR:.1f} s, crête {crete:.1f} dBFS, RMS {rms:.1f} dBFS, saut au raccord {raccord:.4f}')
