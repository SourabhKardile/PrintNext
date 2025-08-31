// DOM Elements
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const navLinksItems = document.querySelectorAll('.nav-links a');
const header = document.querySelector('header');

// Toggle mobile menu
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
    document.body.classList.toggle('menu-open'); // Prevent background scrolling when menu is open
});

// Close mobile menu when a link is clicked
navLinksItems.forEach(item => {
    item.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.classList.remove('menu-open');
    });
});

// Close menu when clicking outside of it
document.addEventListener('click', (e) => {
    if (navLinks.classList.contains('active') && 
        !navLinks.contains(e.target) && 
        !hamburger.contains(e.target)) {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.classList.remove('menu-open');
    }
});

// Change header background on scroll
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.style.background = 'rgba(0, 0, 0, 0.9)';
        header.style.padding = '15px 0';
    } else {
        header.style.background = 'transparent';
        header.style.padding = '20px 0';
    }
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Initialize AOS (Animate On Scroll) if available
document.addEventListener('DOMContentLoaded', () => {
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true
        });
    }
    
    // Initialize the portfolio slider
    initWorkSlider();
    
    // Initialize the contact form
    setupContactForm();
});

// Add active class to navigation items based on scroll position
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.nav-links a');
    
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (window.scrollY >= sectionTop - 100) {
            current = section.getAttribute('id');
        }
    });
    
    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('href') === `#${current}`) {
            item.classList.add('active');
        }
    });
});

// Work Slider Functions
// Contact Form Handler
function setupContactForm() {
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');
    
    if (!contactForm || !formStatus) return;
    
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Reset status
        formStatus.className = 'form-status';
        formStatus.textContent = 'Sending message...';
        
        // Collect form data
        const formData = new FormData(contactForm);
        
        try {
            // Formspree API setup - using formspree's endpoint
            // Note: Using Formspree as it doesn't require server-side code
            const response = await fetch('https://formspree.io/f/mzzagdzb', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            const json = await response.json();
            
            if (response.ok) {
                // Success
                formStatus.className = 'form-status success';
                formStatus.textContent = 'Thank you for your message! We will contact you soon.';
                contactForm.reset();
            } else {
                // Error
                throw new Error(json.error || 'Something went wrong. Please try again.');
            }
        } catch (error) {
            formStatus.className = 'form-status error';
            formStatus.textContent = error.message;
            console.error('Form submission error:', error);
        }
    });
    
    // Basic form validation
    const inputs = contactForm.querySelectorAll('input, textarea');
    
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.hasAttribute('required') && !this.value.trim()) {
                this.style.borderColor = '#dc3545';
            } else if (this.id === 'email' && this.value.trim()) {
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailPattern.test(this.value)) {
                    this.style.borderColor = '#dc3545';
                } else {
                    this.style.borderColor = '';
                }
            } else {
                this.style.borderColor = '';
            }
        });
    });
}

function initWorkSlider() {
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
            // In a real scenario, you would make an AJAX request to get the list of images
            // For demo purposes, we'll simulate the server response with some sample images
            
            // IMPORTANT: This is a placeholder. In a real implementation, you would need
            // a server-side script to read the directory and return the list of images.
            
            // Sample code for when you have server support:
            // const response = await fetch('/api/portfolio-images');
            // const data = await response.json();
            // return data.images;
            
            // For now, we'll check for common image formats (both .jpg and .jpeg)
            const baseNames = ['work1', 'work2', 'work3', 'work4', 'work5'];
            const formats = ['.jpg', '.jpeg'];
            const portfolioImages = [];
            
            // Attempt to load each image with each format
            baseNames.forEach((baseName, index) => {
                // Try both formats for each image name, starting with .jpg (most common)
                const imagePath = `images/portfolio/${baseName}`;
                
                // We'll add the first format by default and let the browser handle fallback
                // In a real server environment, you would check if the file exists first
                portfolioImages.push({
                    src: `${imagePath}${formats[0]}`,
                    alt: `Portfolio Work ${index + 1}`,
                    // Add a data attribute with alternative format for fallback
                    dataSrcFallback: `${imagePath}${formats[1]}`
                });
            });
            
            return portfolioImages;
        } catch (error) {
            console.error('Error loading portfolio images:', error);
            return [];
        }
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
            
            // Create image element with fallback support
            const imgElement = document.createElement('img');
            imgElement.src = image.src;
            imgElement.alt = image.alt;
            
            // Handle image loading error - try fallback format if available
            if (image.dataSrcFallback) {
                imgElement.onerror = function() {
                    this.onerror = null; // Prevent infinite loops
                    this.src = image.dataSrcFallback;
                    
                    // If fallback also fails, show a placeholder
                    this.onerror = function() {
                        this.onerror = null;
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
                };
            }
            
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
        const slideWidth = document.querySelector('.slider-slide').offsetWidth;
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
        renderSlides(images);
        if (images.length > 1) {
            startAutoplay();
        }
        
        // Auto-detect all image files in the folder (only works on a real server)
        // This code demonstrates how you would implement dynamic image loading
        /*
        // This code would be used on a real server environment with file system access
        async function detectPortfolioImages() {
            try {
                // Get a list of all files in the portfolio directory
                const folderPath = 'images/portfolio/';
                const fileExtensions = ['.jpg', '.jpeg'];
                
                // Simulating server code - in reality this would be handled by backend
                // For example with Node.js: fs.readdirSync(folderPath)
                
                // Scan for all files with supported extensions
                const files = []; // This would be populated by the server
                
                return files.filter(file => {
                    const extension = file.substring(file.lastIndexOf('.')).toLowerCase();
                    return fileExtensions.includes(extension);
                }).map(file => {
                    return {
                        src: folderPath + file,
                        alt: 'Portfolio work - ' + file.replace(/\.[^/.]+$/, "")
                    };
                });
            } catch (error) {
                console.error('Error detecting portfolio images:', error);
                return [];
            }
        }
        */
    });
}

// Update copyright year automatically
document.addEventListener('DOMContentLoaded', function() {
    const copyrightYearElement = document.getElementById('copyright-year');
    if (copyrightYearElement) {
        const currentYear = new Date().getFullYear();
        copyrightYearElement.textContent = currentYear;
    }
});
