# Lux Démasque — bande-son originale (SPEC 110 §8), composée et rendue ici.
#   « Dossier ouvert » (enquête : fiche, réseaux, carnet) : mystère amusé, 104 BPM, la mineur.
#   « Déposition » (interrogatoire)                        : tension rythmée, mêmes 104 BPM et tonalité,
#                                                           pour passer de l'une à l'autre en fondu.
#   Accents (une seule fois) : indice, objection, percée (menteur coincé), raté, dossier résolu, dossier clos.
# Motif commun de 4 notes (mi-la-do-si : 5-1-b3-2), entendu dans les deux boucles et dans la percée.
#
# Tout est synthétisé (numpy) avec les instruments de tools/lux-match/musique.py : aucun échantillon,
# aucun morceau ni motif existant (référence d'intensité « jeu de procès rétro », rien de repris).
# Boucles rendues sur deux tours (on garde le second) : raccord sans clic.
# Usage : python3 tools/lux-demasque/musique.py   → public/audio/lux-demasque/*.ogg et *.mp3
import os, sys, subprocess, numpy as np
ICI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(ICI, '..', 'lux-match'))
import musique as m  # instruments, piste circulaire, réverbération, mastering (Lux Match)

RACINE = os.path.abspath(os.path.join(ICI, '..', '..'))
SORTIE = os.environ.get('LD_SORTIE') or os.path.join(RACINE, 'public', 'audio', 'lux-demasque')
SR = m.SR
BPM = 104
T = 60 / BPM

def exporter(nom, stereo):
    os.makedirs(SORTIE, exist_ok=True)
    brut = os.path.join(SORTIE, nom + '.raw')
    (np.clip(stereo.T, -1, 1) * 32767).astype('<i2').tofile(brut)
    commun = ['ffmpeg', '-y', '-loglevel', 'error', '-f', 's16le', '-ar', str(SR), '-ac', '2', '-i', brut]
    subprocess.run(commun + ['-c:a', 'libvorbis', '-q:a', '3', os.path.join(SORTIE, nom + '.ogg')], check=True)
    subprocess.run(commun + ['-c:a', 'libmp3lame', '-b:a', '96k', os.path.join(SORTIE, nom + '.mp3')], check=True)
    os.remove(brut)

# Grille commune (une mesure par accord) : Am9 | Fmaj7 | Dm9 | E7sus4→E7, quatre fois.
GRILLE = [('A', m.MIN9, 'A'), ('F', m.MAJ7, 'F'), ('D', m.MIN9, 'D'), ('E', [0, 5, 7, 10], 'E')]
MOTIF = ['E5', 'A5', 'C6', 'B5']          # 5-1-b3-2, la « question » du dossier
def note(nom): return m.hz(nom)

# ─── « Dossier ouvert » : enquête, clairsemée, pizzicatos et basse qui marche ─────
def dossier_ouvert():
    p = m.Piste(BPM, 16)
    for mesure in range(16):
        racine, intervalles, basse = GRILLE[mesure % 4]
        t0 = mesure * 4
        fin_de_phrase = mesure % 4 == 3
        # Basse ronde : temps 1 et « et » du 2, une note de passage sur le 4.
        b = note(basse + '2')
        p.poser('basse', t0, m.basse_fm(b, T * 1.3, 0.8, rond=True))
        p.poser('basse', t0 + 1.5, m.basse_fm(b * (1.5 if not fin_de_phrase else 1.335), T * 0.8, 0.55, rond=True))
        p.poser('basse', t0 + 3, m.basse_fm(b * 2 ** (-2 / 12 if fin_de_phrase else 7 / 12), T * 0.6, 0.45, rond=True))
        # Piano FM doux sur le temps 1 (accord tenu).
        for f in m.accord(racine, intervalles, 3 if racine in 'EF' else 4)[:4]:
            p.poser('piano', t0, m.piano_fm(f, T * 3.2, 0.32, brillance=0.55), pan=0.1)
        # Pizzicatos « en cachette » : arpège sur les croches, avec des silences.
        arp = m.accord(racine, intervalles, 5)
        motif = [0, None, 2, 1, None, 3, 2, None] if mesure % 2 == 0 else [None, 1, None, 2, 3, None, 1, 0]
        for k, i in enumerate(motif):
            if i is not None:
                p.poser('pizz', t0 + k * 0.5, m.pulse(arp[i % len(arp)], 0.09, 0.22, rapport=0.125), pan=-0.35 + 0.1 * (k % 3))
        # Le motif du dossier, au vibraphone pulse, mesures 5–8 et 13–16 (deux premiers temps).
        if mesure in (4, 12):
            for k, n in enumerate(MOTIF):
                p.poser('lead', t0 + k * 0.75, m.pulse(note(n), T * 0.6, 0.3, rapport=0.25, vibrato=0.4), pan=0.2)
        if mesure in (6, 14):
            for k, n in enumerate(['C6', 'B5', 'G5', 'E5']):
                p.poser('lead', t0 + k * 0.75, m.pulse(note(n), T * 0.6, 0.26, rapport=0.25, vibrato=0.4), pan=0.2)
        # Batterie feutrée : grosse caisse douce, rimshot 2 et 4, shaker en croches.
        p.poser('batterie', t0, m.grosse_caisse(0.55, douce=True))
        p.poser('batterie', t0 + 2.5, m.grosse_caisse(0.35, douce=True))
        for k in (1, 3): p.poser('batterie', t0 + k, m.rimshot(0.28), pan=0.15)
        for k in range(8): p.poser('shaker', t0 + k * 0.5, m.shaker(0.5 if k % 2 else 0.3), pan=-0.2)
    c = p.canaux
    c['piano'] = m.reverb_circulaire(c['piano'], 1.0, 0.3)
    c['lead'] = m.reverb_circulaire(m.echo_circulaire(c['lead'], T * 0.75, 0.35, 0.5), 1.1, 0.3)
    c['pizz'] = m.reverb_circulaire(c['pizz'], 0.8, 0.22)
    return m.masteriser(c, {'basse': 0.9, 'piano': 0.7, 'pizz': 1.0, 'lead': 1.0, 'batterie': 0.8, 'shaker': 0.6})

# ─── « Déposition » : la même grille, pulsée ; la tension monte sur 16 mesures ─────
def deposition():
    p = m.Piste(BPM, 16)
    for mesure in range(16):
        racine, intervalles, basse = GRILLE[mesure % 4]
        t0 = mesure * 4
        intense = mesure >= 8
        # Basse en croches, octaves alternées (moteur de l'interrogatoire).
        b = note(basse + '2')
        for k in range(8):
            f = b * (2 if k % 2 else 1)
            p.poser('basse', t0 + k * 0.5, m.basse_fm(f, T * 0.42, 0.72 if k % 2 == 0 else 0.5))
        # Nappe sombre tenue, puis arpège pulse en doubles croches quand la tension monte.
        p.poser('nappe', t0, m.nappe(m.accord(racine, intervalles, 4)[:3], T * 3.8, 0.4))
        arp = m.accord(racine, intervalles, 5)
        pas = 0.25 if intense else 0.5
        for k in range(int(4 / pas)):
            i = [0, 1, 2, 3, 2, 1][k % 6]
            p.poser('arp', t0 + k * pas, m.pulse(arp[i % len(arp)], pas * T * 0.7, 0.16 if intense else 0.13, rapport=0.125), pan=0.35 * (1 if k % 2 else -1))
        # Motif du dossier, plus présent : mesures 1, 5, 9, 13 ; réponse en 3, 7, 11, 15.
        if mesure % 4 == 0:
            for k, n in enumerate(MOTIF):
                p.poser('lead', t0 + k * 0.75, m.pulse(note(n), T * 0.65, 0.34, rapport=0.25, vibrato=0.5))
        if mesure % 4 == 2:
            for k, n in enumerate(['D6', 'C6', 'A5', 'B5']):
                p.poser('lead', t0 + k * 0.75, m.pulse(note(n), T * 0.65, 0.3, rapport=0.25, vibrato=0.5))
        # Montée chromatique avant la reprise (mesures 15–16) : la boucle relance la tension.
        if mesure == 15:
            for k, n in enumerate(['G#5', 'A5', 'A#5', 'B5']):
                p.poser('lead', t0 + k, m.pulse(note(n), T * 0.9, 0.3, rapport=0.5))
        # Batterie : grosse caisse sur chaque temps, caisse claire 2 et 4, charleston en doubles.
        for k in range(4):
            p.poser('batterie', t0 + k, m.grosse_caisse(0.8 if k == 0 else 0.62))
        for k in (1, 3): p.poser('batterie', t0 + k, m.caisse_claire(0.42 if not intense else 0.5), pan=0.1)
        for k in range(16 if intense else 8):
            pas_h = 0.25 if intense else 0.5
            p.poser('charleston', t0 + k * pas_h, m.charleston(0.3 if k % 2 else 0.45, ouvert=(k % 8 == 7)), pan=-0.25)
    c = p.canaux
    c['nappe'] = m.reverb_circulaire(c['nappe'], 1.2, 0.35)
    c['lead'] = m.reverb_circulaire(m.echo_circulaire(c['lead'], T * 0.75, 0.3, 0.45), 1.0, 0.25)
    c['arp'] = m.reverb_circulaire(c['arp'], 0.8, 0.2)
    return m.masteriser(c, {'basse': 0.85, 'nappe': 0.55, 'arp': 0.9, 'lead': 1.05, 'batterie': 0.9, 'charleston': 0.55})

# ─── Accents (non bouclés) ─────────────────────────────────────────────────────
class Tampon:
    def __init__(self, duree): self.x = np.zeros((2, int(duree * SR)))
    def poser(self, debut_s, son, vol=1.0, pan=0.0):
        i = int(debut_s * SR); n = min(len(son), self.x.shape[1] - i)
        if n <= 0: return
        g, d = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        self.x[0, i:i + n] += son[:n] * vol * g; self.x[1, i:i + n] += son[:n] * vol * d
    def fini(self, crete=0.85, fondu=0.08):
        y = self.x - self.x.mean(axis=1, keepdims=True)
        y = y / max(1e-6, np.abs(y).max()) * crete
        nf = int(fondu * SR); y[:, -nf:] *= np.linspace(1, 0, nf)
        return y

def souffle(duree, montee=True):
    """Bruit filtré qui monte (ou descend) : l'élan avant l'impact."""
    n = int(duree * SR); t = np.arange(n) / SR
    b = m.rng.uniform(-1, 1, n)
    for _ in range(2): b = (b + np.roll(b, 1)) / 2
    env = (t / duree) ** 2 if montee else np.exp(-t * 6)
    return b * env

def cuivre(f, duree, vel=1.0):
    """« Cuivre » FM court et brillant (stab d'objection)."""
    n = int((duree + 0.25) * SR); t = np.arange(n) / SR
    idx = 2.6 * np.exp(-t * 5) + 0.6
    s = np.sin(2 * np.pi * f * t + np.sin(2 * np.pi * f * t) * idx)
    s += 0.5 * np.sin(2 * np.pi * f * 2.002 * t + np.sin(2 * np.pi * f * t) * idx * 0.5)
    return np.tanh(s * 1.4) * m.env_adsr(n, 0.008, 0.22, 0.55, 0.18, duree) * vel

def cymbale(duree, vel=1.0):
    n = int(duree * SR); t = np.arange(n) / SR
    b = m.rng.uniform(-1, 1, n); b = b - np.roll(b, 1)
    return b * np.exp(-t * 3.2) * vel * 0.5

def objection():
    x = Tampon(1.7)
    x.poser(0.0, souffle(0.22), 0.5)
    x.poser(0.22, m.grosse_caisse(1.0), 1.0)
    n = int(0.9 * SR); t = np.arange(n) / SR
    x.poser(0.22, np.sin(2 * np.pi * np.cumsum(70 * np.exp(-t * 3) + 30) / SR) * np.exp(-t * 4), 0.9)  # sous-grave qui tombe
    x.poser(0.22, cymbale(1.0), 0.3, pan=0.2)
    for debut, vel in ((0.24, 0.8), (0.46, 1.0)):   # « ta-DAA » : deux coups de cuivre
        for nn in ['A3', 'E4', 'A4', 'C5', 'E5', 'B5']:
            x.poser(debut, cuivre(note(nn), 0.12 if debut < 0.3 else 0.75, vel), 0.34)
    return x.fini(0.9)

def percee():
    # Deux mesures : roulement, basse qui grimpe la-do-ré-mi, le motif aigu, cadence suspendue.
    x = Tampon(2 * 4 * T + 0.9)
    for k in range(8): x.poser(k * T, m.grosse_caisse(0.8), 0.9)
    for k in range(16): x.poser(4 * T + k * T / 4, m.caisse_claire(0.2 + 0.03 * k), 0.4, pan=0.1)
    for k, nn in enumerate(['A2', 'C3', 'D3', 'E3']):
        for j in range(4): x.poser((k * 2 + j * 0.5) * T, m.basse_fm(note(nn) * (2 if j % 2 else 1), T * 0.42, 0.8), 0.8)
    for k, nn in enumerate(MOTIF + ['E6', 'D6', 'B5', 'G#5']):
        x.poser(k * T, m.pulse(note(nn), T * 0.8, 0.5, rapport=0.25, vibrato=0.4), 0.55, pan=-0.15)
    for nn in ['E3', 'G#3', 'B3', 'D4']: x.poser(8 * T, cuivre(note(nn), 0.6, 0.8), 0.22)
    x.poser(8 * T, cymbale(0.9), 0.5)
    return x.fini(0.85)

def rate():
    x = Tampon(0.9)
    n = int(0.45 * SR); t = np.arange(n) / SR
    glisse = np.sin(2 * np.pi * np.cumsum(520 * np.exp(-t * 2.2)) / SR) * m.env_adsr(n, 0.005, 0.3, 0.6, 0.1, 0.35)
    x.poser(0.0, glisse, 0.5)
    x.poser(0.42, m.pulse(note('E4'), 0.08, 0.5, rapport=0.5), 0.5)
    x.poser(0.55, m.pulse(note('D#4'), 0.22, 0.5, rapport=0.5), 0.5)
    x.poser(0.42, m.rimshot(0.6), 0.4)
    return x.fini(0.4)

def indice():
    x = Tampon(0.75)
    for k, nn in enumerate(['A5', 'C6', 'E6']): x.poser(k * 0.07, m.pulse(note(nn), 0.08, 0.6, rapport=0.125), 0.5, pan=-0.2 + 0.2 * k)
    x.poser(0.21, m.piano_fm(note('B6'), 0.2, 0.6, brillance=1.2), 0.35, pan=0.3)
    return x.fini(0.5)

def resolu():
    # La mineur → la majeur : le dossier est bouclé.
    x = Tampon(3.4)
    for k, nn in enumerate(['E5', 'A5', 'C#6', 'E6']):
        x.poser(k * T * 0.5, m.pulse(note(nn), T * 0.45, 0.6, rapport=0.25), 0.5)
    for nn in ['A3', 'E4', 'A4', 'C#5', 'E5']: x.poser(2 * T, cuivre(note(nn), 1.4, 0.8), 0.2)
    x.poser(2 * T, m.grosse_caisse(0.9), 0.8); x.poser(2 * T, cymbale(1.6), 0.5)
    for k in range(4): x.poser(k * T * 0.5, m.caisse_claire(0.4), 0.35)
    x.poser(2 * T, m.piano_fm(note('A5'), 1.6, 0.7), 0.3)
    return x.fini(0.85, 0.3)

def clos():
    x = Tampon(1.6)
    x.poser(0.0, m.piano_fm(note('C5'), 0.4, 0.6, brillance=0.6), 0.5)
    x.poser(0.35, m.piano_fm(note('B4'), 0.9, 0.6, brillance=0.6), 0.5)
    for nn in ['E3', 'B3', 'D4']: x.poser(0.35, m.piano_fm(note(nn), 0.9, 0.4, brillance=0.5), 0.25)
    return x.fini(0.55, 0.2)

if __name__ == '__main__':
    exporter('dossier-ouvert', dossier_ouvert())
    exporter('deposition', deposition())
    for nom, f in (('objection', objection), ('percee', percee), ('rate', rate), ('indice', indice), ('resolu', resolu), ('clos', clos)):
        exporter(nom, f())
    print('ok →', SORTIE)
