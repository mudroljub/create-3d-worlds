import * as THREE from '/node_modules/three119/build/three.module.js'
import { ImprovedNoise } from '/node_modules/three119/examples/jsm/math/ImprovedNoise.js'
import { DEGREE } from '/utils/constants.js'
import Physijs from '/libs/physi-ecma.js'
Physijs.scripts.worker = '/libs/physijs_worker.js'
Physijs.scripts.ammo = 'ammo.js' // relative to the worker

const textureLoader = new THREE.TextureLoader()

/* SCENE */

export const scene = new Physijs.Scene()
scene.setGravity(new THREE.Vector3(0, -10, 0))

// TODO: delete
export function createScene({ gravity = -10 } = {}) {
  const scene = new Physijs.Scene()
  scene.setGravity(new THREE.Vector3(0, gravity, 0))
  return scene
}

/* FLOOR */

export function createGround({ size = 150, color = 0x666666, friction = .8, bounciness = .4, file } = {}) {
  const material = new THREE.MeshPhongMaterial({ color })
  if (file) material.map = textureLoader.load(`/assets/textures/${file}`)
  const physiMaterial = Physijs.createMaterial(material, friction, bounciness)
  const mesh = new Physijs.BoxMesh(
    new THREE.PlaneGeometry(size, size), physiMaterial, 0, // mass
  )
  mesh.receiveShadow = true
  mesh.rotateX(- Math.PI / 2)
  return mesh
}

/* BOXES */

export function createBox({ size, width = 1, height = 1, depth = 1, friction = .5, bounciness = .6, color = 0xdddddd, file } = {}) {
  const geometry = new THREE.BoxGeometry(size || width, size || height, size || depth)
  const material = new THREE.MeshLambertMaterial({ color })
  if (file) material.map = textureLoader.load(`/assets/textures/${file}`)
  const physiMaterial = Physijs.createMaterial(material, friction, bounciness)
  const mesh = new Physijs.BoxMesh(geometry, physiMaterial)
  mesh.castShadow = true
  return mesh
}

export const createBlock = (
  { width = 6, height = 1, depth = 1.5, friction = .4, bounciness = .4, color = 0xff0000 } = {}
) => createBox({ width, height, depth, friction, bounciness, color })

export const createCrate = (
  { size = 1, file = 'crate.gif', friction = .6, bounciness = .4 } = {}
) => createBox({ width: size, height: size, depth: size, file, friction, bounciness })

/* BALL */

export function createBall({ r = .4, mass = 35, color = 0xffffff, widthSegments = 10, heightSegments = 10 } = {}) {
  const material = new THREE.MeshLambertMaterial({ color })
  const geometry = new THREE.SphereGeometry(r, widthSegments, heightSegments)
  const mesh = new Physijs.SphereMesh(geometry, material, mass)
  mesh.castShadow = true
  return mesh
}

/* STRUCTURES */

export function createBlockTower({ block_height = 1, block_offset = 2, rows = 16, color } = {}) {
  const blocks = []
  for (let i = 0; i < rows; i++)
    for (let j = 0; j < 3; j++) {
      const block = createBlock({ height: block_height, color })
      block.position.y = block_height / 2 + block_height * i
      if (i % 2 === 0) {
        block.rotation.y = Math.PI * .5
        block.position.x = block_offset * j - (block_offset * 3 / 2 - block_offset / 2)
      } else
        block.position.z = block_offset * j - (block_offset * 3 / 2 - block_offset / 2)
      blocks.push(block)
    }
  return blocks
}

export function createCrateWall({ crateSize = 1, rows = 7, columns = 10 } = {}) {
  const crates = []
  const halfColumns = Math.floor(columns / 2)
  for (let row = 1; row <= rows; ++row)
    for (let column = -halfColumns; column <= halfColumns; ++column) {
      const box = createCrate({ size: crateSize })
      box.position.set(column * crateSize, row * crateSize, 0)
      crates.push(box)
    }
  return crates
}

export function createDominos({ r = 27, numDominos = 100 } = {}) {
  const blocks = []
  let circleOffset = 0
  for (let i = 0, j = 0; j < numDominos; i += 6 + circleOffset, j++) {
    circleOffset = 4.5 * (i / 360)
    const height = 6
    const block = createBlock({ width: 1, height, depth: 2, color: j % 2 ? 0x000000 : 0xffffff })
    const x = (r / 1440) * (1440 - i) * Math.cos(i * DEGREE)
    const z = (r / 1440) * (1440 - i) * Math.sin(i * DEGREE)
    // the order matters here
    block.position.set(x, 0, z)
    block.lookAt(new THREE.Vector3(0, 0, 0)) // orientate towards the center
    block.position.y = height * .5
    blocks.push(block)
  }
  return blocks
}

/* TERRAIN */

export function createTerrain(
  { size = 200, friction = .3, bounciness = .8, color = 0x009900, rotationY = 0 } = {}
) {
  const perlin = new ImprovedNoise()
  const physiMaterial = Physijs.createMaterial(new THREE.MeshStandardMaterial({ color }), friction, bounciness)
  const geometry = new THREE.PlaneGeometry(size, size, 100, 100)
  geometry.vertices.forEach(vertex => {
    const value = perlin.noise(vertex.x / 12, vertex.y / 12, 0)
    vertex.z = value * 13
  })
  geometry.computeFaceNormals()
  geometry.computeVertexNormals()
  const ground = new Physijs.HeightfieldMesh(geometry, physiMaterial, 0, 100, 100)
  ground.rotation.x = -Math.PI * .5
  ground.rotation.y = rotationY
  return ground
}