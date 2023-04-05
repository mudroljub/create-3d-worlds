import { camera, scene, renderer, clock, createOrbitControls } from '/utils/scene.js'
import { createFloor } from '/utils/ground.js'
import { ambLight } from '/utils/light.js'
import { SorceressPlayer } from '/utils/actor/child/fantasy/Sorceress.js'
import { GolemAI } from '/utils/actor/child/fantasy/Golem.js'
import { getShuffledCoords } from '/utils/helpers.js'

const mapSize = 100
const npcs = []
const coords = getShuffledCoords({ mapSize })

ambLight()
camera.position.set(0, 10, 15)
createOrbitControls()

scene.add(createFloor({ size: mapSize }))

const player = new SorceressPlayer()
scene.add(player.mesh)

for (let i = 0; i < 20; i++) {
  const ai = new GolemAI({ mapSize, pos: coords.pop(), baseState: 'wander' })
  npcs.push(ai)
  scene.add(ai.mesh)
}

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  const delta = clock.getDelta()

  player.update()
  npcs.forEach(ai => ai.update(delta))

  renderer.render(scene, camera)
}()
