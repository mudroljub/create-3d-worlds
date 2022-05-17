import Zeppelin from './Zeppelin.js'

export default class Flamingo extends Zeppelin {
  constructor({ mesh, ...params }) {
    super({ mesh, minHeight: 10, ...params })
  }

  update() {
    super.update()
    if (this.action)
      if (this.isTouchingGround()) this.action.stop()
      else this.action.play()
  }
}
