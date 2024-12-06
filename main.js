import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";

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

// Rendu
const renderer = new THREE.WebGLRenderer();
renderer.setClearColor(0xDEDBDB, 1);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
const ambientLight = new THREE.AmbientLight(0xf2e9e9, 0.5);
scene.add(ambientLight);

// const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
const directionalLight = new THREE.DirectionalLight(0xf2e9e9, 1);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);


let model;
const gltfLoader = new GLTFLoader();
gltfLoader.load(
  // "./3D_models/low_poly_male_base(2).glb", 
  "./3D_models/cj_akiyama.glb", 
  (gltf) => {
    model = gltf.scene;

    // Centrer le modèle
    const box = new THREE.Box3().setFromObject(model);
    const center = new THREE.Vector3();
    box.getCenter(center);
    model.position.sub(center);
    model.scale.set(5,5,5)
    // model.scale.set(20,20,20)

    scene.add(model);
  },
  (progress) => {
    console.log(`Progression du chargement : ${(progress.loaded / progress.total) * 100}%`);
  },
  (error) => {
    console.error("Erreur lors du chargement du fichier GLB :", error);
  }
);

// const fbxLoader = new FBXLoader();
// fbxLoader.load(
//   "./3D_models/male_003.fbx", 
//   (object) => {
//     model = object;

//     // Centrer le modèle
//     const box = new THREE.Box3().setFromObject(model);
//     const center = new THREE.Vector3();
//     box.getCenter(center);
//     model.position.sub(center);
//     model.scale.set(20,20,20)

//     scene.add(model);
//   },
//   (progress) => {
//     console.log(`Progression du chargement : ${(progress.loaded / progress.total) * 100}%`);
//   },
//   (error) => {
//     console.error("Erreur lors du chargement du fichier GLB :", error);
//   }
// );

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

  if (model) {
    model.rotation.y += 0.01;
  }

  // shaderPass.uniforms.time.value = time * 0.001;

  composer.render();
  requestAnimationFrame(animate);
}
animate();