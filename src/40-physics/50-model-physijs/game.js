import * as THREE from '/node_modules/three119/build/three.module.js'
import { LegacyJSONLoader } from '/libs/LegacyJSONLoader.js'
import Physijs from '/libs/physi-ecma.js'
import { renderer, camera } from '/utils/scene.js'
import { scene, createGround } from '/utils/physics.js'
import keyboard from '/classes/Keyboard.js'

const textureLoader = new THREE.TextureLoader()

const input = {
  power: null,
  direction: null,
  steering: 0
}
let vehicle

const light = new THREE.DirectionalLight(0xFFFFFF)
scene.add(light)

const ground = createGround({ size: 300, file: 'rocks.jpg' })
scene.add(ground)

const box_material = Physijs.createMaterial(
  new THREE.MeshLambertMaterial({ map: textureLoader.load('/assets/textures/wood_1024.png') }),
  .4, // low friction
  .6 // high restitution
)
box_material.map.wrapS = THREE.RepeatWrapping
box_material.map.repeat.set(.25, .25)

for (let i = 0; i < 50; i++) {
  const size = Math.random() * 2 + .5
  const box = new Physijs.BoxMesh(
    new THREE.CubeGeometry(size, size, size),
    box_material
  )
  box.castShadow = box.receiveShadow = true
  box.position.set(Math.random() * 25 - 50, 5, Math.random() * 25 - 50)
  scene.add(box)
}

const loader = new LegacyJSONLoader()

loader.load('models/mustang.js', (car, car_materials) => {
  loader.load('models/mustang_wheel.js', (wheel, wheel_materials) => {
    const mesh = new Physijs.BoxMesh(car, car_materials)
    mesh.position.y = 2
    mesh.castShadow = mesh.receiveShadow = true

    vehicle = new Physijs.Vehicle(mesh, new Physijs.VehicleTuning(
      10.88, 1.83, 0.28, 500, 10.5, 6000
    ))
    scene.add(vehicle)

    const wheel_material = new THREE.MeshFaceMaterial(wheel_materials)

    for (let i = 0; i < 4; i++) vehicle.addWheel(
      wheel, wheel_material, new THREE.Vector3(
        i % 2 === 0 ? -1.6 : 1.6, -1, i < 2 ? 3.3 : -3.2
      ),
      new THREE.Vector3(0, -1, 0), new THREE.Vector3(-1, 0, 0), 0.5, 0.7, i < 2 ? false : true)
  })
})

scene.simulate()

function handleInput() {
  input.direction = keyboard.left ? 1 : keyboard.right ? -1 : 0
  input.power = keyboard.up ? true : keyboard.down ? true : null
}

/* LOOP */

void function render() {
  requestAnimationFrame(render)
  if (!vehicle) return
  handleInput()
  camera.position.copy(vehicle.mesh.position).add(new THREE.Vector3(40, 25, 40))
  camera.lookAt(vehicle.mesh.position)
  light.target.position.copy(vehicle.mesh.position)
  light.position.addVectors(light.target.position, new THREE.Vector3(20, 20, -15))
  renderer.render(scene, camera)
}()

scene.addEventListener('update', () => {
  if (!vehicle) return
  if (input.direction !== null) {
    input.steering += input.direction / 50
    if (input.steering < -.6) input.steering = -.6
    if (input.steering > .6) input.steering = .6
  }
  vehicle.setSteering(input.steering, 0)
  vehicle.setSteering(input.steering, 1)

  if (input.power === true)
    vehicle.applyEngineForce(300)
  else if (input.power === false) {
    vehicle.setBrake(20, 2)
    vehicle.setBrake(20, 3)
  } else
    vehicle.applyEngineForce(0)

  scene.simulate(undefined, 2)
})
