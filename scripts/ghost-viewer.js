
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';

let scenes = {}, cameras = {}, renderers = {}, model, effect = 'rotate';
const viewports = ['front', 'back', 'left', 'right'];
const clock = new THREE.Clock();

viewports.forEach((id) => {
  const canvas = document.getElementById(id);
  initViewport(id, canvas);
});

function initViewport(id, canvas) {
  const scene = new THREE.Scene();
  scenes[id] = scene;
  scene.background = new THREE.Color(0x000000);

  const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
  cameras[id] = camera;
  camera.position.set(0, 1, 2);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderers[id] = renderer;

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(0, 10, 10);
  scene.add(light);

  const ambient = new THREE.AmbientLight(0x404040);
  scene.add(ambient);

  const loader = new GLTFLoader();
  loader.load('./assets/diva.glb', (gltf) => {
    model = gltf.scene;
    model.scale.set(1, 1, 1);
    scene.add(model);
    animate();
  });
}

function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  if (model) {
    switch (effect) {
      case 'rotate':
        model.rotation.y += 0.01;
        break;
      case 'pulse':
        const scale = 1 + 0.1 * Math.sin(t * 4);
        model.scale.set(scale, scale, scale);
        break;
      case 'float':
        model.position.y = 0.1 * Math.sin(t * 2);
        break;
      case 'fade':
        model.traverse((child) => {
          if (child.material) child.material.opacity = 0.5 + 0.5 * Math.sin(t * 2);
          if (child.material) child.material.transparent = true;
        });
        break;
      case 'stop':
        break;
    }
  }

  for (let id of viewports) {
    if (model) {
      model.rotation.y = getRotationFor(id, t);
    }
    renderers[id].render(scenes[id], cameras[id]);
  }
}

function getRotationFor(id, t) {
  switch(id) {
    case 'front': return 0;
    case 'back': return Math.PI;
    case 'left': return Math.PI / 2;
    case 'right': return -Math.PI / 2;
    default: return 0;
  }
}

window.triggerEffect = function(name) {
  effect = name;
  if (name === 'stop' && model) {
    model.rotation.set(0, 0, 0);
    model.scale.set(1, 1, 1);
    model.position.set(0, 0, 0);
    model.traverse((child) => {
      if (child.material) child.material.opacity = 1;
    });
  }
};
