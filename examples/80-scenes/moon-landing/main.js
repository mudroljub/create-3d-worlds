import { scene, camera, renderer, clock, setBackground } from '/utils/scene.js'
import { createMoon } from '/utils/light.js'
import { Stars } from '/utils/classes/Particles.js'
import Score from '/utils/ui/Score.js'
import Lander from './Lander.js'
import Platform from './Platform.js'

const score = new Score({ subtitle: 'Fuel' })

/* INIT */

const moon = createMoon()
moon.position.set(30, 0, 30)
scene.add(moon)
setBackground(0x000000)
camera.position.z = 18

const platform = new Platform()
scene.add(platform.mesh)

const lander = new Lander()
scene.add(lander.mesh)

const stars = new Stars()
scene.add(stars.mesh)

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  const dt = clock.getDelta()

  platform.move(dt)
  if (lander.hasLanded) {
    platform.sync(lander.mesh, dt)
    score.renderText(lander.failure ? 'Landing failure!' : 'Nice landing!')
  }
  lander.update(dt)
  lander.checkLanding(platform, dt)
  score.renderPoints(0, null, lander.fuel)

  renderer.render(scene, camera)
}()
