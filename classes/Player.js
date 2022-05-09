import * as THREE from '/node_modules/three108/build/three.module.js'
import { keyboard, Kamenko } from '/classes/index.js'
import { createPlayerBox } from '/utils/boxes.js'
import { addSolids, raycastGround } from '/classes/actions/index.js'
import { getSize } from '/utils/helpers.js'

const { pressed } = keyboard

/**
 * Player handle user input, move mesh and call model animations.
 */
export default class Player {
  constructor({ x = 0, y = 0, z = 0, size = 35, transparent = false, mesh } = {}) {
    this.mesh = mesh || createPlayerBox(x, y, z, this.size, transparent)
    this.size = mesh ? getSize(mesh).y : size
    this.speed = this.size * 4
    this.solids = []
    this.groundY = 0
  }

  /**
   * Check user input and move mesh
   */
  moveMesh(delta) {
    if (!this.mesh) return
    const step = this.speed * delta // speed (in pixels) per second
    const stepY = this.speed * delta * 2
    const angle = Math.PI / 2 * delta

    if (!pressed.Space) {
      if (this.position.y > this.groundY)
        if (this.position.y - stepY >= this.groundY) this.mesh.translateY(-stepY)
      if (this.position.y < this.groundY) this.mesh.translateY(stepY)
    }
    if (keyboard.left) this.mesh.rotateY(angle)
    if (keyboard.right) this.mesh.rotateY(-angle)

    if (this.directionBlocked()) return

    if (keyboard.up) this.mesh.translateZ(-step)
    if (keyboard.down) this.mesh.translateZ(step)
    if (pressed.KeyQ) this.mesh.translateX(-step)
    if (pressed.KeyE) this.mesh.translateX(step)
    if (pressed.Space) this.mesh.translateY(stepY)
  }

  /**
   * Check user input and call model animations
   */
  animateModel() {
    if (!keyboard.totalPressed)
      this.model.idle()
    else if (pressed.ShiftLeft && pressed.KeyW)
      this.model.squatWalk()
    else if (pressed.ShiftLeft)
      this.model.squat()
    else if (pressed.Space)
      this.model.jump()
    else if (pressed.KeyW || pressed.KeyS || pressed.KeyQ || pressed.KeyE || pressed.ArrowUp || pressed.ArrowDown)
      this.model.walk()
    // dodati sideWalk()
  }

  updateGround() {
    this.groundY = raycastGround(this, { y: this.size * 2 })
  }

  /**
   * Raycast in player movement direction
   */
  chooseRaycastVector() {
    if (pressed.Space && keyboard.up) return new THREE.Vector3(0, 1, -1)
    if (keyboard.up) return new THREE.Vector3(0, 0, -1)
    if (keyboard.down) return new THREE.Vector3(0, 0, 1)
    if (keyboard.left) return new THREE.Vector3(-1, 0, 0)
    if (keyboard.right) return new THREE.Vector3(1, 0, 0)
    if (pressed.Space) return new THREE.Vector3(0, 1, 0)
    return null
  }

  directionBlocked() {
    if (!this.mesh || !this.solids.length) return
    const vector = this.chooseRaycastVector()
    if (!vector) return false
    const direction = vector.applyQuaternion(this.mesh.quaternion)
    const bodyCenter = this.position.clone()
    bodyCenter.y += this.size
    const raycaster = new THREE.Raycaster(bodyCenter, direction, 0, this.size)
    const intersections = raycaster.intersectObjects(this.solids, true)
    return intersections.length > 0
  }

  get position() {
    return this.mesh.position
  }

  get x() {
    return this.mesh.position.x
  }

  get z() {
    return this.mesh.position.z
  }

  get angle() {
    const { rotation } = this.mesh
    const rotationY = rotation.x == 0 ? rotation.y : Math.PI - rotation.y
    return -rotationY - Math.PI * .5
  }

  add(obj) {
    this.mesh.add(obj)
  }

  addSolids(...newSolids) {
    addSolids(this.solids, ...newSolids)
  }

  update(delta) {
    this.updateGround()
    this.moveMesh(delta)
    if (this.model) {
      this.animateModel()
      this.model.update(delta)
    }
  }
}

/**
 * Bridge between Player and Model.
 * @param ModelClass is used to load `mesh`.
 * @param callback is used to pass `mesh` to the scene.
 */
export class PlayerModel extends Player {
  constructor(x, y, z, size, callback, ModelClass) {
    super({ x, y, z, size })
    this.model = new ModelClass(mesh => {
      this.mesh = mesh
      mesh.position.set(x, y, z)
      callback(mesh)
    }, size)
  }
}

export class PlayerAvatar extends Player {
  constructor(x, y, z, size, skin) {
    super({ x, y, z, size })
    this.model = new Kamenko(x, y, z, size, skin)
    this.mesh = this.model.mesh
  }
}
