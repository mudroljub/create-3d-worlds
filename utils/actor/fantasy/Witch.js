import Player from '/utils/actor/Player.js'
import AI from '/utils/actor/AI.js'
import { loadModel } from '/utils/loaders.js'
import { Flame } from '/utils/classes/Particles.js'
import { getScene } from '/utils/helpers.js'

const animDict = {
  idle: 'Crouch Idle',
  walk: 'Crouched Walking',
  run: 'Run',
  attack: 'Standing 2H Magic Attack 01',
  attack2: 'Spell Casting',
  special: 'Zombie Scream',
}

/* LOADING */

const { mesh, animations } = await loadModel({ file: 'model.fbx', angle: Math.PI, animDict, prefix: 'character/witch/', fixColors: true, size: 1.7 })

/* EXTENDED CLASSES */

const sharedProps = { mesh, animations, animDict, attackStyle: 'ONCE', attackDistance: 3 }

const createParticles = () => {
  const particles = new Flame({ num: 25, minRadius: 0, maxRadius: .5 }) // or RedFlame
  particles.mesh.material.opacity = 0
  return particles
}

const adjustFlamePos = self => {
  const { particles, mesh } = self
  particles.mesh.rotation.copy(mesh.rotation)
  particles.mesh.rotateX(Math.PI)
  particles.mesh.translateY(-1.2)
  particles.mesh.translateZ(1.75)
}

const enterAttack = self => {
  getScene(self.mesh).add(self.particles.mesh)
  setTimeout(() => {
    self.particles.reset({ pos: self.position })
    adjustFlamePos(self)
    self.shouldLoop = true
  }, 1000)
}

const endAttack = self => {
  self.shouldLoop = false
}

const update = (self, delta) => {
  self.particles.update({ delta, max: self.attackDistance, loop: self.shouldLoop, minVelocity: 2.5, maxVelocity: 5 })
}

export class WitchPlayer extends Player {
  constructor(props = {}) {
    super({ ...sharedProps, ...props })
    this.particles = createParticles()
  }

  enterAttack() {
    super.enterAttack()
    enterAttack(this)
  }

  endAttack() {
    endAttack(this)
  }

  update(delta) {
    super.update(delta)
    update(this, delta)
  }
}

export class WitchAI extends AI {
  constructor(props = {}) {
    super({ ...sharedProps, ...props })
  }
}
