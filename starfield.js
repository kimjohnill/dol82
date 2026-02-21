// Create starfield
const starfield = document.getElementById('starfield');
const stars = [];
const starCount = 200;

for (let i = 0; i < starCount; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    
    const size = Math.random() * 2 + 1;
    star.style.width = size + 'px';
    star.style.height = size + 'px';
    
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    star.style.left = x + '%';
    star.style.top = y + '%';
    
    star.style.opacity = Math.random() * 0.5 + 0.3;
    
    const speed = Math.random() * 0.4 + 0.1;
    star.dataset.speed = speed;
    
    starfield.appendChild(star);
    stars.push({ element: star, speed: speed, initialY: y });
}

window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    
    stars.forEach(star => {
        const translateY = scrollY * star.speed;
        star.element.style.transform = `translateY(${translateY}px)`;
    });
});
