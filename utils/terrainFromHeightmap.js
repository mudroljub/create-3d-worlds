// https://github.com/josdirksen/threejs-cookbook/blob/master/02-geometries-meshes/02.06-create-terrain-from-heightmap.html
import chroma from '../libs/chroma.js'
import {getHighPoint} from './helpers.js'

const paint = chroma
  .scale(['brown', '#636f3f', '#7a8a46', '#473922', '#967848', '#dbc496', 'white'])
  .domain([0, 100])

export default function(src, callback, heightOffset = 2, scale = 3) {
  const img = new Image()
  img.src = src
  img.onload = function() {
    const depth = img.height
    const {width} = img

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = depth
    const ctx = canvas.getContext('2d')

    ctx.drawImage(img, 0, 0)
    const geometry = new THREE.Geometry()
    const pixel = ctx.getImageData(0, 0, width, depth)

    const step = 4 // indeces are r,g,b,a
    for (let x = 0; x < depth; x++)
      for (let z = 0; z < width; z++) {
        const i = z * step + (depth * x * step)
        const yValue = pixel.data[i] / heightOffset
        const vertex = new THREE.Vector3(x * scale, yValue, z * scale)
        geometry.vertices.push(vertex)
      }

    // create a rectangle (two triangles) between four vertices
    for (let z = 0; z < depth - 1; z++)
      for (let x = 0; x < width - 1; x++) {
        // a - - b
        // |  /  |
        // c - - d
        const a = x + z * width
        const b = (x + 1) + (z * width)
        const c = x + ((z + 1) * width)
        const d = (x + 1) + ((z + 1) * width)

        const face1 = new THREE.Face3(a, b, d)
        const face2 = new THREE.Face3(d, c, a)
        face1.color = new THREE.Color(paint(getHighPoint(geometry, face1)).hex())
        face2.color = new THREE.Color(paint(getHighPoint(geometry, face2)).hex())
        geometry.faces.push(face1)
        geometry.faces.push(face2)
      }

    geometry.computeVertexNormals(true)
    // geometry.computeFaceNormals()
    geometry.computeBoundingBox()
    const {max} = geometry.boundingBox

    const mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({
      vertexColors: THREE.FaceColors,
    }))
    mesh.translateX(-max.x / 2)
    mesh.translateZ(-max.z / 2)
    callback(mesh)
  }
}
