import * as THREE from '/node_modules/three108/build/three.module.js'
import { scene, renderer, clock, camera, hemLight } from '/utils/scene.js'
import { createGround } from '/utils/ground/index.js'
import { createFirTrees } from '/utils/trees.js'
import { keyboard, PlayerAvatar } from '/classes/index.js'

hemLight({ intensity: 1.25 })

camera.position.z = 500
camera.position.y = 250
const fpsCamera = camera.clone()
let currentCamera = camera

const avatar = new PlayerAvatar()
scene.add(avatar.mesh, createGround({ file: 'ground.jpg' }), createFirTrees())

/* FUNCTIONS */

function followPlayer() {
  const distance = new THREE.Vector3(0, 50, 100)
  const { x, y, z } = distance.applyMatrix4(avatar.mesh.matrixWorld)
  fpsCamera.position.set(x, y, z)
}

const updateCamera = () => {
  if (keyboard.pressed.Digit1) currentCamera = camera
  if (keyboard.pressed.Digit2) currentCamera = fpsCamera
  if (currentCamera == fpsCamera) followPlayer()
  currentCamera.lookAt(avatar.position)
}

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  const delta = clock.getDelta()
  avatar.update(delta)
  updateCamera()
  renderer.render(scene, currentCamera)
}()