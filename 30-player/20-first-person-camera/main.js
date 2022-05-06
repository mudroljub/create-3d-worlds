import * as THREE from '/node_modules/three108/build/three.module.js'
import { scene, camera, renderer, clock } from '/utils/scene.js'
import keyboard from '/classes/Keyboard.js'
import { createFloor } from '/utils/helpers.js'

camera.position.set(0, 150, 400)
camera.lookAt(scene.position)

const floor = createFloor({ file: 'sand-512.jpg', circle: false })
scene.add(floor)

const player = new THREE.Mesh()
player.position.set(0, 25.1, 0)
scene.add(player)

function update() {
  const delta = clock.getDelta() // seconds
  const step = 200 * delta // 200 pixels per second
  const angle = Math.PI / 2 * delta // pi/2 radians (90 degrees) per second

  if (keyboard.left) player.rotateY(angle)
  if (keyboard.right) player.rotateY(-angle)

  if (keyboard.up) player.translateZ(-step)
  if (keyboard.down) player.translateZ(step)
  if (keyboard.pressed.KeyQ) player.translateX(-step)
  if (keyboard.pressed.KeyE) player.translateX(step)

  const relativeCameraOffset = new THREE.Vector3(0, 50, 200)
  const cameraOffset = relativeCameraOffset.applyMatrix4(player.matrixWorld)

  camera.position.x = cameraOffset.x
  camera.position.y = cameraOffset.y
  camera.position.z = cameraOffset.z
  camera.lookAt(player.position)
}

void function animate() {
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
  update()
}()