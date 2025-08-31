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

// Work Slider functions have been moved to portfolio-loader.js

// Update copyright year automatically
document.addEventListener('DOMContentLoaded', function() {
    const copyrightYearElement = document.getElementById('copyright-year');
    if (copyrightYearElement) {
        const currentYear = new Date().getFullYear();
        copyrightYearElement.textContent = currentYear;
    }
    
    // Initialize statistics counters
    initStatCounters();
});

// Statistics counter animation
function initStatCounters() {
    const statSection = document.getElementById('statistics');
    const statNumbers = document.querySelectorAll('.stat-number');
    
    if (!statSection || statNumbers.length === 0) return;
    
    const animateCounters = () => {
        statNumbers.forEach(counter => {
            const targetValue = parseInt(counter.getAttribute('data-count'));
            const displayText = counter.textContent;
            const suffix = displayText.includes('+') ? '+' : '';
            let count = 0;
            const duration = 2000; // 2 seconds
            const interval = Math.floor(duration / targetValue);
            
            const timer = setInterval(() => {
                count += 1;
                counter.textContent = count + suffix;
                
                if (count >= targetValue) {
                    counter.textContent = targetValue + suffix;
                    clearInterval(timer);
                }
            }, Math.max(interval, 15)); // Ensure minimum interval is 15ms for smooth animation
        });
    };
    
    // Use Intersection Observer to trigger counter animation when stats section is visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters();
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, { threshold: 0.2 });
    
    observer.observe(statSection);
}
