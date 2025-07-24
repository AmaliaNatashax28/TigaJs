import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js'
import Stats from 'three/addons/libs/stats.module.js'
import { GUI } from 'three/addons/libs/lil-gui.module.min.js'


// #region BASIC SET UP
const scene = new THREE.Scene()

const hdr = 'https://sbcode.net/img/rustig_koppie_puresky_1k.hdr'

let sceneTexture: THREE.DataTexture
new RGBELoader().load(hdr, (texture) => {
    sceneTexture = texture
    sceneTexture.mapping = THREE.EquirectangularReflectionMapping
    scene.environment = sceneTexture
    scene.background = sceneTexture
    scene.environmentIntensity = 1
})

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.z = 6

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight
    renderer.setSize(window.innerWidth, window.innerHeight)
    camera.updateProjectionMatrix()
})

const control = new OrbitControls(camera, renderer.domElement)
control.enableDamping = true

const stats = new Stats()
document.body.appendChild(stats.dom)

const material = new THREE.MeshPhysicalMaterial()
material.side = THREE.DoubleSide
new GLTFLoader().load('/japan.glb', (item) => {
    item.scene.traverse((children) => {
        (children as THREE.Mesh).material = material
    })
    scene.add(item.scene)
})
const texture = new THREE.TextureLoader().load('https://sbcode.net/img/grid.png')


// #region gui
const controlData = {
    environment: true,
    background: true,
    enableMap: false
}
const gui = new GUI()
const controlFolder = gui.addFolder("Controls")

// #region controls folder
controlFolder.add(controlData, "background").onChange(() => {
    scene.background = controlData.background ? sceneTexture : null
})
controlFolder.add(controlData, "environment").onChange(() => {
    scene.environment = controlData.environment ? sceneTexture : null
})
controlFolder.add(scene, "environmentIntensity", 0, 2)
controlFolder.add(renderer, "toneMappingExposure", 0, 2, 0.01)
controlFolder.add(scene, "backgroundBlurriness", 0, 10)
controlFolder.add(controlData, "enableMap").onChange(() => {
    material.map = texture
})
// #endregion

// #endregion

function animate() {
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
    stats.update()
}

animate()

