import * as THREE from 'three'
//import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
//import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls.js'
import { MapControls } from 'three/examples/jsm/controls/MapControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import GUI from 'lil-gui'

// Debug
//const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Models
const dracoLoader = new DRACOLoader()  //handle DRACO compression
dracoLoader.setDecoderPath('/bigmonkey/draco/')

const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

const models = {
    t90: null,
    tank: null,
    chicken: null,
    ground: null   
}

const modelTransforms = {
    ground: { 
        position: { x: 0, y: 0, z: 0 },  
        rotation: { x: 0, y: 0, z: 0 },
        scale: 1
    },
    t90: { 
        position: { x: -3, y: 0.15, z: 0.75 },  
        rotation: { x: 0, y: 2.4, z: 0 },
        scale: 1.5
    },
    tank: { 
        position: { x: 6, y: 0.2, z: 5 },  
        rotation: { x: 0, y: 4.5, z: 0 },
        scale: 0.055
    },
    chicken: {
        position: { x: 3, y: 0.5, z: -6 },  
        rotation: { x: 0, y: 3.5, z: 0 },
        scale: 5
    }
}

// Add models
function addModel(name, path) {
    if (!models[name]) {
        gltfLoader.load(path, (gltf) => {
            let model = gltf.scene

            model.position.set(
                modelTransforms[name].position.x,
                modelTransforms[name].position.y,
                modelTransforms[name].position.z
            )
            model.rotation.set(
                modelTransforms[name].rotation.x,
                modelTransforms[name].rotation.y,
                modelTransforms[name].rotation.z
            )
            model.scale.set(
                modelTransforms[name].scale,    // x
                modelTransforms[name].scale,    // y
                modelTransforms[name].scale     // z
            )

            //model.castShadow = true
            //model.receiveShadow = true
            models[name] = model
            scene.add(model)
        })
    }
}

// Remove model
function removeModel(name) {
    if (models[name]) {
        console.log(`Removing ${name} from scene...`)
        // Hide model before removal
        models[name].visible = false

        scene.remove(models[name]) // Remove from scene

        // Dispose of geometry and materials
        models[name].traverse((child) => {
            if (child.isMesh) {
                child.geometry.dispose()
                if (child.material.isMaterial) {
                    disposeMaterial(child.material)
                } else {
                    // If material is an array (multi-material)
                    child.material.forEach((material) => disposeMaterial(material))
                }
            }
        })

        models[name] = null // Clear reference
        console.log(`${name} model removed`)
    }
}

// Helper function to dispose of materials
function disposeMaterial(material) {
    if (material.map) material.map.dispose()
    if (material.lightMap) material.lightMap.dispose()
    if (material.bumpMap) material.bumpMap.dispose()
    if (material.normalMap) material.normalMap.dispose()
    if (material.specularMap) material.specularMap.dispose()
    if (material.envMap) material.envMap.dispose()
    material.dispose()
}

// function removeModel(name) {
//     console.log('model name', name)
//     if (models[name]) {
//         scene.remove(models[name])
//         console.log('scene.remove(models[',name,'])')
//         models[name] = null 
//     }
// }

// Starting models
//addModel('ground', '/bigmonkey/models/ground/ground.glb')
addModel('ground', '/bigmonkey/models/groundc/groundcompressed.gltf')
addModel('t90', '/bigmonkey/models/t90/scene.gltf')
//addModel('chicken', '/bigmonkey/models/chicken2/chicken2.gltf')
//addModel('tank', '/bigmonkey/models/tank/tank.gltf')



// Floor
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 50),
    new THREE.MeshStandardMaterial({
        color: '#444444',
        metalness: 0,
        roughness: 0.5,

    })
)
floor.receiveShadow = true
floor.rotation.x = - Math.PI * 0.5
scene.add(floor)

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 2.4)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 50
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(5, 5, 5)
scene.add(directionalLight)

// Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

// Event Listeners
window.addEventListener('resize', () =>
{
    // Update sizes if window dimensions are changed
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

let chicken = true
let tank = true
const timeBar = document.getElementById("timeBar")
timeBar.addEventListener('input', () => {
    let sliderTime = parseInt(timeBar.value, 10)
    //console.log(timeBar.value)

    // Chicken between 0900 and 1100 ONLY
    if (sliderTime >= 900 && sliderTime < 1100) {
        //if (!models.chicken) {
        if (chicken == true) {
            chicken = false
            console.log('add chicken and hidden =', chicken)
            addModel('chicken', '/bigmonkey/models/chicken2/chicken2.gltf')
        }
    } else {
        if(models.chicken){
            removeModel('chicken') // Ensure it's removed after 1100
            console.log('removing chicken')
            chicken = true
        }
    }

    // Tank time between 1200 and 1600
    if (sliderTime >= 1200 && sliderTime < 1600) {
        //if (!models.tank) {
        if (tank == true) {
            tank = false
            console.log('tank =', tank)
            addModel('tank', '/bigmonkey/models/tank/tank.gltf')
        }
    } else {
        if(models.tank){
            removeModel('tank') // Ensure it's removed after 1600
            console.log('removing tank')
            tank = true
        }
    }

})


// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
// camera.position.set(- 8, 40, 80)
camera.position.set(0, 10, 18)
scene.add(camera)


// Controls
// Orbit Controls
// const controls = new OrbitControls(camera, canvas)
// controls.target.set(0, 1, 0)
// controls.enableDamping = true

// First Person Controls
// const controls = new FirstPersonControls(camera, canvas)
// controls.enabled = true
// controls.activeLook = true
// controls.lookVerticle = true
// controls.constraintVertical = true
// controls.verticalMin = Math.PI / 1.7
// controls.verticalMax = Math.PI / 2.3

// Map Controls
const controls = new MapControls(camera, canvas)
controls.enableDamping = true


// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


// Animate
// const clock = new THREE.Clock()
// let previousTime = 0

const tick = () =>
{
    // const elapsedTime = clock.getElapsedTime()
    // const deltaTime = elapsedTime - previousTime
    // previousTime = elapsedTime

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()