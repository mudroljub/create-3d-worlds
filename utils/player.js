import * as THREE from '/node_modules/three127/build/three.module.js'
import keyboard from '/classes/Keyboard.js'
import { RIGHT_ANGLE } from '/utils/constants.js'
import { getHeight } from '/utils/helpers.js'

let jumpCount = 0

const jump = (mesh, delta, playerHeight) => {
  const maxJump = playerHeight
  const jumpSpeed = playerHeight * delta

  jumpCount += jumpSpeed
  mesh.position.y = maxJump * Math.sin(jumpCount) + maxJump + playerHeight * .5 // sin could be -1 to 1
}

export function handleInput(mesh, delta) {
  const playerHeight = getHeight(mesh)
  const speedDelta = playerHeight * 4 * delta // pixels per second
  const rotateDelta = RIGHT_ANGLE * delta // 90 degrees per second

  if (keyboard.pressed.Space)
    jump(mesh, delta, playerHeight)

  if (!keyboard.pressed.Space && mesh.position.y > playerHeight * .5 + .01) jump(mesh, delta, playerHeight)

  if (keyboard.up)
    mesh.translateZ(-speedDelta)
  if (keyboard.down)
    mesh.translateZ(speedDelta)
  if (keyboard.pressed.KeyQ)
    mesh.translateX(-speedDelta)
  if (keyboard.pressed.KeyE)
    mesh.translateX(speedDelta)

  if (keyboard.left)
    mesh.rotateOnAxis(new THREE.Vector3(0, 1, 0), rotateDelta)
  if (keyboard.right)
    mesh.rotateOnAxis(new THREE.Vector3(0, 1, 0), -rotateDelta)

  // for airplane
  // if (keyboard.pressed.KeyR)
  //   mesh.rotateOnAxis(new THREE.Vector3(1, 0, 0), rotateDelta)
  // if (keyboard.pressed.KeyF)
  //   mesh.rotateOnAxis(new THREE.Vector3(1, 0, 0), -rotateDelta)
}