import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// Scroll/Animation Libraries
window.addEventListener('beforeunload', () => {
  window.scrollTo(0, 0);
});
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  orientation: 'vertical',
  smoothWheel: true,
  smoothTouch: false,
});

gsap.registerPlugin(ScrollTrigger);

lenis.on('scroll', ScrollTrigger.update);
ScrollTrigger.scrollerProxy(document.body, {
  scrollTop(value) {
    return arguments.length ? lenis.scrollTo(value) : lenis.scroll;
  },
  getBoundingClientRect() {
    return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
  }
});

document.body.classList.add('disable-scroll');
lenis.stop();

let scrollY = 0;
lenis.on('scroll', ({ scroll }) => {
  scrollY = scroll;
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// THREE.js scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, isMobile ? 18 : 8);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: 'high-performance',
  alpha: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.getElementById('hero').appendChild(renderer.domElement);

// Glossy face material
const glossyMaterial = new THREE.MeshStandardMaterial({
  color: 0x2a2a2a,
  roughness: 0.4,
  metalness: 0.3,
  envMapIntensity: 0.8,
});

// Canvas text for 3D banner
const canvas3DText = document.createElement('canvas');
canvas3DText.width = 2048;
canvas3DText.height = 512;
const ctx3D = canvas3DText.getContext('2d', { alpha: true, colorSpace: 'srgb' });
const textTexture = new THREE.CanvasTexture(canvas3DText);
textTexture.colorSpace = THREE.SRGBColorSpace;

const textMaterial = new THREE.MeshBasicMaterial({
  map: textTexture,
  transparent: true,
  opacity: 1,
  toneMapped: false,
  depthWrite: false,
});
const textScale = isMobile ? 0.35 : 1;
const textGeometry = new THREE.PlaneGeometry(32 * textScale, 9.5 * textScale);
const textMesh = new THREE.Mesh(textGeometry, textMaterial);
textMesh.position.set(0, isMobile ? 6 : 3.9, -5);
scene.add(textMesh);

// Shadow below face group
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
  depthWrite: false,
});
const shadowGeometry = new THREE.PlaneGeometry(6, 2.5);
const shadowMesh = new THREE.Mesh(shadowGeometry, shadowMaterial);
shadowMesh.rotation.x = -Math.PI / 2;
shadowMesh.position.y = -3.5;
scene.add(shadowMesh);

// 3D Face group
const faceGroup = new THREE.Group();
const width = 4.6, height = 5.5, radius = 2.3, tubeRadius = 0.15;

const leftEdge = new THREE.CylinderGeometry(tubeRadius, tubeRadius, height - radius, 64);
const leftEdgeMesh = new THREE.Mesh(leftEdge, glossyMaterial);
leftEdgeMesh.position.set(-width / 2, radius / 2, 0);
faceGroup.add(leftEdgeMesh);

const rightEdge = new THREE.CylinderGeometry(tubeRadius, tubeRadius, height - radius, 64);
const rightEdgeMesh = new THREE.Mesh(rightEdge, glossyMaterial);
rightEdgeMesh.position.set(width / 2, radius / 2, 0);
faceGroup.add(rightEdgeMesh);

const topEdgeWidth = width + (1.5 * tubeRadius);
const topEdge = new THREE.CylinderGeometry(tubeRadius, tubeRadius, topEdgeWidth, 64);
const topEdgeMesh = new THREE.Mesh(topEdge, glossyMaterial);
topEdgeMesh.rotation.z = Math.PI / 2;
topEdgeMesh.position.set(0, height / 2, 0);
faceGroup.add(topEdgeMesh);

const topLeftCap = new THREE.SphereGeometry(tubeRadius, 32, 32);
const topLeftCapMesh = new THREE.Mesh(topLeftCap, glossyMaterial);
topLeftCapMesh.position.set(-width / 2, height / 2, 0);
faceGroup.add(topLeftCapMesh);

const topRightCap = new THREE.SphereGeometry(tubeRadius, 32, 32);
const topRightCapMesh = new THREE.Mesh(topRightCap, glossyMaterial);
topRightCapMesh.position.set(width / 2, height / 2, 0);
faceGroup.add(topRightCapMesh);

const bottomArc = new THREE.TorusGeometry(radius, tubeRadius, 32, 128, Math.PI);
const bottomArcMesh = new THREE.Mesh(bottomArc, glossyMaterial);
bottomArcMesh.rotation.z = Math.PI;
bottomArcMesh.position.set(0, -height / 2 + radius, 0);
faceGroup.add(bottomArcMesh);

const leftEyeGeometry = new THREE.SphereGeometry(0.4, 64, 32);
const leftEye = new THREE.Mesh(leftEyeGeometry, glossyMaterial);
leftEye.position.set(-1.2, 1.0, 0);
faceGroup.add(leftEye);

const rightEyeGeometry = new THREE.SphereGeometry(0.4, 64, 32);
const rightEye = new THREE.Mesh(rightEyeGeometry, glossyMaterial);
rightEye.position.set(1.2, 1.0, 0);
faceGroup.add(rightEye);

const mouthGeometry = new THREE.BoxGeometry(3.2, 0.3, 0.5);
const mouth = new THREE.Mesh(mouthGeometry, glossyMaterial);
mouth.position.set(0, -1.2, 0);
faceGroup.add(mouth);

scene.add(faceGroup);
faceGroup.visible = false;

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const mainLight = new THREE.DirectionalLight(0xffffff, 3.5);
mainLight.position.set(4, 6, 3);
scene.add(mainLight);
const rimLight = new THREE.DirectionalLight(0x6699ff, 2.0);
rimLight.position.set(-5, 2, -3);
scene.add(rimLight);
const fillLight = new THREE.DirectionalLight(0xffffff, 2.5);
fillLight.position.set(0, 0, 8);
scene.add(fillLight);
const spotLight = new THREE.PointLight(0xffffff, 2.0, 100);
spotLight.position.set(0, 3, 7);
scene.add(spotLight);
const mouthLight = new THREE.SpotLight(0xffffff, 2.0, 50, Math.PI / 6, 0.5, 1);
mouthLight.position.set(0, 2, 6);
scene.add(mouthLight);

const pmremGenerator = new THREE.PMREMGenerator(renderer);
scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

// ------------------- Animation States -------------------
let isTextAnimating = true;
let isAnimatingEntrance = false;
let textScaleProgress = 0;
const animationStartTime = Date.now();
let entranceProgress = 0;
const entranceStartY = 20, entranceEndY = 0;
const entranceSpinSpeed = Math.PI * 8, entranceDuration = 1500;
let entranceStartTime = 0;

let mouseX = 0, mouseY = 0;
let targetRotationY = 0, targetRotationX = 0;
document.addEventListener('mousemove', (event) => {
  mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  mouseY = -((event.clientY / window.innerHeight) * 2 - 1);
});
document.addEventListener('touchmove', (event) => {
  if (event.touches.length > 0) {
    const touch = event.touches[0];
    mouseX = (touch.clientX / window.innerWidth) * 2 - 1;
    mouseY = -((touch.clientY / window.innerHeight) * 2 - 1);
  }
}, { passive: true });
document.addEventListener('touchend', () => { mouseX = 0; mouseY = 0; });
document.addEventListener('mouseleave', () => { mouseX = 0; mouseY = 0; });

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Draw headline text (entrance state)
function drawText(scaleProgress) {
  const elasticEaseOut = (t) => {
    if (t === 0 || t === 1) return t;
    t = t * t * (3 - 2 * t);
    const p = 0.3;
    const s = p / 4;
    return Math.pow(2, -10 * t) * Math.sin((t - s) * (2 * Math.PI) / p) + 1;
  };
  const easedScale = elasticEaseOut(scaleProgress);
  const w = 2048, h = 512;
  ctx3D.clearRect(0, 0, w, h);
  ctx3D.save();
  ctx3D.translate(w / 2, h / 2);
  ctx3D.scale(easedScale, easedScale);
  ctx3D.fillStyle = '#353535';
  ctx3D.font = '900 300px Roboto, sans-serif';
  ctx3D.textBaseline = 'middle';
  ctx3D.textAlign = 'center';
  ctx3D.fillText('dolbag#001', 0, 0);
  ctx3D.restore();
  textTexture.needsUpdate = true;
}

// Main Animation Loop
function animate() {
  requestAnimationFrame(animate);
  if (isTextAnimating) {
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
        faceGroup.visible = true;
      }
    }
  }
  if (isAnimatingEntrance) {
    const elapsed = Date.now() - entranceStartTime;
    entranceProgress = Math.min(elapsed / entranceDuration, 1);
    // Drop-in and spin effect
    const elasticEaseOut = (t) => {
      const n1 = 7.5625, d1 = 2.75;
      if (t < 1 / d1) return n1 * t * t;
      else if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
      else if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
      else return n1 * (t -= 2.625 / d1) * t + 0.984375;
    };
    const spinEase = (t) => 1 - Math.pow(1 - t, 5);
    const easedDrop = elasticEaseOut(entranceProgress);
    const easedSpin = spinEase(entranceProgress);
    faceGroup.position.y = entranceStartY + (entranceEndY - entranceStartY) * easedDrop;
    faceGroup.rotation.y = (1 - easedSpin) * entranceSpinSpeed;
    faceGroup.rotation.x = Math.sin(entranceProgress * Math.PI) * 0.05;
    const shadowProgress = (entranceStartY - faceGroup.position.y) / entranceStartY;
    const shadowScale = 0.3 + shadowProgress * 0.7;
    shadowMesh.scale.set(shadowScale, 1, shadowScale);
    shadowMaterial.opacity = shadowProgress * 0.8;
    if (entranceProgress >= 1) {
      isAnimatingEntrance = false;
      faceGroup.position.y = entranceEndY;
      faceGroup.rotation.y = 0;
      faceGroup.rotation.x = 0;
      shadowMesh.scale.set(1, 1, 1);
      shadowMaterial.opacity = 0.8;
      document.body.classList.remove('disable-scroll');
      lenis.start();
    }
  }
  if (!isAnimatingEntrance && !isTextAnimating) {
    // Parallax scroll
    const heroHeight = window.innerHeight;
    const parallaxAmount = Math.min(scrollY / heroHeight, 1);
    faceGroup.position.y = parallaxAmount * 30;
    textMesh.position.y = (isMobile ? 6 : 3.9) + (parallaxAmount * 15);
    const shadowFadeAmount = Math.min(parallaxAmount / 0.3, 1);
    const shadowFade = Math.pow(1 - shadowFadeAmount, 3);
    shadowMaterial.opacity = 0.8 * shadowFade;
    targetRotationY = mouseX * 0.5;
    targetRotationX = -mouseY * 0.35;
    faceGroup.rotation.y += (targetRotationY - faceGroup.rotation.y) * 0.08;
    faceGroup.rotation.x += (targetRotationX - faceGroup.rotation.x) * 0.08;
  }
  renderer.render(scene, camera);
}

// ---------- About Section Image Carousel ----------
const carousel = document.querySelector('.about-carousel');
const images = document.querySelectorAll('.about-image');
const aboutSection = document.getElementById('about');
let currentIndex = 0;
let carouselTimer = null;
let isInView = false;

function crossfadeImages() {
  images[currentIndex].classList.remove('active');
  currentIndex = (currentIndex + 1) % images.length;
  images[currentIndex].classList.add('active');
}
function startCarousel() {
  if (carouselTimer) {
    clearInterval(carouselTimer);
    carouselTimer = null;
  }
  carouselTimer = setInterval(crossfadeImages, 4000);
}
function stopCarousel() {
  if (carouselTimer) {
    clearInterval(carouselTimer);
    carouselTimer = null;
  }
}
function checkAboutSection() {
  if (!aboutSection || images.length === 0) return;
  const rect = aboutSection.getBoundingClientRect();
  const windowHeight = window.innerHeight;
  const nowInView = rect.top <= 0 && rect.bottom > windowHeight;
  if (nowInView && !isInView) {
    isInView = true;
    startCarousel();
  } else if (!nowInView && isInView) {
    isInView = false;
    stopCarousel();
  }
}
lenis.on('scroll', checkAboutSection);
if (carousel) {
  carousel.addEventListener('mouseenter', stopCarousel);
  carousel.addEventListener('mouseleave', () => { if (isInView) startCarousel(); });
}

// ----- About Stacked Cards Pin/Scroll Animation -----
function setupStackScrollTrigger() {
  const stack = document.querySelector('.about-left-stack .stack-stage');
  if (!stack) return;
  const card1 = stack.querySelector('.stack-card-1');
  const card2 = stack.querySelector('.stack-card-2');
  const card3 = stack.querySelector('.stack-card-3');
  gsap.set([card1, card2, card3], { y: 0, opacity: 1 });
  const lift1 = -stack.offsetHeight * 1.8;
  const slide2 = -stack.offsetHeight * 1.7;
  const slide3 = -stack.offsetHeight * 1.7;
  gsap.timeline({
    scrollTrigger: {
      trigger: stack,
      start: "bottom 95%",
      end: "+=240%",
      scrub: true,
      pin: true,
      pinSpacing: true,
      anticipatePin: 0,
      scroller: document.body,
      markers: false
    }
  })
  .to(card1, { y: lift1, ease: "none" }, 0)
  .to(card2, { y: slide2, ease: "none" }, 0.33)
  .to(card3, { y: slide3, ease: "none" }, 0.66);
}

// ---------- Creators Section Parallax -------------

function setupAboutParallax() {
  const aboutTitle = document.querySelector('.about-title');
  const aboutTexts = document.querySelectorAll('.about-left .about-text, .about-left .about-text.large');

  // Parallax the title
  if (aboutTitle) {
    gsap.to(aboutTitle, {
      y: -50,
      ease: "none",
      scrollTrigger: {
        trigger: ".about-container",
        start: "top 85%",
        end: "top 15%",
        scrub: true,
        scroller: document.body
      }
    });
  }

  // Parallax all main text below ("as a group")
  if (aboutTexts.length) {
    gsap.to(aboutTexts, {
      y: -100,
      ease: "none",
      scrollTrigger: {
        trigger: ".about-container",
        start: "top 85%",
        end: "top 15%",
        scrub: true,
        scroller: document.body
      }
    });
  }
}

window.addEventListener('load', () => {
  setupAboutParallax();
  setupCreatorsParallax();
  ScrollTrigger.refresh();
});
window.addEventListener('resize', () => {
  ScrollTrigger.getAll().forEach(t => t.kill());
  setupAboutParallax();
  setupCreatorsParallax();
  ScrollTrigger.refresh();
});

window.addEventListener('load', () => {
  setupStackScrollTrigger();
  setTimeout(() => {
    setupCreatorsParallax();
    ScrollTrigger.refresh();
  }, 100);
});
window.addEventListener('resize', () => {
  ScrollTrigger.getAll().forEach(t => t.kill());
  setupStackScrollTrigger();
  setTimeout(() => {
    setupCreatorsParallax();
    ScrollTrigger.refresh();
  }, 100);
});

animate();

const sectionOrder = ['hero', 'about', 'creators', 'contact'];

function setActiveMenuIcon(sectionId) {
  document.querySelectorAll('.icon-menu .icon-btn.active').forEach(btn => btn.classList.remove('active'));
  const idx = sectionOrder.indexOf(sectionId);
  if (idx !== -1) {
    document.querySelectorAll('#menu-bottom .icon-btn, #menu-right .icon-btn').forEach((btn, i) => {
      if (i % 5 === idx) btn.classList.add('active');
    });
  }
}

function getCurrentSection() {
  let found = sectionOrder[0];
  sectionOrder.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top;
      if (top < window.innerHeight * 0.22) {
        found = id;
      }
    }
  });
  return found;
}

// On DOM load, highlight current section (on reload)
window.addEventListener('DOMContentLoaded', () => {
  setActiveMenuIcon(getCurrentSection());
});

// As you scroll, highlight current section
window.addEventListener('scroll', () => {
  setActiveMenuIcon(getCurrentSection());
});

// ---- ICON MENU ANIMATION ----
function waveInMenu(menuId, direction = "bottom") {
  const menu = document.getElementById(menuId);
  menu.classList.remove('hide');
  menu.classList.add('show');
  const btns = menu.querySelectorAll('.icon-btn');
  btns.forEach(btn => {
    btn.style.opacity = 0;
    btn.style.transform = direction === "bottom"
      ? "translateY(60px) scale(0.8)"
      : "translateX(60px) scale(0.8)";
  });
  const animProps = direction === "bottom"
    ? { y: 0 }
    : { x: 0 };
  gsap.to(btns, {
    ...animProps,
    opacity: 1,
    scale: 1,
    duration: 0.44,
    stagger: 0.07,
    ease: "back.out(1.4)",
    onUpdate: () => {
      btns.forEach(btn => {
        btn.style.transform = direction === "bottom"
          ? "translateY(0) scale(1)"
          : "translateX(0) scale(1)";
      });
    }
  });
}
function waveOutMenu(menuId, direction = "bottom", onDone) {
  const menu = document.getElementById(menuId);
  const btns = menu.querySelectorAll('.icon-btn');
  const animProps = direction === "bottom"
    ? { y: 60 }
    : { x: 60 };
  gsap.to(btns, {
    ...animProps,
    opacity: 0,
    scale: 0.8,
    duration: 0.32,
    stagger: 0.06,
    ease: "back.in(1.2)",
    onComplete: function() {
      menu.classList.remove('show');
      menu.classList.add('hide');
      if (typeof onDone === 'function') onDone();
    }
  });
}

// On first load, show bottom menu and highlight hero
window.addEventListener('load', () => {
  setTimeout(() => {
    waveInMenu('menu-bottom', "bottom");
    setActiveMenuIcon('hero');
  }, 1200);
});

// ---- MENU STATE MANAGEMENT WITH ANTI-GLITCH LOCK ----
let menuState = "bottom";
let isMenuTransitioning = false;

lenis.on('scroll', ({ scroll }) => {
  if (isMenuTransitioning) return;
  if (scroll > 10 && menuState === "bottom") {
    isMenuTransitioning = true;
    waveOutMenu('menu-bottom', "bottom", () => {
      waveInMenu('menu-right', "right");
      setActiveMenuIcon(getCurrentSection());
      menuState = "right";
      setTimeout(() => { isMenuTransitioning = false; }, 460);
    });
  } else if (scroll <= 10 && menuState === "right") {
    isMenuTransitioning = true;
    waveOutMenu('menu-right', "right", () => {
      waveInMenu('menu-bottom', "bottom");
      setActiveMenuIcon(getCurrentSection());
      menuState = "bottom";
      setTimeout(() => { isMenuTransitioning = false; }, 460);
    });
  }
});

// ---- MENU BUTTON BEHAVIOR ----
[...document.querySelectorAll('#menu-right .icon-btn'), ...document.querySelectorAll('#menu-bottom .icon-btn')].forEach((btn, idx) => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    // Home button
    if (btn.querySelector('.fa-home')) {
      lenis.scrollTo(0, {
        offset: 0,
        duration: 1.4,
        easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t))
      });
      setActiveMenuIcon('hero');
      if (menuState === "right" && !isMenuTransitioning) {
        isMenuTransitioning = true;
        waveOutMenu('menu-right', "right", () => {
          waveInMenu('menu-bottom', "bottom");
          menuState = "bottom";
          setTimeout(() => { isMenuTransitioning = false; }, 460);
        });
      }
      return;
    }
    // Shop button
    if (btn.querySelector('.fa-shopping-bag')) {
      window.open('/shop', '_blank');
      return;
    }
    // Other sections
    const sectionMap = ['hero', 'about', 'creators', 'contact'];
    const sectionIdx = idx % 5;
    if (sectionIdx > 0 && sectionIdx < 5 && sectionIdx - 1 < sectionMap.length) {
      const section = document.getElementById(sectionMap[sectionIdx]);
      if (section) {
        lenis.scrollTo(section, {
          offset: 0,
          duration: 1.4,
          easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t))
        });
        setActiveMenuIcon(sectionMap[sectionIdx]);
      }
    }
  });
});

function setupCreatorsTitleCarousel() {
  const track = document.querySelector('.carousel-track');
  if (!track) return;

  // Get the width of one loop (all children titles + gaps)
  const trackWidth = track.scrollWidth;

  // Animate horizontal movement on scroll
  gsap.to(track, {
    x: () => `-${trackWidth / 2}px`,
    ease: "none",
    scrollTrigger: {
      trigger: ".creators-section",
      start: "top bottom",
      end: "bottom top",
      scrub: true,
      scroller: document.body,
    },
    modifiers: {
      x: gsap.utils.unitize(x => {
        return x;
      }),
    }
  });
}

window.addEventListener('load', () => {
  setupCreatorsTitleCarousel();
  ScrollTrigger.refresh();
});
window.addEventListener('resize', () => {
  ScrollTrigger.getAll().forEach(t => t.kill());
  setupCreatorsTitleCarousel();
  ScrollTrigger.refresh();
});
