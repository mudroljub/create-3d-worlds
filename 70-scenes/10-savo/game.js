import { createFloor } from '/utils/floor.js'
import { randomMatrix } from '/utils/maps.js'
import { scene, renderer, camera, clock } from '/utils/scene.js'
import Canvas from '/classes/2d/Canvas.js'
import SmallMapRenderer from '/classes/2d/SmallMapRenderer.js'
import Player from '/classes/Player.js'
import Tilemap from '/classes/Tilemap.js'

camera.position.y = 10
camera.position.z = 5
const canvas = new Canvas('transparent')
const mapRenderer = new SmallMapRenderer('transparent')

const matrix = randomMatrix()
const origin = { x: -500, z: -500 }
const smallMap = new Tilemap(matrix, 20)
const map = new Tilemap(matrix, 100, origin)

scene.add(createFloor())
const walls = map.create3DMap(0.5)
scene.add(walls)

const {x, z} = map.randomEmptyPos
const player = new Player(x, 0, z, 10, true)
player.add(camera)
player.addSolids(walls)
scene.add(player.mesh)

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  const delta = clock.getDelta()
  const time = clock.getElapsedTime()
  player.update(delta)

  canvas.clear()
  canvas.drawWeapon('/assets/images/savo.png', time)
  canvas.drawTarget('/assets/images/crosshair.png', time)

  mapRenderer.drawMap(matrix, smallMap.cellSize)
  mapRenderer.draw3DPlayerOnMap(player, map, smallMap)

  renderer.render(scene, camera)
}()
