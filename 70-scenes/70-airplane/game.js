import { createFullScene, renderer, camera, createOrbitControls } from '/utils/scene.js'
import { createTerrain } from '/utils/ground.js'
import { cameraFollowObject } from '/utils/helpers.js'
import keyboard from '/classes/Keyboard.js'
import Airplane from '/classes/Airplane.js'

const scene = createFullScene({ color:0xFFC880 }, undefined, undefined, { color: 0xE5C5AB })
scene.add(createTerrain(4000, 200))

const controls = createOrbitControls()

const avion = new Airplane(() => {
  scene.add(avion.mesh)
  controls.target = avion.mesh.position
  scene.getObjectByName('sunLight').target = avion.mesh
})

/* UPDATE */

void function animate() {
  requestAnimationFrame(animate)
  controls.update()
  avion.update()
  if (!keyboard.mouseDown)
    cameraFollowObject(camera, avion.mesh)

  renderer.render(scene, camera)
}()