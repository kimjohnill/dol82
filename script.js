import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    smoothWheel: true
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// ===== HERO SCENE =====
const heroScene = new THREE.Scene();
heroScene.background = new THREE.Color(0xffffff);

const heroCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
heroCamera.position.set(0, 0, isMobile ? 12 : 8);

const heroRenderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance",
    stencil: true
});
heroRenderer.setSize(window.innerWidth, window.innerHeight);
heroRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
heroRenderer.toneMapping = THREE.ACESFilmicToneMapping;
heroRenderer.toneMappingExposure = 1.2;
heroRenderer.outputColorSpace = THREE.SRGBColorSpace;
document.getElementById('hero-container').appendChild(heroRenderer.domElement);

const glossyMaterial = new THREE.MeshStandardMaterial({
    color: 0x2a2a2a,
    roughness: 0.4,
    metalness: 0.3,
    envMapIntensity: 0.8
});

// Text setup
let textMesh = null;
let ctx3D = null;
let textTexture = null;
let isTextAnimating = true;
const animationStartTime = Date.now();
let textScaleProgress = 0;

const canvas3DText = document.createElement('canvas');
canvas3DText.width = 2048;
canvas3DText.height = 512;
ctx3D = canvas3DText.getContext('2d', { alpha: true, colorSpace: 'srgb' });

textTexture = new THREE.CanvasTexture(canvas3DText);
textTexture.colorSpace = THREE.SRGBColorSpace;

const textMaterial = new THREE.MeshBasicMaterial({
    map: textTexture,
    transparent: true,
    opacity: 1,
    toneMapped: false,
    depthWrite: false
});

const textScale = isMobile ? 0.25 : 1;
const textGeometry = new THREE.PlaneGeometry(32 * textScale, 9.5 * textScale);
textMesh = new THREE.Mesh(textGeometry, textMaterial);
textMesh.position.set(0, isMobile ? 4 : 3.9, isMobile ? 0 : -5);
heroScene.add(textMesh);

function drawText(scaleProgress) {
    if (!ctx3D || !textTexture) return;

    const elasticEaseOut = (t) => {
        if (t === 0 || t === 1) return t;
        const p = 0.3;
        const s = p / 4;
        return Math.pow(2, -10 * t) * Math.sin(((t - s) * (2 * Math.PI)) / p) + 1;
    };

    const easedScale = elasticEaseOut(scaleProgress);

    ctx3D.clearRect(0, 0, 2048, 512);
    ctx3D.save();
    ctx3D.translate(1024, 256);
    ctx3D.scale(easedScale, easedScale);
    ctx3D.fillStyle = '#353535';
    ctx3D.font = '900 300px Roboto, sans-serif';
    ctx3D.textBaseline = 'middle';
    ctx3D.textAlign = 'center';
    ctx3D.fillText('dolbag001', 0, 0);
    ctx3D.restore();
    textTexture.needsUpdate = true;
}

// Shadow for hero face
const canvas = document.createElement('canvas');
canvas.width = 512;
canvas.height = 512;
const ctx = canvas.getContext('2d');

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

const shadowTexture = new THREE.CanvasTexture(canvas);
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

// Helper function to create a face
function createFace(material) {
    const faceGroup = new THREE.Group();

    const width = 4.6;
    const height = 5.5;
    const radius = 2.3;
    const tubeRadius = 0.15;

    const leftEdge = new THREE.CylinderGeometry(tubeRadius, tubeRadius, height - radius, 64);
    const leftEdgeMesh = new THREE.Mesh(leftEdge, material);
    leftEdgeMesh.position.set(-width/2, radius/2, 0);
    faceGroup.add(leftEdgeMesh);

    const rightEdge = new THREE.CylinderGeometry(tubeRadius, tubeRadius, height - radius, 64);
    const rightEdgeMesh = new THREE.Mesh(rightEdge, material);
    rightEdgeMesh.position.set(width/2, radius/2, 0);
    faceGroup.add(rightEdgeMesh);

    const topEdgeWidth = width + (1.5 * tubeRadius);
    const topEdge = new THREE.CylinderGeometry(tubeRadius, tubeRadius, topEdgeWidth, 64);
    const topEdgeMesh = new THREE.Mesh(topEdge, material);
    topEdgeMesh.rotation.z = Math.PI / 2;
    topEdgeMesh.position.set(0, height/2, 0);
    faceGroup.add(topEdgeMesh);

    const topLeftCap = new THREE.SphereGeometry(tubeRadius, 32, 32);
    const topLeftCapMesh = new THREE.Mesh(topLeftCap, material);
    topLeftCapMesh.position.set(-width/2, height/2, 0);
    faceGroup.add(topLeftCapMesh);

    const topRightCap = new THREE.SphereGeometry(tubeRadius, 32, 32);
    const topRightCapMesh = new THREE.Mesh(topRightCap, material);
    topRightCapMesh.position.set(width/2, height/2, 0);
    faceGroup.add(topRightCapMesh);

    const bottomArc = new THREE.TorusGeometry(radius, tubeRadius, 32, 128, Math.PI);
    const bottomArcMesh = new THREE.Mesh(bottomArc, material);
    bottomArcMesh.rotation.z = Math.PI;
    bottomArcMesh.position.set(0, -height/2 + radius, 0);
    faceGroup.add(bottomArcMesh);

    const leftEyeGeometry = new THREE.SphereGeometry(0.4, 64, 32);
    const leftEye = new THREE.Mesh(leftEyeGeometry, material);
    leftEye.position.set(-1.2, 1.0, 0);
    faceGroup.add(leftEye);

    const rightEyeGeometry = new THREE.SphereGeometry(0.4, 64, 32);
    const rightEye = new THREE.Mesh(rightEyeGeometry, material);
    rightEye.position.set(1.2, 1.0, 0);
    faceGroup.add(rightEye);

    const mouthGeometry = new THREE.BoxGeometry(3.2, 0.3, 0.5);
    const mouth = new THREE.Mesh(mouthGeometry, material);
    mouth.position.set(0, -1.2, 0);
    faceGroup.add(mouth);

    return faceGroup;
}

const heroFace = createFace(glossyMaterial);
heroScene.add(heroFace);

if (isMobile) {
    heroFace.visible = true;
    heroFace.position.y = -0.5;
    shadowMesh.visible = true;
    shadowMaterial.opacity = 0.8;
    isTextAnimating = false;
    drawText(1);
} else {
    heroFace.visible = false;
}

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
heroScene.add(ambientLight);

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

let isAnimatingEntrance = !isMobile;
let entranceProgress = 0;
const entranceStartY = 20;
const entranceEndY = 0;
const entranceSpinSpeed = Math.PI * 8;
const entranceDuration = 1500;
let entranceStartTime = 0;

let mouseX = 0;
let mouseY = 0;
let isTouching = false;

document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -((event.clientY / window.innerHeight) * 2 - 1);
});

document.addEventListener('touchstart', (event) => {
    isTouching = true;
    if (event.touches.length > 0) {
        const touch = event.touches[0];
        mouseX = (touch.clientX / window.innerWidth) * 2 - 1;
        mouseY = -((touch.clientY / window.innerHeight) * 2 - 1);
    }
}, { passive: true });

document.addEventListener('touchmove', (event) => {
    if (event.touches.length > 0) {
        const touch = event.touches[0];
        mouseX = (touch.clientX / window.innerWidth) * 2 - 1;
        mouseY = -((touch.clientY / window.innerHeight) * 2 - 1);
    }
}, { passive: true });

document.addEventListener('touchend', () => {
    isTouching = false;
    mouseX = 0;
    mouseY = 0;
});

document.addEventListener('mouseleave', () => {
    mouseX = 0;
    mouseY = 0;
});

// ===== GRID FACES SECTION =====
const faceItems = document.querySelectorAll('.face-item');
const canvasWrappers = document.querySelectorAll('.face-canvas-wrapper');
const gridScenes = [];
const gridCameras = [];
const gridRenderers = [];
const gridFaces = [];

canvasWrappers.forEach((wrapper, index) => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
    camera.position.set(0, 0, 8);

    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    wrapper.appendChild(renderer.domElement);

    const face = createFace(glossyMaterial.clone());
    scene.add(face);

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const light1 = new THREE.DirectionalLight(0xffffff, 3.5);
    light1.position.set(4, 6, 3);
    scene.add(light1);
    const light2 = new THREE.DirectionalLight(0x6699ff, 2.0);
    light2.position.set(-5, 2, -3);
    scene.add(light2);
    const light3 = new THREE.DirectionalLight(0xffffff, 2.5);
    light3.position.set(0, 0, 8);
    scene.add(light3);

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

// ===== FACE CLICK HANDLERS =====
faceItems.forEach((item) => {
    item.addEventListener('click', () => {
        const action = item.getAttribute('data-action');
        const url = item.getAttribute('data-url');

        if (action === 'scroll-top') {
            lenis.scrollTo(0, { duration: 1.5 });
        } else if (action === 'scroll-contact') {
            const contactSection = document.getElementById('contact-section');
            lenis.scrollTo(contactSection, { duration: 1.5 });
        } else if (action === 'link' && url) {
            window.open(url, '_blank');
        }
    });
});

// ===== SCROLL-BASED CONTACT ANIMATION =====
const contactTitle = document.querySelector('.contact-title');
const contactContent = document.querySelector('.contact-content');
const contactSection = document.getElementById('contact-section');

function updateContactOnScroll() {
    const titleRect = contactTitle.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const titleTop = titleRect.top;

    const startPoint = windowHeight - 300;
    const endPoint = windowHeight / 2 - 100;

    let progress = (startPoint - titleTop) / (startPoint - endPoint);
    progress = Math.max(0, Math.min(1, progress));

    const scaleY = progress;
    contactTitle.style.transform = `scaleY(${scaleY})`;

    if (progress >= 0.95) {
        contactContent.classList.add('visible');
    } else {
        contactContent.classList.remove('visible');
    }
}

window.addEventListener('scroll', updateContactOnScroll);
updateContactOnScroll();

window.addEventListener('resize', () => {
    heroCamera.aspect = window.innerWidth / window.innerHeight;
    heroCamera.updateProjectionMatrix();
    heroRenderer.setSize(window.innerWidth, window.innerHeight);
    resizeGridFaces();
    updateContactOnScroll();
});

function animate() {
    requestAnimationFrame(animate);

    if (isTextAnimating && !isMobile) {
        const elapsed = Date.now() - animationStartTime;
        const textDuration = 800;
        const textDelay = 500;

        if (elapsed < textDelay) {
            textScaleProgress = 0;
            drawText(textScaleProgress);
        } else {
            const textElapsed = elapsed - textDelay;
            textScaleProgress = Math.min(textElapsed / textDuration, 1);
            drawText(textScaleProgress);

            if (textScaleProgress >= 1) {
                isTextAnimating = false;
                isAnimatingEntrance = true;
                entranceStartTime = Date.now();
                heroFace.visible = true;
                shadowMesh.visible = true;
            }
        }
    }

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
        const shadowScale = 0.3 + shadowProgress * 0.7;
        shadowMesh.scale.set(shadowScale, 1, shadowScale);
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

    if ((isMobile || (!isAnimatingEntrance && !isTextAnimating))) {
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

            const directionX = mouseX - faceCenterX;
            const directionY = mouseY - faceCenterY;

            targetRotY = directionX * 0.5;
            targetRotX = -directionY * 0.35;
        }

        face.rotation.y += (targetRotY - face.rotation.y) * 0.08;
        face.rotation.x += (targetRotX - face.rotation.x) * 0.08;

        gridRenderers[index].render(gridScenes[index], gridCameras[index]);
    });
}

animate();
