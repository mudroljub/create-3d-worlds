import Player from '/utils/actor/Player.js'
import AI from '/utils/actor/AI.js'
import { loadModel } from '/utils/loaders.js'
import { Flame } from '/utils/classes/Particles.js'

const animDict = {
  idle: 'Machine Gun Idle',
  walk: 'Machine Gun Walk',
  run: 'Rifle Run',
  attack: 'Crouch Rapid Fire',
  attack2: 'Machine Gun Idle',
  pain: 'Hit Reaction',
  death: 'Crouch Death',
}

/* LOADING */

const { mesh, animations } = await loadModel({ file: 'german-machine-gunner.fbx', animDict, prefix: 'character/soldier/', angle: Math.PI, fixColors: true })

const { mesh: twoHandedWeapon } = await loadModel({ file: 'weapon/flame-gun/model.fbx', scale: .75 })

/* EXTENDED CLASSES */

const sharedProps = { mesh, animations, animDict, twoHandedWeapon, speed: 1.8, attackStyle: 'LOOP', attackDistance: 7, attackSound: 'fire-swoosh.mp3' }

const adjustFlamePos = self => {
  const { particles, mesh } = self
  particles.mesh.position.copy(mesh.position)
  particles.mesh.rotation.copy(mesh.rotation)
  particles.mesh.rotateX(Math.PI)
  particles.mesh.translateY(-1.2)
  particles.mesh.translateZ(1.75)
}

const constructor = self => {
  const particles = new Flame()
  particles.mesh.material.opacity = 0
  self.particles = particles
}

const enterAttack = self => {
  self.scene.add(self.particles.mesh)
  self.particles.reset({ randomize: false })
  adjustFlamePos(self)
  self.shouldLoop = true
}

const exitAttack = self => {
  self.shouldLoop = false
}

const update = (self, delta) => {
  self.particles.update({ delta, max: self.attackDistance, loop: self.shouldLoop })
}

export class GermanFlameThrowerPlayer extends Player {
  constructor(props = {}) {
    super({ ...sharedProps, ...props })
    constructor(this)
  }

  enterAttack() {
    super.enterAttack()
    enterAttack(this)
  }

  exitAttack() {
    exitAttack(this)
  }

  update(delta) {
    super.update(delta)
    update(this, delta)
    if (this.state.includes('attack')) adjustFlamePos(this)
  }
}

export class GermanFlameThrowerAI extends AI {
  constructor(props = {}) {
    super({ ...sharedProps, ...props })
    constructor(this)
  }

  enterAttack() {
    super.enterAttack()
    enterAttack(this)
  }

  exitAttack() {
    exitAttack(this)
  }

  update(delta) {
    super.update(delta)
    update(this, delta)
    if (this.state.includes('attack')) adjustFlamePos(this)
  }
}