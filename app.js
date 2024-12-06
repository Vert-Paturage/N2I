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
renderer.setClearColor(0x000000, 1); // Fond noir
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

const topLight = new THREE.PointLight(0xffffff, 1000, 50); // Lumière blanche, intensité 1.5, portée 50
topLight.position.set(0, 10, 0); // Position au-dessus du modèle
scene.add(topLight);

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

function createRing(position) {
  const ringGeometry = new THREE.RingGeometry(0.1, 0.15, 32);
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: 0xff9900,
    transparent: true,
    opacity: 0.8,
    side: THREE.DoubleSide,
  });
  const ring = new THREE.Mesh(ringGeometry, ringMaterial);
  ring.position.copy(position);
  ring.lookAt(camera.position);
  scene.add(ring);
  return ring;
}


function createClickableArea(position) {
  const invisibleGeometry = new THREE.RingGeometry(0, 0.50, 32);
  const invisibleMaterial = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0,
  });
  const clickableArea = new THREE.Mesh(invisibleGeometry, invisibleMaterial);
  clickableArea.position.copy(position);
  clickableArea.lookAt(camera.position);
  scene.add(clickableArea);
  return clickableArea;
}

const clickablePoints = [];

const coeurRing = createRing(new THREE.Vector3(0.5, 1.5, 1));
const coeurClickable = createClickableArea(new THREE.Vector3(0.5, 1.5, 1));
clickablePoints.push({ ring: coeurRing, area: coeurClickable });

const foieRing = createRing(new THREE.Vector3(-0.3, 0, 1));
const foieClickable = createClickableArea(new THREE.Vector3(-0.3, 0, 1));
clickablePoints.push({ ring: foieRing, area: foieClickable });

const intestinRing = createRing(new THREE.Vector3(0.3, 0, 1));
const intestinClickable = createClickableArea(new THREE.Vector3(0.3, 0, 1));
clickablePoints.push({ ring: intestinRing, area: intestinClickable });

const poumonRing = createRing(new THREE.Vector3(-0.5, 1.5, 1));
const poumonClickable = createClickableArea(new THREE.Vector3(-0.5, 1.5, 1));
clickablePoints.push({ ring: poumonRing, area: poumonClickable });

const tibiaRing = createRing(new THREE.Vector3(-0.5, -4, 1));
const tibiaClickable = createClickableArea(new THREE.Vector3(-0.5, -4, 1));
clickablePoints.push({ ring: tibiaRing, area: tibiaClickable });

const systemNerveuxRing = createRing(new THREE.Vector3(0, 3, 1));
const systemNerveuxClickable = createClickableArea(new THREE.Vector3(0, 3, 1));
clickablePoints.push({ ring: systemNerveuxRing, area: systemNerveuxClickable });


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

const shaderPass = new ShaderPass(vhsShader);
composer.addPass(shaderPass);

function animate(time) {

  shaderPass.uniforms.time.value = time * 0.001;

  composer.render();
  requestAnimationFrame(animate);
}

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Détecter le clic de la souris
window.addEventListener('click', (event) => {
  // Normaliser les coordonnées de la souris
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Mettre à jour le raycaster
  raycaster.setFromCamera(mouse, camera);

    // Vérifier les intersections
    const intersects = raycaster.intersectObjects(clickablePoints.map(p => p.area));

    if (intersects.length > 0) {
      // Trouver l'objet cliqué
      const clickedPoint = clickablePoints.find(p => p.area === intersects[0].object);
  
      if (clickedPoint) {
        moveCameraToPoint(clickedPoint.ring);

        clickablePoints.forEach(p => { p.ring.visible = false; });
      }
    }
 
});


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

  clickablePoints.forEach(p => { p.ring.visible = true; });
  requestAnimationFrame(animate);
}

document.getElementById('resetCamera').addEventListener('click', () => {
  animateCameraToInitialPosition();
});



animate();