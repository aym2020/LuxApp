# Export Quaternius -> GLB sans animations (mesh + squelette) ; option --anims : animations seules utiles.
import bpy, sys
args = sys.argv[sys.argv.index('--')+1:]
src, dst, mode = args[0], args[1], args[2]
PEAU_SRGB = (214, 160, 122)
garder = {'Idle', 'Victory', 'Defeat', 'RecieveHit', 'Jump', 'Walk', 'Punch', 'PickUp'}
bpy.ops.wm.open_mainfile(filepath=src)
for a in list(bpy.data.actions):
    if mode != 'anims' or a.name not in garder:
        if mode != 'anims': bpy.data.actions.remove(a)
        elif a.name not in garder: bpy.data.actions.remove(a)
for m in bpy.data.materials:
    couleur = tuple(m.diffuse_color)
    m.use_nodes = True
    nn = m.node_tree.nodes
    for n in list(nn): nn.remove(n)
    bsdf = nn.new('ShaderNodeBsdfPrincipled'); out = nn.new('ShaderNodeOutputMaterial'); out.is_active_output = True
    m.node_tree.links.new(bsdf.outputs[0], out.inputs[0])
    if m.name == 'Skin': couleur = tuple((c / 255) ** 2.2 for c in PEAU_SRGB) + (1.0,)
    bsdf.inputs['Base Color'].default_value = couleur
    bsdf.inputs['Metallic'].default_value = 0.0
    bsdf.inputs['Roughness'].default_value = 0.8
if mode == 'anims':
    # Garder l'armature seule : on supprime les maillages.
    for o in list(bpy.data.objects):
        if o.type == 'MESH': bpy.data.objects.remove(o)
bpy.ops.export_scene.gltf(filepath=dst, export_format='GLB', export_animations=(mode == 'anims'),
                          export_animation_mode='ACTIONS', export_apply=False)
