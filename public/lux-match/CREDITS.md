# Lux Match 3D — crédits des assets

Tous les modèles sont sous licence **CC0 1.0** (domaine public). Auteurs crédités par courtoisie.

| Fichier | Contenu | Source |
|---|---|---|
| `Casual_Female.glb`, `Casual2_Female.glb`, `Casual3_Female.glb`, `Suit_Female.glb`, `Doctor_Female_Young.glb` | Personnages du rendez-vous (sans animation, teintes recolorées à l'exécution) | Quaternius — *Ultimate Animated Character Pack* (2019) |
| `Casual_Male.glb`, `Casual2_Male.glb`, `Casual3_Male.glb`, `Suit_Male.glb` | Looks du joueur (Alex) | Quaternius — même pack |
| `anims.glb` | Squelette commun + animations Idle, Victory, Defeat, RecieveHit, Jump, Walk, Punch, PickUp | Quaternius — même pack (squelette identique pour tous les modèles) |
| `cafe.glb` | Sol, murs, comptoir, machine à café, tabourets, tables, plantes, lampes, tapis | Kenney — *Furniture Kit* 2.0 (www.kenney.nl) |

Régénération : `tools/lux-match/exporter_personnage.py` et `tools/lux-match/exporter_cafe.py` (Blender `bpy`), puis `gltf-transform weld` + `quantize` (KHR_mesh_quantization, lu nativement par Three.js r170).
