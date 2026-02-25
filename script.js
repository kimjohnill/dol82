import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// ===== HERO SCENE =====
const heroScene = new THREE.Scene();
heroScene.background = null;

const heroCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
heroCamera.position.set(0, 0, isMobile ? 12 : 8);

const heroRenderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: 'high-performance',
    stencil: true,
    alpha: true
});
heroRenderer.setSize(window.innerWidth, window.innerHeight);
heroRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
heroRenderer.toneMapping = THREE.ACESFilmicToneMapping;
heroRenderer.toneMappingExposure = 1.2;
heroRenderer.outputColorSpace = THREE.SRGBColorSpace;
heroRenderer.setClearColor(0x161616, 0);
document.getElementById('hero-container').appendChild(heroRenderer.domElement);

const glossyMaterial = new THREE.MeshStandardMaterial({
    color: 0xdddddd,
    roughness: 0.4,
    metalness: 0.3,
    envMapIntensity: 0.8
});

// ===== SUB TEXT (dolbag001 below face) =====
const canvasSubText = document.createElement('canvas');
canvasSubText.width = 2048;
canvasSubText.height = 512;
const ctxSub = canvasSubText.getContext('2d', { alpha: true, colorSpace: 'srgb' });

const subTextTexture = new THREE.CanvasTexture(canvasSubText);
subTextTexture.colorSpace = THREE.SRGBColorSpace;

const subTextMaterial = new THREE.MeshBasicMaterial({
    map: subTextTexture,
    transparent: true,
    opacity: 1,
    toneMapped: false,
    depthWrite: false
});

const subTextScale = isMobile ? 0.25 : 1;
const subTextGeometry = new THREE.PlaneGeometry(24 * subTextScale, 6 * subTextScale);
const subTextMesh = new THREE.Mesh(subTextGeometry, subTextMaterial);
const baseSubTextY = isMobile ? -4.5 : -4.8;
subTextMesh.position.set(0, baseSubTextY, isMobile ? 0 : -5);
heroScene.add(subTextMesh);

function drawSubText() {
    ctxSub.clearRect(0, 0, 2048, 512);
    ctxSub.save();
    ctxSub.translate(1024, 256);
    ctxSub.fillStyle = '#ffffff';
    ctxSub.font = '900 300px Roboto, sans-serif';
    ctxSub.textBaseline = 'middle';
    ctxSub.textAlign = 'center';
    ctxSub.fillText('dolbag001', 0, 0);
    ctxSub.restore();
    subTextTexture.needsUpdate = true;
}

// Draw sub text immediately
drawSubText();

// ===== SHADOW =====
const shadowCanvas = document.createElement('canvas');
shadowCanvas.width = 512;
shadowCanvas.height = 512;
const ctx = shadowCanvas.getContext('2d');
ctx.save();
ctx.translate(256, 256);
ctx.scale(1, 0.4);
const outerGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 200);
outerGradient.addColorStop(0, 'rgba(0, 0, 0, 0.4)');
outerGradient.addColorStop(0.3, 'rgba(0, 0, 0, 0.25)');
outerGradient.addColorStop(0.6, 'rgba(0, 0, 0, 0.08)');
outerGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
ctx.fillStyle = outerGradient;
ctx.beginPath();
ctx.arc(0, 0, 200, 0, Math.PI * 2);
ctx.fill();
const innerGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 80);
innerGradient.addColorStop(0, 'rgba(0, 0, 0, 0.5)');
innerGradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.3)');
innerGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
ctx.fillStyle = innerGradient;
ctx.beginPath();
ctx.arc(0, 0, 80, 0, Math.PI * 2);
ctx.fill();
ctx.restore();

const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
const shadowMaterial = new THREE.MeshBasicMaterial({
    map: shadowTexture,
    transparent: true,
    opacity: 0,
    depthWrite: false
});
const shadowGeometry = new THREE.PlaneGeometry(6, 2.5);
const shadowMesh = new THREE.Mesh(shadowGeometry, shadowMaterial);
shadowMesh.rotation.x = -Math.PI / 2;
shadowMesh.position.y = -3.5;
shadowMesh.visible = false;
heroScene.add(shadowMesh);

// ===== FACE GEOMETRY =====
function createFace(material) {
    const faceGroup = new THREE.Group();
    const width = 4.6;
    const height = 5.5;
    const radius = 2.3;
    const tubeRadius = 0.15;

    const leftEdgeMesh = new THREE.Mesh(new THREE.CylinderGeometry(tubeRadius, tubeRadius, height - radius, 64), material);
    leftEdgeMesh.position.set(-width / 2, radius / 2, 0);
    faceGroup.add(leftEdgeMesh);

    const rightEdgeMesh = new THREE.Mesh(new THREE.CylinderGeometry(tubeRadius, tubeRadius, height - radius, 64), material);
    rightEdgeMesh.position.set(width / 2, radius / 2, 0);
    faceGroup.add(rightEdgeMesh);

    const topEdgeMesh = new THREE.Mesh(new THREE.CylinderGeometry(tubeRadius, tubeRadius, width + 1.5 * tubeRadius, 64), material);
    topEdgeMesh.rotation.z = Math.PI / 2;
    topEdgeMesh.position.set(0, height / 2, 0);
    faceGroup.add(topEdgeMesh);

    const topLeftCapMesh = new THREE.Mesh(new THREE.SphereGeometry(tubeRadius, 32, 32), material);
    topLeftCapMesh.position.set(-width / 2, height / 2, 0);
    faceGroup.add(topLeftCapMesh);

    const topRightCapMesh = new THREE.Mesh(new THREE.SphereGeometry(tubeRadius, 32, 32), material);
    topRightCapMesh.position.set(width / 2, height / 2, 0);
    faceGroup.add(topRightCapMesh);

    const bottomArcMesh = new THREE.Mesh(new THREE.TorusGeometry(radius, tubeRadius, 32, 128, Math.PI), material);
    bottomArcMesh.rotation.z = Math.PI;
    bottomArcMesh.position.set(0, -height / 2 + radius, 0);
    faceGroup.add(bottomArcMesh);

    const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.4, 64, 32), material);
    leftEye.position.set(-1.2, 1.0, 0);
    faceGroup.add(leftEye);

    const rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.4, 64, 32), material);
    rightEye.position.set(1.2, 1.0, 0);
    faceGroup.add(rightEye);

    const mouth = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.3, 0.5), material);
    mouth.position.set(0, -1.2, 0);
    faceGroup.add(mouth);

    return faceGroup;
}

const heroFace = createFace(glossyMaterial);
const baseFaceY = 0.8;
heroFace.position.set(0, baseFaceY, 0);
heroScene.add(heroFace);

if (isMobile) {
    heroFace.visible = true;
    heroFace.position.y = baseFaceY;
    shadowMesh.visible = false;
    shadowMaterial.opacity = 0.8;
} else {
    // Face hidden until entrance animation starts
    heroFace.visible = false;
}

// ===== dol82 OVERLAY =====
const dol82El = document.getElementById('dol82-label');

// ===== LIGHTS =====
heroScene.add(new THREE.AmbientLight(0xffffff, 0.5));
const mainLight = new THREE.DirectionalLight(0xffffff, 3.5);
mainLight.position.set(4, 6, 3);
heroScene.add(mainLight);
const rimLight = new THREE.DirectionalLight(0x6699ff, 2.0);
rimLight.position.set(-5, 2, -3);
heroScene.add(rimLight);
const fillLight = new THREE.DirectionalLight(0xffffff, 2.5);
fillLight.position.set(0, 0, 8);
heroScene.add(fillLight);
const spotLight = new THREE.PointLight(0xffffff, 2.0, 100);
spotLight.position.set(0, 3, 7);
heroScene.add(spotLight);
const mouthLight = new THREE.SpotLight(0xffffff, 2.0, 50, Math.PI / 6, 0.5, 1);
mouthLight.position.set(0, 2, 6);
heroScene.add(mouthLight);

const pmremGenerator = new THREE.PMREMGenerator(heroRenderer);
heroScene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

// ===== ENTRANCE ANIMATION =====
// Face drops in immediately on page load — no text animation delay
let isAnimatingEntrance = false;
let entranceProgress = 0;
const entranceStartY = 20;
const entranceEndY = baseFaceY;
const entranceSpinSpeed = Math.PI * 8;
const entranceDuration = 1500;
let entranceStartTime = 0;

if (!isMobile) {
    isAnimatingEntrance = true;
    entranceStartTime = Date.now();
    heroFace.visible = true;
    shadowMesh.visible = false;
}

// ===== MOUSE / TOUCH =====
let mouseX = 0;
let mouseY = 0;

document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -((event.clientY / window.innerHeight) * 2 - 1);
});
document.addEventListener('touchstart', (event) => {
    if (event.touches.length > 0) {
        mouseX = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
        mouseY = -((event.touches[0].clientY / window.innerHeight) * 2 - 1);
    }
}, { passive: true });
document.addEventListener('touchmove', (event) => {
    if (event.touches.length > 0) {
        mouseX = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
        mouseY = -((event.touches[0].clientY / window.innerHeight) * 2 - 1);
    }
}, { passive: true });
document.addEventListener('touchend', () => { mouseX = 0; mouseY = 0; });
document.addEventListener('mouseleave', () => { mouseX = 0; mouseY = 0; });

// ===== PARALLAX ON SCROLL =====
window.addEventListener('scroll', () => {
    if (isAnimatingEntrance) return;
    const t = Math.min(window.scrollY / window.innerHeight, 1);

heroFace.position.y = baseFaceY - t * (isMobile ? 3.0 : 2.2);
subTextMesh.position.y = baseSubTextY - t * (isMobile ? 1.5 : 1.0);

    if (dol82El) {
        dol82El.style.transform = `translateY(${-window.scrollY * (isMobile ? 1.2 : 0.8)}px)`;
    }
});


// ===== GRID FACES =====
const faceItems = document.querySelectorAll('.face-item');
const canvasWrappers = document.querySelectorAll('.face-canvas-wrapper');
const gridScenes = [];
const gridCameras = [];
const gridRenderers = [];
const gridFaces = [];

canvasWrappers.forEach((wrapper) => {
    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
    camera.position.set(0, 0, 8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x161616, 0);
    wrapper.appendChild(renderer.domElement);

    const face = createFace(glossyMaterial.clone());
    scene.add(face);

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const l1 = new THREE.DirectionalLight(0xffffff, 3.5);
    l1.position.set(4, 6, 3);
    scene.add(l1);
    const l2 = new THREE.DirectionalLight(0x6699ff, 2.0);
    l2.position.set(-5, 2, -3);
    scene.add(l2);
    const l3 = new THREE.DirectionalLight(0xffffff, 2.5);
    l3.position.set(0, 0, 8);
    scene.add(l3);

    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

    gridScenes.push(scene);
    gridCameras.push(camera);
    gridRenderers.push(renderer);
    gridFaces.push(face);
});

function resizeGridFaces() {
    canvasWrappers.forEach((wrapper, index) => {
        const rect = wrapper.getBoundingClientRect();
        const size = Math.min(rect.width, rect.height);
        gridRenderers[index].setSize(size, size);
        gridCameras[index].aspect = 1;
        gridCameras[index].updateProjectionMatrix();
    });
}
resizeGridFaces();

// ===== CLICK HANDLERS =====
faceItems.forEach((item) => {
    item.addEventListener('click', () => {
        const action = item.getAttribute('data-action');
        const url = item.getAttribute('data-url');
        if (action === 'scroll-top') {
            lenis.scrollTo(0, { duration: 1.5 });
        } else if (action === 'scroll-contact') {
            lenis.scrollTo(document.getElementById('contact-section'), { duration: 1.5 });
        } else if (action === 'link' && url) {
            window.open(url, '_blank');
        }
    });
});

// ===== CONTACT ANIMATION =====
const contactTitle = document.querySelector('.contact-title');
const contactContent = document.querySelector('.contact-content');

function updateContactOnScroll() {
    const titleRect = contactTitle.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const titleTop = titleRect.top;
    const startPoint = windowHeight - 300;
    const endPoint = windowHeight / 2 - 100;
    let progress = (startPoint - titleTop) / (startPoint - endPoint);
    progress = Math.max(0, Math.min(1, progress));
    contactTitle.style.transform = `scaleY(${progress})`;
    if (progress >= 0.95) {
        contactContent.classList.add('visible');
    } else {
        contactContent.classList.remove('visible');
    }
}

window.addEventListener('scroll', updateContactOnScroll);
updateContactOnScroll();

// ===== RESIZE =====
window.addEventListener('resize', () => {
    heroCamera.aspect = window.innerWidth / window.innerHeight;
    heroCamera.updateProjectionMatrix();
    heroRenderer.setSize(window.innerWidth, window.innerHeight);
    resizeGridFaces();
    updateContactOnScroll();
});

// ===== ANIMATION LOOP =====
function animate() {
    requestAnimationFrame(animate);

    if (isAnimatingEntrance && !isMobile) {
        const elapsed = Date.now() - entranceStartTime;
        entranceProgress = Math.min(elapsed / entranceDuration, 1);

        const elasticEaseOut = (t) => {
            const n1 = 7.5625;
            const d1 = 2.75;
            if (t < 1 / d1) return n1 * t * t;
            if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
            if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
            return n1 * (t -= 2.625 / d1) * t + 0.984375;
        };
        const spinEase = (t) => 1 - Math.pow(1 - t, 5);

        const easedDrop = elasticEaseOut(entranceProgress);
        const easedSpin = spinEase(entranceProgress);

        heroFace.position.y = entranceStartY + (entranceEndY - entranceStartY) * easedDrop;
        heroFace.rotation.y = (1 - easedSpin) * entranceSpinSpeed;
        heroFace.rotation.x = Math.sin(entranceProgress * Math.PI) * 0.05;

        const shadowProgress = (entranceStartY - heroFace.position.y) / entranceStartY;
        shadowMesh.scale.set(0.3 + shadowProgress * 0.7, 1, 0.3 + shadowProgress * 0.7);
        shadowMaterial.opacity = shadowProgress * 0.8;

        if (entranceProgress >= 1) {
            isAnimatingEntrance = false;
            heroFace.position.y = entranceEndY;
            heroFace.rotation.y = 0;
            heroFace.rotation.x = 0;
            shadowMesh.scale.set(1, 1, 1);
            shadowMaterial.opacity = 0.8;
        }
    }

    if (isMobile || !isAnimatingEntrance) {
        const targetRotationY = mouseX * 0.5;
        const targetRotationX = -mouseY * 0.35;
        heroFace.rotation.y += (targetRotationY - heroFace.rotation.y) * 0.08;
        heroFace.rotation.x += (targetRotationX - heroFace.rotation.x) * 0.08;
    }

    heroRenderer.render(heroScene, heroCamera);

    gridFaces.forEach((face, index) => {
        let targetRotY = 0;
        let targetRotX = 0;
        if (!isMobile && (mouseX !== 0 || mouseY !== 0)) {
            const wrapper = canvasWrappers[index];
            const rect = wrapper.getBoundingClientRect();
            const faceCenterX = ((rect.left + rect.width / 2) / window.innerWidth) * 2 - 1;
            const faceCenterY = -((rect.top + rect.height / 2) / window.innerHeight) * 2 + 1;
            targetRotY = (mouseX - faceCenterX) * 0.5;
            targetRotX = -(mouseY - faceCenterY) * 0.35;
        }
        face.rotation.y += (targetRotY - face.rotation.y) * 0.08;
        face.rotation.x += (targetRotX - face.rotation.x) * 0.08;
        gridRenderers[index].render(gridScenes[index], gridCameras[index]);
    });
}

animate();
