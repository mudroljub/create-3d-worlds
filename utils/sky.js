import * as THREE from '/node_modules/three108/build/three.module.js'
import { Sky } from '/node_modules/three108/examples/jsm/objects/Sky.js'

import { degToRad } from '/utils/helpers.js'

export function createGradientSky({ r = 4000, topColor = 0x0077ff, bottomColor = 0xffffff } = {}) {
  const vertexShader = `
  varying vec3 vWorldPosition;
  
  void main() {
    vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
    vWorldPosition = worldPosition.xyz;
  
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  }`

  const fragmentShader = `
  uniform vec3 topColor;
  uniform vec3 bottomColor;
  uniform float offset;
  uniform float exponent;
  
  varying vec3 vWorldPosition;
  
  void main() {
    float h = normalize( vWorldPosition + offset ).y;
    gl_FragColor = vec4( mix( bottomColor, topColor, max( pow( max( h , 0.0), exponent ), 0.0 ) ), 1.0 );
  }`

  const uniforms = {
    'topColor': { value: new THREE.Color(topColor) },
    'bottomColor': { value: new THREE.Color(bottomColor) },
    'offset': { value: 33 },
    'exponent': { value: 0.6 }
  }
  const geometry = new THREE.SphereGeometry(r, 32, 15)
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    side: THREE.BackSide
  })
  return new THREE.Mesh(geometry, material)
}

export function createSunSky() {
  const sky = new Sky()
  sky.scale.setScalar(450000)

  const sun = new THREE.Vector3()
  const phi = degToRad(90 - 2)
  const theta = degToRad(180)
  sun.setFromSphericalCoords(1, phi, theta)
  const { uniforms } = sky.material
  uniforms.sunPosition.value.copy(sun)
  return sky
}
