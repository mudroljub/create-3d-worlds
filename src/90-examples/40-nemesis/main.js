import * as THREE from '/node_modules/three119/build/three.module.js'
import { FirstPersonControls } from '/node_modules/three119/examples/jsm/controls/FirstPersonControls.js'
import { nemesis as map } from '/data/maps.js'
import { UNITSIZE, getMapSector, drawRadar } from './utils.js'
// import { scene, camera, renderer, clock } from '/utils/scene.js'

const mapW = map.length
const mapH = map[0].length
const WIDTH = window.innerWidth
const HEIGHT = window.innerHeight
const WALLHEIGHT = UNITSIZE / 3
const MOVESPEED = 100
const LOOKSPEED = 0.1
const BULLETMOVESPEED = MOVESPEED * 5
const NUM_AI = 5
const PROJECTILEDAMAGE = 20

const ai = []
const mouse = { x: 0, y: 0 }

let runAnim = false
let kills = 0
let health = 100
let lastHealthPickup = 0
let intervalId

const clock = new THREE.Clock()
const scene = new THREE.Scene()
const textureLoader = new THREE.TextureLoader()

const camera = new THREE.PerspectiveCamera(60, WIDTH / HEIGHT, 1, 10000) // FOV, aspect, near, far
camera.position.y = UNITSIZE * .2
scene.add(camera)

const controls = new FirstPersonControls(camera, document)
controls.movementSpeed = MOVESPEED
controls.lookSpeed = LOOKSPEED
controls.lookVertical = false // Temporary solution; play on flat surfaces only
controls.noFly = true

const renderer = new THREE.WebGLRenderer()
renderer.setSize(WIDTH, HEIGHT)

renderer.domElement.style.backgroundColor = '#D6F1FF' // easier to see
document.body.appendChild(renderer.domElement)

const healthcube = new THREE.Mesh(
  new THREE.BoxGeometry(30, 30, 30),
  new THREE.MeshBasicMaterial({ map: textureLoader.load('images/health.png') })
)
healthcube.position.set(-UNITSIZE - 15, 35, -UNITSIZE - 15)
scene.add(healthcube)

const bullets = []
const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0x333333 })
const sphereGeo = new THREE.SphereGeometry(2, 6, 6)
const aiGeo = new THREE.BoxGeometry(40, 40, 40)

function distance(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1))
}

// Check whether a Vector3 is inside a wall
function checkWallCollision(v) {
  const c = getMapSector(v)
  return map[c.x][c.z] > 0
}

function getRandBetween(lo, hi) {
  return parseInt(Math.floor(Math.random() * (hi - lo + 1)) + lo, 10)
}

function addAI() {
  let x, z
  const c = getMapSector(camera.position)
  const aiMaterial = new THREE.MeshBasicMaterial({ /* color: 0xEE3333,*/map: textureLoader.load('images/face.png') })
  const o = new THREE.Mesh(aiGeo, aiMaterial)
  do {
    x = getRandBetween(0, mapW - 1)
    z = getRandBetween(0, mapH - 1)
  } while (map[x][z] > 0 || (x == c.x && z == c.z))
  x = Math.floor(x - mapW / 2) * UNITSIZE
  z = Math.floor(z - mapW / 2) * UNITSIZE
  o.position.set(x, UNITSIZE * 0.15, z)
  o.health = 100
  o.pathPos = 1
  o.lastRandomX = Math.random()
  o.lastRandomZ = Math.random()
  o.lastShot = Date.now() // Higher-fidelity timers aren'THREE a big deal here.
  ai.push(o)
  scene.add(o)
}

function createBullet(obj) {
  if (obj === undefined)
    obj = camera // eslint-disable-line

  const sphere = new THREE.Mesh(sphereGeo, sphereMaterial)
  sphere.position.set(obj.position.x, obj.position.y * 0.8, obj.position.z)
  let vector
  if (obj instanceof THREE.Camera) {
    vector = new THREE.Vector3(mouse.x, mouse.y, 1)
    vector.unproject(obj)
  } else
    vector = camera.position.clone()

  sphere.ray = new THREE.Ray(obj.position, vector.sub(obj.position).normalize())
  sphere.owner = obj
  bullets.push(sphere)
  scene.add(sphere)
  return sphere
}

function update(delta) {
  const speed = delta * BULLETMOVESPEED
  const aispeed = delta * MOVESPEED
  controls.update(delta) // Move camera

  healthcube.rotation.x += 0.004
  healthcube.rotation.y += 0.008
  // health once per minute
  if (Date.now() > lastHealthPickup + 60000) {
    if (distance(camera.position.x, camera.position.z, healthcube.position.x, healthcube.position.z) < 15 && health != 100) {
      health = Math.min(health + 50, 100)
      document.querySelector('#health').innerHTML = health
      lastHealthPickup = Date.now()
    }
    healthcube.material.wireframe = false
  } else
    healthcube.material.wireframe = true

  // Update bullets. Walk backwards through the list so we can remove items.
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i], p = b.position, d = b.ray.direction
    if (checkWallCollision(p)) {
      bullets.splice(i, 1)
      scene.remove(b)
      continue
    }
    // Collide with AI
    let hit = false
    for (let j = ai.length - 1; j >= 0; j--) {
      const a = ai[j]
      const v = a.geometry.vertices[0]
      const c = a.position
      const x = Math.abs(v.x), z = Math.abs(v.z)
      // console.log(Math.round(p.x), Math.round(p.z), c.x, c.z, x, z);
      if (p.x < c.x + x && p.x > c.x - x &&
					p.z < c.z + z && p.z > c.z - z &&
					b.owner != a) {
        bullets.splice(i, 1)
        scene.remove(b)
        a.health -= PROJECTILEDAMAGE
        const { color } = a.material, percent = a.health / 100
        a.material.color.setRGB(
          percent * color.r,
          percent * color.g,
          percent * color.b
        )
        hit = true
        break
      }
    }
    // Bullet hits player
    if (distance(p.x, p.z, camera.position.x, camera.position.z) < 25 && b.owner != camera) {
      // TODO: handle hurt
      health -= 10
      if (health < 0) health = 0
      const val = health < 25 ? '<span style="color: darkRed">' + health + '</span>' : health
      document.querySelector('#health').innerHTML = val
      bullets.splice(i, 1)
      scene.remove(b)
    }
    if (!hit) {
      b.translateX(speed * d.x)
      b.translateZ(speed * d.z)
    }
  }

  // Update AI.
  for (let i = ai.length - 1; i >= 0; i--) {
    const a = ai[i]
    if (a.health <= 0) {
      ai.splice(i, 1)
      scene.remove(a)
      kills++
      document.querySelector('#score').innerHTML = kills * 100
      addAI()
    }
    // Move AI
    const r = Math.random()
    if (r > 0.995) {
      a.lastRandomX = Math.random() * 2 - 1
      a.lastRandomZ = Math.random() * 2 - 1
    }
    a.translateX(aispeed * a.lastRandomX)
    a.translateZ(aispeed * a.lastRandomZ)
    const c = getMapSector(a.position)
    if (c.x < 0 || c.x >= mapW || c.y < 0 || c.y >= mapH || checkWallCollision(a.position)) {
      a.translateX(-2 * aispeed * a.lastRandomX)
      a.translateZ(-2 * aispeed * a.lastRandomZ)
      a.lastRandomX = Math.random() * 2 - 1
      a.lastRandomZ = Math.random() * 2 - 1
    }
    if (c.x < -1 || c.x > mapW || c.z < -1 || c.z > mapH) {
      ai.splice(i, 1)
      scene.remove(a)
      addAI()
    }
    const cc = getMapSector(camera.position)
    if (Date.now() > a.lastShot + 750 && distance(c.x, c.z, cc.x, cc.z) < 2) {
      createBullet(a)
      a.lastShot = Date.now()
    }
  }

  if (health <= 0) {
    runAnim = false
    clearInterval(intervalId)
    // TODO: handle death
  }
}

function setupScene() {
  const units = mapW
  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(units * UNITSIZE, 10, units * UNITSIZE),
    new THREE.MeshLambertMaterial({ color: 0xEDCBA0 })
  )
  scene.add(floor)

  const cube = new THREE.BoxGeometry(UNITSIZE, WALLHEIGHT, UNITSIZE)
  const materials = [
    new THREE.MeshLambertMaterial({ map: textureLoader.load('images/wall-1.jpg') }),
    new THREE.MeshLambertMaterial({ map: textureLoader.load('images/wall-2.jpg') }),
    new THREE.MeshLambertMaterial({ color: 0xFBEBCD }),
  ]
  for (let i = 0; i < mapW; i++)
    for (let j = 0, m = map[i].length; j < m; j++)
      if (map[i][j]) {
        const wall = new THREE.Mesh(cube, materials[map[i][j] - 1])
        wall.position.x = (i - units / 2) * UNITSIZE
        wall.position.y = WALLHEIGHT / 2
        wall.position.z = (j - units / 2) * UNITSIZE
        scene.add(wall)
      }

  const directionalLight1 = new THREE.DirectionalLight(0xF7EFBE, 0.7)
  directionalLight1.position.set(0.5, 1, 0.5)
  scene.add(directionalLight1)
  const directionalLight2 = new THREE.DirectionalLight(0xF7EFBE, 0.5)
  directionalLight2.position.set(-0.5, -1, -0.5)
  scene.add(directionalLight2)
}

function handleMouseMove(e) {
  e.preventDefault()
  mouse.x = (e.clientX / WIDTH) * 2 - 1
  mouse.y = - (e.clientY / HEIGHT) * 2 + 1
}

function setupAI() {
  for (let i = 0; i < NUM_AI; i++) addAI()
}

function init() {
  runAnim = true
  setupScene()
  setupAI()
  intervalId = setInterval(() => {
    drawRadar(ai, camera)
  }, 1000)
  animate()
}

/* LOOP */

function animate() {
  if (runAnim)
    requestAnimationFrame(animate)
  const delta = clock.getDelta()
  update(delta)
  renderer.render(scene, camera)
}

/* EVENTS */

document.addEventListener('mousemove', handleMouseMove, false)

document.addEventListener('click', e => {
  if (!runAnim) init()
  if (e.button === 0) createBullet() // left click
})
