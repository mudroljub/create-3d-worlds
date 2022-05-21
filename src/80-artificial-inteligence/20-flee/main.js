/* global THREE, SteeringEntity */
import { camera, scene, renderer, createOrbitControls } from '/utils/scene.js'

const controls = createOrbitControls()

const light = new THREE.AmbientLight(0xffffff)
scene.add(light)

let entity1, entity2
let boundaries

camera.position.set(0, 1000, 1000)
camera.lookAt(new THREE.Vector3(0, 0, 0))
// Floor
const floorGeometry = new THREE.PlaneGeometry(10000, 10000, 32)
const floorMaterial = new THREE.MeshBasicMaterial({ color: 0x666666, transparent: true, opacity: 0.5 })
const floor = new THREE.Mesh(floorGeometry, floorMaterial)
floor.rotation.x = -Math.PI * .5
scene.add(floor)

// Entity Mesh
const geometry = new THREE.BoxGeometry(100, 200, 50)
const material1 = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, wireframe: true })
const mesh1 = new THREE.Mesh(geometry, material1)
mesh1.position.setY(100)

const material2 = new THREE.MeshBasicMaterial({ color: 0xFF0000, wireframe: true })
const mesh2 = new THREE.Mesh(geometry, material2)
mesh2.position.setY(100)

// Entities
entity1 = new SteeringEntity(mesh1)
entity1.maxSpeed = 15
entity1.lookAtDirection = true
entity1.position.set(Math.random() * (5000 - (-5000)) + (-5000), 0, Math.random() * (5000 - (-5000)) + (-5000))
scene.add(entity1)

entity2 = new SteeringEntity(mesh2)
entity2.maxSpeed = 10
entity2.lookAtDirection = true
entity2.position.set(Math.random() * (5000 - (-5000)) + (-5000), 0, Math.random() * (5000 - (-5000)) + (-5000))
scene.add(entity2)

// Plane boundaries (do not cross)
boundaries = new THREE.Box3(new THREE.Vector3(-5000, 0, -5000), new THREE.Vector3(5000, 0, 5000))

animate()

function animate() {
  requestAnimationFrame(animate)
  controls.update()

  const distance = entity1.position.distanceTo(entity2.position)

  if (distance > 50) {

    entity1.flee(entity2.position)

    if (entity1.lookAtDirection)
      entity1.lookWhereGoing(true)
    else
      entity1.rotation.set(0, 0, 0)

    entity2.seek(entity1.position)

    if (entity2.lookAtDirection)
      entity2.lookWhereGoing(true)
    else
      entity2.rotation.set(0, 0, 0)
  } else {

    entity1.idle()
    if (entity1.lookAtDirection)
      entity1.lookAt(entity2.position)
    else
      entity1.rotation.set(0, 0, 0)

    entity2.idle()
    if (entity2.lookAtDirection)
      entity2.lookAt(entity1.position)
    else
      entity2.rotation.set(0, 0, 0)
  }

  entity1.update()
  entity2.update()

  entity1.bounce(boundaries)
  entity2.bounce(boundaries)

  renderer.render(scene, camera)
}

document.addEventListener('mousedown', onClick, true)

function onClick(event) {
  if (event.altKey) {
    const mouse3D = new THREE.Vector3((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1, 0)
    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(mouse3D, camera)
    const intersects = raycaster.intersectObjects(scene.children)
    if (intersects.length > 0)
      entity1.position.set(intersects[0].point.x, intersects[0].point.y, intersects[0].point.z)

  }
}