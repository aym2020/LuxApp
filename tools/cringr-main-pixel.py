# SPEC 118 §10 — régénère public/art/cringr-doigts.svg et cringr-pouce.svg (lancer depuis la racine du dépôt).
# Génère la main pixel art (doigts à gauche, pouce + paume à droite). 1 unité = 1 pixel art.
import math
COUL={'o':'#2a1218','h':'#f7c49d','s':'#e49a72','d':'#b8674f','D':'#8a4636','n':'#e74791','m':'#ff9cc8','N':'#a8285f'}
def capsule(W,H):
    """Doigt horizontal, bout arrondi à droite. Renvoie une grille de lettres."""
    r=H/2; g=[['.']*W for _ in range(H)]
    for y in range(H):
        for x in range(W):
            cy=y+.5; cx=x+.5
            dedans = cx<=W-r or (cx-(W-r))**2+(cy-r)**2<=r*r
            if dedans: g[y][x]='s'
    return g
def ombrer(g):
    H=len(g); W=len(g[0])
    for y in range(H):
        for x in range(W):
            if g[y][x]!='s': continue
            if y<=2: g[y][x]='h'
            elif y>=H-3: g[y][x]='d'
    return g
def ongle(g,x0,x1,y0,y1):
    for y in range(y0,y1):
        for x in range(x0,x1):
            if g[y][x] in 'shd':
                g[y][x]='m' if y==y0 or x==x0 else ('N' if y==y1-1 else 'n')
def contour(g):
    H=len(g); W=len(g[0]); out=[r[:] for r in g]
    for y in range(H):
        for x in range(W):
            if g[y][x]!='.': 
                bord = any(not(0<=y+dy<H and 0<=x+dx<W) or g[y+dy][x+dx]=='.' for dx,dy in((1,0),(-1,0),(0,1),(0,-1)))
                # pas de contour sur le côté qui sort de l'écran (gauche)
                if bord and x>0: out[y][x]='o'
    return out
def svg(g,nom):
    H=len(g); W=len(g[0]); rects=[]
    for y in range(H):
        x=0
        while x<W:
            c=g[y][x]
            if c=='.': x+=1; continue
            x2=x
            while x2<W and g[y][x2]==c: x2+=1
            rects.append(f'<rect x="{x}" y="{y}" width="{x2-x}" height="1" fill="{COUL[c]}"/>')
            x=x2
    open(nom,'w').write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" shape-rendering="crispEdges">'+''.join(rects)+'</svg>\n')

# Doigts gauches : 4 doigts (index → auriculaire), longueurs différentes.
W,HF=24,11
long=[16,19,22,22]
G=[['.']*W for _ in range(HF*4)]
for i,L in enumerate(long):
    f=ombrer(capsule(L,HF))
    ongle(f,L-7,L-2,3,HF-3)
    for x in range(L-11,L-10):   # pli de l'articulation
        for y in range(3,HF-2):
            if f[y][x] in 'sh': f[y][x]='d'
    for x in range(L):
        if i<3 and f[HF-1][x]!='.': f[HF-1][x]='o'
    for y in range(HF):
        for x in range(L): G[i*HF+y][x]=f[y][x]
svg(contour(G),'public/art/cringr-doigts.svg')

# Pouce droit : vertical, bout arrondi en haut, qui s'élargit en paume en bas à droite.
W2,H2=30,54
G2=[['.']*W2 for _ in range(H2)]
for y in range(H2):
    for x in range(W2):
        cx,cy=x+.5,y+.5
        pouce = (4<=cx<=16 and cy>=6) or (cx-10)**2+(cy-6)**2<=36
        paume = (cx-26)**2/18**2+(cy-58)**2/28**2<=1
        if pouce or paume: G2[y][x]='s'
# ombrage : bord gauche du pouce et bas plus sombres, crête claire à droite
for y in range(H2):
    xs=[x for x in range(W2) if G2[y][x]=='s']
    if not xs: continue
    a,b=xs[0],xs[-1]
    for x in xs:
        if x<=a+2: G2[y][x]='d'
        elif x>=b-2 and y<34 and x<=17: G2[y][x]='h'
    if y>40:
        for x in xs[:4]: G2[y][x]='D'
# ongle du pouce
for y in range(2,10):
    xs=[x for x in range(W2) if G2[y][x]!='.']
    if len(xs)>6:
        for x in xs[2:-2]:
            G2[y][x]='m' if y==2 else ('N' if y==9 else 'n')
# pli sous l'ongle
for x in range(W2):
    if G2[13][x] in 'sh' and x<17: G2[13][x]='d'
# pli entre le pouce et la paume
for y in range(30,40):
    x=17+(y-30)//3
    if G2[y][x] in 'shd': G2[y][x]='D'
def contour2(g):
    H=len(g); W=len(g[0]); out=[r[:] for r in g]
    for y in range(H):
        for x in range(W):
            if g[y][x]!='.' and y<H-1 and x<W-1:
                if any(not(0<=y+dy<H and 0<=x+dx<W) or g[y+dy][x+dx]=='.' for dx,dy in((1,0),(-1,0),(0,1),(0,-1))): out[y][x]='o'
    return out
svg(contour2(G2),'public/art/cringr-pouce.svg')
