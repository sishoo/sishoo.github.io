import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const LIGHT_DISTANCE_FACTOR = 0.7;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
const loader = new GLTFLoader();

const menuItems = document.querySelectorAll('.menu-item');
const contents = document.querySelectorAll('.content');

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
camera.position.z = 5;

const planets = ["mercury", "venus", "earth", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"];
const planetLights = [0, 0, 0, 0, 0, 0, 0, 0, 0];
const stars = [];

let ferris;
loader.load('./assets/ferris3d.gltf', (gltf) => {
    ferris = gltf.scene;
    ferris.position.set(3.5, -1, 1);
    ferris.scale.set(1.7, 1.7, 1.7);
    scene.add(ferris);
});
    

for (let i = 0; i < 9; i++) {
    (function (index) {
        loader.load(`./assets/${planets[index]}.gltf`, (gltf) => {
            let planet = gltf.scene;
            planet.position.y = -1;
            planet.scale.set(0.34, 0.34, 0.34);
            planets[index] = planet;
            scene.add(planet);

            const light = new THREE.PointLight(0xffffff, 5, 2);
            planetLights[index] = light;
            scene.add(light);
        });
    })(i);
}

// stars
for (let z = -1500; z < 500; z += 1) {
    let geometry = new THREE.SphereGeometry(0.5, 32, 32)
    let material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    let sphere = new THREE.Mesh(geometry, material)

    sphere.position.x = Math.random() * window.innerWidth - window.innerWidth / 2;
    sphere.position.y = Math.random() * window.innerHeight - window.innerHeight / 2;
    sphere.position.z = z;
    // sphere.scale.x = 2;
    // sphere.scale.y = 2;

    scene.add(sphere);
    stars.push(sphere);
}


const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(3, 3, 3);
scene.add(dirLight);
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

console.log(planets);
const orbitRadius = [2, 3.7, 5.2, 7, 9, 11, 13, 15, 16];
const orbitSpeed = [0.008, 0.005, 0.004, 0.003, 0.002, 0.0015, 0.001, 0.0008, 0.0006];
let midpoint = new THREE.Vector3();
let lightPosition = new THREE.Vector3();
function animate() {
    requestAnimationFrame(animate);
    ferris.rotation.y -= 0.001;
    for (let i = 0; i < 9; i++) {
        let planet = planets[i];
        let pos = planet.position;
        pos.x = ferris.position.x + orbitRadius[i] * Math.cos(planet.rotation.y);
        pos.z = ferris.position.z + orbitRadius[i] * Math.sin(planet.rotation.y);
        planet.rotation.y += orbitSpeed[i];

        midpoint.x = (ferris.position.x + pos.x) / 2;
        midpoint.y = (ferris.position.y + pos.y) / 2;
        midpoint.z = (ferris.position.z + pos.z) / 2;

        lightPosition.copy(midpoint).lerp(pos, LIGHT_DISTANCE_FACTOR);

        planetLights[i].position.copy(lightPosition);
    }


    renderer.render(scene, camera);
}

function onWindowResize() {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;

    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(newWidth, newHeight);
}


menuItems.forEach(item => {
    item.addEventListener("click", (event) => {
        const target = event.target.getAttribute('data-target');
        
        // Hide all contents
        contents.forEach(content => {
            content.style.display = 'none';
        });

        // Display the clicked content
        const selectedContent = document.getElementById(`${target}-content`);
        selectedContent.style.display = 'block';
    });
});

window.addEventListener('resize', onWindowResize);


animate();