# SPEC 96 V2 — Lux Runner 3D : exporte un personnage Quaternius (.blend) en GLB.
# Usage : python (avec le paquet bpy) exporter_coureur.py Casual2_Male.blend public/runner3d/coureur.glb
# Ne garde que les animations utiles et remplace les anciens matériaux (Diffuse BSDF non exportable).
import bpy, sys
src, dst = sys.argv[1], sys.argv[2]
garder = {'Idle', 'Run', 'Jump', 'RecieveHit', 'Victory', 'Death', 'Roll'}
bpy.ops.wm.open_mainfile(filepath=src)
for a in list(bpy.data.actions):
    if a.name not in garder:
        bpy.data.actions.remove(a)
# Matériaux : une seule sortie, reliée à un Principled BSDF portant la couleur
# (les fichiers d'origine ont plusieurs sorties et un Diffuse BSDF non exportable).
for m in bpy.data.materials:
    couleur = tuple(m.diffuse_color)
    m.use_nodes = True
    noeuds = m.node_tree.nodes
    for n in list(noeuds):
        noeuds.remove(n)
    bsdf = noeuds.new('ShaderNodeBsdfPrincipled')
    sortie = noeuds.new('ShaderNodeOutputMaterial')
    sortie.is_active_output = True
    m.node_tree.links.new(bsdf.outputs[0], sortie.inputs[0])
    bsdf.inputs['Base Color'].default_value = couleur
    bsdf.inputs['Metallic'].default_value = 0.0
    bsdf.inputs['Roughness'].default_value = 0.75
bpy.ops.export_scene.gltf(filepath=dst, export_format='GLB', export_animations=True,
                          export_animation_mode='ACTIONS', export_apply=False, export_draco_mesh_compression_enable=False)
