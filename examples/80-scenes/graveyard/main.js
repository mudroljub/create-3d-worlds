import { camera, scene, renderer, createOrbitControls, setBackground, clock } from '/utils/scene.js'
import { createGround } from '/utils/ground.js'
import { createMoon } from '/utils/light.js'
import { getAllCoords, sample } from '/utils/helpers.js'
import { createTombstone } from '/utils/geometry/shapes.js'
import { GhostAI } from '/utils/actor/horror/Ghost.js'
import { ResistanceFighterPlayer } from '/utils/actor/ww2/ResistanceFighter.js'

const mapSize = 100
const npcs = []
let last = Date.now()

setBackground(0x070b34)

createOrbitControls()
camera.position.set(15, 5, 30)
camera.lookAt(scene.position)

scene.add(createMoon({ intensity: .5, position: [15, 30, -30] }))
scene.add(createGround({ size: mapSize }))

const solids = []
const coords = getAllCoords({ mapSize, fieldSize: 1 })

for (let i = 0; i < 60; i++) {
  const { x, z } = coords.pop()
  const tombstone = createTombstone({ x, z })
  solids.push(tombstone)
}

for (let i = 0; i < 30; i++) {
  const npc = new GhostAI({ coords, mapSize })
  npcs.push(npc)
  scene.add(npc.mesh)
}

const player = new ResistanceFighterPlayer({ camera, solids })
player.cameraFollow.distance = 1.5
scene.add(player.mesh)
scene.add(...solids)

/* FUNCTIONS */

const zombies = ['GothGirl', 'ZombieBarefoot', 'ZombieCop', 'ZombieDoctor', 'ZombieGuard']

function spawnEvery(interval) {
  if (Date.now() - last >= interval) {
    const name = sample(zombies)

    import(`/utils/actor/horror/${name}.js`)
      .then(obj => {
        const ZombieClass = obj[name + 'AI']
        const zombie = new ZombieClass({ target: player.mesh })
        zombie.position = sample(coords)
        npcs.push(zombie)
        player.addSolids(zombie.mesh)
        scene.add(zombie.mesh)
      })

    last = Date.now()
  }
}

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  const delta = clock.getDelta()
  player.update(delta)
  npcs.forEach(npc => npc.update(delta))

  spawnEvery(10000)

  renderer.render(scene, camera)
}()