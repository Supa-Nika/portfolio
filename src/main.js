import Scene from '../phys-engine/src/engine/Scene.js';
import { MODEL_KEYS , typeCodeFor} from '../phys-engine/src/engine/modelRegistry.js';
import Controls from '../phys-engine/src/engine/Controls.js';
import * as THREE from 'three';

async function init() {
  await Scene.createScene();
  
  window.addEventListener('contextmenu', async (e) => {
    e.preventDefault();
    const mousePos = Controls.getMouseWorldPosition(Scene.camera);
    const key = MODEL_KEYS[Math.floor(Math.random() * MODEL_KEYS.length)];
    await Scene.createModel(mousePos.x, 5, mousePos.z, 10, key);
  });

  window.addEventListener('wheel', async (e) => {
    e.preventDefault();
    const mousePos = Controls.getMouseWorldPosition(Scene.camera);
    const r = THREE.MathUtils.randFloat(1, 5);
    const ball = await Scene.createBall(mousePos.x, 5, mousePos.z, r);
  });  

  const ball = await Scene.createBall(0, 5, 0, 3);
  const object = await Scene.createModel(5, 5, 5, 3, 'car');

  Scene.createJoint(ball, object, 10, 100, 10);

  const aspectRatio = window.innerWidth / window.innerHeight;
  const pageHeight = 54;
  const pageWidth = pageHeight * aspectRatio;

  const page = await Scene.createHTML(
    0, 25, 10, 10,
    import.meta.env.BASE_URL + 'portfolio.html', 
    { width: pageWidth, height: pageHeight }
  );

  const point1 = await Scene.createBall(-10, 70, 0, 3);
  const point2 = await Scene.createBall(0, 70, 10, 3);
  const point3 = await Scene.createBall(10, 70, 0, 3);

  Scene.anchor(point1);
  Scene.anchor(point3);

  Scene.createJoint(point1, page, 1, 50000, 1, { anchorB: { x: -pageWidth / 2, y: pageHeight / 2, z: 0 }});
  Scene.createJoint(point3, page, 1, 50000, 1, { anchorB: { x: pageWidth / 2, y: pageHeight / 2, z: 0 }});

  const elements = [];

  setInterval(async () => {
    const [ball, car] = await Promise.all([
      Scene.createBall(THREE.MathUtils.randFloat(-100,100), 200, THREE.MathUtils.randFloat(-100,100), 3),
      Scene.createModel(THREE.MathUtils.randFloat(-100,100), 200, THREE.MathUtils.randFloat(-100,100), 3, 'car'),
    ]);
    elements.push(ball, car);
  }, 100);

  setTimeout(() => {
    setInterval(() => {
      const el1 = elements.shift();
      if (el1) Scene.remove(el1);
      
      const el2 = elements.shift();
      if (el2) Scene.remove(el2);
    }, 100);
  }, 10000);
}

init();