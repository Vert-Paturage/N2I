import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";


// Scène et caméra
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 2, 10); 
camera.lookAt(0, 0, 0);

const initialCameraPosition = camera.position.clone();
const initialCameraLookAt = new THREE.Vector3(0, 0, 0);


// Rendu
const renderer = new THREE.WebGLRenderer();
renderer.setClearColor(0xDEDBDB, 1);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

let model;
const gltfLoader = new GLTFLoader();
gltfLoader.load(
  "./3D_models/cj_akiyama.glb", 
  (gltf) => {
    model = gltf.scene;

    // Centrer le modèle
    const box = new THREE.Box3().setFromObject(model);
    const center = new THREE.Vector3();
    box.getCenter(center);
    model.position.sub(center);
    model.scale.set(5,5,5);  

    model.rotateY(Math.PI);

    scene.add(model);
  },
  (progress) => {
    console.log(`Progression du chargement : ${(progress.loaded / progress.total) * 100}%`);
  },
  (error) => {
    console.error("Erreur lors du chargement du fichier GLB :", error);
  }
);


// Ajouter un point (une petite sphère) sur le modèle
const pointGeometry = new THREE.SphereGeometry(0.5, 32, 32); // Petite sphère
const pointMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

const coeur_point = new THREE.Mesh(pointGeometry, pointMaterial);
coeur_point.position.set(0.5, 1.5, 0); // Position relative au modèle
scene.add(coeur_point);

const foie_point = new THREE.Mesh(pointGeometry, pointMaterial);
foie_point.position.set(-0.3, 0, 0.4); // Position relative au modèle
scene.add(foie_point);

const intestin_point = new THREE.Mesh(pointGeometry, pointMaterial);
intestin_point.position.set(0.3, 0, 0.4); // Position relative au modèle
scene.add(intestin_point);

const poumon_point = new THREE.Mesh(pointGeometry, pointMaterial);
poumon_point.position.set(-0.5, 1.5, 0); // Position relative au modèle
scene.add(poumon_point);

const tibia_point = new THREE.Mesh(pointGeometry, pointMaterial);
tibia_point.position.set(-0.5, -4, 0); // Position relative au modèle
scene.add(tibia_point);

const system_nerveux_point = new THREE.Mesh(pointGeometry, pointMaterial);
system_nerveux_point.position.set(0, 3, 0); // Position relative au modèle
scene.add(system_nerveux_point);


// Composer pour post-processing
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

// Shader pour effet VHS
const vhsShader = {
  uniforms: {
    tDiffuse: { value: null },
    time: { value: 0.0 },
    resolution: {
      value: new THREE.Vector2(window.innerWidth, window.innerHeight),
    },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float time;
    uniform vec2 resolution;

    varying vec2 vUv;

    // Fonction pour bruit
    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    void main() {
      vec2 uv = vUv;

      // Bruit pour effet VHS
      float noise = random(uv + time) * 0.1;
      vec3 color = texture2D(tDiffuse, uv).rgb + noise;

      // Scanlines VHS animées
      float scanline = sin((uv.y + time * 0.0125) * resolution.y * 50.0) * 0.05;
      color -= vec3(scanline);

      // Distorsion de l'image pour un effet VHS
      float distorsion = sin(uv.y * resolution.y * 0.5 + time) * 0.02;
      uv.x += distorsion;

      // Appliquer l'effet
      gl_FragColor = vec4(color, 1.0);
    }
  `,
};

// const shaderPass = new ShaderPass(vhsShader);
// composer.addPass(shaderPass);

function animate(time) {

//   if (model) {
//     model.rotation.y += 0.01;
//   }

//   shaderPass.uniforms.time.value = time * 0.001;

  composer.render();
  requestAnimationFrame(animate);
}

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const popupOverlay = document.getElementById("popup-overlay")
popupOverlay.addEventListener("click", (e) => {
	if(e.target === popupOverlay) {
		popupOverlay.style.display = "none"
	}
})

// Détecter le clic de la souris
window.addEventListener('click', (event) => {
  // Normaliser les coordonnées de la souris
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Mettre à jour le raycaster
  raycaster.setFromCamera(mouse, camera);

  // Vérifier les intersections  
  if (raycaster.intersectObject(coeur_point).length > 0) {
    moveCameraToPoint(coeur_point);
	openPopup("/obstacle/obstacle.html")
  }

  if (raycaster.intersectObject(poumon_point).length > 0) {
	moveCameraToPoint(poumon_point)
	openPopup("/jeu-poumons/poumons.html")
  }
  
  if (raycaster.intersectObject(foie_point).length > 0) {
    moveCameraToPoint(foie_point);
	openPopup("/recuperation/index.html")
  }

  if (raycaster.intersectObject(intestin_point).length > 0) {
    moveCameraToPoint(intestin_point);
	openPopup("/pacman/pacman.html")
  }

  if (raycaster.intersectObject(tibia_point).length > 0) {
    moveCameraToPoint(tibia_point);
	openPopup("/puzzle/puzzle.html")
  }

  if (raycaster.intersectObject(system_nerveux_point).length > 0) {
    moveCameraToPoint(system_nerveux_point);

  }
});

function openPopup(path) {
	const popup = document.getElementById('popup-overlay');
    popup.classList.remove('hidden');
	
	window.location.href = path
}

function moveCameraToPoint(target) {
    // Position cible (point + distance pour un zoom ajusté)
    const targetPosition = new THREE.Vector3();
    target.getWorldPosition(targetPosition); // Obtenir la position globale du point
  
    const offset = new THREE.Vector3(0, 1, 3); // Ajustez cet offset pour définir la distance par rapport au point
    const finalPosition = targetPosition.clone().add(offset);
  
    // Animations
    const startPosition = camera.position.clone();
    const duration = 3000; // Durée de l'animation (en ms)
    let startTime = null;
  
    function animateCamera(time) {
      if (!startTime) startTime = time;
      const elapsedTime = time - startTime;
      const t = Math.min(elapsedTime / duration, 1); // Interpolation (0 à 1)
  
      // Interpolation de la position
      camera.position.lerpVectors(startPosition, finalPosition, t);
  
      // Faire en sorte que la caméra regarde le point
      camera.lookAt(targetPosition);
  
      // Continuer l'animation tant que `t` n'a pas atteint 1
      if (t < 1) {
        requestAnimationFrame(animateCamera);
      }
    }
  
    requestAnimationFrame(animateCamera);
}

function animateCameraToInitialPosition() {
  const startPosition = camera.position.clone();
  const startLookAt = new THREE.Vector3();
  camera.getWorldDirection(startLookAt);
  startLookAt.add(camera.position); // Obtenir le point que la caméra regarde actuellement

  const duration = 1000; // Durée de l'animation (1 seconde)
  let startTime = null;

  function animate(time) {
    if (!startTime) startTime = time;
    const elapsedTime = time - startTime;
    const t = Math.min(elapsedTime / duration, 1); // Interpolation (de 0 à 1)

    // Interpolation de la position de la caméra
    camera.position.lerpVectors(startPosition, initialCameraPosition, t);

    // Interpolation du point regardé
    const lookAt = new THREE.Vector3();
    lookAt.lerpVectors(startLookAt, initialCameraLookAt, t);
    camera.lookAt(lookAt);

    if (t < 1) {
      requestAnimationFrame(animate); // Continuer tant que l'animation n'est pas terminée
    }
  }

  requestAnimationFrame(animate);
}

document.getElementById('resetCamera').addEventListener('click', () => {
  animateCameraToInitialPosition();
});



animate();