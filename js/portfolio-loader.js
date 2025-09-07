/**
 * Portfolio Loader
 * This script dynamically loads portfolio images and creates a slider
 * Optimized for performance and slower internet connections
 */

// Use modern event loading to ensure DOM is ready before script execution
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPortfolio);
} else {
    // DOM already loaded, initialize immediately
    initPortfolio();
}

// Initialization wrapper to delay non-critical components
function initPortfolio() {
    // Use requestIdleCallback for non-critical UI initialization
    if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
            initPortfolioSlider();
        }, { timeout: 2000 });
    } else {
        // Fallback for browsers without requestIdleCallback
        setTimeout(initPortfolioSlider, 200);
    }
}

// Improved portfolio slider with performance optimizations
function initPortfolioSlider() {
    const workSlider = document.getElementById('workSlider');
    const sliderDots = document.getElementById('sliderDots');
    const prevBtn = document.querySelector('.slider-nav.prev');
    const nextBtn = document.querySelector('.slider-nav.next');
    
    // Exit if elements don't exist
    if (!workSlider || !sliderDots) return;
    
    // Configuration
    let currentSlide = 0;
    let portfolioImages = [];
    let autoplayInterval;
    const autoplayDelay = 5000; // 5 seconds between slides
    
    // Function to load portfolio images from the server
    async function loadPortfolioImages() {
        try {
            // Try to fetch images from the PHP script
            const response = await fetch('get-portfolio-images.php');
            
            // If the fetch was successful, parse the response
            if (response.ok) {
                const data = await response.json();
                return data.images || [];
            } else {
                throw new Error('Failed to load images');
            }
        } catch (error) {
            console.warn('Error loading portfolio images from server:', error);
            
            // Fallback: Try to load images directly from the folder
            // This might work in some environments, but generally requires server-side script
            console.log('Attempting to use fallback method to load portfolio images...');
            
            // Try to scan the directory using a manual approach
            return loadPortfolioImagesManually();
        }
    }
    
    // Fallback function to manually check for images
    function loadPortfolioImagesManually() {
        const baseFolder = 'images/portfolio/';
        const images = [];
        
        // Try to find images in the portfolio folder (works only with known filenames)
        // Check if file exists by trying to load it (not very efficient but works as fallback)
        const checkImageExists = async (path) => {
            return new Promise(resolve => {
                const img = new Image();
                img.onload = () => resolve(true);
                img.onerror = () => resolve(false);
                img.src = path;
            });
        };
        
        // Create a list of potential image names to check
        const potentialImages = [];
        
        // Check for numerical sequences (work1.jpg, work2.jpg, etc.)
        for (let i = 1; i <= 20; i++) { // Check up to 20 potential images
            potentialImages.push({
                src: `${baseFolder}work${i}.jpeg`,
                alt: `Portfolio Work ${i}`
            });
            potentialImages.push({
                src: `${baseFolder}work${i}.jpg`,
                alt: `Portfolio Work ${i}`
            });
        }
        
        // Check which images actually exist and add them to the result
        return Promise.all(
            potentialImages.map(async (image) => {
                const exists = await checkImageExists(image.src);
                if (exists) {
                    return image;
                }
                return null;
            })
        ).then(results => {
            // Filter out null values and return existing images
            return results.filter(image => image !== null);
        });
    }
    
    // Function to render the slides
    function renderSlides(images) {
        if (!images || images.length === 0) {
            // If no images, add a placeholder
            const placeholderSlide = document.createElement('div');
            placeholderSlide.className = 'slider-slide';
            placeholderSlide.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 100%; background-color: #222;">
                    <p>No portfolio images available</p>
                </div>
            `;
            workSlider.appendChild(placeholderSlide);
            return;
        }
        
        // Clear any existing content
        workSlider.innerHTML = '';
        sliderDots.innerHTML = '';
        
        // Add each image as a slide
        images.forEach((image, index) => {
            // Create slide
            const slide = document.createElement('div');
            slide.className = 'slider-slide';
            
            // Create image element
            const imgElement = document.createElement('img');
            imgElement.src = image.src;
            imgElement.alt = image.alt;
            imgElement.loading = 'lazy'; // Use lazy loading for better performance
            
            // Handle image loading error
            imgElement.onerror = function() {
                this.onerror = null; // Prevent infinite loops
                this.src = 'images/placeholder.jpg';
                this.alt = 'Image not available';
                
                // If even placeholder fails, use a colored div
                this.onerror = function() {
                    const parent = this.parentNode;
                    this.remove();
                    parent.innerHTML = `
                        <div style="display: flex; align-items: center; justify-content: center; height: 100%; background-color: #333; color: #ddd;">
                            <p>Image not available</p>
                        </div>
                    `;
                };
            };
            
            slide.appendChild(imgElement);
            workSlider.appendChild(slide);
            
            // Create dot
            const dot = document.createElement('div');
            dot.className = 'slider-dot';
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(index));
            sliderDots.appendChild(dot);
        });
        
        // Set initial position
        updateSliderPosition();
    }
    
    // Function to update the slider position
    function updateSliderPosition() {
        const slides = document.querySelectorAll('.slider-slide');
        if (!slides || slides.length === 0) return;
        
        const slideWidth = slides[0].offsetWidth;
        workSlider.style.transform = `translateX(-${currentSlide * slideWidth}px)`;
        
        // Update dots
        const dots = document.querySelectorAll('.slider-dot');
        dots.forEach((dot, index) => {
            if (index === currentSlide) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }
    
    // Function to go to a specific slide
    function goToSlide(index) {
        const totalSlides = portfolioImages.length;
        if (index < 0) {
            currentSlide = totalSlides - 1;
        } else if (index >= totalSlides) {
            currentSlide = 0;
        } else {
            currentSlide = index;
        }
        updateSliderPosition();
        resetAutoplay();
    }
    
    // Function to go to the next slide
    function nextSlide() {
        goToSlide(currentSlide + 1);
    }
    
    // Function to go to the previous slide
    function prevSlide() {
        goToSlide(currentSlide - 1);
    }
    
    // Function to start autoplay
    function startAutoplay() {
        autoplayInterval = setInterval(nextSlide, autoplayDelay);
    }
    
    // Function to reset autoplay
    function resetAutoplay() {
        clearInterval(autoplayInterval);
        startAutoplay();
    }
    
    // Add event listeners for navigation
    if(prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            prevSlide();
        });
        
        nextBtn.addEventListener('click', () => {
            nextSlide();
        });
    }
    
    // Handle touch events for mobile swipe
    let touchStartX = 0;
    let touchEndX = 0;
    let touchStartY = 0;
    let touchEndY = 0;
    let isSwiping = false;
    
    workSlider.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
        isSwiping = true;
        
        // Pause autoplay during swiping
        clearInterval(autoplayInterval);
    }, { passive: true });
    
    workSlider.addEventListener('touchmove', e => {
        if (!isSwiping) return;
        
        const currentX = e.changedTouches[0].screenX;
        const diff = touchStartX - currentX;
        
        // Prevent default only for horizontal swipes to allow vertical scrolling
        if (Math.abs(diff) > 10) {
            e.preventDefault();
        }
    }, { passive: false });
    
    workSlider.addEventListener('touchend', e => {
        if (!isSwiping) return;
        
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
        isSwiping = false;
        
        // Resume autoplay after swiping
        startAutoplay();
    }, { passive: true });
    
    function handleSwipe() {
        const threshold = 50;  // Minimum swipe distance
        const verticalThreshold = 100; // Max vertical movement to consider it a horizontal swipe
        
        // Calculate horizontal and vertical distances
        const horizontalDistance = Math.abs(touchEndX - touchStartX);
        const verticalDistance = Math.abs(touchEndY - touchStartY);
        
        // Only process as a swipe if horizontal movement is greater than vertical
        // This prevents accidental swipes when scrolling vertically
        if (horizontalDistance > threshold && horizontalDistance > verticalDistance) {
            if (touchEndX < touchStartX) {
                nextSlide(); // Swipe left, go to next slide
            } else {
                prevSlide(); // Swipe right, go to previous slide
            }
        }
    }
    
    // Window resize event to handle responsive behavior
    window.addEventListener('resize', () => {
        updateSliderPosition();
    });
    
    // Initialize the slider
    loadPortfolioImages().then(images => {
        portfolioImages = images;
        console.log('Portfolio images loaded:', images.length);
        renderSlides(images);
        if (images.length > 1) {
            startAutoplay();
        }
    });
}