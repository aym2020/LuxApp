"""Petite fabrique de leçons au format en unités (v2).

Chaque script tools/migration/lecon-NN.py décrit sa leçon avec ces fonctions,
puis appelle ecrire(). Les ids de chaque section sont donnés automatiquement,
à partir de 2001, dans l'ordre d'écriture (jamais mélangés avec la v1).
"""
import json
import os

RACINE = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')


class Lecon:
    def __init__(self, fichier_v1):
        self.fichier = os.path.join(RACINE, 'data', 'lecons', fichier_v1)
        with open(self.fichier, encoding='utf-8') as f:
            v1 = json.load(f)
        self.base = {k: v1[k] for k in ('id', 'titre', 'titre_fr', 'couleur')}
        # Nombre de questions de l'ancienne version : garde l'acquis v1 (progress.js, acquisV1).
        if 'unites' in v1:
            self.v1 = v1.get('v1')
        else:
            self.v1 = {t: len(v1.get(t, [])) for t in ('quiz', 'trous', 'ecriture')}
        self.instructions = {}
        self.mission = None
        self.scene = []
        self.unites = []
        self.items = {'flashcards': [], 'quiz': [], 'trous': [], 'ecriture': []}
        self.cours = []

    # ── Mission et scène ──
    def fil(self, titre, contexte, objectif):
        self.mission = {'titre': titre, 'contexte': contexte, 'objectif': objectif}

    def replique(self, unite, qui, lu, fr, aide=None):
        x = {'qui': qui, 'lu': lu, 'fr': fr, 'unite': unite}
        if aide:
            x['aide'] = aide
        self.scene.append(x)

    # ── Unités ──
    def unite(self, id, titre, regle, exemple, pieges, phrase=None, phrases=None, bonus=False):
        u = {'id': id, 'titre': titre}
        if bonus:
            u['bonus'] = True
        if phrase:
            u['phrase'] = phrase
        u['regle'] = regle
        u['exemple'] = exemple
        if phrases:
            u['phrases'] = phrases
        u['pieges'] = pieges
        self.unites.append(u)

    # ── Exercices ──
    def _ajout(self, type_, unite, champs, plus, attention):
        x = {'id': 2001 + len(self.items[type_]), 'unite': unite}
        if plus:
            x['plus'] = True
        x.update(champs)
        if attention:
            x['attention'] = attention
        self.items[type_].append(x)

    def carte(self, unite, fr, lu, note=None, article=None, indice=None, plus=False, attention=None):
        champs = {'fr': fr, 'lu': lu}
        if article:
            champs['article'] = article
        if indice:
            champs['indice'] = indice
        if note:
            champs['note'] = note
        self._ajout('flashcards', unite, champs, plus, attention)

    def quiz(self, unite, question, reponse, distracteurs, label=None, plus=False, attention=None):
        champs = {'question': question, 'reponse': reponse, 'distracteurs': distracteurs}
        if label:
            champs['label'] = label
        self._ajout('quiz', unite, champs, plus, attention)

    def trou(self, unite, fr, avant, trou, apres, choix, note, plus=False, attention=None):
        champs = {'fr': fr, 'avant': avant, 'trou': trou, 'apres': apres, 'choix': choix, 'note': note}
        self._ajout('trous', unite, champs, plus, attention)

    def ecrit(self, unite, fr, lu, plus=False, attention=None):
        self._ajout('ecriture', unite, {'fr': fr, 'lu': lu}, plus, attention)

    # ── Cours ──
    def bloc(self, bloc, unite=None, plus=False):
        b = dict(bloc)
        if unite is not None:
            b['unite'] = unite
        if plus:
            b['plus'] = True
        self.cours.append(b)

    # ── Écriture du fichier ──
    def ecrire(self):
        sortie = dict(self.base)
        sortie['v1'] = self.v1
        sortie['instructions'] = self.instructions
        sortie['mission'] = self.mission
        sortie['scene'] = self.scene
        sortie['unites'] = self.unites
        sortie.update(self.items)
        sortie['cours'] = self.cours
        with open(self.fichier, 'w', encoding='utf-8') as f:
            json.dump(sortie, f, ensure_ascii=False, indent=2)
            f.write('\n')
        resume = ', '.join(t + ' ' + str(len(v)) for t, v in self.items.items())
        print('écrit', os.path.relpath(self.fichier, RACINE), '·', len(self.unites), 'unités ·', resume)
