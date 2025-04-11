document.addEventListener('DOMContentLoaded', () => {
    const images = [
        'project2.jpg',
        'project3.jpg',
        'project4.jpg',
        'project6.jpg',
        'project7.jpg',
        'project8.jpg',
        'project10.jpg',
        'project11.jpg'
    ];

    function getRandomImage() {
        return images[Math.floor(Math.random() * images.length)];
    }

    async function tryLoadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(src);
            img.onerror = () => reject();
            img.src = `../../images/${src.toLowerCase()}`;
        });
    }

    async function updateImages() {
        const randomImages = document.querySelectorAll('.random-image');
        
        for (const imgElement of randomImages) {
            let imageLoaded = false;
            let attempts = 0;

            while (!imageLoaded && attempts < 3) {
                const newImage = getRandomImage();
                try {
                    await tryLoadImage(newImage);
                    imgElement.src = `../../images/${newImage.toLowerCase()}`;
                    imageLoaded = true;
                } catch {
                    attempts++;
                    await new Promise(r => setTimeout(r, 500)); // Wait 500ms before retry
                }
            }

            if (!imageLoaded) {
                // If all attempts failed, use a known working image
                imgElement.src = '../../images/project2.jpg';
                await new Promise(r => setTimeout(r, 4000)); // Extra 4s delay if fallback was used
            }
        }
    }

    function startAnimation() {
        let isAnimating = true;

        async function cycle() {
            while (isAnimating) {
                await updateImages();
                await new Promise(r => setTimeout(r, 200));
                
                // Fast animation phase
                for (let i = 0; i < 4; i++) {
                    await updateImages();
                    await new Promise(r => setTimeout(r, 200));
                }
                
                // Pause phase
                await new Promise(r => setTimeout(r, 4000));
            }
        }

        cycle().catch(console.error);
    }

    startAnimation();

    // Add image modal functionality
    const modal = document.getElementById('imageModal');
    const galleryItems = document.querySelectorAll('.gallery-item img');

    galleryItems.forEach(img => {
        img.addEventListener('click', () => {
            modal.innerHTML = `<img src="${img.src}">`;
            modal.style.display = 'block';
        });
    });

    modal.addEventListener('click', () => {
        modal.style.display = 'none';
    });
});
