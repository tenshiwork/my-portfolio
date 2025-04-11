// Function to handle smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Simple image lazy loading
const images = document.querySelectorAll('img[data-src]');
const config = {
    rootMargin: '50px 0px',
    threshold: 0.01
};

let observer = new IntersectionObserver((entries, self) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            let img = entry.target;
            let src = img.getAttribute('data-src');
            if (src) {
                img.src = src;
                img.removeAttribute('data-src');
            }
            self.unobserve(img);
        }
    });
}, config);

images.forEach(image => {
    observer.observe(image);
});

document.addEventListener('DOMContentLoaded', function() {
    // Find all project cards
    const cards = document.querySelectorAll('.project-card');
    
    // Find the tallest card
    let maxHeight = 0;
    cards.forEach(card => {
        const height = card.offsetHeight;
        maxHeight = Math.max(maxHeight, height);
    });
    
    // Set all cards to the height of the tallest card
    cards.forEach(card => {
        card.style.height = maxHeight + 'px';
    });
});
