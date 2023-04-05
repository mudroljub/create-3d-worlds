import { getMesh, putOnTerrain, getSize, getScene } from '/utils/helpers.js'
import { clone } from '/node_modules/three/examples/jsm/utils/SkeletonUtils.js'

export default class GameObject {

  constructor({ mesh, name, pos, color, solids, scale, rotateY } = {}) {
    this.mesh = clone(mesh)
    this.name = name

    if (pos) this.position = pos
    if (pos && solids) putOnTerrain(this.mesh, solids)

    if (scale) this.mesh.scale.set(scale, scale, scale)
    if (color != undefined) getMesh(this.mesh).material.color.setHex(color)
    if (rotateY) this.mesh.rotateY(rotateY)

    const { y, z } = getSize(this.mesh)
    this.height = y
    this.depth = z
  }

  /* GETTERS & SETTERS */

  get name() {
    return this.mesh.name
  }

  set name(name) {
    this.mesh.name = name
  }

  get position() {
    return this.mesh.position
  }

  set position(pos) {
    this.mesh.position.copy(pos)
  }

  get scene() {
    return getScene(this.mesh)
  }

  /* UTILS */

  add(obj) {
    this.mesh.add(obj)
  }
}