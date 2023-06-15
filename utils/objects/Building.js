import GameObject from '/utils/objects/GameObject.js'

export default class Building extends GameObject {
  constructor({ name = 'building', energy = 150, ...rest } = {}) {
    super({ name, energy, ...rest })
  }

  addFire() {
    const promise = import('/utils/Particles.js')
    promise.then(obj => {
      this.fire = new obj.Fire()
      this.add(this.fire.mesh)
      this.fire.mesh.position.y += this.height * .5
      // this.fire.mesh.position.z -= this.depth * .5
    })
  }

  checkHit() {
    super.checkHit()

    if (this.energy <= 0 && !this.fire) this.addFire()
  }

  update(delta) {
    super.update()
    this.fire?.update({ delta })
  }
}