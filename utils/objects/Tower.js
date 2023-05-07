import * as THREE from 'three'
import GameObject from '/utils/objects/GameObject.js'
import { loadModel } from '/utils/loaders.js'

const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0x333333 })
const sphereGeo = new THREE.SphereGeometry(.5)
const sphere = new THREE.Mesh(sphereGeo, sphereMaterial)

class Bullet extends GameObject {
  constructor(params = {}) {
    super({ mesh: sphere, ...params })
    this.speed = 10
  }

  update(delta) {
    if (!this.target) this.target = this.player.position.clone()

    this.position.lerp(this.target, this.speed * delta)

    if (this.position.distanceTo(this.target) < 1) this.dispose()
  }
}

const mesh = await loadModel({
  file: 'building/tower/ww2/D85VT1X9UHDSYASVUM1UY02HA.obj',
  mtl: 'building/tower/ww2/D85VT1X9UHDSYASVUM1UY02HA.mtl',
  size: 20,
  shouldAdjustHeight: true
})

export default class Tower extends GameObject {
  constructor(params = {}) {
    super({ mesh, ...params })
    this.range = 200
    this.bullets = []
    this.last = Date.now()
    this.interval = 500
  }

  addBullet() {
    const pos = this.position.clone()
    pos.y += this.height
    const bullet = new Bullet({ pos })
    this.scene.add(bullet.mesh)
    this.bullets.push(bullet)
  }

  removeBullet(bullet) {
    this.bullets.splice(this.bullets.indexOf(bullet), 1)
  }

  update(delta) {
    if (this.distanceTo(this.player) < this.range && Date.now() - this.last >= this.interval) {
      this.addBullet()
      this.last = Date.now()
    }

    this.bullets.forEach(bullet => {
      if (!bullet.mesh) this.removeBullet(bullet)
      bullet.update(delta)
    })
  }
}