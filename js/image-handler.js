// Image loading handler
function handleImageError(img) {
    img.onerror = () => {
        img.src = '/assets/images/placeholder.jpg';
        img.alt = 'Image not available';
    };
}

// Add image loading handlers to all project images
document.addEventListener('DOMContentLoaded', () => {
    const projectImages = document.querySelectorAll('.project-image img');
    projectImages.forEach(img => {
        handleImageError(img);
    });
}); 