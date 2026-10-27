import bpy, sys, os
args = sys.argv[sys.argv.index('--')+1:]
src, dst = args[0], args[1]
bpy.ops.wm.read_factory_settings(use_empty=True)
pieces = ['floorFull','wall','wallWindow','wallCorner','kitchenBar','kitchenBarEnd','kitchenCoffeeMachine','kitchenCabinet',
          'stoolBar','tableRound','tableCloth','chairCushion','pottedPlant','plantSmall1','plantSmall2','plantSmall3',
          'lampRoundFloor','lampSquareCeiling','lampRoundTable','rugRound','benchCushion','sideTable','kitchenBlender']
for nom in pieces:
    avant = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=os.path.join(src, nom + '.glb'))
    nouveaux = [o for o in bpy.data.objects if o not in avant]
    racine = bpy.data.objects.new(nom, None)
    bpy.context.scene.collection.objects.link(racine)
    for o in nouveaux:
        if o.parent is None: o.parent = racine
bpy.ops.export_scene.gltf(filepath=dst, export_format='GLB', export_animations=False)
