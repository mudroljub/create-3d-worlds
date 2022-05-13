import { scene, camera, renderer, clock } from '/utils/scene.js'
import { createRandomBoxes } from '/utils/boxes.js'
import { createGround } from '/utils/ground.js'
import Avatar from '/classes/Avatar.js'
import { hemLight } from '/utils/light.js'

hemLight()

camera.position.z = 40
camera.position.y = 20

const floor = createGround({ file: 'ground.jpg' })
scene.add(floor)
const boxes = createRandomBoxes()
scene.add(boxes)

const player = new Avatar({ size: 10, skin: 0 })
player.mesh.rotateY(Math.PI)
player.mesh.add(camera)
scene.add(player.mesh)

player.addSolids(floor, boxes)

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  const delta = clock.getDelta()
  player.update(delta)
  renderer.render(scene, camera)
}()
