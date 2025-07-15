import { getCachedFurniture, getFurnitureById } from './module.js';
const vConsole = new VConsole();

const params = new URLSearchParams(location.search);
const productId = +(params.get('id') ?? 123);
let furniture = getCachedFurniture(productId) || await getFurnitureById(productId);
document.querySelector('.name').textContent = furniture.name;

const mv = document.querySelector('model-viewer');
const statusMsg = document.createElement('div');
statusMsg.className = 'ar-status';
mv.parentElement.appendChild(statusMsg);

let oneToOneScale = null;

function setupPreview() {
  mv.updateFraming();
  mv.cameraOrbit = `0deg 75deg 9m`;
  mv.jumpCameraToGoal();
  updateARLabels();
}

function calcScale() {
  const box = mv.getDimensions();
  if (!box || box.y <= 0) {
    statusMsg.textContent = 'Ошибка: некорректная модель';
    return 1;
  }
  const realHeight = furniture.height / 100;
  return realHeight / box.y;
}

function updateARLabels() {
  // Удалим старые метки
  mv.querySelectorAll('.ar-label').forEach(el => el.remove());

  const dims = mv.getDimensions();
  if (!dims) return;

  const scale = oneToOneScale || calcScale();
  const width = (dims.x * scale * 100).toFixed(0);
  const height = (dims.y * scale * 100).toFixed(0);
  const depth = (dims.z * scale * 100).toFixed(0);

  const createHotspot = (slot, position, normal, text) => {
    const btn = document.createElement('button');
    btn.slot = slot;
    btn.className = 'ar-label';
    btn.setAttribute('data-position', position);
    btn.setAttribute('data-normal', normal);
    btn.textContent = text;
    mv.appendChild(btn);
  };

  createHotspot('hotspot-height', `-${dims.x / 2} ${dims.y / 2} 0`, '0 1 0', `${height} см`);
  createHotspot('hotspot-width',  `0 0 ${dims.z / 2}`, '0 0 1', `${width} см`);
  createHotspot('hotspot-depth',  `${dims.x / 2} 0 0`, '1 0 0', `${depth} см`);
}

mv.addEventListener('load', () => {
  setupPreview();
});

mv.addEventListener('ar-status', e => {
  if (e.detail.status === 'session-started' && oneToOneScale === null) {
    oneToOneScale = calcScale();
    mv.setAttribute('scale', `${oneToOneScale} ${oneToOneScale} ${oneToOneScale}`);
    mv.setAttribute('ar-occlusion', 'true');
    mv.updateFraming();
    updateARLabels();
    statusMsg.textContent = '✅ Модель в масштабе 1:1';
  }
  if (e.detail.status === 'not-presenting') {
    oneToOneScale = null;
    statusMsg.textContent = '';
    setupPreview();
  }
});

const models = {
  4: {
    glb: 'https://raw.githubusercontent.com/Karina-Dvoryankina/ar-models/main/1.glb',
    usdz: 'https://modelviewer.dev/shared-assets/models/Astronaut.usdz'
  }
};
const mdl = models[productId] || models[4];

mv.src = mdl.glb;
if (mdl.usdz) mv.setAttribute('ios-src', mdl.usdz);
mv.setAttribute('ar-scale', 'fixed');
mv.setAttribute('ar-modes', 'webxr scene-viewer quick-look');
mv.environmentImage = 'neutral';
mv.setAttribute('ar-occlusion', 'true');
mv.shadowIntensity = 1;
mv.exposure = 0.8;
