# SPEC 96 V2 — Lux Runner 3D : assemble les pièces Kenney utiles dans un seul GLB.
# Usage : python (avec bpy) exporter_ville.py <City Kit Roads/Models/GLTF format> <City Kit Commercial/Models/GLB format> public/runner3d/ville.glb
import bpy, sys, os
routes, commercial, dst = sys.argv[1], sys.argv[2], sys.argv[3]
bpy.ops.wm.read_factory_settings(use_empty=True)
pieces = [(routes, n) for n in ['road_straight', 'road_straightBarrier', 'light_curved', 'light_square', 'construction_light']]
pieces += [(commercial, 'low-detail-building-' + c) for c in 'abcdefghijklmn']
pieces += [(commercial, 'low-detail-building-wide-a'), (commercial, 'low-detail-building-wide-b')]
pieces += [(commercial, 'building-skyscraper-' + c) for c in 'abcde']
for dossier, nom in pieces:
    avant = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=os.path.join(dossier, nom + '.glb'))
    nouveaux = [o for o in bpy.data.objects if o not in avant]
    racine = bpy.data.objects.new(nom, None)
    bpy.context.scene.collection.objects.link(racine)
    for o in nouveaux:
        if o.parent is None:
            o.parent = racine
print('objets', len(bpy.data.objects))
bpy.ops.export_scene.gltf(filepath=dst, export_format='GLB', export_animations=False)
