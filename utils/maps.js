import * as THREE from '/node_modules/three119/build/three.module.js'
import { createBox } from '/utils/boxes.js'

export function randomMatrix(size = 10, wallPercent = .3) {
  const matrix = []
  for (let y = 0; y < size; y++) {
    matrix[y] = []
    for (let x = 0; x < size; x++)
      matrix[y][x] = Math.random() < wallPercent ? 1 : 0
  }
  return matrix
}

export function create3DMap({ matrix = randomMatrix(), size = 1, yModifier } = {}) {
  const mapWidth = matrix.length
  const group = new THREE.Group()
  const textures = ['concrete.jpg', 'crate.gif', 'brick.png']
  matrix.forEach((row, rowIndex) => row.forEach((val, columnIndex) => {
    if (!val) return
    const x = (rowIndex - mapWidth / 2) * size
    const y = size / 2
    const z = (columnIndex - mapWidth / 2) * size
    const box = createBox({ size, file: textures[val - 1], yModifier })
    box.position.set(x, y, z)
    group.add(box)
  }))
  return group
}

// TODO: merge or deprecate
export function create3DMapOrigin({ matrix = randomMatrix(), size = 1, yModifier, origin = { x: 0, z: 0 } } = {}) {
  const textures = ['concrete.jpg', 'crate.gif', 'brick.png']
  const group = new THREE.Group()
  matrix.forEach((row, rowIndex) => row.forEach((val, columnIndex) => {
    if (!val) return
    const x = (columnIndex * size) + origin.x
    const z = (rowIndex * size) + origin.z
    group.add(createBox({ x, z, size, file: textures[val - 1], yModifier }))
  }))
  return group
}

export function randomField(matrix) {
  const y = Math.floor(Math.random() * matrix.length)
  const x = Math.floor(Math.random() * matrix[0].length)
  return [x, y]
}
