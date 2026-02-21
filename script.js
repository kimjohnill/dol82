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

// Create starfield
const starfield = document.getElementById('starfield');
const stars = [];
const starCount = 200;

for (let i = 0; i < starCount; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    
    // Random size between 1px and 3px
    const size = Math.random() * 2 + 1;
    star.style.width = size + 'px';
    star.style.height = size + 'px';
    
    // Random position
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    star.style.left = x + '%';
    star.style.top = y + '%';
    
    // Random opacity
    star.style.opacity = Math.random() * 0.5 + 0.3;
    
    // Store parallax speed (random between 0.1 and 0.5)
    const speed = Math.random() * 0.4 + 0.1;
    star.dataset.speed = speed;
    
    starfield.appendChild(star);
    stars.push({ element: star, speed: speed, initialY: y });
}

// Parallax effect on scroll
window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    
    stars.forEach(star => {
        const translateY = scrollY * star.speed;
        star.element.style.transform = `translateY(${translateY}px)`;
    });
});
