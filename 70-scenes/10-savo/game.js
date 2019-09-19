import { createFloor } from '/utils/floor.js'
import { randomMatrix } from '/utils/maps.js'
import { scene, renderer, camera, clock } from '/utils/scene.js'
import Canvas from '/classes/2d/Canvas.js'
import Player from '/classes/Player.js'
import Tilemap2D from '/classes/2d/Tilemap2D.js'
import Tilemap3D from '/classes/Tilemap3D.js'

const canvas = new Canvas('transparent')
const matrix = randomMatrix()

const smallMap = new Tilemap2D(matrix, 20)
const map = new Tilemap3D(matrix, 100, {x: -500, z: -500})

scene.add(createFloor())
const walls = map.create3DMap(0.5)
scene.add(walls)

camera.position.y = 10
camera.position.z = 5

const player = new Player(0, 0, 0, 10, true)
scene.add(player.mesh)
player.add(camera)
player.addSolids(walls)

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  const delta = clock.getDelta()
  const time = clock.getElapsedTime()
  player.update(delta)
  canvas.clear()
  canvas.drawTarget('/assets/images/crosshair.png', time)
  canvas.drawWeapon('/assets/images/savo.png', time)
  canvas.drawMap(matrix, smallMap.cellSize)
  canvas.draw3DPlayerOnMap(player, map, smallMap)
  renderer.render(scene, camera)
}()
