import * as THREE from 'three'
import { camera, scene, renderer, clock } from '/utils/scene.js'
import { createWorldSphere } from '/utils/geometry.js'
import { createSimpleFir } from '/utils/geometry/trees.js'
import { hemLight } from '/utils/light.js'
import Particles from '/utils/classes/Particles.js'
import Score from '/utils/io/Score.js'
import PlayerBall from './PlayerBall.js'

const { randFloat, randInt } = THREE.MathUtils
const { random } = Math

const worldSpeed = 0.007
const worldRadius = 26
const treeInterval = 0.5
const treesInPool = 10

const treesPool = []
const laneTrees = []

/* LIGHT & CAMERA */

hemLight({ skyColor: 0xfffafa, groundColor: 0x000000, intensity: .9 })

scene.fog = new THREE.FogExp2(0xf0fff0, 0.1)

camera.position.set(0, 3, 6.5)
clock.start()

/* INIT */

const player = new PlayerBall({ worldSpeed, worldRadius })
scene.add(player.mesh)

const earth = createWorldSphere({ r: worldRadius })
earth.position.set(0, -24, 2)
scene.add(earth)

const explosion = new Particles({ num: 50, size: 0.07, unitAngle: 0.1 })
scene.add(explosion.mesh)

for (let i = 0; i < treesInPool; i++)
  treesPool.push(createSimpleFir({ size: 1 }))

const score = new Score()

/* FUNCTIONS */

function addLaneTree(lane) {
  if (treesPool.length == 0) return
  const pathAngleValues = [1.52, 1.57, 1.62]
  const spherical = new THREE.Spherical()
  const tree = treesPool.pop()
  tree.visible = true
  laneTrees.push(tree)
  spherical.set(worldRadius - 0.3, pathAngleValues[lane], -earth.rotation.x + 4)
  addTree(tree, spherical)
}

function addTree(tree, spherical) {
  tree.position.setFromSpherical(spherical)
  const worldVector = earth.position.clone().normalize()
  const treeVector = tree.position.clone().normalize()
  tree.quaternion.setFromUnitVectors(treeVector, worldVector)
  tree.rotation.x += randFloat(-Math.PI / 10, Math.PI / 10)
  earth.add(tree)
}

function addTreeOrTwo() {
  const available = [0, 1, 2]
  const lane = randInt(0, 2)
  addLaneTree(lane)
  available.splice(lane, 1)
  if (random() > 0.5) {
    const anotherLane = randInt(0, 1)
    addLaneTree(available[anotherLane])
  }
}

const hit = tree => {
  explosion.reset({ pos: { x: player.mesh.position.x, y: 2, z: 4.8 }, unitAngle: 0.2 })
  score.update(1)
  tree.visible = false
  setTimeout(() => {
    tree.visible = true
  }, 100)
}

function updateTrees() {
  const treePos = new THREE.Vector3()
  const distantTrees = []
  laneTrees.forEach(tree => {
    if (!tree.visible) return
    treePos.setFromMatrixPosition(tree.matrixWorld)
    if (treePos.z > 6) // gone out of view
      distantTrees.push(tree)
    else if (treePos.distanceTo(player.mesh.position) <= 0.6)
      hit(tree)
  })
  distantTrees.forEach(tree => {
    laneTrees.splice(laneTrees.indexOf(tree), 1)
    treesPool.push(tree)
    tree.visible = false
  })
}

/* LOOP */

void function update() {
  requestAnimationFrame(update)
  const delta = clock.getDelta()

  earth.rotation.x += worldSpeed
  player.update(delta)

  if (clock.getElapsedTime() > treeInterval) {
    clock.start()
    addTreeOrTwo()
  }

  updateTrees()
  explosion.expand()
  renderer.render(scene, camera)
}()
