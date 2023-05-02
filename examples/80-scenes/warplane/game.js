import * as THREE from 'three'
import { scene, renderer, camera, clock, createOrbitControls } from '/utils/scene.js'
import { createSun } from '/utils/light.js'
import Warplane from '/utils/aircrafts/Warplane.js'
import { createTree } from '/utils/geometry/trees.js'
import { putOnSolids } from '/utils/helpers.js'
import { createWorldSphere } from '/utils/geometry.js'

const r = 1000

createOrbitControls()
camera.position.set(30, 100, 50)

// scene.fog = new THREE.Fog(0xE5C5AB, 10, 450)

scene.add(new THREE.HemisphereLight(0xD7D2D2, 0x302B2F, .25))
scene.add(createSun({ pos: [50, 250, 50] }))

const earth = createWorldSphere({ r, segments: 100, color: 0x91A566, distort: 15 })
earth.position.set(0, -990, 2)
scene.add(earth)

const aircraft = new Warplane()

scene.add(aircraft.mesh)

/* FUNCTIONS */

function addTree() {
  const tree = createTree({ size: 10 })
  // putOnSolids(tree, earth)
  // tree.position.y += 1000
  earth.add(tree)
}

/* LOOP */

addTree()

void function update() {
  requestAnimationFrame(update)
  const delta = clock.getDelta()

  earth.rotation.x += delta * .07
  aircraft.update(delta)
  camera.lookAt(aircraft.mesh.position)

  renderer.render(scene, camera)
}()

/* LOOP */

document.addEventListener('click', () => {
  addTree()
})