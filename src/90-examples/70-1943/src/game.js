import * as THREE from '/node_modules/three119/build/three.module.js'
import { OrbitControls } from '/node_modules/three119/examples/jsm/controls/OrbitControls.js'

import { scene, renderer, camera } from '/utils/scene.js'
import ground from './actors/ground.js'
import Avion from './actors/Avion.js'
import { createSunLight } from '/utils/light.js'
import { loadModel } from '/utils/loaders.js'

scene.fog = new THREE.Fog(0xE5C5AB, 200, 950)

scene.add(
  new THREE.HemisphereLight(0xD7D2D2, 0x302B2F, .9),
  createSunLight({ x: 150, y: 350, z: -150 })
)

camera.position.set(-68, 143, -90)

const controls = new OrbitControls(camera, renderer.domElement)

// const { mesh, mixer } = await loadModel({ file: '/aircraft_junkers_ju_87_stuka/scene.gltf', size: 30 })

const { mesh, mixer } = await loadModel({ file: '/aircraft_messerschmitt_109/scene.gltf', size: 20 })

mesh.position.y = 100

Avion(mesh) // extends mesh

scene.add(mesh, ground)

/* FUNCTIONS */

void function update() {
  requestAnimationFrame(update)
  controls.update()
  ground.rotate()
  mesh.normalizePlane()
  if (mixer) mixer.update(0.016)
  camera.lookAt(mesh.position)
  renderer.render(scene, camera)
}()
