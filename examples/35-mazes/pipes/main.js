import PolarMaze from '/utils/mazes/PolarMaze.js'
import { recursiveBacktracker } from '/utils/mazes/algorithms.js'
import { scene, renderer, camera } from '/utils/scene.js'
import { createSun, hemLight } from '/utils/light.js'
import { createGround } from '/utils/ground.js'
import Avatar from '/utils/actor/Avatar.js'

hemLight({ intensity: .6 })
const sun = createSun()
scene.add(sun)

scene.add(createGround())

const maze = new PolarMaze(10, recursiveBacktracker, 10)
const pipes = maze.toPipes()
scene.add(pipes)

const player = new Avatar({ camera, solids: pipes })
player.chaseCamera.distance = 4.5
player.chaseCamera.zoomIn()
scene.add(player.mesh)

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  player.update()
  renderer.render(scene, camera)
}()
